  registerFeature({
    id: 'unstick-navbar',
    label: 'Non-Sticky Nav Bar',
    description: 'Make the top navigation bar scroll with the page instead of staying fixed',
    scope: 'global',
    default: false,
    cleanup() { document.getElementById('apt-unstick-navbar')?.remove(); },
    run() {
      const styleId = 'apt-unstick-navbar';
      if (document.getElementById(styleId)) return;
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        header.sticky, header nav.sticky {
          position: relative !important;
        }
      `;
      document.head.appendChild(style);
    },
  });
