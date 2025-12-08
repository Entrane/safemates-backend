# Exemple d'intégration du système de signalement

## 🎯 Intégration dans vos pages HTML

### 1. Ajouter le script dans le `<head>` ou avant `</body>`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <title>Ma Page</title>
    <!-- Autres scripts -->
</head>
<body>
    <!-- Votre contenu -->

    <!-- AJOUTER CE SCRIPT -->
    <script src="/report-user.js"></script>
</body>
</html>
```

### 2. Option A : Ajouter un bouton manuel

```html
<div class="user-profile">
    <h3>Profil de Jean123</h3>
    <p>Rank: Gold</p>

    <!-- Bouton de signalement -->
    <button onclick="window.openReportModal('Jean123')"
            style="background: #ef5350; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
        ⚠️ Signaler cet utilisateur
    </button>
</div>
```

### 3. Option B : Ajouter automatiquement le bouton

```javascript
// Dans votre code JavaScript existant
function afficherProfil(username) {
    const container = document.getElementById('profilContainer');

    // Afficher les infos de l'utilisateur
    container.innerHTML = `
        <h3>${username}</h3>
        <p>Rank: Gold</p>
    `;

    // Ajouter automatiquement le bouton de signalement
    window.addReportButton(container, username);
}
```

### 4. Option C : Dans la liste des résultats de matchmaking

```javascript
// Exemple d'intégration dans game.html
function displayMatches(matches) {
    matches.forEach(match => {
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';
        matchCard.innerHTML = `
            <h4>${match.username}</h4>
            <p>Rang: ${match.rank}</p>
            <div class="actions">
                <button onclick="sendFriendRequest('${match.username}')">
                    Ajouter en ami
                </button>
                <button onclick="window.openReportModal('${match.username}')"
                        class="btn-report">
                    ⚠️ Signaler
                </button>
            </div>
        `;
        container.appendChild(matchCard);
    });
}
```

### 5. Dans le chat / messages

```javascript
// Ajouter un bouton de signalement dans l'en-tête du chat
function openChat(username) {
    const chatHeader = document.getElementById('chatHeader');
    chatHeader.innerHTML = `
        <span>Chat avec ${username}</span>
        <button onclick="window.openReportModal('${username}')"
                class="btn-report-small">
            ⚠️
        </button>
    `;
}
```

## 🎨 Personnalisation du style

```css
/* Dans votre fichier CSS */
.btn-report {
    background: #ef5350;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s ease;
}

.btn-report:hover {
    background: #e53935;
}

.btn-report-small {
    background: transparent;
    border: 1px solid #ef5350;
    color: #ef5350;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.btn-report-small:hover {
    background: #ef5350;
    color: white;
}
```

## 📱 Intégration complète dans game.html

### Exemple pour les résultats de matchmaking

Trouver la fonction qui affiche les résultats de recherche et ajouter :

```javascript
// AVANT
function displaySearchResults(matches) {
    resultsContainer.innerHTML = matches.map(match => `
        <div class="match-result">
            <img src="${match.rankImg}">
            <h4>${match.username}</h4>
            <button onclick="addFriend('${match.username}')">Ajouter</button>
        </div>
    `).join('');
}

// APRÈS
function displaySearchResults(matches) {
    resultsContainer.innerHTML = matches.map(match => `
        <div class="match-result">
            <img src="${match.rankImg}">
            <h4>${match.username}</h4>
            <div class="actions">
                <button onclick="addFriend('${match.username}')">Ajouter</button>
                <button onclick="window.openReportModal('${match.username}')"
                        class="btn-report-small">
                    ⚠️ Signaler
                </button>
            </div>
        </div>
    `).join('');
}
```

### Exemple pour la liste d'amis

```javascript
// Dans la fonction loadSocial() ou loadFriends()
function displayFriends(friends) {
    friendsList.innerHTML = friends.map(friend => `
        <div class="friend-item">
            <span>${friend.username}</span>
            <div class="friend-actions">
                <button onclick="openChat('${friend.username}')">
                    💬 Chat
                </button>
                <button onclick="removeFriend('${friend.username}')">
                    ❌ Retirer
                </button>
                <button onclick="window.openReportModal('${friend.username}')"
                        class="btn-report-icon"
                        title="Signaler">
                    ⚠️
                </button>
            </div>
        </div>
    `).join('');
}
```

## 🔗 Lien vers le panneau de modération

### Pour les administrateurs

Ajouter un lien dans la navigation :

```html
<!-- Dans dashboard.html ou dans le menu de navigation -->
<nav>
    <a href="/dashboard">Tableau de bord</a>
    <a href="/game/valorant">Jeux</a>

    <!-- AJOUTER CE LIEN (visible uniquement pour les admins) -->
    <a href="/moderation" id="moderationLink" style="display: none;">
        🛡️ Modération
    </a>
</nav>

<script>
// Vérifier si l'utilisateur est admin
async function checkAdmin() {
    try {
        const response = await fetch('/api/moderation/stats', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            // L'utilisateur est admin, afficher le lien
            document.getElementById('moderationLink').style.display = 'inline-block';
        }
    } catch (error) {
        // Pas admin, ne rien faire
    }
}

checkAdmin();
</script>
```

## ✅ Checklist d'intégration

- [ ] Ajouter `<script src="/report-user.js"></script>` dans les pages HTML
- [ ] Ajouter des boutons de signalement dans les résultats de matchmaking
- [ ] Ajouter des boutons dans la liste d'amis
- [ ] Ajouter des boutons dans l'interface de chat
- [ ] Ajouter un lien vers `/moderation` pour les admins
- [ ] Personnaliser les styles CSS selon votre design
- [ ] Tester le signalement avec différents utilisateurs
- [ ] Vérifier les notifications côté admin

## 🚀 Démarrage rapide

1. **Démarrer le serveur** :
   ```bash
   node server.js
   ```

2. **Se connecter en tant qu'admin** :
   - User ID 1 (Entrane) est automatiquement admin

3. **Tester le signalement** :
   - Connectez-vous avec un autre compte
   - Cliquez sur "Signaler" sur un profil
   - Remplissez le formulaire
   - Envoyez

4. **Vérifier côté admin** :
   - Accédez à http://localhost:3000/moderation
   - Voyez le signalement dans "En attente"
   - Appliquez une sanction ou classez sans suite

---

🎉 **Votre système de modération est prêt !**
