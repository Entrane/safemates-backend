#!/usr/bin/env php
<?php
/**
 * Migration pour ajouter les colonnes preferred_ranks et tolerance à game_profiles
 */

require_once __DIR__ . '/api/config.php';

echo "🔄 Migration: Ajout des colonnes de préférences à game_profiles\n\n";

try {
    $db = getDB();

    // Vérifier les colonnes existantes
    $stmt = $db->query("SHOW COLUMNS FROM game_profiles");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $existingColumns = [];
    foreach ($columns as $column) {
        $existingColumns[] = $column['Field'];
    }

    $columnsToAdd = [];

    // Vérifier preferred_ranks
    if (!in_array('preferred_ranks', $existingColumns)) {
        $columnsToAdd[] = [
            'name' => 'preferred_ranks',
            'sql' => 'ALTER TABLE game_profiles ADD COLUMN preferred_ranks TEXT NULL'
        ];
    } else {
        echo "✓ Colonne 'preferred_ranks' existe déjà\n";
    }

    // Vérifier tolerance
    if (!in_array('tolerance', $existingColumns)) {
        $columnsToAdd[] = [
            'name' => 'tolerance',
            'sql' => 'ALTER TABLE game_profiles ADD COLUMN tolerance INT DEFAULT 1'
        ];
    } else {
        echo "✓ Colonne 'tolerance' existe déjà\n";
    }

    // Vérifier rank_level
    if (!in_array('rank_level', $existingColumns)) {
        $columnsToAdd[] = [
            'name' => 'rank_level',
            'sql' => 'ALTER TABLE game_profiles ADD COLUMN rank_level INT NULL'
        ];
    } else {
        echo "✓ Colonne 'rank_level' existe déjà\n";
    }

    // Ajouter les colonnes manquantes
    if (empty($columnsToAdd)) {
        echo "\n✅ Toutes les colonnes sont déjà présentes, aucune migration nécessaire!\n";
    } else {
        echo "\n📝 Ajout des colonnes manquantes:\n";

        foreach ($columnsToAdd as $column) {
            echo "  - Ajout de '{$column['name']}'... ";
            try {
                $db->exec($column['sql']);
                echo "✅ OK\n";
            } catch (PDOException $e) {
                echo "❌ ERREUR: " . $e->getMessage() . "\n";
            }
        }

        echo "\n✅ Migration terminée!\n";
    }

    // Vérifier le résultat final
    echo "\n📊 Colonnes finales de game_profiles:\n";
    $stmt = $db->query("SHOW COLUMNS FROM game_profiles");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($columns as $column) {
        echo sprintf(
            "  - %-20s | %-15s\n",
            $column['Field'],
            $column['Type']
        );
    }

} catch (PDOException $e) {
    echo "\n❌ Erreur lors de la migration: " . $e->getMessage() . "\n";
    exit(1);
}
?>
