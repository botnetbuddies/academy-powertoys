  // Run early features immediately (before DOM is ready)
  for (const feat of features) {
    if (!feat.early) continue;
    if (!getFeatureEnabled(feat.id)) continue;
    try { feat.run(); } catch (e) { console.error(`[APT] Early feature "${feat.id}" error:`, e); }
  }
