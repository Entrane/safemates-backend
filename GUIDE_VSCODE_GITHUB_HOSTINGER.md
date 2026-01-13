# 🚀 Guide complet : VSCode → GitHub → Hostinger

## 📋 Prérequis

- ✅ Projet cloné dans VSCode
- ✅ Git configuré
- ✅ Accès GitHub au repo `Entrane/safemates-backend`
- ✅ Accès FTP Hostinger configuré

---

## 🔧 Configuration initiale (à faire une seule fois)

### 1. Configurer Git dans VSCode

Ouvrez le terminal VSCode (`Ctrl+ù`) et configurez votre identité :

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre-email@example.com"
```

### 2. Configurer les secrets GitHub pour le déploiement automatique

1. Allez sur GitHub : https://github.com/Entrane/safemates-backend
2. Cliquez sur **Settings** (dans le repo)
3. Dans le menu de gauche : **Secrets and variables** > **Actions**
4. Cliquez sur **New repository secret**
5. Ajoutez deux secrets :

   **Secret 1 :**
   - Name : `FTP_USERNAME`
   - Value : `u639530603`

   **Secret 2 :**
   - Name : `FTP_PASSWORD`
   - Value : `[votre mot de passe FTP Hostinger]`

6. Cliquez sur **Add secret** pour chaque

---

## 🎯 Workflow quotidien

### Méthode 1 : Interface VSCode (Recommandée pour débutants)

1. **Faites vos modifications** dans les fichiers
2. Cliquez sur l'icône **Source Control** (Ctrl+Shift+G)
3. Vous verrez tous vos fichiers modifiés
4. Cliquez sur le **+** à côté de chaque fichier pour les "stager"
5. Écrivez un **message de commit** dans la zone de texte en haut (ex: "Ajout feature X")
6. Cliquez sur le bouton **✓ Commit**
7. Cliquez sur le bouton **Sync Changes** (ou l'icône ↑↓)
8. **Attendez 1-2 minutes** → GitHub Actions déploiera automatiquement sur Hostinger !

### Méthode 2 : Terminal VSCode (Plus rapide)

```bash
# Ajouter tous les fichiers modifiés
git add .

# Créer un commit avec un message
git commit -m "Description de vos modifications"

# Pusher vers GitHub
git push origin main
```

### Méthode 3 : Scripts de déploiement existants (Ancien système)

Vous pouvez toujours utiliser vos scripts Windows :

```bash
# Déploiement complet (Git + FTP)
./deploy-direct.bat

# GitHub uniquement
./auto-deploy.bat

# API uniquement
./deploy-api.bat
```

---

## 🔍 Vérifier le déploiement automatique

Après avoir push vers GitHub :

1. Allez sur GitHub : https://github.com/Entrane/safemates-backend
2. Cliquez sur l'onglet **Actions**
3. Vous verrez votre déploiement en cours
4. ✅ Si tout est vert → Déployé avec succès !
5. ❌ Si c'est rouge → Cliquez dessus pour voir l'erreur

---

## 📊 Comparaison des méthodes

| Méthode | Avantages | Quand l'utiliser |
|---------|-----------|------------------|
| **GitHub Actions (Nouveau)** | ✅ Automatique<br>✅ Historique des déploiements<br>✅ Pas besoin de stocker credentials localement | **Recommandé** pour le workflow quotidien |
| **Scripts .bat (Ancien)** | ✅ Rapide<br>✅ Fonctionne sans GitHub | Urgences ou problèmes avec GitHub |
| **FTP manuel** | ✅ Contrôle total | Debug ou fichiers spécifiques |

---

## 🌐 URLs de votre projet

- **Site web** : https://safemates.fr
- **GitHub** : https://github.com/Entrane/safemates-backend
- **Actions GitHub** : https://github.com/Entrane/safemates-backend/actions

---

## 🛠️ Commandes Git utiles

```bash
# Voir l'état des fichiers
git status

# Voir l'historique des commits
git log --oneline

# Annuler les modifications locales (ATTENTION: perte de données!)
git reset --hard HEAD

# Créer une nouvelle branche
git checkout -b nom-de-la-branche

# Changer de branche
git checkout main

# Mettre à jour depuis GitHub
git pull origin main
```

---

## 🆘 Résolution de problèmes

### Problème : "Changes not staged for commit"
**Solution** : Vous avez oublié de stager les fichiers
```bash
git add .
```

### Problème : "Your branch is behind"
**Solution** : Vous devez pull les changements depuis GitHub
```bash
git pull origin main
```

### Problème : Conflit Git
**Solution** : VSCode vous montrera les conflits, résolvez-les manuellement

### Problème : Le déploiement automatique ne fonctionne pas
**Solution** : Vérifiez que vous avez bien ajouté les secrets FTP dans GitHub

### Problème : "Permission denied"
**Solution** : Vérifiez vos credentials FTP Hostinger

---

## 📝 Bonnes pratiques

1. ✅ **Toujours tester localement** avant de push
2. ✅ **Messages de commit clairs** : "Fix login bug" plutôt que "update"
3. ✅ **Commits petits et fréquents** plutôt qu'un gros commit
4. ✅ **Ne jamais commit le fichier .env** (déjà dans .gitignore)
5. ✅ **Vérifier le déploiement** après chaque push

---

## 🎓 Workflow recommandé

```
1. Ouvrir VSCode
2. Faire vos modifications
3. Tester localement (npm start)
4. git add .
5. git commit -m "Description"
6. git push origin main
7. Attendre 1-2 minutes
8. Vérifier sur https://safemates.fr
```

---

## 🔐 Sécurité

- ❌ Ne jamais commit les mots de passe ou clés API
- ✅ Utilisez le fichier .env (déjà ignoré par Git)
- ✅ Les secrets FTP sont dans GitHub Secrets (sécurisés)
- ✅ Changez régulièrement vos mots de passe

---

## 📞 Aide

Si vous avez des questions, consultez :
- Documentation Git : https://git-scm.com/doc
- GitHub Actions : https://docs.github.com/actions
- Hostinger Support : https://www.hostinger.fr/tutoriels/
