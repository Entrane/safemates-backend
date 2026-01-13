<?php
/**
 * API de gestion des profils de jeu
 * POST /api/profile/:gameSlug - Créer ou mettre à jour un profil de jeu
 * GET /api/profile/:gameSlug - Récupérer le profil de jeu de l'utilisateur
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/rank-mapping.php';

// Vérifier l'authentification
$user = requireAuth();
$currentUserId = (int)$user['userId'];

// Récupérer le slug du jeu depuis l'URL
$game = '';
if (isset($_GET['game'])) {
    $game = sanitize($_GET['game']);
} else {
    // Via PATH_INFO ou REQUEST_URI
    $requestUri = $_SERVER['REQUEST_URI'];
    $pathParts = explode('/', parse_url($requestUri, PHP_URL_PATH));
    $game = sanitize(end($pathParts));
}

if (empty($game)) {
    sendJSON(['error' => 'Le jeu est requis'], 400);
}

try {
    $db = getDB();

    // GET: Récupérer le profil
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $db->prepare('
            SELECT id, user_id, game, rank, rank_level, mode, style, tolerance, options, preferred_ranks, availability, updated_at
            FROM game_profiles
            WHERE user_id = ? AND game = ?
        ');
        $stmt->execute([$currentUserId, $game]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$profile) {
            sendJSON([
                'success' => false,
                'message' => 'Aucun profil trouvé pour ce jeu'
            ], 404);
        }

        // Décoder les champs JSON
        $profile['options'] = json_decode($profile['options'] ?? '[]', true);
        $profile['preferred_ranks'] = json_decode($profile['preferred_ranks'] ?? '[]', true);

        sendJSON([
            'success' => true,
            'profile' => $profile
        ], 200);
    }

    // POST: Créer ou mettre à jour le profil
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validation des champs requis
        if (empty($data['rank'])) {
            sendJSON(['error' => 'Le rang est requis'], 400);
        }

        if (empty($data['rank_level']) && !isset($data['rank_level'])) {
            sendJSON(['error' => 'Le rank_level est requis'], 400);
        }

        if (empty($data['mode'])) {
            sendJSON(['error' => 'Le mode de jeu est requis'], 400);
        }

        // Validation du rank_level
        $rankLevel = (int)$data['rank_level'];
        if (!isValidRankLevel($rankLevel, $game)) {
            sendJSON(['error' => 'rank_level invalide pour ce jeu'], 400);
        }

        // Validation du slug de rang
        if (!isValidRankSlug($data['rank'], $game)) {
            sendJSON(['error' => 'Slug de rang invalide pour ce jeu'], 400);
        }

        // Vérifier que le rank correspond au rank_level
        $expectedLevel = getRankLevel($data['rank'], $game);
        if ($expectedLevel !== $rankLevel) {
            sendJSON(['error' => "Incohérence: '{$data['rank']}' devrait avoir un rank_level de {$expectedLevel}, pas {$rankLevel}"], 400);
        }

        // Préparer les données
        $rank = sanitize($data['rank']);
        $mode = sanitize($data['mode']);
        $style = sanitize($data['style'] ?? '');
        $tolerance = isset($data['tolerance']) ? (int)$data['tolerance'] : 1;
        $options = isset($data['options']) ? json_encode($data['options']) : '[]';
        $preferred_ranks = isset($data['preferred_ranks']) ? json_encode($data['preferred_ranks']) : '[]';
        $availability = isset($data['availability']) ? json_encode($data['availability']) : '[]';

        // Vérifier si le profil existe déjà
        $stmt = $db->prepare('SELECT id FROM game_profiles WHERE user_id = ? AND game = ?');
        $stmt->execute([$currentUserId, $game]);
        $existingProfile = $stmt->fetch();

        if ($existingProfile) {
            // UPDATE
            $stmt = $db->prepare('
                UPDATE game_profiles
                SET rank = ?, rank_level = ?, mode = ?, style = ?, tolerance = ?, options = ?, preferred_ranks = ?, availability = ?, updated_at = NOW()
                WHERE user_id = ? AND game = ?
            ');
            $stmt->execute([
                $rank, $rankLevel, $mode, $style, $tolerance, $options, $preferred_ranks, $availability,
                $currentUserId, $game
            ]);

            $profileId = $existingProfile['id'];
            $message = 'Profil mis à jour avec succès';
        } else {
            // INSERT
            $stmt = $db->prepare('
                INSERT INTO game_profiles (user_id, game, rank, rank_level, mode, style, tolerance, options, preferred_ranks, availability, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ');
            $stmt->execute([
                $currentUserId, $game, $rank, $rankLevel, $mode, $style, $tolerance, $options, $preferred_ranks, $availability
            ]);

            $profileId = $db->lastInsertId();
            $message = 'Profil créé avec succès';
        }

        // Récupérer le profil créé/modifié
        $stmt = $db->prepare('
            SELECT id, user_id, game, rank, rank_level, mode, style, tolerance, updated_at
            FROM game_profiles
            WHERE id = ?
        ');
        $stmt->execute([$profileId]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);

        sendJSON([
            'success' => true,
            'message' => $message,
            'profile' => $profile
        ], 200);
    }

    // Méthode non supportée
    sendJSON(['error' => 'Méthode non supportée'], 405);

} catch (PDOException $e) {
    error_log("Erreur profile API: " . $e->getMessage());
    sendJSON(['error' => 'Erreur lors de la gestion du profil'], 500);
}
?>
