# 🚀 Guide Auto-Deploy - Push Automatique vers Hostinger

**Toutes vos modifications sont maintenant pushées automatiquement vers Hostinger !**

---

## 🎯 3 Méthodes pour auto-deploy

### **Méthode 1 : Raccourci clavier** ⭐ **LE PLUS RAPIDE**

Appuyez simplement sur :
```
Ctrl + Alt + G
```

✨ **C'est tout !** Git va :
1. Ajouter tous les fichiers modifiés
2. Créer un commit automatique
3. Pusher vers GitHub/Hostinger
4. Hostinger déploie automatiquement

**Temps total : 2 secondes + 30 sec pour Hostinger**

---

### **Méthode 2 : Double-clic sur fichier**

1. **Double-cliquez** sur [quick-push.bat](quick-push.bat)
2. C'est tout !

ou

1. **Double-cliquez** sur [auto-deploy.bat](auto-deploy.bat)
2. C'est tout !

---

### **Méthode 3 : Menu VS Code**

1. Appuyez sur `Ctrl + Shift + P`
2. Tapez "Run Task"
3. Sélectionnez **"🚀 Auto-Deploy (Quick Push)"**

---

## ⚡ Workflow ultra-rapide

```
┌─────────────────────────────────────────────┐
│  Vous modifiez un fichier dans VS Code     │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Appuyez sur Ctrl + Alt + G                 │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Git add + commit + push (2 secondes)       │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Hostinger déploie automatiquement (30 sec) │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  ✅ Site mis à jour sur safemates.fr !      │
└─────────────────────────────────────────────┘
```

**Temps total : ~32 secondes** au lieu de 10 minutes d'upload FTP manuel !

---

## 🛠️ Configuration automatique créée

### Fichiers créés :

1. **[auto-deploy.bat](auto-deploy.bat)** - Script auto-deploy avec timestamp
2. **[quick-push.bat](quick-push.bat)** - Push ultra-rapide en 1 clic
3. **[.vscode/tasks.json](.vscode/tasks.json)** - Tâches VS Code
4. **[.vscode/keybindings.json](.vscode/keybindings.json)** - Raccourcis clavier

### Raccourcis configurés :

| Raccourci | Action |
|-----------|--------|
| `Ctrl + Alt + G` | 🚀 Auto-Deploy (Quick Push) |
| `Ctrl + Shift + P` → Run Task | Menu des tâches |

---

## 📋 Tâches VS Code disponibles

Dans VS Code, appuyez sur `Ctrl + Shift + P` puis tapez "Run Task" :

1. **🚀 Auto-Deploy (Quick Push)** - Push rapide automatique
2. **📤 Push avec message** - Push avec votre propre message de commit
3. **🔍 Vérifier status Git** - Voir les fichiers modifiés
4. **📊 Voir derniers commits** - Historique des 10 derniers commits

---

## 🎓 Exemples d'utilisation

### Scénario 1 : Correction rapide
```
1. Modifier server.js
2. Ctrl + Alt + G
3. ✅ Déployé !
```

### Scénario 2 : Modification de plusieurs fichiers
```
1. Modifier dashboard.html, style.css, animations.js
2. Ctrl + Alt + G
3. ✅ Tous les fichiers déployés !
```

### Scénario 3 : Nouveau fichier
```
1. Créer nouveau-fichier.php
2. Ctrl + Alt + G
3. ✅ Nouveau fichier sur Hostinger !
```

---

## ⚙️ Format des commits automatiques

Les commits automatiques auront ce format :
```
Auto-deploy: Update 2026-01-11 15:30:45
```

Si vous préférez écrire vos propres messages :
- Utilisez [deploy-hostinger.bat](deploy-hostinger.bat) à la place
- Ou la tâche **"📤 Push avec message"**

---

## 🔄 Cycle de développement optimal

```bash
# Workflow recommandé :

1. Modifier le code
2. Tester localement (si possible)
3. Ctrl + Alt + G (push)
4. Attendre 30 secondes
5. Vérifier sur safemates.fr
```

---

## ⚠️ Important

### ✅ Ce qui est automatique :
- `git add .` - Ajout de tous les fichiers modifiés
- `git commit` - Création du commit avec timestamp
- `git push origin main` - Push vers GitHub/Hostinger

### ❌ Ce qui n'est PAS automatique (et c'est voulu) :
- Les fichiers dans `.gitignore` ne sont **jamais** pushés
- Le fichier `.env` reste **toujours local**
- `node_modules/` n'est **jamais** uploadé

---

## 🐛 Dépannage

### Le raccourci `Ctrl + Alt + G` ne fonctionne pas
1. Redémarrez VS Code
2. Vérifiez que [.vscode/keybindings.json](.vscode/keybindings.json) existe
3. Utilisez la Méthode 2 (double-clic) en attendant

### Le push échoue
1. Vérifiez votre connexion internet
2. Lancez `git status` dans le terminal
3. Vérifiez que vous n'avez pas de conflits

### Hostinger ne déploie pas
1. Vérifiez dans Hostinger → Git → Historique des déploiements
2. Assurez-vous que l'auto-deploy est activé
3. Regardez les logs de déploiement

---

## 📊 Avantages de cette méthode

| Avant | Après |
|-------|-------|
| 🐌 10 min d'upload FTP manuel | ⚡ 32 secondes auto |
| ❌ Risque d'oublier des fichiers | ✅ Tous les fichiers synchronisés |
| ❌ Pas d'historique | ✅ Historique Git complet |
| ❌ Pas de rollback | ✅ Rollback en 1 commande |
| 😫 Fastidieux | 😊 Automatique |

---

## 🎯 Résumé

### Pour pusher vos modifications maintenant :

**Appuyez sur `Ctrl + Alt + G`** - C'est tout ! 🎉

---

## 🆘 Besoin d'aide ?

### Commandes Git utiles :

```bash
# Voir les fichiers modifiés
git status

# Voir les derniers commits
git log --oneline -10

# Annuler le dernier commit (avant push)
git reset --soft HEAD~1

# Voir les différences
git diff
```

### Scripts disponibles :

- [auto-deploy.bat](auto-deploy.bat) - Auto-deploy avec timestamp
- [quick-push.bat](quick-push.bat) - Push rapide
- [deploy-hostinger.bat](deploy-hostinger.bat) - Push avec message personnalisé
- [upload-ftp.bat](upload-ftp.bat) - Fallback FTP (si Git ne marche pas)

---

**✨ Maintenant, vous pouvez développer sans vous soucier du déploiement !**

Modifiez, appuyez sur `Ctrl + Alt + G`, et continuez à coder. 🚀
