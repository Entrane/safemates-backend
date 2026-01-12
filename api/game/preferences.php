<?php
/**
 * API de sauvegarde des préférences de partenaire
 * POST /api/game/preferences.php
 */

require_once __DIR__ . '/../config.php';

// Vérifier que c'est bien une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['error' => 'Méthode non autorisée'], 405);
}

// Vérifier l'authentification (session OU token JWT)
$user = requireAuth();

// Récupérer les données JSON
$data = getJsonInput();

// Récupérer le jeu depuis le paramètre ou depuis l'URL
$game = isset($data['game']) ? sanitize($data['game']) : '';
if (empty($game) && isset($_GET['game'])) {
    $game = sanitize($_GET['game']);
}

// Récupérer les rangs préférés
$prefRanks = isset($data['prefRanks']) ? $data['prefRanks'] : [];
$rankTolerance = isset($data['rankTolerance']) ? (int)$data['rankTolerance'] : null;

try {
    $db = getDB();

    // Mettre à jour le profil existant avec les préférences
    if (!empty($game)) {
        $prefRanksJson = json_encode($prefRanks);

        $stmt = $db->prepare('
            UPDATE game_profiles
            SET preferred_ranks = ?, tolerance = ?, updated_at = ?
            WHERE user_id = ? AND game = ?
        ');
        $stmt->execute([
            $prefRanksJson,
            $rankTolerance,
            date('Y-m-d H:i:s'),
            $user['userId'],
            $game
        ]);

        sendJSON([
            'success' => true,
            'message' => 'Préférences de partenaire sauvegardées'
        ], 200);
    } else {
        sendJSON(['error' => 'Le jeu est requis'], 400);
    }

} catch (PDOException $e) {
    error_log("Erreur sauvegarde préférences: " . $e->getMessage());
    sendJSON(['error' => 'Erreur lors de la sauvegarde des préférences'], 500);
}
?>
