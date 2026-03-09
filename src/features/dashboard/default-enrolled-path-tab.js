  registerFeature({
    id: 'default-enrolled-path-tab',
    label: 'Default Dashboard Tab',
    description: 'Choose which dashboard tab should open by default: Exam Progress, Enrolled Path, or Modules in Progress',
    scope: 'dashboard',
    default: true,
    settings: {
      defaultTab: 'enrolled-path', // 'exam-progress' | 'enrolled-path' | 'modules-in-progress'
    },
    settingsUI: {
      type: 'select',
      key: 'defaultTab',
      disableValue: 'none',
      options: [
        { value: 'none', label: 'No Auto-Select' },
        { value: 'exam-progress', label: 'Exam Progress' },
        { value: 'enrolled-path', label: 'Enrolled Path' },
        { value: 'modules-in-progress', label: 'Modules in Progress' },
      ],
    },
    run(cfg) {
      const choice = String(cfg.defaultTab || 'enrolled-path');

      function findTabByChoice(tabChoice) {
        const buttons = [...document.querySelectorAll('button[role="tab"]')];
        if (buttons.length === 0) return null;

        const byAria = {
          'exam-progress': 'Exam Progress tab',
          'enrolled-path': 'Enrolled Path tab',
          'modules-in-progress': 'Modules in Progress tab',
        };
        const targetAria = byAria[tabChoice];
        if (targetAria) {
          const exact = document.querySelector(`button[role="tab"][aria-label="${targetAria}"]`);
          if (exact) return exact;
        }

        const patterns = {
          'exam-progress': /exam\s*progress/i,
          'enrolled-path': /enrolled\s*path/i,
          'modules-in-progress': /modules?\s*in\s*progress/i,
        };
        const pat = patterns[tabChoice];
        if (!pat) return null;
        return buttons.find(btn =>
          pat.test(btn.getAttribute('aria-label') || '')
          || pat.test(btn.textContent || '')
        ) || null;
      }

      const tab = findTabByChoice(choice);
      if (!tab) return;

      if (tab.getAttribute('aria-selected') !== 'true') {
        if (tab.dataset.aptClicked) return;
        tab.dataset.aptClicked = '1';
        tab.click();
      }
    },
  });
