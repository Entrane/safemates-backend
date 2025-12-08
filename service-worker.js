// ====================================================
// SERVICE WORKER - MATCHMATES PWA
// Cache intelligent et mode offline
// ====================================================

const CACHE_VERSION = 'matchmates-v1.1.8';
const CACHE_NAME = `matchmates-cache-${CACHE_VERSION}`;

// Fichiers à mettre en cache lors de l'installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/signup.html',
  '/dashboard.html',
  '/game.html',
  '/profile.html',
  '/contact.html',
  '/404.html',
  '/500.html',
  '/style.css',
  '/style-enhanced.css',
  '/components.css',
  '/animations.js',
  '/chatmanager.js',
  '/manifest.json',
  '/Image/Image_jeux/a230f9f5-6918-4f03-9c70-1a27399bfa08.png'
];

// Routes API à ne jamais cacher
const API_ROUTES = [
  '/api/',
  '/login',
  '/signup',
  '/register'
];

// ====================================================
// INSTALLATION DU SERVICE WORKER
// ====================================================

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation en cours...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des assets statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation terminée ');
        // Forcer l'activation immédiate
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Erreur installation:', error);
      })
  );
});

// ====================================================
// ACTIVATION DU SERVICE WORKER
// ====================================================

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation en cours...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Supprimer les anciens caches
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log(`[Service Worker] Suppression ancien cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation terminée ');
        // Prendre le contrôle de tous les clients immédiatement
        return self.clients.claim();
      })
  );
});

// ====================================================
// INTERCEPTION DES REQUÊTES (FETCH)
// ====================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes API (toujours aller au réseau)
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // En cas d'erreur réseau pour une API
          return new Response(
            JSON.stringify({
              error: 'offline',
              message: 'Vous êtes hors ligne. Cette action nécessite une connexion.'
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Stratégie : Cache First, puis Network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log(`[Service Worker] Récupération depuis le cache: ${url.pathname}`);
          return cachedResponse;
        }

        // Si pas en cache, aller chercher sur le réseau
        console.log(`[Service Worker] Récupération depuis le réseau: ${url.pathname}`);
        return fetch(request)
          .then((networkResponse) => {
            // Mettre en cache les nouvelles réponses (uniquement si succès)
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error(`[Service Worker] Erreur réseau pour: ${url.pathname}`, error);

            // Retourner la page 404 ou 500 si elle est en cache
            if (request.destination === 'document') {
              return caches.match('/404.html');
            }

            // Pour les autres ressources, retourner une réponse vide
            return new Response('', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});

// ====================================================
// GESTION DES MESSAGES (Communication avec le client)
// ====================================================

self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message reçu:', event.data);

  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }

  if (event.data.action === 'getCacheSize') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.keys();
      }).then((keys) => {
        event.ports[0].postMessage({ cacheSize: keys.length });
      })
    );
  }
});

// ====================================================
// SYNCHRONISATION EN ARRIÈRE-PLAN (Background Sync)
// ====================================================

self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }

  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncMessages() {
  try {
    console.log('[Service Worker] Synchronisation des messages...');
    // Logique de synchronisation des messages
    // À implémenter selon les besoins
    return true;
  } catch (error) {
    console.error('[Service Worker] Erreur sync messages:', error);
    throw error;
  }
}

async function syncNotifications() {
  try {
    console.log('[Service Worker] Synchronisation des notifications...');
    // Logique de synchronisation des notifications
    // À implémenter selon les besoins
    return true;
  } catch (error) {
    console.error('[Service Worker] Erreur sync notifications:', error);
    throw error;
  }
}

// ====================================================
// NOTIFICATIONS PUSH (Push Notifications)
// ====================================================

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification reçue');

  let notificationData = {
    title: 'MatchMates',
    body: 'Vous avez une nouvelle notification',
    icon: '/Image/Image_jeux/a230f9f5-6918-4f03-9c70-1a27399bfa08.png',
    badge: '/Image/Image_jeux/a230f9f5-6918-4f03-9c70-1a27399bfa08.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/dashboard.html'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('[Service Worker] Erreur parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      vibrate: notificationData.vibrate,
      data: notificationData.data,
      actions: [
        { action: 'open', title: 'Ouvrir' },
        { action: 'close', title: 'Fermer' }
      ]
    })
  );
});

// ====================================================
// CLIC SUR NOTIFICATION
// ====================================================

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification cliquée:', event.action);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/dashboard.html';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUnmasked: true })
        .then((clientList) => {
          // Si une fenêtre est déjà ouverte, la focaliser
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // Sinon, ouvrir une nouvelle fenêtre
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// ====================================================
// MISE À JOUR DU SERVICE WORKER
// ====================================================

self.addEventListener('updatefound', () => {
  console.log('[Service Worker] Mise à jour détectée!');
});

console.log('[Service Worker] Chargé et prêt ');


















