  registerFeature({
    id: 'block-telemetry',
    label: 'Block Telemetry & Analytics',
    description: 'Block Cookiebot, Appcues, Hotjar, Sentry, Cloudflare Insights, and Google Analytics via CSP (use uBlock Origin for best results)',
    scope: 'global',
    default: false,
    early: true,
    run() {
      // Inject a CSP meta tag to block telemetry domains at the network level.
      // This is more effective than removing script nodes (which causes retry loops).
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://academy.hackthebox.com https://cdn.services-k8s.prod.aws.htb.systems https://account.hackthebox.com https://use.typekit.net https://kit.fontawesome.com https://ka-f.fontawesome.com; connect-src 'self' https://academy.hackthebox.com https://cdn.services-k8s.prod.aws.htb.systems https://account.hackthebox.com https://ka-f.fontawesome.com https://use.typekit.net;`;
      document.documentElement.appendChild(meta);
    },
  });
