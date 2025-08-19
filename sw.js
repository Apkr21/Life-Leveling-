// Life System - Service Worker for PWA
// Enables offline functionality and app-like behavior

const CACHE_NAME = 'life-system-v1.0.0';
const STATIC_CACHE = 'life-system-static-v1.0.0';
const DYNAMIC_CACHE = 'life-system-dynamic-v1.0.0';

// Files to cache for offline use
const STATIC_FILES = [
  './',
  './index.html',
  './js/system.js',
  './css/system.css',
  './css/professional.css',
  './css/desktop.css',
  './manifest.json',
  // CDN files will be cached dynamically
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static files');
      return cache.addAll(STATIC_FILES);
    }).then(() => {
      console.log('[SW] Static files cached successfully');
      return self.skipWaiting(); // Activate immediately
    }).catch((error) => {
      console.error('[SW] Failed to cache static files:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker activated');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - serve cached files or fetch from network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Handle different types of requests
  if (url.origin === location.origin) {
    // Same origin - cache first strategy
    event.respondWith(cacheFirst(request));
  } else {
    // External resources (CDNs) - network first with cache fallback
    event.respondWith(networkFirst(request));
  }
});

// Cache first strategy - for static app files
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    
    // Return offline page or basic response
    if (request.destination === 'document') {
      const cache = await caches.open(STATIC_CACHE);
      return cache.match('/index.html');
    }
    
    throw error;
  }
}

// Network first strategy - for CDN resources
async function networkFirst(request) {
  try {
    console.log('[SW] Fetching CDN resource:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache successful CDN responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    console.error('[SW] Network first failed completely:', error);
    throw error;
  }
}

// Background sync for data when back online
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'sync-user-data') {
    event.waitUntil(syncUserData());
  }
});

// Sync user data when connection is restored
async function syncUserData() {
  try {
    console.log('[SW] Syncing user data...');
    // User data is stored locally, so just notify the app
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Data synced successfully'
      });
    });
  } catch (error) {
    console.error('[SW] Data sync failed:', error);
  }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'Time for your daily check-in, Hunter!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      action: 'open-app'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Life System', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Clean up old caches periodically
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    event.waitUntil(cleanOldCaches());
  }
});

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('life-system-') && 
    name !== STATIC_CACHE && 
    name !== DYNAMIC_CACHE
  );
  
  await Promise.all(oldCaches.map(name => caches.delete(name)));
  console.log('[SW] Cleaned old caches:', oldCaches);
}