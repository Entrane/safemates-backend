// ====================================================
// RATE_LIMITER.JS - Protection contre les attaques par force brute
// ====================================================

const rateLimit = require('express-rate-limit');
const { securityLogger } = require('./logger');

/**
 * Rate limiter général pour toutes les requêtes
 */
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // 500 requêtes par fenêtre (augmenté)
    message: {
        error: 'too_many_requests',
        message: 'Trop de requêtes. Veuillez réessayer dans quelques minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;
        securityLogger.logRateLimitExceeded(ip, req.path);
        res.status(429).json({
            error: 'too_many_requests',
            message: 'Trop de requêtes. Veuillez réessayer dans quelques minutes.'
        });
    }
});

/**
 * Rate limiter strict pour les endpoints d'authentification
 * DÉSACTIVÉ - Aucune limitation sur les tentatives de connexion
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 999999, // Limite très élevée = pas de limitation
    skipSuccessfulRequests: false,
    message: {
        error: 'too_many_login_attempts',
        message: 'Trop de tentatives de connexion.'
    },
    handler: (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;
        const email = req.body.email || 'unknown';
        securityLogger.logAccountLocked(email, ip);
        res.status(429).json({
            error: 'too_many_login_attempts',
            message: 'Trop de tentatives de connexion.'
        });
    }
});

/**
 * Rate limiter pour l'inscription
 * DÉSACTIVÉ - Aucune limitation sur les inscriptions
 */
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 999999, // Limite très élevée = pas de limitation
    message: {
        error: 'too_many_registrations',
        message: 'Trop d\'inscriptions depuis cette adresse IP.'
    },
    handler: (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;
        securityLogger.logRateLimitExceeded(ip, '/register');
        res.status(429).json({
            error: 'too_many_registrations',
            message: 'Trop d\'inscriptions depuis cette adresse IP. Réessayez plus tard.'
        });
    }
});

/**
 * Rate limiter pour les messages
 */
const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 messages par minute
    message: {
        error: 'too_many_messages',
        message: 'Vous envoyez trop de messages. Ralentissez.'
    },
    handler: (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;
        securityLogger.logRateLimitExceeded(ip, '/api/messages');
        res.status(429).json({
            error: 'too_many_messages',
            message: 'Vous envoyez trop de messages. Veuillez patienter.'
        });
    }
});

/**
 * Rate limiter pour les demandes d'ami
 */
const friendRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 20, // 20 demandes d'ami par heure
    message: {
        error: 'too_many_friend_requests',
        message: 'Trop de demandes d\'ami envoyées.'
    },
    handler: (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;
        securityLogger.logRateLimitExceeded(ip, '/api/friends/send');
        res.status(429).json({
            error: 'too_many_friend_requests',
            message: 'Vous envoyez trop de demandes d\'ami. Réessayez plus tard.'
        });
    }
});

/**
 * Rate limiter pour la recherche de match
 */
const matchSearchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 recherches par minute (permet 1 recherche par seconde)
    message: {
        error: 'too_many_searches',
        message: 'Trop de recherches effectuées.'
    },
    handler: (req, res) => {
        const ip = req.ip || req.connection.remoteAddress;
        securityLogger.logRateLimitExceeded(ip, '/api/match/search');
        res.status(429).json({
            error: 'too_many_searches',
            message: 'Trop de recherches. Veuillez patienter quelques secondes.'
        });
    }
});

/**
 * Système de détection de tentatives de brute force
 * DÉSACTIVÉ - Aucune limitation sur les tentatives de connexion
 */
class BruteForceProtection {
    constructor() {
        this.attempts = new Map();
        this.lockoutDuration = 0; // Désactivé
        this.maxAttempts = 999999; // Illimité
    }

    /**
     * Enregistre une tentative de connexion échouée (désactivé)
     */
    recordFailedAttempt(email, ip) {
        // Ne fait rien, la protection est désactivée
        return {
            locked: false,
            attemptsRemaining: 999999
        };
    }

    /**
     * Réinitialise les tentatives après une connexion réussie
     */
    resetAttempts(email) {
        // Ne fait rien
    }

    /**
     * Vérifie si un compte est verrouillé (toujours false)
     */
    isLocked(email) {
        // Toujours déverrouillé
        return false;
    }

    /**
     * Nettoie les anciennes entrées
     */
    cleanup() {
        // Ne fait rien
    }
}

const bruteForceProtection = new BruteForceProtection();

module.exports = {
    generalLimiter,
    authLimiter,
    registerLimiter,
    messageLimiter,
    friendRequestLimiter,
    matchSearchLimiter,
    bruteForceProtection
};
