// Dainik Manyavar Service Worker for Push Notifications
// Supports FCM Web Push & Standard Push API

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Background push notification event listener
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'दैनिक मान्यवर', body: event.data.text() };
    }
  }

  const title = data.notification?.title || data.title || 'दैनिक मान्यवर - ताज़ा खबर';
  const body = data.notification?.body || data.body || 'नई खबर पढ़ने के लिए टैप करें';
  const icon = data.notification?.icon || data.icon || '/favicon.ico';
  const image = data.notification?.image || data.image || null;
  const clickAction = data.data?.url || data.url || '/';

  const options = {
    body: body,
    icon: icon,
    badge: '/favicon.ico',
    image: image,
    vibrate: [200, 100, 200],
    data: {
      url: clickAction,
      dateOfArrival: Date.now(),
      campaignId: data.data?.campaignId || null,
    },
    actions: [
      { action: 'read', title: 'अभी पढ़ें ➔' },
      { action: 'dismiss', title: 'खारिज करें' },
    ],
    tag: data.tag || 'dainik-manyavar-news',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  // Track open event asynchronously if campaignId exists
  if (event.notification.data?.campaignId) {
    fetch('/api/push/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: event.notification.data.campaignId,
        eventType: 'OPENED',
      }),
    }).catch(() => {});
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (let client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
