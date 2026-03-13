  registerFeature({
    id: 'block-telemetry',
    label: 'Block Telemetry & Analytics',
    description: 'Block Cookiebot, Appcues, Hotjar, Sentry, Intercom, Segment, Cloudflare Insights, and Google Analytics requests',
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
        'ingest.sentry.hackthebox.eu',
        'cloudflareinsights.com',
        'googletagmanager.com',
        'fygapokei.hackthebox.com',
        'intercom.io',
        'intercomcdn.com',
        'segment.com',
      ];

      // Same-origin analytics paths (proxied through academy.hackthebox.com)
      const blockedPaths = [
        '/i/o/',           // adsctp tracking pixels
        '/1/i/',           // adsctp alternate path
        '/v1/i',           // Intercom tracking
        '/wa/',            // web analytics
        '/g/collect',      // Google Analytics proxy
        '/gtag/',          // Google tag manager
        '/cdn-cgi/rum',    // Cloudflare RUM
        '/api/30/',        // Sentry envelope
        '/htb-anal.js',    // HTB analytics bundle (576KB!)
        '/beacon.min.js',  // beacon tracking script
        '/af/',            // tracking/fingerprint
        '/213301.js',      // Appcues/telemetry loader
        '/v1/projects/',   // Sentry project settings/DSN
        '/li.lms-analytics/', // LinkedIn insight tag
        '/uwt.js',         // Twitter ads
        '/analytics.js',   // Segment analytics
        '/collect?',       // LinkedIn pixel collect
      ];

      function isBlocked(url) {
        try {
          const parsed = new URL(url, location.origin);
          if (blockedHosts.some(h => parsed.hostname === h || parsed.hostname.endsWith('.' + h))) return true;
          // Block same-origin analytics paths
          if (parsed.origin === location.origin && blockedPaths.some(p => parsed.pathname.startsWith(p))) return true;
          return false;
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
      XMLHttpRequest.prototype.open = function(_method, url) {
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

      // Intercept tracking pixels set via new Image().src = url
      const imgProto = HTMLImageElement.prototype;
      const srcDesc = Object.getOwnPropertyDescriptor(imgProto, 'src');
      if (srcDesc?.configurable && srcDesc.set) {
        Object.defineProperty(imgProto, 'src', {
          configurable: true,
          enumerable: srcDesc.enumerable,
          get() { return srcDesc.get.call(this); },
          set(value) {
            if (isBlocked(value)) return;
            srcDesc.set.call(this, value);
          },
        });
      }

      const origImgSetAttr = imgProto.setAttribute;
      imgProto.setAttribute = function(name, value) {
        if (String(name).toLowerCase() === 'src' && isBlocked(value)) return;
        return origImgSetAttr.apply(this, arguments);
      };

      // Intercept script src too (inline analytics loaders)
      const scriptProto = HTMLScriptElement.prototype;
      const scriptSrcDesc = Object.getOwnPropertyDescriptor(scriptProto, 'src');
      if (scriptSrcDesc?.configurable && scriptSrcDesc.set) {
        Object.defineProperty(scriptProto, 'src', {
          configurable: true,
          enumerable: scriptSrcDesc.enumerable,
          get() { return scriptSrcDesc.get.call(this); },
          set(value) {
            if (isBlocked(value)) return;
            scriptSrcDesc.set.call(this, value);
          },
        });
      }
    },
  });
