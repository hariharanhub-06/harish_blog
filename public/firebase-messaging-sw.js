importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "env_placeholder",
    authDomain: "env_placeholder",
    projectId: "env_placeholder",
    storageBucket: "env_placeholder",
    messagingSenderId: "env_placeholder",
    appId: "env_placeholder"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/hh-gold-logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
