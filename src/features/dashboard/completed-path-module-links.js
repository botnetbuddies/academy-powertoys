registerFeature({
        id: 'completed-path-module-links',
        label: 'Completed Module Links',
        description: 'Restores the navigation button on completed modules in the Enrolled Path tab',
        scope: 'dashboard',
        default: true,
        hotReload: false,

        cleanup() {
                delete window._aptCmlPathCache;
        },
        run() {
                const ARROW_SVG = `<svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10.875 9.99984L7.45829 6.58317C7.30551 6.43039 7.22913 6.25331 7.22913 6.05192C7.22913 5.85053 7.30551 5.67345 7.45829 5.52067C7.61107 5.36789 7.78815 5.2915 7.98954 5.2915C8.19093 5.2915 8.37036 5.37024 8.52783 5.52771L12.4791 9.479C12.5486 9.554 12.6007 9.63525 12.6354 9.72275C12.6701 9.81025 12.6875 9.904 12.6875 10.004C12.6875 10.104 12.6701 10.1978 12.6354 10.2853C12.6007 10.3728 12.5486 10.4512 12.4791 10.5207L8.52783 14.472C8.37036 14.6294 8.1944 14.7047 7.99996 14.6978C7.80551 14.6908 7.6319 14.6109 7.47913 14.4582C7.32635 14.3054 7.24996 14.1283 7.24996 13.9269C7.24996 13.7255 7.32635 13.5484 7.47913 13.3957L10.875 9.99984Z" fill="currentColor" class="-fill"></path></svg>`;

                if (!window._aptCmlPathCache) window._aptCmlPathCache = new Map();
                const pathCache = window._aptCmlPathCache;

                function normalizeName(name) {
                        return String(name || '').replace(/\s+/g, ' ').trim().toLowerCase();
                }

                function getEnrolledPathPanel() {
                        const tab = document.querySelector('button[role="tab"][aria-label="Enrolled Path tab"]')
                                || [...document.querySelectorAll('button[role="tab"]')].find(
                                        btn => /enrolled\s*path/i.test(btn.getAttribute('aria-label') || btn.textContent || '')
                                );
                        if (!tab) return null;
                        const panelId = tab.getAttribute('aria-controls');
                        if (!panelId) return null;
                        const panel = document.getElementById(panelId);
                        if (!panel || panel.tagName === 'SPAN') return null;
                        return panel;
                }

                function getPathId(panel) {
                        const link = panel.querySelector('a[href^="/app/paths/"]');
                        if (!link) return null;
                        const match = link.getAttribute('href').match(/\/app\/paths\/(\d+)/);
                        return match ? match[1] : null;
                }

                const _fetch = window.fetch;
                window.fetch = async function(...args) {
                        const res = await _fetch.apply(this, args);
                        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
                        if (url && /\/api\/v2\/paths\/\d+/.test(url)) {
                                res.clone().json().then(json => {
                                        const match = url.match(/\/api\/v2\/paths\/(\d+)/);
                                        if (!match) return;
                                        const pathId = match[1];
                                        const modules = Array.isArray(json?.data?.modules) ? json.data.modules : [];
                                        const map = new Map();
                                        for (const mod of modules) {
                                                if (mod.id && mod.name) map.set(normalizeName(mod.name), String(mod.id));
                                        }
                                        if (!window._aptCmlPathCache) window._aptCmlPathCache = new Map();
                                        window._aptCmlPathCache.set(pathId, map);
                                }).catch(() => { });
                        }
                        return res;
                };

                async function fetchModuleMap(pathId) {
                        if (pathCache.has(pathId)) return pathCache.get(pathId);
                        try {
                                const r = await fetch(`/api/v2/paths/${pathId}`);
                                if (!r.ok) return null;
                                const json = await r.json();
                                const modules = Array.isArray(json?.data?.modules) ? json.data.modules : [];
                                const map = new Map();
                                for (const mod of modules) {
                                        if (mod.id && mod.name) map.set(normalizeName(mod.name), String(mod.id));
                                }
                                pathCache.set(pathId, map);
                                return map;
                        } catch {
                                return null;
                        }
                }

                function injectButtons(panel, moduleMap) {
                        const ul = panel.querySelector('ul');
                        if (!ul) return;
                        for (const li of ul.querySelectorAll(':scope > li')) {
                                if (li.dataset.aptCmlWired) continue;
                                if (!li.querySelector('.module-completed-text')) continue;
                                if (li.querySelector('a[href^="/app/module/"]')) continue;
                                const titleEl = li.querySelector('.module-title');
                                if (!titleEl) continue;
                                const moduleId = moduleMap.get(normalizeName(titleEl.textContent));
                                if (!moduleId) continue;
                                const completedDiv = li.querySelector('.module-completed-text')?.closest('.text-accent')
                                        || li.querySelector('.module-completed-text')?.parentElement;
                                if (!completedDiv?.parentElement) continue;

                                const a = document.createElement('a');
                                a.href = `/app/module/${moduleId}`;
                                a.className = 'htb-square-button htb-square-button--ghost-secondary htb-square-button--medium';
                                a.setAttribute('role', 'link');
                                a.setAttribute('data-apt-cml-injected', '1');
                                a.innerHTML = ARROW_SVG;

                                // Wrap completedDiv + button together, mirroring the non-completed layout
                                const wrapper = document.createElement('div');
                                wrapper.className = 'sm:flex items-center gap-2';
                                wrapper.setAttribute('data-apt-cml-injected', '1');
                                completedDiv.parentElement.insertBefore(wrapper, completedDiv);
                                wrapper.appendChild(completedDiv);
                                wrapper.appendChild(a);

                                li.dataset.aptCmlWired = '1';
                        }
                }

                async function run() {
                        const panel = getEnrolledPathPanel();
                        if (!panel) return;
                        const pathId = getPathId(panel);
                        if (!pathId) return;
                        const moduleMap = await fetchModuleMap(pathId);
                        if (!moduleMap) return;
                        injectButtons(panel, moduleMap);
                }

                run();

        },
});
