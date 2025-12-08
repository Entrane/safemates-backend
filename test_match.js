const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Copie exacte du RANK_MAP du serveur
const RANK_MAP = {
    'fer1': 1, 'fer2': 2, 'fer3': 3,
    'bronze1': 4, 'bronze2': 5, 'bronze3': 6,
    'argent1': 7, 'argent2': 8, 'argent3': 9,
    'or1': 10, 'or2': 11, 'or3': 12,
    'platine1': 13, 'platine2': 14, 'platine3': 15,
    'diamant1': 16, 'diamant2': 17, 'diamant3': 18,
    'ascendant_1': 19, 'ascendant_2': 20, 'ascendant_3': 21,
    'immortal_1': 22, 'immortal_2': 23, 'immortal_3': 24,
    'radiant': 25,
    'iron': 1,
    'bronze': 2,
    'silver': 3,
    'gold': 4,
    'platinum': 5,
    'emerald': 6,
    'diamond': 7,
    'master': 8,
    'grandmaster': 9,
    'challenger': 10,
};

function getRankValue(rankId) {
    const val = RANK_MAP[rankId.toLowerCase()];
    console.log(`  getRankValue('${rankId}') = ${val}`);
    return val || 0;
}

console.log('🔍 TEST COMPLET DU MATCHMAKING\n');

// Simuler la recherche pour l'utilisateur 2 (Gold)
const userId = 2;
const gameId = 'lol';

db.serialize(() => {
    // 1. Récupérer les settings de l'utilisateur qui cherche
    db.get('SELECT * FROM game_settings WHERE user_id = ? AND game_id = ?', [userId, gameId], (err, settings) => {
        if (err || !settings) {
            console.error('❌ Erreur récupération settings:', err);
            db.close();
            return;
        }

        console.log('=== SETTINGS USER 2 ===');
        console.log('Rang:', settings.rank);
        console.log('Mode:', settings.mainMode);
        console.log('Options:', settings.options);

        const A_rankValue = getRankValue(settings.rank);
        const A_tolerance = 1;
        const A_minRank = A_rankValue - A_tolerance;
        const A_maxRank = A_rankValue + A_tolerance;

        console.log('\n=== CALCULS ===');
        console.log('A_rankValue:', A_rankValue);
        console.log('A_tolerance:', A_tolerance);
        console.log('Range acceptée:', [A_minRank, A_maxRank]);

        // 2. Récupérer les préférences
        db.get('SELECT * FROM partner_preferences WHERE user_id = ?', [userId], (err, prefs) => {
            const A_prefs = prefs ? {
                prefRanks: prefs.prefRanks ? JSON.parse(prefs.prefRanks) : [],
                rankTolerance: prefs.rankTolerance || 1
            } : { prefRanks: [], rankTolerance: 1 };

            console.log('\n=== PRÉFÉRENCES USER 2 ===');
            console.log('prefRanks:', A_prefs.prefRanks);
            console.log('rankTolerance:', A_prefs.rankTolerance);

            // 3. Construction de la requête SQL
            const A_options = settings.options ? JSON.parse(settings.options) : [];
            let optionsWhereClause = '';
            const optionsParams = [];

            if (A_options.length > 0) {
                optionsWhereClause = A_options.map(opt => {
                    optionsParams.push(`%"${opt}"%`);
                    return 'B.options LIKE ?';
                }).join(' AND ');
            } else {
                optionsWhereClause = '1=1';
            }

            console.log('\n=== REQUÊTE SQL ===');
            console.log('Options WHERE:', optionsWhereClause);
            console.log('Options params:', optionsParams);

            const sql = `
                SELECT
                    U.id AS user_id,
                    U.username,
                    B.rank,
                    B.mainMode,
                    B.options,
                    PP.rankTolerance AS B_rankTolerance,
                    PP.prefRanks AS B_prefRanks
                FROM users U
                INNER JOIN game_settings B ON U.id = B.user_id
                LEFT JOIN partner_preferences PP ON U.id = PP.user_id
                LEFT JOIN friend_requests F1 ON (F1.sender_id = ? AND F1.receiver_id = U.id AND F1.status IN ('pending', 'accepted'))
                LEFT JOIN friend_requests F2 ON (F2.sender_id = U.id AND F2.receiver_id = ? AND F2.status IN ('pending', 'accepted'))
                WHERE
                    U.id != ? AND
                    B.game_id = ? AND
                    B.mainMode = ? AND
                    ${optionsWhereClause} AND
                    F1.id IS NULL AND F2.id IS NULL
            `;

            const params = [userId, userId, userId, gameId, settings.mainMode, ...optionsParams];

            console.log('\nParams:', params);

            db.all(sql, params, (err, potentialMatches) => {
                if (err) {
                    console.error('❌ Erreur SQL:', err);
                    db.close();
                    return;
                }

                console.log(`\n=== MATCHES POTENTIELS (${potentialMatches.length}) ===`);
                potentialMatches.forEach(match => {
                    console.log(`\nCandidat: ${match.username} (ID: ${match.user_id})`);
                    console.log('  Rang:', match.rank);
                    console.log('  Mode:', match.mainMode);
                    console.log('  Options:', match.options);

                    const B_rankValue = getRankValue(match.rank);
                    const prefRankValues = A_prefs.prefRanks.map(r => getRankValue(r)).filter(Boolean);

                    let rankMatch;
                    if (prefRankValues.length > 0) {
                        rankMatch = prefRankValues.some(val =>
                            B_rankValue >= (val - A_tolerance) && B_rankValue <= (val + A_tolerance)
                        );
                        console.log('  Check avec prefRanks:', prefRankValues, '-> Match:', rankMatch);
                    } else {
                        rankMatch = (B_rankValue >= A_minRank && B_rankValue <= A_maxRank);
                        console.log(`  Check: ${B_rankValue} >= ${A_minRank} && ${B_rankValue} <= ${A_maxRank} = ${rankMatch}`);
                    }

                    console.log('  ✅ MATCH FINAL:', rankMatch ? 'OUI' : 'NON');
                });

                console.log('\n========================================\n');
                db.close();
            });
        });
    });
});
