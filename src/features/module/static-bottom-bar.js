  registerFeature({
    id: 'static-bottom-bar',
    label: 'Static Bottom Bar',
    description: 'Move the Previous/Next bar to the page bottom instead of floating over content',
    scope: 'module',
    default: false,
    cleanup() { document.getElementById('apt-static-bottom-bar')?.remove(); },
    run() {
      const styleId = 'apt-static-bottom-bar';
      if (document.getElementById(styleId)) return;
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `main.h-full > footer { position: static !important; }`;
      document.head.appendChild(style);
    },
  });
