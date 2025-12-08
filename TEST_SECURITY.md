# 🧪 Tests de Sécurité - MatchMates

Ce document contient des tests manuels pour vérifier que toutes les protections de sécurité fonctionnent correctement.

## Table des tests

1. [Rate Limiting](#1-rate-limiting)
2. [Protection Brute Force](#2-protection-brute-force)
3. [Validation des Données](#3-validation-des-données)
4. [Headers de Sécurité](#4-headers-de-sécurité)
5. [CORS](#5-cors)
6. [Détection XSS](#6-détection-xss)
7. [JWT et Autorisation](#7-jwt-et-autorisation)

---

## 1. Rate Limiting

### Test : Limite de tentatives de connexion

**Objectif :** Vérifier que l'endpoint `/login` est limité à 5 tentatives

```bash
# Effectuer 6 tentatives rapides
for i in {1..6}; do
  curl -X POST http://localhost:3000/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrongpass"}' \
    -w "\nStatus: %{http_code}\n\n"
  sleep 1
done
```

**Résultat attendu :**
- Requêtes 1-5 : Status 401 (Unauthorized)
- Requête 6 : Status 429 (Too Many Requests) avec message de verrouillage

### Test : Limite de messages

**Objectif :** Vérifier que l'envoi de messages est limité à 20/minute

```bash
# Obtenir un token valide d'abord
TOKEN="votre_token_jwt"

# Envoyer 21 messages rapidement
for i in {1..21}; do
  curl -X POST http://localhost:3000/api/messages \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"toUsername":"friend1","content":"Test message"}' \
    -w "\nMessage $i - Status: %{http_code}\n"
done
```

**Résultat attendu :**
- Messages 1-20 : Status 200
- Message 21 : Status 429

---

## 2. Protection Brute Force

### Test : Verrouillage de compte

**Objectif :** Vérifier que le compte se verrouille après 5 tentatives échouées

```bash
# 5 tentatives avec mauvais mot de passe
for i in {1..5}; do
  echo "Tentative $i"
  curl -X POST http://localhost:3000/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}' \
    -s | jq
  sleep 2
done

# 6ème tentative - devrait être bloquée
echo "Tentative 6 (devrait être bloquée)"
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"correctpassword"}' \
  -s | jq
```

**Résultat attendu :**
- Tentatives 1-5 : `{"error":"invalid_credentials"}`
- Tentative 6 : `{"error":"account_locked","message":"Compte temporairement verrouillé..."}`

### Test : Déverrouillage après expiration

**Objectif :** Vérifier que le compte se déverrouille après 15 minutes

```bash
# Après 15 minutes d'attente, retry
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"correctpassword"}' \
  -s | jq
```

**Résultat attendu :**
- Status 200 avec token JWT

---

## 3. Validation des Données

### Test : Validation du mot de passe

**Objectif :** Vérifier que les mots de passe faibles sont rejetés

```bash
# Mot de passe trop court
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"abc123"}' \
  -s | jq

# Mot de passe sans majuscule
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123"}' \
  -s | jq

# Mot de passe valide
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Password123"}' \
  -s | jq
```

**Résultat attendu :**
- Premiers tests : Status 400 avec message d'erreur de validation
- Dernier test : Status 200 avec token

### Test : Validation du username

**Objectif :** Vérifier que les caractères spéciaux sont rejetés

```bash
# Username avec caractères invalides
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test@user","email":"test@test.com","password":"Password123"}' \
  -s | jq

# Username trop court
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ab","email":"test@test.com","password":"Password123"}' \
  -s | jq
```

**Résultat attendu :**
- Status 400 avec erreur de validation

### Test : Sanitisation XSS

**Objectif :** Vérifier que le contenu HTML est nettoyé

```bash
TOKEN="votre_token_jwt"

# Message avec script
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"toUsername":"friend1","content":"<script>alert(\"XSS\")</script>Hello"}' \
  -s | jq

# Vérifier que le message est nettoyé
curl -X GET http://localhost:3000/api/messages/friend1 \
  -H "Authorization: Bearer $TOKEN" \
  -s | jq
```

**Résultat attendu :**
- Le script doit être supprimé du message
- Contenu reçu : "Hello" (sans les balises)

---

## 4. Headers de Sécurité

### Test : Vérification des headers HTTP

**Objectif :** Vérifier la présence des headers de sécurité

```bash
curl -I http://localhost:3000
```

**Résultat attendu :**

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'...
```

---

## 5. CORS

### Test : Origine autorisée

**Objectif :** Vérifier que CORS accepte les origines autorisées

```bash
curl -X POST http://localhost:3000/api/friends \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -v
```

**Résultat attendu :**
- Header `Access-Control-Allow-Origin: http://localhost:3000` présent

### Test : Origine non autorisée

**Objectif :** Vérifier que CORS bloque les origines non autorisées

```bash
curl -X POST http://localhost:3000/api/friends \
  -H "Origin: http://evil.com" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -v
```

**Résultat attendu :**
- Pas de header `Access-Control-Allow-Origin` OU erreur CORS

---

## 6. Détection XSS

### Test : Tentative XSS dans le username

**Objectif :** Vérifier la détection et le nettoyage

```bash
# Inscription avec script dans le username
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"username":"<script>alert(1)</script>","email":"xss@test.com","password":"Password123"}' \
  -s | jq
```

**Résultat attendu :**
- Erreur de validation (format username invalide)
- Log dans `logs/security.log` avec `xss_attempt`

### Test : Tentative injection dans les messages

**Objectif :** Vérifier la sanitisation automatique

```bash
TOKEN="votre_token_jwt"

curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"toUsername":"friend1","content":"<img src=x onerror=alert(1)>"}' \
  -s | jq
```

**Résultat attendu :**
- Message envoyé mais nettoyé
- Contenu sans les attributs dangereux

---

## 7. JWT et Autorisation

### Test : Accès sans token

**Objectif :** Vérifier que les endpoints protégés rejettent les requêtes sans token

```bash
curl -X GET http://localhost:3000/api/friends \
  -H "Content-Type: application/json" \
  -s | jq
```

**Résultat attendu :**
- Status 401
- `{"error":"unauthorized","message":"Token manquant ou format invalide."}`

### Test : Token expiré

**Objectif :** Vérifier le rejet des tokens expirés

```bash
# Utiliser un vieux token (généré il y a plus de 24h)
OLD_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/api/friends \
  -H "Authorization: Bearer $OLD_TOKEN" \
  -s | jq
```

**Résultat attendu :**
- Status 401
- `{"error":"unauthorized","message":"Token invalide ou expiré."}`

### Test : Token valide

**Objectif :** Vérifier l'accès avec un token valide

```bash
# Se connecter d'abord pour obtenir un token
TOKEN=$(curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}' \
  -s | jq -r '.token')

# Utiliser le token
curl -X GET http://localhost:3000/api/friends \
  -H "Authorization: Bearer $TOKEN" \
  -s | jq
```

**Résultat attendu :**
- Status 200
- Données de l'utilisateur

---

## Vérification des Logs

### Logs de Sécurité

```bash
# Voir les tentatives de connexion échouées
grep "failed_login" logs/security.log

# Voir les comptes verrouillés
grep "account_locked" logs/security.log

# Voir les violations de rate limit
grep "rate_limit_exceeded" logs/security.log

# Voir les tentatives XSS
grep "xss_attempt" logs/security.log

# Voir les accès non autorisés
grep "unauthorized_access" logs/security.log
```

### Logs d'Erreurs

```bash
# Voir toutes les erreurs
tail -f logs/error.log

# Filtrer les erreurs SQL
grep "sql_error" logs/security.log
```

---

## Tests Automatisés avec Jest (Bonus)

Créer un fichier `security.test.js` :

```javascript
const request = require('supertest');
const app = require('./server');

describe('Security Tests', () => {
  describe('Rate Limiting', () => {
    it('should block after 5 failed login attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/login')
          .send({ email: 'test@test.com', password: 'wrong' });
      }

      const res = await request(app)
        .post('/login')
        .send({ email: 'test@test.com', password: 'wrong' });

      expect(res.status).toBe(429);
      expect(res.body.error).toBe('too_many_login_attempts');
    });
  });

  describe('Input Validation', () => {
    it('should reject weak passwords', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          username: 'test',
          email: 'test@test.com',
          password: 'weak'
        });

      expect(res.status).toBe(400);
    });

    it('should reject XSS in username', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          username: '<script>alert(1)</script>',
          email: 'test@test.com',
          password: 'Password123'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('JWT Authentication', () => {
    it('should reject requests without token', async () => {
      const res = await request(app)
        .get('/api/friends');

      expect(res.status).toBe(401);
    });

    it('should reject invalid tokens', async () => {
      const res = await request(app)
        .get('/api/friends')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.status).toBe(401);
    });
  });
});
```

Lancer les tests :

```bash
npm install --save-dev jest supertest
npm test
```

---

## Checklist de Vérification

- [ ] Rate limiting fonctionne sur tous les endpoints critiques
- [ ] Protection brute force verrouille les comptes après 5 tentatives
- [ ] Validation rejette les données invalides (email, username, password)
- [ ] Sanitisation XSS nettoie correctement les entrées
- [ ] Headers de sécurité sont présents
- [ ] CORS autorise uniquement les origines configurées
- [ ] JWT fonctionne correctement (validation, expiration)
- [ ] Logs de sécurité enregistrent les événements
- [ ] Activité suspecte est détectée et loggée
- [ ] Fichiers sensibles (.env) ne sont pas accessibles

---

## Outils de Test Recommandés

### 1. OWASP ZAP
Scan automatique de vulnérabilités :
```bash
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000
```

### 2. Burp Suite Community
Pour tests manuels avancés et fuzzing

### 3. npm audit
Vérifier les vulnérabilités des dépendances :
```bash
npm audit
npm audit fix
```

### 4. Snyk
Test de sécurité complet :
```bash
npm install -g snyk
snyk test
```

---

**Note :** Ces tests doivent être effectués dans un environnement de test/développement, PAS en production !

**Dernière mise à jour :** 2025-11-24
