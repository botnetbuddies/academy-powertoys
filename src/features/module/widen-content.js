  registerFeature({
    id: 'widen-content',
    label: 'Widen Content Area',
    description: 'Expand the main content and text columns for more reading space',
    scope: 'module',
    default: true,
    settings: {
      maxWidth: '95%',
      textWidth: '75%',
      textWidthLg: '80%',
      textWidthXl: '83.333%',
    },
    cleanup() { document.getElementById('apt-widen-content')?.remove(); },
    run(cfg) {
      const styleId = 'apt-widen-content';
      if (document.getElementById(styleId)) return;
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        main.h-full > section {
          max-width: ${cfg.maxWidth} !important;
        }
        main.h-full > section > div > div {
          max-width: none !important;
          width: ${cfg.textWidth} !important;
        }
        @media (min-width: 1024px) {
          main.h-full > section > div > div {
            width: ${cfg.textWidthLg} !important;
          }
        }
        @media (min-width: 1536px) {
          main.h-full > section > div > div {
            width: ${cfg.textWidthXl} !important;
          }
        }
      `;
      document.head.appendChild(style);
    },
  });
