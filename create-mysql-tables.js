// Script pour créer les tables MySQL manquantes
require('dotenv').config();
const mysql = require('mysql2/promise');

async function createMysqlTables() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            port: process.env.MYSQL_PORT || 3306
        });

        console.log('✅ Connecté à MySQL');

        // Renommer friendships en friend_requests si elle existe
        try {
            await connection.query('RENAME TABLE friendships TO friend_requests');
            console.log('✅ Table friendships renommée en friend_requests');
        } catch (err) {
            if (err.code === 'ER_NO_SUCH_TABLE') {
                console.log('ℹ️  Table friendships n\'existe pas, création de friend_requests');
            } else if (err.code === 'ER_TABLE_EXISTS_ERROR') {
                console.log('ℹ️  Table friend_requests existe déjà');
            } else {
                console.log('⚠️  Erreur renommage:', err.message);
            }
        }

        // Créer la table friend_requests si elle n'existe pas
        await connection.query(`
            CREATE TABLE IF NOT EXISTS friend_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table friend_requests créée/vérifiée');

        // Créer game_settings si manquante
        await connection.query(`
            CREATE TABLE IF NOT EXISTS game_settings (
                user_id INT NOT NULL,
                game_id VARCHAR(50) NOT NULL,
                \`rank\` VARCHAR(50),
                mainMode VARCHAR(50),
                options TEXT,
                role VARCHAR(50),
                style VARCHAR(50),
                PRIMARY KEY (user_id, game_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table game_settings créée/vérifiée');

        // Créer partner_preferences si manquante
        await connection.query(`
            CREATE TABLE IF NOT EXISTS partner_preferences (
                user_id INT PRIMARY KEY,
                prefRanks TEXT,
                rankTolerance INT DEFAULT 1,
                prefRole VARCHAR(50),
                prefStyle VARCHAR(50),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table partner_preferences créée/vérifiée');

        // Créer notifications si manquante
        await connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                related_id INT,
                is_read BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table notifications créée/vérifiée');

        // Créer user_sessions si manquante
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                user_id INT PRIMARY KEY,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                active_chats TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table user_sessions créée/vérifiée');

        // Créer contact_messages si manquante
        await connection.query(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'pending',
                replied_at DATETIME,
                replied_by INT,
                FOREIGN KEY (replied_by) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Table contact_messages créée/vérifiée');

        await connection.end();
        console.log('\n🎉 Toutes les tables sont prêtes !');

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

createMysqlTables();
