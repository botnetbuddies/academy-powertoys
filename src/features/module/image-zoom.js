registerFeature({
        id: 'image-zoom',
        label: 'Image Zoom',
        description: 'Click any image in module content to open it in a full-screen zoom overlay',
        scope: 'module',
        default: true,
        run(cfg) {
                if (document.getElementById('apt-image-zoom-overlay')) return;

                const overlay = document.createElement('div');
                overlay.id = 'apt-image-zoom-overlay';
                overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: zoom-out;
      padding: 2rem;
      backdrop-filter: blur(4px);
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    `;

                const img = document.createElement('img');
                img.style.cssText = `
      max-width: 95vw;
      max-height: 95vh;
      object-fit: contain;
      border-radius: 4px;
      box-shadow: 0 0 50px rgba(0,0,0,0.6);
    `;

                overlay.appendChild(img);
                document.body.appendChild(overlay);

                const open = () => {
                        overlay.style.visibility = 'visible';
                        overlay.style.opacity = '1';
                };

                const close = () => {
                        overlay.style.opacity = '0';
                        overlay.style.visibility = 'hidden';
                        img.src = '';
                        document.body.style.overflow = '';
                };

                overlay.addEventListener('click', close);

                document.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape' && overlay.style.opacity === '1') close();
                });

                // Magnifying glass indicator
                const indicator = document.createElement('span');
                indicator.id = 'apt-image-zoom-indicator';
                indicator.style.cssText = `
      position: fixed;
      z-index: 99998;
      pointer-events: none;
      display: none;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: rgba(0,0,0,0.7);
      color: #fff;
      border-radius: 4px 0 4px 0;
      transition: opacity 0.15s ease;
      opacity: 0;
    `;
                indicator.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>';
                document.body.appendChild(indicator);

                let hoveredImg = null;

                const showIndicator = (target) => {
                        const rect = target.getBoundingClientRect();
                        indicator.style.left = (rect.right - 28) + 'px';
                        indicator.style.top = (rect.bottom - 28) + 'px';
                        indicator.style.display = 'flex';
                        requestAnimationFrame(() => { indicator.style.opacity = '1'; });
                        target.style.cursor = 'zoom-in';
                };

                const hideIndicator = () => {
                        indicator.style.opacity = '0';
                        indicator.style.display = 'none';
                        if (hoveredImg) {
                                hoveredImg.style.cursor = '';
                                hoveredImg = null;
                        }
                };

                window.addEventListener('scroll', () => {
                        if (indicator.style.display === 'flex') hideIndicator();
                }, { passive: true });

                document.addEventListener('mouseover', (e) => {
                        const target = e.target;
                        if (target.tagName !== 'IMG') return;
                        const inContent = target.closest('.module-content, .prose, article, [class*="content"]');
                        if (!inContent) return;
                        if (target.closest('a')) return;

                        hoveredImg = target;
                        showIndicator(target);
                });

                document.addEventListener('mouseout', (e) => {
                        const target = e.target;
                        if (target.tagName !== 'IMG') return;
                        hideIndicator();
                });

                document.addEventListener('click', (e) => {
                        const target = e.target;
                        if (target.tagName !== 'IMG') return;

                        const inContent = target.closest('.module-content, .prose, article, [class*="content"]');
                        if (!inContent) return;
                        if (target.closest('a')) return;

                        e.preventDefault();
                        e.stopPropagation();

                        let src = target.src;
                        if (target.dataset.src) src = target.dataset.src;
                        else if (target.srcset) {
                                const candidates = target.srcset.split(',')
                                        .map(s => {
                                                const [url, density = '1x'] = s.trim().split(' ');
                                                const d = parseFloat(density.replace('x', '')) || 1;
                                                return { url: url.trim(), d };
                                        })
                                        .sort((a, b) => b.d - a.d);
                                if (candidates.length) src = candidates[0].url;
                        }

                        hideIndicator();

                        img.src = src;
                        img.style.width = `${target.width * 1.5}px`;
                        img.style.maxWidth = 'none';
                        img.style.height = 'auto';
                        open();
                        document.body.style.overflow = 'hidden';
                });
        },
});
