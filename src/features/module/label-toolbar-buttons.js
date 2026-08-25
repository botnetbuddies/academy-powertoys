  registerFeature({
    id: 'label-toolbar-buttons',
    label: 'Label Toolbar Buttons',
    description: 'Add text labels to the icon-only Cheatsheet, Coach, Notes, Help, Resources, and TOC buttons',
    scope: 'module',
    default: true,
    cleanup() {
      document.getElementById('apt-label-toolbar')?.remove();
      document.querySelectorAll('.apt-btn-label').forEach(el => el.remove());
      document.querySelectorAll('[data-apt-label]').forEach(el => el.removeAttribute('data-apt-label'));
    },
    run() {
      const styleId = 'apt-label-toolbar';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          button[data-apt-label] {
            width: auto !important;
            aspect-ratio: unset !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            padding: 4px 10px 4px 8px !important;
          }
          .apt-btn-label {
            font-size: 14px;
            line-height: 1;
            white-space: nowrap;
          }
        `;
        document.head.appendChild(style);
      }

      // aria-label → friendlier display name
      const knownAriaLabels = {
        'HTB Coach': 'Coach',
        'Get Unstuck': 'Help',
        'Table of Contents': 'TOC',
        'More module actions': 'Resources',
      };

      // Known SVG path substrings → label (fallback for buttons without aria-labels)
      const knownButtons = [
        { match: 'M11.6113 2.20053', label: 'Coach' },
        { match: 'M9.99765 15C10.277', label: 'Help' },
        { match: 'M7.5 15V13.5H17', label: 'TOC' },
        { match: 'M9.99558 11.5C9.58186', label: 'Resources' },
      ];

      // Toolbar layout: [Cheatsheet] Coach [Notes] Help [Resources] TOC —
      // bracketed buttons are module-dependent, so infer them from the
      // always-present anchors around them.
      const zones = [
        { label: 'Cheatsheet', after: null, before: 'coach' },
        { label: 'Notes', after: 'coach', before: 'help' },
        { label: 'Resources', after: 'help', before: 'toc' },
      ];

      function addLabel(btn, label) {
        btn.setAttribute('data-apt-label', label.toLowerCase());
        const span = document.createElement('span');
        span.className = 'apt-btn-label';
        span.textContent = label;
        btn.appendChild(span);
      }

      // The translation (language) menu renders desktop/mobile trigger variants
      // in its own <li> — it is not the Cheatsheet, never label it.
      function isTranslationMenu(btn) {
        return btn.className.includes('translation-menu') ||
          (btn.getAttribute('data-testid') || '').includes('translation-menu');
      }

      function labelButtons() {
        const toolbar = document.querySelector('.navbar ul.menu-horizontal');
        if (!toolbar) return false;

        const items = [...toolbar.querySelectorAll(':scope > li')];
        if (items.length === 0) return false;

        const buttons = items.flatMap(li =>
          [...li.querySelectorAll('button')].filter(b => !isTranslationMenu(b)).slice(0, 1)
        );
        if (buttons.length === 0) return false;
        if (buttons.every(b => b.hasAttribute('data-apt-label'))) return true;

        // Pass 1: label what we can identify directly
        const labels = buttons.map(btn => {
          if (btn.hasAttribute('data-apt-label')) return btn.getAttribute('data-apt-label');
          const aria = btn.getAttribute('aria-label');
          if (aria && knownAriaLabels[aria]) {
            addLabel(btn, knownAriaLabels[aria]);
            return knownAriaLabels[aria].toLowerCase();
          }
          const html = btn.innerHTML;
          for (const { match, label } of knownButtons) {
            if (html.includes(match)) {
              addLabel(btn, label);
              return label.toLowerCase();
            }
          }
          return null;
        });

        // Pass 2: infer unlabeled buttons from the anchored layout
        const anchorIdx = l => labels.indexOf(l);
        const coach = anchorIdx('coach');
        const help = anchorIdx('help');
        const toc = anchorIdx('toc');
        if (coach !== -1 && help !== -1 && toc !== -1) {
          const used = new Set(labels.filter(Boolean));
          buttons.forEach((btn, i) => {
            if (labels[i]) return;
            for (const { label, after, before } of zones) {
              const key = label.toLowerCase();
              if (used.has(key)) continue;
              const start = after ? anchorIdx(after) : -1;
              if (start < i && i < anchorIdx(before)) {
                addLabel(btn, label);
                used.add(key);
                labels[i] = key;
                break;
              }
            }
          });
        }

        return true;
      }

      if (!labelButtons()) {
        const obs = new MutationObserver(() => { if (labelButtons()) obs.disconnect(); });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => obs.disconnect(), 10000);
      }
    },
  });
