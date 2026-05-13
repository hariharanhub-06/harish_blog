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
