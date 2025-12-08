<?php
/**
 * Migration: Ajouter les colonnes style et options à game_profiles
 * À exécuter une seule fois puis à SUPPRIMER
 */

require_once 'config.php';

try {
    $db = getDB();

    // Vérifier si les colonnes existent déjà
    $stmt = $db->query("SHOW COLUMNS FROM game_profiles LIKE 'style'");
    $styleExists = $stmt->fetch();

    $stmt = $db->query("SHOW COLUMNS FROM game_profiles LIKE 'options'");
    $optionsExists = $stmt->fetch();

    if (!$styleExists) {
        $db->exec("ALTER TABLE game_profiles ADD COLUMN style VARCHAR(50)");
        echo "✅ Colonne 'style' ajoutée\n";
    } else {
        echo "✅ La colonne 'style' existe déjà\n";
    }

    if (!$optionsExists) {
        $db->exec("ALTER TABLE game_profiles ADD COLUMN options TEXT");
        echo "✅ Colonne 'options' ajoutée\n";
    } else {
        echo "✅ La colonne 'options' existe déjà\n";
    }

    echo "\n✅ Migration terminée avec succès !\n";
    echo "Vous pouvez maintenant supprimer ce fichier.\n";

} catch (PDOException $e) {
    echo "❌ Erreur lors de la migration: " . $e->getMessage() . "\n";
}
?>
