// Service Worker — Rappels App (Firebase Edition)
const CACHE = 'rappels-v2';

// Liste des fichiers statiques à mettre en cache pour le mode hors-ligne
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installation : on met en cache les fichiers essentiels
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : on nettoie les anciens caches s'il y a eu une mise à jour
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : on intercepte les requêtes réseau
self.addEventListener('fetch', e => {
  // IMPORTANT : On ignore les requêtes vers la base de données Firebase
  // pour que les données restent toujours en temps réel et ne soient pas bloquées par le cache
  if (
    e.request.url.includes('firebaseio.com') || 
    e.request.url.includes('googleapis.com') || 
    e.request.url.includes('firestore')
  ) {
    return;
  }
  
  // Pour le reste (HTML, CSS, images), on sert le cache s'il existe, sinon on télécharge depuis le réseau
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
