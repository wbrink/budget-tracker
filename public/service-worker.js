const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png" 
]

const CACHE_NAME = "static-v2";
const DATA_CACHE_NAME = "data-v1";


// populate offline caching with assets to run offline
self.addEventListener("install", (e) => {
  // don't wait for the all instances to be closed before installing new serviceworker
  self.skipWaiting();

  //cache the files
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  )
})


// delete old caches
self.addEventListener("activate", e => {
  // used in conjuction with self.skipwaiting in install listener
  // clients loaded in the same slcpe do not need to be reloaded befor etheir fetches will go through this service worker
  self.clients.claim();
  
  e.waitUntil(
    caches.keys().then(keyList => {
      console.log("Keylist: ", keyList);
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log("removing old cache data", key);
          return caches.delete(key);
        }
      }))
    })
  )
})


self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // response resolves to undefined if no match is found
      return response || fetch(event.request);
    })
  );
});