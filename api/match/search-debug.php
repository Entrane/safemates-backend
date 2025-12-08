<?php
/**
 * VERSION DEBUG de l'API de recherche de partenaires
 * À SUPPRIMER après débogage
 */

require_once '../config.php';

// Vérifier l'authentification
$user = requireAuth();

// Récupérer le jeu depuis l'URL
$requestUri = $_SERVER['REQUEST_URI'];
$pathParts = explode('/', parse_url($requestUri, PHP_URL_PATH));
$game = end($pathParts);
$game = sanitize($game);

if (empty($game)) {
    sendJSON(['error' => 'Le jeu est requis'], 400);
}

try {
    $db = getDB();

    // Récupérer le profil de l'utilisateur actuel pour ce jeu
    $stmt = $db->prepare('
        SELECT id, rank, mode, tolerance
        FROM game_profiles
        WHERE user_id = ? AND game = ?
    ');
    $stmt->execute([$user['userId'], $game]);
    $myProfile = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$myProfile) {
        sendJSON([
            'success' => true,
            'matches' => [],
            'message' => 'Veuillez d\'abord configurer votre profil de jeu',
            'debug' => ['noProfile' => true]
        ], 200);
        exit;
    }

    // Liste des rangs par jeu
    $allRanks = [
        'fer1', 'fer2', 'fer3',
        'bronze1', 'bronze2', 'bronze3',
        'argent1', 'argent2', 'argent3',
        'or1', 'or2', 'or3',
        'platine1', 'platine2', 'platine3',
        'diamant1', 'diamant2', 'diamant3',
        'ascendant1', 'ascendant2', 'ascendant3',
        'immortal1', 'immortal2', 'immortal3',
        'radiant'
    ];

    $tolerance = (int)$myProfile['tolerance'];
    $myRank = $myProfile['rank'];

    // Trouver l'index du rang actuel
    $myRankIndex = array_search($myRank, $allRanks);
    if ($myRankIndex === false) {
        $myRankIndex = 0;
    }

    // Calculer les rangs acceptables
    $minRankIndex = max(0, $myRankIndex - $tolerance);
    $maxRankIndex = min(count($allRanks) - 1, $myRankIndex + $tolerance);
    $acceptableRanks = array_slice($allRanks, $minRankIndex, $maxRankIndex - $minRankIndex + 1);

    // Créer les placeholders
    $placeholders = implode(',', array_fill(0, count($acceptableRanks), '?'));

    // Rechercher des profils
    $stmt = $db->prepare("
        SELECT
            gp.id as profile_id,
            gp.user_id,
            gp.rank,
            gp.mode,
            gp.tolerance,
            u.username
        FROM game_profiles gp
        JOIN users u ON gp.user_id = u.id
        WHERE gp.game = ?
        AND gp.user_id != ?
        AND gp.rank IN ($placeholders)
        AND u.is_banned = 0
        ORDER BY RAND()
        LIMIT 10
    ");

    $params = array_merge([$game, $user['userId']], $acceptableRanks);
    $stmt->execute($params);
    $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formater les résultats
    $formattedMatches = array_map(function($match) {
        $mode = $match['mode'] ?? 'Non défini';
        $mainMode = $mode;
        $options = [];

        if (preg_match('/^(.+?)\s*\(\+\s*(.+)\)$/', $mode, $matches_mode)) {
            $mainMode = trim($matches_mode[1]);
            $options = array_map('trim', explode(',', $matches_mode[2]));
        }

        return [
            'id' => $match['user_id'],
            'username' => $match['username'],
            'rank' => $match['rank'],
            'mainMode' => $mainMode,
            'options' => $options,
            'compatibility' => 85 + rand(0, 15)
        ];
    }, $matches);

    sendJSON([
        'success' => true,
        'matches' => $formattedMatches,
        'count' => count($formattedMatches),
        'debug' => [
            'myRank' => $myRank,
            'myRankIndex' => $myRankIndex,
            'tolerance' => $tolerance,
            'minRankIndex' => $minRankIndex,
            'maxRankIndex' => $maxRankIndex,
            'acceptableRanks' => $acceptableRanks,
            'rawMatches' => array_map(function($m) {
                return ['username' => $m['username'], 'rank' => $m['rank']];
            }, $matches)
        ]
    ], 200);

} catch (PDOException $e) {
    error_log("Erreur recherche matchs: " . $e->getMessage());
    sendJSON(['error' => 'Erreur lors de la recherche de partenaires', 'debug' => $e->getMessage()], 500);
}
?>
