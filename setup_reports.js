const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('🔧 Création du système de reports et modération...\n');

db.serialize(() => {
    // 1. Table des reports
    db.run(`
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reporter_id INTEGER NOT NULL,
            reported_id INTEGER NOT NULL,
            reason TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            resolved_at DATETIME,
            resolved_by INTEGER,
            resolution_note TEXT,
            FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (reported_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erreur table reports:', err);
        } else {
            console.log('✅ Table reports créée');
        }
    });

    // 2. Table des sanctions
    db.run(`
        CREATE TABLE IF NOT EXISTS sanctions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            reason TEXT NOT NULL,
            duration_hours INTEGER,
            issued_by INTEGER NOT NULL,
            issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME,
            is_active BOOLEAN DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erreur table sanctions:', err);
        } else {
            console.log('✅ Table sanctions créée');
        }
    });

    // 3. Ajouter colonne is_admin aux users
    db.all('PRAGMA table_info(users)', [], (err, columns) => {
        if (err) {
            console.error('❌ Erreur vérification users:', err);
            return;
        }

        const hasIsAdmin = columns.some(col => col.name === 'is_admin');
        const hasIsBanned = columns.some(col => col.name === 'is_banned');

        if (!hasIsAdmin) {
            db.run('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0', (err) => {
                if (err) {
                    console.error('❌ Erreur ajout is_admin:', err);
                } else {
                    console.log('✅ Colonne is_admin ajoutée');
                }
            });
        }

        if (!hasIsBanned) {
            db.run('ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT 0', (err) => {
                if (err) {
                    console.error('❌ Erreur ajout is_banned:', err);
                } else {
                    console.log('✅ Colonne is_banned ajoutée');
                }
            });
        }
    });

    // 4. Créer un index pour améliorer les performances
    db.run('CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status)', (err) => {
        if (err) {
            console.error('❌ Erreur index reports:', err);
        } else {
            console.log('✅ Index reports créé');
        }
    });

    db.run('CREATE INDEX IF NOT EXISTS idx_sanctions_active ON sanctions(user_id, is_active)', (err) => {
        if (err) {
            console.error('❌ Erreur index sanctions:', err);
        } else {
            console.log('✅ Index sanctions créé');
        }
    });

    // 5. Promouvoir le premier utilisateur en admin (pour tests)
    setTimeout(() => {
        db.run('UPDATE users SET is_admin = 1 WHERE id = 1', (err) => {
            if (err) {
                console.error('❌ Erreur promotion admin:', err);
            } else {
                console.log('✅ User ID 1 promu administrateur');
            }

            console.log('\n✅ Système de reports installé avec succès !');
            db.close();
        });
    }, 1000);
});
