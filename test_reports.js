const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('🧪 TEST DU SYSTÈME DE REPORTS ET MODÉRATION\n');

db.serialize(() => {
    console.log('=== VÉRIFICATION DES TABLES ===');

    // 1. Vérifier que les tables existent
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='reports'", (err, row) => {
        console.log('✅ Table reports:', row ? 'OK' : '❌ MANQUANTE');
    });

    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='sanctions'", (err, row) => {
        console.log('✅ Table sanctions:', row ? 'OK' : '❌ MANQUANTE');
    });

    // 2. Vérifier les colonnes des users
    db.all('PRAGMA table_info(users)', [], (err, columns) => {
        const colNames = columns.map(c => c.name);
        console.log('✅ Colonne is_admin:', colNames.includes('is_admin') ? 'OK' : '❌ MANQUANTE');
        console.log('✅ Colonne is_banned:', colNames.includes('is_banned') ? 'OK' : '❌ MANQUANTE');
    });

    // 3. Vérifier les admins
    setTimeout(() => {
        console.log('\n=== ADMINISTRATEURS ===');
        db.all('SELECT id, username, is_admin FROM users WHERE is_admin = 1', [], (err, admins) => {
            if (err) {
                console.error('❌ Erreur:', err);
            } else if (admins.length === 0) {
                console.log('⚠️ Aucun administrateur trouvé');
            } else {
                admins.forEach(admin => {
                    console.log(`✅ Admin: ${admin.username} (ID: ${admin.id})`);
                });
            }

            // 4. Afficher les reports existants
            console.log('\n=== REPORTS EXISTANTS ===');
            db.all('SELECT * FROM reports', [], (err, reports) => {
                if (err) {
                    console.error('❌ Erreur:', err);
                } else {
                    console.log(`Total: ${reports.length} report(s)`);
                    reports.forEach(r => {
                        console.log(`  - Report #${r.id}: User ${r.reporter_id} → User ${r.reported_id} (${r.reason}) - Status: ${r.status}`);
                    });
                }

                // 5. Afficher les sanctions existantes
                console.log('\n=== SANCTIONS EXISTANTES ===');
                db.all('SELECT * FROM sanctions', [], (err, sanctions) => {
                    if (err) {
                        console.error('❌ Erreur:', err);
                    } else {
                        console.log(`Total: ${sanctions.length} sanction(s)`);
                        sanctions.forEach(s => {
                            console.log(`  - Sanction #${s.id}: User ${s.user_id} - ${s.type} (${s.is_active ? 'ACTIVE' : 'inactive'})`);
                        });
                    }

                    console.log('\n========================================');
                    console.log('✅ TEST TERMINÉ');
                    console.log('========================================\n');
                    console.log('Pour tester le système:');
                    console.log('1. Démarrez le serveur: node server.js');
                    console.log('2. Connectez-vous avec un compte admin (User ID 1)');
                    console.log('3. Accédez à: http://localhost:3000/moderation');
                    console.log('4. Pour signaler: Ajoutez le script report-user.js à vos pages');
                    console.log('\n');

                    db.close();
                });
            });
        });
    }, 500);
});
