<?php
/**
 * Script pour créer les tables de la base de données
 * Visite ce fichier une fois: https://safemates.fr/api/create-tables.php
 */

require_once 'config.php';

echo "<h1>Création des tables SafeMates</h1>";
echo "<pre>";

try {
    $db = getDB();

    // Table users
    echo "Création de la table 'users'...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            is_banned TINYINT(1) DEFAULT 0,
            is_admin TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_username (username),
            INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Table 'users' créée\n\n";

    // Table user_profiles
    echo "Création de la table 'user_profiles'...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNIQUE NOT NULL,
            bio TEXT,
            avatar_url VARCHAR(255),
            discord_username VARCHAR(100),
            preferred_games JSON,
            playstyle VARCHAR(50),
            availability VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Table 'user_profiles' créée\n\n";

    // Table friendships
    echo "Création de la table 'friendships'...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS friendships (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            friend_id INT NOT NULL,
            status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_friend (user_id, friend_id),
            INDEX idx_status (status),
            UNIQUE KEY unique_friendship (user_id, friend_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Table 'friendships' créée\n\n";

    // Table notifications
    echo "Création de la table 'notifications'...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            data JSON,
            is_read TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_read (user_id, is_read),
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Table 'notifications' créée\n\n";

    echo str_repeat("=", 50) . "\n";
    echo "🎉 TOUTES LES TABLES ONT ÉTÉ CRÉÉES AVEC SUCCÈS !\n";
    echo str_repeat("=", 50) . "\n\n";

    echo "Vous pouvez maintenant:\n";
    echo "1. Créer un compte sur https://safemates.fr/signup.html\n";
    echo "2. Vous connecter sur https://safemates.fr/login.html\n";
    echo "3. Utiliser le site normalement\n\n";

    echo "⚠️  SÉCURITÉ: Supprimez ce fichier après utilisation !\n";

} catch (PDOException $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    echo "\nDétails:\n";
    echo "Code d'erreur: " . $e->getCode() . "\n";
}

echo "</pre>";
?>
