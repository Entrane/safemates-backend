<?php
/**
 * Migration: Ajouter la colonne preferred_ranks à game_profiles
 * À exécuter une seule fois puis à SUPPRIMER
 */

require_once 'config.php';

try {
    $db = getDB();

    // Vérifier si la colonne existe déjà
    $stmt = $db->query("SHOW COLUMNS FROM game_profiles LIKE 'preferred_ranks'");
    $columnExists = $stmt->fetch();

    if ($columnExists) {
        echo "✅ La colonne 'preferred_ranks' existe déjà\n";
    } else {
        // Ajouter la colonne preferred_ranks (JSON array des rangs préférés)
        $db->exec("
            ALTER TABLE game_profiles
            ADD COLUMN preferred_ranks TEXT
        ");
        echo "✅ Colonne 'preferred_ranks' ajoutée avec succès\n";
    }

    echo "\n✅ Migration terminée avec succès !\n";
    echo "Vous pouvez maintenant supprimer ce fichier.\n";

} catch (PDOException $e) {
    echo "❌ Erreur lors de la migration: " . $e->getMessage() . "\n";
}
?>
