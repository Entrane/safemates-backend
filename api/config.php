<?php
/**
 * Configuration de la base de données et paramètres de l'application
 * MatchMates - Version PHP pour Hostinger
 */

// Configuration de la base de données
// Hostinger utilise MySQL par défaut
define('DB_HOST', 'localhost');
define('DB_NAME', 'u639530603_SafeMates');
define('DB_USER', 'u639530603_Entrane');
define('DB_PASS', 'En70frevaern@');

// Pour SQLite (alternative si MySQL n'est pas disponible)
define('USE_SQLITE', false); // Mettre à true pour utiliser SQLite au lieu de MySQL
define('SQLITE_DB_PATH', __DIR__ . '/../database.sqlite');

// Configuration de sécurité
define('JWT_SECRET', 'VotreSecretJWTTresSecurise123!@#'); // CHANGEZ CECI EN PRODUCTION
define('SESSION_SECRET', 'VotreSecretSessionTresSecurise456$%^'); // CHANGEZ CECI EN PRODUCTION
define('BCRYPT_COST', 12);

// Configuration de session
ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);
ini_set('session.cookie_samesite', 'Strict');
if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
    ini_set('session.cookie_secure', 1);
}

// Note: Les headers HTTP sont gérés par .htaccess et par chaque endpoint
// Ne pas envoyer de headers ici pour éviter les conflits

// Fonction de connexion à la base de données
function getDB() {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    try {
        if (USE_SQLITE) {
            // Connexion SQLite
            $pdo = new PDO('sqlite:' . SQLITE_DB_PATH);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } else {
            // Connexion MySQL
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        }

        return $pdo;
    } catch (PDOException $e) {
        error_log("Erreur de connexion à la base de données: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Erreur de connexion à la base de données']);
        exit;
    }
}

// Fonction pour envoyer une réponse JSON
function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Fonction pour générer un token JWT simple
function generateToken($userId, $username) {
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode([
        'userId' => $userId,
        'username' => $username,
        'exp' => time() + (7 * 24 * 60 * 60) // Expire dans 7 jours
    ]));

    $signature = hash_hmac('sha256', "$header.$payload", JWT_SECRET);

    return "$header.$payload.$signature";
}

// Fonction pour vérifier un token JWT
function verifyToken($token) {
    if (empty($token)) {
        return false;
    }

    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }

    list($header, $payload, $signature) = $parts;

    // Vérifier la signature
    $expectedSignature = hash_hmac('sha256', "$header.$payload", JWT_SECRET);
    if ($signature !== $expectedSignature) {
        return false;
    }

    // Décoder le payload
    $payloadData = json_decode(base64_decode($payload), true);

    // Vérifier l'expiration
    if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
        return false;
    }

    return $payloadData;
}

// Fonction pour obtenir le token depuis les headers
function getAuthToken() {
    // Compatibilité: getallheaders() n'existe pas toujours
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    } else {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
    }

    // Vérifier Authorization header
    if (isset($headers['Authorization'])) {
        $matches = [];
        if (preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }

    // Alternative: HTTP_AUTHORIZATION
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $matches = [];
        if (preg_match('/Bearer\s+(.*)$/i', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
            return $matches[1];
        }
    }

    return null;
}

// Fonction pour vérifier l'authentification (session OU token JWT)
function requireAuth() {
    // Démarrer la session seulement si elle n'est pas déjà démarrée
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Priorité 1: Session PHP
    if (isset($_SESSION['user_id'])) {
        return [
            'userId' => $_SESSION['user_id'],
            'username' => $_SESSION['username'] ?? null,
            'email' => $_SESSION['email'] ?? null,
            'isAdmin' => $_SESSION['is_admin'] ?? false
        ];
    }

    // Priorité 2: Token JWT
    $token = getAuthToken();
    $user = verifyToken($token);

    if (!$user) {
        sendJSON(['error' => 'Non authentifié'], 401);
    }

    return $user;
}

// Fonction pour obtenir l'ID utilisateur depuis session ou token
function getUserId() {
    // Démarrer la session seulement si elle n'est pas déjà démarrée
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Priorité 1: Session PHP
    if (isset($_SESSION['user_id'])) {
        return $_SESSION['user_id'];
    }

    // Priorité 2: Token JWT
    $token = getAuthToken();
    $tokenData = verifyToken($token);

    if ($tokenData && isset($tokenData['userId'])) {
        return $tokenData['userId'];
    }

    return null;
}

// Fonction pour hasher un mot de passe
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
}

// Fonction pour vérifier un mot de passe
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Fonction pour valider un email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Fonction pour nettoyer les entrées utilisateur
function sanitize($input) {
    if (is_array($input)) {
        foreach ($input as $key => $value) {
            $input[$key] = sanitize($value);
        }
        return $input;
    }
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

// Fonction pour obtenir les données POST JSON
function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}
?>
