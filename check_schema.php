#!/usr/bin/env php
<?php
/**
 * Script de diagnostic pour vérifier le schéma de la table game_profiles
 */

require_once __DIR__ . '/api/config.php';

echo "🔍 Vérification du schéma de la table game_profiles\n\n";

try {
    $db = getDB();

    // Récupérer les colonnes de la table
    $stmt = $db->query("SHOW COLUMNS FROM game_profiles");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "📊 Colonnes de la table game_profiles:\n\n";

    $hasPreferredRanks = false;
    $hasTolerance = false;
    $hasRankLevel = false;

    foreach ($columns as $column) {
        echo sprintf(
            "  - %-20s | %-15s | Null: %-3s | Default: %s\n",
            $column['Field'],
            $column['Type'],
            $column['Null'],
            $column['Default'] ?? 'NULL'
        );

        if ($column['Field'] === 'preferred_ranks') {
            $hasPreferredRanks = true;
        }
        if ($column['Field'] === 'tolerance') {
            $hasTolerance = true;
        }
        if ($column['Field'] === 'rank_level') {
            $hasRankLevel = true;
        }
    }

    echo "\n📋 Résumé:\n";
    echo "  - preferred_ranks existe: " . ($hasPreferredRanks ? "✅ OUI" : "❌ NON") . "\n";
    echo "  - tolerance existe: " . ($hasTolerance ? "✅ OUI" : "❌ NON") . "\n";
    echo "  - rank_level existe: " . ($hasRankLevel ? "✅ OUI" : "❌ NON") . "\n";

    // Compter les profils
    $stmt = $db->query("SELECT COUNT(*) as total FROM game_profiles");
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "\n  📊 Nombre total de profils: " . $count['total'] . "\n";

    // Compter les profils avec preferred_ranks
    if ($hasPreferredRanks) {
        $stmt = $db->query("SELECT COUNT(*) as total FROM game_profiles WHERE preferred_ranks IS NOT NULL");
        $prefCount = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "  📊 Profils avec preferred_ranks: " . $prefCount['total'] . "\n";
    }

    // Compter les profils avec rank_level
    if ($hasRankLevel) {
        $stmt = $db->query("SELECT COUNT(*) as total FROM game_profiles WHERE rank_level IS NOT NULL");
        $rankLevelCount = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "  📊 Profils avec rank_level: " . $rankLevelCount['total'] . "\n";
    }

    if (!$hasPreferredRanks || !$hasTolerance || !$hasRankLevel) {
        echo "\n⚠️  COLONNES MANQUANTES DÉTECTÉES!\n";
        echo "   Vous devez exécuter une migration pour ajouter les colonnes manquantes.\n";
    } else {
        echo "\n✅ Toutes les colonnes nécessaires sont présentes!\n";
    }

} catch (PDOException $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    exit(1);
}
?>
