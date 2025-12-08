# 🔒 Documentation de Sécurité - MatchMates

## Vue d'ensemble

Ce document décrit les mesures de sécurité implémentées dans l'application MatchMates pour protéger contre les attaques courantes et les vulnérabilités.

## Table des matières

1. [Protections Implémentées](#protections-implémentées)
2. [Configuration](#configuration)
3. [Rate Limiting](#rate-limiting)
4. [Authentification et Autorisation](#authentification-et-autorisation)
5. [Validation des Données](#validation-des-données)
6. [Logging et Monitoring](#logging-et-monitoring)
7. [Bonnes Pratiques](#bonnes-pratiques)
8. [Guide de Déploiement Sécurisé](#guide-de-déploiement-sécurisé)

---

## Protections Implémentées

### 🛡️ 1. Headers HTTP Sécurisés (Helmet)

**Protection contre :**
- Clickjacking (X-Frame-Options)
- XSS (X-XSS-Protection)
- MIME type sniffing (X-Content-Type-Options)
- Information disclosure

**Implémentation :**
```javascript
helmet({
    contentSecurityPolicy: true,
    hsts: { maxAge: 31536000 },
    noSniff: true,
    xssFilter: true
})
```

### 🚫 2. Protection CORS

**Protection contre :**
- Requêtes cross-origin non autorisées
- Attaques CSRF

**Configuration :**
- Origines autorisées définies dans `.env`
- Méthodes HTTP limitées (GET, POST, PUT, DELETE)
- Headers autorisés : `Content-Type`, `Authorization`

### 🔐 3. Authentification JWT

**Caractéristiques :**
- Tokens signés avec clé secrète forte
- Expiration configurable (défaut: 24h)
- Stockage côté client (localStorage)
- Vérification automatique sur chaque requête protégée

**Secret JWT :**
⚠️ **IMPORTANT** : Changez la clé JWT_SECRET dans `.env` avant le déploiement !

```bash
# Générer une clé sécurisée
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 🔨 4. Protection contre le Brute Force

**Mécanismes :**
- Limitation des tentatives de connexion (5 max par défaut)
- Verrouillage temporaire après échec (15 minutes)
- Compteur de tentatives par email
- Logging de toutes les tentatives suspectes

**Configuration dans `.env` :**
```env
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MS=900000
```

### ⏱️ 5. Rate Limiting

Protection contre les abus et attaques DoS :

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| `/login` | 5 tentatives | 15 minutes |
| `/register`, `/signup` | 3 inscriptions | 1 heure |
| `/api/messages` | 20 messages | 1 minute |
| `/api/friends/send` | 20 demandes | 1 heure |
| `/api/match/search` | 10 recherches | 1 minute |
| `/api/*` (général) | 100 requêtes | 15 minutes |

### ✅ 6. Validation et Sanitisation des Données

**Protection contre :**
- Injections SQL
- Attaques XSS
- Manipulation de données

**Validations implémentées :**

#### Authentification
- **Username :** 3-20 caractères, alphanumériques + tirets/underscores
- **Email :** Format email valide, normalisé
- **Password :** Minimum 8 caractères, au moins 1 majuscule, 1 minuscule, 1 chiffre

#### Messages
- **Content :** 1-1000 caractères, nettoyé des scripts
- **Username :** Validation stricte du format

#### Paramètres de jeu
- **gameId :** Liste blanche de jeux autorisés
- **Rank, Mode :** Sanitisation anti-XSS
- **Tolerance :** Entier entre 0 et 10

### 📝 7. Logging de Sécurité

**Événements loggés :**
- ✅ Connexions réussies
- ❌ Tentatives de connexion échouées
- 🔒 Comptes verrouillés
- 🚨 Violations du rate limit
- 🔓 Accès non autorisés
- ⚠️ Échecs de validation
- 🐛 Erreurs SQL
- 🎭 Tentatives XSS détectées

**Emplacements des logs :**
```
logs/
├── error.log          # Erreurs uniquement
├── combined.log       # Tous les logs
└── security.log       # Événements de sécurité
```

### 🧹 8. Protection contre HPP

**HTTP Parameter Pollution** : Empêche l'exploitation de paramètres dupliqués dans les requêtes.

### 📦 9. Limitation de la Taille des Requêtes

- Body JSON : Maximum 10 MB
- Protection contre les attaques de surcharge mémoire

### 🔍 10. Détection d'Activité Suspecte

Détection automatique de patterns suspects :
- Balises `<script>`
- Événements JavaScript inline (`onclick=`, etc.)
- Injections SQL (`UNION SELECT`, `DROP TABLE`)
- Path traversal (`../../`)
- Null bytes (`%00`)
- Tentatives d'accès à des fichiers système (`/etc/passwd`)

---

## Configuration

### Variables d'Environnement (.env)

```env
# Serveur
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=CHANGEZ_CETTE_CLE_AVEC_UNE_VALEUR_UNIQUE_ET_COMPLEXE
JWT_EXPIRATION=24h

# Base de données
DATABASE_PATH=./database.sqlite

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://votredomaine.com

# Sécurité
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MS=900000

# Session
SESSION_TIMEOUT_MINUTES=30
```

### ⚠️ Avant le Premier Déploiement

1. **Générer une clé JWT sécurisée :**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

2. **Copier `.env.example` vers `.env` :**
```bash
cp .env.example .env
```

3. **Modifier les valeurs sensibles dans `.env`**

4. **Ajouter `.env` au `.gitignore` :**
```
echo ".env" >> .gitignore
```

---

## Rate Limiting

### Personnalisation

Vous pouvez ajuster les limites dans `rateLimiter.js` :

```javascript
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Fenêtre de temps
    max: 5,                    // Nombre max de requêtes
    skipSuccessfulRequests: true
});
```

### Dépassement des Limites

Lorsqu'un utilisateur dépasse la limite :
- **Status Code :** 429 (Too Many Requests)
- **Réponse :** Message explicite avec temps d'attente
- **Logging :** Événement enregistré dans `security.log`

---

## Authentification et Autorisation

### Flux d'Authentification

1. **Inscription :**
   - Validation des données (username, email, password)
   - Hachage du mot de passe avec bcrypt (12 rounds)
   - Génération du token JWT
   - Création de la session utilisateur

2. **Connexion :**
   - Vérification du verrouillage du compte
   - Validation des identifiants
   - Comparaison du hash bcrypt
   - Génération du token JWT
   - Réinitialisation du compteur de tentatives

3. **Requêtes Protégées :**
   - Vérification du token JWT dans le header `Authorization: Bearer <token>`
   - Décodage et validation du token
   - Mise à jour de l'activité utilisateur

### Gestion des Tokens

**Durée de vie :** Configurable via `JWT_EXPIRATION` (défaut: 24h)

**Stockage côté client :**
```javascript
localStorage.setItem('token', token);
```

**Envoi dans les requêtes :**
```javascript
headers: {
    'Authorization': `Bearer ${token}`
}
```

---

## Validation des Données

### Architecture

Toutes les validations sont centralisées dans `validators.js` :

```javascript
const { authValidators } = require('./validators');

app.post('/register', authValidators.register, (req, res) => {
    // La validation a déjà été effectuée
});
```

### Sanitisation XSS

Fonction de nettoyage appliquée automatiquement :

```javascript
const sanitizeHtml = (value) => {
    return value
        .replace(/[<>]/g, '')           // Supprimer < et >
        .replace(/javascript:/gi, '')    // Supprimer javascript:
        .replace(/on\w+\s*=/gi, '')     // Supprimer onclick=, etc.
        .trim();
};
```

---

## Logging et Monitoring

### Niveaux de Log

- **error :** Erreurs critiques
- **warn :** Avertissements et événements de sécurité
- **info :** Événements normaux (connexions, etc.)

### Consultation des Logs

```bash
# Logs en temps réel
tail -f logs/security.log

# Filtrer les tentatives de connexion échouées
grep "failed_login" logs/security.log

# Voir les comptes verrouillés
grep "account_locked" logs/security.log
```

### Rotation des Logs

- Taille maximale : 5 MB par fichier
- Nombre de fichiers conservés : 5-10
- Rotation automatique

---

## Bonnes Pratiques

### ✅ À FAIRE

1. **Générer une clé JWT unique** pour chaque environnement
2. **Ne jamais commiter le fichier `.env`** dans Git
3. **Activer HTTPS** en production
4. **Surveiller les logs de sécurité** régulièrement
5. **Mettre à jour les dépendances** régulièrement :
   ```bash
   npm audit
   npm update
   ```
6. **Utiliser des mots de passe forts** pour la base de données
7. **Limiter les permissions** des fichiers sensibles :
   ```bash
   chmod 600 .env
   chmod 600 database.sqlite
   ```
8. **Sauvegarder la base de données** régulièrement
9. **Tester les endpoints** avec des outils de sécurité
10. **Configurer un WAF** (Web Application Firewall) en production

### ❌ À ÉVITER

1. **Ne pas utiliser la clé JWT par défaut** en production
2. **Ne pas désactiver les validations** pour "aller plus vite"
3. **Ne pas exposer les messages d'erreur détaillés** à l'utilisateur
4. **Ne pas logger les mots de passe** (même hashés)
5. **Ne pas augmenter les limites de rate limiting** sans raison
6. **Ne pas désactiver CORS** en production
7. **Ne pas stocker de données sensibles** en clair
8. **Ne pas ignorer les alertes** de sécurité npm

---

## Guide de Déploiement Sécurisé

### 1. Préparation

```bash
# Installer les dépendances
npm ci --production

# Vérifier les vulnérabilités
npm audit

# Générer une clé JWT sécurisée
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Configuration

Créer et configurer `.env` en production :

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<VOTRE_CLE_GENEREE>
ALLOWED_ORIGINS=https://votredomaine.com
DATABASE_PATH=/var/lib/matchmates/database.sqlite
```

### 3. Permissions

```bash
# Créer un utilisateur dédié
sudo useradd -r -s /bin/false matchmates

# Configurer les permissions
sudo chown -R matchmates:matchmates /var/www/matchmates
sudo chmod 700 /var/www/matchmates
sudo chmod 600 /var/www/matchmates/.env
sudo chmod 600 /var/lib/matchmates/database.sqlite
```

### 4. Reverse Proxy (Nginx)

Configuration recommandée :

```nginx
server {
    listen 443 ssl http2;
    server_name votredomaine.com;

    ssl_certificate /etc/letsencrypt/live/votredomaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votredomaine.com/privkey.pem;

    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Limitation de taille
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name votredomaine.com;
    return 301 https://$server_name$request_uri;
}
```

### 5. Firewall

```bash
# UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 6. Monitoring

Mettre en place un système de monitoring :

```bash
# Installer PM2 pour la gestion de processus
npm install -g pm2

# Démarrer l'application
pm2 start server.js --name matchmates

# Monitoring
pm2 monit

# Logs
pm2 logs matchmates

# Redémarrage automatique
pm2 startup
pm2 save
```

### 7. Sauvegardes

Script de sauvegarde automatique :

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/matchmates"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le dossier de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarder la base de données
cp /var/lib/matchmates/database.sqlite $BACKUP_DIR/database_$DATE.sqlite

# Sauvegarder les logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz /var/www/matchmates/logs

# Nettoyer les anciennes sauvegardes (>30 jours)
find $BACKUP_DIR -name "*.sqlite" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Sauvegarde effectuée : $DATE"
```

Ajouter au crontab :
```bash
# Sauvegarde quotidienne à 2h du matin
0 2 * * * /usr/local/bin/backup.sh >> /var/log/matchmates-backup.log 2>&1
```

---

## Incidents de Sécurité

### En cas de compromission

1. **Isoler le système** immédiatement
2. **Révoquer tous les tokens JWT** (changer JWT_SECRET)
3. **Analyser les logs** pour identifier la faille
4. **Patcher la vulnérabilité**
5. **Notifier les utilisateurs** si des données ont été compromises
6. **Forcer la réinitialisation** des mots de passe si nécessaire

### Reporting

Pour signaler une vulnérabilité de sécurité, contactez : security@matchmates.com

---

## Conformité

Cette application implémente les recommandations de sécurité :

- ✅ OWASP Top 10 (2021)
- ✅ GDPR (protection des données personnelles)
- ✅ Bonnes pratiques ANSSI

---

## Ressources Complémentaires

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)

---

**Dernière mise à jour :** 2025-11-24
**Version :** 2.0 (Sécurisée)
