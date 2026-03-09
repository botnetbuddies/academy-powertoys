  registerFeature({
    id: 'expand-path-modules',
    label: 'Expand Path Module List',
    description: 'Remove the scroll limit on the Enrolled Path modules list',
    scope: 'dashboard',
    default: true,
    cleanup() { document.getElementById('apt-expand-path-modules')?.remove(); },
    run() {
      const styleId = 'apt-expand-path-modules';
      if (document.getElementById(styleId)) return;
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .border.border-neutral-600.rounded-b-lg[class*="max-h-"] {
          max-height: none !important;
          overflow-y: visible !important;
        }
      `;
      document.head.appendChild(style);
    },
  });
