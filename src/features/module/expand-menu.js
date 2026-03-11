  registerFeature({
    id: 'expand-menu',
    label: 'Auto-Expand Sidebar Menu',
    description: 'Automatically expand all accordion sections in the sidebar',
    scope: 'module',
    default: true,
    cleanup() {
      document.querySelectorAll('.collapse input[data-apt-expand-menu-converted="1"]').forEach(input => {
        input.type = 'radio';
        input.checked = false;
        input.removeAttribute('data-apt-expand-menu-converted');
      });
    },
    run() {
      document.querySelectorAll('.collapse input[type="radio"][name="accordion"]').forEach(input => {
        input.setAttribute('data-apt-expand-menu-converted', '1');
        input.type = 'checkbox';
        input.checked = true;
      });
    },
  });
