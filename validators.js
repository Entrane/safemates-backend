// ====================================================
// VALIDATORS.JS - Validation et sanitisation des données
// ====================================================

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware pour vérifier les erreurs de validation
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'validation_error',
            message: 'Données invalides',
            details: errors.array()
        });
    }
    next();
};

/**
 * Sanitisation XSS - Nettoie les entrées HTML
 */
const sanitizeHtml = (value) => {
    if (typeof value !== 'string') return value;
    return value
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
};

/**
 * Validateurs pour l'authentification
 */
const authValidators = {
    register: [
        body('username')
            .trim()
            .isLength({ min: 3, max: 20 })
            .withMessage('Le nom d\'utilisateur doit contenir entre 3 et 20 caractères')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores')
            .customSanitizer(sanitizeHtml),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Email invalide')
            .normalizeEmail()
            .customSanitizer(sanitizeHtml),
        body('password')
            .isLength({ min: 8, max: 100 })
            .withMessage('Le mot de passe doit contenir au moins 8 caractères')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
        body('acceptedCharter')
            .optional()
            .isBoolean()
            .withMessage('La charte doit être acceptée'),
        handleValidationErrors
    ],

    login: [
        body('email')
            .trim()
            .isEmail()
            .withMessage('Email invalide')
            .normalizeEmail()
            .customSanitizer(sanitizeHtml),
        body('password')
            .notEmpty()
            .withMessage('Le mot de passe est requis'),
        handleValidationErrors
    ]
};

/**
 * Validateurs pour les fonctions sociales
 */
const socialValidators = {
    sendFriendRequest: [
        body('receiverUsername')
            .trim()
            .isLength({ min: 3, max: 20 })
            .withMessage('Nom d\'utilisateur invalide')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Nom d\'utilisateur invalide')
            .customSanitizer(sanitizeHtml),
        handleValidationErrors
    ],

    respondToRequest: [
        body('senderUsername')
            .trim()
            .isLength({ min: 3, max: 20 })
            .withMessage('Nom d\'utilisateur invalide')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Nom d\'utilisateur invalide')
            .customSanitizer(sanitizeHtml),
        body('action')
            .isIn(['accept', 'reject'])
            .withMessage('Action invalide'),
        handleValidationErrors
    ],

    removeFriend: [
        body('friendUsername')
            .trim()
            .isLength({ min: 3, max: 20 })
            .withMessage('Nom d\'utilisateur invalide')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Nom d\'utilisateur invalide')
            .customSanitizer(sanitizeHtml),
        handleValidationErrors
    ]
};

/**
 * Validateurs pour les messages
 */
const messageValidators = {
    sendMessage: [
        body('toUsername')
            .trim()
            .isLength({ min: 3, max: 20 })
            .withMessage('Nom d\'utilisateur invalide')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Nom d\'utilisateur invalide')
            .customSanitizer(sanitizeHtml),
        body('content')
            .trim()
            .isLength({ min: 1, max: 1000 })
            .withMessage('Le message doit contenir entre 1 et 1000 caractères')
            .customSanitizer(sanitizeHtml),
        handleValidationErrors
    ],

    getMessages: [
        param('username')
            .trim()
            .isLength({ min: 3, max: 20 })
            .withMessage('Nom d\'utilisateur invalide')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Nom d\'utilisateur invalide')
            .customSanitizer(sanitizeHtml),
        handleValidationErrors
    ]
};

/**
 * Validateurs pour les paramètres de jeu
 */
const gameValidators = {
    saveSettings: [
        body('gameId')
            .trim()
            .isIn(['valorant', 'lol', 'csgo', 'rocketleague', 'fortnite', 'warzone'])
            .withMessage('ID de jeu invalide')
            .customSanitizer(sanitizeHtml),
        body('rank')
            .trim()
            .notEmpty()
            .withMessage('Le rang est requis')
            .customSanitizer(sanitizeHtml),
        body('mainMode')
            .trim()
            .notEmpty()
            .withMessage('Le mode de jeu est requis')
            .customSanitizer(sanitizeHtml),
        body('options')
            .optional()
            .isArray()
            .withMessage('Les options doivent être un tableau'),
        body('role')
            .optional()
            .trim()
            .customSanitizer(sanitizeHtml),
        body('style')
            .optional()
            .trim()
            .customSanitizer(sanitizeHtml),
        handleValidationErrors
    ],

    savePreferences: [
        body('prefRanks')
            .optional()
            .isArray()
            .withMessage('Les rangs préférés doivent être un tableau'),
        body('rankTolerance')
            .optional()
            .isInt({ min: 0, max: 10 })
            .withMessage('La tolérance doit être entre 0 et 10'),
        body('prefRole')
            .optional()
            .trim()
            .customSanitizer(sanitizeHtml),
        body('prefStyle')
            .optional()
            .trim()
            .customSanitizer(sanitizeHtml),
        handleValidationErrors
    ],

    searchMatch: [
        param('gameId')
            .trim()
            .isIn(['valorant', 'lol', 'csgo', 'rocketleague', 'fortnite', 'warzone'])
            .withMessage('ID de jeu invalide')
            .customSanitizer(sanitizeHtml),
        handleValidationErrors
    ]
};

/**
 * Validateurs pour les notifications
 */
const notificationValidators = {
    markAsRead: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('ID de notification invalide'),
        handleValidationErrors
    ]
};

/**
 * Validateurs pour les paramètres utilisateur
 */
const userValidators = {
    getUserById: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('ID utilisateur invalide'),
        handleValidationErrors
    ],

    getProfile: [
        query('gameId')
            .optional()
            .trim()
            .isIn(['valorant', 'lol', 'csgo', 'rocketleague', 'fortnite', 'warzone'])
            .withMessage('ID de jeu invalide')
            .customSanitizer(sanitizeHtml),
        handleValidationErrors
    ]
};

module.exports = {
    authValidators,
    socialValidators,
    messageValidators,
    gameValidators,
    notificationValidators,
    userValidators,
    handleValidationErrors,
    sanitizeHtml
};
