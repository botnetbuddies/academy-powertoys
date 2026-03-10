  registerFeature({
    id: 'expand-current-module-info',
    label: 'Expand All Sections (Module Info)',
    description: 'On module overview pages, auto-expand all syllabus sections',
    scope: 'module',
    default: true,
    run() {
      if (!/^\/app\/module\/\d+\/?$/.test(location.pathname)) return;

      let done = false;

      function expandAll() {
        if (done) return true;

        const container = document.querySelector('.module-sections');
        if (!container) return false;

        const collapses = [...container.querySelectorAll('.collapse')];
        if (collapses.length === 0) return false;

        done = true;

        collapses.forEach(collapse => {
          if (collapse.classList.contains('collapse-open')) return;
          const cb = collapse.querySelector('input[name="base-accordion-checkbox"], input[type="checkbox"]');
          if (cb && !cb.checked) cb.click();
        });

        return true;
      }

      if (!expandAll()) {
        const obs = new MutationObserver((_, o) => {
          if (expandAll()) o.disconnect();
        });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => obs.disconnect(), 10000);
      }
    },
  });
