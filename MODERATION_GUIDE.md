# Guide du Système de Modération - MatchMates

## 📋 Vue d'ensemble

Le système de modération de MatchMates permet aux utilisateurs de signaler les comportements inappropriés et aux administrateurs de gérer ces signalements et d'appliquer des sanctions.

## 🚀 Installation

Le système a été automatiquement installé. Pour vérifier l'installation :

```bash
node test_reports.js
```

## 👤 Utilisateurs

### Comment signaler un utilisateur

1. **Via l'interface utilisateur** : Ajoutez le script `report-user.js` à votre page HTML :
   ```html
   <script src="/report-user.js"></script>
   ```

2. **Ouvrir le modal de signalement** :
   ```javascript
   window.openReportModal('username');
   ```

3. **Ou ajouter un bouton de signalement** :
   ```javascript
   window.addReportButton(containerElement, 'username');
   ```

### Raisons de signalement disponibles

- **Harcèlement** : Comportement abusif répété
- **Discours haineux** : Insultes, propos discriminatoires
- **Contenu inapproprié** : Images, messages inappropriés
- **Spam** : Publicité non sollicitée
- **Triche** : Utilisation de logiciels tiers, exploitation de bugs
- **Violation de la charte** : Non-respect des règles de la communauté
- **Autre** : Autres comportements problématiques

## 👮 Administrateurs

### Accès au panneau de modération

1. Connectez-vous avec un compte administrateur
2. Accédez à : `http://localhost:3000/moderation`

### Fonctionnalités du panneau

#### 📊 Tableau de bord

- **Signalements en attente** : Nombre de reports non traités
- **Sanctions actives** : Nombre d'utilisateurs sanctionnés
- **Utilisateurs bannis** : Total des bannis permanents

#### 📝 Gestion des signalements

**Onglet "En attente"** :
- Voir tous les signalements non traités
- Informations affichées :
  - Raison du signalement
  - Date et heure
  - Utilisateur signalant
  - Utilisateur signalé
  - Description détaillée

**Actions disponibles** :
- **Avertir** : Envoyer un avertissement à l'utilisateur
- **Suspendre** : Suspendre le compte temporairement
- **Bannir** : Bannir définitivement ou temporairement
- **Historique** : Voir les sanctions précédentes
- **Classer sans suite** : Marquer comme non pertinent

**Onglet "Traités"** :
- Historique des signalements résolus
- Qui a traité le signalement
- Note de résolution

#### ⚖️ Types de sanctions

1. **Avertissement** (Warning)
   - Notifie l'utilisateur du comportement problématique
   - Aucune restriction d'accès
   - Enregistré dans l'historique

2. **Suspension** (Suspension)
   - Compte temporairement désactivé
   - Durée configurable (en heures)
   - L'utilisateur ne peut plus se connecter
   - Automatiquement levée à l'expiration

3. **Bannissement** (Ban)
   - Interdiction permanente ou temporaire
   - Le compte est marqué comme banni
   - L'utilisateur ne peut plus accéder au site

### Application d'une sanction

1. Cliquez sur le bouton d'action souhaité (Avertir, Suspendre, Bannir)
2. Remplissez le formulaire :
   - **Type** : Sélectionné automatiquement
   - **Durée** : Pour suspension/ban temporaire (en heures)
   - **Raison** : Explication de la sanction (obligatoire)
3. Confirmez l'application
4. Le signalement est automatiquement marqué comme "résolu"
5. L'utilisateur reçoit une notification

### Annulation d'une sanction

Les sanctions peuvent être annulées via l'API :
```
DELETE /api/sanctions/:id
```

## 🔧 API Endpoints

### Pour tous les utilisateurs authentifiés

#### Signaler un utilisateur
```
POST /api/reports
Body: {
  "reportedUsername": "string",
  "reason": "harassment|hate_speech|inappropriate_content|spam|cheating|charter_violation|other",
  "description": "string (optional)"
}
```

### Pour les administrateurs uniquement

#### Lister les signalements
```
GET /api/reports?status=pending|resolved
```

#### Résoudre un signalement
```
POST /api/reports/:id/resolve
Body: {
  "action": "string",
  "note": "string (optional)"
}
```

#### Appliquer une sanction
```
POST /api/sanctions
Body: {
  "username": "string",
  "type": "warning|suspension|ban",
  "reason": "string",
  "durationHours": number (optional)
}
```

#### Historique des sanctions d'un utilisateur
```
GET /api/sanctions/:username
```

#### Annuler une sanction
```
DELETE /api/sanctions/:id
```

#### Statistiques de modération
```
GET /api/moderation/stats
```

## 📊 Structure de la base de données

### Table `reports`
- `id` : ID unique
- `reporter_id` : ID de l'utilisateur qui signale
- `reported_id` : ID de l'utilisateur signalé
- `reason` : Raison du signalement
- `description` : Description détaillée
- `status` : pending/resolved
- `created_at` : Date de création
- `resolved_at` : Date de résolution
- `resolved_by` : ID de l'admin qui a traité
- `resolution_note` : Note de résolution

### Table `sanctions`
- `id` : ID unique
- `user_id` : ID de l'utilisateur sanctionné
- `type` : warning/suspension/ban
- `reason` : Raison de la sanction
- `duration_hours` : Durée en heures (NULL = permanent)
- `issued_by` : ID de l'admin qui a appliqué
- `issued_at` : Date d'application
- `expires_at` : Date d'expiration
- `is_active` : Sanction active ou annulée

### Table `users` (colonnes ajoutées)
- `is_admin` : Utilisateur administrateur (1/0)
- `is_banned` : Utilisateur banni (1/0)

## 🎯 Bonnes pratiques

### Pour les modérateurs

1. **Vérifiez l'historique** avant d'appliquer une sanction
2. **Soyez cohérents** dans l'application des règles
3. **Documentez vos décisions** avec des notes claires
4. **Graduez les sanctions** : avertissement → suspension → ban
5. **Communiquez** les raisons clairement

### Pour les développeurs

1. **Ajoutez des boutons de signalement** partout où les utilisateurs interagissent
2. **Vérifiez le statut** des utilisateurs avant les actions critiques
3. **Logs** : Toutes les actions sont automatiquement loggées
4. **Notifications** : Les utilisateurs sont automatiquement notifiés

## 🔐 Sécurité

- Les routes de modération nécessitent une authentification JWT
- Seuls les administrateurs peuvent accéder au panneau
- Les sanctions sont horodatées et traçables
- Protection contre l'auto-signalement
- Validation des données côté serveur

## 🚨 Notes importantes

1. **Premier administrateur** : L'user ID 1 est automatiquement promu admin
2. **Promotions** : Pour créer d'autres admins, mettez à jour `is_admin = 1` dans la base
3. **Bans temporaires** : Spécifiez une durée en heures, sinon c'est permanent
4. **Nettoyage** : Les sanctions expirées restent dans l'historique mais deviennent inactives

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs du serveur
2. Consultez la console du navigateur
3. Testez avec `node test_reports.js`

---

✅ **Système opérationnel et prêt à l'emploi !**
