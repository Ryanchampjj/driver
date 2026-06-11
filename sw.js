// Service worker — มีไว้ให้ Chrome ปลดล็อกปุ่ม "ติดตั้งแอป"
// 🔼 เปลี่ยนเลขเวอร์ชันทุกครั้งที่แก้ไฟล์ (v2, v3, ...) เพื่อล้าง cache เก่า
var CACHE = 'driver-launcher-v2';
var ASSETS = ['./', './index.html', './manifest.json', './icon.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS).catch(function(){}); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ if (k !== CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// network-first สำหรับหน้า/ไฟล์ launcher: เอาของใหม่จากเน็ตก่อน ถ้าออฟไลน์ค่อยใช้ cache
self.addEventListener('fetch', function(e){
  e.respondWith(
    fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy).catch(function(){}); });
      return res;
    }).catch(function(){ return caches.match(e.request); })
  );
});
