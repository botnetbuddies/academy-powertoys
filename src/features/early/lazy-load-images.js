  registerFeature({
    id: 'lazy-load-images',
    label: 'Lazy Load Images',
    description: 'Add native lazy loading to images so offscreen images don\'t block page load',
    scope: 'global',
    default: true,
    early: true,
    run() {
      // Catch images as they're added to the DOM before they start loading
      new MutationObserver((mutations) => {
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
      }).observe(document.documentElement, { childList: true, subtree: true });
    },
  });
