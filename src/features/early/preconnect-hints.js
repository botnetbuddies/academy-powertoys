  registerFeature({
    id: 'preconnect-hints',
    label: 'Preconnect Hints',
    description: 'Start DNS + TLS handshakes early for critical domains so resources load faster',
    scope: 'global',
    default: true,
    early: true,
    run() {
      const origins = [
        'https://cdn.services-k8s.prod.aws.htb.systems',
        'https://account.hackthebox.com',
        'https://ka-f.fontawesome.com',
        'https://use.typekit.net',
      ];
      for (const origin of origins) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        link.crossOrigin = 'anonymous';
        document.documentElement.appendChild(link);
      }
    },
  });
