# 🔧 Dépannage Hostinger - Erreur de connexion au serveur

## Symptôme
❌ Message d'erreur : "Erreur de connexion au serveur" lors de la création de compte

## Causes possibles

### 1. ❌ L'application Node.js n'est PAS démarrée

**C'est la cause la plus fréquente !**

#### Vérification :
1. Connectez-vous au panneau Hostinger
2. Allez dans **Hébergement > Applications Node.js** (ou **Advanced > Node.js**)
3. Vérifiez le statut de votre application

#### Solutions :

**Si vous ne voyez PAS d'application Node.js :**
- Vous devez en créer une ! Suivez le guide [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md)
- **IMPORTANT** : Un hébergement web classique ne suffit PAS. Vous avez besoin de :
  - Un VPS Hostinger
  - OU un Cloud Hosting avec Node.js
  - OU l'option "Application Node.js" activée

**Si l'application existe mais est arrêtée :**
- Cliquez sur "Démarrer" / "Start"
- Attendez 30 secondes que l'application démarre
- Rafraîchissez la page signup.html

**Si l'application ne démarre pas :**
- Vérifiez les logs d'erreur dans le panneau
- Vérifiez que toutes les dépendances sont installées (`npm install`)

---

### 2. ❌ Type d'hébergement incorrect

#### Vérification :
Votre hébergement Hostinger doit supporter Node.js

**Types d'hébergement compatibles :**
- ✅ **VPS** (Virtual Private Server)
- ✅ **Cloud Hosting** avec Node.js
- ✅ **Business Hosting** avec applications Node.js
- ❌ **Hébergement web partagé basique** (ne supporte PAS Node.js)

#### Comment vérifier :
1. Panneau Hostinger > regardez si vous avez une section "Node.js" ou "Applications"
2. Si NON, votre plan ne supporte pas Node.js

#### Solution :
- Upgradez vers un plan VPS ou Cloud
- OU utilisez une plateforme gratuite comme **Render.com**, **Railway.app**, ou **Vercel**

---

### 3. ❌ Le domaine ne pointe PAS vers l'application Node.js

#### Symptôme :
- Vous voyez les fichiers HTML statiques
- Mais les requêtes API (`/signup`, `/api/*`) échouent

#### Vérification :
Testez directement l'URL de l'API :
```
https://votre-domaine.com/api/health
```

**Si ça retourne une erreur 404 :** Le domaine ne pointe pas vers Node.js

#### Solution sur Hostinger :
1. Panneau de contrôle > **Hébergement > Applications Node.js**
2. Cliquez sur votre application
3. Section **Domaine** : Assignez votre domaine à l'application
4. Attendez 5-10 minutes pour la propagation

---

### 4. ❌ Variables d'environnement manquantes

#### Symptôme :
L'application démarre mais crash immédiatement

#### Vérification :
Dans les logs de l'application, vous voyez des erreurs liées à JWT_SECRET ou SESSION_SECRET

#### Solution :
1. Panneau Hostinger > Application Node.js > Variables d'environnement
2. Ajoutez :
```
NODE_ENV=production
PORT=3000
JWT_SECRET=VotreSecretJWTTresSecurise123!@#
SESSION_SECRET=VotreSecretSessionTresSecurise456$%^
```

---

### 5. ❌ Dépendances npm non installées

#### Symptôme :
L'application ne démarre pas, erreurs "module not found" dans les logs

#### Solution :
Connectez-vous en SSH ou utilisez le terminal du panneau :

```bash
cd /home/votre_username/public_html
npm install --production
```

Puis redémarrez l'application.

---

### 6. ❌ Port incorrect ou déjà utilisé

#### Symptôme :
Erreur "EADDRINUSE" ou "Port already in use" dans les logs

#### Solution :
1. Hostinger assigne automatiquement un port
2. Vérifiez dans le panneau Node.js quel port est assigné
3. Le serveur doit écouter sur `process.env.PORT || 3000`

Vérifiez dans `server.js` :
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
```

---

## 🔍 Diagnostic étape par étape

### Étape 1 : Vérifier le type d'hébergement
```
Panneau Hostinger > Voir si "Node.js" est disponible dans le menu
```
- ✅ Oui → Passez à l'étape 2
- ❌ Non → Votre plan ne supporte pas Node.js, upgradez ou utilisez Render/Railway

### Étape 2 : Vérifier l'application Node.js
```
Panneau Hostinger > Hébergement > Applications Node.js
```
- ✅ Application existe et status "Running" → Passez à l'étape 3
- ⚠️ Application existe mais "Stopped" → Démarrez-la et testez
- ❌ Aucune application → Créez-la en suivant HOSTINGER_DEPLOYMENT.md

### Étape 3 : Tester l'API directement
```
Ouvrez dans le navigateur : https://votre-domaine.com/api/health
```
- ✅ Retourne un JSON → L'app fonctionne, testez signup à nouveau
- ❌ Erreur 404 → Le domaine ne pointe pas vers Node.js (Étape 4)
- ❌ Autre erreur → Vérifiez les logs de l'application

### Étape 4 : Vérifier le domaine
```
Panneau > Applications Node.js > Votre app > Section Domaine
```
- Assignez votre domaine si ce n'est pas fait
- Attendez 5-10 minutes
- Retestez l'étape 3

### Étape 5 : Vérifier les logs
```
Panneau > Applications Node.js > Votre app > Logs
```
Recherchez les erreurs :
- "module not found" → `npm install`
- "JWT_SECRET" ou variables manquantes → Ajoutez les variables d'environnement
- "EADDRINUSE" → Redémarrez l'application

---

## 🎯 Solutions rapides selon votre situation

### Situation A : Vous avez un hébergement VPS/Cloud Hostinger
1. Créez l'application Node.js dans le panneau
2. Uploadez tous les fichiers
3. SSH : `npm install`
4. Démarrez l'application
5. Assignez le domaine

### Situation B : Vous avez un hébergement web partagé
❌ **Impossible de faire tourner MatchMates**

**Alternatives gratuites :**
- [Render.com](https://render.com) - Gratuit avec Node.js + PostgreSQL
- [Railway.app](https://railway.app) - $5/mois de crédit gratuit
- [Vercel](https://vercel.com) - Gratuit pour projets personnels
- [Fly.io](https://fly.io) - Gratuit jusqu'à 3 apps

### Situation C : L'app démarre mais s'arrête
1. Vérifiez les logs pour l'erreur exacte
2. Installez les dépendances : `npm install`
3. Ajoutez les variables d'environnement
4. Vérifiez que SQLite est supporté (sinon utilisez PostgreSQL)

---

## 📞 Obtenir de l'aide

### Informations à fournir pour un diagnostic :

1. **Type d'hébergement Hostinger** (Partagé / VPS / Cloud)
2. **Statut de l'application Node.js** (En cours / Arrêté / N'existe pas)
3. **Résultat du test** `https://votre-domaine.com/api/health`
4. **Logs de l'application** (copier les 20 dernières lignes)
5. **Variables d'environnement** (listez-les, SANS les valeurs secrètes)

### Support Hostinger :
- Chat en direct : disponible 24/7
- Demandez spécifiquement de l'aide pour "déployer une application Node.js Express"

---

## ✅ Checklist de vérification

- [ ] J'ai un hébergement compatible Node.js (VPS/Cloud)
- [ ] L'application Node.js est créée dans le panneau
- [ ] L'application a le statut "Running"
- [ ] Le fichier `app.js` existe à la racine
- [ ] `package.json` a `"main": "app.js"`
- [ ] Les dépendances sont installées (`npm install` effectué)
- [ ] Les variables d'environnement sont configurées
- [ ] Le domaine est assigné à l'application
- [ ] Test `https://domaine.com/api/health` retourne un JSON
- [ ] Les logs ne montrent pas d'erreur

Si tous les points sont cochés et ça ne fonctionne toujours pas, contactez le support Hostinger.
