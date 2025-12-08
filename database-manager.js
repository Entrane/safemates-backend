// ====================================================
// DATABASE MANAGER - MATCHMATES
// Gestion des backups, migrations et maintenance de la base de données
// ====================================================

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || './database.sqlite';
const BACKUP_DIR = './backups';

// Créer le dossier de backup s'il n'existe pas
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(` Dossier de backup créé: ${BACKUP_DIR}`);
}

// ====================================================
// UTILITAIRES
// ====================================================

/**
 * Obtenir la connexion à la base de données
 */
function getDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(db);
            }
        });
    });
}

/**
 * Exécuter une requête SQL
 */
function runQuery(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}

/**
 * Récupérer toutes les lignes
 */
function getAllRows(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// ====================================================
// BACKUP DE LA BASE DE DONNÉES
// ====================================================

async function backupDatabase() {
    try {
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const backupPath = path.join(BACKUP_DIR, `database_backup_${timestamp}.sqlite`);

        // Copier le fichier de base de données
        fs.copyFileSync(DB_PATH, backupPath);

        const stats = fs.statSync(backupPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log(` Backup créé avec succès!`);
        console.log(`   =Á Fichier: ${backupPath}`);
        console.log(`   =Ê Taille: ${sizeMB} MB`);
        console.log(`   =P Date: ${new Date().toLocaleString('fr-FR')}`);

        return backupPath;
    } catch (error) {
        console.error('L Erreur lors du backup:', error.message);
        throw error;
    }
}

// ====================================================
// RESTAURATION DEPUIS UN BACKUP
// ====================================================

async function restoreDatabase(backupFilePath) {
    try {
        if (!fs.existsSync(backupFilePath)) {
            throw new Error(`Le fichier de backup n'existe pas: ${backupFilePath}`);
        }

        // Créer un backup de sécurité avant la restauration
        console.log('= Création d\'un backup de sécurité avant restauration...');
        await backupDatabase();

        // Restaurer
        fs.copyFileSync(backupFilePath, DB_PATH);

        console.log(` Base de données restaurée depuis: ${backupFilePath}`);
    } catch (error) {
        console.error('L Erreur lors de la restauration:', error.message);
        throw error;
    }
}

// ====================================================
// NETTOYAGE DES ANCIENNES DONNÉES
// ====================================================

async function cleanOldData(daysOld = 90) {
    try {
        const db = await getDatabase();

        // Supprimer les messages plus vieux que X jours
        const deleteOldMessages = `
            DELETE FROM messages
            WHERE datetime(timestamp) < datetime('now', '-${daysOld} days')
        `;

        // Supprimer les notifications plus vieilles que X jours
        const deleteOldNotifications = `
            DELETE FROM notifications
            WHERE datetime(created_at) < datetime('now', '-${daysOld} days')
        `;

        // Supprimer les demandes d'amis rejetées plus vieilles que X jours
        const deleteOldRequests = `
            DELETE FROM friend_requests
            WHERE status = 'rejected'
            AND datetime(created_at) < datetime('now', '-${daysOld} days')
        `;

        const messagesResult = await runQuery(db, deleteOldMessages);
        const notificationsResult = await runQuery(db, deleteOldNotifications);
        const requestsResult = await runQuery(db, deleteOldRequests);

        console.log(` Nettoyage terminé (données > ${daysOld} jours):`);
        console.log(`   =Ñ  Messages supprimés: ${messagesResult.changes}`);
        console.log(`   =Ñ  Notifications supprimées: ${notificationsResult.changes}`);
        console.log(`   =Ñ  Demandes rejetées supprimées: ${requestsResult.changes}`);

        db.close();
    } catch (error) {
        console.error('L Erreur lors du nettoyage:', error.message);
        throw error;
    }
}

// ====================================================
// OPTIMISATION DE LA BASE DE DONNÉES
// ====================================================

async function optimizeDatabase() {
    try {
        const db = await getDatabase();

        console.log('=' Optimisation de la base de données...');

        // VACUUM: Récupère l'espace inutilisé
        await runQuery(db, 'VACUUM');
        console.log('    VACUUM terminé');

        // ANALYZE: Met à jour les statistiques pour l'optimiseur de requêtes
        await runQuery(db, 'ANALYZE');
        console.log('    ANALYZE terminé');

        // REINDEX: Reconstruit les index
        await runQuery(db, 'REINDEX');
        console.log('    REINDEX terminé');

        const stats = fs.statSync(DB_PATH);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log(` Optimisation terminée!`);
        console.log(`   =Ê Taille actuelle: ${sizeMB} MB`);

        db.close();
    } catch (error) {
        console.error('L Erreur lors de l\'optimisation:', error.message);
        throw error;
    }
}

// ====================================================
// STATISTIQUES DE LA BASE DE DONNÉES
// ====================================================

async function getDatabaseStats() {
    try {
        const db = await getDatabase();

        const stats = {
            users: await getAllRows(db, 'SELECT COUNT(*) as count FROM users'),
            messages: await getAllRows(db, 'SELECT COUNT(*) as count FROM messages'),
            friendRequests: await getAllRows(db, 'SELECT COUNT(*) as count FROM friend_requests'),
            notifications: await getAllRows(db, 'SELECT COUNT(*) as count FROM notifications'),
            gameSettings: await getAllRows(db, 'SELECT COUNT(*) as count FROM game_settings'),
        };

        const fileStats = fs.statSync(DB_PATH);
        const sizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);

        console.log('\n=Ê STATISTIQUES DE LA BASE DE DONNÉES');
        console.log('=====================================');
        console.log(`=Á Fichier: ${DB_PATH}`);
        console.log(`=Ï Taille: ${sizeMB} MB`);
        console.log(`=e Utilisateurs: ${stats.users[0].count}`);
        console.log(`=¬ Messages: ${stats.messages[0].count}`);
        console.log(`> Demandes d'amis: ${stats.friendRequests[0].count}`);
        console.log(`= Notifications: ${stats.notifications[0].count}`);
        console.log(`<® Paramètres de jeu: ${stats.gameSettings[0].count}`);
        console.log('=====================================\n');

        db.close();
    } catch (error) {
        console.error('L Erreur lors de la récupération des stats:', error.message);
        throw error;
    }
}

// ====================================================
// LISTE DES BACKUPS
// ====================================================

function listBackups() {
    try {
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.endsWith('.sqlite'))
            .map(f => {
                const filePath = path.join(BACKUP_DIR, f);
                const stats = fs.statSync(filePath);
                return {
                    name: f,
                    path: filePath,
                    size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
                    date: stats.mtime.toLocaleString('fr-FR')
                };
            })
            .sort((a, b) => b.date.localeCompare(a.date));

        console.log('\n=æ BACKUPS DISPONIBLES');
        console.log('====================================');
        if (files.length === 0) {
            console.log('Aucun backup trouvé.');
        } else {
            files.forEach((file, index) => {
                console.log(`${index + 1}. ${file.name}`);
                console.log(`   =Á ${file.path}`);
                console.log(`   =Ê ${file.size}`);
                console.log(`   =P ${file.date}`);
                console.log('---');
            });
        }
        console.log('====================================\n');

        return files;
    } catch (error) {
        console.error('L Erreur lors de la liste des backups:', error.message);
        throw error;
    }
}

// ====================================================
// CLI - LIGNE DE COMMANDE
// ====================================================

const command = process.argv[2];
const arg = process.argv[3];

(async () => {
    console.log('\n=Ä  MATCHMATES - DATABASE MANAGER\n');

    try {
        switch (command) {
            case 'backup':
                await backupDatabase();
                break;

            case 'restore':
                if (!arg) {
                    console.error('L Usage: node database-manager.js restore <backup-file-path>');
                    process.exit(1);
                }
                await restoreDatabase(arg);
                break;

            case 'clean':
                const days = arg ? parseInt(arg) : 90;
                await cleanOldData(days);
                break;

            case 'optimize':
                await optimizeDatabase();
                break;

            case 'stats':
                await getDatabaseStats();
                break;

            case 'list':
                listBackups();
                break;

            case 'help':
            default:
                console.log('=Ö COMMANDES DISPONIBLES:');
                console.log('');
                console.log('  backup              Créer un backup de la base de données');
                console.log('  restore <file>      Restaurer depuis un backup');
                console.log('  clean [days]        Nettoyer les données anciennes (défaut: 90 jours)');
                console.log('  optimize            Optimiser la base (VACUUM, ANALYZE, REINDEX)');
                console.log('  stats               Afficher les statistiques');
                console.log('  list                Lister tous les backups');
                console.log('  help                Afficher cette aide');
                console.log('');
                console.log('=Ý EXEMPLES:');
                console.log('  node database-manager.js backup');
                console.log('  node database-manager.js clean 30');
                console.log('  node database-manager.js restore backups/database_backup_2025-01-24.sqlite');
                console.log('');
                break;
        }
    } catch (error) {
        console.error('\nL Une erreur est survenue:', error.message);
        process.exit(1);
    }
})();

// Export pour utilisation en tant que module
module.exports = {
    backupDatabase,
    restoreDatabase,
    cleanOldData,
    optimizeDatabase,
    getDatabaseStats,
    listBackups
};
