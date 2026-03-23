registerFeature({
    id: 'widen-content',
    label: 'Widen Content Area',
    description: 'Expand the main content column for more reading space',
    scope: 'module',
    default: true,
    hotReload: true,
    settings: {
      maxWidth: 95,
    },
    settingsUI: {
      type: 'range',
      key: 'maxWidth',
      min: 50,
      max: 100,
      step: 1,
    },
    cleanup() { document.getElementById('apt-widen-content')?.remove(); },
    run(cfg) {
      const styleId = 'apt-widen-content';
      document.getElementById(styleId)?.remove();
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .module-content {
          max-width: ${cfg.maxWidth}% !important;
        }
        .module-content > div > article {
          max-width: none !important;
        }
      `;
      document.head.appendChild(style);
    },
  });
