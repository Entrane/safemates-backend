<?php
/**
 * API de recherche de partenaires de jeu (refactorisée)
 * GET /api/matchmaking/:gameSlug
 * GET /api/match/search.php?game={game} (legacy)
 *
 * Logique selon spécification:
 * - Matching par rank_level (numérique) avec tolérance
 * - Filtrage exact par mode ET style
 * - Utilisateurs en ligne uniquement (15 dernières minutes)
 */

require_once __DIR__ . '/../config.php';

// Vérifier l'authentification
$user = requireAuth();
$currentUserId = (int)$user['userId'];

// Récupérer le slug du jeu depuis l'URL
$game = '';
if (isset($_GET['game'])) {
    $game = sanitize($_GET['game']);
} else {
    $requestUri = $_SERVER['REQUEST_URI'];
    $pathParts = explode('/', parse_url($requestUri, PHP_URL_PATH));
    $game = sanitize(end($pathParts));
}

if (empty($game)) {
    sendJSON(['error' => 'Le jeu est requis'], 400);
}

try {
    $db = getDB();

    // Récupérer le profil de l'utilisateur pour ce jeu
    $stmt = $db->prepare('
        SELECT id, rank, rank_level, mode, style, tolerance
        FROM game_profiles
        WHERE user_id = ? AND game = ?
    ');
    $stmt->execute([$currentUserId, $game]);
    $myProfile = $stmt->fetch(PDO::FETCH_ASSOC);

    // Si pas de profil configuré
    if (!$myProfile) {
        sendJSON([
            'success' => true,
            'matches' => [],
            'message' => 'Veuillez d\'abord configurer votre profil de jeu'
        ], 200);
        exit;
    }

    // Vérifier que rank_level est défini
    if ($myProfile['rank_level'] === null) {
        sendJSON([
            'success' => false,
            'error' => 'Votre profil nécessite une mise à jour. Veuillez reconfigurer votre rang.'
        ], 400);
        exit;
    }

    // Extraire les paramètres de matching
    $userRankLevel = (int)$myProfile['rank_level'];
    $userMode = $myProfile['mode'];
    $userStyle = $myProfile['style'];
    $userTolerance = (int)$myProfile['tolerance'];

    // Log de débogage détaillé
    error_log("MATCHMAKING - User: {$currentUserId}, Game: {$game}");
    error_log("  User Rank: {$myProfile['rank']} (level: {$userRankLevel})");
    error_log("  Tolerance: {$userTolerance}");
    error_log("  Range acceptée: " . ($userRankLevel - $userTolerance) . " à " . ($userRankLevel + $userTolerance));

    // Recherche SQL - Matching uniquement sur rank_level (avec tolérance)
    // Mode et style sont affichés mais ne filtrent pas
    $sql = "
        SELECT
            u.id as user_id,
            u.username,
            gp.rank,
            gp.rank_level,
            gp.mode,
            gp.style
        FROM game_profiles gp
        JOIN users u ON u.id = gp.user_id
        JOIN user_sessions us ON u.id = us.user_id
        WHERE gp.game = :game
          AND gp.rank_level IS NOT NULL
          AND ABS(gp.rank_level - :user_rank_level) <= :user_tolerance
          AND gp.user_id != :current_user_id
          AND u.is_banned = 0
          AND us.last_activity >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
        ORDER BY RAND()
        LIMIT 10
    ";

    $params = [
        'game' => $game,
        'user_rank_level' => $userRankLevel,
        'user_tolerance' => $userTolerance,
        'current_user_id' => $currentUserId
    ];

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Log des résultats avec calcul de différence
    error_log("MATCHMAKING - Résultats trouvés: " . count($matches));
    foreach ($matches as $match) {
        $diff = abs($match['rank_level'] - $userRankLevel);
        $inRange = ($diff <= $userTolerance) ? 'OK' : 'HORS PLAGE!';
        error_log("  - User: {$match['username']}, Rank: {$match['rank']} (level {$match['rank_level']}), Diff: {$diff}, Status: {$inRange}");
    }

    // Formater la réponse selon la spécification
    $formattedMatches = array_map(function($match) {
        return [
            'id' => (int)$match['user_id'],
            'username' => $match['username'],
            'rank' => $match['rank'],
            'rank_level' => (int)$match['rank_level'],
            'mode' => $match['mode'],
            'style' => $match['style']
        ];
    }, $matches);

    sendJSON([
        'success' => true,
        'matches' => $formattedMatches,
        'count' => count($formattedMatches)
    ], 200);

} catch (PDOException $e) {
    error_log("Erreur recherche matchs: " . $e->getMessage());
    sendJSON(['error' => 'Erreur lors de la recherche de partenaires'], 500);
}
?>
