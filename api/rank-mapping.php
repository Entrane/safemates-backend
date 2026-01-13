<?php
/**
 * Utilitaire de mapping entre rangs (slugs) et rank_level (numérique)
 * Utilisé pour la conversion et la validation des rangs
 * Système de rangs séparé par jeu pour éviter les conflits
 */

/**
 * Retourne le mapping complet rang → rank_level pour tous les jeux
 * @return array Tableau associatif [gameId => [rankSlug => rankLevel]]
 */
function getRankMaps() {
    return [
        'valorant' => [
            'fer1' => 1, 'fer2' => 2, 'fer3' => 3,
            'bronze1' => 4, 'bronze2' => 5, 'bronze3' => 6,
            'argent1' => 7, 'argent2' => 8, 'argent3' => 9,
            'or1' => 10, 'or2' => 11, 'or3' => 12,
            'platine1' => 13, 'platine2' => 14, 'platine3' => 15,
            'diamant1' => 16, 'diamant2' => 17, 'diamant3' => 18,
            'ascendant_1' => 19, 'ascendant_2' => 20, 'ascendant_3' => 21,
            'immortal_1' => 22, 'immortal_2' => 23, 'immortal_3' => 24,
            'radiant' => 25
        ],
        'lol' => [
            'iron' => 1,
            'bronze' => 2,
            'silver' => 3,
            'gold' => 4,
            'platinum' => 5,
            'emerald' => 6,
            'diamond' => 7,
            'master' => 8,
            'grandmaster' => 9,
            'challenger' => 10
        ],
        'csgo' => [
            'silver' => 1,
            'silver2' => 2,
            'silver3' => 3,
            'silver4' => 4,
            'silver5' => 5,
            'silver6' => 6,
            'gold1' => 7,
            'gold2' => 8,
            'gold3' => 9,
            'gold4' => 10,
            'mg1' => 11,
            'mg2' => 12,
            'mge' => 13,
            'dmg' => 14,
            'le' => 15,
            'lem' => 16,
            'supreme' => 17,
            'global' => 18
        ],
        'rocketleague' => [
            'bronze' => 1,
            'silver' => 2,
            'gold' => 3,
            'platine' => 4,
            'diamant' => 5,
            'champion' => 6,
            'grandchampion' => 7
        ],
        'fortnite' => [
            'bronze' => 1,
            'silver' => 2,
            'gold' => 3,
            'platine' => 4,
            'diamant' => 5,
            'champion' => 6,
            'elite' => 7,
            'unreal' => 8
        ],
        'warzone' => [
            'bronze' => 1,
            'silver' => 2,
            'gold' => 3,
            'platine' => 4,
            'diamant' => 5,
            'crimson' => 6,
            'iridescent' => 7,
            'top250' => 8
        ]
    ];
}

/**
 * Retourne le mapping pour un jeu spécifique (rétrocompatibilité avec Valorant par défaut)
 * @param string $gameId L'identifiant du jeu (valorant, lol, csgo, etc.)
 * @return array Mapping rang → rank_level pour ce jeu
 */
function getRankMap($gameId = 'valorant') {
    $maps = getRankMaps();
    return $maps[$gameId] ?? $maps['valorant'];
}

/**
 * Convertit un slug de rang en rank_level
 * @param string $rankSlug Le slug du rang (ex: "platine2")
 * @param string $gameId L'identifiant du jeu (valorant, lol, csgo, etc.)
 * @return int|null Le rank_level correspondant ou null si inconnu
 */
function getRankLevel($rankSlug, $gameId = 'valorant') {
    $rankMap = getRankMap($gameId);
    $normalized = strtolower(trim($rankSlug));
    return $rankMap[$normalized] ?? null;
}

/**
 * Convertit un rank_level en slug de rang
 * @param int $rankLevel Le niveau numérique du rang (1-25)
 * @param string $gameId L'identifiant du jeu (valorant, lol, csgo, etc.)
 * @return string|null Le slug correspondant ou null si invalide
 */
function getRankSlug($rankLevel, $gameId = 'valorant') {
    $reverseMap = array_flip(getRankMap($gameId));
    return $reverseMap[$rankLevel] ?? null;
}

/**
 * Valide qu'un rank_level est dans la plage autorisée pour un jeu
 * @param int $rankLevel Le niveau à valider
 * @param string $gameId L'identifiant du jeu
 * @return bool True si valide
 */
function isValidRankLevel($rankLevel, $gameId = 'valorant') {
    $rankMap = getRankMap($gameId);
    return is_numeric($rankLevel) && in_array($rankLevel, $rankMap);
}

/**
 * Valide qu'un slug de rang existe pour un jeu
 * @param string $rankSlug Le slug à valider
 * @param string $gameId L'identifiant du jeu
 * @return bool True si le rang existe
 */
function isValidRankSlug($rankSlug, $gameId = 'valorant') {
    return getRankLevel($rankSlug, $gameId) !== null;
}

/**
 * Retourne la liste de tous les slugs de rangs valides pour un jeu
 * @param string $gameId L'identifiant du jeu
 * @return array Liste des slugs
 */
function getAllRankSlugs($gameId = 'valorant') {
    return array_keys(getRankMap($gameId));
}

/**
 * Retourne le nom d'affichage d'un rang
 * @param string $rankSlug Le slug du rang
 * @return string Nom formaté pour l'affichage
 */
function getRankDisplayName($rankSlug) {
    $names = [
        'fer' => 'Fer',
        'bronze' => 'Bronze',
        'argent' => 'Argent',
        'or' => 'Or',
        'platine' => 'Platine',
        'diamant' => 'Diamant',
        'ascendant' => 'Ascendant',
        'immortal' => 'Immortal',
        'radiant' => 'Radiant'
    ];

    // Extraire le nom de base et le niveau
    if (preg_match('/^([a-z]+)(\d*)$/', strtolower($rankSlug), $matches)) {
        $base = $matches[1];
        $level = $matches[2] ?? '';

        $displayBase = $names[$base] ?? ucfirst($base);
        return $level ? "$displayBase $level" : $displayBase;
    }

    return ucfirst($rankSlug);
}
?>
