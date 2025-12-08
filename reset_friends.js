const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('=== SUPPRESSION DE LA DEMANDE D\'AMI ENTRE USER 2 ET 9 ===\n');

db.run('DELETE FROM friend_requests WHERE (sender_id = 2 AND receiver_id = 9) OR (sender_id = 9 AND receiver_id = 2)', [], function(err) {
    if (err) {
        console.error('❌ Erreur:', err);
        return;
    }

    console.log(`✅ ${this.changes} demande(s) d'ami supprimée(s)`);
    console.log('\n🎉 Maintenant, les users 2 et 9 devraient pouvoir se trouver dans la recherche de partenaires!');
    console.log('Relancez une recherche pour tester.');

    db.close();
});
