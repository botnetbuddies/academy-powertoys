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
        main.h-full > section > div > div:last-child:has(h3) {
          width: ${cfg.tocWidth} !important;
          min-width: ${cfg.tocMinWidth};
        }
        main.h-full > section > div > div:last-child:has(h3) .base-card {
          padding-left: ${cfg.tocPadding} !important;
          padding-right: ${cfg.tocPadding} !important;
        }
      `;
      document.head.appendChild(style);
    },
  });
