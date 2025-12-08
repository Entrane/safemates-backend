# ⚡ Installation Rapide - MatchMates Sécurisé

## 🚀 Démarrage en 5 Minutes

### Étape 1 : Installer les Dépendances ✅

```bash
npm install
```

### Étape 2 : Configurer l'Environnement 🔧

```bash
# Copier le fichier d'exemple
cp .env.example .env
```

### Étape 3 : Générer une Clé JWT Sécurisée 🔐

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Copiez la clé générée** et remplacez-la dans `.env` :

```env
JWT_SECRET=LA_CLE_QUE_VOUS_VENEZ_DE_GENERER
```

### Étape 4 : Lancer l'Application 🎉

```bash
npm start
```

Ouvrez votre navigateur : **http://localhost:3000**

---

## ✨ C'est tout ! Votre application est maintenant sécurisée

### 🛡️ Protections actives :

- ✅ Rate Limiting (anti brute force)
- ✅ Validation des données (anti injection)
- ✅ Sanitisation XSS
- ✅ Headers de sécurité HTTP
- ✅ CORS configuré
- ✅ JWT sécurisé
- ✅ Logging de sécurité
- ✅ Détection d'activité suspecte

---

## 📝 Configuration Minimale (.env)

Modifiez uniquement ces lignes dans `.env` :

```env
# 1. OBLIGATOIRE - Changez cette clé !
JWT_SECRET=COLLEZ_VOTRE_CLE_GENEREE_ICI

# 2. Optionnel - Votre domaine en production
ALLOWED_ORIGINS=http://localhost:3000,https://votredomaine.com
```

---

## 🧪 Tester Rapidement

### Test 1 : Inscription

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Password123"}'
```

**Résultat attendu :** Token JWT retourné

### Test 2 : Connexion

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

**Résultat attendu :** Token JWT retourné

### Test 3 : Protection Brute Force

```bash
# 6 tentatives rapides avec mauvais mot de passe
for i in {1..6}; do
  curl -X POST http://localhost:3000/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nTentative $i - Status: %{http_code}\n"
  sleep 1
done
```

**Résultat attendu :**
- Tentatives 1-5 : Status 401
- Tentative 6 : Status 429 (Compte bloqué)

---

## 📊 Voir les Logs de Sécurité

```bash
# Logs en temps réel
tail -f logs/security.log

# Tentatives de connexion échouées
grep "failed_login" logs/security.log

# Comptes verrouillés
grep "account_locked" logs/security.log
```

---

## ⚙️ Commandes Utiles

```bash
# Démarrer le serveur
npm start

# Développement avec redémarrage auto
npm run dev

# Vérifier les vulnérabilités
npm audit

# Générer une nouvelle clé JWT
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🆘 Problèmes Courants

### Le serveur ne démarre pas

```bash
# Vérifier que Node.js est installé
node --version  # Doit être 16+

# Réinstaller les dépendances
rm -rf node_modules
npm install
```

### Erreur "JWT_SECRET not found"

Vérifiez que le fichier `.env` existe et contient :
```env
JWT_SECRET=votre_cle_ici
```

### Port 3000 déjà utilisé

Changez le port dans `.env` :
```env
PORT=3001
```

---

## 📖 Documentation Complète

Pour aller plus loin :

- **[README_SECURITY.md](README_SECURITY.md)** - Vue d'ensemble de la sécurité
- **[SECURITY.md](SECURITY.md)** - Documentation détaillée
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Déploiement en production
- **[TEST_SECURITY.md](TEST_SECURITY.md)** - Tests de sécurité

---

## ✅ Checklist Post-Installation

- [ ] Dépendances installées (`npm install`)
- [ ] Fichier `.env` créé et configuré
- [ ] Clé JWT générée et remplacée
- [ ] Serveur démarre sans erreurs
- [ ] Test d'inscription fonctionne
- [ ] Test de connexion fonctionne
- [ ] Logs de sécurité créés dans `/logs`

---

## 🎯 Prochaines Étapes

### Pour le Développement
- Testez l'application : http://localhost:3000
- Consultez les logs : `logs/security.log`
- Lisez [SECURITY.md](SECURITY.md) pour comprendre les protections

### Pour la Production
- Lisez [DEPLOYMENT.md](DEPLOYMENT.md) en détail
- Configurez un reverse proxy (Nginx)
- Activez HTTPS avec Let's Encrypt
- Configurez les sauvegardes automatiques

---

## 🌟 Fonctionnalités de Sécurité

### Authentification
- ✅ Hachage bcrypt (12 rounds)
- ✅ JWT avec expiration
- ✅ Protection brute force
- ✅ Logging des tentatives

### Validation
- ✅ Username : 3-20 caractères alphanumériques
- ✅ Email : Format valide
- ✅ Password : Min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
- ✅ Sanitisation XSS automatique

### Rate Limiting
- ✅ Connexion : 5 tentatives / 15 min
- ✅ Inscription : 3 / heure
- ✅ Messages : 20 / minute
- ✅ Recherche : 10 / minute

---

**Votre application est prête et sécurisée ! 🎉**

Pour toute question, consultez la documentation ou les logs de sécurité.

---

**Dernière mise à jour :** 2025-11-24
**Version :** 2.0 - Sécurisée
