  registerFeature({
    id: 'fix-collapse-all',
    label: 'Fix Collapse/Expand All Sections',
    description: 'Fix the broken "Collapse all sections" / "Expand all sections" toggle on module info pages',
    scope: 'module',
    default: false,
    cleanup() {
      if (window._aptFixCollapseAllClickHandler) {
        document.removeEventListener('click', window._aptFixCollapseAllClickHandler, true);
        delete window._aptFixCollapseAllClickHandler;
      }
      if (window._aptFixCollapseAllInitObs) {
        window._aptFixCollapseAllInitObs.disconnect();
        delete window._aptFixCollapseAllInitObs;
      }
      delete window._aptFixCollapseAllActivePath;
      delete window._aptToggleAllSections;
      delete window._aptCollapseAllSync;
    },
    run() {
      if (!/^\/app\/module\/\d+\/?$/.test(location.pathname)) return;
      if (window._aptFixCollapseAllActivePath === location.pathname) return;

      // If this feature was already wired for another route instance, reset first.
      if (window._aptFixCollapseAllClickHandler) {
        document.removeEventListener('click', window._aptFixCollapseAllClickHandler, true);
      }
      if (window._aptFixCollapseAllInitObs) {
        window._aptFixCollapseAllInitObs.disconnect();
        delete window._aptFixCollapseAllInitObs;
      }

      function getCheckbox(collapse) {
        return collapse.querySelector('input[name="base-accordion-checkbox"], input[type="checkbox"]');
      }

      function isOpen(collapse) {
        const cb = getCheckbox(collapse);
        return collapse.classList.contains('collapse-open') || (cb && cb.checked);
      }

      // Use document-level capture listener so it fires before anything else
      // and survives Vue re-renders
      const clickHandler = function(e) {
        const link = e.target.closest('.module-sections .link-secondary-htb');
        if (!link) return;
        if (!/collapse|expand/i.test(link.textContent)) return;

        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();

        const container = document.querySelector('.module-sections');
        if (!container) return;

        const collapses = [...container.querySelectorAll('.collapse')];
        if (collapses.length === 0) return;

        const wantsCollapse = /collapse/i.test(link.textContent);

        collapses.forEach(collapse => {
          const cb = getCheckbox(collapse);
          if (!cb) return;
          const open = isOpen(collapse);
          if (wantsCollapse && open) cb.click();
          if (!wantsCollapse && !open) cb.click();
        });

        link.textContent = wantsCollapse ? 'Expand all sections' : 'Collapse all sections';
      };
      document.addEventListener('click', clickHandler, true);
      window._aptFixCollapseAllClickHandler = clickHandler;
      window._aptFixCollapseAllActivePath = location.pathname;

      // Sync button text on init + expose helpers
      let inited = false;

      function tryInit() {
        if (inited) return true;
        const container = document.querySelector('.module-sections');
        if (!container) return false;
        const link = container.querySelector('.link-secondary-htb');
        if (!link) return false;

        inited = true;

        // Sync button text to actual state
        const collapses = [...container.querySelectorAll('.collapse')];
        const anyOpen = collapses.some(c => isOpen(c));
        link.textContent = anyOpen ? 'Collapse all sections' : 'Expand all sections';

        // Expose helpers for other features
        window._aptToggleAllSections = function(wantsCollapse) {
          const cont = document.querySelector('.module-sections');
          if (!cont) return;
          const lnk = cont.querySelector('.link-secondary-htb');
          const allCollapses = [...cont.querySelectorAll('.collapse')];
          allCollapses.forEach(collapse => {
            const cb = getCheckbox(collapse);
            if (!cb) return;
            const open = isOpen(collapse);
            if (wantsCollapse && open) cb.click();
            if (!wantsCollapse && !open) cb.click();
          });
          if (lnk) {
            lnk.textContent = wantsCollapse ? 'Expand all sections' : 'Collapse all sections';
          }
        };

        window._aptCollapseAllSync = function() {
          const cont = document.querySelector('.module-sections');
          if (!cont) return;
          const lnk = cont.querySelector('.link-secondary-htb');
          if (!lnk) return;
          const allCollapses = [...cont.querySelectorAll('.collapse')];
          const allOpen = allCollapses.every(c => isOpen(c));
          lnk.textContent = allOpen ? 'Collapse all sections' : 'Expand all sections';
        };

        return true;
      }

      if (!tryInit()) {
        const obs = new MutationObserver((_, o) => {
          if (tryInit()) {
            o.disconnect();
            if (window._aptFixCollapseAllInitObs === obs) {
              delete window._aptFixCollapseAllInitObs;
            }
          }
        });
        obs.observe(document.body, { childList: true, subtree: true });
        window._aptFixCollapseAllInitObs = obs;
        setTimeout(() => {
          if (window._aptFixCollapseAllInitObs === obs) {
            obs.disconnect();
            delete window._aptFixCollapseAllInitObs;
          }
        }, 10000);
      }
    },
  });
