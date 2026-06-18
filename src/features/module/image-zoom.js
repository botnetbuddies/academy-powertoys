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
      display: none;
      align-items: center;
      justify-content: center;
      cursor: zoom-out;
      padding: 2rem;
      backdrop-filter: blur(4px);
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

                const close = () => {
                        overlay.style.display = 'none';
                        img.src = '';
                        document.body.style.overflow = '';
                };

                overlay.addEventListener('click', close);

                document.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape' && overlay.style.display === 'flex') close();
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

                        img.src = src;
                        img.style.width = `${target.width * 1.5}px`;
                        img.style.maxWidth = 'none';
                        img.style.height = 'auto';
                        overlay.style.display = 'flex';
                        document.body.style.overflow = 'hidden';
                });
        },
});
