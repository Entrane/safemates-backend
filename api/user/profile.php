<?php
/**
 * Endpoint /api/user/profile
 * Retourne le profil de l'utilisateur connecté
 */

require_once __DIR__ . '/../config.php';

// Démarrer la session
session_start();

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    sendJSON(['error' => 'Non authentifié'], 401);
}

try {
    $db = getDB();

    // Récupérer le profil complet de l'utilisateur
    $stmt = $db->prepare("
        SELECT
            u.id,
            u.username,
            u.email,
            u.created_at,
            up.bio,
            up.avatar_url,
            up.discord_username,
            up.preferred_games,
            up.playstyle,
            up.availability
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = ?
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        sendJSON(['error' => 'Utilisateur non trouvé'], 404);
    }

    // Décoder les champs JSON
    if ($user['preferred_games']) {
        $user['preferred_games'] = json_decode($user['preferred_games'], true);
    }

    sendJSON($user);

} catch (Exception $e) {
    error_log("Erreur /api/user/profile: " . $e->getMessage());
    sendJSON(['error' => 'Erreur serveur'], 500);
}
?>
