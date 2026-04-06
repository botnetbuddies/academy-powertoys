registerFeature({
  id: 'toc-sidebar-width',
  label: 'TOC Sidebar Width',
  description: 'Adjust the inline TOC sidebar width (only applies when Widen Content is on)',
  scope: 'module',
  default: false,
  hotReload: true,
  settings: { width: 35 },
  settingsUI: {
    type: 'range',
    key: 'width',
    min: 30,
    max: 50,
    step: 1,
    unit: 'vw',
  },
  cleanup() {
    document.getElementById('apt-toc-sidebar-width')?.remove();
  },
  run(cfg) {
    const styleId = 'apt-toc-sidebar-width';
    document.getElementById(styleId)?.remove();
    const vw = cfg.width || 30;
    const minPx = Math.round(vw * 8);
    const maxPx = Math.round(vw * 14);
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .module-lab-row.apt-toc-inline-layout {
        grid-template-columns: minmax(0, 1fr) clamp(${minPx}px, ${vw}vw, ${maxPx}px) !important;
      }
    `;
    document.head.appendChild(style);
  },
});
