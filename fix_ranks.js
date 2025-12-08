const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('🔧 Mise à jour des rangs en minuscules...\n');

// Mapping des anciens rangs vers les nouveaux (minuscules)
const rankMapping = {
    'Iron': 'iron',
    'Bronze': 'bronze',
    'Silver': 'silver',
    'Gold': 'gold',
    'Platinum': 'platinum',
    'Emerald': 'emerald',
    'diamond': 'diamond',
    'Diamond': 'diamond',
    'Master': 'master',
    'GrandM': 'grandmaster',
    'Grandmaster': 'grandmaster',
    'Challenger': 'challenger'
};

db.serialize(() => {
    // 1. Récupérer tous les game_settings
    db.all('SELECT user_id, game_id, rank FROM game_settings', [], (err, rows) => {
        if (err) {
            console.error('Erreur:', err);
            return;
        }

        console.log(`Trouvé ${rows.length} entrées de game_settings\n`);

        let updated = 0;
        rows.forEach(row => {
            const oldRank = row.rank;
            const newRank = rankMapping[oldRank] || oldRank.toLowerCase();

            if (oldRank !== newRank) {
                db.run(
                    'UPDATE game_settings SET rank = ? WHERE user_id = ? AND game_id = ?',
                    [newRank, row.user_id, row.game_id],
                    function(err) {
                        if (err) {
                            console.error(`Erreur mise à jour user ${row.user_id}:`, err);
                        } else {
                            updated++;
                            console.log(`✅ User ${row.user_id} (${row.game_id}): ${oldRank} → ${newRank}`);
                        }
                    }
                );
            }
        });

        setTimeout(() => {
            console.log(`\n✅ Mise à jour terminée : ${updated} rangs modifiés`);
            db.close();
        }, 500);
    });
});
