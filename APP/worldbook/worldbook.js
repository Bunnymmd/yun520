function returnToDesktop() { console.log('Return to Desktop'); }

    // ================= 数据库配置 =================
    const db = window.MiniDB.databases.worldbook;

    let currentGroupId = null;
    let currentEntryId = null;
    let isDeleteMode = false;

    // ================= 视图与路由逻辑 =================
    function switchView(viewId) {
        document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
    }

    function backToGroups() {
        currentGroupId = null;
        switchView('view-groups');
        renderGroups();
    }

    function backToEntries() {
        currentEntryId = null;
        switchView('view-entries');
        renderEntries();
    }

    // ================= 分组管理逻辑 =================
    async function renderGroups() {
        const groups = await db.groups.orderBy('created').reverse().toArray();
        const container = document.getElementById('group-list');
        container.innerHTML = '';
        
        if (groups.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding-top: 50px; font-size: 11px; color: #aaa; font-weight: 600; text-transform: uppercase;">No Lore Groups. Click + to add.</div>`;
            return;
        }

        for (let group of groups) {
            const entryCount = await db.entries.where('groupId').equals(group.id).count();
            const el = document.createElement('div');
            el.className = 'group-card';
            el.innerHTML = `
                <div class="card-info">
                    <div class="card-title">${group.name}</div>
                    <div class="card-meta">
                        <span class="tag tag-dark">LORE</span>
                        <span class="tag tag-outline">${entryCount} ENTRIES</span>
                    </div>
                </div>
                <svg style="width:20px;height:20px;fill:none;stroke:#ccc;stroke-width:2;" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                <div class="del-badge"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
            `;
            el.onclick = () => {
                if (isDeleteMode) {
                    deleteGroup(group.id);
                } else {
                    openGroup(group.id, group.name);
                }
            };
            container.appendChild(el);
        }
    }

    function openGroup(id, name) {
        currentGroupId = id;
        document.getElementById('current-group-title').textContent = name;
        switchView('view-entries');
        renderEntries();
    }

    function openGroupModal() {
        document.getElementById('inp-group-name').value = '';
        document.getElementById('group-modal').classList.add('show');
    }
    function closeGroupModal() {
        document.getElementById('group-modal').classList.remove('show');
    }

    async function saveGroup() {
        const name = document.getElementById('inp-group-name').value.trim();
        if (!name) return alert("Group name required.");
        await db.groups.add({ name, created: Date.now() });
        closeGroupModal();
        renderGroups();
    }

    async function deleteGroup(id) {
        await db.groups.delete(id);
        await db.entries.where('groupId').equals(id).delete();
        renderGroups();
    }

    // 分组导入逻辑 (JSON)
    async function importGroup(event) {
        const file = event.target.files[0];
        if (!file) return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (!data.name || !Array.isArray(data.entries)) throw new Error("Invalid Format");
            
            const groupId = await db.groups.add({ name: data.name + " (Imported)", created: Date.now() });
            const entriesToDb = data.entries.map(e => ({ ...e, groupId, id: undefined }));
            await db.entries.bulkAdd(entriesToDb);
            
            closeGroupModal();
            renderGroups();
            alert("导入成功 (Import Successful)");
        } catch(e) {
            alert("导入失败 (Import Failed): " + e.message);
        }
        event.target.value = '';
    }

    // ================= 长按删除模式逻辑 =================
    let pressTimer;
    const fabGroup = document.getElementById('fab-group');
    
    fabGroup.addEventListener('touchstart', startPress, {passive: true});
    fabGroup.addEventListener('mousedown', startPress);
    fabGroup.addEventListener('touchend', cancelPress);
    fabGroup.addEventListener('mouseup', cancelPress);
    fabGroup.addEventListener('mouseleave', cancelPress);

    function startPress() {
        pressTimer = setTimeout(() => {
            toggleDeleteMode();
        }, 600);
    }
    
    function cancelPress(e) {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    }

    fabGroup.addEventListener('click', (e) => {
        if (pressTimer) clearTimeout(pressTimer); // 防误触
        if (isDeleteMode) {
            toggleDeleteMode(); // 若在删除模式，点击恢复正常
        } else {
            openGroupModal();
        }
    });

    function toggleDeleteMode() {
        isDeleteMode = !isDeleteMode;
        const list = document.getElementById('group-list');
        if (isDeleteMode) {
            list.classList.add('delete-mode');
            fabGroup.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`;
            fabGroup.style.background = "#dc2626";
        } else {
            list.classList.remove('delete-mode');
            fabGroup.innerHTML = `<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
            fabGroup.style.background = "var(--accent-dark)";
        }
    }

    // ================= 词条管理逻辑 =================
    async function renderEntries() {
        if (!currentGroupId) return;
        const entries = await db.entries.where('groupId').equals(currentGroupId).toArray();
        const container = document.getElementById('entry-list');
        container.innerHTML = '';

        if (entries.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding-top: 50px; font-size: 11px; color: #aaa; font-weight: 600; text-transform: uppercase;">No entries in this group.</div>`;
            return;
        }

        for (let entry of entries) {
            const trigText = entry.triggerType === 'ALWAYS' ? 'ALWAYS' : `KEY: ${entry.keywords}`;
            const el = document.createElement('div');
            el.className = 'entry-card';
            el.innerHTML = `
                <div class="card-info">
                    <div class="card-title">${entry.title}</div>
                    <div class="card-meta">
                        <span class="tag tag-dark">${entry.category}</span>
                        <span class="tag tag-light">${entry.position}</span>
                        <span class="tag tag-outline">${trigText}</span>
                    </div>
                </div>
            `;
            el.onclick = () => openEntryEditor(entry.id);
            container.appendChild(el);
        }
    }

    function setTab(inputId, val, el) {
        el.parentElement.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        el.classList.add('active');
        document.getElementById(inputId).value = val;
    }

    function setTrigger(val, el) {
        setTab('inp-trigger', val, el);
        const wrap = document.getElementById('keyword-wrap');
        wrap.style.display = val === 'KEYWORD' ? 'flex' : 'none';
    }

    async function openEntryEditor(id = null) {
        switchView('view-editor');
        const extraActions = document.getElementById('editor-actions-extra');
        
        if (id) {
            currentEntryId = id;
            document.getElementById('editor-title').textContent = 'EDIT ENTRY';
            extraActions.style.display = 'flex';
            
            const entry = await db.entries.get(id);
            if(entry) {
                document.getElementById('inp-title').value = entry.title;
                document.getElementById('inp-keywords').value = entry.keywords || '';
                document.getElementById('inp-content').value = entry.content;
                
                const catTabs = document.querySelectorAll('#inp-category ~ .tab-btn, .tab-group > .tab-btn'); // Simplification for UI sync
                setTab('inp-category', entry.category, entry.category === 'GLOBAL' ? document.querySelectorAll('.tab-group')[0].children[0] : document.querySelectorAll('.tab-group')[0].children[1]);
                
                const trigTabs = document.querySelectorAll('.tab-group')[1].children;
                setTrigger(entry.triggerType, entry.triggerType === 'ALWAYS' ? trigTabs[0] : trigTabs[1]);
                
                const posTabs = document.querySelectorAll('.tab-group')[2].children;
                if(entry.position === 'BEFORE') setTab('inp-position', 'BEFORE', posTabs[0]);
                else if(entry.position === 'MIDDLE') setTab('inp-position', 'MIDDLE', posTabs[1]);
                else setTab('inp-position', 'AFTER', posTabs[2]);
            }
        } else {
            currentEntryId = null;
            document.getElementById('editor-title').textContent = 'NEW ENTRY';
            extraActions.style.display = 'none';
            
            document.getElementById('inp-title').value = '';
            document.getElementById('inp-keywords').value = '';
            document.getElementById('inp-content').value = '';
            
            setTab('inp-category', 'GLOBAL', document.querySelectorAll('.tab-group')[0].children[0]);
            setTrigger('ALWAYS', document.querySelectorAll('.tab-group')[1].children[0]);
            setTab('inp-position', 'BEFORE', document.querySelectorAll('.tab-group')[2].children[0]);
        }
    }

    async function saveEntry() {
        const title = document.getElementById('inp-title').value.trim();
        const category = document.getElementById('inp-category').value;
        const triggerType = document.getElementById('inp-trigger').value;
        const keywords = document.getElementById('inp-keywords').value.trim();
        const position = document.getElementById('inp-position').value;
        const content = document.getElementById('inp-content').value.trim();

        if (!title || !content) return alert("Title and Content are required.");
        if (triggerType === 'KEYWORD' && !keywords) return alert("Keywords are required for Keyword Trigger.");

        const entryData = { groupId: currentGroupId, title, category, triggerType, keywords, position, content };

        if (currentEntryId) {
            await db.entries.update(currentEntryId, entryData);
        } else {
            await db.entries.add(entryData);
        }
        backToEntries();
    }

    async function deleteEntry() {
        if (!currentEntryId) return;
        await db.entries.delete(currentEntryId);
        backToEntries();
    }

    async function exportEntry() {
        if (!currentEntryId) return;
        const entry = await db.entries.get(currentEntryId);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entry, null, 2));
        const dl = document.createElement('a');
        dl.setAttribute("href", dataStr);
        dl.setAttribute("download", `entry_${entry.title}.json`);
        dl.click();
    }

    // Modal background click to close
    document.getElementById('group-modal').addEventListener('click', closeGroupModal);

    // Init
    document.addEventListener('DOMContentLoaded', () => {
        renderGroups();
    });

(function () {
  const route = "worldbook";
  const placeholderUrl = "../assets/初始占位图.png";
  const placeholderSelectors = [];
  const bindings = [];
  const backSelectors = [];
  const overrideFunctions = ["returnToDesktop"];
  const shell = window.parent && window.parent.__miniShell;

  function openRoute(target) {
    if (shell && typeof shell.open === 'function') shell.open(target, route);
  }

  function goBack() {
    if (shell && typeof shell.back === 'function') shell.back(route);
  }

  function patchHistoryBack() {
    try {
      if (window.history) window.history.back = goBack;
      if (window.History && window.History.prototype) window.History.prototype.back = goBack;
    } catch (error) {}
  }

  function replaceWithPlaceholder(el) {
    if (!el) return;
    const inlineBg = (el.style.backgroundImage || '').trim();
    const computedBg = (window.getComputedStyle(el).backgroundImage || '').trim();
    const currentBg = inlineBg && inlineBg !== 'none' ? inlineBg : computedBg;
    const needsPlaceholder = !currentBg || currentBg === 'none' || currentBg.includes('data:image/svg+xml') || currentBg === 'url("")' || currentBg === 'url()';
    if (!needsPlaceholder) return;
    el.style.backgroundImage = 'url(' + placeholderUrl + ')';
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.backgroundRepeat = 'no-repeat';
  }

  function applyPlaceholders(root = document) {
    placeholderSelectors.forEach((selector) => {
      root.querySelectorAll(selector).forEach(replaceWithPlaceholder);
    });
  }

  function watchPlaceholders() {
    if (!placeholderSelectors.length) return;
    const observer = new MutationObserver(() => applyPlaceholders());
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  function bindAction(selector, binding) {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.dataset.miniRouteBound === '1') return;
      el.dataset.miniRouteBound = '1';
      el.style.cursor = 'pointer';
      el.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (binding.action === 'back') {
          goBack();
        } else if (binding.action === 'open' && binding.target) {
          openRoute(binding.target);
        }
      }, true);
    });
  }

  function init() {
    patchHistoryBack();
    overrideFunctions.forEach((name) => {
      try {
        window[name] = goBack;
      } catch (error) {}
    });

    document.addEventListener('click', (event) => {
      const backTrigger = event.target.closest('[onclick*="history.back"]');
      if (!backTrigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      goBack();
    }, true);

    applyPlaceholders();
    watchPlaceholders();

    backSelectors.forEach((selector) => bindAction(selector, { action: 'back' }));
    bindings.forEach((binding) => bindAction(binding.selector, binding));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
