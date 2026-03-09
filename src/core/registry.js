  // ──────────────────────────────────────────────────────────────
  //  Feature Registry
  // ──────────────────────────────────────────────────────────────
  //  Each feature is a self-contained object:
  //    id          – unique key (used for settings storage)
  //    label       – short name shown in the settings panel
  //    description – tooltip / help text
  //    scope       – 'global' | 'dashboard' | 'module'
  //    default     – whether it's enabled out of the box
  //    settings    – (optional) sub-settings object with defaults
  //    run(cfg)    – called when the feature is enabled; cfg = merged settings
  // ──────────────────────────────────────────────────────────────

  const features = [];

  function registerFeature(def) {
    features.push(def);
  }
