// ====================================================
// FICHIER : database.js
// Configuration de la base de données (SQLite local / MySQL production)
// ====================================================

const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');

// Configuration basée sur l'environnement
const isProduction = process.env.NODE_ENV === 'production';
const useMysql = process.env.USE_MYSQL === 'true' || isProduction;

let db;
let pool; // Pour MySQL

/**
 * Initialise la connexion à la base de données
 */
async function initDatabase() {
    if (useMysql) {
        console.log('🐬 Utilisation de MySQL (production)');
        return initMysqlDatabase();
    } else {
        console.log('📁 Utilisation de SQLite (développement)');
        return initSqliteDatabase();
    }
}

/**
 * Initialise SQLite (développement local)
 */
function initSqliteDatabase() {
    return new Promise((resolve, reject) => {
        const dbPath = process.env.DATABASE_PATH || './database.sqlite';
        console.log('📁 Chemin de la base de données SQLite:', dbPath);

        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Erreur lors de l\'ouverture de SQLite:', err);
                reject(err);
            } else {
                console.log('✅ SQLite ouverte avec succès');
                createSqliteTables();
                resolve(db);
            }
        });
    });
}

/**
 * Initialise MySQL (production avec Hostinger)
 */
async function initMysqlDatabase() {
    try {
        pool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            port: process.env.MYSQL_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Tester la connexion
        const connection = await pool.getConnection();
        console.log('✅ MySQL connectée avec succès à:', process.env.MYSQL_HOST);
        connection.release();

        await createMysqlTables();
        return pool;
    } catch (error) {
        console.error('❌ Erreur lors de la connexion à MySQL:', error);
        throw error;
    }
}

/**
 * Crée les tables SQLite
 */
function createSqliteTables() {
    db.serialize(() => {
        // Tables SQLite (code existant)
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                accepted_charter BOOLEAN DEFAULT 0,
                charter_accepted_at DATETIME,
                is_admin BOOLEAN DEFAULT 0,
                is_banned BOOLEAN DEFAULT 0
            )
        `);

        // Autres tables...
        console.log('✅ Tables SQLite créées/vérifiées');
    });
}

/**
 * Crée les tables MySQL
 */
async function createMysqlTables() {
    try {
        const connection = await pool.getConnection();

        // Table users
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                accepted_charter BOOLEAN DEFAULT 0,
                charter_accepted_at DATETIME,
                is_admin BOOLEAN DEFAULT 0,
                is_banned BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table friend_requests
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

        // Table messages
        await connection.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                content TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_read BOOLEAN DEFAULT 0,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table game_settings
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

        // Table partner_preferences
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

        // Table notifications
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

        // Table user_sessions
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_sessions (
                user_id INT PRIMARY KEY,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                active_chats TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table reports
        await connection.query(`
            CREATE TABLE IF NOT EXISTS reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reporter_id INT NOT NULL,
                reported_id INT NOT NULL,
                reason TEXT NOT NULL,
                description TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at DATETIME,
                resolved_by INT,
                resolution_note TEXT,
                FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (reported_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table sanctions
        await connection.query(`
            CREATE TABLE IF NOT EXISTS sanctions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                reason TEXT NOT NULL,
                duration_hours INT,
                issued_by INT,
                issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Table contact_messages
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

        connection.release();
        console.log('✅ Tables MySQL créées/vérifiées');
    } catch (error) {
        console.error('❌ Erreur création tables MySQL:', error);
        throw error;
    }
}

/**
 * Fonction utilitaire pour exécuter une requête
 */
async function query(sql, params = []) {
    if (useMysql) {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } else {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

/**
 * Fonction utilitaire pour exécuter une requête qui modifie des données
 */
async function run(sql, params = []) {
    if (useMysql) {
        const [result] = await pool.execute(sql, params);
        return result;
    } else {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }
}

/**
 * Fonction utilitaire pour récupérer une seule ligne
 */
async function get(sql, params = []) {
    if (useMysql) {
        const [rows] = await pool.execute(sql, params);
        return rows[0] || null;
    } else {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row || null);
            });
        });
    }
}

module.exports = {
    initDatabase,
    query,
    run,
    get,
    getDb: () => useMysql ? pool : db,
    isMySQL: () => useMysql
};
