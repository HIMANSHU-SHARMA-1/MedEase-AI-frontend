self.addEventListener('install', (event) => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	clients.claim();
});

self.addEventListener('fetch', () => {
	// Network-first; no caching to avoid stale medical info
});


