self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = typeof payload.title === 'string' && payload.title ? payload.title : 'DoBetter';
  const options = {
    body: typeof payload.body === 'string' ? payload.body : '',
    icon: '/icon-192.png',
    data: { personId: typeof payload.personId === 'string' ? payload.personId : null },
  };
  if (typeof payload.tag === 'string' && payload.tag) options.tag = payload.tag;

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const personId = event.notification.data && event.notification.data.personId;
  const target = new URL('/', self.location.origin);
  if (personId) target.searchParams.set('openPerson', personId);

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (new URL(client.url).origin !== self.location.origin) continue;
      if ('focus' in client) await client.focus();
      client.postMessage({ type: 'openPerson', personId });
      return;
    }
    await self.clients.openWindow(target.href);
  })());
});
