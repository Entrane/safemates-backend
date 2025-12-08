const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('🔍 DIAGNOSTIC COMPLET DU MATCHMAKING\n');

db.serialize(() => {
    // 1. Lister tous les utilisateurs avec leurs tokens
    console.log('=== TOUS LES UTILISATEURS ===');
    db.all('SELECT id, username, email FROM users', [], (err, users) => {
        if (err) {
            console.error('Erreur:', err);
            return;
        }

        users.forEach(user => {
            console.log(`\nUser ${user.id}: ${user.username} (${user.email})`);
        });

        console.log('\n\n=== GAME SETTINGS POUR LOL ===');
        // 2. Lister tous les settings LoL
        db.all(`
            SELECT gs.*, u.username
            FROM game_settings gs
            JOIN users u ON gs.user_id = u.id
            WHERE gs.game_id = 'lol'
        `, [], (err, settings) => {
            if (err) {
                console.error('Erreur:', err);
                return;
            }

            settings.forEach(s => {
                console.log(`\n${s.username} (ID: ${s.user_id}):`);
                console.log(`  Rang: ${s.rank}`);
                console.log(`  Mode: ${s.mainMode}`);
                console.log(`  Options: ${s.options}`);
                console.log(`  Style: ${s.style}`);
            });

            console.log('\n\n=== PRÉFÉRENCES DE PARTENAIRE ===');
            // 3. Lister les préférences
            db.all(`
                SELECT pp.*, u.username
                FROM partner_preferences pp
                JOIN users u ON pp.user_id = u.id
            `, [], (err, prefs) => {
                if (err) {
                    console.error('Erreur:', err);
                    return;
                }

                prefs.forEach(p => {
                    console.log(`\n${p.username} (ID: ${p.user_id}):`);
                    console.log(`  Rangs préférés: ${p.prefRanks}`);
                    console.log(`  Tolérance: ${p.rankTolerance}`);
                });

                console.log('\n\n=== RELATIONS D\'AMITIÉ ===');
                // 4. Vérifier les relations d'amitié
                db.all(`
                    SELECT
                        u1.username as sender,
                        u2.username as receiver,
                        fr.status
                    FROM friend_requests fr
                    JOIN users u1 ON fr.sender_id = u1.id
                    JOIN users u2 ON fr.receiver_id = u2.id
                `, [], (err, friends) => {
                    if (err) {
                        console.error('Erreur:', err);
                        db.close();
                        return;
                    }

                    if (friends.length === 0) {
                        console.log('Aucune relation d\'amitié');
                    } else {
                        friends.forEach(f => {
                            console.log(`${f.sender} -> ${f.receiver}: ${f.status}`);
                        });
                    }

                    console.log('\n\n=== SIMULATION RECHERCHE USER 2 ===');
                    // 5. Simuler exactement la recherche de l'user 2
                    const testUserId = 2;

                    db.get('SELECT * FROM game_settings WHERE user_id = ? AND game_id = ?', [testUserId, 'lol'], (err, userSettings) => {
                        if (err || !userSettings) {
                            console.log('❌ User 2 n\'a pas de settings pour LoL');
                            db.close();
                            return;
                        }

                        console.log('Settings User 2:');
                        console.log('  Rang:', userSettings.rank);
                        console.log('  Mode:', userSettings.mainMode);
                        console.log('  Options:', userSettings.options);

                        // Requête exacte du serveur
                        const options = JSON.parse(userSettings.options || '[]');
                        let optionsWhereClause = '1=1';
                        const optionsParams = [];

                        if (options.length > 0) {
                            optionsWhereClause = options.map(opt => {
                                optionsParams.push(`%"${opt}"%`);
                                return 'B.options LIKE ?';
                            }).join(' AND ');
                        }

                        const sql = `
                            SELECT
                                U.id AS user_id,
                                U.username,
                                B.rank,
                                B.mainMode,
                                B.options
                            FROM users U
                            INNER JOIN game_settings B ON U.id = B.user_id
                            LEFT JOIN friend_requests F1 ON (F1.sender_id = ? AND F1.receiver_id = U.id AND F1.status IN ('pending', 'accepted'))
                            LEFT JOIN friend_requests F2 ON (F2.sender_id = U.id AND F2.receiver_id = ? AND F2.status IN ('pending', 'accepted'))
                            WHERE
                                U.id != ? AND
                                B.game_id = ? AND
                                B.mainMode = ? AND
                                ${optionsWhereClause} AND
                                F1.id IS NULL AND F2.id IS NULL
                        `;

                        const params = [testUserId, testUserId, testUserId, 'lol', userSettings.mainMode, ...optionsParams];

                        console.log('\nRequête SQL:', sql.replace(/\s+/g, ' ').trim());
                        console.log('Params:', params);

                        db.all(sql, params, (err, matches) => {
                            if (err) {
                                console.error('❌ Erreur SQL:', err);
                                db.close();
                                return;
                            }

                            console.log(`\n✅ ${matches.length} match(es) trouvé(s):`);
                            matches.forEach(m => {
                                console.log(`  - ${m.username} (ID: ${m.user_id}): ${m.rank}, ${m.mainMode}, ${m.options}`);
                            });

                            db.close();
                        });
                    });
                });
            });
        });
    });
});
