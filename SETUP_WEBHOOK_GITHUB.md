# 🚀 Configuration Webhook GitHub → Hostinger

Ce guide explique comment configurer un déploiement automatique depuis GitHub vers Hostinger.

---

## 📋 Étape 1 : Uploader le fichier webhook sur Hostinger

### **Via Gestionnaire de fichiers Hostinger :**

1. Allez dans **Hostinger → Gestionnaire de fichiers**
2. Naviguez vers `/public_html`
3. **Uploadez** le fichier `deploy-webhook.php`
4. **Permissions** : Clic droit → Permissions → `755` (ou `rwxr-xr-x`)

---

## 📋 Étape 2 : Modifier le chemin du repo Git

1. **Ouvrez** `deploy-webhook.php` dans le gestionnaire de fichiers
2. **Trouvez** cette ligne :
   ```php
   $repoPath = '/home/u123456789/git/safemates-backend';
   ```
3. **Remplacez** par le vrai chemin de votre repo Git sur Hostinger

### **Comment trouver le chemin ?**

Dans Hostinger → Git → Configuration, vous devriez voir le **"Chemin du dépôt"** (Repository path).

Exemple : `/home/u987654321/git/safemates-backend`

4. **Enregistrez** le fichier

---

## 📋 Étape 3 : Générer une clé secrète

1. Générez une clé aléatoire sécurisée :
   ```
   Par exemple : SafeMates_Webhook_2026_a1b2c3d4e5f6
   ```

2. **Modifiez** `deploy-webhook.php`, ligne 9 :
   ```php
   define('WEBHOOK_SECRET', 'VOTRE_CLE_SECRETE_ICI');
   ```

3. **Enregistrez** et **notez cette clé** (vous en aurez besoin pour GitHub)

---

## 📋 Étape 4 : Configurer le webhook sur GitHub

1. **Allez sur GitHub** : https://github.com/Entrane/safemates-backend

2. **Cliquez sur** : `Settings` (⚙️ en haut à droite)

3. **Dans le menu de gauche** : `Webhooks` → `Add webhook`

4. **Remplissez le formulaire** :

   | Champ | Valeur |
   |-------|--------|
   | **Payload URL** | `https://safemates.fr/deploy-webhook.php` |
   | **Content type** | `application/json` |
   | **Secret** | Votre clé secrète (définie à l'étape 3) |
   | **Which events?** | Sélectionnez `Just the push event` |
   | **Active** | ✅ Coché |

5. **Cliquez sur** `Add webhook`

---

## 📋 Étape 5 : Tester le webhook

1. **Faites un petit changement** dans votre code (ex: ajoutez un commentaire)

2. **Commitez et poussez** :
   ```bash
   git add .
   git commit -m "Test webhook auto-deploy"
   git push origin main
   ```

3. **Vérifiez dans GitHub** :
   - Allez dans `Settings → Webhooks`
   - Cliquez sur votre webhook
   - Descendez jusqu'à **"Recent Deliveries"**
   - Vous devriez voir une requête avec un ✅ (200 OK)

4. **Vérifiez le log** :
   - Allez sur : `https://safemates.fr/deploy-log.txt`
   - Vous devriez voir les logs du déploiement

5. **Vérifiez le site** :
   - Allez sur `https://safemates.fr` en mode incognito
   - Vos changements devraient être visibles !

---

## 🔒 Sécurité

### **Bloquer l'accès public au fichier de log**

Ajoutez dans votre `.htaccess` :

```apache
# Bloquer l'accès aux logs de déploiement
<FilesMatch "deploy-log\.txt">
    Order allow,deny
    Deny from all
</FilesMatch>
```

Ou supprimez la ligne qui crée le log si vous n'en avez pas besoin.

---

## 🐛 Dépannage

### Le webhook ne fonctionne pas

1. **Vérifiez les permissions** de `deploy-webhook.php` (doit être `755`)
2. **Vérifiez la signature secrète** (même dans GitHub et dans le PHP)
3. **Regardez les logs** : `https://safemates.fr/deploy-log.txt`
4. **Vérifiez Recent Deliveries** dans GitHub Webhooks

### Les fichiers ne sont pas copiés

1. **Vérifiez le chemin du repo** dans `deploy-webhook.php` (ligne 43)
2. **Vérifiez les permissions** du dossier Git
3. **Testez en SSH** :
   ```bash
   cp /chemin/repo/dashboard.html /chemin/public_html/
   ```

### Erreur 403 ou 500

1. **Erreur 403** : Signature invalide → Vérifiez la clé secrète
2. **Erreur 500** : Erreur PHP → Regardez les error logs Hostinger

---

## ✅ Résultat final

Après configuration, voici le workflow automatique :

```
1. Vous modifiez le code dans VS Code
2. git push origin main
3. GitHub envoie une requête à deploy-webhook.php
4. Le script pull les changements Git
5. Les fichiers sont copiés vers public_html
6. ✅ Site mis à jour automatiquement !
```

**Temps total : ~5 secondes**

Plus besoin de déployer manuellement ! 🎉

---

## 📚 Workflow complet

```bash
# Développement local
git add .
git commit -m "fix: correction bug"
git push origin main

# ✨ Magie : Hostinger met à jour automatiquement !
# Attendez 10 secondes et rechargez le site
```

---

**Note** : Si le webhook ne fonctionne toujours pas, vous pouvez utiliser la **Solution Alternative** (voir ci-dessous).
