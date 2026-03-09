  registerFeature({
    id: 'dedupe-requests',
    label: 'Deduplicate API Requests',
    description: 'Prevent duplicate API calls during page load — the app fetches the same endpoints multiple times',
    scope: 'global',
    default: true,
    early: true,
    run() {
      const cache = new Map();
      const TTL = 10_000;
      const originalFetch = window.fetch;

      window.fetch = function (input, init) {
        const method = init?.method?.toUpperCase()
          || (input instanceof Request ? input.method : 'GET');
        if (method !== 'GET') return originalFetch.call(this, input, init);

        const url = typeof input === 'string' ? input
          : input instanceof URL ? input.href
          : input instanceof Request ? input.url
          : String(input);
        if (!url.includes('/api/')) return originalFetch.call(this, input, init);

        const now = Date.now();
        const entry = cache.get(url);
        if (entry && (now - entry.time) < TTL) {
          return entry.promise.then(r => r.clone());
        }

        const promise = originalFetch.call(this, input, init);
        cache.set(url, { promise, time: now });
        promise.catch(() => cache.delete(url));

        return promise.then(r => r.clone());
      };
    },
  });
