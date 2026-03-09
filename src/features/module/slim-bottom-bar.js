  registerFeature({
    id: 'slim-bottom-bar',
    label: 'Slim Bottom Bar',
    description: 'Reduce padding on the Previous / Next navigation bar',
    scope: 'module',
    default: true,
    settings: {
      paddingX: '1rem',
      paddingY: '0.125rem',
    },
    cleanup() { document.getElementById('apt-slim-bottom-bar')?.remove(); },
    run(cfg) {
      const styleId = 'apt-slim-bottom-bar';
      if (document.getElementById(styleId)) return;
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        main.h-full > footer {
          padding: 0 ${cfg.paddingX} !important;
        }
        main.h-full > footer > div {
          padding-top: ${cfg.paddingY} !important;
          padding-bottom: ${cfg.paddingY} !important;
        }
      `;
      document.head.appendChild(style);
    },
  });
