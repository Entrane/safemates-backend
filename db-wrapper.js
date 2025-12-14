// ====================================================
// FICHIER : db-wrapper.js
// Wrapper de base de données compatible SQLite et MySQL
// Permet d'utiliser la même syntaxe pour les deux
// ====================================================

const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');

const useMysql = process.env.USE_MYSQL === 'true' || process.env.NODE_ENV === 'production';
let sqliteDb = null;
let mysqlPool = null;

/**
 * Initialise la connexion à la base de données
 */
async function initializeDatabase() {
    if (useMysql) {
        console.log('🐬 Initialisation de MySQL (production)');
        mysqlPool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            port: process.env.MYSQL_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            timezone: '+00:00'
        });

        // Tester la connexion
        try {
            const connection = await mysqlPool.getConnection();
            console.log('✅ MySQL connectée avec succès:', process.env.MYSQL_HOST);
            connection.release();
        } catch (error) {
            console.error('❌ Erreur connexion MySQL:', error);
            throw error;
        }
    } else {
        console.log('📁 Initialisation de SQLite (développement)');
        const dbPath = process.env.DATABASE_PATH || './database.sqlite';
        sqliteDb = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Erreur ouverture SQLite:', err);
                throw err;
            }
            console.log('✅ SQLite ouverte avec succès:', dbPath);
        });
    }
}

/**
 * Wrapper pour db.run() - Compatible SQLite et MySQL
 */
function run(sql, params = []) {
    return new Promise(async (resolve, reject) => {
        if (useMysql) {
            try {
                const [result] = await mysqlPool.execute(sql, params);
                // Simuler le comportement SQLite
                resolve({
                    lastID: result.insertId,
                    changes: result.affectedRows
                });
            } catch (error) {
                reject(error);
            }
        } else {
            sqliteDb.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        }
    });
}

/**
 * Wrapper pour db.get() - Compatible SQLite et MySQL
 */
function get(sql, params = []) {
    return new Promise(async (resolve, reject) => {
        if (useMysql) {
            try {
                const [rows] = await mysqlPool.execute(sql, params);
                resolve(rows[0] || null);
            } catch (error) {
                reject(error);
            }
        } else {
            sqliteDb.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row || null);
            });
        }
    });
}

/**
 * Wrapper pour db.all() - Compatible SQLite et MySQL
 */
function all(sql, params = []) {
    return new Promise(async (resolve, reject) => {
        if (useMysql) {
            try {
                const [rows] = await mysqlPool.execute(sql, params);
                resolve(rows);
            } catch (error) {
                reject(error);
            }
        } else {
            sqliteDb.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        }
    });
}

/**
 * Wrapper pour db.serialize() - Compatible SQLite uniquement
 * En MySQL, exécute simplement le callback
 */
function serialize(callback) {
    if (useMysql) {
        // MySQL n'a pas besoin de serialize, exécuter directement
        callback();
    } else {
        sqliteDb.serialize(callback);
    }
}

/**
 * Retourne l'objet db brut (pour compatibilité)
 */
function getDb() {
    return useMysql ? mysqlPool : sqliteDb;
}

/**
 * Ferme la connexion à la base de données
 */
async function close() {
    if (useMysql && mysqlPool) {
        await mysqlPool.end();
        console.log('MySQL connection pool fermé');
    } else if (sqliteDb) {
        sqliteDb.close((err) => {
            if (err) console.error('Erreur fermeture SQLite:', err);
            else console.log('SQLite fermée');
        });
    }
}

// Créer un objet db compatible avec la syntaxe SQLite
const db = {
    run: function(sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        run(sql, params)
            .then(result => {
                if (callback) callback.call(result, null);
            })
            .catch(err => {
                if (callback) callback.call({}, err);
                else console.error('Erreur DB:', err);
            });
    },

    get: function(sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        get(sql, params)
            .then(row => {
                if (callback) callback(null, row);
            })
            .catch(err => {
                if (callback) callback(err, null);
                else console.error('Erreur DB:', err);
            });
    },

    all: function(sql, params, callback) {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        all(sql, params)
            .then(rows => {
                if (callback) callback(null, rows);
            })
            .catch(err => {
                if (callback) callback(err, null);
                else console.error('Erreur DB:', err);
            });
    },

    serialize: serialize,
    close: close
};

module.exports = {
    initializeDatabase,
    db,
    run,
    get,
    all,
    serialize,
    getDb,
    close,
    isMySQL: () => useMysql
};
