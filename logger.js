// ====================================================
// LOGGER.JS - Système de logging de sécurité
// ====================================================

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Créer le dossier logs s'il n'existe pas
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Format personnalisé pour les logs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Logger principal
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'matchmates-api' },
    transports: [
        // Logs d'erreurs
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Tous les logs
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Logs de sécurité spécifiques
        new winston.transports.File({
            filename: path.join(logsDir, 'security.log'),
            level: 'warn',
            maxsize: 5242880, // 5MB
            maxFiles: 10,
        })
    ]
});

// Ajouter la console en développement
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

/**
 * Logger de sécurité pour les événements suspects
 */
const securityLogger = {
    /**
     * Log une tentative de connexion échouée
     */
    logFailedLogin: (email, ip, reason = 'invalid_credentials') => {
        logger.warn('Tentative de connexion échouée', {
            type: 'failed_login',
            email,
            ip,
            reason,
            timestamp: new Date().toISOString()
        });
    },

    /**
     * Log une tentative de connexion réussie
     */
    logSuccessfulLogin: (userId, username, ip) => {
        logger.info('Connexion réussie', {
            type: 'successful_login',
            userId,
            username,
            ip,
            timestamp: new Date().toISOString()
        });
    },

    /**
     * Log un blocage de compte
     */
    logAccountLocked: (email, ip) => {
        logger.warn('Compte bloqué suite à trop de tentatives échouées', {
            type: 'account_locked',
            email,
            ip,
            timestamp: new Date().toISOString()
        });
    },

    /**
     * Log une violation du rate limit
     */
    logRateLimitExceeded: (ip, endpoint) => {
        logger.warn('Rate limit dépassé', {
            type: 'rate_limit_exceeded',
            ip,
            endpoint,
            timestamp: new Date().toISOString()
        });
    },

    /**
     * Log une tentative d'accès non autorisé
     */
    logUnauthorizedAccess: (ip, endpoint, token = null) => {
        logger.warn('Tentative d\'accès non autorisé', {
            type: 'unauthorized_access',
            ip,
            endpoint,
            hasToken: !!token,
            timestamp: new Date().toISOString()
        });
    },

    /**
     * Log une validation échouée (potentielle injection)
     */
    logValidationFailure: (ip, endpoint, errors) => {
        logger.warn('Échec de validation des données', {
            type: 'validation_failure',
            ip,
            endpoint,
            errors,
            timestamp: new Date().toISOString()
        });
    },

    /**
     * Log une erreur SQL (potentielle injection SQL)
     */
    logSqlError: (ip, endpoint, error) => {
        logger.error('Erreur SQL détectée', {
            type: 'sql_error',
            ip,
            endpoint,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    },

    /**
     * Log une tentative XSS détectée
     */
    logXssAttempt: (ip, endpoint, payload) => {
        logger.warn('Tentative XSS détectée', {
            type: 'xss_attempt',
            ip,
            endpoint,
            payload: payload.substring(0, 100), // Limiter la taille du log
            timestamp: new Date().toISOString()
        });
    },

    /**
     * Log un accès administrateur
     */
    logAdminAction: (userId, action, details) => {
        logger.info('Action administrative', {
            type: 'admin_action',
            userId,
            action,
            details,
            timestamp: new Date().toISOString()
        });
    },

    /**
     * Log une modification de données sensibles
     */
    logSensitiveDataChange: (userId, dataType, action) => {
        logger.info('Modification de données sensibles', {
            type: 'sensitive_data_change',
            userId,
            dataType,
            action,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Middleware pour logger les requêtes
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            userId: req.user ? req.user.id : null
        };

        if (res.statusCode >= 400) {
            logger.warn('Requête échouée', logData);
        } else {
            logger.info('Requête traitée', logData);
        }
    });

    next();
};

/**
 * Middleware pour détecter les patterns suspects
 */
const detectSuspiciousActivity = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /union\s+select/i,
        /drop\s+table/i,
        /exec\s*\(/i,
        /\.\.\/\.\.\//,
        /%00/,
        /etc\/passwd/i
    ];

    const checkSuspicious = (value) => {
        if (typeof value === 'string') {
            return suspiciousPatterns.some(pattern => pattern.test(value));
        }
        if (typeof value === 'object' && value !== null) {
            return Object.values(value).some(v => checkSuspicious(v));
        }
        return false;
    };

    // Vérifier le body
    if (req.body && checkSuspicious(req.body)) {
        securityLogger.logXssAttempt(ip, req.path, JSON.stringify(req.body));
    }

    // Vérifier les paramètres d'URL
    if (req.query && checkSuspicious(req.query)) {
        securityLogger.logXssAttempt(ip, req.path, JSON.stringify(req.query));
    }

    next();
};

module.exports = {
    logger,
    securityLogger,
    requestLogger,
    detectSuspiciousActivity
};
