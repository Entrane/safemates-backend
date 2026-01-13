<?php
/**
 * Script de migration pour ajouter rank_level à tous les profils existants
 * À exécuter une seule fois après le déploiement
 */

require_once __DIR__ . '/api/config.php';
require_once __DIR__ . '/api/rank-mapping.php';

echo "🔄 Migration des rank_levels pour tous les profils existants\n\n";

try {
    $db = getDB();

    // Récupérer tous les profils
    $stmt = $db->query('SELECT id, user_id, game, rank, rank_level FROM game_profiles');
    $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "📊 Total de profils à traiter: " . count($profiles) . "\n\n";

    $updated = 0;
    $alreadySet = 0;
    $errors = 0;

    foreach ($profiles as $profile) {
        $profileId = $profile['id'];
        $userId = $profile['user_id'];
        $game = $profile['game'];
        $rank = $profile['rank'];
        $currentRankLevel = $profile['rank_level'];

        // Si rank_level est déjà défini, on passe
        if ($currentRankLevel !== null) {
            $alreadySet++;
            echo "✓ Profil #{$profileId} (User {$userId}, {$game}): rank_level déjà défini ({$currentRankLevel})\n";
            continue;
        }

        // Calculer le rank_level à partir du slug
        $rankLevel = getRankLevel($rank, $game);

        if ($rankLevel === null) {
            $errors++;
            echo "❌ Profil #{$profileId} (User {$userId}, {$game}): rang invalide '{$rank}'\n";
            continue;
        }

        // Mettre à jour le profil
        $updateStmt = $db->prepare('UPDATE game_profiles SET rank_level = ? WHERE id = ?');
        $updateStmt->execute([$rankLevel, $profileId]);

        $updated++;
        echo "✅ Profil #{$profileId} (User {$userId}, {$game}): '{$rank}' → rank_level {$rankLevel}\n";
    }

    echo "\n📊 Résumé de la migration:\n";
    echo "   - Profils mis à jour: {$updated}\n";
    echo "   - Profils déjà configurés: {$alreadySet}\n";
    echo "   - Erreurs: {$errors}\n";

    if ($errors === 0) {
        echo "\n✅ Migration terminée avec succès!\n";
    } else {
        echo "\n⚠️  Migration terminée avec des erreurs. Vérifiez les profils invalides ci-dessus.\n";
    }

} catch (Exception $e) {
    echo "\n❌ Erreur lors de la migration: " . $e->getMessage() . "\n";
    exit(1);
}
?>
