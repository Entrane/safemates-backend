<?php
/**
 * API de connexion
 * POST /api/login.php
 */

require_once 'config.php';
require_once 'RateLimiter.php';
require_once 'SecurityLogger.php';

// Vérifier que c'est bien une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['error' => 'Méthode non autorisée'], 405);
}

// Récupérer les données JSON
$data = getJsonInput();

// Validation des données - accepter username OU email
$username = isset($data['username']) ? sanitize($data['username']) : '';
$email = isset($data['email']) ? sanitize($data['email']) : '';
$password = isset($data['password']) ? $data['password'] : '';

// Utiliser email si username n'est pas fourni
$identifier = !empty($username) ? $username : $email;

// Vérifications
if (empty($identifier) || empty($password)) {
    sendJSON(['error' => 'Email/nom d\'utilisateur et mot de passe requis'], 400);
}

try {
    $db = getDB();
    $rateLimiter = new RateLimiter($db);
    $securityLogger = new SecurityLogger($db);

    // RATE LIMITING - Max 5 tentatives en 5 minutes
    $clientIP = RateLimiter::getIdentifier();
    $rateLimit = $rateLimiter->checkLimit($clientIP, 'login', 5, 300, 900);

    if (!$rateLimit['allowed']) {
        $securityLogger->warning(
            SecurityLogger::EVENT_RATE_LIMIT_HIT,
            "Trop de tentatives de connexion: {$identifier}",
            null,
            $identifier,
            ['attempts' => $rateLimit]
        );
        sendJSON([
            'error' => $rateLimit['message'] ?? 'Trop de tentatives',
            'retry_after' => $rateLimit['retry_after']
        ], 429);
    }

    // Récupérer l'utilisateur
    $stmt = $db->prepare('
        SELECT id, username, email, password, is_banned, is_admin
        FROM users
        WHERE username = ? OR email = ?
    ');
    $stmt->execute([$identifier, $identifier]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        $securityLogger->warning(
            SecurityLogger::EVENT_LOGIN_FAILED,
            "Tentative de connexion avec identifiant inexistant: {$identifier}"
        );
        sendJSON(['error' => 'Identifiants incorrects'], 401);
    }

    // Vérifier si l'utilisateur est banni
    if ($user['is_banned'] == 1) {
        $securityLogger->warning(
            SecurityLogger::EVENT_UNAUTHORIZED_ACCESS,
            "Tentative de connexion d'un compte banni",
            $user['id'],
            $user['username']
        );
        sendJSON(['error' => 'Votre compte a été banni'], 403);
    }

    // Vérifier le mot de passe
    if (!verifyPassword($password, $user['password'])) {
        $securityLogger->warning(
            SecurityLogger::EVENT_LOGIN_FAILED,
            "Mot de passe incorrect pour: {$user['username']}",
            $user['id'],
            $user['username']
        );
        sendJSON(['error' => 'Identifiants incorrects'], 401);
    }

    // LOGIN RÉUSSI - Réinitialiser le rate limiter
    $rateLimiter->reset($clientIP, 'login');

    // Démarrer la session PHP
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['is_admin'] = $user['is_admin'] == 1;

    // Créer ou mettre à jour l'entrée dans user_sessions
    $stmt = $db->prepare('
        INSERT INTO user_sessions (user_id, last_activity)
        VALUES (?, NOW())
        ON DUPLICATE KEY UPDATE last_activity = NOW()
    ');
    $stmt->execute([$user['id']]);

    // Générer un token JWT
    $token = generateToken($user['id'], $user['username']);

    // Logger le succès
    $securityLogger->info(
        SecurityLogger::EVENT_LOGIN_SUCCESS,
        "Connexion réussie",
        $user['id'],
        $user['username']
    );

    // Succès
    sendJSON([
        'message' => 'Connexion réussie',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'isAdmin' => $user['is_admin'] == 1
        ]
    ], 200);

} catch (PDOException $e) {
    error_log("Erreur connexion: " . $e->getMessage());
    sendJSON(['error' => 'Erreur lors de la connexion'], 500);
}
?>
