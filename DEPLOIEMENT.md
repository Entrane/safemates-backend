# 🚀 Guide de déploiement SafeMates

## Déploiement automatique

### Méthode 1: Script automatique (Recommandé)
```bash
# Double-clic sur le fichier:
deploy-direct.bat

# Ou depuis VS Code:
Ctrl + Alt + G
```

Ce script va automatiquement:
1. ✅ Commit et push vers GitHub
2. ✅ Upload tous les fichiers vers Hostinger via FTP
3. ✅ Ton site sera à jour en quelques secondes

### Méthode 2: Push GitHub uniquement
```bash
# Lance auto-deploy.bat
auto-deploy.bat
```

---

## Configuration FTP Hostinger

**Hôte**: ftp://92.113.28.141
**Utilisateur**: u639530603
**Port**: 21
**Dossier**: domains/safemates.fr/public_html/

---

## Structure des fichiers

```
public_html/
├── index.html
├── login.html
├── signup.html
├── dashboard.html
├── game.html
├── profile.html
├── contact.html
├── style.css
├── animations.js
└── api/
    ├── config.php
    ├── login.php
    ├── signup.php
    ├── me.php
    ├── user/
    │   └── profile.php
    ├── friends.php
    ├── friends/
    │   ├── send.php
    │   ├── respond.php
    │   └── remove.php
    └── notifications/
        ├── notifications.php
        ├── read.php
        └── read-all.php
```

---

## Vérification

Après déploiement, teste:
- https://safemates.fr - Page d'accueil
- https://safemates.fr/login.html - Connexion
- https://safemates.fr/api/me - API (doit retourner JSON)

---

## En cas de problème

1. Vérifie que les fichiers sont bien uploadés sur Hostinger
2. Vide le cache du navigateur (Ctrl + Shift + R)
3. Teste en navigation privée
4. Vérifie les logs d'erreur PHP dans le panneau Hostinger
