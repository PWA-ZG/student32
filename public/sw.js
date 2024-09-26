const filesToCache = [
    "/",
    "index.html",
    "manifest.json",
    "/assets/site.css",
    "/assets/img/logo.png",
    "favicon.ico"
];

const staticCacheName = "staticCache";

self.addEventListener('install', event => {
    console.log('SW installing');

    event.waitUntil(
        caches.open(staticCacheName)
            .then(cache => {
                return cache.addAll(filesToCache);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('SW activating');

    const cacheWhiteList = [staticCacheName];
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if(cacheWhiteList.indexOf(cacheName) === -1){
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches
            .match(event.request)
            .then(response => {
                if(response){
                    return response;
                }
                return fetch(event.request)
                            .then(response => {
                                if(response.headers.get('content-length') < 5 * 1024 * 1024){
                                    return caches.open(staticCacheName)
                                            .then(cache => {
                                                console.log("Caching: " + event.request.url);
                                                cache.put(event.request.url, response.clone());
                                                return response;
                                            });
                                }
                                else{
                                    return response;
                                }
                            });
            })
            .catch(error => {
                console.log("Error", event.request.url, error);
            })


    );
});