  registerFeature({
    id: 'expand-menu',
    label: 'Auto-Expand Sidebar Menu',
    description: 'Automatically expand all accordion sections in the sidebar',
    scope: 'module',
    default: true,
    run() {
      document.querySelectorAll('.collapse input[type="radio"][name="accordion"]').forEach(input => {
        input.type = 'checkbox';
        input.checked = true;
      });
    },
  });
