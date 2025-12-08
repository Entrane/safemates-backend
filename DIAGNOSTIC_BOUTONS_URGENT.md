# 🚨 DIAGNOSTIC URGENT - Boutons non fonctionnels

## Problème rapporté
Les boutons **"Mettre à jour mes infos"** et **"Rechercher un partenaire"** ne répondent pas.

---

## ⚡ TEST RAPIDE (2 minutes)

### Étape 1: Ouvrir la page de jeu
```
http://localhost:3000/csgo
```
OU
```
http://localhost:3000/valorant
```

### Étape 2: Ouvrir la console (F12)
1. Appuyer sur **F12**
2. Cliquer sur l'onglet **Console**
3. **NE PAS FERMER LA CONSOLE** pendant le test

### Étape 3: Vérifier les logs d'initialisation
Dans la console, vous DEVEZ voir ces messages dès que la page se charge:
```
✅ Initialisation terminée
📋 Fonctions disponibles:
  - saveGameSettings: function
  - toggleSearch: function
  - selectRank: function
  - togglePrefRank: function
```

**❌ SI VOUS NE VOYEZ PAS CES MESSAGES** → Allez à [Solution A](#solution-a)

**✅ SI VOUS VOYEZ CES MESSAGES** → Continuez à l'étape 4

### Étape 4: Tester le bouton "Mettre à jour"
1. **Sélectionner un rang** (cliquer sur une image de rang)
2. **Sélectionner un mode** (cocher Classé, Non Classé, etc.)
3. Cliquer sur **"Mettre à jour mes infos"**
4. Observer la console

**Vous DEVEZ voir:**
```
🔧 saveGameSettings appelée {rank: 'silver', mainMode: 'Classé', ...}
```

**❌ SI VOUS NE VOYEZ PAS CE LOG** → Allez à [Solution B](#solution-b)

**✅ SI VOUS VOYEZ LE LOG** → Continuez à l'étape 5

### Étape 5: Vérifier l'alert
Après avoir cliqué sur "Mettre à jour mes infos", vous DEVEZ voir une alerte:
```
Paramètres de jeu sauvegardés !
```

**❌ SI PAS D'ALERT** → Allez à [Solution C](#solution-c)

**✅ SI ALERT APPARAÎT** → Continuez à l'étape 6

### Étape 6: Tester le bouton "Rechercher"
1. Cliquer sur **"Rechercher un partenaire"**
2. Observer la console

**Vous DEVEZ voir:**
```
🔍 toggleSearch appelée {rank: 'silver', mainMode: 'Classé', ...}
Lancement de la recherche...
✅ Paramètres OK, démarrage recherche
```

**❌ SI VOUS NE VOYEZ PAS CES LOGS** → Allez à [Solution D](#solution-d)

---

## 🔧 SOLUTIONS

### <a name="solution-a"></a>Solution A: Logs d'initialisation absents

**Diagnostic**: Le script JavaScript n'a pas chargé ou a une erreur fatale.

#### Actions:
1. **Regarder la console** - Y a-t-il des messages en **ROUGE** ?
2. Prendre une **capture d'écran** des erreurs
3. **Copier/coller** le texte des erreurs

#### Causes probables:
- Erreur de syntaxe JavaScript
- Fichier game.html corrompu
- Navigateur bloque le JavaScript
- Problème de cache

#### Fix immédiat:
```
Ctrl + Shift + R  (recharger sans cache)
```

Si ça ne marche pas:
```
1. Fermer tous les onglets du navigateur
2. Rouvrir http://localhost:3000/csgo
3. Réessayer
```

---

### <a name="solution-b"></a>Solution B: Log saveGameSettings absent

**Diagnostic**: La fonction existe mais l'onclick ne se déclenche pas.

#### Actions dans la console:
```javascript
// Tester manuellement
saveGameSettings();
```

**Si ça affiche le log** → Le problème est l'attribut onclick
**Si ça n'affiche rien** → Erreur dans la fonction

#### Fix:
1. **Vérifier le bouton dans la console:**
```javascript
const btn = document.querySelector('.update-btn');
console.log('Bouton:', btn);
console.log('onclick:', btn.onclick);
console.log('Attribut onclick:', btn.getAttribute('onclick'));
```

2. **Attacher manuellement:**
```javascript
const btn = document.querySelector('.update-btn');
btn.onclick = () => saveGameSettings();
```

---

### <a name="solution-c"></a>Solution C: Log visible mais pas d'alert

**Diagnostic**: La fonction s'exécute mais échoue silencieusement.

#### Causes probables:
1. **Pas de token** (pas connecté)
2. **Erreur API** (serveur ne répond pas)
3. **userGameData vide**

#### Actions dans la console:
```javascript
// Vérifier le token
console.log('Token:', localStorage.getItem('token'));

// Vérifier userGameData
console.log('userGameData:', userGameData);

// Vérifier le serveur
fetch('/api/game/settings', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({
        gameId: 'valorant',
        rank: 'silver',
        mainMode: 'Classé',
        options: []
    })
}).then(r => r.json()).then(console.log).catch(console.error);
```

#### Fix pour token manquant:
```
1. Allez sur http://localhost:3000/login.html
2. Connectez-vous
3. Retournez sur /csgo
4. Réessayez
```

---

### <a name="solution-d"></a>Solution D: toggleSearch ne répond pas

**Diagnostic**: Même chose que Solution B/C mais pour toggleSearch.

#### Test manuel dans la console:
```javascript
// Test direct
toggleSearch();

// Vérifier le bouton
const searchBtn = document.getElementById('partnerSearchButton');
console.log('Bouton search:', searchBtn);
console.log('onclick:', searchBtn.onclick);

// Attacher manuellement
searchBtn.onclick = () => toggleSearch();
```

---

## 📊 CHECKLIST DE DIAGNOSTIC COMPLÈTE

Copiez ce bloc dans la console de game.html et appuyez sur Entrée:

```javascript
console.log('=== DIAGNOSTIC COMPLET ===');
console.log('1. Token:', localStorage.getItem('token') ? '✅ Présent' : '❌ Absent');
console.log('2. saveGameSettings:', typeof window.saveGameSettings);
console.log('3. toggleSearch:', typeof window.toggleSearch);
console.log('4. userGameData:', userGameData);
console.log('5. Bouton update:', document.querySelector('.update-btn'));
console.log('6. Bouton search:', document.getElementById('partnerSearchButton'));
console.log('7. gameId:', gameId);
console.log('8. RANKS:', typeof RANKS);

// Test des boutons
const updateBtn = document.querySelector('.update-btn');
const searchBtn = document.getElementById('partnerSearchButton');
console.log('9. onclick update:', updateBtn?.onclick);
console.log('10. onclick search:', searchBtn?.onclick);

console.log('=== FIN DIAGNOSTIC ===');
console.log('📋 Copiez TOUS ces résultats et envoyez-les');
```

---

## 🎯 RÉSULTAT ATTENDU

### Console au chargement:
```
✅ Initialisation terminée
📋 Fonctions disponibles:
  - saveGameSettings: function
  - toggleSearch: function
  - selectRank: function
  - togglePrefRank: function
```

### Console après clic "Mettre à jour":
```
🔧 saveGameSettings appelée {rank: 'silver', mainMode: 'Classé', options: []}
```
**+ ALERT:** "Paramètres de jeu sauvegardés !"

### Console après clic "Rechercher":
```
🔍 toggleSearch appelée {rank: 'silver', mainMode: 'Classé', ...}
Lancement de la recherche...
✅ Paramètres OK, démarrage recherche
```
**+ BOUTON CHANGE:** "Recherche en cours..."
**+ SPINNER** visible

---

## 🚨 SI RIEN NE MARCHE

### Test de secours dans la console:
```javascript
// Forcer la redéfinition des fonctions
window.saveGameSettings = async () => {
    alert('TEST: saveGameSettings fonctionne !');
};

window.toggleSearch = async () => {
    alert('TEST: toggleSearch fonctionne !');
};

// Réattacher aux boutons
document.querySelector('.update-btn').onclick = () => saveGameSettings();
document.getElementById('partnerSearchButton').onclick = () => toggleSearch();

console.log('✅ Fonctions de test attachées - cliquez sur les boutons');
```

Si **ce test fonctionne** → Le problème est dans le code original (erreur qui empêche les fonctions de se charger)
Si **ce test ne fonctionne pas** → Problème de navigateur ou configuration

---

## 📱 AIDE RAPIDE

### Pas de console ?
- **Chrome/Edge**: F12 ou Ctrl+Shift+I
- **Firefox**: F12 ou Ctrl+Shift+K
- **Safari**: Cmd+Option+C

### Console pleine d'erreurs ?
1. Cliquer sur "Clear console" (icône 🚫)
2. Rafraîchir la page (F5)
3. Observer les nouvelles erreurs

### Rien ne s'affiche dans la console ?
1. Vérifier que vous êtes sur l'onglet "Console" et pas "Elements" ou "Network"
2. Vérifier que le filtre n'est pas activé
3. Vérifier que le niveau de log inclut "Info" et "Log"

---

**Date**: 25 novembre 2025
**Statut**: 🚨 URGENT - Diagnostic en cours
**Fichier**: game.html
**Lignes concernées**: 389 (bouton update), 404 (bouton search), 841 (saveGameSettings), 891 (toggleSearch)
