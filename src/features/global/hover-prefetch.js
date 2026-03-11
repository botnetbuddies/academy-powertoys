  registerFeature({
    id: 'hover-prefetch',
    label: 'Prefetch on Hover',
    description: 'Prefetch section API data on hover to speed up SPA navigation',
    scope: 'global',
    default: false,
    cleanup() {
      if (window._aptPrefetchHandler) {
        document.removeEventListener('mouseover', window._aptPrefetchHandler.onEnter);
        document.removeEventListener('mouseout', window._aptPrefetchHandler.onLeave);
        delete window._aptPrefetchHandler;
      }
    },
    run() {
      const prefetched = new Set();
      let timer = null;
      let currentLink = null;

      function onEnter(e) {
        const link = e.target.closest('a[href]');
        if (!link) return;
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('/app/')) return;
        const url = link.href;
        if (prefetched.has(url)) return;

        currentLink = link;
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (currentLink !== link) return;
          prefetched.add(url);
          // For module sections, prefetch the API data (SPA uses this)
          const match = href.match(/\/app\/module\/(\d+)\/section\/(\d+)/);
          if (match) {
            fetch(`/api/v2/modules/${match[1]}/sections/${match[2]}`, { credentials: 'include' }).catch(() => {});
          }
          // Always prefetch the page HTML too (helps new tabs, hard nav)
          fetch(url, { credentials: 'include' }).catch(() => {});
        }, 100);
      }

      function onLeave(e) {
        const link = e.target.closest('a[href]');
        if (link === currentLink) {
          clearTimeout(timer);
          currentLink = null;
        }
      }

      document.addEventListener('mouseover', onEnter);
      document.addEventListener('mouseout', onLeave);
      window._aptPrefetchHandler = { onEnter, onLeave };
    },
  });
