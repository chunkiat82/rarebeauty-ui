self.addEventListener('install', event => {
  console.log('Service Worker installed');
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
  console.log('Service Worker activated');
});

self.addEventListener('fetch', event => {
  console.log('Fetching:', event.request.url);
});
