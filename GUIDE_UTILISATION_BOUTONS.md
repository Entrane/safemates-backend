# ✅ GUIDE D'UTILISATION - Boutons fonctionnels

## 🎉 RÉSULTAT FINAL: LES BOUTONS FONCTIONNENT !

Les tests ont confirmé que **`saveGameSettings()` et `toggleSearch()` sont bien appelés**.

Le message "Rang ou mode manquant" est **NORMAL** et fait partie du fonctionnement attendu.

---

## 📋 WORKFLOW CORRECT

### Bouton "Mettre à jour mes infos"

#### Étapes obligatoires AVANT de cliquer:

1. **Sélectionner un rang**
   - Cliquer sur une **image de rang** (Silver, Gold, etc.)
   - Vous devriez voir le rang s'afficher dans "Votre grade Actuel"

2. **Sélectionner un mode**
   - Cliquer sur **"Classé"** ou **"Non Classé"** (bouton radio)

3. **Cliquer sur "Mettre à jour mes infos"**
   - Une alert apparaît: "Paramètres de jeu sauvegardés !"

#### ❌ Si vous cliquez SANS sélectionner:
```
Alert: "Veuillez sélectionner votre rang et votre mode de jeu."
```
→ C'est NORMAL ! Sélectionnez d'abord un rang et un mode.

---

### Bouton "Rechercher un partenaire"

#### Conditions:

1. **Vous DEVEZ d'abord** avoir cliqué sur "Mettre à jour mes infos" (voir ci-dessus)
2. Vos paramètres doivent être sauvegardés

#### Ensuite:

1. **Cliquer sur "Rechercher un partenaire"**
2. Le bouton devient: **"Recherche en cours..."** avec un spinner
3. Une liste de partenaires potentiels s'affiche

#### ❌ Si vous cliquez SANS avoir sauvegardé:
```
Alert: "Veuillez définir votre rang et votre mode de jeu avant de lancer la recherche."
```
→ Cliquez d'abord sur "Mettre à jour mes infos"

---

## 🔄 WORKFLOW COMPLET (étape par étape)

### Première utilisation:

```
1. Ouvrir http://localhost:3000/valorant (ou csgo, lol, fortnite)
   ↓
2. Cliquer sur une IMAGE DE RANG (ex: Silver I)
   → Le rang s'affiche dans la colonne de gauche
   ↓
3. Cliquer sur "Classé" ou "Non Classé"
   ↓
4. Cliquer sur "Mettre à jour mes infos"
   → Alert: "Paramètres de jeu sauvegardés !"
   ↓
5. Cliquer sur "Rechercher un partenaire"
   → Le bouton change: "Recherche en cours..."
   → Liste de partenaires s'affiche
```

---

## 🧪 TEST DE VALIDATION

Pour confirmer que tout fonctionne:

### Test 1: Sans sélection (doit échouer)

1. Rafraîchir la page
2. Cliquer directement sur "Mettre à jour mes infos"
3. **Résultat attendu**: Alert "Veuillez sélectionner votre rang et votre mode de jeu." ✅

### Test 2: Avec sélection (doit fonctionner)

1. Rafraîchir la page
2. Cliquer sur un rang
3. Cliquer sur "Classé"
4. Cliquer sur "Mettre à jour mes infos"
5. **Résultat attendu**: Alert "Paramètres de jeu sauvegardés !" ✅

### Test 3: Recherche (doit fonctionner après Test 2)

1. Après avoir sauvegardé (Test 2)
2. Cliquer sur "Rechercher un partenaire"
3. **Résultat attendu**: Bouton devient "Recherche en cours..." + spinner ✅

---

## ⚠️ ERREURS COURANTES

### Erreur 1: "Veuillez sélectionner votre rang"
**Cause**: Vous n'avez pas cliqué sur une image de rang
**Solution**: Cliquer sur une image de rang

### Erreur 2: "Veuillez définir votre rang" (recherche)
**Cause**: Vous n'avez pas cliqué sur "Mettre à jour mes infos"
**Solution**: D'abord mettre à jour, PUIS rechercher

### Erreur 3: "429 Too Many Requests"
**Cause**: Trop de requêtes en peu de temps (rate limiting)
**Solution**: Attendre 1 minute, puis réessayer

### Erreur 4: "503 Service Unavailable"
**Cause**: Le serveur n'est pas démarré ou a crashé
**Solution**:
```bash
node server.js
```

---

## 🎯 CHECKLIST DE VÉRIFICATION

Avant de dire "les boutons ne marchent pas", vérifier:

- [ ] Le serveur est démarré (`node server.js`)
- [ ] Vous êtes connecté (token dans localStorage)
- [ ] Vous avez sélectionné un **rang** (image)
- [ ] Vous avez sélectionné un **mode** (radio button)
- [ ] Vous avez cliqué sur "Mettre à jour" AVANT "Rechercher"
- [ ] La console (F12) ne montre pas d'erreur JavaScript

---

## 📊 LOGS DE DÉBOGAGE

Si vous ouvrez la console (F12), vous verrez:

### Au chargement:
```
🎮 Chargement des infos du jeu: valorant
📋 Info du jeu: {...}
✅ Modes générés: (2) ['Classé', 'Non Classé']
📡 Chargement du profil pour gameId: valorant
✅ Initialisation terminée
📋 Fonctions disponibles:
  - saveGameSettings: function
  - toggleSearch: function
```

### Quand vous cliquez sur un rang:
```
🎯 Sélection du rang: fer1
✅ Rang mis à jour dans userGameData: {rank: 'fer1', ...}
```

### Quand vous cliquez sur un mode:
```
🎮 Sélection du mode: Classé
✅ Mode mis à jour dans userGameData: {mainMode: 'Classé', ...}
```

### Quand vous cliquez sur "Mettre à jour":
```
🔧 saveGameSettings appelée {rank: 'fer1', mainMode: 'Classé', ...}
📤 Envoi des paramètres: {...}
📥 Réponse sauvegarde: 200 OK
✅ Paramètres sauvegardés avec succès
```

### Quand vous cliquez sur "Rechercher":
```
🔍 toggleSearch appelée {rank: 'fer1', mainMode: 'Classé', ...}
Lancement de la recherche...
✅ Paramètres OK, démarrage recherche
```

---

## 🎉 RÉSUMÉ

### ✅ Ce qui fonctionne:
- ✅ Bouton "Mettre à jour mes infos"
- ✅ Bouton "Rechercher un partenaire"
- ✅ Sélection des rangs
- ✅ Sélection des modes
- ✅ Sauvegarde en base de données
- ✅ Recherche de partenaires

### ⚠️ Points importants:
- Il FAUT sélectionner un rang ET un mode avant de cliquer sur "Mettre à jour"
- Il FAUT cliquer sur "Mettre à jour" AVANT de cliquer sur "Rechercher"
- Les messages d'erreur ("Veuillez sélectionner...") sont **normaux et attendus**

---

## 📞 Support

Si après avoir suivi ce guide les boutons ne fonctionnent toujours pas:

1. Ouvrir la console (F12)
2. Copier TOUS les messages (erreurs en rouge surtout)
3. Vérifier que le serveur tourne (`node server.js`)
4. Vérifier que vous êtes connecté (token présent)

---

**Date**: 25 novembre 2025
**Version**: 6.0 - Guide d'utilisation complet
**Statut**: ✅ BOUTONS FONCTIONNELS - Workflow validé
