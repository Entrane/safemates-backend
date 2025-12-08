# 🚀 Guide de Déploiement - MatchMates

## Prérequis

- Node.js 16+ et npm
- Serveur Linux (Ubuntu 20.04+ recommandé)
- Accès SSH au serveur
- Nom de domaine configuré (optionnel mais recommandé)

---

## Déploiement en Production

### Étape 1 : Préparation du Serveur

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installation de Git
sudo apt install -y git

# Vérification des versions
node --version
npm --version
```

### Étape 2 : Configuration du Projet

```bash
# Créer un utilisateur dédié
sudo useradd -r -m -s /bin/bash matchmates

# Créer les dossiers nécessaires
sudo mkdir -p /var/www/matchmates
sudo mkdir -p /var/lib/matchmates
sudo mkdir -p /var/log/matchmates

# Cloner le projet (ou transférer les fichiers)
sudo git clone <votre-repo> /var/www/matchmates
# OU
sudo rsync -avz ./ /var/www/matchmates/

# Changer le propriétaire
sudo chown -R matchmates:matchmates /var/www/matchmates
sudo chown -R matchmates:matchmates /var/lib/matchmates
sudo chown -R matchmates:matchmates /var/log/matchmates
```

### Étape 3 : Configuration de l'Application

```bash
# Se connecter en tant qu'utilisateur matchmates
sudo su - matchmates
cd /var/www/matchmates

# Installer les dépendances en production
npm ci --production

# Copier et configurer .env
cp .env.example .env
nano .env
```

Configuration du fichier `.env` :

```env
NODE_ENV=production
PORT=3000

# Générer une clé JWT sécurisée
# Commande: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=VOTRE_CLE_JWT_ULTRA_SECURISEE_ICI
JWT_EXPIRATION=24h

# Chemins en production
DATABASE_PATH=/var/lib/matchmates/database.sqlite

# Rate Limiting (ajuster selon le trafic)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS (votre domaine)
ALLOWED_ORIGINS=https://votredomaine.com,https://www.votredomaine.com

# Sécurité
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MS=900000

# Session
SESSION_TIMEOUT_MINUTES=30
```

### Étape 4 : Permissions et Sécurité

```bash
# Définir les permissions strictes
chmod 700 /var/www/matchmates
chmod 600 /var/www/matchmates/.env
chmod 600 /var/lib/matchmates/database.sqlite
chmod 755 /var/www/matchmates/logs

# Permissions des logs
chmod 755 /var/log/matchmates
```

### Étape 5 : Installation de PM2

```bash
# Installation globale de PM2
sudo npm install -g pm2

# Configuration PM2 pour matchmates
cd /var/www/matchmates
pm2 start server.js --name matchmates --user matchmates

# Configuration du démarrage automatique
sudo pm2 startup systemd -u matchmates --hp /home/matchmates
pm2 save

# Vérifier le statut
pm2 status
pm2 logs matchmates
```

Configuration avancée PM2 (`ecosystem.config.js`) :

```javascript
module.exports = {
  apps: [{
    name: 'matchmates',
    script: './server.js',
    instances: 2, // Nombre d'instances (ou 'max')
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/matchmates/pm2-error.log',
    out_file: '/var/log/matchmates/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

Lancer avec la configuration :
```bash
pm2 start ecosystem.config.js
```

### Étape 6 : Configuration Nginx (Reverse Proxy)

```bash
# Installation de Nginx
sudo apt install -y nginx

# Créer la configuration
sudo nano /etc/nginx/sites-available/matchmates
```

Configuration Nginx :

```nginx
# Upstream pour PM2 en mode cluster
upstream matchmates_backend {
    least_conn;
    server 127.0.0.1:3000;
    keepalive 64;
}

# Configuration HTTP (redirection vers HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name votredomaine.com www.votredomaine.com;

    # Redirection permanente vers HTTPS
    return 301 https://$server_name$request_uri;
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name votredomaine.com www.votredomaine.com;

    # Certificats SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/votredomaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votredomaine.com/privkey.pem;

    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Limite de taille des uploads
    client_max_body_size 10M;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Logs
    access_log /var/log/nginx/matchmates-access.log;
    error_log /var/log/nginx/matchmates-error.log;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

    # Fichiers statiques
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        root /var/www/matchmates;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy vers Node.js
    location / {
        proxy_pass http://matchmates_backend;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }

    # Protection contre les scans
    location ~ /\. {
        deny all;
    }
}
```

Activer le site :

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/matchmates /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### Étape 7 : Configuration SSL avec Let's Encrypt

```bash
# Installation de Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d votredomaine.com -d www.votredomaine.com

# Test de renouvellement automatique
sudo certbot renew --dry-run

# Le renouvellement automatique est configuré via cron/systemd
```

### Étape 8 : Configuration du Firewall

```bash
# Installation UFW (si pas déjà installé)
sudo apt install -y ufw

# Configuration des règles
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Activer le firewall
sudo ufw enable

# Vérifier le statut
sudo ufw status verbose
```

### Étape 9 : Sauvegardes Automatiques

Créer le script de sauvegarde :

```bash
sudo nano /usr/local/bin/matchmates-backup.sh
```

Contenu du script :

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/matchmates"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Créer le dossier de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
echo "[$DATE] Sauvegarde de la base de données..."
cp /var/lib/matchmates/database.sqlite $BACKUP_DIR/database_$DATE.sqlite

# Sauvegarde des logs
echo "[$DATE] Sauvegarde des logs..."
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz /var/www/matchmates/logs /var/log/matchmates

# Sauvegarde de la configuration
echo "[$DATE] Sauvegarde de la configuration..."
cp /var/www/matchmates/.env $BACKUP_DIR/env_$DATE.backup

# Nettoyage des anciennes sauvegardes
echo "[$DATE] Nettoyage des sauvegardes de plus de $RETENTION_DAYS jours..."
find $BACKUP_DIR -name "database_*.sqlite" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "logs_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "env_*.backup" -mtime +$RETENTION_DAYS -delete

echo "[$DATE] Sauvegarde terminée avec succès"
```

Rendre le script exécutable et configurer cron :

```bash
# Rendre exécutable
sudo chmod +x /usr/local/bin/matchmates-backup.sh

# Ajouter au crontab
sudo crontab -e

# Ajouter cette ligne (sauvegarde quotidienne à 2h du matin)
0 2 * * * /usr/local/bin/matchmates-backup.sh >> /var/log/matchmates/backup.log 2>&1
```

### Étape 10 : Monitoring et Alertes

Installation de monitoring basique :

```bash
# Installation de logrotate pour les logs
sudo nano /etc/logrotate.d/matchmates
```

Configuration logrotate :

```
/var/www/matchmates/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 matchmates matchmates
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}

/var/log/matchmates/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 matchmates matchmates
}
```

---

## Commandes Utiles

### Gestion PM2

```bash
# Voir le statut
pm2 status

# Logs en temps réel
pm2 logs matchmates

# Redémarrer
pm2 restart matchmates

# Recharger (zero-downtime)
pm2 reload matchmates

# Arrêter
pm2 stop matchmates

# Monitoring
pm2 monit

# Informations détaillées
pm2 show matchmates
```

### Gestion Nginx

```bash
# Tester la configuration
sudo nginx -t

# Recharger la configuration
sudo systemctl reload nginx

# Redémarrer
sudo systemctl restart nginx

# Voir les logs
sudo tail -f /var/log/nginx/matchmates-error.log
sudo tail -f /var/log/nginx/matchmates-access.log
```

### Gestion de la Base de Données

```bash
# Sauvegarde manuelle
cp /var/lib/matchmates/database.sqlite /tmp/backup_$(date +%Y%m%d).sqlite

# Vérifier l'intégrité
sqlite3 /var/lib/matchmates/database.sqlite "PRAGMA integrity_check;"

# Voir les tables
sqlite3 /var/lib/matchmates/database.sqlite ".tables"

# Voir la taille
du -h /var/lib/matchmates/database.sqlite
```

---

## Mise à Jour de l'Application

```bash
# Se connecter au serveur
ssh matchmates@votreserveur.com

# Aller dans le dossier du projet
cd /var/www/matchmates

# Sauvegarder la base de données
cp /var/lib/matchmates/database.sqlite /var/lib/matchmates/database.sqlite.backup

# Pull des dernières modifications
git pull origin main

# Installer les dépendances
npm ci --production

# Recharger l'application (zero-downtime)
pm2 reload matchmates

# Vérifier que tout fonctionne
pm2 logs matchmates --lines 50
```

---

## Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs PM2
pm2 logs matchmates --err

# Vérifier la configuration
cat /var/www/matchmates/.env

# Vérifier les permissions
ls -la /var/www/matchmates/
ls -la /var/lib/matchmates/

# Tester manuellement
cd /var/www/matchmates
node server.js
```

### Erreurs 502 Bad Gateway

```bash
# Vérifier que l'application tourne
pm2 status

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/matchmates-error.log

# Vérifier la configuration Nginx
sudo nginx -t

# Redémarrer les services
pm2 restart matchmates
sudo systemctl restart nginx
```

### Base de données corrompue

```bash
# Vérifier l'intégrité
sqlite3 /var/lib/matchmates/database.sqlite "PRAGMA integrity_check;"

# Restaurer depuis la sauvegarde
cp /var/backups/matchmates/database_YYYYMMDD_HHMMSS.sqlite /var/lib/matchmates/database.sqlite

# Redémarrer l'application
pm2 restart matchmates
```

---

## Checklist de Déploiement

- [ ] Serveur préparé et sécurisé
- [ ] Node.js installé (version 16+)
- [ ] Application déployée dans `/var/www/matchmates`
- [ ] Fichier `.env` configuré avec JWT_SECRET unique
- [ ] Permissions configurées correctement
- [ ] PM2 installé et configuré
- [ ] Nginx installé et configuré
- [ ] SSL activé avec Let's Encrypt
- [ ] Firewall UFW configuré
- [ ] Sauvegardes automatiques configurées
- [ ] Logrotate configuré
- [ ] Tests effectués (connexion, inscription, messages)
- [ ] Monitoring en place
- [ ] DNS configuré correctement
- [ ] Logs surveillés

---

## Support

Pour toute question ou problème de déploiement, consultez :
- [Documentation de sécurité](SECURITY.md)
- [Issues GitHub](https://github.com/votre-repo/issues)

---

**Dernière mise à jour :** 2025-11-24
