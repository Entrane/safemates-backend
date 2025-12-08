# Guide de déploiement sur Railway

Ce guide vous aide à déployer SafeMates sur Railway.

## Prérequis
- Un compte Railway ([railway.app](https://railway.app))
- Le projet SafeMates prêt à être déployé

## Configuration des variables d'environnement sur Railway

Dans le dashboard Railway, configurez les variables d'environnement suivantes :

### Variables obligatoires :

```bash
NODE_ENV=production
JWT_SECRET=votre_cle_secrete_tres_longue_et_securisee_a_changer_absolument
JWT_EXPIRATION=24h
DATABASE_PATH=./database.sqlite
BCRYPT_ROUNDS=12
```

### Variables optionnelles (recommandées) :

```bash
ALLOWED_ORIGINS=https://*.railway.app
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MS=900000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_TIMEOUT_MINUTES=30
```

## Important : JWT_SECRET

⚠️ **TRÈS IMPORTANT** : Générez une clé JWT secrète unique et sécurisée !

Pour générer une clé sécurisée, utilisez cette commande :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiez la valeur générée et utilisez-la comme valeur pour `JWT_SECRET` dans Railway.

## Étapes de déploiement

1. **Créer un nouveau projet sur Railway**
   - Connectez-vous à Railway
   - Cliquez sur "New Project"
   - Sélectionnez "Deploy from GitHub repo"
   - Autorisez Railway à accéder à votre repository

2. **Configuration du projet**
   - Railway détectera automatiquement qu'il s'agit d'une application Node.js
   - Il utilisera automatiquement `npm start` pour démarrer l'application

3. **Ajouter les variables d'environnement**
   - Dans le dashboard du projet, allez dans l'onglet "Variables"
   - Ajoutez toutes les variables listées ci-dessus
   - N'oubliez pas de générer et définir JWT_SECRET !

4. **Déploiement**
   - Railway déploiera automatiquement votre application
   - Attendez que le build se termine
   - Une URL sera générée (ex: `https://votre-app.up.railway.app`)

5. **Configuration CORS automatique**
   - Le code est configuré pour détecter automatiquement l'environnement Railway
   - Les requêtes depuis votre domaine Railway seront automatiquement autorisées

## Vérification du déploiement

1. Accédez à l'URL générée par Railway
2. Testez l'inscription d'un nouveau compte
3. Testez la connexion
4. Vérifiez que le chat et les fonctionnalités sociales fonctionnent

## Problèmes courants

### Erreur "invalid_credentials"
- Vérifiez que JWT_SECRET est bien défini dans les variables d'environnement Railway
- Assurez-vous que ALLOWED_ORIGINS inclut votre domaine Railway

### Erreur CORS
- Vérifiez que NODE_ENV=production est défini
- Le code gère automatiquement les domaines Railway en production

### Base de données vide
- Railway crée une nouvelle base SQLite à chaque déploiement
- Pour persister les données, configurez un volume persistent dans Railway

## Persistence des données (optionnel)

Pour conserver les données entre les redéploiements :

1. Dans Railway, allez dans "Settings" > "Volumes"
2. Créez un nouveau volume
3. Montez-le sur le chemin `/app/database.sqlite`

## Logs et débogage

Pour voir les logs de votre application :
1. Allez dans l'onglet "Deployments"
2. Cliquez sur le déploiement actif
3. Vous verrez les logs en temps réel

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans Railway
2. Assurez-vous que toutes les variables d'environnement sont définies
3. Vérifiez que JWT_SECRET est bien une longue chaîne aléatoire

## Sécurité

⚠️ **Points de sécurité importants** :
- Ne committez JAMAIS le fichier .env dans Git
- Utilisez toujours une clé JWT_SECRET unique et complexe
- Changez JWT_SECRET régulièrement en production
- Activez le rate limiting en production
