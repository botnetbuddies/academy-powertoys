registerFeature({
    id: 'widen-content',
    label: 'Widen Content Area',
    description: 'Expand the main content column for more reading space',
    scope: 'module',
    default: true,
    hotReload: true,
    settings: {
      maxWidth: 90,
    },
    settingsUI: {
      type: 'range',
      key: 'maxWidth',
      min: 50,
      max: 100,
      step: 1,
    },
    cleanup() {
      document.getElementById('apt-widen-content')?.remove();
      document.querySelectorAll('.module-lab-row.apt-toc-inline-layout').forEach((row) => {
        row.classList.remove('apt-toc-inline-layout');
      });
      const state = window.__aptWidenContentState;
      if (state?.onResize) {
        window.removeEventListener('resize', state.onResize);
      }
      delete window.__aptWidenContentState;
    },
    run(cfg) {
      const styleId = 'apt-widen-content';
      document.getElementById(styleId)?.remove();
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .module-content {
          max-width: ${cfg.maxWidth}% !important;
        }
        .module-content > div > article {
          max-width: none !important;
        }

        .module-lab-row.apt-toc-inline-layout {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) clamp(300px, 30vw, 420px);
          align-items: start !important;
          column-gap: 0.75rem;
        }

        .module-lab-row.apt-toc-inline-layout > .flex.items-center.justify-center.w-full.h-full.gap-2 {
          width: auto !important;
          min-width: 0 !important;
        }

        .module-lab-row.apt-toc-inline-layout > .sidebar-open {
          position: sticky !important;
          top: 0.75rem !important;
          right: auto !important;
          left: auto !important;
          width: 100% !important;
          max-width: none !important;
          z-index: 1 !important;
        }
      `;
      document.head.appendChild(style);

      const minContentWidth = 560;
      const minTocWidth = 300;
      const minGap = 12;

      const applyInlineLayout = () => {
        document.querySelectorAll('.module-lab-row').forEach((row) => {
          const toc = Array.from(row.children).find((child) => child.classList?.contains('sidebar-open'));
          if (!toc) {
            row.classList.remove('apt-toc-inline-layout');
            return;
          }

          const rowWidth = row.getBoundingClientRect().width || 0;
          const shouldInline = rowWidth >= (minContentWidth + minTocWidth + minGap);
          row.classList.toggle('apt-toc-inline-layout', shouldInline);
        });
      };

      let state = window.__aptWidenContentState;
      if (!state) {
        state = {};
        window.__aptWidenContentState = state;
      }
      state.applyInlineLayout = applyInlineLayout;

      if (!state.onResize) {
        state.onResize = () => state.applyInlineLayout?.();
        window.addEventListener('resize', state.onResize, { passive: true });
      }

      applyInlineLayout();
    },
  });
