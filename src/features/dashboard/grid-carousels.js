  registerFeature({
    id: 'grid-carousels',
    label: 'Grid Module Carousels',
    description: 'Convert Modules In Progress and Favourite Modules from carousels to a grid layout',
    scope: 'dashboard',
    default: true,
    cleanup() {
      document.getElementById('apt-grid-carousels')?.remove();
      if (window._aptGridCarouselsObs) { window._aptGridCarouselsObs.disconnect(); delete window._aptGridCarouselsObs; }
      document.querySelectorAll('[data-apt-grid]').forEach(el => el.removeAttribute('data-apt-grid'));
    },
    run() {
      const styleId = 'apt-grid-carousels';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          /* Convert marked carousels to wrapping grid */
          .carousel[data-apt-grid] {
            display: flex !important;
            flex-wrap: wrap !important;
            overflow: visible !important;
            scroll-snap-type: none !important;
          }
          .carousel[data-apt-grid] > .carousel-item {
            scroll-snap-align: unset !important;
            width: calc(25% - 1.125rem) !important;
          }
          /* Hide nav arrows on gridified carousels */
          [data-apt-grid-nav] button {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
      }

      const targets = ['Modules In Progress', 'Favourite Modules'];

      function markCarousels() {
        document.querySelectorAll('.carousel-title').forEach(title => {
          if (!targets.includes(title.textContent.trim())) return;
          // carousel-nav is the parent of title-section, carousel is its sibling
          const navBar = title.closest('.carousel-nav');
          if (!navBar) return;
          const parent = navBar.parentElement;
          if (!parent) return;
          const carousel = parent.querySelector('.carousel');
          if (carousel && !carousel.hasAttribute('data-apt-grid')) {
            carousel.setAttribute('data-apt-grid', '');
          }
          const nav = navBar.querySelector('.navigation-section');
          if (nav && !nav.hasAttribute('data-apt-grid-nav')) {
            nav.setAttribute('data-apt-grid-nav', '');
          }
        });
      }

      markCarousels();
      const obs = new MutationObserver(() => { markCarousels(); });
      obs.observe(document.body, { childList: true, subtree: true });
      window._aptGridCarouselsObs = obs;
    },
  });
