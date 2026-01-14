<?php
/**
 * Rate Limiter - Protection contre brute force et abus API
 * Utilise la base de données pour persister les tentatives
 */

class RateLimiter {
    private $db;
    private $tableName = 'rate_limits';
    
    public function __construct($db) {
        $this->db = $db;
        $this->createTableIfNotExists();
    }
    
    /**
     * Créer la table rate_limits si elle n'existe pas
     */
    private function createTableIfNotExists() {
        try {
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS rate_limits (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    identifier VARCHAR(255) NOT NULL,
                    action VARCHAR(100) NOT NULL,
                    attempts INT DEFAULT 1,
                    first_attempt DATETIME NOT NULL,
                    last_attempt DATETIME NOT NULL,
                    blocked_until DATETIME DEFAULT NULL,
                    INDEX idx_identifier_action (identifier, action),
                    INDEX idx_blocked_until (blocked_until)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ");
        } catch (PDOException $e) {
            error_log("Erreur création table rate_limits: " . $e->getMessage());
        }
    }
    
    /**
     * Vérifier et incrémenter le rate limit
     * @param string $identifier IP ou user_id
     * @param string $action Type d'action (login, signup, api_call, etc.)
     * @param int $maxAttempts Nombre max de tentatives
     * @param int $windowSeconds Fenêtre de temps en secondes
     * @param int $blockDurationSeconds Durée du blocage en secondes
     * @return array ['allowed' => bool, 'remaining' => int, 'retry_after' => int|null]
     */
    public function checkLimit($identifier, $action, $maxAttempts = 5, $windowSeconds = 300, $blockDurationSeconds = 900) {
        $now = new DateTime();
        $windowStart = (clone $now)->modify("-{$windowSeconds} seconds");
        
        // Vérifier si l'utilisateur est actuellement bloqué
        $stmt = $this->db->prepare("
            SELECT blocked_until, attempts 
            FROM {$this->tableName}
            WHERE identifier = ? AND action = ? AND blocked_until > NOW()
            LIMIT 1
        ");
        $stmt->execute([$identifier, $action]);
        $blocked = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($blocked) {
            $blockedUntil = new DateTime($blocked['blocked_until']);
            $retryAfter = $blockedUntil->getTimestamp() - $now->getTimestamp();
            
            return [
                'allowed' => false,
                'remaining' => 0,
                'retry_after' => max(0, $retryAfter),
                'blocked' => true,
                'message' => "Trop de tentatives. Réessayez dans " . ceil($retryAfter / 60) . " minutes."
            ];
        }
        
        // Nettoyer les anciennes entrées
        $this->cleanup($windowSeconds);
        
        // Compter les tentatives dans la fenêtre de temps
        $stmt = $this->db->prepare("
            SELECT id, attempts, first_attempt
            FROM {$this->tableName}
            WHERE identifier = ? AND action = ? AND last_attempt >= ?
            LIMIT 1
        ");
        $stmt->execute([$identifier, $action, $windowStart->format('Y-m-d H:i:s')]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existing) {
            $attempts = $existing['attempts'] + 1;
            
            // Dépasse la limite ?
            if ($attempts > $maxAttempts) {
                $blockedUntil = (clone $now)->modify("+{$blockDurationSeconds} seconds");
                
                $stmt = $this->db->prepare("
                    UPDATE {$this->tableName}
                    SET attempts = ?, last_attempt = NOW(), blocked_until = ?
                    WHERE id = ?
                ");
                $stmt->execute([$attempts, $blockedUntil->format('Y-m-d H:i:s'), $existing['id']]);
                
                return [
                    'allowed' => false,
                    'remaining' => 0,
                    'retry_after' => $blockDurationSeconds,
                    'blocked' => true,
                    'message' => "Limite dépassée. Compte bloqué pour " . ceil($blockDurationSeconds / 60) . " minutes."
                ];
            }
            
            // Incrémenter
            $stmt = $this->db->prepare("
                UPDATE {$this->tableName}
                SET attempts = ?, last_attempt = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$attempts, $existing['id']]);
            
            return [
                'allowed' => true,
                'remaining' => max(0, $maxAttempts - $attempts),
                'retry_after' => null,
                'blocked' => false
            ];
        } else {
            // Première tentative
            $stmt = $this->db->prepare("
                INSERT INTO {$this->tableName} (identifier, action, attempts, first_attempt, last_attempt)
                VALUES (?, ?, 1, NOW(), NOW())
            ");
            $stmt->execute([$identifier, $action]);
            
            return [
                'allowed' => true,
                'remaining' => $maxAttempts - 1,
                'retry_after' => null,
                'blocked' => false
            ];
        }
    }
    
    /**
     * Réinitialiser le compteur pour un identifier/action (après succès par exemple)
     */
    public function reset($identifier, $action) {
        $stmt = $this->db->prepare("
            DELETE FROM {$this->tableName}
            WHERE identifier = ? AND action = ?
        ");
        $stmt->execute([$identifier, $action]);
    }
    
    /**
     * Nettoyer les anciennes entrées
     */
    private function cleanup($windowSeconds) {
        $cutoff = (new DateTime())->modify("-{$windowSeconds} seconds");
        
        $stmt = $this->db->prepare("
            DELETE FROM {$this->tableName}
            WHERE last_attempt < ? AND blocked_until IS NULL
        ");
        $stmt->execute([$cutoff->format('Y-m-d H:i:s')]);
        
        // Nettoyer aussi les blocages expirés
        $this->db->exec("
            DELETE FROM {$this->tableName}
            WHERE blocked_until < NOW()
        ");
    }
    
    /**
     * Obtenir l'identifiant (IP ou user_id)
     */
    public static function getIdentifier($userId = null) {
        if ($userId) {
            return "user_{$userId}";
        }
        
        // Récupérer la vraie IP même derrière un proxy
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        
        if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            $ip = $_SERVER['HTTP_CF_CONNECTING_IP']; // Cloudflare
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $ip = trim($ips[0]);
        } elseif (!empty($_SERVER['HTTP_X_REAL_IP'])) {
            $ip = $_SERVER['HTTP_X_REAL_IP'];
        }
        
        return "ip_{$ip}";
    }
}
?>
