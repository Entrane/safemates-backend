# 🚀 Configuration Git Auto-Deploy sur Hostinger

## Pourquoi cette solution ?

**Arrêtez l'upload manuel FTP !** Avec Git sur Hostinger, chaque `git push` déploie automatiquement.

---

## 📋 Étape 1 : Activer Git sur Hostinger

### 1.1 Connectez-vous à Hostinger
1. Allez sur : https://hpanel.hostinger.com
2. Cliquez sur votre hébergement

### 1.2 Accédez à Git
1. Dans le menu, cherchez **"Git"** ou **"Version Control"**
2. Cliquez sur **"Create new repository"** ou **"Connect to GitHub"**

### 1.3 Choisissez la méthode

#### **Option A : GitHub (Recommandé)** ⭐
1. Cliquez sur **"Connect GitHub"**
2. Autorisez Hostinger à accéder à votre GitHub
3. Sélectionnez votre repo : `safemates-backend`
4. Branche : `main`
5. Dossier de destination : `/public_html` ou votre domaine

#### **Option B : Git Direct**
1. Créez un nouveau dépôt Git sur Hostinger
2. Ajoutez-le comme remote à votre projet local

---

## 📋 Étape 2 : Configurer le déploiement automatique

### 2.1 Dans Hostinger Git Settings
```
Branch à déployer : main
Chemin de déploiement : /public_html
Auto-deploy : ON ✅
```

### 2.2 Script de post-déploiement (optionnel)
Si Hostinger propose un "post-deploy script", ajoutez :
```bash
#!/bin/bash
# Installation des dépendances PHP si nécessaire
composer install --no-dev

# Permissions
chmod -R 755 api/
chmod 644 .htaccess

# Backup de la base de données MySQL (optionnel)
# mysqldump -u user -p database > backup.sql
```

---

## 📋 Étape 3 : Configuration locale (une seule fois)

### 3.1 Vérifier votre remote GitHub
```bash
git remote -v
```

Vous devriez voir :
```
origin  https://github.com/Entrane/safemates-backend.git (fetch)
origin  https://github.com/Entrane/safemates-backend.git (push)
```

### 3.2 Si vous utilisez Git Direct Hostinger
Ajoutez le remote Hostinger :
```bash
git remote add hostinger ssh://u123456789@yourdomain.com/~/repository.git
```

---

## 🎯 Étape 4 : Workflow ultra-rapide

### Maintenant, à chaque modification :

#### **Méthode 1 : Script automatique** (Utilisez `deploy-hostinger.bat`)
```bash
# Double-cliquez sur deploy-hostinger.bat
# OU dans le terminal :
.\deploy-hostinger.bat
```

Le script va :
1. ✅ `git add .`
2. ✅ `git commit`
3. ✅ `git push origin main`
4. ✅ Hostinger déploie automatiquement en 30 secondes !

#### **Méthode 2 : Commandes manuelles**
```bash
git add .
git commit -m "fix: correction bug"
git push origin main
# Hostinger déploie automatiquement !
```

---

## 🔧 Configuration avancée

### Fichiers à exclure du déploiement

Créez/modifiez `.gitignore` :
```gitignore
# Fichiers locaux uniquement
.env.local
node_modules/
*.sqlite
*.log
.vscode/

# Fichiers sensibles
.env.production
config-local.php
```

### Variables d'environnement sur Hostinger

Si vous utilisez des variables d'environnement :
1. Dans Hostinger → **"Variables d'environnement"**
2. Ajoutez vos variables :
```
MYSQL_HOST=localhost
MYSQL_USER=u123456789_user
MYSQL_PASSWORD=VotreMotDePasse
MYSQL_DATABASE=u123456789_matchmates
```

---

## 📊 Vérification du déploiement

Après un `git push`, vérifiez :

### Dans Hostinger
1. Allez dans **Git → Deployments**
2. Vous verrez l'historique des déploiements
3. Statut : ✅ Success ou ❌ Failed

### Sur votre site
1. Testez : `https://votre-domaine.com`
2. Vérifiez que les changements sont bien là
3. Testez l'API : `https://votre-domaine.com/api/health.php`

---

## 🐛 Dépannage

### Le déploiement échoue
1. Vérifiez les logs dans Hostinger Git
2. Assurez-vous que `.htaccess` est valide
3. Vérifiez les permissions des fichiers

### Les fichiers ne se mettent pas à jour
1. Videz le cache CDN de Hostinger (si activé)
2. Forcez un hard refresh : `Ctrl + Shift + R`
3. Vérifiez que le commit est bien arrivé sur GitHub

### Erreur de permissions
```bash
# Dans SSH Hostinger
cd /home/u123456789/public_html
chmod -R 755 .
chmod 644 .htaccess
```

---

## ⚡ Avantages de cette méthode

| Avant (FTP manuel) | Après (Git Auto-Deploy) |
|-------------------|------------------------|
| 🐌 5-10 minutes par upload | ⚡ 30 secondes automatique |
| ❌ Risque d'oublier des fichiers | ✅ Tous les fichiers synchronisés |
| ❌ Pas d'historique | ✅ Historique complet Git |
| ❌ Pas de rollback facile | ✅ Rollback en 1 commande |
| ❌ Fastidieux | ✅ Automatique |

---

## 🎓 Commandes utiles

### Annuler le dernier commit (avant push)
```bash
git reset --soft HEAD~1
```

### Revenir à une version précédente (rollback)
```bash
git log --oneline  # Voir les commits
git revert abc1234  # Annuler le commit abc1234
git push origin main
```

### Voir l'état des fichiers
```bash
git status
```

### Voir les différences
```bash
git diff
```

---

## ✅ Checklist finale

- [ ] Git activé sur Hostinger
- [ ] GitHub connecté à Hostinger
- [ ] Auto-deploy activé (branch `main`)
- [ ] Test : Modifier un fichier → `git push` → Site mis à jour
- [ ] Script `deploy-hostinger.bat` fonctionne

---

**🎉 Félicitations !** Vous n'avez plus besoin d'uploader manuellement sur Hostinger !

### Workflow final :
1. Modifier le code dans VS Code
2. `.\deploy-hostinger.bat`
3. Attendre 30 secondes
4. ✅ Site à jour !
