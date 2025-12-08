const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('=== GAME SETTINGS POUR LOL ===\n');
db.all('SELECT user_id, game_id, rank, mainMode, options FROM game_settings WHERE game_id = ?', ['lol'], (err, rows) => {
    if (err) {
        console.error('Erreur:', err);
        return;
    }

    console.log(`Trouvé ${rows.length} utilisateurs LOL:\n`);
    rows.forEach((row, i) => {
        console.log(`Utilisateur ${row.user_id}:`);
        console.log(`  rank: ${row.rank}`);
        console.log(`  mainMode: ${row.mainMode}`);
        console.log(`  options (raw): ${row.options}`);

        if (row.options) {
            try {
                const parsed = JSON.parse(row.options);
                console.log(`  options (parsed):`, parsed);
            } catch (e) {
                console.log(`  options (parse error):`, e.message);
            }
        }
        console.log('');
    });

    if (rows.length >= 2) {
        console.log('\n=== TEST DE LA REQUÊTE SQL (User 2 cherche) ===');

        const sql = `
            SELECT
                U.id AS user_id,
                U.username,
                B.rank,
                B.mainMode,
                B.options
            FROM users U
            INNER JOIN game_settings B ON U.id = B.user_id
            WHERE
                U.id != ? AND
                B.game_id = ? AND
                B.mainMode = ? AND
                B.options LIKE ?
        `;

        const userId = 2;
        const gameId = 'lol';
        const mainMode = 'Classé';
        const optionsPattern = '%"Vocal Obligatoire"%';

        console.log('Paramètres:');
        console.log(`  userId (à exclure): ${userId}`);
        console.log(`  gameId: ${gameId}`);
        console.log(`  mainMode: ${mainMode}`);
        console.log(`  optionsPattern: ${optionsPattern}\n`);

        db.all(sql, [userId, gameId, mainMode, optionsPattern], (err, matches) => {
            if (err) {
                console.error('Erreur SQL:', err);
                return;
            }

            console.log(`Résultat: ${matches.length} match(es) trouvé(s)`);
            matches.forEach(match => {
                console.log(`  - User ${match.user_id} (${match.username}): ${match.rank}, ${match.mainMode}, ${match.options}`);
            });

            // Test sans le filtre des options
            console.log('\n=== TEST SANS FILTRE D\'OPTIONS ===');
            const sql2 = `
                SELECT
                    U.id AS user_id,
                    U.username,
                    B.rank,
                    B.mainMode,
                    B.options
                FROM users U
                INNER JOIN game_settings B ON U.id = B.user_id
                WHERE
                    U.id != ? AND
                    B.game_id = ? AND
                    B.mainMode = ?
            `;

            db.all(sql2, [userId, gameId, mainMode], (err, matches2) => {
                if (err) {
                    console.error('Erreur SQL:', err);
                    return;
                }

                console.log(`Résultat: ${matches2.length} match(es) trouvé(s)`);
                matches2.forEach(match => {
                    console.log(`  - User ${match.user_id} (${match.username}): ${match.rank}, ${match.mainMode}, ${match.options}`);
                });

                db.close();
            });
        });
    } else {
        db.close();
    }
});
