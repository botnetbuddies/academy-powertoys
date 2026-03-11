  registerFeature({
    id: 'rename-job-section',
    label: 'Rename "Get a new Job"',
    description: 'Change the misleading "Get a new Job" heading to "Job Role Paths"',
    scope: 'dashboard',
    default: false,
    cleanup() {
      document.querySelectorAll('[data-apt-renamed-job]').forEach(el => {
        el.textContent = el.getAttribute('data-apt-renamed-job');
        el.removeAttribute('data-apt-renamed-job');
      });
    },
    run() {
      function rename() {
        document.querySelectorAll('h2').forEach(h2 => {
          if (h2.textContent.trim() === 'Get a new Job' && !h2.hasAttribute('data-apt-renamed-job')) {
            h2.setAttribute('data-apt-renamed-job', h2.textContent);
            h2.textContent = 'Job Role Paths';
          }
        });
      }
      rename();
      const obs = new MutationObserver(() => { rename(); });
      obs.observe(document.body, { childList: true, subtree: true });
      window._aptRenameJobObs = obs;
    },
  });
