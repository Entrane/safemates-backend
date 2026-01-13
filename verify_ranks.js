const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const RANK_MAPS = {
    valorant: ['fer1','fer2','fer3','bronze1','bronze2','bronze3','argent1','argent2','argent3','or1','or2','or3','platine1','platine2','platine3','diamant1','diamant2','diamant3','ascendant_1','ascendant_2','ascendant_3','immortal_1','immortal_2','immortal_3','radiant'],
    lol: ['iron','bronze','silver','gold','platinum','emerald','diamond','master','grandmaster','challenger'],
    csgo: ['silver','silver2','silver3','silver4','silver5','silver6','gold1','gold2','gold3','gold4','mg1','mg2','mge','dmg','le','lem','supreme','global'],
    rocketleague: ['bronze','silver','gold','platine','diamant','champion','grandchampion'],
    fortnite: ['bronze','silver','gold','platine','diamant','champion','elite','unreal'],
    warzone: ['bronze','silver','gold','platine','diamant','crimson','iridescent','top250']
};

console.log('🔍 Vérification des rangs dans la base de données:\n');

db.all('SELECT user_id, game_id, rank FROM game_settings ORDER BY game_id, user_id', [], (err, rows) => {
    if (err) {
        console.error('Erreur:', err);
        db.close();
        return;
    }

    let invalidCount = 0;

    rows.forEach(row => {
        const validRanks = RANK_MAPS[row.game_id] || [];
        const isValid = validRanks.includes(row.rank.toLowerCase());

        if (!isValid) {
            console.log(`❌ INVALIDE: User ${row.user_id} - ${row.game_id}: "${row.rank}"`);
            invalidCount++;
        } else {
            console.log(`✅ VALIDE: User ${row.user_id} - ${row.game_id}: "${row.rank}"`);
        }
    });

    console.log(`\n📊 Résumé: ${invalidCount} rang(s) invalide(s) sur ${rows.length} total(s)`);

    db.close();
});
