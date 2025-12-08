// ====================================================
// FICHIER : server.js
// VERSION : Sécurisée (JWT + Sécurité + Rate Limiting + Logging)
// ====================================================

// Chargement des variables d'environnement
require('dotenv').config();

const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const compression = require('compression');

// Imports des modules de sécurité
const { logger, securityLogger, requestLogger, detectSuspiciousActivity } = require('./logger');
const {
    generalLimiter,
    authLimiter,
    registerLimiter,
    messageLimiter,
    friendRequestLimiter,
    matchSearchLimiter,
    bruteForceProtection
} = require('./rateLimiter');
const {
    authValidators,
    socialValidators,
    messageValidators,
    gameValidators,
    notificationValidators,
    userValidators
} = require('./validators');

// Initialisation Express
const app = express();

// CONFIGURATION DU PORT ET SECRETS
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_jwt_tres_longue_et_securisee_123456789';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

// ====================================================
// MIDDLEWARE DE SÉCURITÉ
// ====================================================

// 1. Helmet - Protection des headers HTTP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true
}));

// 2. CORS - Configuration sécurisée
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
    origin: function (origin, callback) {
        // Autoriser les requêtes sans origine (comme les apps mobiles ou curl)
        if (!origin) return callback(null, true);

        // En production (Railway), autoriser toutes les origines Railway
        if (process.env.NODE_ENV === 'production' && origin && origin.includes('railway.app')) {
            return callback(null, true);
        }

        // Vérifier si l'origine est dans la liste des origines autorisées
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (allowedOrigin.includes('*')) {
                // Support pour les wildcards (ex: https://*.railway.app)
                const pattern = allowedOrigin.replace(/\*/g, '.*');
                return new RegExp(`^${pattern}$`).test(origin);
            }
            return allowedOrigin === origin;
        });

        if (!isAllowed) {
            const msg = 'La politique CORS ne permet pas l\'accès depuis cette origine.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 heures
}));

// 3. Protection contre les attaques HTTP Parameter Pollution
app.use(hpp());

// 3b. Compression GZIP/Brotli pour am�liorer les performances Lighthouse
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6 // Niveau de compression (0-9)
}));

// 4. Limitation du taux de requêtes - DÉSACTIVÉ POUR LES TESTS
// app.use('/api/', generalLimiter);

// 5. Parsing JSON avec limite de taille
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. Logging des requêtes
app.use(requestLogger);

// 7. Détection d'activité suspecte
app.use(detectSuspiciousActivity);

// 8. Desactivation du cache
app.disable('etag');
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});

// 9. Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// ====================================================
// 1. BASE DE DONNÉES (SQLite) - AMÉLIORÉE POUR LA SYNCHRO CHAT
// ====================================================
// En production (Railway), utiliser le volume persistent
// En développement, utiliser le dossier local
const dbPath = process.env.NODE_ENV === 'production'
    ? '/app/data/database.sqlite'
    : (process.env.DATABASE_PATH || './database.sqlite');

console.log('📁 Chemin de la base de données:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erreur lors de l\'ouverture de la base de données:', err);
    } else {
        console.log('✅ Base de données ouverte avec succès:', dbPath);
    }
});
const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;

db.serialize(() => {
    // 1. Utilisateurs
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            accepted_charter BOOLEAN DEFAULT 0,
            charter_accepted_at DATETIME
        )
    `);

    // Migration: Ajouter les colonnes manquantes si elles n'existent pas
    db.all(`PRAGMA table_info(users)`, [], (err, columns) => {
        if (!err) {
            const hasAcceptedCharter = columns.some(col => col.name === 'accepted_charter');
            const hasCharterAcceptedAt = columns.some(col => col.name === 'charter_accepted_at');
            const hasIsAdmin = columns.some(col => col.name === 'is_admin');
            const hasIsBanned = columns.some(col => col.name === 'is_banned');

            if (!hasAcceptedCharter) {
                db.run(`ALTER TABLE users ADD COLUMN accepted_charter BOOLEAN DEFAULT 0`, (err) => {
                    if (err) {
                        console.error('Erreur ajout colonne accepted_charter:', err);
                    } else {
                        console.log('✅ Colonne accepted_charter ajoutée à la table users');
                    }
                });
            }

            if (!hasCharterAcceptedAt) {
                db.run(`ALTER TABLE users ADD COLUMN charter_accepted_at DATETIME`, (err) => {
                    if (err) {
                        console.error('Erreur ajout colonne charter_accepted_at:', err);
                    } else {
                        console.log('✅ Colonne charter_accepted_at ajoutée à la table users');
                    }
                });
            }

            if (!hasIsAdmin) {
                db.run(`ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0`, (err) => {
                    if (err) {
                        console.error('Erreur ajout colonne is_admin:', err);
                    } else {
                        console.log('Colonne is_admin ajoutee a la table users');
                    }
                });
            }

            if (!hasIsBanned) {
                db.run(`ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT 0`, (err) => {
                    if (err) {
                        console.error('Erreur ajout colonne is_banned:', err);
                    } else {
                        console.log('Colonne is_banned ajoutee a la table users');
                    }
                });
            }
        }
    });

    // 2. Demandes d'amis (Statuts : pending, accepted, rejected)
    db.run(`
        CREATE TABLE IF NOT EXISTS friend_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // 3. Messages (Chat) - AMÉLIORÉ POUR LA SYNCHRONISATION
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_read BOOLEAN DEFAULT 0,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Migration: Ajouter la colonne is_read si elle n'existe pas
    db.run(`
        PRAGMA table_info(messages)
    `, [], (err, rows) => {
        if (!err) {
            db.all(`PRAGMA table_info(messages)`, [], (err, columns) => {
                if (!err) {
                    const hasIsRead = columns.some(col => col.name === 'is_read');
                    if (!hasIsRead) {
                        db.run(`ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT 0`, (err) => {
                            if (err) {
                                console.error('Erreur ajout colonne is_read:', err);
                            } else {
                                console.log('✅ Colonne is_read ajoutée à la table messages');
                            }
                        });
                    }
                }
            });
        }
    });

    // 4. Paramètres spécifiques aux jeux (Rang actuel, Mode principal, Options)
    db.run(`
        CREATE TABLE IF NOT EXISTS game_settings (
            user_id INTEGER NOT NULL,
            game_id TEXT NOT NULL,
            rank TEXT,
            mainMode TEXT,
            options TEXT, -- JSON string for dynamic options like 'Vocal Obligatoire'
            role TEXT, -- For LoL: Top, Jungle, Mid, ADC, Support
            style TEXT, -- For LoL: Chill, Try Hard
            PRIMARY KEY (user_id, game_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Migration: Ajouter les colonnes role et style si elles n'existent pas
    db.all(`PRAGMA table_info(game_settings)`, [], (err, columns) => {
        if (!err) {
            const hasRole = columns.some(col => col.name === 'role');
            const hasStyle = columns.some(col => col.name === 'style');

            if (!hasRole) {
                db.run(`ALTER TABLE game_settings ADD COLUMN role TEXT`, (err) => {
                    if (err) {
                        console.error('Erreur ajout colonne role:', err);
                    } else {
                        console.log('✅ Colonne role ajoutée à la table game_settings');
                    }
                });
            }

            if (!hasStyle) {
                db.run(`ALTER TABLE game_settings ADD COLUMN style TEXT`, (err) => {
                    if (err) {
                        console.error('Erreur ajout colonne style:', err);
                    } else {
                        console.log('✅ Colonne style ajoutée à la table game_settings');
                    }
                });
            }
        }
    });

    // 5. Préférences de recherche de partenaire (Rangs préférés, Tolérance, Rôle et Style pour LoL)
    db.run(`
        CREATE TABLE IF NOT EXISTS partner_preferences (
            user_id INTEGER PRIMARY KEY,
            prefRanks TEXT, -- JSON string for preferred ranks array
            rankTolerance INTEGER DEFAULT 1,
            prefRole TEXT, -- For LoL: Preferred partner role
            prefStyle TEXT, -- For LoL: Preferred partner style
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Migration: Ajouter les colonnes prefRole et prefStyle si elles n'existent pas
    db.all(`PRAGMA table_info(partner_preferences)`, [], (err, columns) => {
        if (!err) {
            const hasPrefRole = columns.some(col => col.name === 'prefRole');
            const hasPrefStyle = columns.some(col => col.name === 'prefStyle');

            if (!hasPrefRole) {
                db.run(`ALTER TABLE partner_preferences ADD COLUMN prefRole TEXT`, (err) => {
                    if (err) {
                        console.error('Erreur ajout colonne prefRole:', err);
                    } else {
                        console.log('✅ Colonne prefRole ajoutée à la table partner_preferences');
                    }
                });
            }

            if (!hasPrefStyle) {
                db.run(`ALTER TABLE partner_preferences ADD COLUMN prefStyle TEXT`, (err) => {
                    if (err) {
                        console.error('Erreur ajout colonne prefStyle:', err);
                    } else {
                        console.log('✅ Colonne prefStyle ajoutée à la table partner_preferences');
                    }
                });
            }
        }
    });

    // 6. Notifications
    db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL, -- 'friend_request', 'new_message', 'match_found'
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            related_id INTEGER, -- ID de l'utilisateur concerné
            is_read BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // 7. Sessions utilisateur pour la synchronisation (Nouvelle table)
    db.run(`
        CREATE TABLE IF NOT EXISTS user_sessions (
            user_id INTEGER PRIMARY KEY,
            last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
            active_chats TEXT, -- JSON string des chats actifs
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // 8. Reports utilisateurs
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
    `);

    // 9. Sanctions
    db.run(`
        CREATE TABLE IF NOT EXISTS sanctions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL, -- warning, suspension, ban
            reason TEXT NOT NULL,
            duration_hours INTEGER,
            issued_by INTEGER,
            issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME,
            is_active BOOLEAN DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    // 10. Messages de contact
    db.run(`
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending', -- pending, read, replied
            replied_at DATETIME,
            replied_by INTEGER,
            FOREIGN KEY (replied_by) REFERENCES users(id) ON DELETE SET NULL
        )
    `);
});

// ====================================================
// 2. MIDDLEWARE JWT D'AUTHENTIFICATION
// ====================================================

/**
 * Met à jour l'activité de l'utilisateur
 */
function updateUserActivity(userId) {
    db.run(`
        INSERT OR REPLACE INTO user_sessions (user_id, last_activity)
        VALUES (?, datetime('now'))
    `, [userId]);
}

/**
 * Middleware pour vérifier le jeton JWT dans le header Authorization.
 */
function isAuthenticated(req, res, next) {
    const authHeader = req.headers.authorization;
    const ip = req.ip || req.connection.remoteAddress;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        securityLogger.logUnauthorizedAccess(ip, req.path, null);
        return res.status(401).json({ error: 'unauthorized', message: 'Token manquant ou format invalide.' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Token invalide ou expiré
            securityLogger.logUnauthorizedAccess(ip, req.path, token);
            return res.status(401).json({ error: 'unauthorized', message: 'Token invalide ou expiré.' });
        }

        // Stocker les infos utilisateur décodées dans req.user
        req.user = user;

        // Mettre à jour l'activité de l'utilisateur
        updateUserActivity(user.id);

        next();
    });
}

// ====================================================
// FONCTIONS UTILITAIRES POUR CRÉER DES NOTIFICATIONS
// ====================================================

function createNotification(userId, type, title, message, relatedId = null) {
    db.run(`
        INSERT INTO notifications (user_id, type, title, message, related_id, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [userId, type, title, message, relatedId], function(err) {
        if (err) {
            console.error('Erreur création notification:', err);
        }
    });
}

// ====================================================
// NOUVELLES FONCTIONS POUR LA SYNCHRONISATION DU CHAT
// ====================================================

/**
 * Met à jour la session utilisateur pour le suivi des chats actifs
 */
function updateUserSession(userId, activeChats = {}) {
    const activeChatsJson = JSON.stringify(activeChats);
    db.run(`
        INSERT OR REPLACE INTO user_sessions (user_id, last_activity, active_chats)
        VALUES (?, CURRENT_TIMESTAMP, ?)
    `, [userId, activeChatsJson], function(err) {
        if (err) {
            console.error('Erreur mise à jour session utilisateur:', err);
        }
    });
}

/**
 * Récupère les messages non lus pour un utilisateur
 */
function getUnreadMessagesCount(userId, callback) {
    db.get(`
        SELECT COUNT(*) as unread_count 
        FROM messages 
        WHERE receiver_id = ? AND is_read = 0
    `, [userId], (err, result) => {
        if (err) {
            console.error('Erreur récupération messages non lus:', err);
            return callback(0);
        }
        callback(result.unread_count);
    });
}

// ====================================================
// ROUTES POUR LES NOTIFICATIONS - AMÉLIORÉES
// ====================================================

// Récupérer les notifications non lues
app.get('/api/notifications', isAuthenticated, (req, res) => {
    const userId = req.user.id;
    
    db.all(`
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC
        LIMIT 20
    `, [userId], (err, notifications) => {
        if (err) {
            console.error('Erreur récupération notifications:', err);
            return res.status(500).json({ error: 'server_error' });
        }
        res.json(notifications);
    });
});

// Marquer une notification comme lue
app.post('/api/notifications/:id/read', isAuthenticated, notificationValidators.markAsRead, (req, res) => {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    db.run(`
        UPDATE notifications 
        SET is_read = 1 
        WHERE id = ? AND user_id = ?
    `, [notificationId, userId], function(err) {
        if (err) {
            console.error('Erreur marquer notification lue:', err);
            return res.status(500).json({ error: 'server_error' });
        }
        res.json({ success: true });
    });
});

// Marquer toutes les notifications comme lues
app.post('/api/notifications/read-all', isAuthenticated, (req, res) => {
    const userId = req.user.id;
    
    db.run(`
        UPDATE notifications 
        SET is_read = 1 
        WHERE user_id = ? AND is_read = 0
    `, [userId], function(err) {
        if (err) {
            console.error('Erreur marquer toutes notifications lues:', err);
            return res.status(500).json({ error: 'server_error' });
        }
        res.json({ success: true });
    });
});

// Route pour récupérer les infos d'un utilisateur par ID (pour les notifications)
app.get('/api/user/:id', isAuthenticated, userValidators.getUserById, (req, res) => {
    const userId = req.params.id;
    
    db.get('SELECT id, username FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            console.error('Erreur récupération utilisateur:', err);
            return res.status(500).json({ error: 'server_error' });
        }
        if (!user) {
            return res.status(404).json({ error: 'user_not_found' });
        }
        res.json(user);
    });
});

// ====================================================
// ROUTES POUR SERVIR LES PAGES HTML
// ====================================================

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'game.html'));
});

// Route pour la page de connexion
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Route pour la page d'inscription
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

// Route pour le tableau de bord
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Route pour la page du jeu (alternative)
app.get('/game/:gameId', (req, res) => {
    res.sendFile(path.join(__dirname, 'game.html'));
});

// Route pour la page de mod�ration
app.get('/moderation', (req, res) => {
    res.sendFile(path.join(__dirname, 'moderation.html'));
});

// ====================================================
// ROUTE DE DÉCONNEXION
// ====================================================

// Route pour la déconnexion
app.get('/logout', (req, res) => {
    res.redirect('/');
});

// Route API pour la déconnexion (optionnelle)
app.post('/api/logout', isAuthenticated, (req, res) => {
    const userId = req.user.id;
    
    // Nettoyer la session utilisateur lors de la déconnexion
    db.run('DELETE FROM user_sessions WHERE user_id = ?', [userId], (err) => {
        if (err) {
            console.error('Erreur nettoyage session:', err);
        }
        
        res.json({ 
            success: true, 
            message: 'Déconnexion réussie',
            redirect: '/'
        });
    });
});

// ====================================================
// 3. ROUTES D'AUTHENTIFICATION ET DE BASE
// ====================================================

// Route d'enregistrement (Registration) avec rate limiting et validation
app.post('/register', registerLimiter, authValidators.register, (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'missing_fields' });
    }

    // Hachage du mot de passe
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error('Erreur de hachage:', err);
            return res.status(500).json({ error: 'server_error' });
        }

        // Insertion de l'utilisateur dans la DB
        db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'user_exists' });
                }
                console.error('Erreur d\'enregistrement:', err);
                return res.status(500).json({ error: 'server_error' });
            }

            // Génération du JWT pour l'utilisateur nouvellement créé
            const token = jwt.sign({ id: this.lastID, username, email }, JWT_SECRET, { expiresIn: '24h' });
            
            // Créer une session utilisateur
            updateUserSession(this.lastID, {});
            
            res.json({ 
                token, 
                username,
                user_id: this.lastID,
                redirect: '/dashboard' // Indication de redirection pour le front-end
            });
        });
    });
});

// Route d'inscription alternative (signup) pour compatibilité avec validation
app.post('/signup', registerLimiter, authValidators.register, (req, res) => {
    const { username, email, password, acceptedCharter } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'missing_fields' });
    }

    // Vérification de l'acceptation de la charte
    if (!acceptedCharter) {
        return res.status(400).json({ error: 'charter_not_accepted', message: 'Vous devez accepter la Charte de la communauté pour vous inscrire.' });
    }

    // Hachage du mot de passe
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error('Erreur de hachage:', err);
            return res.status(500).json({ error: 'server_error' });
        }

        // Insertion de l'utilisateur dans la DB avec l'acceptation de la charte
        const charterAcceptedAt = new Date().toISOString();
        db.run('INSERT INTO users (username, email, password, accepted_charter, charter_accepted_at) VALUES (?, ?, ?, ?, ?)',
            [username, email, hash, 1, charterAcceptedAt], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'user_exists' });
                }
                console.error('Erreur d\'enregistrement:', err);
                return res.status(500).json({ error: 'server_error' });
            }

            // Génération du JWT pour l'utilisateur nouvellement créé
            const token = jwt.sign({ id: this.lastID, username, email }, JWT_SECRET, { expiresIn: '24h' });

            // Créer une session utilisateur
            updateUserSession(this.lastID, {});

            res.json({
                token,
                username,
                user_id: this.lastID,
                redirect: '/dashboard' // Indication de redirection pour le front-end
            });
        });
    });
});

// Route de connexion (Login) avec protection brute force
app.post('/login', authLimiter, authValidators.login, (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!email || !password) {
        return res.status(400).json({ error: 'missing_fields' });
    }

    // Vérifier si le compte est verrouillé
    const lockStatus = bruteForceProtection.isLocked(email);
    if (lockStatus) {
        securityLogger.logFailedLogin(email, ip, 'account_locked');
        return res.status(423).json({
            error: 'account_locked',
            message: `Compte temporairement verrouillé. Réessayez dans ${lockStatus.remainingTime} minute(s).`
        });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
        securityLogger.logSqlError(ip, '/login', err);
        logger.error('Erreur de login:', err);
        return res.status(500).json({ error: 'server_error' });
    }

    if (!user) {
        const bruteForceStatus = bruteForceProtection.recordFailedAttempt(email, ip);
        securityLogger.logFailedLogin(email, ip, 'user_not_found');

        if (bruteForceStatus.locked) {
            return res.status(423).json({
                error: 'account_locked',
                message: 'Trop de tentatives echouees. Compte temporairement verrouille.'
            });
        }

        return res.status(401).json({ error: 'invalid_credentials' });
    }

    // Bloquer si banni ou suspendu avant la comparaison du mot de passe
    checkUserStatus(user.id, (status) => {
        if (status.banned) {
            purgeUserFromFriends(user.id);
            return res.status(403).json({ error: 'banned', message: 'Compte banni.' });
        }
        if (status.suspended) {
            const until = status.sanction?.expires_at || null;
            return res.status(403).json({
                error: 'suspended',
                message: until ? `Compte suspendu jusqu'au ${until}` : 'Compte suspendu.',
                expires_at: until
            });
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                logger.error('Erreur de comparaison de mot de passe:', err);
                return res.status(500).json({ error: 'server_error' });
            }

            if (result) {
                bruteForceProtection.resetAttempts(email);

                const token = jwt.sign(
                    { id: user.id, username: user.username, email: user.email },
                    JWT_SECRET,
                    { expiresIn: JWT_EXPIRATION }
                );

                updateUserSession(user.id, {});
                securityLogger.logSuccessfulLogin(user.id, user.username, ip);

                res.json({
                    token,
                    username: user.username,
                    user_id: user.id,
                    redirect: '/dashboard'
                });
            } else {
                const bruteForceStatus = bruteForceProtection.recordFailedAttempt(email, ip);
                securityLogger.logFailedLogin(email, ip, 'wrong_password');

                if (bruteForceStatus.locked) {
                    return res.status(423).json({
                        error: 'account_locked',
                        message: 'Trop de tentatives echouees. Compte temporairement verrouille.'
                    });
                }

                res.status(401).json({
                    error: 'invalid_credentials',
                    attemptsRemaining: bruteForceStatus.attemptsRemaining
                });
            }
        });
    });
    });
});
app.get('/api/friends', isAuthenticated, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT 
            U.username, 
            FR.status,
            CASE
                WHEN FR.sender_id = ? THEN 'outgoing'
                WHEN FR.receiver_id = ? THEN 'incoming'
                ELSE 'accepted'
            END AS type
        FROM friend_requests FR
        JOIN users U ON 
            CASE 
                WHEN FR.sender_id = ? THEN FR.receiver_id 
                ELSE FR.sender_id 
            END = U.id
        WHERE FR.sender_id = ? OR FR.receiver_id = ?
    `;

    db.all(sql, [userId, userId, userId, userId, userId], (err, requests) => {
        if (err) {
            console.error('Erreur GET /api/friends:', err);
            return res.status(500).json({ error: 'server_error' });
        }

        const friends = requests.filter(r => r.status === 'accepted');
        const incoming = requests.filter(r => r.status === 'pending' && r.type === 'incoming');
        const outgoing = requests.filter(r => r.status === 'pending' && r.type === 'outgoing');

        res.json({
            currentUser: { id: userId, username: req.user.username },
            friends,
            incomingRequests: incoming,
            outgoingRequests: outgoing
        });
    });
});

// POST /api/friends/send : Envoyer une demande d'ami AVEC NOTIFICATION
app.post('/api/friends/send', isAuthenticated, friendRequestLimiter, socialValidators.sendFriendRequest, (req, res) => {
    const { receiverUsername } = req.body;
    const senderId = req.user.id;
    const senderUsername = req.user.username;

    if (receiverUsername === senderUsername) {
        return res.status(400).json({ error: 'cannot_add_self', message: 'Vous ne pouvez pas vous ajouter vous-même.' });
    }

    // 1. Trouver l'ID du destinataire (insensible à la casse)
    db.get('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [receiverUsername], (err, receiver) => {
        if (err) return res.status(500).json({ error: 'server_error' });
        if (!receiver) return res.status(404).json({ error: 'user_not_found', message: 'Utilisateur introuvable.' });
        
        const receiverId = receiver.id;

        // 2. Vérifier si une relation existe déjà (friend, pending)
        const checkSql = `
            SELECT status FROM friend_requests 
            WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        `;
        db.get(checkSql, [senderId, receiverId, receiverId, senderId], (err, existing) => {
            if (err) return res.status(500).json({ error: 'server_error' });

            if (existing) {
                if (existing.status === 'accepted') {
                    return res.status(409).json({ error: 'already_friends', message: 'Vous êtes déjà amis.' });
                }
                if (existing.status === 'pending') {
                    return res.status(409).json({ error: 'already_pending', message: 'Une demande est déjà en attente.' });
                }
            }

            // 3. Insérer la nouvelle demande
            db.run('INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, ?)', [senderId, receiverId, 'pending'], function(err) {
                if (err) {
                    console.error('Erreur POST /api/friends/send:', err);
                    return res.status(500).json({ error: 'server_error' });
                }
                
                // CRÉATION DE LA NOTIFICATION
                createNotification(
                    receiverId,
                    'friend_request',
                    'Nouvelle demande d\'ami',
                    `${senderUsername} vous a envoyé une demande d'ami`,
                    senderId
                );

                res.json({ message: 'Demande d\'ami envoyée.', receiverUsername });
            });
        });
    });
});

// POST /api/friends/respond : Répondre à une demande (accept/reject)
app.post('/api/friends/respond', isAuthenticated, socialValidators.respondToRequest, (req, res) => {
    const { senderUsername, action } = req.body;
    const receiverId = req.user.id;
    const receiverUsername = req.user.username;

    if (!['accept', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'invalid_action' });
    }

    db.get('SELECT id FROM users WHERE username = ?', [senderUsername], (err, sender) => {
        if (err) return res.status(500).json({ error: 'server_error' });
        if (!sender) return res.status(404).json({ error: 'sender_not_found' });
        
        const senderId = sender.id;
        const newStatus = action === 'accept' ? 'accepted' : 'rejected';

        const updateSql = `
            UPDATE friend_requests 
            SET status = ? 
            WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'
        `;

        db.run(updateSql, [newStatus, senderId, receiverId], function(err) {
            if (err) {
                console.error('Erreur POST /api/friends/respond:', err);
                return res.status(500).json({ error: 'server_error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'request_not_found' });
            }

            // CRÉATION DE LA NOTIFICATION POUR L'ACCEPTATION
            if (action === 'accept') {
                createNotification(
                    senderId,
                    'friend_request',
                    'Demande d\'ami acceptée',
                    `${receiverUsername} a accepté votre demande d'ami`,
                    receiverId
                );
            }

            res.json({ message: `Demande de ${senderUsername} ${action === 'accept' ? 'acceptée' : 'rejetée'}.` });
        });
    });
});

// DELETE /api/friends/remove : Retirer un ami de sa liste
app.delete('/api/friends/remove', isAuthenticated, socialValidators.removeFriend, (req, res) => {
    const { friendUsername } = req.body;
    const userId = req.user.id;
    const username = req.user.username;

    if (!friendUsername) {
        return res.status(400).json({ error: 'missing_username', message: 'Nom d\'utilisateur manquant.' });
    }

    // 1. Trouver l'ID de l'ami
    db.get('SELECT id FROM users WHERE username = ?', [friendUsername], (err, friend) => {
        if (err) return res.status(500).json({ error: 'server_error' });
        if (!friend) return res.status(404).json({ error: 'user_not_found', message: 'Utilisateur introuvable.' });

        const friendId = friend.id;

        // 2. Supprimer la relation d'amitié (dans les deux sens)
        const deleteSql = `
            DELETE FROM friend_requests
            WHERE status = 'accepted' AND (
                (sender_id = ? AND receiver_id = ?) OR
                (sender_id = ? AND receiver_id = ?)
            )
        `;

        db.run(deleteSql, [userId, friendId, friendId, userId], function(err) {
            if (err) {
                console.error('Erreur DELETE /api/friends/remove:', err);
                return res.status(500).json({ error: 'server_error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'friendship_not_found', message: 'Relation d\'amitié introuvable.' });
            }

            // 3. Création de la notification pour informer l'autre utilisateur
            createNotification(
                friendId,
                'friend_request',
                'Ami retiré',
                `${username} vous a retiré de sa liste d'amis`,
                userId
            );

            res.json({ message: `${friendUsername} a été retiré de votre liste d'amis.` });
        });
    });
});

// ====================================================
// ROUTES POUR LA SYNCHRONISATION DU CHAT - AMÉLIORÉES
// ====================================================

// GET /api/messages/:username : Récupérer l'historique de chat AVEC SYNCHRONISATION
app.get('/api/messages/:username', isAuthenticated, messageValidators.getMessages, (req, res) => {
    const userA_id = req.user.id;
    const userB_username = req.params.username;

    db.get('SELECT id FROM users WHERE username = ?', [userB_username], (err, userB) => {
        if (err) {
            console.error('Erreur récupération utilisateur:', err);
            return res.status(500).json({ error: 'server_error' });
        }
        if (!userB) return res.status(404).json({ error: 'user_not_found' });
        
        const userB_id = userB.id;

        // Marquer les messages comme lus lors de la récupération
        db.run(`
            UPDATE messages 
            SET is_read = 1 
            WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
        `, [userB_id, userA_id], function(err) {
            if (err) {
                console.error('Erreur marquage messages lus:', err);
            }
        });

        const sql = `
            SELECT 
                M.id,
                M.sender_id, 
                M.receiver_id,
                M.content, 
                M.timestamp,
                M.is_read,
                U1.username as sender_username,
                U2.username as receiver_username
            FROM messages M
            JOIN users U1 ON M.sender_id = U1.id
            JOIN users U2 ON M.receiver_id = U2.id
            WHERE (M.sender_id = ? AND M.receiver_id = ?) 
               OR (M.sender_id = ? AND M.receiver_id = ?)
            ORDER BY M.timestamp ASC
        `;

        db.all(sql, [userA_id, userB_id, userB_id, userA_id], (err, messages) => {
            if (err) {
                console.error('Erreur GET /api/messages:', err);
                return res.status(500).json({ error: 'server_error' });
            }
            res.json(messages);
        });
    });
});

// POST /api/messages : Envoyer un message AVEC NOTIFICATION ET SYNCHRONISATION
app.post('/api/messages', isAuthenticated, messageLimiter, messageValidators.sendMessage, (req, res) => {
    const { toUsername, content } = req.body;
    const senderId = req.user.id;
    const senderUsername = req.user.username;

    if (!toUsername || !content) {
        return res.status(400).json({ error: 'missing_fields', message: 'Destinataire et contenu requis' });
    }

    db.get('SELECT id FROM users WHERE username = ?', [toUsername], (err, receiver) => {
        if (err) {
            console.error('Erreur récupération destinataire:', err);
            return res.status(500).json({ error: 'server_error' });
        }
        if (!receiver) return res.status(404).json({ error: 'user_not_found', message: 'Destinataire non trouvé' });
        
        const receiverId = receiver.id;

        db.run('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)', 
        [senderId, receiverId, content], function(err) {
            if (err) {
                console.error('Erreur POST /api/messages:', err);
                return res.status(500).json({ error: 'server_error' });
            }

            // Récupérer le message complet avec les usernames pour la synchronisation
            db.get(`
                SELECT 
                    M.id,
                    M.sender_id, 
                    M.receiver_id,
                    M.content, 
                    M.timestamp,
                    M.is_read,
                    U1.username as sender_username,
                    U2.username as receiver_username
                FROM messages M
                JOIN users U1 ON M.sender_id = U1.id
                JOIN users U2 ON M.receiver_id = U2.id
                WHERE M.id = ?
            `, [this.lastID], (err, newMessage) => {
                if (err) {
                    console.error('Erreur récupération message:', err);
                    // On retourne quand même un succès même si la récupération échoue
                    return res.json({ 
                        id: this.lastID,
                        sender_id: senderId,
                        receiver_id: receiverId,
                        content: content,
                        timestamp: new Date().toISOString(),
                        is_read: 0,
                        sender_username: senderUsername,
                        receiver_username: toUsername,
                        message: 'Message envoyé avec succès'
                    });
                }

                // CRÉATION DE LA NOTIFICATION
                createNotification(
                    receiverId,
                    'new_message',
                    'Nouveau message',
                    `${senderUsername} vous a envoyé un message`,
                    senderId
                );

                // Mettre à jour la session du destinataire pour refléter le nouveau message
                getUnreadMessagesCount(receiverId, (unreadCount) => {
                    // On pourrait envoyer une notification en temps réel ici
                    console.log(`Nouveau message pour ${toUsername}, messages non lus: ${unreadCount}`);
                });

                res.json(newMessage);
            });
        });
    });
});

// NOUVELLE ROUTE : Récupérer les statistiques de chat (messages non lus, etc.)
app.get('/api/chat/stats', isAuthenticated, (req, res) => {
    const userId = req.user.id;
    
    getUnreadMessagesCount(userId, (unreadCount) => {
        // Récupérer également les conversations récentes
        db.all(`
            SELECT 
                CASE 
                    WHEN M.sender_id = ? THEN M.receiver_id 
                    ELSE M.sender_id 
                END as other_user_id,
                U.username as other_username,
                MAX(M.timestamp) as last_message_time,
                COUNT(CASE WHEN M.receiver_id = ? AND M.is_read = 0 THEN 1 END) as unread_count
            FROM messages M
            JOIN users U ON CASE 
                WHEN M.sender_id = ? THEN M.receiver_id 
                ELSE M.sender_id 
            END = U.id
            WHERE M.sender_id = ? OR M.receiver_id = ?
            GROUP BY other_user_id
            ORDER BY last_message_time DESC
            LIMIT 10
        `, [userId, userId, userId, userId, userId], (err, conversations) => {
            if (err) {
                console.error('Erreur récupération conversations:', err);
                return res.status(500).json({ error: 'server_error' });
            }
            
            res.json({
                unread_total: unreadCount,
                conversations: conversations
            });
        });
    });
});

// ====================================================
// 5. ROUTES API DE JEU ET MATCHMAKING (COMPLET)
// ====================================================

// --- UTILS : MAPPING DES RANKS ---
const RANK_MAP = {
    // Valorant (25 rangs)
    'fer1': 1, 'fer2': 2, 'fer3': 3,
    'bronze1': 4, 'bronze2': 5, 'bronze3': 6,
    'argent1': 7, 'argent2': 8, 'argent3': 9,
    'or1': 10, 'or2': 11, 'or3': 12,
    'platine1': 13, 'platine2': 14, 'platine3': 15,
    'diamant1': 16, 'diamant2': 17, 'diamant3': 18,
    'ascendant_1': 19, 'ascendant_2': 20, 'ascendant_3': 21,
    'immortal_1': 22, 'immortal_2': 23, 'immortal_3': 24,
    'radiant': 25,

    // League of Legends (10 rangs)
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
    return RANK_MAP[rankId.toLowerCase()] || 0;
}

/**
 * GET /api/user/profile
 * Récupère les données complètes de l'utilisateur (Settings + Preferences)
 */
app.get('/api/user/profile', isAuthenticated, userValidators.getProfile, (req, res) => {
    const userId = req.user.id;
    const gameId = req.query.gameId || 'valorant'; 

    // 1. Récupérer les settings de jeu (Rang/Mode)
    db.get('SELECT * FROM game_settings WHERE user_id = ? AND game_id = ?', [userId, gameId], (err, settings) => {
        if (err) {
            console.error('Erreur GET /api/user/profile (settings):', err);
            return res.status(500).json({ error: 'server_error' });
        }
        
        const gameSettings = settings ? {
            rank: settings.rank,
            mainMode: settings.mainMode,
            options: settings.options ? JSON.parse(settings.options) : [],
            role: settings.role || null,
            style: settings.style || null,
        } : { rank: null, mainMode: null, options: [], role: null, style: null };

        // 2. Récupérer les préférences de partenaire (Tolérance/Rangs préférés)
        db.get('SELECT * FROM partner_preferences WHERE user_id = ?', [userId], (err, prefs) => {
            if (err) {
                console.error('Erreur GET /api/user/profile (prefs):', err);
                return res.status(500).json({ error: 'server_error' });
            }
            
            const partnerPreferences = prefs ? {
                prefRanks: prefs.prefRanks ? JSON.parse(prefs.prefRanks) : [],
                rankTolerance: prefs.rankTolerance,
                prefRole: prefs.prefRole || null,
                prefStyle: prefs.prefStyle || null,
            } : { prefRanks: [], rankTolerance: 1, prefRole: null, prefStyle: null };
            
            res.json({ 
                id: userId, // Ajout de l'ID pour le front-end
                username: req.user.username,
                gameSettings, 
                partnerPreferences 
            });
        });
    });
});

/**
 * POST /api/game/settings
 * Sauvegarde les settings de jeu (Rang, Mode, Options, Role, Style)
 */
app.post('/api/game/settings', isAuthenticated, gameValidators.saveSettings, (req, res) => {
    const { gameId, rank, mainMode, options, role, style } = req.body;
    const userId = req.user.id;

    if (!gameId || !rank || !mainMode) {
        return res.status(400).json({ error: 'gameId, rank et mainMode sont requis' });
    }

    const optionsJson = JSON.stringify(options || []);

    const sql = `
        INSERT OR REPLACE INTO game_settings (user_id, game_id, rank, mainMode, options, role, style)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [userId, gameId, rank, mainMode, optionsJson, role || null, style || null], function(err) {
        if (err) {
            console.error('Erreur POST /api/game/settings:', err);
            return res.status(500).json({ error: 'server_error' });
        }
        res.json({ message: 'Paramètres de jeu sauvegardés avec succès.' });
    });
});

/**
 * POST /api/game/preferences
 * Sauvegarde les préférences de partenaire (Rangs préférés, Tolérance, Rôle et Style)
 */
app.post('/api/game/preferences', isAuthenticated, gameValidators.savePreferences, (req, res) => {
    const { prefRanks, rankTolerance, prefRole, prefStyle } = req.body;
    const userId = req.user.id;

    const prefRanksJson = JSON.stringify(prefRanks || []);

    const sql = `
        INSERT OR REPLACE INTO partner_preferences (user_id, prefRanks, rankTolerance, prefRole, prefStyle)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [userId, prefRanksJson, rankTolerance ?? 1, prefRole || null, prefStyle || null], function(err) {
        if (err) {
            console.error('Erreur POST /api/game/preferences:', err);
            return res.status(500).json({ error: 'server_error' });
        }
        res.json({ message: 'Préférences de partenaire sauvegardées avec succès.' });
    });
});

/**
 * GET /api/match/search/:gameId
 * Algorithme de recherche de partenaire.
 */
app.get('/api/match/search/:gameId', isAuthenticated, matchSearchLimiter, gameValidators.searchMatch, async (req, res) => {
    const userId = req.user.id;
    const gameId = req.params.gameId;
    
    const [A_settings, A_prefs] = await new Promise((resolve) => {
        db.get('SELECT * FROM game_settings WHERE user_id = ? AND game_id = ?', [userId, gameId], (err, settings) => {
            db.get('SELECT * FROM partner_preferences WHERE user_id = ?', [userId], (err, prefs) => {
                if (err || !settings) {
                    return resolve([null, null]);
                }
                resolve([{
                    rank: settings.rank,
                    mainMode: settings.mainMode,
                    options: settings.options ? JSON.parse(settings.options) : [],
                    role: settings.role || null,
                    style: settings.style || null,
                }, {
                    prefRanks: prefs && prefs.prefRanks ? JSON.parse(prefs.prefRanks) : [],
                    rankTolerance: prefs ? prefs.rankTolerance : 1,
                    prefRole: prefs ? prefs.prefRole : null,
                    prefStyle: prefs ? prefs.prefStyle : null,
                }]);
            });
        });
    });

    if (!A_settings || !A_settings.rank || !A_settings.mainMode) {
        console.log(`[MATCHMAKING] User ${userId} manque de settings pour ${gameId}`);
        return res.status(400).json({
            error: 'settings_missing',
            message: 'Veuillez d\'abord sauvegarder votre rang et votre mode de jeu.'
        });
    }

    const A_rankValue = getRankValue(A_settings.rank);
    const A_tolerance = A_prefs.rankTolerance ?? 1;
    const A_minRank = A_rankValue - A_tolerance;
    const A_maxRank = A_rankValue + A_tolerance;

    console.log(`[MATCHMAKING] User ${userId} cherche des partenaires:`, {
        gameId,
        rank: A_settings.rank,
        rankValue: A_rankValue,
        mainMode: A_settings.mainMode,
        tolerance: A_tolerance,
        rankRange: [A_minRank, A_maxRank],
        options: A_settings.options,
        role: A_settings.role,
        style: A_settings.style,
        prefRole: A_prefs.prefRole,
        prefStyle: A_prefs.prefStyle
    });

    // Construction de la clause WHERE pour les options
    let optionsWhereClause = '';
    const optionsParams = [];

    if (A_settings.options.length > 0) {
        // Pour chaque option de A, on cherche les utilisateurs B qui ont AUSSI cette option
        optionsWhereClause = A_settings.options.map(opt => {
            optionsParams.push(`%"${opt}"%`);
            return 'B.options LIKE ?';
        }).join(' AND ');
    } else {
        // Si A n'a pas d'options spécifiques, on accepte tout le monde
        optionsWhereClause = '1=1';
    }

    console.log(`[MATCHMAKING SQL] optionsWhereClause: ${optionsWhereClause}`);
    console.log(`[MATCHMAKING SQL] optionsParams:`, optionsParams);

    const sql = `
        SELECT
            U.id AS user_id,
            U.username,
            B.rank,
            B.mainMode,
            B.options,
            B.role,
            B.style,
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

    const params = [
        userId,
        userId,
        userId,
        gameId,
        A_settings.mainMode,
        ...optionsParams
    ];

    console.log(`[MATCHMAKING SQL] SQL Query:`, sql);
    console.log(`[MATCHMAKING SQL] Params:`, params);

    db.all(sql, params, (err, potentialMatches) => {
        if (err) {
            console.error('Erreur GET /api/match/search:', err);
            return res.status(500).json({ error: 'server_error' });
        }

        console.log(`[MATCHMAKING] ${potentialMatches.length} matches potentiels trouvés:`, potentialMatches.map(m => ({
            username: m.username,
            rank: m.rank,
            mainMode: m.mainMode
        })));

        const finalMatches = potentialMatches.filter(match => {
            const B_rankValue = getRankValue(match.rank);

            const B_tolerance = match.B_rankTolerance ?? 1;
            const B_prefRanks = match.B_prefRanks ? JSON.parse(match.B_prefRanks) : [];

            // TOLÉRANCE UNILATÉRALE : Seule la tolérance de celui qui cherche (A) compte
            // Le rang de B doit être dans la tolérance de A
            const prefRankValues = (A_prefs.prefRanks || []).map(r => getRankValue(r)).filter(Boolean);
            const rankMatch = prefRankValues.length > 0
                ? prefRankValues.some(val => B_rankValue >= (val - A_tolerance) && B_rankValue <= (val + A_tolerance))
                : (B_rankValue >= A_minRank && B_rankValue <= A_maxRank);

            // 4. Vérification du rôle (LoL) - si défini par l'utilisateur
            const roleMatch = !A_settings.role || !match.role || A_settings.role === match.role;

            // 5. Vérification du style (LoL) - si défini par l'utilisateur
            const desiredStyle = A_settings.style || A_prefs.prefStyle || null;
            const styleMatch = !desiredStyle || !match.style || desiredStyle === match.style;

            // 6. Vérification des préférences de rôle du partenaire (LoL) - si définies
            const partnerRoleMatch = !A_prefs.prefRole || !match.role || A_prefs.prefRole === match.role;

            // 7. Vérification des préférences de style du partenaire (LoL) - si définies
            const partnerStyleMatch = styleMatch;

            const result = rankMatch && roleMatch && styleMatch && partnerRoleMatch && partnerStyleMatch;

            // Log détaillé pour chaque candidat
            console.log(`[MATCHMAKING] Candidat ${match.username}:`, {
                rank: match.rank,
                B_rankValue,
                A_rankRange: [A_minRank, A_maxRank],
                role: match.role,
                style: match.style,
                checks: {
                    rankMatch: `${B_rankValue} >= ${A_minRank} && ${B_rankValue} <= ${A_maxRank} = ${rankMatch}`,
                    roleMatch,
                    styleMatch,
                    partnerRoleMatch,
                    partnerStyleMatch,
                },
                finalResult: result
            });

            return result;
        }).map(match => ({
            id: match.user_id,
            username: match.username,
            rank: match.rank,
            mainMode: match.mainMode,
            options: match.options ? JSON.parse(match.options) : [],
            role: match.role || null,
            style: match.style || null,
        }));

        console.log(`[MATCHMAKING] ${finalMatches.length} matches finaux après filtrage:`, finalMatches);

        res.json(finalMatches);
    });
});

/**
 * GET /api/stats/active-users/:gameId
 * Retourne le nombre d'utilisateurs actifs pour un jeu spécifique
 * (activité dans les dernières 5 minutes ET ayant des paramètres pour ce jeu)
 */
app.get('/api/stats/active-users/:gameId', (req, res) => {
    const gameId = req.params.gameId;

    const sql = `
        SELECT COUNT(DISTINCT us.user_id) as count
        FROM user_sessions us
        INNER JOIN game_settings gs ON us.user_id = gs.user_id
        WHERE gs.game_id = ?
        AND datetime(us.last_activity) >= datetime('now', '-5 minutes')
    `;

    db.get(sql, [gameId], (err, row) => {
        if (err) {
            console.error('Erreur GET /api/stats/active-users:', err);
            return res.status(500).json({ error: 'server_error' });
        }

        res.json({ count: row.count || 0, gameId });
    });
});

/**
 * GET /api/stats/total-users
 * Retourne le nombre total de profils enregistrés
 */
app.get('/api/stats/total-users', (req, res) => {
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) {
            console.error('Erreur GET /api/stats/total-users:', err);
            return res.status(500).json({ error: 'server_error' });
        }

        res.json({ count: row.count || 0 });
    });
});

// ====================================================
// ROUTE POUR LES FAVORIS (optionnelle)
// ====================================================

app.post('/api/favorites/:gameId', isAuthenticated, (req, res) => {
    // Cette route peut être utilisée pour synchroniser les favoris côté serveur
    // Pour l'instant, on retourne simplement un succès
    res.json({ success: true });
});

// ====================================================
// NOUVELLE ROUTE POUR LA SYNCHRONISATION DES DONNÉES
// ====================================================

app.get('/api/sync/data', isAuthenticated, (req, res) => {
    const userId = req.user.id;
    
    // Récupérer toutes les données nécessaires pour la synchronisation
    Promise.all([
        // Messages non lus
        new Promise((resolve) => {
            getUnreadMessagesCount(userId, resolve);
        }),
        // Notifications non lues
        new Promise((resolve) => {
            db.get('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0', [userId], (err, result) => {
                resolve(err ? 0 : result.count);
            });
        }),
        // Amis en ligne (simplifié)
        new Promise((resolve) => {
            db.all(`
                SELECT U.username 
                FROM friend_requests FR
                JOIN users U ON CASE 
                    WHEN FR.sender_id = ? THEN FR.receiver_id 
                    ELSE FR.sender_id 
                END = U.id
                JOIN user_sessions US ON U.id = US.user_id
                WHERE (FR.sender_id = ? OR FR.receiver_id = ?) 
                AND FR.status = 'accepted'
                AND datetime(US.last_activity) > datetime('now', '-5 minutes')
            `, [userId, userId, userId], (err, onlineFriends) => {
                resolve(err ? [] : onlineFriends);
            });
        })
    ]).then(([unreadMessages, unreadNotifications, onlineFriends]) => {
        res.json({
            unread_messages: unreadMessages,
            unread_notifications: unreadNotifications,
            online_friends: onlineFriends,
            last_sync: new Date().toISOString()
        });
    }).catch(err => {
        console.error('Erreur synchronisation:', err);
        res.status(500).json({ error: 'sync_error' });
    });
});

// ====================================================
// SYST�ME DE REPORTS ET MOD�RATION
// ====================================================

// Middleware pour v�rifier si l'utilisateur est admin
function isAdmin(req, res, next) {
    db.get('SELECT is_admin FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err || !user || !user.is_admin) {
            return res.status(403).json({ error: 'access_denied', message: 'Acc�s r�serv� aux administrateurs' });
        }
        next();
    });
}

// V�rifier si un utilisateur est banni ou suspendu
function checkUserStatus(userId, callback) {
    db.get('SELECT is_banned FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) return callback({ banned: false, suspended: false });
        if (user && user.is_banned) return callback({ banned: true, suspended: false });

        // V�rifier si l'utilisateur a une sanction active
        db.get(`
            SELECT * FROM sanctions
            WHERE user_id = ? AND is_active = 1
            AND (expires_at IS NULL OR datetime(expires_at) > datetime('now'))
            ORDER BY issued_at DESC LIMIT 1
        `, [userId], (err, sanction) => {
            if (err || !sanction) return callback({ banned: false, suspended: false });

            const isBan = sanction.type === 'ban';
            const isSuspension = sanction.type === 'suspension';

            callback({
                banned: isBan,
                suspended: !isBan && isSuspension,
                sanction: sanction
            });
        });
    });
}

// Supprimer les liens d'amis pour un utilisateur banni
function purgeUserFromFriends(userId, cb = () => {}) {
    db.run('DELETE FROM friend_requests WHERE sender_id = ? OR receiver_id = ?', [userId, userId], (err) => {
        if (err) console.error('Erreur purge amis pour user', userId, err);
        cb();
    });
}

// POST /api/reports - Signaler un utilisateur
app.post('/api/reports', isAuthenticated, (req, res) => {
    const { reportedUsername, reason, description } = req.body;
    const reporterId = req.user.id;

    if (!reportedUsername || !reason) {
        return res.status(400).json({ error: 'missing_fields', message: 'Utilisateur et raison requis' });
    }

    const validReasons = [
        'harassment',
        'hate_speech',
        'inappropriate_content',
        'spam',
        'cheating',
        'charter_violation',
        'other'
    ];

    if (!validReasons.includes(reason)) {
        return res.status(400).json({ error: 'invalid_reason' });
    }

    // Trouver l'ID de l'utilisateur signal�
    db.get('SELECT id FROM users WHERE username = ?', [reportedUsername], (err, reported) => {
        if (err) {
            console.error('Erreur recherche utilisateur:', err);
            return res.status(500).json({ error: 'server_error' });
        }
        if (!reported) {
            return res.status(404).json({ error: 'user_not_found', message: 'Utilisateur introuvable' });
        }

        const reportedId = reported.id;

        // Emp�cher de se signaler soi-m�me
        if (reporterId === reportedId) {
            return res.status(400).json({ error: 'cannot_report_self', message: 'Vous ne pouvez pas vous signaler vous-m�me' });
        }

        // Ins�rer le report
        db.run(`
            INSERT INTO reports (reporter_id, reported_id, reason, description, status)
            VALUES (?, ?, ?, ?, 'pending')
        `, [reporterId, reportedId, reason, description || ''], function(err) {
            if (err) {
                console.error('Erreur cr�ation report:', err);
                return res.status(500).json({ error: 'server_error' });
            }

            // Notifier les admins
            db.all('SELECT id FROM users WHERE is_admin = 1', [], (err, admins) => {
                if (!err && admins) {
                    admins.forEach(admin => {
                        createNotification(
                            admin.id,
                            'new_report',
                            'Nouveau signalement',
                            `${req.user.username} a signal� ${reportedUsername} pour ${reason}`,
                            reportedId
                        );
                    });
                }
            });

            res.json({
                success: true,
                message: 'Signalement envoy�. Notre �quipe va l\'examiner.',
                report_id: this.lastID
            });
        });
    });
});

// GET /api/reports - Liste des reports (admin uniquement)
app.get('/api/reports', isAuthenticated, isAdmin, (req, res) => {
    const status = req.query.status || 'pending';

    const sql = `
        SELECT
            r.*,
            u1.username as reporter_username,
            u2.username as reported_username,
            u3.username as resolver_username
        FROM reports r
        JOIN users u1 ON r.reporter_id = u1.id
        JOIN users u2 ON r.reported_id = u2.id
        LEFT JOIN users u3 ON r.resolved_by = u3.id
        WHERE r.status = ?
        ORDER BY r.created_at DESC
        LIMIT 50
    `;

    db.all(sql, [status], (err, reports) => {
        if (err) {
            console.error('Erreur r�cup�ration reports:', err);
            return res.status(500).json({ error: 'server_error' });
        }
        res.json(reports);
    });
});

// POST /api/reports/:id/resolve - R�soudre un report (admin uniquement)
app.post('/api/reports/:id/resolve', isAuthenticated, isAdmin, (req, res) => {
    const reportId = req.params.id;
    const { action, note } = req.body;
    const adminId = req.user.id;

    if (!action) {
        return res.status(400).json({ error: 'missing_action' });
    }

    db.run(`
        UPDATE reports
        SET status = 'resolved',
            resolved_at = CURRENT_TIMESTAMP,
            resolved_by = ?,
            resolution_note = ?
        WHERE id = ?
    `, [adminId, note || '', reportId], function(err) {
        if (err) {
            console.error('Erreur r�solution report:', err);
            return res.status(500).json({ error: 'server_error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'report_not_found' });
        }

        res.json({ success: true, message: 'Signalement trait�' });
    });
});

// POST /api/sanctions - Appliquer une sanction (admin uniquement)
app.post('/api/sanctions', isAuthenticated, isAdmin, (req, res) => {
    const { username, type, reason, durationHours } = req.body;
    const adminId = req.user.id;

    if (!username || !type || !reason) {
        return res.status(400).json({ error: 'missing_fields' });
    }

    const validTypes = ['warning', 'suspension', 'ban'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'invalid_type' });
    }

    // Trouver l'utilisateur
    db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'user_not_found' });
        }

        const userId = user.id;
        const expiresAt = durationHours ?
            new Date(Date.now() + durationHours * 3600000).toISOString() : null;

        // Si c'est un ban permanent, mettre � jour is_banned
        if (type === 'ban' && !durationHours) {
            db.run('UPDATE users SET is_banned = 1 WHERE id = ?', [userId]);
        }

        // Ins�rer la sanction
        db.run(`
            INSERT INTO sanctions (user_id, type, reason, duration_hours, issued_by, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, type, reason, durationHours || null, adminId, expiresAt], function(err) {
            if (err) {
                console.error('Erreur cr�ation sanction:', err);
                return res.status(500).json({ error: 'server_error' });
            }

            // Notifier l'utilisateur sanctionn�
            let title, message;
            if (type === 'warning') {
                title = 'Avertissement';
                message = `Vous avez re�u un avertissement: ${reason}`;
            } else if (type === 'suspension') {
                title = 'Compte suspendu';
                message = durationHours ?
                    `Votre compte est suspendu pour ${durationHours}h: ${reason}` :
                    `Votre compte est suspendu: ${reason}`;
            } else {
                title = 'Compte banni';
                message = `Votre compte a �t� banni: ${reason}`;
            }

            createNotification(userId, 'sanction', title, message, adminId);

            res.json({
                success: true,
                message: `Sanction ${type} appliqu�e � ${username}`,
                sanction_id: this.lastID
            });
        });
    });
});

// GET /api/sanctions/:username - Historique des sanctions d'un utilisateur
app.get('/api/sanctions/:username', isAuthenticated, isAdmin, (req, res) => {
    const username = req.params.username;

    db.get('SELECT id FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'user_not_found' });
        }

        db.all(`
            SELECT
                s.*,
                u.username as admin_username
            FROM sanctions s
            LEFT JOIN users u ON s.issued_by = u.id
            WHERE s.user_id = ?
            ORDER BY s.issued_at DESC
        `, [user.id], (err, sanctions) => {
            if (err) {
                console.error('Erreur r�cup�ration sanctions:', err);
                return res.status(500).json({ error: 'server_error' });
            }
            res.json(sanctions);
        });
    });
});

// DELETE /api/sanctions/:id - Annuler une sanction (admin uniquement)
app.delete('/api/sanctions/:id', isAuthenticated, isAdmin, (req, res) => {
    const sanctionId = req.params.id;

    db.run('UPDATE sanctions SET is_active = 0 WHERE id = ?', [sanctionId], function(err) {
        if (err) {
            console.error('Erreur annulation sanction:', err);
            return res.status(500).json({ error: 'server_error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'sanction_not_found' });
        }

        res.json({ success: true, message: 'Sanction annul�e' });
    });
});

// GET /api/moderation/stats - Statistiques de mod�ration (admin uniquement)
app.get('/api/moderation/stats', isAuthenticated, isAdmin, (req, res) => {
    Promise.all([
        new Promise((resolve) => {
            db.get('SELECT COUNT(*) as count FROM reports WHERE status = "pending"', [], (err, result) => {
                resolve(err ? 0 : result.count);
            });
        }),
        new Promise((resolve) => {
            db.get('SELECT COUNT(*) as count FROM sanctions WHERE is_active = 1', [], (err, result) => {
                resolve(err ? 0 : result.count);
            });
        }),
        new Promise((resolve) => {
            db.get('SELECT COUNT(*) as count FROM users WHERE is_banned = 1', [], (err, result) => {
                resolve(err ? 0 : result.count);
            });
        })
    ]).then(([pendingReports, activeSanctions, bannedUsers]) => {
        res.json({
            pending_reports: pendingReports,
            active_sanctions: activeSanctions,
            banned_users: bannedUsers
        });
    }).catch(err => {
        console.error('Erreur stats mod�ration:', err);
        res.status(500).json({ error: 'server_error' });
    });
});

// GET /api/moderation/banned-users - Liste des utilisateurs bannis (admin uniquement)
app.get('/api/moderation/banned-users', isAuthenticated, isAdmin, (req, res) => {
    const sql = `
        SELECT
            u.id,
            u.username,
            u.email,
            (SELECT issued_at FROM sanctions WHERE user_id = u.id AND type = 'ban' ORDER BY issued_at DESC LIMIT 1) as banned_at,
            (SELECT reason FROM sanctions WHERE user_id = u.id AND type = 'ban' ORDER BY issued_at DESC LIMIT 1) as last_sanction_reason
        FROM users u
        WHERE u.is_banned = 1
        ORDER BY u.username ASC
    `;

    db.all(sql, [], (err, users) => {
        if (err) {
            console.error('Erreur r�cup�ration utilisateurs bannis:', err);
            return res.status(500).json({ error: 'server_error' });
        }
        res.json(users);
    });
});

// POST /api/moderation/unban/:userId - D�bannir un utilisateur (admin uniquement)
app.post('/api/moderation/unban/:userId', isAuthenticated, isAdmin, (req, res) => {
    const userId = req.params.userId;
    const adminId = req.user.id;

    // V�rifier que l'utilisateur existe et est banni
    db.get('SELECT id, username, is_banned FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            console.error('Erreur recherche utilisateur:', err);
            return res.status(500).json({ error: 'server_error' });
        }
        if (!user) {
            return res.status(404).json({ error: 'user_not_found' });
        }
        if (!user.is_banned) {
            return res.status(400).json({ error: 'user_not_banned', message: 'Cet utilisateur n\'est pas banni.' });
        }

        // D�bannir l'utilisateur
        db.run('UPDATE users SET is_banned = 0 WHERE id = ?', [userId], function(err) {
            if (err) {
                console.error('Erreur d�bannissement:', err);
                return res.status(500).json({ error: 'server_error' });
            }

            // D�sactiver toutes les sanctions actives de type 'ban'
            db.run('UPDATE sanctions SET is_active = 0 WHERE user_id = ? AND type = "ban" AND is_active = 1', [userId], (err) => {
                if (err) {
                    console.error('Erreur d�sactivation sanctions:', err);
                }
            });

            // Cr�er une notification pour l'utilisateur
            createNotification(
                userId,
                'account_update',
                'Compte d�banni',
                'Votre compte a �t� d�banni. Vous pouvez � nouveau acc�der � SafeMates.',
                adminId
            );

            logger.info(`Utilisateur ${user.username} (ID: ${userId}) d�banni par admin ID: ${adminId}`);

            res.json({
                success: true,
                message: `Utilisateur ${user.username} d�banni avec succ�s.`
            });
        });
    });
});

// ====================================================
// ENDPOINT FORMULAIRE DE CONTACT
// ====================================================

// POST /api/contact - Recevoir un message de contact
app.post('/api/contact', generalLimiter, (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validation des champs
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'missing_fields', message: 'Tous les champs sont requis.' });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'invalid_email', message: 'Email invalide.' });
    }

    // Validation longueurs
    if (name.length > 100 || subject.length > 200 || message.length > 2000) {
        return res.status(400).json({ error: 'field_too_long', message: 'Un des champs est trop long.' });
    }

    // Enregistrer le message dans la base de donn�es
    const sql = `
        INSERT INTO contact_messages (name, email, subject, message, created_at, status)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'pending')
    `;

    db.run(sql, [name, email, subject, message], function(err) {
        if (err) {
            console.error('Erreur enregistrement message contact:', err);
            return res.status(500).json({ error: 'server_error', message: 'Erreur lors de l\'envoi du message.' });
        }

        logger.info(`Nouveau message de contact re�u de ${email} (ID: ${this.lastID})`);

        res.json({
            success: true,
            message: 'Message envoy� avec succ�s ! Nous vous r�pondrons dans les plus brefs d�lais.',
            id: this.lastID
        });
    });
});

// ====================================================
// LANCEMENT SERVEUR
// ====================================================
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Accédez à l'application: http://localhost:${PORT}`);
  console.log('✅ Synchronisation des chats activée');
  console.log('✅ Système de notifications opérationnel');
  console.log('✅ Matchmaking et profils unifiés');
  console.log('✅ Système de reports et modération actif');
});
