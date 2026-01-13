<?php
/**
 * Utilitaire de mapping entre rangs (slugs) et rank_level (numérique)
 * Utilisé pour la conversion et la validation des rangs
 */

/**
 * Retourne le mapping complet rang → rank_level
 */
function getRankMap() {
    return [
        // Fer / Iron
        'fer1' => 1, 'fer2' => 2, 'fer3' => 3,
        'iron1' => 1, 'iron2' => 2, 'iron3' => 3,

        // Bronze
        'bronze1' => 4, 'bronze2' => 5, 'bronze3' => 6,

        // Argent / Silver
        'argent1' => 7, 'argent2' => 8, 'argent3' => 9,
        'silver1' => 7, 'silver2' => 8, 'silver3' => 9,

        // Or / Gold
        'or1' => 10, 'or2' => 11, 'or3' => 12,
        'gold' => 11, 'gold1' => 10, 'gold2' => 11, 'gold3' => 12,

        // Platine / Platinum
        'platine1' => 13, 'platine2' => 14, 'platine3' => 15,
        'platinum1' => 13, 'platinum2' => 14, 'platinum3' => 15,
        'plat1' => 13, 'plat2' => 14, 'plat3' => 15,

        // Diamant / Diamond
        'diamant1' => 16, 'diamant2' => 17, 'diamant3' => 18,
        'diamond1' => 16, 'diamond2' => 17, 'diamond3' => 18,

        // Ascendant
        'ascendant1' => 19, 'ascendant2' => 20, 'ascendant3' => 21,

        // Immortal
        'immortal1' => 22, 'immortal2' => 23, 'immortal3' => 24,
        'immortal_1' => 22, 'immortal_2' => 23, 'immortal_3' => 24,

        // Master (approximation)
        'master' => 23,

        // Radiant
        'radiant' => 25
    ];
}

/**
 * Convertit un slug de rang en rank_level
 * @param string $rankSlug Le slug du rang (ex: "platine2")
 * @return int|null Le rank_level correspondant ou null si inconnu
 */
function getRankLevel($rankSlug) {
    $rankMap = getRankMap();
    $normalized = strtolower(trim($rankSlug));
    return $rankMap[$normalized] ?? null;
}

/**
 * Convertit un rank_level en slug de rang
 * @param int $rankLevel Le niveau numérique du rang (1-25)
 * @return string|null Le slug correspondant ou null si invalide
 */
function getRankSlug($rankLevel) {
    $reverseMap = array_flip(getRankMap());
    return $reverseMap[$rankLevel] ?? null;
}

/**
 * Valide qu'un rank_level est dans la plage autorisée
 * @param int $rankLevel Le niveau à valider
 * @return bool True si valide (1-25)
 */
function isValidRankLevel($rankLevel) {
    return is_numeric($rankLevel) && $rankLevel >= 1 && $rankLevel <= 25;
}

/**
 * Valide qu'un slug de rang existe
 * @param string $rankSlug Le slug à valider
 * @return bool True si le rang existe
 */
function isValidRankSlug($rankSlug) {
    return getRankLevel($rankSlug) !== null;
}

/**
 * Retourne la liste de tous les slugs de rangs valides
 * @return array Liste des slugs
 */
function getAllRankSlugs() {
    return array_keys(getRankMap());
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
