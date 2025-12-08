# 🚀 Guide de déploiement MatchMates PHP sur Hostinger

## ✅ Votre projet a été converti en PHP !

Votre application MatchMates fonctionne maintenant avec **PHP + MySQL**, compatible avec **tous les hébergements Hostinger** (même les plans partagés basiques).

---

## 📋 Ce qui a été fait

### Backend converti en PHP :
- ✅ `api/config.php` - Configuration et fonctions utilitaires
- ✅ `api/signup.php` - Inscription des utilisateurs
- ✅ `api/login.php` - Connexion des utilisateurs
- ✅ `api/health.php` - Vérification de santé de l'API
- ✅ `api/install.php` - Script d'installation de la base de données

### Configuration :
- ✅ `.htaccess` - Réécriture d'URL et sécurité
- ✅ Base de données MySQL/SQLite supportée

---

## 🎯 Étapes de déploiement sur Hostinger

### Étape 1 : Préparer votre hébergement Hostinger

1. **Connectez-vous** au panneau Hostinger
2. **Accédez** à votre hébergement web
3. **Vérifiez** que PHP est activé (version 7.4 ou supérieure recommandée)

### Étape 2 : Télécharger les fichiers

**Via FTP (FileZilla, etc.) :**
1. Connectez-vous à votre FTP Hostinger
2. Allez dans le dossier `public_html`
3. Téléchargez TOUS les fichiers du projet :
   - Tous les fichiers `.html`
   - Tous les fichiers `.css` et `.js`
   - Le dossier `api/` avec tous les fichiers PHP
   - Le dossier `Image/` avec toutes les images
   - Le fichier `.htaccess`

**Via File Manager (Gestionnaire de fichiers Hostinger) :**
1. Panneau Hostinger > Fichiers > Gestionnaire de fichiers
2. Allez dans `public_html`
3. Uploadez tous les fichiers

### Étape 3 : Créer la base de données MySQL

1. **Panneau Hostinger** > Bases de données > MySQL
2. **Créez une nouvelle base de données** :
   - Nom : `matchmates` (ou autre nom)
   - Créez un utilisateur avec un mot de passe fort
   - Notez ces informations !

### Étape 4 : Configurer la connexion à la base de données

1. **Éditez** le fichier `api/config.php` (lignes 7-10)
2. **Remplacez** par vos informations Hostinger :

```php
define('DB_HOST', 'localhost'); // Généralement 'localhost'
define('DB_NAME', 'votre_nom_de_base'); // Nom créé à l'étape 3
define('DB_USER', 'votre_utilisateur'); // Utilisateur créé à l'étape 3
define('DB_PASS', 'votre_mot_de_passe'); // Mot de passe créé à l'étape 3
```

3. **Changez les secrets** (lignes 15-16) :

```php
define('JWT_SECRET', 'UnSecretTresComplexeEtUnique123!@#XYZ');
define('SESSION_SECRET', 'UnAutreSecretTresComplexe456$%^ABC');
```

### Étape 5 : Installer la base de données

1. **Ouvrez** votre navigateur
2. **Allez** à : `https://votre-domaine.com/api/install.php?password=matchmates2024`
3. **Vérifiez** que tout est créé correctement
4. **IMPORTANT** : Supprimez le fichier `api/install.php` après l'installation

### Étape 6 : Tester l'application

1. **Test de l'API** : `https://votre-domaine.com/api/health.php`
   - Devrait retourner un JSON avec "status": "OK"

2. **Test d'inscription** : `https://votre-domaine.com/signup.html`
   - Créez un compte de test

3. **Test de connexion** : `https://votre-domaine.com/login.html`
   - Connectez-vous avec le compte créé

---

## 🔧 Configuration avancée

### Option 1 : Utiliser SQLite au lieu de MySQL

Si vous préférez SQLite (fichier de base de données local) :

1. Éditez `api/config.php` ligne 13 :
```php
define('USE_SQLITE', true); // Mettre à true
```

2. Assurez-vous que le serveur peut écrire dans le dossier :
```bash
chmod 755 .
chmod 644 database.sqlite
```

### Option 2 : Activer HTTPS

Hostinger offre SSL gratuit :
1. Panneau > SSL > Activer Let's Encrypt
2. Attendez 5-10 minutes
3. Le `.htaccess` redirigera automatiquement vers HTTPS

### Option 3 : Personnaliser le domaine

1. Panneau Hostinger > Domaines
2. Pointez votre domaine vers l'hébergement
3. Attendez la propagation DNS (24-48h max)

---

## 📁 Structure des fichiers sur Hostinger

```
public_html/
├── index.html              ✅ Page d'accueil
├── signup.html             ✅ Inscription
├── login.html              ✅ Connexion
├── dashboard.html          ✅ Tableau de bord
├── game.html               ✅ Profils de jeu
├── moderation.html         ✅ Modération
├── contact.html            ✅ Contact
├── 404.html                ✅ Page erreur 404
├── 500.html                ✅ Page erreur 500
├── style.css               ✅ Styles
├── animations.js           ✅ Animations
├── .htaccess               ✅ Configuration Apache
├── api/
│   ├── config.php          ✅ Configuration
│   ├── signup.php          ✅ API inscription
│   ├── login.php           ✅ API connexion
│   ├── health.php          ✅ API santé
│   └── install.php         ⚠️ À supprimer après installation
└── Image/                  ✅ Images du site
```

---

## ⚠️ Problèmes courants et solutions

### Erreur "500 Internal Server Error"

**Cause** : Problème de configuration ou permissions

**Solutions** :
1. Vérifiez que le fichier `.htaccess` est bien uploadé
2. Vérifiez les permissions des fichiers (644 pour les fichiers, 755 pour les dossiers)
3. Consultez les logs d'erreur dans le panneau Hostinger

### Erreur de connexion à la base de données

**Cause** : Mauvaises informations de connexion

**Solutions** :
1. Vérifiez `api/config.php` lignes 7-10
2. Assurez-vous que la base de données existe
3. Vérifiez que l'utilisateur a les droits sur la base

### Les APIs ne fonctionnent pas (404)

**Cause** : `.htaccess` non actif ou mod_rewrite désactivé

**Solutions** :
1. Vérifiez que le `.htaccess` est bien à la racine de `public_html`
2. Contactez le support Hostinger pour activer `mod_rewrite`
3. En attendant, utilisez les URLs complètes : `/api/signup.php` au lieu de `/signup`

### "Erreur de connexion au serveur" sur signup

**Cause** : Les fichiers HTML n'ont pas été adaptés

**Solutions** :
1. Les URLs dans les fichiers HTML sont déjà compatibles
2. Vérifiez que l'API health fonctionne : `/api/health.php`
3. Vérifiez la console du navigateur pour voir l'erreur exacte

---

## 🔐 Sécurité en production

### 1. Changez les secrets

Dans `api/config.php` :
```php
define('JWT_SECRET', 'VotreSecretTresComplexe123'); // CHANGEZ
define('SESSION_SECRET', 'VotreAutreSecret456'); // CHANGEZ
```

Générez des secrets aléatoires : https://randomkeygen.com/

### 2. Supprimez les fichiers inutiles

Après installation, supprimez :
- `api/install.php`
- `server.js` (ancien backend Node.js)
- `package.json`
- `node_modules/` (dossier Node.js)
- Tous les fichiers `.md` (documentation)

### 3. Désactivez les erreurs PHP en production

Dans `api/config.php`, ajoutez :
```php
ini_set('display_errors', 0);
error_reporting(0);
```

### 4. Sauvegardez régulièrement

Panneau Hostinger > Sauvegardes > Créer une sauvegarde

---

## 📊 Vérification finale

### Checklist :
- [ ] Tous les fichiers uploadés sur Hostinger
- [ ] Base de données MySQL créée
- [ ] `api/config.php` configuré avec les bonnes informations
- [ ] Script `api/install.php` exécuté
- [ ] `api/install.php` supprimé après installation
- [ ] Secrets JWT et SESSION changés
- [ ] Test `/api/health.php` retourne OK
- [ ] Test d'inscription fonctionne
- [ ] Test de connexion fonctionne
- [ ] HTTPS activé
- [ ] Domaine configuré

---

## 🎉 C'est terminé !

Votre application MatchMates est maintenant déployée sur Hostinger avec PHP + MySQL.

**URLs importantes :**
- Page d'accueil : `https://votre-domaine.com`
- Inscription : `https://votre-domaine.com/signup.html`
- Connexion : `https://votre-domaine.com/login.html`
- Dashboard : `https://votre-domaine.com/dashboard`
- Modération : `https://votre-domaine.com/moderation`

**Compte admin par défaut :**
- Username : `admin`
- Password : `admin123`
- ⚠️ **CHANGEZ CE MOT DE PASSE IMMÉDIATEMENT !**

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez les logs d'erreur dans le panneau Hostinger
2. Vérifiez la section "Problèmes courants" ci-dessus
3. Contactez le support Hostinger (chat 24/7)

---

## 🔄 Différences avec la version Node.js

| Fonctionnalité | Node.js | PHP |
|----------------|---------|-----|
| Inscription | ✅ | ✅ |
| Connexion | ✅ | ✅ |
| JWT Auth | ✅ | ✅ (simplifié) |
| Base de données | SQLite | MySQL ou SQLite |
| Hébergement requis | VPS/Cloud | Partagé/VPS/Cloud |
| WebSockets (chat en temps réel) | ✅ | ❌ (à implémenter) |
| Déploiement | Complexe | Simple |

**Note** : Le chat en temps réel nécessitera une implémentation supplémentaire en PHP (polling ou long-polling) car PHP ne supporte pas nativement les WebSockets comme Node.js.

---

Bonne chance avec votre déploiement ! 🚀
