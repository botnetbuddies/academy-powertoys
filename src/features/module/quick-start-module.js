registerFeature({
  id: 'quick-start-module',
  label: 'Quick Start Module',
  description: 'Clicking a module card goes directly to your in-progress section (or the first section) — skips the module info page',
  scope: 'dashboard',
  default: false,
  hotReload: false,
  cleanup() {
    if (window._aptQuickStartObs) {
      window._aptQuickStartObs.disconnect();
      delete window._aptQuickStartObs;
    }
    document.querySelectorAll('[data-apt-qs-wired]').forEach(el => {
      el.removeAttribute('data-apt-qs-wired');
    });
    delete window._aptQuickStartCache;
  },
  run() {
    if (!window._aptQuickStartCache) window._aptQuickStartCache = new Map();
    const cache = window._aptQuickStartCache;
    const TTL = 60_000;

    async function fetchFirstSection(moduleId) {
      const cached = cache.get(moduleId);
      if (cached && (Date.now() - cached.time) < TTL) return cached.sectionId;

      try {
        const r = await fetch(`/api/v3/modules/${moduleId}/sections`);
        if (!r.ok) return null;
        const json = await r.json();

        // data is an array of groups, each with a sections array -- need to flatten them
        const groups = Array.isArray(json?.data) ? json.data : [];
        const sections = groups.flatMap(g => Array.isArray(g.sections) ? g.sections : []);
        if (sections.length === 0) return null;

        // Sort by page no, then we pick first incomplete (whatever is in-progress), else page 1
        sections.sort((a, b) => (a.page ?? 0) - (b.page ?? 0));
        const target = sections.find(s => s.is_completed === false) || sections[0];
        const sectionId = String(target.id);

        cache.set(moduleId, { sectionId, time: Date.now() });
        return sectionId;
      } catch {
        return null;
      }
    }

    function wireLinks() {
      document.querySelectorAll('a[href]').forEach(a => {
        // Only fetching target module info page links, not any of the section links
        const href = a.getAttribute('href') || '';
        const match = href.match(/^\/app\/module\/(\d+)\/?$/);
        if (!match || a.dataset.aptQsWired) return;
        a.dataset.aptQsWired = '1';
        const moduleId = match[1];

        a.addEventListener('click', async (e) => {
          // Preserving the previous action, which is ctrl/meta opens a new tab 
          if (e.ctrlKey || e.metaKey) return;
          e.preventDefault();
          e.stopPropagation();

          const sectionId = await fetchFirstSection(moduleId);
          location.href = sectionId
            ? `/app/module/${moduleId}/section/${sectionId}`
            : `/app/module/${moduleId}`;
        }, { capture: true });

        // Middle-click: open section directly in new tab
        a.addEventListener('auxclick', async (e) => {
          if (e.button !== 1) return;
          e.preventDefault();
          e.stopPropagation();
          const sectionId = await fetchFirstSection(moduleId);
          const target = sectionId
            ? `/app/module/${moduleId}/section/${sectionId}`
            : `/app/module/${moduleId}`;
          window.open(target, '_blank', 'noopener,noreferrer');
        }, { capture: true });
      });
    }

    wireLinks();

    if (!window._aptQuickStartObs) {
      const obs = new MutationObserver(wireLinks);
      obs.observe(document.body, { childList: true, subtree: true });
      window._aptQuickStartObs = obs;
    }
  },
});
