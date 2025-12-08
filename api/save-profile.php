<?php
/**
 * API de sauvegarde de profil de jeu
 * POST /api/save-profile.php
 */

require_once 'config.php';

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
$mode = isset($data['mode']) ? sanitize($data['mode']) : null;
$tolerance = isset($data['tolerance']) ? (int)$data['tolerance'] : 1;
$availability = isset($data['availability']) ? json_encode($data['availability']) : null;

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
            SET rank = ?, mode = ?, tolerance = ?, availability = ?, updated_at = ?
            WHERE user_id = ? AND game = ?
        ');
        $stmt->execute([
            $rank,
            $mode,
            $tolerance,
            $availability,
            date('Y-m-d H:i:s'),
            $user['userId'],
            $game
        ]);

        sendJSON([
            'success' => true,
            'message' => 'Profil mis à jour avec succès'
        ], 200);
    } else {
        // Créer un nouveau profil
        $stmt = $db->prepare('
            INSERT INTO game_profiles (user_id, game, rank, mode, tolerance, availability, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $user['userId'],
            $game,
            $rank,
            $mode,
            $tolerance,
            $availability,
            date('Y-m-d H:i:s')
        ]);

        sendJSON([
            'success' => true,
            'message' => 'Profil créé avec succès',
            'profileId' => $db->lastInsertId()
        ], 201);
    }

} catch (PDOException $e) {
    error_log("Erreur sauvegarde profil: " . $e->getMessage());
    sendJSON(['error' => 'Erreur lors de la sauvegarde du profil'], 500);
}
?>
