// Service Worker for شنكوتيات
const CACHE_NAME = "snkwtyat-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/css/variables.css",
    "/css/base.css",
    "/css/components.css",
    "/css/advanced.css",
    "/css/navbar.css",
    "/css/hero.css",
    "/css/features.css",
    "/css/stats.css",
    "/css/templates.css",
    "/css/about.css",
    "/css/testimonials.css",
    "/css/contact.css",
    "/css/faq.css",
    "/js/navbar.js",
    "/js/advanced.js",
    "/js/counters.js",
    "/manifest.json"
];

// Install event - cache assets
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log("Opened cache");
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== "basic") {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener("activate", event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});
