<?php
/**
 * Script d'installation de la base de données
 * À exécuter UNE SEULE FOIS après le déploiement sur Hostinger
 *
 * Accédez à : https://votre-domaine.com/api/install.php
 * Ensuite SUPPRIMEZ ce fichier pour des raisons de sécurité
 */

require_once 'config.php';

// Sécurité : à supprimer après installation
$INSTALL_PASSWORD = 'matchmates2024'; // Changez ce mot de passe

if (!isset($_GET['password']) || $_GET['password'] !== $INSTALL_PASSWORD) {
    die('Accès refusé. Utilisez: install.php?password=VOTRE_MOT_DE_PASSE');
}

try {
    $db = getDB();

    echo "<h1>Installation de la base de données MatchMates</h1>";
    echo "<pre>";

    // Table users
    echo "Création de la table 'users'...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY " . (USE_SQLITE ? "AUTOINCREMENT" : "AUTO_INCREMENT") . ",
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_banned BOOLEAN DEFAULT 0,
            is_admin BOOLEAN DEFAULT 0
        )
    ");
    echo "✅ Table 'users' créée\n\n";

    // Table game_profiles
    echo "Création de la table 'game_profiles'...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS game_profiles (
            id INTEGER PRIMARY KEY " . (USE_SQLITE ? "AUTOINCREMENT" : "AUTO_INCREMENT") . ",
            user_id INTEGER NOT NULL,
            game VARCHAR(100) NOT NULL,
            rank VARCHAR(50),
            mode VARCHAR(50),
            tolerance INTEGER DEFAULT 1,
            availability TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ");
    echo "✅ Table 'game_profiles' créée\n\n";

    // Table friendships
    echo "Création de la table 'friendships'...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS friendships (
            id INTEGER PRIMARY KEY " . (USE_SQLITE ? "AUTOINCREMENT" : "AUTO_INCREMENT") . ",
            user_id INTEGER NOT NULL,
            friend_id INTEGER NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ");
    echo "✅ Table 'friendships' créée\n\n";

    // Table sanctions
    echo "Création de la table 'sanctions'...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS sanctions (
            id INTEGER PRIMARY KEY " . (USE_SQLITE ? "AUTOINCREMENT" : "AUTO_INCREMENT") . ",
            user_id INTEGER NOT NULL,
            type VARCHAR(20) NOT NULL,
            reason TEXT,
            issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            issued_by INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (issued_by) REFERENCES users(id)
        )
    ");
    echo "✅ Table 'sanctions' créée\n\n";

    // Table reports
    echo "Création de la table 'reports'...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY " . (USE_SQLITE ? "AUTOINCREMENT" : "AUTO_INCREMENT") . ",
            reporter_id INTEGER NOT NULL,
            reported_user_id INTEGER NOT NULL,
            reason VARCHAR(50) NOT NULL,
            description TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            resolved_at DATETIME,
            resolved_by INTEGER,
            FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (resolved_by) REFERENCES users(id)
        )
    ");
    echo "✅ Table 'reports' créée\n\n";

    // Table messages (pour le chat)
    echo "Création de la table 'messages'...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY " . (USE_SQLITE ? "AUTOINCREMENT" : "AUTO_INCREMENT") . ",
            sender_id INTEGER NOT NULL,
            recipient_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            read_at DATETIME,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ");
    echo "✅ Table 'messages' créée\n\n";

    // Créer un utilisateur admin par défaut
    echo "Création de l'utilisateur admin...\n";
    $adminPassword = hashPassword('admin123'); // CHANGEZ CE MOT DE PASSE

    $stmt = $db->prepare("
        INSERT INTO users (username, email, password, is_admin, created_at)
        VALUES (?, ?, ?, 1, ?)
    ");

    try {
        $stmt->execute(['admin', 'admin@matchmates.fr', $adminPassword, date('Y-m-d H:i:s')]);
        echo "✅ Utilisateur admin créé (username: admin, password: admin123)\n";
        echo "⚠️  CHANGEZ CE MOT DE PASSE IMMÉDIATEMENT !\n\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'UNIQUE constraint failed') !== false ||
            strpos($e->getMessage(), 'Duplicate entry') !== false) {
            echo "ℹ️  L'utilisateur admin existe déjà\n\n";
        } else {
            throw $e;
        }
    }

    echo "</pre>";
    echo "<h2 style='color: green;'>✅ Installation terminée avec succès !</h2>";
    echo "<p><strong style='color: red;'>IMPORTANT : Supprimez maintenant le fichier install.php pour des raisons de sécurité !</strong></p>";
    echo "<p>Vous pouvez maintenant utiliser l'application : <a href='/index.html'>Accueil</a></p>";

} catch (PDOException $e) {
    echo "<h2 style='color: red;'>❌ Erreur lors de l'installation</h2>";
    echo "<pre>" . htmlspecialchars($e->getMessage()) . "</pre>";
    echo "<p>Vérifiez les informations de connexion à la base de données dans api/config.php</p>";
}
?>
