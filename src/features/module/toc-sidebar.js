  registerFeature({
    id: 'toc-sidebar',
    label: 'Resize TOC Sidebar',
    description: 'Adjust the Table of Contents sidebar width and padding',
    scope: 'module',
    default: true,
    settings: {
      width: '20%',
      minWidth: '280px',
      padding: '1rem',
    },
    cleanup() { document.getElementById('apt-toc-sidebar')?.remove(); },
    run(cfg) {
      const styleId = 'apt-toc-sidebar';
      if (document.getElementById(styleId)) return;
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        main.h-full > section > div > div:last-child:has(h3) {
          width: ${cfg.width} !important;
          min-width: ${cfg.minWidth};
        }
        main.h-full > section > div > div:last-child:has(h3) .base-card {
          padding-left: ${cfg.padding} !important;
          padding-right: ${cfg.padding} !important;
        }
      `;
      document.head.appendChild(style);
    },
  });
