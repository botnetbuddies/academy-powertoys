  // ──────────────────────────────────────────────────────────────
  //  Settings Button
  // ──────────────────────────────────────────────────────────────

  const APT_GEAR_SVG = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="shrink-0">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" />
    </svg>`;

  function addSettingsButton() {
    if (document.getElementById('apt-settings-btn')) return true;
    if (!document.body) return false;
    const btn = document.createElement('button');
    btn.id = 'apt-settings-btn';
    btn.title = 'Academy PowerToys Settings';
    btn.textContent = '⚙';
    btn.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 99998;
      width: 40px; height: 40px; border-radius: 50%;
      background: #1a1a2e; border: 1px solid #2a2a4a;
      color: #9fef00; font-size: 20px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.2s; opacity: 0.7;
    `;
    btn.addEventListener('mouseenter', () => { btn.style.opacity = '1'; btn.style.transform = 'scale(1.1)'; });
    btn.addEventListener('mouseleave', () => { btn.style.opacity = '0.7'; btn.style.transform = 'scale(1)'; });
    btn.addEventListener('click', buildSettingsPanel);
    document.body.appendChild(btn);
    return true;
  }

  function addNavbarSettingsButton() {
    if (document.getElementById('apt-nav-settings-btn')) return true;

    const searchSvg = document.querySelector('svg[aria-label="Search"]');
    const anchor = searchSvg && searchSvg.closest('.htb-tooltip-container');
    if (!anchor || !anchor.parentElement) return false;

    const wrapper = document.createElement('div');
    wrapper.className = 'htb-tooltip-container';
    wrapper.id = 'apt-nav-settings';
    wrapper.innerHTML = `
      <div>
        <button id="apt-nav-settings-btn" type="button"
          title="Academy PowerToys Settings" aria-label="Academy PowerToys Settings"
          class="cursor-pointer hover:bg-neutral-400 px-2 py-1.5 rounded-md mt-1">
          ${APT_GEAR_SVG}
        </button>
      </div>`;
    anchor.after(wrapper);
    wrapper.querySelector('#apt-nav-settings-btn').addEventListener('click', (e) => {
      e.preventDefault();
      buildSettingsPanel();
    });
    return true;
  }

  function removeFloatingButton() { document.getElementById('apt-settings-btn')?.remove(); }
  function removeNavbarButton() { document.getElementById('apt-nav-settings')?.remove(); }

  registerFeature({
    id: 'settings-button',
    label: 'Settings Button',
    description: 'Where the settings gear appears. The browser extension can also open settings from its toolbar icon.',
    scope: 'global',
    default: true,
    hotReload: true,
    settings: { location: 'floating' },
    settingsUI: {
      type: 'select',
      key: 'location',
      disableValue: '__never__', // sentinel: placement is always on
      options: [
        { value: 'floating', label: 'Floating Corner' },
        { value: 'navbar', label: 'HTB Top Bar (by Search)' },
      ],
    },
    cleanup() {
      removeFloatingButton();
      removeNavbarButton();
    },
    run(cfg) {
      if ((cfg.location || 'floating') === 'navbar') {
        removeFloatingButton();
        addNavbarSettingsButton();
      } else {
        removeNavbarButton();
        addSettingsButton();
      }
    },
  });

  // Toolbar-icon click (extension only) reaches the page through the bridge.
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const d = event.data;
    if (d && d.__aptExt === true && d.type === 'open-settings') buildSettingsPanel();
  });
