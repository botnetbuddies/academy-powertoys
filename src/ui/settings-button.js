  // ──────────────────────────────────────────────────────────────
  //  Settings Button (floating)
  // ──────────────────────────────────────────────────────────────

  function addSettingsButton() {
    if (document.getElementById('apt-settings-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'apt-settings-btn';
    btn.title = 'Academy PowerToys Settings';
    btn.textContent = '\u2699';
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
  }
