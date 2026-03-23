  registerFeature({
    id: 'widen-content',
    label: 'Widen Content Area',
    description: 'Expand the main content column and resize the TOC sidebar for more reading space',
    scope: 'module',
    default: true,
    settings: {
      maxWidth: '95%',
      textWidth: '75%',
      textWidthLg: '80%',
      textWidthXl: '83.333%',
      tocWidth: '20%',
      tocMinWidth: '280px',
      tocPadding: '1rem',
    },
    cleanup() { document.getElementById('apt-widen-content')?.remove(); },
    run(cfg) {
      const styleId = 'apt-widen-content';
      if (document.getElementById(styleId)) return;
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .module-content {
          max-width: ${cfg.maxWidth} !important;
        }
        .module-content > div > article {
          max-width: none !important;
        }
      `;
      document.head.appendChild(style);
    },
  });
