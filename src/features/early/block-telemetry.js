  registerFeature({
    id: 'block-telemetry',
    label: 'Block Telemetry & Analytics',
    description: 'Block Cookiebot, Appcues, Hotjar, Sentry, Cloudflare Insights, and Google Analytics requests',
    scope: 'global',
    default: false,
    early: true,
    run() {
      if (window._aptTelemetryBlockInstalled) return;
      window._aptTelemetryBlockInstalled = true;

      // Only domains observed in actual HTB Academy network traffic
      const blockedHosts = [
        'cookiebot.com',
        'appcues.com',
        'hotjar.com',
        'sentry.hackthebox.eu',
        'cloudflareinsights.com',
        'googletagmanager.com',
        'fygapokei.hackthebox.com',
      ];

      function isBlocked(url) {
        try {
          const host = new URL(url, location.origin).hostname;
          return blockedHosts.some(h => host === h || host.endsWith('.' + h));
        } catch { return false; }
      }

      const origFetch = window.fetch;
      window.fetch = function(input) {
        const url = (input instanceof Request) ? input.url : String(input);
        if (isBlocked(url)) return Promise.resolve(new Response('', { status: 204 }));
        return origFetch.apply(this, arguments);
      };

      // For blocked XHRs, call open() with a data: URI so the object stays in a
      // valid state, then have send() fire error/loadend so callers don't hang.
      const origOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url) {
        this._aptBlocked = isBlocked(String(url));
        if (this._aptBlocked) return origOpen.call(this, 'GET', 'data:text/plain,');
        return origOpen.apply(this, arguments);
      };
      const origSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function() {
        if (this._aptBlocked) {
          this.dispatchEvent(new ProgressEvent('error'));
          this.dispatchEvent(new ProgressEvent('loadend'));
          return;
        }
        return origSend.apply(this, arguments);
      };

      if (navigator.sendBeacon) {
        const origBeacon = navigator.sendBeacon.bind(navigator);
        navigator.sendBeacon = function(url, data) {
          if (isBlocked(String(url))) return true;
          return origBeacon(url, data);
        };
      }

      const origAppendChild = Node.prototype.appendChild;
      Node.prototype.appendChild = function(node) {
        if (node.tagName === 'SCRIPT' && node.src && isBlocked(node.src)) return node;
        if (node.tagName === 'IMG' && node.src && isBlocked(node.src)) return node;
        return origAppendChild.call(this, node);
      };

      const origInsertBefore = Node.prototype.insertBefore;
      Node.prototype.insertBefore = function(node, ref) {
        if (node.tagName === 'SCRIPT' && node.src && isBlocked(node.src)) return node;
        if (node.tagName === 'IMG' && node.src && isBlocked(node.src)) return node;
        return origInsertBefore.call(this, node, ref);
      };
    },
  });
