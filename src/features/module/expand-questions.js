  registerFeature({
    id: 'expand-questions',
    label: 'Expand All Questions',
    description: 'Auto-expand all question accordions on module pages',
    scope: 'module',
    default: true,
    cleanup() {
      if (window._aptExpandQuestionsObs) { window._aptExpandQuestionsObs.disconnect(); delete window._aptExpandQuestionsObs; }
      document.querySelectorAll('#questions-list [data-apt-expanded]').forEach(el => {
        el.removeAttribute('data-apt-expanded');
        const cb = el.querySelector('input[type="checkbox"]');
        if (cb && cb.checked) cb.click();
      });
    },
    run() {
      function expandAll() {
        const list = document.getElementById('questions-list');
        if (!list) return;
        list.querySelectorAll('li .collapse').forEach(collapse => {
          if (collapse.hasAttribute('data-apt-expanded')) return;
          const cb = collapse.querySelector('input[type="checkbox"]');
          if (cb && !cb.checked) {
            cb.click();
            collapse.setAttribute('data-apt-expanded', '');
          }
        });
      }
      expandAll();
      const obs = new MutationObserver(() => { expandAll(); });
      const target = document.getElementById('questions-list') || document.body;
      obs.observe(target, { childList: true, subtree: true });
      window._aptExpandQuestionsObs = obs;
    },
  });
