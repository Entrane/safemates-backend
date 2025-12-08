# 🔐 MatchMates - Version Sécurisée

## ✨ Nouvelles Fonctionnalités de Sécurité

Cette version de MatchMates inclut des **protections de sécurité complètes** contre les attaques de hacking courantes.

---

## 🛡️ Protections Implémentées

### 1. **Protection contre les Attaques par Force Brute** 🔨
- Limitation des tentatives de connexion (5 max)
- Verrouillage temporaire des comptes (15 minutes)
- Détection et logging de toutes les tentatives suspectes

### 2. **Rate Limiting** ⏱️
Limitations de requêtes pour prévenir les abus :
- Connexion : 5 tentatives / 15 min
- Inscription : 3 inscriptions / heure
- Messages : 20 messages / minute
- Demandes d'ami : 20 demandes / heure
- Recherche de match : 10 recherches / minute

### 3. **Validation et Sanitisation des Données** ✅
- Validation stricte de tous les inputs utilisateur
- Sanitisation anti-XSS automatique
- Protection contre les injections SQL
- Validation des formats (email, username, password)

### 4. **Headers de Sécurité HTTP** 🔒
- Helmet.js configuré avec CSP
- Protection HSTS (force HTTPS)
- Protection contre le clickjacking
- Prévention du MIME type sniffing

### 5. **Authentification JWT Sécurisée** 🎫
- Clés secrètes configurables
- Expiration des tokens
- Vérification à chaque requête
- Logging des tentatives non autorisées

### 6. **Configuration CORS Sécurisée** 🌐
- Origines autorisées configurables
- Méthodes HTTP limitées
- Headers contrôlés

### 7. **Logging et Monitoring de Sécurité** 📝
- Logs structurés (JSON)
- Événements de sécurité tracés
- Rotation automatique des logs
- 3 niveaux de logs (error, warn, info)

### 8. **Détection d'Activité Suspecte** 🔍
Détection automatique de :
- Tentatives XSS
- Injections SQL
- Path traversal
- Null bytes
- Patterns d'attaque courants

### 9. **Protection HPP** 🧹
- HTTP Parameter Pollution prevention
- Prévention de la manipulation de paramètres

### 10. **Limite de Taille des Requêtes** 📦
- Body JSON limité à 10 MB
- Protection contre les attaques DoS

---

## 📁 Nouveaux Fichiers

```
MatchMates1.0-main/
├── .env                    # Variables d'environnement (à configurer)
├── .env.example           # Exemple de configuration
├── .gitignore             # Fichiers à ignorer (inclut .env)
├── validators.js          # Validation et sanitisation
├── logger.js              # Système de logging
├── rateLimiter.js         # Rate limiting et brute force
├── SECURITY.md            # Documentation de sécurité complète
├── DEPLOYMENT.md          # Guide de déploiement production
├── TEST_SECURITY.md       # Tests de sécurité
└── logs/                  # Dossier des logs (auto-créé)
    ├── error.log
    ├── combined.log
    └── security.log
```

---

## 🚀 Démarrage Rapide

### 1. Installation

```bash
# Installer les dépendances
npm install
```

### 2. Configuration

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Générer une clé JWT sécurisée
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Éditer .env et remplacer JWT_SECRET par la clé générée
nano .env
```

### 3. Lancement

```bash
# Développement
npm start

# Production
NODE_ENV=production npm start
```

Le serveur démarre sur http://localhost:3000

---

## ⚙️ Configuration (.env)

Variables essentielles à configurer :

```env
# JWT - IMPORTANT: Changez cette valeur !
JWT_SECRET=VOTRE_CLE_GENEREE_ICI
JWT_EXPIRATION=24h

# CORS - Ajoutez vos domaines
ALLOWED_ORIGINS=http://localhost:3000,https://votredomaine.com

# Sécurité
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
```

⚠️ **IMPORTANT** : Ne JAMAIS commiter le fichier `.env` dans Git !

---

## 📊 Monitoring

### Consulter les Logs

```bash
# Logs de sécurité en temps réel
tail -f logs/security.log

# Tentatives de connexion échouées
grep "failed_login" logs/security.log

# Comptes verrouillés
grep "account_locked" logs/security.log

# Violations de rate limit
grep "rate_limit_exceeded" logs/security.log

# Tentatives XSS
grep "xss_attempt" logs/security.log
```

### Événements Loggés

- ✅ Connexions réussies
- ❌ Connexions échouées
- 🔒 Comptes verrouillés
- 🚨 Rate limit dépassé
- 🔓 Accès non autorisés
- ⚠️ Validations échouées
- 🐛 Erreurs SQL
- 🎭 Tentatives XSS

---

## 🧪 Tests de Sécurité

Consultez [TEST_SECURITY.md](TEST_SECURITY.md) pour des tests détaillés.

### Test Rapide

```bash
# Test du rate limiting sur /login
for i in {1..6}; do
  curl -X POST http://localhost:3000/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
done
```

**Résultat attendu :** Les 5 premières requêtes retournent 401, la 6ème retourne 429 (Too Many Requests)

---

## 🔧 Commandes Utiles

```bash
# Vérifier les vulnérabilités npm
npm audit

# Corriger automatiquement
npm audit fix

# Générer une clé JWT
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Lancer en mode production
NODE_ENV=production node server.js

# Monitoring avec PM2 (recommandé en prod)
pm2 start server.js --name matchmates
pm2 monit
```

---

## 📖 Documentation Complète

- **[SECURITY.md](SECURITY.md)** - Documentation de sécurité détaillée
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guide de déploiement en production
- **[TEST_SECURITY.md](TEST_SECURITY.md)** - Tests de sécurité

---

## 🌟 Endpoints Protégés

Tous les endpoints `/api/*` sont maintenant protégés avec :
- Authentification JWT obligatoire
- Rate limiting adapté
- Validation des données
- Sanitisation XSS
- Logging de sécurité

### Exemple d'utilisation

```javascript
// Connexion
const loginResponse = await fetch('http://localhost:3000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123'
  })
});
const { token } = await loginResponse.json();

// Requête authentifiée
const friendsResponse = await fetch('http://localhost:3000/api/friends', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## ⚠️ Avertissements de Sécurité

### Avant le Déploiement en Production

1. **Changez JWT_SECRET** : Générez une clé unique et complexe
2. **Configurez ALLOWED_ORIGINS** : Ajoutez uniquement vos domaines
3. **Activez HTTPS** : Ne jamais utiliser HTTP en production
4. **Configurez un firewall** : UFW, iptables, ou WAF cloud
5. **Configurez les sauvegardes** : Base de données et logs
6. **Surveillez les logs** : Mettez en place des alertes
7. **Mettez à jour régulièrement** : Dépendances et sécurité

### Fichiers Sensibles

Ne JAMAIS commiter :
- `.env` - Variables d'environnement
- `*.sqlite` - Base de données
- `logs/` - Fichiers de logs
- `*.key`, `*.pem` - Certificats et clés

Ces fichiers sont déjà dans `.gitignore`.

---

## 🆘 Support et Incidents

### Signaler une Vulnérabilité

Si vous découvrez une vulnérabilité de sécurité :
1. **NE PAS** créer une issue publique
2. Contacter : security@matchmates.com
3. Décrire la vulnérabilité en détail
4. Attendre une réponse avant disclosure publique

### En Cas de Compromission

1. Isoler le système immédiatement
2. Révoquer tous les tokens JWT (changer JWT_SECRET)
3. Analyser les logs de sécurité
4. Identifier et patcher la faille
5. Notifier les utilisateurs affectés

---

## 📈 Améliorations Futures

Fonctionnalités de sécurité prévues :
- [ ] 2FA (Authentification à deux facteurs)
- [ ] Captcha sur inscription/connexion
- [ ] IP Whitelisting/Blacklisting
- [ ] Session management avancé
- [ ] Honeypot pour détecter les bots
- [ ] Rotation automatique des clés JWT
- [ ] Audit trail complet

---

## 🏆 Conformité

Cette application respecte :
- ✅ **OWASP Top 10** (2021) - Protections contre les 10 vulnérabilités majeures
- ✅ **GDPR** - Protection des données personnelles
- ✅ **Best Practices ANSSI** - Recommandations de sécurité

---

## 📦 Dépendances de Sécurité

Packages installés pour la sécurité :

```json
{
  "helmet": "^7.1.0",          // Headers HTTP sécurisés
  "express-rate-limit": "^7.1.5", // Rate limiting
  "express-validator": "^7.0.1",  // Validation des données
  "cors": "^2.8.5",               // CORS sécurisé
  "hpp": "^0.2.3",                // Protection HPP
  "winston": "^3.11.0",           // Logging
  "dotenv": "^16.3.1",            // Variables d'environnement
  "bcrypt": "^5.1.1"              // Hachage sécurisé
}
```

---

## 🤝 Contribution

Pour contribuer à la sécurité du projet :

1. Lisez [SECURITY.md](SECURITY.md)
2. Testez avec [TEST_SECURITY.md](TEST_SECURITY.md)
3. Créez une Pull Request avec vos améliorations

---

## 📝 Changelog Sécurité

### Version 2.0 (2025-11-24) - Sécurisée

**Ajouts :**
- Protection brute force complète
- Rate limiting sur tous les endpoints critiques
- Validation et sanitisation des données
- Headers de sécurité (Helmet)
- Logging de sécurité avec Winston
- Détection d'activité suspecte
- Documentation complète

**Modifications :**
- JWT_SECRET déplacé vers .env
- Bcrypt rounds augmenté à 12
- CORS configuré de manière stricte
- Toutes les routes validées

**Sécurité :**
- Protection contre XSS, SQL Injection, CSRF
- Rate limiting adaptatif
- Logs de sécurité détaillés

---

## 📞 Contact

- **Documentation :** Consultez les fichiers .md
- **Issues :** [GitHub Issues](https://github.com/votre-repo/issues)
- **Sécurité :** security@matchmates.com

---

**✅ Votre application MatchMates est maintenant sécurisée contre les attaques de hacking courantes !**

Pour plus de détails, consultez :
- 📘 [Documentation Complète de Sécurité](SECURITY.md)
- 🚀 [Guide de Déploiement](DEPLOYMENT.md)
- 🧪 [Tests de Sécurité](TEST_SECURITY.md)

---

**Dernière mise à jour :** 2025-11-24
**Version :** 2.0 - Sécurisée
**Statut :** ✅ Production Ready
