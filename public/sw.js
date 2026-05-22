const CACHE_NAME = 'hariharanhub-v1';
const OFFLINE_ASSETS = [
    '/',
    '/hari-favicon.png',
    '/hari_photo.png',
    '/hh-gold-logo.png',
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(OFFLINE_ASSETS).catch(function(err) {
                console.warn('[SW] Failed to pre-cache some assets:', err);
            });
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(key) { return key !== CACHE_NAME; })
                    .map(function(key) { return caches.delete(key); })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(event) {
    const url = new URL(event.request.url);

    // Only cache GET requests for same-origin or static assets
    if (event.request.method !== 'GET') return;
    if (url.origin !== self.location.origin && !url.hostname.includes('ik.imagekit.io')) return;
    // Skip API calls and admin routes
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) return;

    event.respondWith(
        caches.match(event.request).then(function(cached) {
            if (cached) return cached;
            return fetch(event.request).then(function(response) {
                // Cache successful image/font/static responses
                if (response.ok && (
                    event.request.destination === 'image' ||
                    event.request.destination === 'font' ||
                    event.request.destination === 'style'
                )) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            }).catch(function() {
                // Return cached home page for navigation requests when offline
                if (event.request.destination === 'document') {
                    return caches.match('/');
                }
            });
        })
    );
});

self.addEventListener('push', function (event) {
    if (event.data) {
        try {
            const payload = event.data.json();
            const options = {
                body: payload.body,
                icon: '/hari-favicon.png',
                badge: '/hari-favicon.png',
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    url: payload.url || '/admin/dashboard'
                }
            };
            event.waitUntil(
                self.registration.showNotification(payload.title, options)
            );
        } catch (e) {
            console.error('[SW] Failed to parse push payload', e);
        }
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow(event.notification.data.url).catch(function(err) {
                console.error('[SW] Failed to open window', err);
            });
        })
    );
});
