<?php
/**
 * API de sauvegarde des paramètres de jeu
 * POST /api/game/settings.php
 */

require_once '../config.php';

// Vérifier que c'est bien une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['error' => 'Méthode non autorisée'], 405);
}

// Vérifier l'authentification
$user = requireAuth();

// Récupérer les données JSON
$data = getJsonInput();

// Validation des données
$game = isset($data['game']) ? sanitize($data['game']) : '';
$rank = isset($data['rank']) ? sanitize($data['rank']) : null;
$mainMode = isset($data['mainMode']) ? sanitize($data['mainMode']) : null;
$rankTolerance = isset($data['rankTolerance']) ? (int)$data['rankTolerance'] : 1;
$style = isset($data['style']) ? sanitize($data['style']) : null;
$options = isset($data['options']) ? json_encode($data['options']) : null;

// Vérifications
if (empty($game)) {
    sendJSON(['error' => 'Le jeu est requis'], 400);
}

try {
    $db = getDB();

    // Vérifier si un profil existe déjà pour ce jeu
    $stmt = $db->prepare('
        SELECT id FROM game_profiles
        WHERE user_id = ? AND game = ?
    ');
    $stmt->execute([$user['userId'], $game]);
    $existingProfile = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingProfile) {
        // Mettre à jour le profil existant
        $stmt = $db->prepare('
            UPDATE game_profiles
            SET rank = ?, mode = ?, tolerance = ?, style = ?, options = ?, updated_at = ?
            WHERE user_id = ? AND game = ?
        ');
        $stmt->execute([
            $rank,
            $mainMode,
            $rankTolerance,
            $style,
            $options,
            date('Y-m-d H:i:s'),
            $user['userId'],
            $game
        ]);

        sendJSON([
            'success' => true,
            'message' => 'Paramètres mis à jour avec succès'
        ], 200);
    } else {
        // Créer un nouveau profil
        $stmt = $db->prepare('
            INSERT INTO game_profiles (user_id, game, rank, mode, tolerance, style, options, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $user['userId'],
            $game,
            $rank,
            $mainMode,
            $rankTolerance,
            $style,
            $options,
            date('Y-m-d H:i:s')
        ]);

        sendJSON([
            'success' => true,
            'message' => 'Paramètres créés avec succès',
            'profileId' => $db->lastInsertId()
        ], 201);
    }

} catch (PDOException $e) {
    error_log("Erreur sauvegarde paramètres: " . $e->getMessage());
    sendJSON(['error' => 'Erreur lors de la sauvegarde des paramètres'], 500);
}
?>
