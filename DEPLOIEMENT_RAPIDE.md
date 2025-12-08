# 🚀 Déploiement Rapide sur Hostinger

## ⚡ En 5 minutes chrono

### 1️⃣ Uploadez les fichiers (2 min)

**Via FTP ou File Manager Hostinger**, uploadez dans `public_html` :
- ✅ Tous les fichiers `.html`
- ✅ Tous les fichiers `.css` et `.js`
- ✅ Le dossier `api/` (complet)
- ✅ Le dossier `Image/` (complet)
- ✅ Le fichier `.htaccess`

**❌ NE PAS uploader :**
- `server.js`, `app.js`, `package.json`, `node_modules/`
- Fichiers `.md` (documentation)

### 2️⃣ Créez la base de données MySQL (1 min)

1. Panneau Hostinger > **Bases de données** > **MySQL**
2. Cliquez sur **Créer une base de données**
3. Notez :
   - Nom de la base : `u123456_matchmates` (exemple)
   - Utilisateur : `u123456_user` (exemple)
   - Mot de passe : `VotreMotDePasse123!`

### 3️⃣ Configurez la connexion (30 sec)

Éditez `public_html/api/config.php` lignes 7-10 :

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456_matchmates'); // Votre nom de BDD
define('DB_USER', 'u123456_user');        // Votre utilisateur
define('DB_PASS', 'VotreMotDePasse123!'); // Votre mot de passe
```

**IMPORTANT** : Changez aussi les secrets lignes 15-16 :
```php
define('JWT_SECRET', 'GenerezUnSecretAleatoireIci123!@#');
define('SESSION_SECRET', 'UnAutreSecretAleatoire456$%^');
```

### 4️⃣ Installez la base de données (30 sec)

Ouvrez dans votre navigateur :
```
https://votre-domaine.com/api/install.php?password=matchmates2024
```

Vous devriez voir : **✅ Installation terminée avec succès !**

### 5️⃣ Sécurisez (30 sec)

**SUPPRIMEZ** le fichier `api/install.php` immédiatement !

Via FTP ou File Manager : `public_html/api/install.php` → Supprimer

### 6️⃣ Testez ! (30 sec)

1. **API** : https://votre-domaine.com/api/health.php
   - Doit afficher : `{"status":"OK",...}`

2. **Page de test** : https://votre-domaine.com/test-api.html
   - Testez inscription et connexion

3. **Application** : https://votre-domaine.com
   - Créez un compte et connectez-vous !

---

## 🎉 C'est prêt !

Votre application MatchMates est en ligne sur Hostinger.

**Compte admin par défaut :**
- Username : `admin`
- Password : `admin123`
- ⚠️ **CHANGEZ CE MOT DE PASSE !**

---

## ❌ Problèmes ?

### Erreur 500
- Vérifiez les infos de BDD dans `api/config.php`
- Vérifiez que le `.htaccess` est bien uploadé

### "Erreur de connexion au serveur"
- Testez `/api/health.php` directement
- Si erreur, vérifiez `api/config.php`

### APIs ne fonctionnent pas
- Assurez-vous que `mod_rewrite` est activé (Hostinger l'active par défaut)
- Utilisez les URLs complètes : `/api/signup.php` au lieu de `/signup`

---

## 📞 Support

Contactez le support Hostinger 24/7 si problème persistant.

Guide complet : Lisez `PHP_DEPLOYMENT_GUIDE.md`
