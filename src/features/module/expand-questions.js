  registerFeature({
    id: 'expand-questions',
    label: 'Expand All Questions',
    description: 'Auto-expand all question accordions on module pages',
    scope: 'module',
    default: false,
    cleanup() {
      if (window._aptExpandQuestionsObs) {
        window._aptExpandQuestionsObs.disconnect();
        delete window._aptExpandQuestionsObs;
      }

      const getCheckbox = (collapse) =>
        collapse.querySelector('input[name="base-accordion-checkbox"], input[type="checkbox"]');
      const getAriaToggle = (collapse) =>
        collapse.querySelector('.collapse-title [aria-expanded], .collapse-title[aria-expanded]');

      document.querySelectorAll('#questions-list .collapse[data-apt-expanded="1"]').forEach(collapse => {
        collapse.removeAttribute('data-apt-expanded');
        const cb = getCheckbox(collapse);
        if (cb && cb.checked) {
          cb.click();
          return;
        }
        const ariaToggle = getAriaToggle(collapse);
        if (ariaToggle && ariaToggle.getAttribute('aria-expanded') === 'true') {
          ariaToggle.click();
        }
      });
    },
    run() {
      const getList = () => document.getElementById('questions-list');
      const getCheckbox = (collapse) =>
        collapse.querySelector('input[name="base-accordion-checkbox"], input[type="checkbox"]');
      const getAriaToggle = (collapse) =>
        collapse.querySelector('.collapse-title [aria-expanded], .collapse-title[aria-expanded]');

      function isOpen(collapse) {
        const cb = getCheckbox(collapse);
        if (cb) return cb.checked || collapse.classList.contains('collapse-open');
        const ariaToggle = getAriaToggle(collapse);
        if (ariaToggle) return ariaToggle.getAttribute('aria-expanded') === 'true';
        return collapse.classList.contains('collapse-open');
      }

      function openCollapse(collapse) {
        const cb = getCheckbox(collapse);
        if (cb && !cb.checked) {
          cb.click();
          return;
        }
        const ariaToggle = getAriaToggle(collapse);
        if (ariaToggle && ariaToggle.getAttribute('aria-expanded') !== 'true') {
          ariaToggle.click();
          return;
        }
        const title = collapse.querySelector('.collapse-title');
        if (title) title.click();
      }

      function expandAll() {
        const list = getList();
        if (!list) return;

        list.querySelectorAll('.collapse').forEach(collapse => {
          if (!isOpen(collapse)) openCollapse(collapse);
          if (isOpen(collapse)) collapse.setAttribute('data-apt-expanded', '1');
          else collapse.removeAttribute('data-apt-expanded');
        });
      }

      expandAll();
      if (window._aptExpandQuestionsObs) return;

      const obs = new MutationObserver(() => { expandAll(); });
      obs.observe(document.body, { childList: true, subtree: true });
      window._aptExpandQuestionsObs = obs;
    },
  });
