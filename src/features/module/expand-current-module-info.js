  registerFeature({
    id: 'expand-current-module-info',
    label: 'Expand Current Section (Module Info)',
    description: 'On module overview pages, auto-expand only the current syllabus section',
    scope: 'module',
    default: true,
    run() {
      if (!/^\/app\/module\/\d+\/?$/.test(location.pathname)) return;
      const container = document.querySelector('.module-sections');
      if (!container) return;
      if (container.dataset.aptCurrentExpandInit === '1') return;
      container.dataset.aptCurrentExpandInit = '1';

      function getCurrentCollapse() {
        const collapses = [...container.querySelectorAll('.collapse')];
        if (collapses.length === 0) return null;
        return collapses.find(c => c.querySelector('.syllabus-number.bg-primary'))
          || collapses.find(c => {
            const txt = c.querySelector('.syllabus-sections-inner')?.textContent || '';
            return /\d+\s*\/\s*\d+\s*sections?/i.test(txt);
          })
          || collapses.find(c => {
            const right = c.querySelector('.syllabus-sections, .secondary-text')?.textContent || '';
            return !/completed/i.test(right) && /sections?/i.test(right);
          })
          || null;
      }

      function isOpen(collapse, input) {
        return !!collapse && (
          collapse.classList.contains('collapse-open')
          || input?.checked
          || !!collapse.querySelector('.collapse-content .base-list > li, .collapse-content .base-row[page], .base-list > li')
        );
      }

      function attemptOpenCurrent() {
        const currentCollapse = getCurrentCollapse();
        if (!currentCollapse) return false;

        const input = currentCollapse.querySelector('input[name="base-accordion-checkbox"], input[type="checkbox"]');
        const title = currentCollapse.querySelector('.collapse-title');
        if (!input && !title) return false;

        if (isOpen(currentCollapse, input)) return true;

        // Preferred path: native click on the checkbox so framework listeners fire.
        if (input && !input.checked) {
          input.click();
          if (!isOpen(currentCollapse, input)) {
            input.checked = true;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }

        // Fallback for custom click handlers bound to title/container.
        if (!isOpen(currentCollapse, input) && title) {
          title.click();
        }
        if (!isOpen(currentCollapse, input)) {
          currentCollapse.classList.add('collapse-open');
        }

        return isOpen(currentCollapse, input);
      }

      let tries = 0;
      const maxTries = 16;
      const timer = setInterval(() => {
        tries += 1;
        if (attemptOpenCurrent() || tries >= maxTries) {
          clearInterval(timer);
        }
      }, 250);
    },
  });
