<?php
/**
 * API de recherche de partenaires de jeu
 * GET /api/match/search/{game}
 */

require_once '../config.php';

// Vérifier l'authentification
$user = requireAuth();

// Récupérer le jeu depuis l'URL ou les paramètres GET
$game = '';

// Essayer d'abord depuis les paramètres GET
if (isset($_GET['game'])) {
    $game = sanitize($_GET['game']);
} else {
    // Sinon depuis l'URL (pour .htaccess)
    $requestUri = $_SERVER['REQUEST_URI'];
    $pathParts = explode('/', parse_url($requestUri, PHP_URL_PATH));
    $game = sanitize(end($pathParts));
}

if (empty($game)) {
    sendJSON(['error' => 'Le jeu est requis'], 400);
}

try {
    $db = getDB();

    // Récupérer le profil de l'utilisateur actuel pour ce jeu
    $stmt = $db->prepare('
        SELECT id, rank, mode, tolerance, preferred_ranks
        FROM game_profiles
        WHERE user_id = ? AND game = ?
    ');
    $stmt->execute([$user['userId'], $game]);
    $myProfile = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$myProfile) {
        sendJSON([
            'success' => true,
            'matches' => [],
            'message' => 'Veuillez d\'abord configurer votre profil de jeu'
        ], 200);
        exit;
    }

    // Liste des rangs par jeu (simplifié - tous les jeux utilisent le même système)
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
    $preferredRanks = json_decode($myProfile['preferred_ranks'] ?? '[]', true);

    // Si l'utilisateur a spécifié des rangs préférés, les utiliser avec tolérance
    if (!empty($preferredRanks) && is_array($preferredRanks)) {
        $acceptableRanks = [];

        // Pour chaque rang préféré, ajouter les rangs dans la tolérance
        foreach ($preferredRanks as $prefRank) {
            $prefRankIndex = array_search($prefRank, $allRanks);
            if ($prefRankIndex !== false) {
                $minIndex = max(0, $prefRankIndex - $tolerance);
                $maxIndex = min(count($allRanks) - 1, $prefRankIndex + $tolerance);

                for ($i = $minIndex; $i <= $maxIndex; $i++) {
                    if (!in_array($allRanks[$i], $acceptableRanks)) {
                        $acceptableRanks[] = $allRanks[$i];
                    }
                }
            }
        }
    } else {
        // Utiliser le rang de l'utilisateur avec tolérance
        $myRank = $myProfile['rank'];
        $myRankIndex = array_search($myRank, $allRanks);
        if ($myRankIndex === false) {
            $myRankIndex = 0;
        }

        $minRankIndex = max(0, $myRankIndex - $tolerance);
        $maxRankIndex = min(count($allRanks) - 1, $myRankIndex + $tolerance);
        $acceptableRanks = array_slice($allRanks, $minRankIndex, $maxRankIndex - $minRankIndex + 1);
    }

    // Log de débogage
    error_log("DEBUG SEARCH - Mon rang: $myRank, Index: $myRankIndex, Tolérance: $tolerance");
    error_log("DEBUG SEARCH - Min index: $minRankIndex, Max index: $maxRankIndex");
    error_log("DEBUG SEARCH - Rangs acceptables: " . implode(', ', $acceptableRanks));

    // Créer les placeholders pour la requête SQL
    $placeholders = implode(',', array_fill(0, count($acceptableRanks), '?'));

    // Rechercher des profils qui correspondent à MES critères uniquement
    $stmt = $db->prepare("
        SELECT
            gp.id as profile_id,
            gp.user_id,
            gp.rank,
            gp.mode,
            gp.tolerance,
            gp.style,
            gp.options,
            u.username,
            u.email
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

    // Log des résultats
    error_log("DEBUG SEARCH - Nombre de matchs trouvés: " . count($matches));
    foreach ($matches as $match) {
        error_log("DEBUG SEARCH - Match trouvé: " . $match['username'] . " - Rang: " . $match['rank']);
    }

    // Formater les résultats
    $formattedMatches = array_map(function($match) {
        // Parser le mode s'il contient des options (ex: "Classé (+ Vocal Obligatoire)")
        $mode = $match['mode'] ?? 'Non défini';
        $mainMode = $mode;
        $modeOptions = [];

        if (preg_match('/^(.+?)\s*\(\+\s*(.+)\)$/', $mode, $matches_mode)) {
            $mainMode = trim($matches_mode[1]);
            $modeOptions = array_map('trim', explode(',', $matches_mode[2]));
        }

        // Décoder les options (JSON array)
        $options = json_decode($match['options'] ?? '[]', true);
        if (!is_array($options)) {
            $options = [];
        }

        return [
            'id' => $match['user_id'],
            'username' => $match['username'],
            'rank' => $match['rank'],
            'mainMode' => $mainMode,
            'modeOptions' => $modeOptions,
            'style' => $match['style'],
            'options' => $options,
            'compatibility' => 85 + rand(0, 15) // Score de compatibilité simulé
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
