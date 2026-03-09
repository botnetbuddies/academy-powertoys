  // ──────────────────────────────────────────────────────────────
  //  Scope Detection
  // ──────────────────────────────────────────────────────────────

  function detectScope() {
    const path = window.location.pathname;
    if (path.match(/^\/app\/module\//)) return 'module';
    if (path === '/app' || path === '/app/' || path.match(/^\/app\/dashboard/)) return 'dashboard';
    return 'global';
  }

  function shouldRunFeature(feature) {
    if (feature.scope === 'global') return true;
    return feature.scope === detectScope();
  }
