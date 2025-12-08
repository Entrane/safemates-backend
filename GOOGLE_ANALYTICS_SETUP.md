# Configuration Google Analytics 4 pour MatchMates

## 1. Créer votre compte Google Analytics

1. Allez sur **https://analytics.google.com/**
2. Cliquez sur **"Commencer à mesurer"**
3. Créez un compte :
   - Nom du compte : **MatchMates**
   - Paramètres de partage de données : à votre convenance
4. Créez une propriété :
   - Nom de la propriété : **MatchMates - safemates.fr**
   - Fuseau horaire : **France (GMT+1)**
   - Devise : **Euro (EUR)**
5. Sélectionnez la catégorie : **Jeux**
6. Choisissez la plateforme : **Web**
7. Configurez le flux de données :
   - URL du site web : **https://safemates.fr**
   - Nom du flux : **Site principal**
8. **IMPORTANT** : Copiez votre **ID de mesure** (format: `G-XXXXXXXXXX`)

---

## 2. Remplacer l'ID de mesure dans vos fichiers

### Dans `analytics.js` (ligne 11) :
```javascript
// REMPLACEZ cette ligne :
gtag('config', 'G-XXXXXXXXXX', {

// PAR (avec votre véritable ID) :
gtag('config', 'G-ABC123DEFG', {
```

### Dans CHAQUE fichier HTML (dans la section `<head>`) :
Remplacez :
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

Par (avec votre véritable ID) :
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEFG"></script>
```

---

## 3. Ajouter Google Analytics aux pages HTML

Ajoutez ces lignes **avant la balise `</head>`** dans chaque page HTML :

```html
  <!-- Google Analytics 4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script src="analytics.js"></script>
</head>
```

### Pages à modifier :

✅ **index.html** - Déjà fait
- [ ] **dashboard.html**
- [ ] **game.html**
- [ ] **login.html**
- [ ] **signup.html**
- [ ] **profile.html**
- [ ] **contact.html**
- [ ] **moderation.html**
- [ ] **404.html**
- [ ] **500.html**

---

## 4. Uploader les fichiers sur Hostinger

Uploadez ces fichiers :
1. **analytics.js** (nouveau fichier)
2. **Tous les fichiers HTML modifiés**

---

## 5. Vérifier que ça fonctionne

1. Allez sur **https://analytics.google.com/**
2. Sélectionnez votre propriété **MatchMates**
3. Allez dans **Rapports** → **Temps réel**
4. Ouvrez **https://safemates.fr** dans un autre onglet
5. Vous devriez voir **1 utilisateur actif** dans Google Analytics en temps réel !

---

## 6. Événements personnalisés trackés

L'intégration actuelle track automatiquement :

### Événements de base (automatiques) :
- ✅ **page_view** : Chaque page visitée
- ✅ **session_start** : Début de session
- ✅ **first_visit** : Première visite d'un utilisateur

### Événements personnalisés (dans analytics.js) :
- ✅ **game_click** : Clic sur une carte de jeu
  - Paramètre : `game_name` (valorant, lol, etc.)
- ✅ **sign_up_attempt** : Tentative d'inscription
- ✅ **login_attempt** : Tentative de connexion

---

## 7. Métriques disponibles dans Google Analytics

Après quelques jours, vous pourrez voir :

### Audience :
- Nombre de visiteurs uniques
- Nombre de sessions
- Durée moyenne des sessions
- Taux de rebond
- Pages vues par session

### Acquisition :
- D'où viennent vos visiteurs (Google, réseaux sociaux, etc.)
- Mots-clés utilisés (si recherche Google)

### Comportement :
- Pages les plus visitées
- Jeux les plus cliqués
- Parcours des utilisateurs sur le site

### Conversions :
- Nombre d'inscriptions
- Nombre de connexions
- Taux de conversion inscription

---

## 8. Ajouter plus d'événements personnalisés (optionnel)

Pour tracker d'autres actions, utilisez la fonction `trackEvent()` :

```javascript
// Exemple : tracker la recherche de partenaire
trackEvent('partner_search', {
    'game_name': 'valorant',
    'rank': 'gold2'
});

// Exemple : tracker l'ajout d'ami
trackEvent('friend_add', {
    'friend_username': 'JoueusePro123'
});

// Exemple : tracker l'envoi de message
trackEvent('message_sent', {
    'recipient': 'username'
});
```

---

## 9. Respecter le RGPD

⚠️ **IMPORTANT** : Pour être conforme au RGPD, vous devez :

1. **Ajouter une bannière de cookies** sur votre site
2. **Demander le consentement** avant d'activer Google Analytics
3. **Avoir une page "Politique de confidentialité"**

Je peux vous aider à créer une bannière de cookies si vous le souhaitez !

---

## Ressources utiles

- **Google Analytics** : https://analytics.google.com/
- **Documentation GA4** : https://support.google.com/analytics
- **Google Tag Assistant** (extension Chrome) : Pour vérifier que GA fonctionne
