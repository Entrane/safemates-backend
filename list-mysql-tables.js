// ====================================================
// Script pour lister les tables MySQL
// ====================================================
require('dotenv').config();
const mysql = require('mysql2/promise');

async function listMysqlTables() {
    try {
        // Créer la connexion MySQL
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            port: process.env.MYSQL_PORT || 3306
        });

        console.log('✅ Connecté à MySQL:', process.env.MYSQL_HOST);
        console.log('📊 Base de données:', process.env.MYSQL_DATABASE);
        console.log('\n=== LISTE DES TABLES ===\n');

        // Récupérer la liste des tables
        const [tables] = await connection.query('SHOW TABLES');

        if (tables.length === 0) {
            console.log('❌ Aucune table trouvée dans la base de données.');
        } else {
            tables.forEach((table, index) => {
                const tableName = Object.values(table)[0];
                console.log(`${index + 1}. ${tableName}`);
            });
            console.log(`\n📈 Total: ${tables.length} table(s)`);
        }

        // Pour chaque table, afficher le nombre de lignes
        console.log('\n=== NOMBRE D\'ENREGISTREMENTS PAR TABLE ===\n');

        for (const table of tables) {
            const tableName = Object.values(table)[0];
            const [count] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
            console.log(`${tableName}: ${count[0].count} enregistrement(s)`);
        }

        await connection.end();
        console.log('\n✅ Connexion fermée');

    } catch (error) {
        console.error('❌ Erreur lors de la connexion à MySQL:', error.message);

        if (error.code === 'ENOTFOUND') {
            console.log('\n💡 Conseil: Vérifiez que MYSQL_HOST est correct dans votre fichier .env');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Conseil: Vérifiez vos identifiants MySQL (MYSQL_USER et MYSQL_PASSWORD)');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('\n💡 Conseil: La base de données n\'existe pas. Vérifiez MYSQL_DATABASE dans .env');
        }
    }
}

// Lancer le script
listMysqlTables();
