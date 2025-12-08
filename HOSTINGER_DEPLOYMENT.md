# Guide de déploiement sur Hostinger

## Configuration requise pour Hostinger

Votre projet MatchMates est maintenant configuré pour Hostinger. Voici les étapes à suivre :

## 📋 Prérequis

Assurez-vous d'avoir :
- Un compte Hostinger avec hébergement Node.js
- Accès FTP ou Git pour le déploiement
- Node.js version 16 ou supérieure sur le serveur

## 🚀 Étapes de déploiement

### 1. Structure du projet validée

✅ `package.json` - Configuré avec `"main": "app.js"`
✅ `app.js` - Point d'entrée pour Hostinger
✅ `server.js` - Serveur Express principal
✅ `.htaccess` - Configuration Apache pour redirections et cache
✅ Tous les fichiers HTML statiques à la racine

### 2. Télécharger les fichiers sur Hostinger

**Option A : Via FTP (FileZilla, etc.)**
1. Connectez-vous à votre FTP Hostinger
2. Téléchargez tous les fichiers du projet vers le dossier `public_html` ou le dossier de votre domaine
3. Assurez-vous que tous les fichiers sont bien transférés

**Option B : Via Git (recommandé)**
```bash
# Sur votre machine locale
git init
git add .
git commit -m "Initial commit for Hostinger"

# Suivez ensuite les instructions Hostinger pour connecter votre dépôt Git
```

### 3. Configuration dans le panneau Hostinger

1. **Accédez au panneau de contrôle Hostinger**
   - Allez dans `Hébergement > Applications Node.js`

2. **Créer une nouvelle application Node.js**
   - Cliquez sur "Créer une application"
   - **Version Node.js** : Sélectionnez 16.x ou supérieure
   - **Mode Application** : Production
   - **Dossier de l'application** : `/public_html` ou votre dossier racine
   - **Fichier de démarrage** : `app.js`
   - **Port** : Laissez Hostinger attribuer automatiquement

3. **Variables d'environnement**
   - Ajoutez ces variables d'environnement dans le panneau :
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=VotreSecretJWTTrèsSécurisé
   SESSION_SECRET=VotreSecretSessionTrèsSécurisé
   ```

4. **Cliquez sur "Créer"**

### 4. Installer les dépendances

Dans le terminal SSH Hostinger ou via le panneau :

```bash
cd /home/votre_username/public_html
npm install --production
```

### 5. Démarrer l'application

```bash
npm start
```

Ou via le panneau Hostinger, cliquez sur "Démarrer l'application"

### 6. Configurer le domaine

1. Dans `Hébergement > Domaines`
2. Pointez votre domaine vers l'application Node.js
3. Activez SSL/HTTPS (gratuit avec Let's Encrypt)

## 🔧 Configuration spécifique

### Fichiers importants pour Hostinger

#### `app.js` (déjà créé)
Point d'entrée qui charge `server.js`

#### `package.json`
```json
{
  "main": "app.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

#### `.htaccess` (déjà configuré)
- Redirection HTTPS
- Compression GZIP
- Cache des ressources statiques
- Protection des fichiers sensibles

## 📁 Structure validée pour Hostinger

```
MatchMates1.0-main/
├── app.js                  ✅ Point d'entrée Hostinger
├── server.js               ✅ Serveur Express
├── package.json            ✅ "main": "app.js"
├── .htaccess               ✅ Configuration Apache
├── index.html              ✅ Page d'accueil
├── dashboard.html          ✅
├── game.html               ✅
├── login.html              ✅
├── signup.html             ✅
├── contact.html            ✅
├── moderation.html         ✅
├── style.css               ✅
├── animations.js           ✅
├── database.sqlite         ✅ Base de données
├── Image/                  ✅ Dossier images
├── node_modules/           (sera créé avec npm install)
└── logs/                   (sera créé automatiquement)
```

## ⚠️ Points importants

### 1. Base de données SQLite
La base de données `database.sqlite` sera créée automatiquement au premier démarrage.

### 2. Permissions des fichiers
Assurez-vous que ces dossiers ont les bonnes permissions :
```bash
chmod 755 logs/
chmod 644 database.sqlite
chmod 644 .htaccess
```

### 3. Fichiers sensibles
Le `.htaccess` protège déjà :
- `.env` files
- `.sqlite` databases
- `.log` files
- `.md` documentation

### 4. Port et URL
Hostinger assignera automatiquement un port. Votre application sera accessible via :
- `https://votre-domaine.com` (avec proxy Hostinger)

## 🐛 Dépannage

### Erreur "Framework non reconnu"

**Solution :** Le fichier `app.js` a été créé pour résoudre ce problème. Assurez-vous que :
1. `package.json` a `"main": "app.js"`
2. Le fichier `app.js` existe à la racine
3. Les dépendances sont installées (`npm install`)

### L'application ne démarre pas

**Vérifications :**
1. Logs de l'application dans le panneau Hostinger
2. Variables d'environnement correctement définies
3. `npm install` a été exécuté avec succès
4. Port non déjà utilisé

```bash
# Dans SSH Hostinger
cd /home/votre_username/public_html
npm install
node server.js
# Vérifiez les erreurs affichées
```

### Erreur de base de données

```bash
# Vérifier les permissions
chmod 644 database.sqlite
chmod 755 $(pwd)

# Recréer la base de données si nécessaire
rm database.sqlite
npm start  # La DB sera recréée
```

### CSS/JS ne se chargent pas

Vérifiez que le `.htaccess` est bien à la racine et contient les règles de cache.

## 📊 Vérification du déploiement

Après déploiement, testez :

1. ✅ Page d'accueil : `https://votre-domaine.com`
2. ✅ Inscription : `https://votre-domaine.com/signup.html`
3. ✅ Connexion : `https://votre-domaine.com/login.html`
4. ✅ Dashboard : `https://votre-domaine.com/dashboard`
5. ✅ API : `https://votre-domaine.com/api/health`

## 🔐 Sécurité en production

1. **Activez HTTPS** (Let's Encrypt gratuit sur Hostinger)
2. **Définissez des secrets forts** dans les variables d'environnement
3. **Sauvegardez la base de données** régulièrement

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez les logs dans le panneau Hostinger
2. Vérifiez la section "Dépannage" ci-dessus
3. Contactez le support Hostinger si nécessaire

## ✅ Checklist finale

- [ ] Fichiers téléchargés sur Hostinger
- [ ] Application Node.js créée dans le panneau
- [ ] Variables d'environnement configurées
- [ ] `npm install` exécuté
- [ ] Application démarrée
- [ ] Domaine configuré
- [ ] HTTPS activé
- [ ] Tests effectués

---

**Note :** Ce projet est maintenant 100% compatible avec Hostinger. Le fichier `app.js` et la configuration du `package.json` résolvent le problème "Framework non reconnu".
