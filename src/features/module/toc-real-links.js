  registerFeature({
    id: 'toc-real-links',
    label: 'Real Section Links',
    description: 'Make ToC and Info page real links to sections so you can ctrl+click or middle-click to open in a new tab',
    scope: 'module',
    default: true,
    run() {
      const moduleMatch = location.pathname.match(/^\/app\/module\/(\d+)(?:\/|$)/);
      if (!moduleMatch) return;
      const moduleId = moduleMatch[1];
      const currentSectionMatch = location.pathname.match(/\/section\/(\d+)(?:\/|$)/);
      const currentSectionId = currentSectionMatch ? Number(currentSectionMatch[1]) : null;

      const rows = [...document.querySelectorAll('.base-row[page]')];

      function getActivePageNumber() {
        let activeRow = rows.find(row =>
          row.classList.contains('bg-neutral-600')
          || row.getAttribute('aria-current') === 'true'
          || row.dataset.current === '1'
          || row.querySelector('.title.text-primary, .main-text.text-primary')
        );
        if (!activeRow) {
          activeRow = rows.find(row => {
            const statusEl = row.querySelector('.secondary-text');
            return statusEl && /in\s*progress/i.test(statusEl.textContent || '');
          });
        }
        if (!activeRow) return null;
        const activePage = Number(activeRow.getAttribute('page'));
        return Number.isFinite(activePage) ? activePage : null;
      }

      function buildOffsetIdMap() {
        if (!Number.isFinite(currentSectionId)) return null;
        const activePage = getActivePageNumber();
        if (!Number.isFinite(activePage)) return null;

        const map = new Map();
        for (const row of rows) {
          const pageNum = Number(row.getAttribute('page'));
          if (!Number.isFinite(pageNum)) continue;
          map.set(String(pageNum), String(currentSectionId + (pageNum - activePage)));
        }
        return map.size > 0 ? map : null;
      }

      function extractSectionsArray(payload) {
        if (!payload) return [];

        const candidates = [
          payload?.data?.sections,
          payload?.data?.module_sections,
          payload?.data?.module?.sections,
          payload?.sections,
          payload?.data,
          payload,
        ];

        for (const candidate of candidates) {
          if (!Array.isArray(candidate) || candidate.length === 0) continue;
          if (candidate.some(s => typeof s === 'object' && s)) {
            return candidate;
          }
        }

        // Last resort: walk nested objects looking for a section-like array.
        const queue = [payload];
        const seen = new Set();
        while (queue.length > 0) {
          const cur = queue.shift();
          if (!cur || typeof cur !== 'object' || seen.has(cur)) continue;
          seen.add(cur);
          if (Array.isArray(cur)) {
            if (cur.length > 0 && cur.some(s => typeof s === 'object' && s)) {
              return cur;
            }
            for (const item of cur) queue.push(item);
            continue;
          }
          for (const value of Object.values(cur)) queue.push(value);
        }

        return [];
      }

      function normalizeText(value) {
        return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
      }

      function getSectionMeta(section) {
        if (!section || typeof section !== 'object') {
          return { key: null, sectionId: null, title: '' };
        }

        const keyRaw = section.page
          ?? section.order
          ?? section.sort_order
          ?? section.position
          ?? section.index
          ?? section.section_number
          ?? section.number
          ?? section.page_number
          ?? section.ordinal
          ?? section.section?.page
          ?? section.section?.order
          ?? section.section?.sort_order
          ?? section.section?.position
          ?? section.attributes?.page
          ?? section.attributes?.order
          ?? section.attributes?.position;

        const sectionIdRaw = section.id
          ?? section.section_id
          ?? section.sectionId
          ?? section.module_section_id
          ?? section.moduleSectionId
          ?? section.section?.id
          ?? section.section?.section_id
          ?? section.attributes?.id
          ?? section.attributes?.section_id;

        const titleRaw = section.title
          ?? section.name
          ?? section.section_title
          ?? section.section_name
          ?? section.label
          ?? section.section?.title
          ?? section.section?.name
          ?? section.section?.section_title
          ?? section.attributes?.title
          ?? section.attributes?.name;

        const keyNum = Number(keyRaw);
        return {
          key: Number.isFinite(keyNum) ? keyNum : null,
          sectionId: sectionIdRaw != null ? String(sectionIdRaw) : null,
          title: normalizeText(titleRaw),
        };
      }

      function collectSectionMetas(payload) {
        if (!payload || typeof payload !== 'object') return [];

        const metas = [];
        const queue = [payload];
        const seen = new Set();

        while (queue.length > 0) {
          const cur = queue.shift();
          if (!cur || typeof cur !== 'object' || seen.has(cur)) continue;
          seen.add(cur);

          if (Array.isArray(cur)) {
            for (const item of cur) queue.push(item);
            continue;
          }

          const meta = getSectionMeta(cur);
          if (meta.sectionId && (Number.isFinite(meta.key) || meta.title)) {
            metas.push(meta);
          }

          for (const value of Object.values(cur)) queue.push(value);
        }

        const deduped = [];
        const seenMeta = new Set();
        for (const meta of metas) {
          const marker = `${meta.sectionId}|${meta.key ?? ''}|${meta.title || ''}`;
          if (seenMeta.has(marker)) continue;
          seenMeta.add(marker);
          deduped.push(meta);
        }

        return deduped;
      }

      function assignModuleInfoRowIds(sectionMetas, navMap) {
        if (!/^\/app\/module\/\d+\/?$/.test(location.pathname)) return;
        if (rows.length === 0) return;

        const rowPages = rows
          .map(r => Number(r.getAttribute('page')))
          .filter(Number.isFinite);
        const rowPageSet = new Set(rowPages.map(p => String(p)));
        const rowTitleSet = new Set(
          rows
            .map(row => normalizeText(
              row.querySelector('.main-text')?.getAttribute('title')
              || row.querySelector('.main-text')?.textContent
            ))
            .filter(Boolean)
        );

        for (const row of rows) {
          delete row.dataset.aptSectionId;
        }

        const byPage = new Map();
        if (navMap) {
          for (const page of rowPages) {
            const sid = navMap.get(String(page));
            if (sid == null) continue;
            const sidStr = String(sid);
            // Ignore obvious page-number fallback IDs on module-info pages.
            if (sidStr === String(page)) continue;
            byPage.set(String(page), sidStr);
          }
        }

        const metas = (Array.isArray(sectionMetas) ? sectionMetas : [])
          .filter(m => m && m.sectionId);

        // Direct key-to-page mapping.
        for (const meta of metas) {
          if (!Number.isFinite(meta.key)) continue;
          const page = String(meta.key);
          if (!rowPageSet.has(page)) continue;
          if (!byPage.has(page)) byPage.set(page, meta.sectionId);
        }

        // Title-based fallback.
        const titleToIds = new Map();
        const titleMatchedMetas = metas.filter(meta => meta.title && rowTitleSet.has(meta.title));
        for (const meta of titleMatchedMetas) {
          if (!meta.title) continue;
          if (!titleToIds.has(meta.title)) titleToIds.set(meta.title, []);
          titleToIds.get(meta.title).push(meta.sectionId);
        }

        for (const row of rows) {
          const page = row.getAttribute('page');
          if (!page || byPage.has(page)) continue;
          const title = normalizeText(
            row.querySelector('.main-text')?.getAttribute('title')
            || row.querySelector('.main-text')?.textContent
          );
          if (!title) continue;
          const candidates = titleToIds.get(title);
          if (!candidates || candidates.length === 0) continue;
          const usedIds = new Set(byPage.values());
          const selected = candidates.find(id => !usedIds.has(id)) || candidates[0];
          if (selected) byPage.set(page, selected);
        }

        for (const row of rows) {
          const page = row.getAttribute('page');
          if (!page) continue;
          const sid = byPage.get(page);
          if (sid) row.dataset.aptSectionId = sid;
        }
      }

      function linkRows(idMap) {
        const isModuleInfoPage = /^\/app\/module\/\d+\/?$/.test(location.pathname);

        function wireAnchorBehavior(a, { preserveNormalClick }) {
          // Capture phase so parent row handlers cannot swallow modified clicks.
          a.addEventListener('click', (e) => {
            const isModified = e.ctrlKey || e.metaKey;
            if (isModified) {
              e.stopPropagation();
              return;
            }
            if (preserveNormalClick) {
              e.preventDefault();
            }
          }, true);

          // Middle-click should open a new tab; stop parent handlers from interfering.
          a.addEventListener('auxclick', (e) => {
            if (e.button !== 1) return;
            e.stopPropagation();
          }, true);
          a.addEventListener('mousedown', (e) => {
            if (e.button !== 1) return;
            e.stopPropagation();
          }, true);
        }

        for (const row of rows) {
          const pageNum = row.getAttribute('page');
          const mappedId = idMap?.get(pageNum);
          const validMappedId = mappedId != null && (!isModuleInfoPage || String(mappedId) !== String(pageNum))
            ? mappedId
            : null;
          const sectionId = row.dataset.aptSectionId
            ?? validMappedId
            ?? (!isModuleInfoPage && !idMap && !Number.isFinite(currentSectionId) ? pageNum : null);
          if (!sectionId) continue;
          const href = `/app/module/${moduleId}/section/${sectionId}`;

          // Migrate old row-overlay style to wrapper anchors.
          const rowOverlay = [...row.children].find(child => child?.dataset?.aptLinkRow === '1');
          if (rowOverlay) rowOverlay.remove();

          const existingWrapper = row.parentElement?.matches?.('a[data-apt-link]') ? row.parentElement : null;
          if (existingWrapper) {
            existingWrapper.href = href;
            existingWrapper.style.cssText = 'display: block; text-decoration: none; color: inherit;';
            if (!existingWrapper.dataset.aptLinkWired) {
              wireAnchorBehavior(existingWrapper, { preserveNormalClick: true });
              existingWrapper.dataset.aptLinkWired = '1';
            }
            continue;
          }

          const a = document.createElement('a');
          a.href = href;
          a.dataset.aptLink = '1';
          a.dataset.aptLinkWired = '1';
          a.style.cssText = 'display: block; text-decoration: none; color: inherit;';
          wireAnchorBehavior(a, { preserveNormalClick: true });
          row.parentNode.insertBefore(a, row);
          a.appendChild(row);
        }
      }

      function parseSectionCount(text) {
        if (!text) return null;
        const progressMatch = text.match(/(\d+)\s*\/\s*(\d+)\s*sections?/i);
        if (progressMatch) return Number(progressMatch[2]);
        const totalMatch = text.match(/(\d+)\s*sections?/i);
        if (totalMatch) return Number(totalMatch[1]);
        return null;
      }

      function linkModuleInfoSectionTitles(idMap) {
        if (!/^\/app\/module\/\d+\/?$/.test(location.pathname)) return;
        if (!idMap || idMap.size === 0) return;

        const cards = [...document.querySelectorAll('.module-sections .collapse')];
        if (cards.length === 0) return;

        const orderedPages = [...idMap.keys()]
          .map(v => Number(v))
          .filter(Number.isFinite)
          .sort((a, b) => a - b);
        if (orderedPages.length === 0) return;

        const orderedIds = orderedPages
          .map(page => idMap.get(String(page)))
          .filter(Boolean);
        if (orderedIds.length === 0) return;

        let cursor = 0;
        for (const card of cards) {
          const titleEl = card.querySelector('.syllabus-title');
          const headerEl = card.querySelector(':scope > .collapse-title');
          if (!titleEl || !headerEl) {
            const meta = card.querySelector('.syllabus-sections')?.textContent || '';
            const count = parseSectionCount(meta);
            if (Number.isFinite(count) && count > 0) cursor += count;
            continue;
          }

          const sectionId = orderedIds[cursor];
          if (!sectionId) break;

          const href = `/app/module/${moduleId}/section/${sectionId}`;
          let a = headerEl.querySelector('a[data-apt-link-group]');
          if (!a) {
            // Overlay a real anchor on the section header.
            // Normal click still expands/collapses because we prevent navigation unless modifier/middle click is used.
            a = document.createElement('a');
            a.dataset.aptLinkGroup = '1';
            // pointer-events: none lets normal clicks pass through to the native checkbox/Vue handler.
            // We temporarily enable pointer-events on modifier/middle-click so the <a> handles new-tab nav.
            a.style.cssText = 'position: absolute; inset: 0; z-index: 1; text-decoration: none; color: inherit; pointer-events: none;';
            // Listen on the parent so we can intercept modified clicks before they reach the checkbox
            headerEl.addEventListener('click', (e) => {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                e.stopPropagation();
                window.open(a.href, '_blank');
              }
            }, true);
            headerEl.addEventListener('auxclick', (e) => {
              if (e.button === 1) {
                e.preventDefault();
                e.stopPropagation();
                window.open(a.href, '_blank');
              }
            }, true);
            if (getComputedStyle(headerEl).position === 'static') {
              headerEl.style.position = 'relative';
            }
            headerEl.appendChild(a);
          }
          a.href = href;
          a.title = titleEl.textContent?.trim() || 'Open section in new tab';

          const meta = card.querySelector('.syllabus-sections')?.textContent || '';
          const count = parseSectionCount(meta);
          cursor += Number.isFinite(count) && count > 0 ? count : 1;
        }
      }

      function fetchSectionsPayload() {
        const endpoints = [
          `/api/v3/modules/${moduleId}/sections`,
          `/api/v4/modules/${moduleId}/sections`,
          `/api/v3/modules/${moduleId}`,
          `/api/v4/modules/${moduleId}`,
        ];
        let idx = 0;

        function next() {
          if (idx >= endpoints.length) return Promise.resolve(null);
          const endpoint = endpoints[idx++];
          return fetch(endpoint)
            .then(r => r.ok ? r.json() : null)
            .then(json => {
              if (!json) return next();
              const metas = collectSectionMetas(json);
              if (metas.length === 0) return next();
              return { json, metas };
            })
            .catch(() => next());
        }

        return next();
      }

      function reconcileMapToVisibleRows(idMap) {
        if (!idMap || idMap.size === 0 || rows.length === 0) return idMap;

        const rowPages = [...new Set(
          rows
            .map(r => Number(r.getAttribute('page')))
            .filter(Number.isFinite)
        )].sort((a, b) => a - b);
        if (rowPages.length === 0) return idMap;

        // Already directly mappable.
        if (rowPages.some(p => idMap.has(String(p)))) return idMap;

        // Some responses provide local ordinal keys (1..N) for only the currently expanded group.
        const numericKeys = [...idMap.keys()]
          .map(v => Number(v))
          .filter(Number.isFinite)
          .sort((a, b) => a - b);
        if (numericKeys.length === 0) return idMap;

        const looksLocalOrdinal = numericKeys[0] === 1
          && numericKeys[numericKeys.length - 1] === numericKeys.length;
        if (!looksLocalOrdinal) return idMap;

        const localIds = [];
        for (let i = 1; i <= numericKeys.length; i += 1) {
          const sid = idMap.get(String(i));
          if (sid == null) return idMap;
          localIds.push(String(sid));
        }

        if (localIds.length !== rowPages.length) return idMap;

        const remapped = new Map(idMap);
        for (let i = 0; i < rowPages.length; i += 1) {
          remapped.set(String(rowPages[i]), localIds[i]);
        }
        return remapped;
      }

      // Fetch sections API to map page numbers → section IDs
      fetchSectionsPayload()
        .then(payload => {
          const offsetMap = buildOffsetIdMap();
          if (!payload) {
            assignModuleInfoRowIds([], offsetMap);
            linkModuleInfoSectionTitles(offsetMap);
            linkRows(offsetMap);
            return;
          }
          const metas = payload.metas || [];
          const idMap = new Map();
          for (const s of metas) {
            const { key, sectionId } = s;
            if (key != null && sectionId != null) idMap.set(String(key), String(sectionId));
          }
          if (idMap.size === 0) {
            metas.forEach((s, i) => {
              const { sectionId } = s;
              if (sectionId != null) idMap.set(String(i + 1), String(sectionId));
            });
          }
          let finalMap = idMap.size > 0 ? idMap : null;

          const activePage = getActivePageNumber();
          if (finalMap && Number.isFinite(currentSectionId) && Number.isFinite(activePage)) {
            const mappedActive = Number(finalMap.get(String(activePage)));
            // If API-derived mapping disagrees with the currently opened section, trust the offset mapping.
            if (!Number.isFinite(mappedActive) || mappedActive !== currentSectionId) {
              finalMap = offsetMap || null;
            }
          }

          if (finalMap && offsetMap) {
            for (const row of rows) {
              const pageNum = row.getAttribute('page');
              if (!pageNum || finalMap.has(pageNum)) continue;
              const offsetId = offsetMap.get(pageNum);
              if (offsetId) finalMap.set(pageNum, offsetId);
            }
          }

          let navMap = finalMap || offsetMap || (idMap.size > 0 ? idMap : null);
          navMap = reconcileMapToVisibleRows(navMap);
          assignModuleInfoRowIds(metas, navMap);

          // Promote row-resolved IDs into nav map so link builders always prefer real IDs.
          const rowResolvedMap = new Map();
          for (const row of rows) {
            const page = row.getAttribute('page');
            const sid = row.dataset.aptSectionId;
            if (page && sid) rowResolvedMap.set(String(page), String(sid));
          }
          if (rowResolvedMap.size > 0) {
            if (!navMap) navMap = new Map();
            for (const [page, sid] of rowResolvedMap) {
              navMap.set(page, sid);
            }
          }

          linkModuleInfoSectionTitles(navMap);
          linkRows(navMap);
        })
        .catch(() => {
          const fallbackMap = buildOffsetIdMap();
          assignModuleInfoRowIds([], fallbackMap);
          linkModuleInfoSectionTitles(fallbackMap);
          linkRows(fallbackMap);
        });
    },
  });
