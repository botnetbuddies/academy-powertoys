  registerFeature({
    id: 'sort-completed-last',
    label: 'Completed Items Last',
    description: 'Move completed modules/paths to the end in dashboard carousels and the Enrolled Path tab',
    scope: 'dashboard',
    default: false,
    cleanup() {
      if (window._aptSortCompletedLastObs) {
        window._aptSortCompletedLastObs.disconnect();
        delete window._aptSortCompletedLastObs;
      }
      if (window._aptSortCompletedLastRaf) {
        cancelAnimationFrame(window._aptSortCompletedLastRaf);
        delete window._aptSortCompletedLastRaf;
      }
    },
    run() {
      // 0 = in progress (show first), 1 = not started, 2 = completed (show last)
      function getProgressFraction(card) {
        const progressEl = card.querySelector('progress[value], progress[max]');
        if (progressEl) {
          const max = Number(progressEl.max) || 100;
          const value = Number(progressEl.value) || 0;
          if (max > 0) return value / max;
        }

        const barEl = card.querySelector('[role="progressbar"][aria-valuenow]');
        if (barEl) {
          const max = Number(barEl.getAttribute('aria-valuemax')) || 100;
          const value = Number(barEl.getAttribute('aria-valuenow')) || 0;
          if (max > 0) return value / max;
        }

        const text = card.textContent || '';
        const pctMatch = text.match(/\b(\d{1,3})\s*%\b/);
        if (pctMatch) {
          const pct = Math.max(0, Math.min(100, Number(pctMatch[1])));
          return pct / 100;
        }

        return null;
      }

      function cardSortOrder(card) {
        const progress = getProgressFraction(card);
        const text = (card.textContent || '').toLowerCase();

        if (progress !== null && progress >= 1) return 2;
        if (card.querySelector('.path-completed-text, .module-completed-text')) return 2;
        if (/\bcompleted\b/.test(text)) return 2;

        if (progress !== null && progress > 0) return 0;
        if (card.querySelector('.badge-notify')) return 0;
        if (/\bin\s*progress\b/.test(text)) return 0;

        return 1;
      }

      function sortContainer(container, itemSelector) {
        const items = [...container.querySelectorAll(`:scope > ${itemSelector}`)];
        if (items.length < 2) return;

        const sorted = [...items].sort((a, b) => cardSortOrder(a) - cardSortOrder(b));
        const changed = sorted.some((item, idx) => item !== items[idx]);
        if (!changed) return;

        for (const item of sorted) {
          container.appendChild(item);
        }
      }

      function findSectionContainerFromHeading(heading) {
        const navBar = heading.closest('.carousel-nav');
        const navParent = navBar?.parentElement;
        if (navParent) {
          const carousel = navParent.querySelector('.carousel');
          if (carousel) return { container: carousel, itemSelector: '.carousel-item' };
          const list = navParent.querySelector('ul');
          if (list) return { container: list, itemSelector: 'li' };
        }

        const section = heading.closest('section');
        if (!section) return null;

        const carousel = section.querySelector('.carousel');
        if (carousel) return { container: carousel, itemSelector: '.carousel-item' };
        const list = section.querySelector('ul');
        if (list) return { container: list, itemSelector: 'li' };

        return null;
      }

      const sectionTitleMatchers = [
        /^favourite modules$/i,
        /^modules?\s+in\s+progress$/i,
        /^popular modules$/i,
        /^popular paths$/i,
        /^job role paths$/i,
        /^get\s+a\s+new\s+job$/i,
        /^get\s+a\s+job$/i,
      ];

      function sortDashboardSections() {
        const headings = [...document.querySelectorAll('.carousel-title, h2')];
        for (const heading of headings) {
          const title = (heading.textContent || '').trim();
          if (!sectionTitleMatchers.some(rx => rx.test(title))) continue;

          const sectionInfo = findSectionContainerFromHeading(heading);
          if (!sectionInfo) continue;
          sortContainer(sectionInfo.container, sectionInfo.itemSelector);
        }
      }

      // Sort enrolled path tab panel
      function sortEnrolledPath() {
        const tab = document.querySelector('button[role="tab"][aria-label="Enrolled Path tab"]')
          || [...document.querySelectorAll('button[role="tab"]')].find(
            btn => /enrolled\s*path/i.test(btn.getAttribute('aria-label') || btn.textContent || '')
          );
        if (!tab) return false;

        const panelId = tab.getAttribute('aria-controls');
        if (!panelId) return false;

        const panel = document.getElementById(panelId);
        if (!panel || panel.tagName === 'SPAN') return false;

        const list = panel.querySelector('ul');
        if (!list || list.children.length === 0) return false;

        const items = [...list.querySelectorAll(':scope > li')];
        if (items.length < 2) return false;
        const hasIndicators = items.every(li => cardSortOrder(li) !== 1);
        if (!hasIndicators) return false;

        sortContainer(list, 'li');
        return true;
      }

      function runSort() {
        sortDashboardSections();
        sortEnrolledPath();
      }

      runSort();
      const obs = new MutationObserver(() => {
        if (window._aptSortCompletedLastRaf) return;
        window._aptSortCompletedLastRaf = requestAnimationFrame(() => {
          window._aptSortCompletedLastRaf = null;
          runSort();
        });
      });
      obs.observe(document.body, { childList: true, subtree: true });
      window._aptSortCompletedLastObs = obs;
    },
  });
