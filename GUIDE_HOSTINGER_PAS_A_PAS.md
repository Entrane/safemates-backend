# 📖 Guide Hostinger - Pas à Pas avec Captures

## ❌ PROBLÈME : "Erreur de connexion au serveur"

### Cause probable :
Le dossier **`api/`** n'est PAS sur Hostinger !

---

## ✅ SOLUTION : Suivez ces étapes EXACTEMENT

### 📁 ÉTAPE 1 : Vérifiez votre File Manager Hostinger

1. **Connectez-vous** à Hostinger
2. **Allez dans** : Fichiers > Gestionnaire de fichiers
3. **Ouvrez** le dossier `public_html`

**Ce que vous DEVEZ voir :**

```
public_html/
├── api/                    ← DOIT ÊTRE LÀ !
│   ├── config.php
│   ├── signup.php
│   ├── login.php
│   ├── health.php
│   └── install.php
├── Image/
├── index.html
├── signup.html
├── login.html
├── .htaccess
└── ... (autres fichiers)
```

**Si le dossier `api/` n'existe PAS :**
→ Passez à l'ÉTAPE 2

**Si le dossier `api/` existe déjà :**
→ Passez à l'ÉTAPE 3

---

### 📤 ÉTAPE 2 : Uploader le dossier `api/`

#### Option A : Via File Manager (Gestionnaire de fichiers)

1. Dans `public_html`, cliquez sur **"Télécharger"** (ou "Upload")
2. **Sélectionnez** le dossier `api/` complet depuis votre ordinateur
3. **Attendez** la fin de l'upload (5 fichiers PHP)
4. **Vérifiez** que vous voyez maintenant `public_html/api/`

#### Option B : Via FTP (FileZilla)

1. **Connectez-vous** en FTP à Hostinger
2. **Allez dans** `public_html/`
3. **Glissez-déposez** le dossier `api/` depuis votre ordinateur
4. **Vérifiez** que les 5 fichiers PHP sont bien uploadés

**Fichiers dans `api/` après upload :**
- ✅ config.php
- ✅ signup.php
- ✅ login.php
- ✅ health.php
- ✅ install.php

---

### 🗄️ ÉTAPE 3 : Créer la base de données MySQL

1. **Panneau Hostinger** > **Bases de données** > **MySQL**

2. **Cliquez sur** "Créer une base de données"

3. **Remplissez** :
   - Nom de la base : `matchmates` (ou autre)
   - Créez un utilisateur
   - Mot de passe fort

4. **NOTEZ CES INFORMATIONS** :
   ```
   Nom de la base : u123456789_matchmates  (exemple)
   Utilisateur :    u123456789_admin       (exemple)
   Mot de passe :   VotreMotDePasseIci
   Hôte :           localhost
   ```

---

### ⚙️ ÉTAPE 4 : Configurer `api/config.php`

1. **Dans File Manager**, ouvrez `public_html/api/config.php`

2. **Modifiez les lignes 7-10** avec VOS informations :

**AVANT (par défaut) :**
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'matchmates');
define('DB_USER', 'root');
define('DB_PASS', '');
```

**APRÈS (avec vos infos) :**
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_matchmates');  // VOTRE nom de BDD
define('DB_USER', 'u123456789_admin');       // VOTRE utilisateur
define('DB_PASS', 'VotreMotDePasseIci');     // VOTRE mot de passe
```

3. **Modifiez aussi les lignes 15-16** (sécurité) :

**AVANT :**
```php
define('JWT_SECRET', 'VotreSecretJWTTresSecurise123!@#');
define('SESSION_SECRET', 'VotreSecretSessionTresSecurise456$%^');
```

**APRÈS (générez des secrets aléatoires) :**
```php
define('JWT_SECRET', 'k8Hn3Qp9Zx2Lm5Wt7Rv4Yj6Fb1Dc0');
define('SESSION_SECRET', 'Ua9Gf2Nq8Hj4Pk6Xc3Vb7Zm5Wr1Ty0');
```

4. **Enregistrez** le fichier

---

### 🚀 ÉTAPE 5 : Installer la base de données

1. **Ouvrez votre navigateur**

2. **Allez à** :
   ```
   https://votre-domaine.com/api/install.php?password=matchmates2024
   ```

3. **Vous devriez voir** :
   ```
   Installation de la base de données MatchMates

   Création de la table 'users'...
   ✅ Table 'users' créée

   Création de la table 'game_profiles'...
   ✅ Table 'game_profiles' créée

   ...

   ✅ Installation terminée avec succès !
   ```

4. **Si vous voyez une erreur** :
   - Vérifiez les infos dans `api/config.php`
   - Vérifiez que la base de données existe dans Hostinger
   - Vérifiez que l'utilisateur a les droits sur la base

---

### 🧹 ÉTAPE 6 : Supprimer install.php (SÉCURITÉ)

**IMPORTANT** : Une fois l'installation réussie

1. **Dans File Manager**, supprimez `public_html/api/install.php`
2. **OU** renommez-le en `install.php.bak`

---

### 🧪 ÉTAPE 7 : Tester les APIs

1. **Test 1 - API Health** :
   ```
   https://votre-domaine.com/api/health.php
   ```

   **Résultat attendu :**
   ```json
   {
     "status": "OK",
     "message": "API MatchMates opérationnelle",
     "timestamp": "2025-11-30T...",
     "database": "MySQL"
   }
   ```

2. **Test 2 - Page de test complète** :
   ```
   https://votre-domaine.com/test-api.html
   ```

   - Cliquez sur "Tester /api/health.php"
   - Testez l'inscription avec un utilisateur de test
   - Testez la connexion

---

### 🎉 ÉTAPE 8 : Tester votre site

1. **Allez sur** :
   ```
   https://votre-domaine.com/signup.html
   ```

2. **Créez un compte**

3. **Connectez-vous** sur :
   ```
   https://votre-domaine.com/login.html
   ```

4. **Si ça fonctionne** : Vous êtes redirigé vers le dashboard ! 🎊

---

## 🐛 Dépannage

### Erreur : "Erreur de connexion au serveur"

**Causes possibles :**

1. ❌ **Le dossier `api/` n'est pas sur le serveur**
   - Solution : Uploadez-le (ÉTAPE 2)

2. ❌ **La base de données n'est pas configurée**
   - Solution : Vérifiez `api/config.php` (ÉTAPE 4)

3. ❌ **La base de données n'est pas installée**
   - Solution : Exécutez `install.php` (ÉTAPE 5)

4. ❌ **Le fichier `.htaccess` bloque les requêtes**
   - Solution : Vérifiez qu'il est bien uploadé

### Tester directement sans .htaccess

Si les problèmes persistent, testez avec les URLs complètes :

**Au lieu de :**
```
/signup → /api/signup.php
/login → /api/login.php
```

**Utilisez directement :**
```
/api/signup.php
/api/login.php
```

Modifiez `login.html` et `signup.html` pour utiliser les URLs complètes.

---

## 📞 Support

### Logs d'erreur Hostinger

Pour voir les erreurs PHP :
1. Panneau Hostinger > **Fichiers** > **Gestionnaire de fichiers**
2. Cherchez le fichier `error_log` dans `public_html/`
3. Ouvrez-le pour voir les erreurs PHP

### Contact Support Hostinger

Chat 24/7 disponible dans le panneau.

Dites-leur :
> "J'ai uploadé une application PHP dans public_html/api/ et j'ai besoin que mod_rewrite soit activé pour le .htaccess"

---

## ✅ Checklist finale

Avant de tester, vérifiez :

- [ ] Dossier `api/` uploadé dans `public_html/`
- [ ] 5 fichiers PHP présents dans `api/`
- [ ] Base de données MySQL créée sur Hostinger
- [ ] `api/config.php` configuré avec les bonnes infos de BDD
- [ ] Secrets JWT changés dans `config.php`
- [ ] `/api/install.php?password=matchmates2024` exécuté
- [ ] Message "Installation terminée avec succès" affiché
- [ ] `install.php` supprimé
- [ ] `/api/health.php` retourne `{"status":"OK"}`
- [ ] `.htaccess` uploadé à la racine

**Si tous les points sont cochés** : Ça DOIT fonctionner ! 🎉

---

## 🎯 Résumé ultra-rapide

```bash
1. Uploadez le dossier api/ dans public_html/
2. Créez la base MySQL dans Hostinger
3. Éditez api/config.php avec vos infos
4. Ouvrez /api/install.php?password=matchmates2024
5. Supprimez api/install.php
6. Testez /api/health.php
7. Testez /signup.html et /login.html
```

**Temps total** : 5-10 minutes

Bonne chance ! 🚀
