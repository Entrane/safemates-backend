const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('🔧 Correction des données utilisateurs...\n');

db.serialize(() => {
    // 1. Mettre le même style pour les deux users Gold
    db.run('UPDATE game_settings SET style = NULL WHERE user_id IN (2, 9) AND game_id = "lol"', (err) => {
        if (err) {
            console.error('Erreur style:', err);
        } else {
            console.log('✅ Styles supprimés pour users 2 et 9');
        }
    });

    // 2. Corriger les préférences de l'user 9 (devrait chercher gold, pas fer1)
    db.run('UPDATE partner_preferences SET prefRanks = \'["gold"]\' WHERE user_id = 9', (err) => {
        if (err) {
            console.error('Erreur prefs user 9:', err);
        } else {
            console.log('✅ Préférences de rang mises à jour pour user 9');
        }
    });

    // 3. Supprimer les demandes d'amitié rejetées
    db.run('DELETE FROM friend_requests WHERE status = "rejected"', (err) => {
        if (err) {
            console.error('Erreur suppression rejected:', err);
        } else {
            console.log('✅ Demandes rejetées supprimées');
        }
    });

    // 4. Vérifier les résultats
    setTimeout(() => {
        console.log('\n=== VÉRIFICATION ===');
        db.all(`
            SELECT u.username, gs.rank, gs.mainMode, gs.options, gs.style, pp.prefRanks
            FROM game_settings gs
            JOIN users u ON gs.user_id = u.id
            LEFT JOIN partner_preferences pp ON gs.user_id = pp.user_id
            WHERE gs.game_id = 'lol' AND gs.rank = 'gold'
        `, [], (err, rows) => {
            if (err) {
                console.error('Erreur:', err);
            } else {
                rows.forEach(r => {
                    console.log(`\n${r.username}:`);
                    console.log(`  Rang: ${r.rank}`);
                    console.log(`  Mode: ${r.mainMode}`);
                    console.log(`  Options: ${r.options}`);
                    console.log(`  Style: ${r.style || 'null'}`);
                    console.log(`  Prefs: ${r.prefRanks || 'null'}`);
                });
            }
            db.close();
        });
    }, 500);
});
