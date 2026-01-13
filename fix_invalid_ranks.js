const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('🔧 Correction des rangs invalides dans la base de données\n');

// L'utilisateur 1 a "master" pour CS:GO, ce qui est invalide
// On va le remplacer par un rang par défaut (silver - le premier rang)

db.serialize(() => {
    // Afficher le rang actuel
    db.get('SELECT * FROM game_settings WHERE user_id = 1 AND game_id = "csgo"', [], (err, row) => {
        if (err) {
            console.error('Erreur:', err);
            return;
        }

        if (row) {
            console.log('❌ Rang invalide trouvé:');
            console.log(`   User ${row.user_id} - ${row.game_id}: "${row.rank}"`);
            console.log('');

            // Demander confirmation avant de modifier
            console.log('⚠️  Options de correction:');
            console.log('   1. Supprimer cette entrée (recommandé si l\'utilisateur ne joue pas à CS:GO)');
            console.log('   2. Remplacer par "silver" (le rang le plus bas de CS:GO)');
            console.log('');
            console.log('💡 Exécutez l\'une des commandes suivantes:');
            console.log('');
            console.log('   Pour SUPPRIMER:');
            console.log('   node -e "const sqlite3 = require(\'sqlite3\').verbose(); const db = new sqlite3.Database(\'./database.sqlite\'); db.run(\'DELETE FROM game_settings WHERE user_id = 1 AND game_id = \\\'csgo\\\'\', (err) => { if (err) console.error(err); else console.log(\'✅ Entrée supprimée\'); db.close(); });"');
            console.log('');
            console.log('   Pour REMPLACER par silver:');
            console.log('   node -e "const sqlite3 = require(\'sqlite3\').verbose(); const db = new sqlite3.Database(\'./database.sqlite\'); db.run(\'UPDATE game_settings SET rank = \\\'silver\\\' WHERE user_id = 1 AND game_id = \\\'csgo\\\'\', (err) => { if (err) console.error(err); else console.log(\'✅ Rang mis à jour\'); db.close(); });"');
        } else {
            console.log('✅ Aucun rang invalide trouvé pour l\'utilisateur 1 - csgo');
        }

        db.close();
    });
});
