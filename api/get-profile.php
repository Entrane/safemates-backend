<?php
/**
 * API de récupération de profil de jeu
 * GET /api/get-profile.php?game=valorant
 */

require_once 'config.php';

// Vérifier l'authentification
$user = requireAuth();

// Récupérer le paramètre game
$game = isset($_GET['game']) ? sanitize($_GET['game']) : '';

if (empty($game)) {
    sendJSON(['error' => 'Le paramètre game est requis'], 400);
}

try {
    $db = getDB();

    // Récupérer le profil de l'utilisateur pour ce jeu
    $stmt = $db->prepare('
        SELECT id, game, rank, mode, tolerance, availability, updated_at
        FROM game_profiles
        WHERE user_id = ? AND game = ?
    ');
    $stmt->execute([$user['userId'], $game]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($profile) {
        // Décoder availability si c'est du JSON
        if ($profile['availability']) {
            $profile['availability'] = json_decode($profile['availability'], true);
        }

        sendJSON([
            'success' => true,
            'profile' => $profile
        ], 200);
    } else {
        // Aucun profil trouvé
        sendJSON([
            'success' => true,
            'profile' => null
        ], 200);
    }

} catch (PDOException $e) {
    error_log("Erreur récupération profil: " . $e->getMessage());
    sendJSON(['error' => 'Erreur lors de la récupération du profil'], 500);
}
?>
