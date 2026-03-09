  registerFeature({
    id: 'green-inline-code',
    label: 'Green Inline Code',
    description: 'Restore HTB green color on inline code blocks and style HTTP links blue',
    scope: 'module',
    default: true,
    cleanup() { document.getElementById('apt-green-inline-code')?.remove(); },
    run() {
      const styleId = 'apt-green-inline-code';
      if (document.getElementById(styleId)) return;
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        article code.text-blue-250 {
          color: #9fef00 !important;
        }
        article a[href^="http://"],
        article a[href^="https://"] {
          color: #5b9bff !important;
        }
        article a[href^="http://"]:hover,
        article a[href^="https://"]:hover {
          color: #7db3ff !important;
          text-decoration: underline;
        }
      `;
      document.head.appendChild(style);
    },
  });
