// Service Worker для обработки отложенных уведомлений
const CACHE_NAME = 'pwa-push-v1';

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Установка');
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Активация');
  event.waitUntil(self.clients.claim());
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const delay = event.data.delay || 5000;
    
    console.log(`Планирование уведомления через ${delay}ms`);
    
    // Планируем уведомление
    setTimeout(() => {
      self.registration.showNotification('🔔 Отложенное уведомление', {
        body: 'Прошло 5 секунд с момента нажатия кнопки',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'delayed-notification',
        requireInteraction: false,
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        }
      });
    }, delay);
  }
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  console.log('Клик по уведомлению');
  event.notification.close();

  // Открываем или фокусируемся на существующем окне приложения
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Если есть открытое окно, фокусируемся на нем
        for (let client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        // Если нет открытых окон, открываем новое
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Fetch event (для PWA требуется обработчик fetch)
self.addEventListener('fetch', (event) => {
  // Простая стратегия: всегда идем в сеть
  event.respondWith(fetch(event.request));
});
