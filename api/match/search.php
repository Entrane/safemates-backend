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

    // AUTO-MIGRATION: Mettre à jour les rank_level manquants (migration automatique)
    require_once __DIR__ . '/../rank-mapping.php';

    $stmt = $db->query('SELECT id, game, rank, rank_level FROM game_profiles WHERE rank_level IS NULL AND rank IS NOT NULL');
    $needsUpdate = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($needsUpdate) > 0) {
        error_log("AUTO-MIGRATION: " . count($needsUpdate) . " profils sans rank_level détectés");

        $updateStmt = $db->prepare('UPDATE game_profiles SET rank_level = ? WHERE id = ?');
        foreach ($needsUpdate as $profile) {
            $level = getRankLevel($profile['rank'], $profile['game']);
            if ($level !== null) {
                $updateStmt->execute([$level, $profile['id']]);
                error_log("  - Profil #{$profile['id']}: {$profile['rank']} → {$level}");
            }
        }
    }

    // Récupérer le profil de l'utilisateur pour ce jeu (avec préférences)
    $stmt = $db->prepare('
        SELECT id, rank, rank_level, mode, style, tolerance, preferred_ranks
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

    // Extraire les paramètres de matching depuis le profil
    $userTolerance = (int)($myProfile['tolerance'] ?? 1);
    $prefRanks = [];

    // Lire les preferred_ranks depuis game_profiles
    if ($myProfile['preferred_ranks']) {
        $prefRanks = json_decode($myProfile['preferred_ranks'], true) ?? [];
    }

    // Si aucune préférence de rang n'est définie, utiliser le rang du profil
    if (empty($prefRanks)) {
        if ($myProfile['rank_level'] === null) {
            sendJSON([
                'success' => false,
                'error' => 'Veuillez définir vos préférences de rang ou configurer votre rang.'
            ], 400);
            exit;
        }
        $prefRanks = [$myProfile['rank']];
    }

    // Convertir les slugs de rangs préférés en rank_levels
    $prefRankLevels = [];
    foreach ($prefRanks as $rankSlug) {
        $level = getRankLevel($rankSlug, $game);
        if ($level !== null) {
            $prefRankLevels[] = $level;
        }
    }

    // Log de débogage détaillé
    error_log("MATCHMAKING - User: {$currentUserId}, Game: {$game}");
    error_log("  Preferred Ranks: " . implode(', ', $prefRanks) . " (levels: " . implode(', ', $prefRankLevels) . ")");
    error_log("  Tolerance: {$userTolerance}");

    // Calculer toutes les plages acceptées
    $ranges = [];
    foreach ($prefRankLevels as $level) {
        $ranges[] = ($level - $userTolerance) . "-" . ($level + $userTolerance);
    }
    error_log("  Ranges acceptées: " . implode(', ', $ranges));

    // Construire les conditions SQL pour chaque rang préféré
    $rankConditions = [];
    $params = [
        'game' => $game,
        'user_tolerance' => $userTolerance,
        'current_user_id' => $currentUserId
    ];

    foreach ($prefRankLevels as $index => $level) {
        $paramName = "rank_level_{$index}";
        $rankConditions[] = "ABS(gp.rank_level - :{$paramName}) <= :user_tolerance";
        $params[$paramName] = $level;
    }

    // Si aucune préférence valide, retourner vide
    if (empty($rankConditions)) {
        sendJSON([
            'success' => true,
            'matches' => [],
            'message' => 'Aucune préférence de rang valide'
        ], 200);
        exit;
    }

    // Joindre les conditions avec OR
    $rankConditionSQL = '(' . implode(' OR ', $rankConditions) . ')';

    // Recherche SQL - Matching sur rank_level avec préférences multiples
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
          AND {$rankConditionSQL}
          AND gp.user_id != :current_user_id
          AND u.is_banned = 0
          AND us.last_activity >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
        ORDER BY RAND()
        LIMIT 10
    ";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Log des résultats avec calcul de différence
    error_log("MATCHMAKING - Résultats trouvés: " . count($matches));
    foreach ($matches as $match) {
        // Vérifier quelle préférence correspond
        $matchedPref = null;
        foreach ($prefRankLevels as $prefLevel) {
            $diff = abs($match['rank_level'] - $prefLevel);
            if ($diff <= $userTolerance) {
                $matchedPref = $prefLevel;
                $matchedDiff = $diff;
                break;
            }
        }

        if ($matchedPref !== null) {
            error_log("  - User: {$match['username']}, Rank: {$match['rank']} (level {$match['rank_level']}), Matched pref: {$matchedPref}, Diff: {$matchedDiff}");
        } else {
            error_log("  - User: {$match['username']}, Rank: {$match['rank']} (level {$match['rank_level']}), NO MATCH (bug?)");
        }
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
