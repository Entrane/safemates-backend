# Configuration Google AdSense pour MatchMates

Ce guide explique comment activer les emplacements publicitaires Google AdSense sur votre site MatchMates.

## 📋 Emplacements publicitaires ajoutés

### 1. **index.html** (Page d'accueil)
- **Emplacement 1** : Après la section Hero (format Leaderboard 728x90)
- **Emplacement 2** : Avant le footer (format Leaderboard 728x90)

### 2. **dashboard.html** (Tableau de bord)
- **Emplacement 1** : En haut de la bibliothèque de jeux (format responsive)

### 3. **game.html** (Pages de jeu)
- **Emplacement 1** : Dans la colonne d'informations du jeu (format Medium Rectangle 300x250)

---

## 🚀 Étapes de configuration

### Étape 1 : Créer un compte Google AdSense

1. Rendez-vous sur [https://www.google.com/adsense](https://www.google.com/adsense)
2. Cliquez sur "Commencer"
3. Connectez-vous avec votre compte Google
4. Remplissez les informations de votre site web
5. Attendez l'approbation de Google (peut prendre 24-48h)

### Étape 2 : Obtenir votre ID client AdSense

1. Connectez-vous à votre compte AdSense
2. Allez dans **"Comptes" > "Paramètres"**
3. Notez votre **ID éditeur** (format: `ca-pub-XXXXXXXXXXXXXXXX`)

### Étape 3 : Activer le script AdSense

Dans chaque fichier HTML (`index.html`, `dashboard.html`, `game.html`), décommentez et modifiez cette ligne :

**Avant :**
```html
<!-- <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script> -->
```

**Après :**
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-VOTRE_ID_CLIENT" crossorigin="anonymous"></script>
```

**Remplacez `VOTRE_ID_CLIENT` par votre véritable ID AdSense.**

### Étape 4 : Créer des blocs d'annonces

1. Dans votre tableau de bord AdSense, allez dans **"Annonces" > "Par unité d'annonce"**
2. Cliquez sur **"+ Par unité d'annonce"**
3. Créez les types d'annonces suivants :

#### a) Pour index.html (2 annonces)
- **Type** : Annonce display responsive ou Bannière
- **Format** : 728x90 (Leaderboard) ou Responsive
- **Nom** : "MatchMates - Index Hero" et "MatchMates - Index Footer"

#### b) Pour dashboard.html (1 annonce)
- **Type** : Annonce display responsive
- **Format** : Responsive
- **Nom** : "MatchMates - Dashboard Top"

#### c) Pour game.html (1 annonce)
- **Type** : Annonce display
- **Format** : 300x250 (Rectangle moyen)
- **Nom** : "MatchMates - Game Sidebar"

4. Pour chaque annonce créée, Google génère un code avec :
   - `data-ad-client` : Votre ID client
   - `data-ad-slot` : ID unique de l'annonce

### Étape 5 : Insérer les codes d'annonces

Pour chaque emplacement dans les fichiers HTML, remplacez les valeurs `data-ad-client` et `data-ad-slot` :

**Exemple dans index.html :**

**Avant :**
```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
```

**Après :**
```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-1234567890123456"
     data-ad-slot="9876543210"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
```

### Étape 6 : Activer les annonces (JavaScript)

Ajoutez ce script **après** chaque bloc `<ins class="adsbygoogle">` :

```html
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

**Exemple complet :**
```html
<div class="ad-container ad-leaderboard ad-hero">
    <span class="ad-label">Publicité</span>
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-1234567890123456"
         data-ad-slot="9876543210"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>
         (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
</div>
```

---

## 🎨 Personnalisation du style

Le fichier `ads.css` contient tous les styles pour les emplacements publicitaires :

- **Conteneurs** : `.ad-container`
- **Label "Publicité"** : `.ad-label`
- **Formats** : `.ad-banner`, `.ad-leaderboard`, `.ad-medium-rectangle`, etc.
- **Responsive** : Les publicités s'adaptent automatiquement aux écrans mobiles

Vous pouvez personnaliser les couleurs et les espacements dans `ads.css`.

---

## ⚠️ Mode test / Développement

Pendant le développement, les annonces peuvent ne pas s'afficher immédiatement. Pour tester :

1. **Placeholders** : Les emplacements ont des placeholders commentés. Décommentez-les pour visualiser l'emplacement :
   ```html
   <div class="ad-placeholder">Emplacement publicitaire 728x90</div>
   ```

2. **Mode test AdSense** : Activez le mode test dans votre compte AdSense pour voir des annonces de démonstration.

---

## 📊 Suivi des performances

Une fois configuré, vous pourrez suivre vos revenus dans votre tableau de bord AdSense :
- Impressions
- Clics
- CTR (taux de clics)
- Revenus estimés

---

## ✅ Checklist finale

- [ ] Compte Google AdSense créé et approuvé
- [ ] ID client AdSense obtenu
- [ ] Script AdSense activé dans les 3 fichiers HTML
- [ ] 4 blocs d'annonces créés dans AdSense
- [ ] Codes `data-ad-slot` insérés dans les emplacements
- [ ] Script `(adsbygoogle).push({})` ajouté après chaque bloc
- [ ] Site déployé en production
- [ ] Annonces affichées correctement

---

## 📞 Support

Pour toute question concernant AdSense :
- **Centre d'aide AdSense** : https://support.google.com/adsense
- **Forum de la communauté** : https://support.google.com/adsense/community

---

**Bon courage avec la monétisation de MatchMates ! 🚀**
