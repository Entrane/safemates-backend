<?php
/**
 * Script pour créer la table game_profiles
 * Visite ce fichier une fois: https://safemates.fr/api/create-game-profiles-table.php
 */

require_once 'config.php';

echo "<h1>Création de la table game_profiles</h1>";
echo "<pre>";

try {
    $db = getDB();

    // Table game_profiles
    echo "Création de la table 'game_profiles'...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS game_profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            game VARCHAR(50) NOT NULL,
            rank VARCHAR(50),
            rank_level INT,
            mode VARCHAR(100),
            style VARCHAR(50),
            tolerance INT DEFAULT 1,
            options JSON,
            preferred_ranks JSON,
            availability JSON,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_game (user_id, game),
            INDEX idx_rank_level (rank_level),
            UNIQUE KEY unique_user_game (user_id, game)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Table 'game_profiles' créée avec succès!\n\n";

    echo str_repeat("=", 50) . "\n";
    echo "🎉 MIGRATION TERMINÉE !\n";
    echo str_repeat("=", 50) . "\n\n";

    echo "Vous pouvez maintenant:\n";
    echo "1. Mettre à jour vos informations de jeu\n";
    echo "2. Rechercher des partenaires\n";
    echo "3. Utiliser toutes les fonctionnalités de profil\n\n";

    echo "⚠️  SÉCURITÉ: Supprimez ce fichier après utilisation !\n";

} catch (PDOException $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    echo "\nDétails:\n";
    echo "Code d'erreur: " . $e->getCode() . "\n";

    // Si la table existe déjà
    if ($e->getCode() == '42S01') {
        echo "\n✅ La table existe déjà, pas besoin de la recréer !\n";
    }
}

echo "</pre>";
?>
