/* McArthur OS service worker — NETWORK-FIRST for everything (never serve stale code),
   cache fallback so the shell opens from the truck with no signal.
   Built for McArthur Engineering by Accelerated Experiences LLC. */
var CACHE = "mca-os-v1";
var SHELL = ["dashboard.html","truss.css","truss.js","mca-nova.js","mca-paper.js","mca-mark.svg","contacts-data.js"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL).catch(function(){}); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () { return caches.match(e.request); })
  );
});
