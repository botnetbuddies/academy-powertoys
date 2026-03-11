  registerFeature({
    id: 'sort-completed-last',
    label: 'Completed Items Last',
    description: 'Move completed modules/paths to the end in dashboard carousels and the Enrolled Path tab',
    scope: 'dashboard',
    default: false,
    run() {
      // 0 = in progress (show first), 1 = not started, 2 = completed (show last)
      function cardSortOrder(card) {
        const progressEl = card.querySelector('progress[max="100"]');
        if (progressEl && Number(progressEl.value) >= 100) return 2;
        if (card.querySelector('.path-completed-text, .module-completed-text')) return 2;
        if (progressEl && Number(progressEl.value) > 0) return 0;
        if (card.querySelector('.badge-notify')) return 0;
        return 1;
      }

      // Sort carousel/list sections
      const sectionTitles = ['Favourite Modules', 'Modules In Progress', 'Popular Modules', 'Popular Paths', 'Get a new Job', 'Job Role Paths'];

      for (const title of sectionTitles) {
        const heading = [...document.querySelectorAll('h2')].find(
          h => h.textContent.trim() === title
        );
        if (!heading) continue;

        const section = heading.closest('section[data-v-09c02e11]');
        if (!section) continue;

        const carousel = section.querySelector('.carousel');
        const list = section.querySelector('ul');
        const container = carousel || list;
        if (!container) continue;
        if (container.dataset.aptSorted) continue;
        container.dataset.aptSorted = '1';

        const itemSelector = carousel ? '.carousel-item' : 'li';
        const items = [...container.querySelectorAll(`:scope > ${itemSelector}`)];
        if (items.length === 0) continue;

        items.sort((a, b) => cardSortOrder(a) - cardSortOrder(b));
        for (const item of items) {
          container.appendChild(item);
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
        const hasIndicators = items.every(li =>
          li.querySelector('progress[max="100"]') || li.querySelector('.module-completed-text, .path-completed-text')
        );
        if (!hasIndicators) return false;

        if (list.dataset.aptSorted) return true;
        list.dataset.aptSorted = '1';

        items.sort((a, b) => cardSortOrder(a) - cardSortOrder(b));
        for (const item of items) list.appendChild(item);
        return true;
      }

      if (!sortEnrolledPath()) {
        const obs = new MutationObserver(() => { if (sortEnrolledPath()) obs.disconnect(); });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => obs.disconnect(), 5000);
      }
    },
  });
