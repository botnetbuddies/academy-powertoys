  // ──────────────────────────────────────────────────────────────
  //  Settings Panel UI
  // ──────────────────────────────────────────────────────────────

  function buildSettingsPanel() {
    if (document.getElementById('apt-settings-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'apt-settings-overlay';
    overlay.innerHTML = `
      <style>
        #apt-settings-overlay {
          position: fixed; inset: 0; z-index: 99999;
          background: rgba(0,0,0,0.6); display: flex;
          align-items: center; justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #apt-settings-panel {
          background: #1a1a2e; color: #e0e0e0; border: 1px solid #2a2a4a;
          border-radius: 12px; width: 520px; max-width: 95vw;
          max-height: 85vh; overflow-y: auto; padding: 0;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        #apt-settings-panel::-webkit-scrollbar { width: 6px; }
        #apt-settings-panel::-webkit-scrollbar-track { background: transparent; }
        #apt-settings-panel::-webkit-scrollbar-thumb { background: #3a3a5a; border-radius: 3px; }
        .apt-header {
          padding: 20px 24px; border-bottom: 1px solid #2a2a4a;
          display: flex; justify-content: space-between; align-items: center;
          position: sticky; top: 0; background: #1a1a2e; z-index: 1;
        }
        .apt-header h2 { margin: 0; font-size: 18px; color: #9fef00; font-weight: 600; }
        .apt-close {
          background: none; border: none; color: #888; font-size: 22px;
          cursor: pointer; padding: 4px 8px; border-radius: 6px;
          transition: all 0.15s;
        }
        .apt-close:hover { color: #fff; background: #2a2a4a; }
        .apt-scope-section { padding: 16px 24px; }
        .apt-scope-section:not(:last-child) { border-bottom: 1px solid #2a2a4a; }
        .apt-scope-title {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1.5px; color: #9fef00; margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .apt-scope-title .apt-badge {
          font-size: 9px; padding: 2px 6px; border-radius: 4px;
          background: rgba(159,239,0,0.15); color: #9fef00;
        }
        .apt-feature-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px; margin-bottom: 4px; border-radius: 8px;
          transition: background 0.15s;
        }
        .apt-feature-row:hover { background: #22223a; }
        .apt-feature-info { flex: 1; margin-right: 12px; }
        .apt-feature-label { font-size: 14px; font-weight: 500; color: #e0e0e0; }
        .apt-feature-desc { font-size: 12px; color: #888; margin-top: 2px; }
        .apt-toggle {
          position: relative; width: 42px; height: 24px; flex-shrink: 0;
        }
        .apt-toggle input { opacity: 0; width: 0; height: 0; }
        .apt-toggle .apt-slider {
          position: absolute; inset: 0; background: #333;
          border-radius: 12px; cursor: pointer; transition: all 0.2s;
        }
        .apt-toggle .apt-slider::before {
          content: ''; position: absolute; width: 18px; height: 18px;
          left: 3px; bottom: 3px; background: #888;
          border-radius: 50%; transition: all 0.2s;
        }
        .apt-toggle input:checked + .apt-slider { background: rgba(159,239,0,0.3); }
        .apt-toggle input:checked + .apt-slider::before {
          transform: translateX(18px); background: #9fef00;
        }
        .apt-footer {
          padding: 16px 24px; border-top: 1px solid #2a2a4a;
          display: flex; justify-content: space-between; align-items: center;
          position: sticky; bottom: 0; background: #1a1a2e;
        }
        .apt-footer-note { font-size: 11px; color: #666; }
        .apt-reload-btn {
          background: #9fef00; color: #1a1a2e; border: none;
          padding: 8px 18px; border-radius: 6px; font-size: 13px;
          font-weight: 600; cursor: pointer; transition: all 0.15s;
        }
        .apt-reload-btn:hover { background: #b5ff33; }
        .apt-empty { color: #555; font-size: 13px; padding: 8px 12px; font-style: italic; }
        .apt-select {
          background: #22223a; color: #e0e0e0; border: 1px solid #3a3a5a;
          border-radius: 6px; padding: 6px 28px 6px 10px; font-size: 12px;
          outline: none; cursor: pointer; min-width: 170px; flex-shrink: 0;
        }
        .apt-select:focus { border-color: #9fef00; }
      </style>
      <div id="apt-settings-panel">
        <div class="apt-header">
          <h2>Academy PowerToys</h2>
          <button class="apt-close">&times;</button>
        </div>
        <div id="apt-settings-body"></div>
        <div class="apt-footer">
          <span class="apt-footer-note">Changes apply on reload</span>
          <button class="apt-reload-btn">Save &amp; Reload</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Populate sections
    const body = overlay.querySelector('#apt-settings-body');

    const scopes = [
      { key: 'global', label: 'Global', badge: 'All Pages' },
      { key: 'dashboard', label: 'Dashboard', badge: '/app/dashboard' },
      { key: 'module', label: 'Module', badge: '/app/module/*' },
    ];

    for (const scope of scopes) {
      const scopeFeatures = features.filter(f => f.scope === scope.key);
      const section = document.createElement('div');
      section.className = 'apt-scope-section';
      section.innerHTML = `
        <div class="apt-scope-title">
          ${scope.label}
          <span class="apt-badge">${scope.badge}</span>
        </div>
      `;

      if (scopeFeatures.length === 0) {
        section.innerHTML += `<div class="apt-empty">No features yet — coming soon</div>`;
      }

      for (const feat of scopeFeatures) {
        const enabled = getFeatureEnabled(feat.id);
        const row = document.createElement('div');
        row.className = 'apt-feature-row';
        if (feat.settingsUI && feat.settingsUI.type === 'select') {
          const ui = feat.settingsUI;
          const cfg = getFeatureSettings(feat.id);
          const currentValue = enabled ? String(cfg[ui.key] || feat.settings[ui.key]) : ui.disableValue;
          const options = ui.options.map(opt =>
            `<option value="${opt.value}" ${currentValue === opt.value ? 'selected' : ''}>${opt.label}</option>`
          ).join('');
          row.innerHTML = `
            <div class="apt-feature-info">
              <div class="apt-feature-label">${feat.label}</div>
              <div class="apt-feature-desc">${feat.description}</div>
            </div>
            <select class="apt-select" data-feature-select-id="${feat.id}" data-select-key="${ui.key}" data-disable-value="${ui.disableValue}">
              ${options}
            </select>
          `;
        } else {
          row.innerHTML = `
            <div class="apt-feature-info">
              <div class="apt-feature-label">${feat.label}</div>
              <div class="apt-feature-desc">${feat.description}</div>
            </div>
            <label class="apt-toggle">
              <input type="checkbox" data-feature-id="${feat.id}" ${enabled ? 'checked' : ''}>
              <span class="apt-slider"></span>
            </label>
          `;
        }
        section.appendChild(row);
      }

      body.appendChild(section);
    }

    // Event handlers
    overlay.querySelector('.apt-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    function hotToggle(feat, enabled) {
      if (!feat.cleanup) return; // needs reload
      if (enabled) {
        applyFeature(feat);
      } else {
        cleanupFeature(feat);
      }
    }

    overlay.querySelectorAll('input[data-feature-id]').forEach(input => {
      input.addEventListener('change', () => {
        setFeatureEnabled(input.dataset.featureId, input.checked);
        const feat = features.find(f => f.id === input.dataset.featureId);
        if (feat) hotToggle(feat, input.checked);
      });
    });

    overlay.querySelectorAll('select[data-feature-select-id]').forEach(select => {
      select.addEventListener('change', () => {
        const id = select.dataset.featureSelectId;
        const key = select.dataset.selectKey;
        const disableValue = select.dataset.disableValue;
        const value = select.value;
        const feat = features.find(f => f.id === id);
        if (value === disableValue) {
          setFeatureEnabled(id, false);
          if (feat) hotToggle(feat, false);
        } else {
          setFeatureEnabled(id, true);
          setFeatureSetting(id, key, value);
          // Re-run with new settings: cleanup first, then apply
          if (feat && feat.cleanup) {
            cleanupFeature(feat);
            applyFeature(feat);
          }
        }
      });
    });

    overlay.querySelector('.apt-reload-btn').addEventListener('click', () => {
      location.reload();
    });
  }
