const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('=== VÉRIFICATION DES DEMANDES D\'AMIS ===\n');

db.all('SELECT * FROM friend_requests WHERE (sender_id = 2 AND receiver_id = 9) OR (sender_id = 9 AND receiver_id = 2)', [], (err, rows) => {
    if (err) {
        console.error('Erreur:', err);
        return;
    }

    if (rows.length === 0) {
        console.log('✅ Aucune demande d\'ami entre User 2 et User 9');
    } else {
        console.log(`❌ ${rows.length} demande(s) d\'ami trouvée(s) entre User 2 et User 9:\n`);
        rows.forEach(row => {
            console.log(`  ID: ${row.id}`);
            console.log(`  Sender: ${row.sender_id}`);
            console.log(`  Receiver: ${row.receiver_id}`);
            console.log(`  Status: ${row.status}`);
            console.log(`  Created: ${row.created_at}`);
            console.log('');
        });
    }

    db.close();
});
