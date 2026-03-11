  registerFeature({
    id: 'expand-current-module-info',
    label: 'Expand All Sections (Module Info)',
    description: 'On module overview pages, auto-expand all syllabus sections',
    scope: 'module',
    default: false,
    cleanup() {
      if (window._aptExpandAllModuleInfoObs) {
        window._aptExpandAllModuleInfoObs.disconnect();
        delete window._aptExpandAllModuleInfoObs;
      }
      delete window._aptExpandedModuleInfoPath;
    },
    run() {
      if (!/^\/app\/module\/\d+\/?$/.test(location.pathname)) return;
      const infoPath = location.pathname;
      if (window._aptExpandedModuleInfoPath === infoPath) return;
      function expandAllOnce() {

        const container = document.querySelector('.module-sections');
        if (!container) return false;

        const collapses = [...container.querySelectorAll('.collapse')];
        if (collapses.length === 0) return false;

        collapses.forEach(collapse => {
          if (collapse.classList.contains('collapse-open')) return;
          const cb = collapse.querySelector('input[name="base-accordion-checkbox"], input[type="checkbox"]');
          if (cb && !cb.checked) cb.click();
        });

        window._aptExpandedModuleInfoPath = infoPath;
        if (typeof window._aptCollapseAllSync === 'function') {
          window._aptCollapseAllSync();
        }

        return true;
      }

      if (expandAllOnce()) {
        if (window._aptExpandAllModuleInfoObs) {
          window._aptExpandAllModuleInfoObs.disconnect();
          delete window._aptExpandAllModuleInfoObs;
        }
        return;
      }

      if (window._aptExpandAllModuleInfoObs) return;
      const obs = new MutationObserver(() => {
        if (window._aptExpandedModuleInfoPath === infoPath || expandAllOnce()) {
          obs.disconnect();
          if (window._aptExpandAllModuleInfoObs === obs) {
            delete window._aptExpandAllModuleInfoObs;
          }
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      window._aptExpandAllModuleInfoObs = obs;
      setTimeout(() => {
        if (window._aptExpandAllModuleInfoObs === obs) {
          obs.disconnect();
          delete window._aptExpandAllModuleInfoObs;
        }
      }, 10000);
    },
  });
