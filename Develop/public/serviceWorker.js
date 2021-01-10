const CACHE_NAME = [
    "/",
    "/index.html",
    "/styles.css",
    "/index.js",
    "icons/icon-192x192.png",
    "icons/icon-512x512.png",
    "/manifest.webmanifest",
    
  ];
  
  const staticFiles = "static-cache-v2";
  const DATA_CACHE_NAME = "data-cache-v1";
  
  // install
  self.addEventListener("install", function(evt) {
    evt.waitUntil(
      caches.open(staticFiles).then(cache => {
        console.log("Your files have been cached successfully.");
        return cache.addAll(CACHE_NAME);
      })
    );
  
    self.skipWaiting();
  });
  
  self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== staticFiles && key !== DATA_CACHE_NAME) {
              console.log("Cached data deleted.", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  
  self.addEventListener("fetch", function(evt) {
    // cache requests to "/api/"
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // Clone valid responses
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
  
              return response;DATA_CACHE_NAME
            })
            .catch(err => {
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    };

    evt.respondWith(
      caches.match(evt.request).then(function(response) {
        return response || fetch(evt.request);
      })
    );
  });