  registerFeature({
    id: 'lazy-load-images',
    label: 'Lazy Load Images',
    description: 'Add native lazy loading to images so offscreen images don\'t block page load',
    scope: 'global',
    default: false,
    early: true,
    cleanup() {
      if (window._aptLazyLoadImagesObs) {
        window._aptLazyLoadImagesObs.disconnect();
        delete window._aptLazyLoadImagesObs;
      }
    },
    run() {
      if (window._aptLazyLoadImagesObs) return;
      // Catch images as they're added to the DOM before they start loading
      const obs = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (node.nodeType !== 1) continue;
            const imgs = node.tagName === 'IMG' ? [node] : node.querySelectorAll?.('img') || [];
            for (const img of imgs) {
              if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
              }
            }
          }
        }
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
      window._aptLazyLoadImagesObs = obs;
    },
  });
