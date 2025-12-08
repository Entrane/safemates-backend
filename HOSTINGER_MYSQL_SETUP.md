# 🐬 Configuration MySQL avec Hostinger

Ce guide vous explique comment utiliser la base de données MySQL de Hostinger avec votre application SafeMates sur Railway.

## 🎯 Avantages de cette solution

✅ **Base de données persistante** - Vos données ne disparaissent jamais
✅ **Gratuit** - Inclus dans votre plan Hostinger
✅ **Performant** - MySQL est plus rapide que SQLite pour plusieurs utilisateurs
✅ **Professionnel** - Solution standard pour les applications en production

---

## 📋 Étape 1 : Créer la base de données sur Hostinger

### 1.1 Accéder à hPanel

1. Connectez-vous à votre compte Hostinger
2. Allez dans **hPanel**
3. Cherchez la section **"Bases de données"** dans le menu de gauche

### 1.2 Créer une nouvelle base MySQL

1. Cliquez sur **"Bases de données MySQL"**
2. Cliquez sur **"Créer une nouvelle base de données"**
3. Configurez :
   - **Nom de la base** : `safemates_db` (ou votre choix)
   - **Description** : "Base de données SafeMates" (optionnel)
4. Cliquez sur **"Créer"**

### 1.3 Créer un utilisateur MySQL

1. Dans la même page, trouvez **"Utilisateurs MySQL"**
2. Cliquez sur **"Créer un nouvel utilisateur"**
3. Configurez :
   - **Nom d'utilisateur** : `safemates_user` (ou votre choix)
   - **Mot de passe** : Générez un mot de passe sécurisé
   - **Hôte** : Sélectionnez "Accès distant" ou "%" pour autoriser Railway
4. Cliquez sur **"Créer"**

### 1.4 Attribuer les privilèges

1. Trouvez votre base de données `safemates_db`
2. Cliquez sur **"Gérer"** ou **"Privilèges"**
3. Ajoutez l'utilisateur `safemates_user`
4. **Cochez TOUS les privilèges** (ALL PRIVILEGES)
5. Cliquez sur **"Sauvegarder"**

### 1.5 Autoriser l'accès distant

⚠️ **TRÈS IMPORTANT** : Par défaut, Hostinger bloque les connexions externes.

1. Dans **hPanel** > **Bases de données MySQL**
2. Trouvez **"Accès distant MySQL"** ou **"Remote MySQL"**
3. Cliquez sur **"Gérer"**
4. Ajoutez l'adresse IP ou utilisez **"Autoriser toutes les IP"** (%)
   - Pour Railway, vous devrez peut-être ajouter : `0.0.0.0/0` ou `%`
5. **Sauvegardez**

### 1.6 Noter les informations de connexion

Notez soigneusement ces informations (vous en aurez besoin) :

```
Host : mysql-xxxx.hostinger.com (ou l'adresse fournie par Hostinger)
Database : safemates_db
Username : safemates_user
Password : ********** (votre mot de passe)
Port : 3306 (par défaut)
```

---

## 📋 Étape 2 : Configurer Railway

### 2.1 Ajouter les variables d'environnement

Dans Railway, allez dans **Variables** et ajoutez :

```bash
NODE_ENV=production
USE_MYSQL=true

# MySQL Hostinger
MYSQL_HOST=mysql-xxxx.hostinger.com
MYSQL_USER=safemates_user
MYSQL_PASSWORD=votre_mot_de_passe_mysql
MYSQL_DATABASE=safemates_db
MYSQL_PORT=3306

# JWT
JWT_SECRET=<votre_cle_secrete_longue>
JWT_EXPIRATION=24h

# Autres
BCRYPT_ROUNDS=12
ALLOWED_ORIGINS=https://*.railway.app
```

### 2.2 Important

⚠️ Remplacez :
- `mysql-xxxx.hostinger.com` par votre vrai host Hostinger
- `safemates_user` par votre utilisateur MySQL
- `votre_mot_de_passe_mysql` par votre mot de passe
- `<votre_cle_secrete_longue>` par une clé JWT aléatoire

---

## 📋 Étape 3 : Déployer et tester

### 3.1 Déployer sur Railway

Les changements ont déjà été committés. Poussez-les vers GitHub :

```bash
git add .
git commit -m "Add MySQL support for Hostinger"
git push
```

Railway va automatiquement redéployer.

### 3.2 Vérifier les logs

1. Dans Railway, allez dans **"Deployments"**
2. Cliquez sur le déploiement actif
3. Cherchez dans les logs :
   ```
   🐬 Utilisation de MySQL (production)
   ✅ MySQL connectée avec succès à: mysql-xxxx.hostinger.com
   ✅ Tables MySQL créées/vérifiées
   ```

### 3.3 Tester l'inscription

1. Allez sur : `https://votre-app.railway.app/test-login.html`
2. Section 3 : Inscrivez-vous avec un compte
3. Section 4 : Testez la connexion
4. Vérifiez que ça fonctionne !

### 3.4 Vérifier dans Hostinger

1. Retournez dans **hPanel** > **Bases de données MySQL**
2. Cliquez sur **"phpMyAdmin"** pour votre base `safemates_db`
3. Vous devriez voir les tables créées et votre utilisateur

---

## 🔍 Diagnostic des problèmes

### Erreur "Access denied for user"

**Causes possibles** :
- Nom d'utilisateur ou mot de passe incorrect
- L'utilisateur n'a pas les privilèges sur la base
- L'accès distant n'est pas autorisé

**Solutions** :
1. Vérifiez les identifiants dans Railway Variables
2. Vérifiez les privilèges de l'utilisateur dans Hostinger
3. Autorisez l'accès distant dans Hostinger

### Erreur "Can't connect to MySQL server"

**Causes possibles** :
- Host incorrect
- Port incorrect
- Pare-feu Hostinger bloque Railway

**Solutions** :
1. Vérifiez le host MySQL dans Hostinger (mysql-xxxx.hostinger.com)
2. Vérifiez que le port est 3306
3. Autorisez toutes les IP (%) dans l'accès distant Hostinger

### Erreur "Unknown database"

**Solution** :
- Vérifiez que la base `safemates_db` existe dans Hostinger
- Vérifiez l'orthographe exacte du nom dans MYSQL_DATABASE

### Les tables ne se créent pas

**Solution** :
- Vérifiez que l'utilisateur a les privilèges CREATE TABLE
- Regardez les logs Railway pour voir l'erreur exacte

---

## 🔒 Sécurité

### Bonnes pratiques :

1. ✅ **Ne jamais** committer les identifiants MySQL dans Git
2. ✅ Utiliser un mot de passe fort pour MySQL
3. ✅ Créer un utilisateur MySQL dédié (pas root)
4. ✅ Limiter les privilèges de l'utilisateur au strict nécessaire
5. ✅ Activer SSL/TLS pour la connexion MySQL (si disponible)
6. ✅ Faire des backups réguliers de la base

### Protection du .env :

Le fichier `.env` est déjà dans `.gitignore`, donc vos identifiants locaux sont protégés.

---

## 📊 Comparaison SQLite vs MySQL

| Fonctionnalité | SQLite (local) | MySQL (Hostinger) |
|----------------|----------------|-------------------|
| Persistence | ❌ Non (Railway) | ✅ Oui |
| Performance | ⚠️ Moyenne | ✅ Excellente |
| Concurrent users | ⚠️ Limitée | ✅ Illimitée |
| Backup | ⚠️ Manuel | ✅ Automatique (Hostinger) |
| Scalabilité | ❌ Limitée | ✅ Excellente |
| Coût | ✅ Gratuit | ✅ Gratuit (inclus Hostinger) |

---

## 🎉 Prochaines étapes

Une fois MySQL configuré :

1. ✅ Votre base de données est persistante
2. ✅ Les utilisateurs peuvent s'inscrire et se connecter
3. ✅ Les données sont sauvegardées automatiquement
4. ✅ Vous pouvez gérer la base via phpMyAdmin

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs Railway pour l'erreur exacte
2. Testez la connexion MySQL avec phpMyAdmin
3. Vérifiez que l'accès distant est bien activé dans Hostinger
4. Contactez le support Hostinger si nécessaire
