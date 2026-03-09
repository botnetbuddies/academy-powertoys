  // ──────────────────────────────────────────────────────────────
  //  Settings Manager
  // ──────────────────────────────────────────────────────────────

  const STORAGE_KEY = 'academy-powertoys';
  let _settingsCache = null;

  function loadSettings() {
    if (_settingsCache !== null) return _settingsCache;
    try {
      const raw = typeof GM_getValue === 'function'
        ? GM_getValue(STORAGE_KEY, '{}')
        : localStorage.getItem(STORAGE_KEY) || '{}';
      _settingsCache = JSON.parse(raw);
      return _settingsCache;
    } catch { _settingsCache = {}; return _settingsCache; }
  }

  function saveSettings(obj) {
    _settingsCache = obj;
    const json = JSON.stringify(obj);
    try {
      if (typeof GM_setValue === 'function') GM_setValue(STORAGE_KEY, json);
      else localStorage.setItem(STORAGE_KEY, json);
    } catch { /* silent */ }
  }

  function getFeatureEnabled(id) {
    const s = loadSettings();
    const feat = features.find(f => f.id === id);
    if (s[id] !== undefined && typeof s[id] === 'object' && s[id]._enabled !== undefined) return s[id]._enabled;
    if (s[id] !== undefined && typeof s[id] === 'boolean') return s[id];
    return feat ? feat.default : true;
  }

  function setFeatureEnabled(id, enabled) {
    const s = loadSettings();
    if (typeof s[id] === 'object') {
      s[id]._enabled = enabled;
    } else {
      s[id] = enabled;
    }
    saveSettings(s);
  }

  function setFeatureSetting(id, key, value) {
    const s = loadSettings();
    const prev = (typeof s[id] === 'object' && s[id] !== null) ? s[id] : {};
    s[id] = { ...prev, [key]: value };
    saveSettings(s);
  }

  function getFeatureSettings(id) {
    const s = loadSettings();
    const feat = features.find(f => f.id === id);
    const defaults = feat?.settings || {};
    const stored = (typeof s[id] === 'object' && s[id] !== null) ? s[id] : {};
    return { ...defaults, ...stored, _enabled: undefined };
  }
