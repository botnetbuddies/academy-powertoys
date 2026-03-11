  registerFeature({
    id: 'preconnect-hints',
    label: 'Preconnect Hints',
    description: 'Start DNS + TLS handshakes early for critical domains so resources load faster',
    scope: 'global',
    default: false,
    early: true,
    cleanup() {
      document.querySelectorAll('link[data-apt-preconnect="1"]').forEach(link => link.remove());
    },
    run() {
      const origins = [
        'https://cdn.services-k8s.prod.aws.htb.systems',
        'https://account.hackthebox.com',
        'https://ka-f.fontawesome.com',
        'https://use.typekit.net',
      ];
      for (const origin of origins) {
        if (document.querySelector(`link[data-apt-preconnect="1"][href="${origin}"]`)) continue;
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        link.crossOrigin = 'anonymous';
        link.dataset.aptPreconnect = '1';
        document.documentElement.appendChild(link);
      }
    },
  });
