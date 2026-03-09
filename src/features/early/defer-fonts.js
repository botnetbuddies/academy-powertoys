  registerFeature({
    id: 'defer-fonts',
    label: 'Defer Font Loading',
    description: 'Load Typekit and FontAwesome fonts non-blocking so the page paints before fonts arrive',
    scope: 'global',
    default: true,
    early: true,
    run() {
      // Intercept font stylesheet <link> tags and convert them to non-render-blocking
      const fontHosts = ['use.typekit.net', 'kit.fontawesome.com'];
      new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (node.nodeType !== 1) continue;
            const links = node.tagName === 'LINK' ? [node] : [...(node.querySelectorAll?.('link[rel="stylesheet"]') || [])];
            for (const link of links) {
              if (link.rel !== 'stylesheet') continue;
              try {
                const url = new URL(link.href, location.origin);
                if (!fontHosts.includes(url.hostname)) continue;
              } catch { continue; }
              if (link.dataset.aptDeferred) continue;
              link.dataset.aptDeferred = '1';
              // Swap to print media so it doesn't block render, then flip to all on load
              link.media = 'print';
              link.addEventListener('load', () => { link.media = 'all'; }, { once: true });
            }
          }
        }
      }).observe(document.documentElement, { childList: true, subtree: true });
    },
  });
