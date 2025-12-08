# 📦 Configuration d'un Volume Persistent sur Railway

Ce guide vous explique comment configurer un volume persistent pour conserver votre base de données SQLite entre les déploiements.

## 🎯 Pourquoi un volume persistent ?

Par défaut, Railway utilise un système de fichiers **éphémère** :
- ❌ Les fichiers sont supprimés à chaque redéploiement
- ❌ Votre base de données est recréée vide à chaque fois
- ❌ Tous les utilisateurs et données sont perdus

Avec un volume persistent :
- ✅ Les données sont conservées entre les déploiements
- ✅ Votre base de données persiste
- ✅ Les utilisateurs peuvent se connecter après un redéploiement

---

## 📋 Étapes de configuration

### Étape 1 : Créer un volume sur Railway

1. **Connectez-vous à Railway** : https://railway.app

2. **Sélectionnez votre projet** "safemates-backend" (ou le nom de votre projet)

3. **Cliquez sur votre service** dans le dashboard

4. **Allez dans "Settings"** (onglet en haut)

5. **Scrollez vers le bas** jusqu'à la section **"Volumes"**

6. **Cliquez sur "+ New Volume"**

7. **Configurez le volume** :
   ```
   Mount Path: /app/data
   Name: safemates-database (optionnel)
   ```

8. **Cliquez sur "Add"** ou "Create Volume"

9. **Attendez** que Railway crée le volume (quelques secondes)

### Étape 2 : Vérifier les variables d'environnement

Assurez-vous que ces variables sont configurées dans Railway (onglet **"Variables"**) :

```bash
NODE_ENV=production
JWT_SECRET=<votre_cle_secrete_longue_et_aleatoire>
JWT_EXPIRATION=24h
BCRYPT_ROUNDS=12
ALLOWED_ORIGINS=https://*.railway.app
```

**Important** : `NODE_ENV=production` est CRUCIAL pour que le code utilise le volume persistent.

### Étape 3 : Déployer les changements

Le code a déjà été modifié pour utiliser automatiquement le volume en production.

1. **Commitez et poussez les changements** :
   ```bash
   git add .
   git commit -m "Add persistent volume support for production database"
   git push
   ```

2. **Railway va automatiquement redéployer** l'application

3. **Attendez** que le déploiement se termine (1-2 minutes)

### Étape 4 : Vérifier que ça fonctionne

1. **Ouvrez les logs Railway** (onglet "Deployments" > cliquez sur le déploiement actif)

2. **Cherchez dans les logs** :
   ```
   📁 Chemin de la base de données: /app/data/database.sqlite
   ✅ Base de données ouverte avec succès: /app/data/database.sqlite
   ```

3. **Si vous voyez ces messages**, le volume fonctionne ! ✅

4. **Testez l'inscription** sur : `https://votre-app.railway.app/test-login.html`
   - Inscrivez-vous avec un compte
   - Notez les informations

5. **Forcez un redéploiement** (Settings > cliquez sur "Redeploy")

6. **Reconnectez-vous** avec le même compte
   - Si ça fonctionne, le volume est bien configuré ! 🎉

---

## 🔍 Vérification et diagnostic

### Vérifier le chemin de la base de données dans les logs

Dans les logs Railway, vous devriez voir :
```
📁 Chemin de la base de données: /app/data/database.sqlite
✅ Base de données ouverte avec succès
```

Si vous voyez à la place :
```
📁 Chemin de la base de données: ./database.sqlite
```

Cela signifie que `NODE_ENV=production` n'est pas configuré !

### Vérifier que le volume est monté

Dans les logs, Railway affiche les volumes montés au démarrage :
```
Volumes:
  /app/data (1GB)
```

---

## 📊 Taille du volume

Volumes disponibles sur Railway :
- **1 GB** : Gratuit, suffisant pour ~100,000 utilisateurs
- **5 GB** : Si vous avez beaucoup d'utilisateurs
- **10+ GB** : Pour de très grandes bases

Pour une application en développement, **1 GB est largement suffisant**.

---

## 🔄 Migration des données existantes (optionnel)

Si vous voulez migrer vos utilisateurs locaux vers Railway :

### Option 1 : Export/Import manuel

1. **Exportez votre base locale** :
   ```bash
   sqlite3 database.sqlite .dump > backup.sql
   ```

2. **Connectez-vous en SSH à Railway** (si disponible sur votre plan)

3. **Importez les données** :
   ```bash
   sqlite3 /app/data/database.sqlite < backup.sql
   ```

### Option 2 : Réinscription manuelle

- Les utilisateurs doivent se réinscrire sur la version Railway
- C'est plus simple pour un petit nombre d'utilisateurs

---

## ⚠️ Points importants

1. **Backups** : Railway ne fait PAS de backup automatique de vos volumes
   - Configurez des backups réguliers si les données sont critiques

2. **Changement de région** : Si vous changez la région Railway, le volume sera perdu

3. **Suppression** : Si vous supprimez le service, le volume sera également supprimé

4. **Performance** : Les volumes Railway sont sur SSD, donc très rapides

---

## 🆘 Problèmes courants

### Le volume ne fonctionne pas

**Solution** :
1. Vérifiez que `NODE_ENV=production` est bien défini
2. Redéployez l'application
3. Vérifiez les logs pour voir le chemin de la BDD

### Les données disparaissent encore

**Causes possibles** :
1. Le volume n'est pas monté correctement
2. `NODE_ENV` n'est pas à "production"
3. Le chemin du volume est incorrect (doit être `/app/data`)

### Erreur "database is locked"

**Solution** :
- Redémarrez le service Railway
- Vérifiez qu'il n'y a qu'une seule instance qui tourne

---

## ✅ Checklist finale

- [ ] Volume créé avec mount path `/app/data`
- [ ] Variable `NODE_ENV=production` configurée
- [ ] Code déployé sur Railway
- [ ] Logs montrent `/app/data/database.sqlite`
- [ ] Test d'inscription réussi
- [ ] Test de redéploiement réussi (données conservées)

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Railway
2. Testez avec la page de diagnostic : `/test-login.html`
3. Vérifiez la configuration des variables d'environnement
