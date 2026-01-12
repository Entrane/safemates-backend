<?php
/**
 * API de connexion
 * POST /api/login.php
 */

require_once 'config.php';

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

    // Récupérer l'utilisateur
    $stmt = $db->prepare('
        SELECT id, username, email, password, is_banned, is_admin
        FROM users
        WHERE username = ? OR email = ?
    ');
    $stmt->execute([$identifier, $identifier]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        sendJSON(['error' => 'Identifiants incorrects'], 401);
    }

    // Vérifier si l'utilisateur est banni
    if ($user['is_banned'] == 1) {
        sendJSON(['error' => 'Votre compte a été banni'], 403);
    }

    // Vérifier le mot de passe
    if (!verifyPassword($password, $user['password'])) {
        sendJSON(['error' => 'Identifiants incorrects'], 401);
    }

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
