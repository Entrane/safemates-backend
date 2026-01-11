# 🔧 Correction : Double dossier public_html

## 🎯 Problème

Vous avez deux dossiers `public_html` imbriqués :
```
/public_html/public_html/
```

Cela complique le déploiement Git et peut causer des problèmes.

---

## ✅ Solution : Déplacer les fichiers

### **Option 1 : Via le gestionnaire de fichiers Hostinger** (RECOMMANDÉ)

#### **Étape 1 : Sélectionner tous les fichiers**

1. Allez dans `/public_html/public_html/` (le dossier enfant)
2. **Sélectionnez TOUS les fichiers et dossiers** :
   - Cochez la case en haut pour tout sélectionner
   - OU sélectionnez manuellement tous les éléments

#### **Étape 2 : Couper les fichiers**

1. **Clic droit** sur la sélection
2. Cliquez sur **"Couper"** ou **"Cut"**

#### **Étape 3 : Remonter d'un niveau**

1. Cliquez sur le **premier `public_html`** dans le fil d'ariane en haut
2. Vous êtes maintenant dans `/public_html/` (le parent)

#### **Étape 4 : Coller les fichiers**

1. **Clic droit** dans l'espace vide
2. Cliquez sur **"Coller"** ou **"Paste"**
3. **Confirmez** l'écrasement si demandé

#### **Étape 5 : Supprimer le dossier vide**

1. Une fois les fichiers déplacés, supprimez le dossier **`public_html/`** enfant (maintenant vide)
2. Clic droit → **Supprimer**

---

### **Option 2 : Via SSH** (Si vous êtes à l'aise avec le terminal)

```bash
# Se connecter en SSH à Hostinger
ssh votre_user@votre_domaine.com

# Aller dans le premier public_html
cd /home/u123456789/domains/safemates.fr/public_html

# Déplacer tous les fichiers du sous-dossier vers le parent
mv public_html/* ./
mv public_html/.* ./ 2>/dev/null

# Supprimer le dossier vide
rmdir public_html

# Vérifier
ls -la
```

---

## 📋 Après le déplacement

### **Mettre à jour la configuration Git**

Une fois les fichiers déplacés, mettez à jour le **"Chemin d'installation"** dans Hostinger Git :

1. Allez dans **Hostinger → Git → safemates.fr**
2. **Modifiez** le **"Répertoire (facultatif)"**
3. **Changez** de `/public_html/public_html` vers `/public_html`
4. **Enregistrez**

---

## ✅ Résultat final

Après correction, votre structure sera :

```
/ (racine)
  └── public_html/          ← Un seul dossier
       ├── dashboard.html
       ├── game.html
       ├── .htaccess
       ├── api/
       ├── Image/
       └── etc.
```

Et le déploiement Git fonctionnera correctement ! 🎉

---

## ⚠️ Important

**Faites une sauvegarde avant** de déplacer les fichiers :

1. Sélectionnez tous les fichiers dans `/public_html/public_html/`
2. Clic droit → **"Télécharger"** ou **"Download"**
3. Enregistrez le ZIP sur votre PC (sauvegarde de sécurité)

Ensuite, procédez au déplacement.

---

## 🐛 Si quelque chose ne va pas

Si après le déplacement le site ne fonctionne plus :

1. **Restaurez** depuis votre sauvegarde ZIP
2. **Uploadez** les fichiers dans le bon dossier
3. **Contactez** le support Hostinger pour qu'ils corrigent la configuration

---

**Note** : Cette correction n'est **pas urgente**. Votre site fonctionne déjà ! Vous pouvez le faire plus tard pour améliorer la configuration.
