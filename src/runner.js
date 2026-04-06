  // ──────────────────────────────────────────────────────────────
  //  Runner
  // ──────────────────────────────────────────────────────────────

  function applyFeature(feat) {
    if (!shouldRunFeature(feat)) return;
    try {
      const cfg = feat.settings ? { ...feat.settings, ...getFeatureSettings(feat.id) } : {};
      feat.run(cfg);
    } catch (e) {
      console.error(`[APT] Feature "${feat.id}" error:`, e);
    }
  }

  function cleanupFeature(feat) {
    if (!feat.cleanup) return;
    try { feat.cleanup(); } catch (e) {
      console.error(`[APT] Feature "${feat.id}" cleanup error:`, e);
    }
  }

  function runFeatures() {
    for (const feat of features) {
      if (feat.early) continue; // already ran at document-start
      if (!getFeatureEnabled(feat.id)) {
        // Self-heal: if a feature is disabled but left residual DOM/state
        // (e.g. missed toggle event or SPA rerender race), always clean it up.
        cleanupFeature(feat);
        continue;
      }
      applyFeature(feat);
    }
  }

  // ──────────────────────────────────────────────────────────────
  //  Init (deferred until DOM is ready)
  // ──────────────────────────────────────────────────────────────

  function init() {
    // Register *monkey menu command if available
    try {
      if (typeof GM_registerMenuCommand === 'function') {
        GM_registerMenuCommand('Settings', buildSettingsPanel);
      }
    } catch { /* not available */ }

    // Add floating settings button
    addSettingsButton();

    // Run DOM-dependent features now + on DOM changes
    runFeatures();
    setTimeout(runFeatures, 1000);
    setTimeout(runFeatures, 3000);

    // Debounce: batch all mutations within a frame into one runFeatures call
    let rafPending = false;
    new MutationObserver(() => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => { rafPending = false; runFeatures(); });
    }).observe(document.body, { childList: true, subtree: true });
  }
