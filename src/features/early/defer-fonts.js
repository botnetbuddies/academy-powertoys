  registerFeature({
    id: 'defer-fonts',
    label: 'Defer Font Loading',
    description: 'Load Typekit and FontAwesome fonts non-blocking so the page paints before fonts arrive',
    scope: 'global',
    default: false,
    early: true,
    cleanup() {
      if (window._aptDeferFontsObs) {
        window._aptDeferFontsObs.disconnect();
        delete window._aptDeferFontsObs;
      }
      document.querySelectorAll('link[data-apt-deferred-font="1"]').forEach(link => {
        link.media = 'all';
        delete link.dataset.aptDeferredFont;
      });
    },
    run() {
      if (window._aptDeferFontsObs) return;

      // Intercept font stylesheet <link> tags and convert them to non-render-blocking
      const fontHosts = ['use.typekit.net', 'kit.fontawesome.com'];
      const deferLink = (link) => {
        if (link.rel !== 'stylesheet') return;
        try {
          const url = new URL(link.href, location.origin);
          if (!fontHosts.includes(url.hostname)) return;
        } catch { return; }
        if (link.dataset.aptDeferredFont) return;
        link.dataset.aptDeferredFont = '1';
        // Swap to print media so it doesn't block render, then flip to all on load
        link.media = 'print';
        link.addEventListener('load', () => { link.media = 'all'; }, { once: true });
      };

      const obs = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (node.nodeType !== 1) continue;
            const links = node.tagName === 'LINK' ? [node] : [...(node.querySelectorAll?.('link[rel="stylesheet"]') || [])];
            for (const link of links) {
              deferLink(link);
            }
          }
        }
      });

      // Also catch links already present when hot-enabled.
      document.querySelectorAll('link[rel="stylesheet"]').forEach(deferLink);

      obs.observe(document.documentElement, { childList: true, subtree: true });
      window._aptDeferFontsObs = obs;
    },
  });
