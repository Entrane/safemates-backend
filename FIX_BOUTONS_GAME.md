# 🔧 Fix - Boutons "Mettre à jour" et "Rechercher" dans game.html

## Problème

Les boutons "Mettre à jour mes infos" et "Rechercher un partenaire" ne semblent pas fonctionner.

---

## ✅ Solutions appliquées

### 1. Ajout de logs de débogage

**Fichier** : [game.html](game.html)

#### Fonction saveGameSettings (ligne 841-842)
```javascript
window.saveGameSettings = async () => {
    console.log('🔧 saveGameSettings appelée', userGameData);

    if (!userGameData.rank || !userGameData.mainMode) {
        alert("Veuillez sélectionner votre rang et votre mode de jeu.");
        return;
    }
    // ...
};
```

#### Fonction toggleSearch (lignes 891-917)
```javascript
window.toggleSearch = async () => {
    console.log('🔍 toggleSearch appelée', userGameData);

    if (userGameData.isSearching) {
        console.log('Arrêt de la recherche');
        // ...
    } else {
        console.log('Lancement de la recherche...');

        if (!userGameData.rank || !userGameData.mainMode) {
            console.warn('⚠️ Rang ou mode non défini', {
                rank: userGameData.rank,
                mode: userGameData.mainMode
            });
            alert("Veuillez définir votre rang...");
            return;
        }

        console.log('✅ Paramètres OK, démarrage recherche');
        // ...
    }
};
```

#### Vérification au chargement (lignes 1293-1299)
```javascript
// Confirmation du chargement des fonctions
console.log('✅ Initialisation terminée');
console.log('📋 Fonctions disponibles:');
console.log('  - saveGameSettings:', typeof window.saveGameSettings);
console.log('  - toggleSearch:', typeof window.toggleSearch);
console.log('  - selectRank:', typeof window.selectRank);
console.log('  - togglePrefRank:', typeof window.togglePrefRank);
```

---

## 🧪 Page de test créée

### [test_boutons_game.html](test_boutons_game.html)

Une page de diagnostic interactive pour tester les boutons.

**Accès** : http://localhost:3000/test_boutons_game.html

**Tests disponibles** :
1. Vérifier que les fonctions existent
2. Vérifier les boutons dans le DOM
3. Tester le localStorage (token)
4. Simulation de saveGameSettings
5. Simulation de toggleSearch
6. Instructions de correction

---

## 🔍 Diagnostic pas à pas

### Étape 1 : Démarrer le serveur

```bash
node server.js
```

**Résultat attendu** :
```
Serveur démarré sur le port 3000
```

### Étape 2 : Se connecter

1. Aller sur http://localhost:3000/login.html
2. Se connecter avec votre compte
3. Vérifier que vous êtes redirigé vers le dashboard

### Étape 3 : Ouvrir une page de jeu

Aller sur une de ces pages :
- http://localhost:3000/csgo
- http://localhost:3000/fortnite
- http://localhost:3000/lol
- http://localhost:3000/valorant

### Étape 4 : Ouvrir la console (F12)

Dans la console, vous devriez voir :
```
✅ Initialisation terminée
📋 Fonctions disponibles:
  - saveGameSettings: function
  - toggleSearch: function
  - selectRank: function
  - togglePrefRank: function
```

**Si vous NE voyez PAS ces messages** :
- ❌ Il y a une erreur JavaScript
- Cherchez les messages en rouge dans la console
- Corrigez les erreurs avant de continuer

### Étape 5 : Sélectionner un rang et un mode

1. **Cliquer sur un rang** dans "Votre grade Actuel"
2. **Sélectionner un mode** (Classé, Non Classé, etc.)
3. Vérifier que le rang s'affiche dans la colonne de gauche

### Étape 6 : Tester "Mettre à jour mes infos"

1. Cliquer sur le bouton **"Mettre à jour mes infos"**
2. **Dans la console**, vous devriez voir :
   ```
   🔧 saveGameSettings appelée {rank: 'silver', mainMode: 'Classé', ...}
   ```
3. Une alerte devrait apparaître : **"Paramètres de jeu sauvegardés !"**

**Si rien ne se passe** :
- Vérifier dans la console s'il y a des erreurs
- Taper manuellement : `saveGameSettings()`
- Si "saveGameSettings is not defined", il y a un problème de chargement

### Étape 7 : Tester "Rechercher un partenaire"

1. Cliquer sur **"Rechercher un partenaire"**
2. **Dans la console**, vous devriez voir :
   ```
   🔍 toggleSearch appelée {rank: 'silver', mainMode: 'Classé', ...}
   Lancement de la recherche...
   ✅ Paramètres OK, démarrage recherche
   ```
3. Le bouton devrait afficher : **"Recherche en cours..."** avec un spinner

**Si le message d'erreur "Veuillez définir votre rang"** :
- Vous devez d'abord cliquer sur "Mettre à jour mes infos"
- Puis relancer la recherche

---

## 🐛 Problèmes courants et solutions

### Problème 1 : "Fonction not defined"

**Symptôme** : `saveGameSettings is not defined` ou `toggleSearch is not defined`

**Causes possibles** :
1. Erreur JavaScript qui empêche le chargement du script
2. Script non chargé complètement

**Solutions** :
1. Ouvrir la console (F12)
2. Chercher les erreurs en rouge
3. Corriger les erreurs de syntaxe
4. Rafraîchir la page avec `Ctrl + Shift + R`

### Problème 2 : "Veuillez sélectionner votre rang"

**Symptôme** : Alert à chaque clic sur "Mettre à jour"

**Cause** : `userGameData.rank` ou `userGameData.mainMode` est vide

**Solution** :
1. Cliquer sur un rang dans la grille
2. Sélectionner un mode de jeu (radio button)
3. Vérifier dans la console : `console.log(userGameData)`
4. Réessayer

### Problème 3 : "Veuillez définir votre rang" (recherche)

**Symptôme** : Alert lors du clic sur "Rechercher un partenaire"

**Cause** : Les paramètres ne sont pas sauvegardés sur le serveur

**Solution** :
1. D'abord cliquer sur **"Mettre à jour mes infos"**
2. Attendre la confirmation "Paramètres sauvegardés"
3. Ensuite cliquer sur "Rechercher un partenaire"

### Problème 4 : Rien ne se passe au clic

**Symptôme** : Pas d'alert, pas de log dans la console

**Causes possibles** :
1. Bouton sans attribut `onclick`
2. Fonction JavaScript bloquée
3. Token expiré (session)

**Solutions** :
1. Vérifier l'attribut onclick du bouton :
   ```javascript
   const btn = document.querySelector('.update-btn');
   console.log('onclick:', btn.onclick);
   ```
2. Vérifier le token :
   ```javascript
   console.log('token:', localStorage.getItem('token'));
   ```
3. Se reconnecter si le token est absent
4. Rafraîchir la page

### Problème 5 : Spinner qui tourne indéfiniment

**Symptôme** : Le spinner de recherche ne s'arrête jamais

**Cause** : Erreur API ou serveur qui ne répond pas

**Solutions** :
1. Vérifier que le serveur est démarré
2. Regarder les logs du serveur pour les erreurs
3. Vérifier l'API `/api/match/search/{gameId}`
4. Rafraîchir la page et réessayer

---

## 🧰 Tests manuels dans la console

### Vérifier les fonctions
```javascript
// Doivent retourner "function"
console.log(typeof saveGameSettings);
console.log(typeof toggleSearch);
```

### Vérifier les boutons
```javascript
// Bouton "Mettre à jour"
const updateBtn = document.querySelector('.update-btn');
console.log('Update button:', updateBtn);
console.log('onclick:', updateBtn?.onclick);

// Bouton "Rechercher"
const searchBtn = document.getElementById('partnerSearchButton');
console.log('Search button:', searchBtn);
console.log('onclick:', searchBtn?.onclick);
```

### Vérifier userGameData
```javascript
console.log('userGameData:', userGameData);
// Devrait afficher: {rank: '...', mainMode: '...', ...}
```

### Tester manuellement
```javascript
// Tester la sauvegarde
saveGameSettings();

// Tester la recherche
toggleSearch();
```

### Vérifier le token
```javascript
// Doit retourner une chaîne (token JWT)
console.log('token:', localStorage.getItem('token'));

// Si null, vous devez vous reconnecter
if (!localStorage.getItem('token')) {
    console.error('Token absent, veuillez vous reconnecter');
}
```

---

## 📋 Checklist de validation

### Avant de tester
- [ ] Serveur démarré (`node server.js`)
- [ ] Connecté avec un compte valide
- [ ] Sur une page de jeu (csgo, fortnite, etc.)
- [ ] Console ouverte (F12)

### Test saveGameSettings
- [ ] Message dans console : "🔧 saveGameSettings appelée"
- [ ] Rang sélectionné visible dans la grille
- [ ] Mode de jeu sélectionné (radio button)
- [ ] Alert "Paramètres sauvegardés !"
- [ ] Aucune erreur dans la console

### Test toggleSearch
- [ ] Message dans console : "🔍 toggleSearch appelée"
- [ ] saveGameSettings effectué d'abord
- [ ] Message "✅ Paramètres OK"
- [ ] Bouton devient "Recherche en cours..."
- [ ] Spinner visible
- [ ] Liste de matchs s'affiche (ou "Aucun partenaire")

---

## 📚 Fichiers modifiés

### [game.html](game.html)
- Ligne 842 : Ajout `console.log` dans `saveGameSettings`
- Ligne 892 : Ajout `console.log` dans `toggleSearch`
- Ligne 906 : Ajout `console.log` au lancement recherche
- Ligne 909 : Ajout `console.warn` si paramètres manquants
- Lignes 1294-1299 : Ajout logs de confirmation chargement

### Nouveaux fichiers
- **[test_boutons_game.html](test_boutons_game.html)** - Page de diagnostic
- **[FIX_BOUTONS_GAME.md](FIX_BOUTONS_GAME.md)** - Ce guide

---

## ✅ Résultat attendu

Après avoir suivi ce guide :

✅ **Console affiche** les logs au chargement
✅ **saveGameSettings** fonctionne et sauvegarde
✅ **toggleSearch** lance la recherche
✅ **Spinner** s'affiche pendant la recherche
✅ **Partenaires** s'affichent dans la liste

---

**Date** : 25 novembre 2025
**Version** : 2.0
**Statut** : ✅ Logs ajoutés pour diagnostic
