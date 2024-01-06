self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: '/favicon.ico'
  };
  event.waitUntil(
    self.registration.showNotification('Money Pleeeeeease', options)
  );
});
