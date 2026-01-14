<?php
/**
 * Security Logger - Enregistre tous les événements de sécurité
 */

class SecurityLogger {
    private $db;
    private $tableName = 'security_logs';
    
    const LEVEL_INFO = 'INFO';
    const LEVEL_WARNING = 'WARNING';
    const LEVEL_CRITICAL = 'CRITICAL';
    
    const EVENT_LOGIN_SUCCESS = 'login_success';
    const EVENT_LOGIN_FAILED = 'login_failed';
    const EVENT_SIGNUP = 'signup';
    const EVENT_LOGOUT = 'logout';
    const EVENT_PASSWORD_CHANGE = 'password_change';
    const EVENT_RATE_LIMIT_HIT = 'rate_limit_hit';
    const EVENT_SUSPICIOUS_ACTIVITY = 'suspicious_activity';
    const EVENT_API_ERROR = 'api_error';
    const EVENT_UNAUTHORIZED_ACCESS = 'unauthorized_access';
    
    public function __construct($db) {
        $this->db = $db;
        $this->createTableIfNotExists();
    }
    
    private function createTableIfNotExists() {
        try {
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS security_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    level VARCHAR(20) NOT NULL,
                    event_type VARCHAR(50) NOT NULL,
                    user_id INT DEFAULT NULL,
                    username VARCHAR(255) DEFAULT NULL,
                    ip_address VARCHAR(45) NOT NULL,
                    user_agent TEXT DEFAULT NULL,
                    request_uri TEXT DEFAULT NULL,
                    message TEXT DEFAULT NULL,
                    metadata JSON DEFAULT NULL,
                    INDEX idx_timestamp (timestamp),
                    INDEX idx_level (level),
                    INDEX idx_event_type (event_type),
                    INDEX idx_user_id (user_id),
                    INDEX idx_ip_address (ip_address)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ");
        } catch (PDOException $e) {
            error_log("Erreur création table security_logs: " . $e->getMessage());
        }
    }
    
    /**
     * Enregistrer un événement de sécurité
     */
    public function log($level, $eventType, $message, $userId = null, $username = null, $metadata = []) {
        try {
            $ipAddress = $this->getClientIP();
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
            $requestUri = $_SERVER['REQUEST_URI'] ?? '';
            
            $stmt = $this->db->prepare("
                INSERT INTO {$this->tableName} 
                (level, event_type, user_id, username, ip_address, user_agent, request_uri, message, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $metadataJson = !empty($metadata) ? json_encode($metadata) : null;
            
            $stmt->execute([
                $level,
                $eventType,
                $userId,
                $username,
                $ipAddress,
                $userAgent,
                $requestUri,
                $message,
                $metadataJson
            ]);
            
            // Log aussi dans le fichier PHP error_log pour les événements critiques
            if ($level === self::LEVEL_CRITICAL || $level === self::LEVEL_WARNING) {
                error_log("SECURITY [{$level}] {$eventType}: {$message} | IP: {$ipAddress} | User: " . ($username ?? 'Anonymous'));
            }
            
            return true;
        } catch (PDOException $e) {
            error_log("Erreur lors du log de sécurité: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Raccourcis pour différents niveaux
     */
    public function info($eventType, $message, $userId = null, $username = null, $metadata = []) {
        return $this->log(self::LEVEL_INFO, $eventType, $message, $userId, $username, $metadata);
    }
    
    public function warning($eventType, $message, $userId = null, $username = null, $metadata = []) {
        return $this->log(self::LEVEL_WARNING, $eventType, $message, $userId, $username, $metadata);
    }
    
    public function critical($eventType, $message, $userId = null, $username = null, $metadata = []) {
        return $this->log(self::LEVEL_CRITICAL, $eventType, $message, $userId, $username, $metadata);
    }
    
    /**
     * Récupérer la vraie IP du client
     */
    private function getClientIP() {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        
        if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            return $_SERVER['HTTP_CF_CONNECTING_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            return trim($ips[0]);
        } elseif (!empty($_SERVER['HTTP_X_REAL_IP'])) {
            return $_SERVER['HTTP_X_REAL_IP'];
        }
        
        return $ip;
    }
    
    /**
     * Nettoyer les logs anciens (garder 90 jours)
     */
    public function cleanup($daysToKeep = 90) {
        try {
            $cutoffDate = (new DateTime())->modify("-{$daysToKeep} days")->format('Y-m-d H:i:s');
            
            $stmt = $this->db->prepare("
                DELETE FROM {$this->tableName}
                WHERE timestamp < ? AND level != ?
            ");
            $stmt->execute([$cutoffDate, self::LEVEL_CRITICAL]);
            
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Erreur nettoyage security_logs: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Obtenir les logs récents par IP (pour détecter patterns suspects)
     */
    public function getRecentByIP($ipAddress, $hours = 24, $limit = 100) {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM {$this->tableName}
                WHERE ip_address = ? 
                AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
                ORDER BY timestamp DESC
                LIMIT ?
            ");
            $stmt->execute([$ipAddress, $hours, $limit]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur récupération logs: " . $e->getMessage());
            return [];
        }
    }
}
?>
