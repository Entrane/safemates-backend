<?php
/**
 * Migration: Ajouter la colonne rank_level à game_profiles et migrer les données
 * À exécuter une seule fois puis à SUPPRIMER
 */

require_once 'config.php';

echo "<h1>Migration rank_level</h1>";
echo "<pre>";

// Mapping des rangs vers rank_level
$rankMapping = [
    'fer1' => 1, 'fer2' => 2, 'fer3' => 3,
    'bronze1' => 4, 'bronze2' => 5, 'bronze3' => 6,
    'argent1' => 7, 'argent2' => 8, 'argent3' => 9,
    'or1' => 10, 'or2' => 11, 'or3' => 12,
    'platine1' => 13, 'platine2' => 14, 'platine3' => 15,
    'diamant1' => 16, 'diamant2' => 17, 'diamant3' => 18,
    'ascendant1' => 19, 'ascendant2' => 20, 'ascendant3' => 21,
    'immortal1' => 22, 'immortal2' => 23, 'immortal3' => 24,
    'radiant' => 25
];

try {
    $db = getDB();

    echo "=== ÉTAPE 1: Vérification de la colonne ===\n";

    // Vérifier si la colonne existe déjà
    $stmt = $db->query("SHOW COLUMNS FROM game_profiles LIKE 'rank_level'");
    $columnExists = $stmt->fetch();

    if ($columnExists) {
        echo "✅ La colonne 'rank_level' existe déjà\n\n";
    } else {
        echo "Ajout de la colonne 'rank_level'...\n";
        $db->exec("
            ALTER TABLE game_profiles
            ADD COLUMN rank_level INT DEFAULT NULL
        ");
        echo "✅ Colonne 'rank_level' ajoutée avec succès\n\n";
    }

    echo "=== ÉTAPE 2: Migration des données ===\n";

    // Récupérer tous les profils qui n'ont pas de rank_level
    $stmt = $db->query("SELECT id, rank FROM game_profiles WHERE rank_level IS NULL");
    $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Nombre de profils à migrer: " . count($profiles) . "\n\n";

    $migratedCount = 0;
    $errorCount = 0;
    $errors = [];

    foreach ($profiles as $profile) {
        $rank = strtolower(trim($profile['rank']));
        $rankLevel = $rankMapping[$rank] ?? null;

        if ($rankLevel !== null) {
            // Mettre à jour le rank_level
            $updateStmt = $db->prepare("UPDATE game_profiles SET rank_level = ? WHERE id = ?");
            $updateStmt->execute([$rankLevel, $profile['id']]);
            $migratedCount++;
            echo "✓ Profil #{$profile['id']}: '{$profile['rank']}' → rank_level {$rankLevel}\n";
        } else {
            // Rang non reconnu
            $errorCount++;
            $errors[] = "Profil #{$profile['id']}: Rang inconnu '{$profile['rank']}'";
            echo "⚠ Profil #{$profile['id']}: Rang inconnu '{$profile['rank']}'\n";
        }
    }

    echo "\n=== RÉSUMÉ ===\n";
    echo "✅ Profils migrés avec succès: {$migratedCount}\n";

    if ($errorCount > 0) {
        echo "⚠  Profils avec erreur: {$errorCount}\n";
        echo "\nDétails des erreurs:\n";
        foreach ($errors as $error) {
            echo "  - {$error}\n";
        }
    }

    // Vérifier les profils finaux
    $stmt = $db->query("SELECT COUNT(*) as total FROM game_profiles");
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    $stmt = $db->query("SELECT COUNT(*) as with_level FROM game_profiles WHERE rank_level IS NOT NULL");
    $withLevel = $stmt->fetch(PDO::FETCH_ASSOC)['with_level'];

    echo "\n=== STATISTIQUES FINALES ===\n";
    echo "Total de profils: {$total}\n";
    echo "Profils avec rank_level: {$withLevel}\n";
    echo "Profils sans rank_level: " . ($total - $withLevel) . "\n";

    echo "\n✅ MIGRATION TERMINÉE AVEC SUCCÈS !\n";
    echo "\nVous pouvez maintenant:\n";
    echo "1. Vérifier les profils via https://safemates.fr/api/debug-profiles.php\n";
    echo "2. Supprimer ce fichier de migration\n";

} catch (PDOException $e) {
    echo "\n❌ ERREUR lors de la migration: " . $e->getMessage() . "\n";
    echo "\nCode d'erreur: " . $e->getCode() . "\n";
}

echo "</pre>";
?>
