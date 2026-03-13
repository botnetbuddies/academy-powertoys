  registerFeature({
    id: 'dedupe-requests',
    label: 'Deduplicate API Requests',
    description: 'Prevent duplicate API calls during page load — the app fetches the same endpoints multiple times',
    scope: 'global',
    default: false,
    early: true,
    cleanup() {
      if (window._aptFetchDedupeInstalled && window._aptFetchDedupeOriginalFetch) {
        window.fetch = window._aptFetchDedupeOriginalFetch;
      }
      delete window._aptFetchDedupeInstalled;
      delete window._aptFetchDedupeOriginalFetch;
    },
    run() {
      if (window._aptFetchDedupeInstalled) return;

      const cache = new Map();
      const DEFAULT_TTL = 10_000;
      const MODULE_TTL = 60_000;
      const SECTION_TTL = 60_000;
      const SETTINGS_TTL = 300_000;
      const WEEKLY_TTL = 60_000;
      const SUBSCRIPTION_TTL = 120_000;
      const MAX_CACHE_ENTRIES = 80;
      if (!window._aptFetchDedupeOriginalFetch) {
        window._aptFetchDedupeOriginalFetch = window.fetch;
      }
      const originalFetch = window._aptFetchDedupeOriginalFetch;

      function toAbsoluteUrl(url) {
        try {
          const parsed = new URL(String(url), location.href);
          parsed.hash = '';
          return parsed.href;
        } catch {
          return String(url);
        }
      }

      function isApiUrl(url) {
        try {
          const parsed = new URL(url, location.href);
          return parsed.origin === location.origin && parsed.pathname.startsWith('/api/');
        } catch {
          return false;
        }
      }

      function ttlForUrl(url) {
        try {
          const parsed = new URL(url, location.href);
          if (/^\/api\/v\d+\/modules\/\d+\/sections\/\d+(?:\/)?$/.test(parsed.pathname)) return SECTION_TTL;
          if (/^\/api\/v\d+\/modules\/\d+(?:\/)?$/.test(parsed.pathname)) return MODULE_TTL;
          if (parsed.pathname === '/api/v2/user/settings') return SETTINGS_TTL;
          if (parsed.pathname === '/api/v2/streaks/weekly') return WEEKLY_TTL;
          if (parsed.pathname === '/api/v2/billing/subscription') return SUBSCRIPTION_TTL;
        } catch {
          // ignore
        }
        return DEFAULT_TTL;
      }

      function pruneCache(now) {
        for (const [key, entry] of cache) {
          if ((now - entry.time) >= entry.ttl) cache.delete(key);
        }
        while (cache.size > MAX_CACHE_ENTRIES) {
          const oldestKey = cache.keys().next().value;
          if (!oldestKey) break;
          cache.delete(oldestKey);
        }
      }

      window.fetch = function (input, init) {
        const method = init?.method?.toUpperCase()
          || (input instanceof Request ? input.method : 'GET');
        if (method !== 'GET') return originalFetch.call(this, input, init);

        const rawUrl = typeof input === 'string' ? input
          : input instanceof URL ? input.href
          : input instanceof Request ? input.url
          : String(input);
        const url = toAbsoluteUrl(rawUrl);
        if (!isApiUrl(url)) return originalFetch.call(this, input, init);

        const now = Date.now();
        pruneCache(now);
        const entry = cache.get(url);
        if (entry && (now - entry.time) < entry.ttl) {
          return entry.promise.then(r => r.clone());
        }

        const ttl = ttlForUrl(url);
        const promise = originalFetch.call(this, input, init)
          .then((response) => {
            // Don't hold transient server failures in memory.
            if (response && response.status >= 500) cache.delete(url);
            return response;
          })
          .catch((error) => {
            cache.delete(url);
            throw error;
          });
        cache.set(url, { promise, time: now, ttl });

        return promise.then(r => r.clone());
      };
      window._aptFetchDedupeInstalled = '1';
    },
  });
