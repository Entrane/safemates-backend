# Guide de test - Nouveaux rangs CS:GO et Fortnite

## Résumé des modifications

✅ **CS:GO** : Extension de 6 à 18 rangs détaillés
✅ **Fortnite** : Extension de 6 à 8 rangs avec Champion et Unreal
✅ **100% des images présentes et vérifiées**

---

## Étapes de test

### 1. Démarrer le serveur

```bash
node server.js
```

Vous devriez voir :
```
Serveur démarré sur le port 3000
Accédez à l'application: http://localhost:3000
✅ Synchronisation des chats activée
✅ Système de notifications opérationnel
✅ Matchmaking et profils unifiés
```

### 2. Vérifier les images (optionnel)

```bash
node verifier_images_rangs.js
```

Résultat attendu : `✅ Toutes les images sont présentes !`

---

## Tests pour CS:GO

### Accès à la page du jeu
1. Ouvrir http://localhost:3000
2. Se connecter ou créer un compte
3. Accéder à la page CS:GO : http://localhost:3000/csgo

### Test des rangs (18 rangs au total)

#### Catégorie Silver (6 rangs)
- [ ] Silver I
- [ ] Silver II
- [ ] Silver III
- [ ] Silver IV
- [ ] Silver Elite
- [ ] Silver Elite Master

#### Catégorie Gold Nova (4 rangs)
- [ ] Gold Nova I
- [ ] Gold Nova II
- [ ] Gold Nova III
- [ ] Gold Nova Master

#### Catégorie Master Guardian (4 rangs)
- [ ] Master Guardian I
- [ ] Master Guardian II
- [ ] Master Guardian Elite
- [ ] Distinguished Master Guardian

#### Catégorie Elite (4 rangs)
- [ ] Legendary Eagle
- [ ] Legendary Eagle Master
- [ ] Supreme Master First Class
- [ ] Global Elite

### Vérifications visuelles
- [ ] Toutes les images s'affichent correctement
- [ ] Les noms de rangs sont lisibles
- [ ] Le survol des rangs fonctionne (effet hover)
- [ ] La sélection d'un rang le met en surbrillance

---

## Tests pour Fortnite

### Accès à la page du jeu
1. Accéder à la page Fortnite : http://localhost:3000/fortnite

### Test des rangs (8 rangs au total)
- [ ] Bronze
- [ ] Argent
- [ ] Or
- [ ] Platine
- [ ] Diamant
- [ ] **Champion** ⭐ (NOUVEAU)
- [ ] Elite
- [ ] **Unreal** ⭐ (NOUVEAU)

### Vérifications visuelles
- [ ] Toutes les images s'affichent correctement
- [ ] Les nouveaux rangs (Champion, Unreal) sont visibles
- [ ] Les noms de rangs sont lisibles
- [ ] Le survol des rangs fonctionne (effet hover)
- [ ] La sélection d'un rang le met en surbrillance

---

## Tests fonctionnels communs

### Sélection du rang utilisateur
1. [ ] Cliquer sur un rang dans "Votre grade Actuel"
2. [ ] Vérifier que le rang se met en surbrillance
3. [ ] Vérifier que le rang s'affiche dans la colonne de gauche sous "Votre Rang"

### Sélection du mode de jeu
1. [ ] Sélectionner un mode de jeu (Compétitif/Casual pour CS:GO, Battle Royale/etc pour Fortnite)
2. [ ] Vérifier que le mode s'affiche dans la colonne de gauche

### Sauvegarde des paramètres
1. [ ] Cliquer sur "Mettre à jour mes infos"
2. [ ] Vérifier qu'un message de confirmation s'affiche
3. [ ] Rafraîchir la page (F5)
4. [ ] Vérifier que les paramètres sont toujours sélectionnés

### Préférences de partenaire
1. [ ] Sélectionner plusieurs rangs dans "Préférences du partenaire"
2. [ ] Ajuster la tolérance de rang (slider)
3. [ ] Les préférences devraient se sauvegarder automatiquement

### Recherche de partenaire
1. [ ] Cliquer sur "Rechercher un partenaire"
2. [ ] Vérifier que la recherche se lance
3. [ ] Vérifier que les partenaires trouvés s'affichent avec leur rang correct

---

## Tests de compatibilité

### Système de matchmaking
- [ ] Les rangs CS:GO sont correctement pris en compte dans le matchmaking
- [ ] Les rangs Fortnite sont correctement pris en compte dans le matchmaking
- [ ] La tolérance de rang fonctionne avec les nouveaux rangs

### Base de données
- [ ] Les nouveaux IDs de rangs sont sauvegardés correctement
- [ ] Les anciens profils peuvent être chargés sans erreur
- [ ] Les préférences de rang sont persistantes

---

## Problèmes potentiels et solutions

### Images ne s'affichent pas
**Solution** : Vérifier que les dossiers `csgo_rank` et `fortnite rank` sont au bon emplacement

### Rangs non sélectionnables
**Solution** : Vérifier la console du navigateur (F12) pour d'éventuelles erreurs JavaScript

### Matchmaking ne trouve personne
**Solution** :
1. S'assurer qu'il y a d'autres utilisateurs inscrits avec le même jeu
2. Élargir la tolérance de rang
3. Vérifier que le mode de jeu est bien sélectionné

---

## Commandes utiles

### Vérifier les images
```bash
node verifier_images_rangs.js
```

### Redémarrer le serveur
```bash
# Arrêter le serveur (Ctrl+C)
node server.js
```

### Voir les logs du serveur
Les logs sont disponibles dans le dossier `logs/`

---

## Résultats attendus

✅ **26 images de rangs** au total (18 CS:GO + 8 Fortnite)
✅ **100% des images vérifiées et présentes**
✅ **Affichage correct** de tous les rangs dans l'interface
✅ **Sauvegarde fonctionnelle** des préférences
✅ **Matchmaking opérationnel** avec les nouveaux rangs

---

## En cas de problème

1. Vérifier que le serveur est démarré
2. Vérifier la console du navigateur (F12)
3. Vérifier les logs du serveur
4. Consulter le fichier [MISE_A_JOUR_RANGS.md](MISE_A_JOUR_RANGS.md) pour plus de détails

---

**Date de création** : 25 novembre 2025
**Version** : 1.0
