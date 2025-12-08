// Point d'entrée principal pour Hostinger
// Ce fichier remplace server.js pour la compatibilité

const path = require('path');

// Charger le serveur principal
const server = require('./server.js');

// Le serveur est déjà démarré dans server.js
// Ce fichier sert uniquement de point d'entrée pour Hostinger

module.exports = server;
