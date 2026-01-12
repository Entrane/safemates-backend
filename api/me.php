<?php
/**
 * Endpoint /api/me
 * Retourne les informations de l'utilisateur connecté
 */

require_once __DIR__ . '/config.php';

// Démarrer la session
session_start();

// Vérifier authentification (session OU token JWT)
$userId = null;

// Priorité 1: Session PHP
if (isset($_SESSION['user_id'])) {
    $userId = $_SESSION['user_id'];
} else {
    // Priorité 2: Token JWT
    $token = getAuthToken();
    $tokenData = verifyToken($token);
    if ($tokenData && isset($tokenData['userId'])) {
        $userId = $tokenData['userId'];
    }
}

if (!$userId) {
    sendJSON(['loggedIn' => false], 200);
}

try {
    $db = getDB();

    // Récupérer les informations de l'utilisateur
    $stmt = $db->prepare("SELECT id, username, email, created_at FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        sendJSON(['loggedIn' => false], 401);
    }

    sendJSON([
        'loggedIn' => true,
        'user_id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'created_at' => $user['created_at']
    ]);

} catch (Exception $e) {
    error_log("Erreur /api/me: " . $e->getMessage());
    sendJSON(['error' => 'Erreur serveur'], 500);
}
?>
