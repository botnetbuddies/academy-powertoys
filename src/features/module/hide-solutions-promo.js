  registerFeature({
    id: 'hide-solutions-promo',
    label: 'Hide Step-by-Step Solutions PRO',
    description: 'Remove the "Enable step-by-step solutions" PRO upsell banner',
    scope: 'module',
    default: false,
    cleanup() {
      if (window._aptHidePromoObs) { window._aptHidePromoObs.disconnect(); delete window._aptHidePromoObs; }
      document.querySelectorAll('[data-apt-hidden-promo]').forEach(el => {
        el.style.display = '';
        el.removeAttribute('data-apt-hidden-promo');
      });
    },
    run() {
      function hidePromo() {
        // The PRO banner is a .col-span-full div with a disabled toggle + .badge-notify
        const badges = document.querySelectorAll('.badge-notify');
        for (const badge of badges) {
          const row = badge.closest('.col-span-full');
          if (!row) continue;
          const toggle = row.querySelector('input[type="checkbox"][disabled]');
          if (!toggle) continue;
          row.style.display = 'none';
          row.setAttribute('data-apt-hidden-promo', '');
        }
      }
      hidePromo();
      // Observe in case it loads dynamically
      const obs = new MutationObserver(() => { hidePromo(); });
      obs.observe(document.body, { childList: true, subtree: true });
      window._aptHidePromoObs = obs;
    },
  });
