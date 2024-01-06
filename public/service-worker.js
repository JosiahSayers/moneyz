self.addEventListener('push', event => {
  console.log(event);
  if (!self.Notification || !self.Notification.permission === 'granted') {
    return;
  }

  const data = event.data?.json() ?? {};
  console.log(data)
  const title = data.title || 'New event in Money Pleeeeeease';
  const message = data.message || 'Click on this notification to open the website';
  const icon = 'favicon.ico';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: message,
      icon
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  clients.openWindow('https://money.sayerscloud.com');
});
