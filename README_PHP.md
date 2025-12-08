# MatchMates - Version PHP pour Hostinger

## 🎉 Votre application a été convertie en PHP !

MatchMates fonctionne maintenant avec **PHP + MySQL**, compatible avec **tous les hébergements Hostinger**.

---

## 📚 Documentation

### 🚀 Démarrage rapide (5 minutes)
➡️ Lisez **[DEPLOIEMENT_RAPIDE.md](DEPLOIEMENT_RAPIDE.md)**

### 📖 Guide complet
➡️ Lisez **[PHP_DEPLOYMENT_GUIDE.md](PHP_DEPLOYMENT_GUIDE.md)**

### 📋 Liste des fichiers à uploader
➡️ Lisez **[FICHIERS_A_UPLOADER.txt](FICHIERS_A_UPLOADER.txt)**

### 🔧 Dépannage
➡️ Lisez **[HOSTINGER_TROUBLESHOOTING.md](HOSTINGER_TROUBLESHOOTING.md)**

---

## ⚡ Déploiement en 6 étapes

1. **Uploadez les fichiers** sur Hostinger (voir FICHIERS_A_UPLOADER.txt)
2. **Créez une base de données MySQL** dans le panneau Hostinger
3. **Configurez** `api/config.php` avec vos identifiants de BDD
4. **Exécutez** `/api/install.php?password=matchmates2024`
5. **Supprimez** `api/install.php` après installation
6. **Testez** votre site !

---

## 🧪 Tester avant le déploiement

Une fois uploadé sur Hostinger, testez avec :
```
https://votre-domaine.com/test-api.html
```

Cette page teste :
- ✅ Connexion à l'API
- ✅ Inscription d'un utilisateur
- ✅ Connexion d'un utilisateur

---

## 🔑 Compte admin par défaut

Après installation :
- **Username** : `admin`
- **Password** : `admin123`

⚠️ **CHANGEZ CE MOT DE PASSE IMMÉDIATEMENT !**

---

## 🆕 Modifications apportées

### Backend
- ✅ Backend Node.js remplacé par PHP
- ✅ APIs créées : `signup.php`, `login.php`, `health.php`
- ✅ Support MySQL et SQLite
- ✅ JWT simplifié pour l'authentification

### Frontend
- ✅ `login.html` adapté pour appeler `/api/login.php`
- ✅ `signup.html` adapté pour appeler `/api/signup.php`
- ✅ Gestion des erreurs améliorée

### Configuration
- ✅ `.htaccess` configuré pour Hostinger
- ✅ Réécriture d'URL automatique
- ✅ Compression GZIP activée
- ✅ Cache optimisé

---

## 📁 Structure des fichiers

```
MatchMates/
├── index.html              Page d'accueil
├── signup.html             Inscription
├── login.html              Connexion
├── dashboard.html          Tableau de bord
├── game.html               Profils de jeu
├── moderation.html         Modération
├── test-api.html           🆕 Tests des APIs
├── api/
│   ├── config.php          🆕 Configuration PHP
│   ├── signup.php          🆕 API inscription
│   ├── login.php           🆕 API connexion
│   ├── health.php          🆕 API santé
│   └── install.php         🆕 Installation BDD
├── Image/                  Images du site
├── .htaccess               🆕 Configuration Apache
└── style.css, *.js         Styles et scripts
```

---

## 🔒 Sécurité

### Avant de mettre en production

1. **Changez les secrets** dans `api/config.php` :
   ```php
   define('JWT_SECRET', 'GenerezUnSecretAleatoire');
   define('SESSION_SECRET', 'UnAutreSecretAleatoire');
   ```

2. **Supprimez** `api/install.php` après installation

3. **Activez HTTPS** sur Hostinger (SSL gratuit)

4. **Changez** le mot de passe admin par défaut

---

## ⚠️ Important

### Ce qui fonctionne
- ✅ Inscription / Connexion
- ✅ Authentification JWT
- ✅ Base de données MySQL
- ✅ Profils utilisateurs
- ✅ Pages statiques

### Ce qui nécessite une implémentation supplémentaire
- ⚠️ Chat en temps réel (nécessite WebSockets ou polling)
- ⚠️ Notifications en temps réel
- ⚠️ Matchmaking automatique
- ⚠️ Système d'amis (APIs à créer)
- ⚠️ Modération (APIs à créer)

Ces fonctionnalités peuvent être ajoutées progressivement avec d'autres fichiers PHP.

---

## 🆚 Différences Node.js vs PHP

| Fonctionnalité | Node.js | PHP (Version actuelle) |
|----------------|---------|------------------------|
| Inscription/Connexion | ✅ | ✅ |
| JWT Auth | ✅ | ✅ (simplifié) |
| Base de données | SQLite | MySQL ou SQLite |
| WebSockets (chat temps réel) | ✅ | ❌ (à implémenter) |
| Hébergement requis | VPS/Cloud Node.js | Hébergement partagé |
| Coût minimum | ~5€/mois | ~2€/mois |
| Complexité déploiement | Élevée | Faible |

---

## 📞 Support

### Documentation
- Démarrage rapide : `DEPLOIEMENT_RAPIDE.md`
- Guide complet : `PHP_DEPLOYMENT_GUIDE.md`
- Dépannage : `HOSTINGER_TROUBLESHOOTING.md`

### Problèmes courants
1. **Erreur 500** → Vérifiez `api/config.php`
2. **"Erreur de connexion au serveur"** → Testez `/api/health.php`
3. **APIs ne fonctionnent pas** → Vérifiez le `.htaccess`

### Contacter le support
- Support Hostinger : Chat 24/7 disponible
- Pour les APIs PHP : Vérifiez les logs dans le panneau Hostinger

---

## 🎯 Prochaines étapes

Après le déploiement :
1. Testez l'inscription et la connexion
2. Créez quelques comptes de test
3. Vérifiez que le dashboard fonctionne
4. Implémentez progressivement les fonctionnalités manquantes

---

## ✅ Checklist de déploiement

- [ ] Fichiers uploadés sur Hostinger
- [ ] Base de données MySQL créée
- [ ] `api/config.php` configuré
- [ ] `/api/install.php` exécuté
- [ ] `api/install.php` supprimé
- [ ] Secrets JWT changés
- [ ] Test `/api/health.php` OK
- [ ] Test `/test-api.html` OK
- [ ] HTTPS activé
- [ ] Mot de passe admin changé

---

**Version PHP créée le** : 30 Novembre 2025
**Compatible avec** : Hostinger, cPanel, tous hébergements PHP 7.4+

Bon déploiement ! 🚀
