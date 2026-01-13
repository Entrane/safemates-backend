<?php
/**
 * Endpoint /api/user/profile
 * Retourne le profil de l'utilisateur connecté
 */

require_once __DIR__ . '/../config.php';

// Vérifier l'authentification (session OU token JWT)
$authUser = requireAuth();
$userId = $authUser['userId'];

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
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        sendJSON(['error' => 'Utilisateur non trouvé'], 404);
    }

    // Décoder les champs JSON
    if ($user['preferred_games']) {
        $user['preferred_games'] = json_decode($user['preferred_games'], true);
    }

    // Si un gameId est fourni, récupérer les paramètres de jeu
    $gameId = $_GET['gameId'] ?? null;

    // Initialiser les données de jeu avec des valeurs par défaut
    $user['gameSettings'] = [
        'rank' => null,
        'mainMode' => null,
        'options' => [],
        'style' => null
    ];

    $user['partnerPreferences'] = [
        'prefRanks' => [],
        'rankTolerance' => 1
    ];

    if ($gameId) {
        // Récupérer les paramètres de jeu depuis game_profiles
        $stmtGame = $db->prepare("
            SELECT rank, mode, tolerance, availability, rank_level, preferred_ranks
            FROM game_profiles
            WHERE user_id = ? AND game = ?
        ");
        $stmtGame->execute([$userId, $gameId]);
        $gameProfile = $stmtGame->fetch(PDO::FETCH_ASSOC);

        if ($gameProfile) {
            $user['gameSettings'] = [
                'rank' => $gameProfile['rank'],
                'mainMode' => $gameProfile['mode'],
                'options' => [],
                'style' => null
            ];

            $user['partnerPreferences'] = [
                'prefRanks' => $gameProfile['preferred_ranks'] ? json_decode($gameProfile['preferred_ranks'], true) : [],
                'rankTolerance' => $gameProfile['tolerance'] ?? 1
            ];
        }
    }

    sendJSON($user);

} catch (Exception $e) {
    error_log("Erreur /api/user/profile: " . $e->getMessage());
    sendJSON(['error' => 'Erreur serveur'], 500);
}
?>
