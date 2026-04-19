// ================= 数据库配置 =================
    const db = window.MiniDB.databases.masks;

    let currentEditId = null;

    function buildImportedMaskFromCharacterData(dataNode, avatarBase64 = '') {
        const source = dataNode && typeof dataNode === 'object' ? dataNode : {};
        return {
            ...source,
            type: 'USER',
            nickname: source.nickname || source.name || 'Unknown',
            name: source.name || source.nickname || '',
            gender: source.gender || 'X',
            account: source.account || ('impt_' + Math.floor(Math.random() * 10000)),
            signature: source.signature || source.creator_notes || source.personality || '',
            lore: source.lore || source.description || '',
            avatar: source.avatar || avatarBase64 || ''
        };
    }

    function collectCurrentMaskFormData() {
        return {
            type: 'USER',
            nickname: document.getElementById('inp-nickname').value.trim(),
            name: document.getElementById('inp-name').value.trim(),
            gender: document.getElementById('inp-gender').value,
            account: document.getElementById('inp-account').value.trim(),
            signature: document.getElementById('inp-sign').value.trim(),
            lore: document.getElementById('inp-lore').value.trim(),
            avatar: document.getElementById('val-avatar').value
        };
    }

    // ================= 弹窗菜单逻辑 =================
    function toggleMenu(e) {
        if(e) e.stopPropagation();
        document.getElementById('dropdown-menu').classList.toggle('active');
    }

    function closeMenu() {
        document.getElementById('dropdown-menu').classList.remove('active');
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-right')) {
            closeMenu();
        }
    });

    // ================= 高级导入功能 (支持 JSON & PNG 角色卡) =================
    async function importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            let maskData = null;
            let avatarBase64 = null;

            if (file.name.toLowerCase().endsWith('.json')) {
                // 原有的 JSON 导入解析
                const text = await file.text();
                maskData = JSON.parse(text);
            } 
            else if (file.name.toLowerCase().endsWith('.png')) {
                avatarBase64 = await new Promise((res) => {
                    const r = new FileReader();
                    r.onload = (e) => res(e.target.result);
                    r.readAsDataURL(file);
                });
                if (!window.MiniPngCard || typeof window.MiniPngCard.readFile !== 'function') {
                    throw new Error("PNG import helper is not available.");
                }
                const embeddedPayload = await window.MiniPngCard.readFile(file);
                if (embeddedPayload.mini && embeddedPayload.mini.app === 'mini' && embeddedPayload.mini.data) {
                    maskData = buildImportedMaskFromCharacterData(embeddedPayload.mini.data, avatarBase64);
                } else if (embeddedPayload.chara) {
                    maskData = buildImportedMaskFromCharacterData(embeddedPayload.chara.data || embeddedPayload.chara, avatarBase64);
                } else {
                    throw new Error("这张PNG图片里没有包含任何角色卡数据(tEXt chunk)");
                }
            }

            // 保存入库
            if (maskData && maskData.nickname) {
                delete maskData.id; 
                maskData.type = 'USER';
                if(!maskData.avatar && avatarBase64) maskData.avatar = avatarBase64;
                
                await db.masks.add(maskData);
                loadList();
                alert('导入成功 (Import successful)');
            } else {
                throw new Error("无法识别面具数据格式");
            }
        } catch(err) {
            console.error(err);
            alert('导入失败 (Import failed): ' + err.message);
        }
        
        event.target.value = ''; // 强制清空 value，允许重复导入同一个文件
    }


    // ================= UI 双向绑定逻辑 =================
    function bindInputToBadge(inputId, badgeId, fallback, prefix = '') {
        const inputEl = document.getElementById(inputId);
        const badgeEl = document.getElementById(badgeId);
        inputEl.addEventListener('input', () => {
            const val = inputEl.value.trim();
            badgeEl.textContent = val ? (prefix + val) : fallback;
        });
    }

    bindInputToBadge('inp-nickname', 'badge-nickname', 'Nickname');
    bindInputToBadge('inp-name', 'badge-name', 'Name');
    bindInputToBadge('inp-account', 'badge-account', 'Account'); 
    bindInputToBadge('inp-sign', 'badge-sign', 'The signature will appear here...');
    bindInputToBadge('inp-lore', 'badge-lore', 'The detailed lore or setting for this mask.');

    function setGender(val, el) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        el.classList.add('active');
        document.getElementById('inp-gender').value = val;
        
        let displayGender = 'Secret';
        if(val === 'M') displayGender = 'Male';
        if(val === 'F') displayGender = 'Female';
        document.getElementById('badge-gender').textContent = displayGender;
    }

    // 头像上传转 Base64
    document.getElementById('inp-avatar').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const b64 = event.target.result;
                document.getElementById('val-avatar').value = b64;
                document.getElementById('badge-avatar').style.backgroundImage = `url(${b64})`;
            };
            reader.readAsDataURL(file);
        }
    });

    // ================= 视图切换与数据操作 =================
    async function loadList() {
        const masks = await db.masks.where('type').equals('USER').toArray();
        const container = document.getElementById('mask-list-container');
        container.innerHTML = '';

        if (masks.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding-top: 40px; font-size: 12px; color: #aaa; font-weight: 600;">No USER masks. Click + to add.</div>`;
            return;
        }

        masks.forEach(mask => {
            const avatarStyle = mask.avatar ? `style="background-image: url('${mask.avatar}')"` : '';
            container.innerHTML += `
                <div class="mask-item" onclick="openEditor(${mask.id})">
                    <div class="mask-avatar" ${avatarStyle}></div>
                    <div class="mask-info">
                        <div class="mask-top">
                            <span class="mask-name">${mask.nickname || 'Unknown'}</span>
                            <span class="mask-tag">USER</span>
                        </div>
                        <div class="mask-account">@${mask.account || 'null'}</div>
                        <div class="mask-desc">${mask.signature || mask.lore || 'No description...'}</div>
                    </div>
                </div>
            `;
        });
    }

    function resetForm() {
        currentEditId = null;
        document.getElementById('editor-title').textContent = 'NEW MASK';
        document.getElementById('edit-actions').style.display = 'none';
        
        document.getElementById('inp-nickname').value = '';
        document.getElementById('inp-name').value = '';
        document.getElementById('inp-account').value = '';
        document.getElementById('inp-sign').value = '';
        document.getElementById('inp-lore').value = '';
        document.getElementById('val-avatar').value = '';
        setGender('M', document.querySelectorAll('.tab-btn')[0]);

        document.getElementById('badge-nickname').textContent = 'Nickname';
        document.getElementById('badge-name').textContent = 'Name';
        document.getElementById('badge-account').textContent = 'Account';
        document.getElementById('badge-sign').textContent = 'The signature will appear here...';
        document.getElementById('badge-lore').textContent = 'The detailed lore or setting for this mask.';
        document.getElementById('badge-avatar').style.backgroundImage = 'none';
    }

    async function openEditor(id = null) {
        document.getElementById('view-list').classList.remove('active');
        document.getElementById('view-editor').classList.add('active');
        
        resetForm();

        if (id) {
            currentEditId = id;
            document.getElementById('editor-title').textContent = 'EDIT MASK';
            document.getElementById('edit-actions').style.display = 'flex';
            
            const mask = await db.masks.get(id);
            if (mask) {
                document.getElementById('inp-nickname').value = mask.nickname || '';
                document.getElementById('inp-name').value = mask.name || '';
                document.getElementById('inp-account').value = mask.account || '';
                document.getElementById('inp-sign').value = mask.signature || '';
                document.getElementById('inp-lore').value = mask.lore || '';
                document.getElementById('val-avatar').value = mask.avatar || '';
                
                const tabs = document.querySelectorAll('.tab-btn');
                if(mask.gender === 'M') setGender('M', tabs[0]);
                else if(mask.gender === 'F') setGender('F', tabs[1]);
                else setGender('X', tabs[2]);

                document.getElementById('inp-nickname').dispatchEvent(new Event('input'));
                document.getElementById('inp-name').dispatchEvent(new Event('input'));
                document.getElementById('inp-account').dispatchEvent(new Event('input'));
                document.getElementById('inp-sign').dispatchEvent(new Event('input'));
                document.getElementById('inp-lore').dispatchEvent(new Event('input'));
                
                if(mask.avatar) {
                    document.getElementById('badge-avatar').style.backgroundImage = `url('${mask.avatar}')`;
                }
            }
        }
    }

    function closeEditor() {
        document.getElementById('view-editor').classList.remove('active');
        document.getElementById('view-list').classList.add('active');
        loadList();
    }

    async function saveMask() {
        const maskData = collectCurrentMaskFormData();

        if(!maskData.nickname) return alert("Nickname is required.");

        if (currentEditId) {
            await db.masks.update(currentEditId, maskData);
        } else {
            await db.masks.add(maskData);
        }
        closeEditor();
    }

    async function deleteMask() {
        if (!currentEditId) return;
        await db.masks.delete(currentEditId);
        closeEditor();
    }

    // ================= 导出功能 =================
    async function exportJSON() {
        if (!currentEditId) return;
        const mask = await db.masks.get(currentEditId);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mask, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `mask_${mask.account || mask.nickname}.json`);
        dlAnchorElem.click();
    }

    async function exportPNG() {
        const badge = document.querySelector('#capture-area .flat-badge');
        if (!badge) return;
        const exportData = {
            ...(currentEditId ? ((await db.masks.get(currentEditId)) || {}) : {}),
            ...collectCurrentMaskFormData(),
            id: currentEditId
        };
        const canvas = await html2canvas(badge, {
            scale: 3, 
            backgroundColor: null,
            useCORS: true
        });
        let href = canvas.toDataURL('image/png');
        if (window.MiniPngCard && typeof window.MiniPngCard.embedDataUrl === 'function') {
            href = window.MiniPngCard.embedDataUrl(href, [
                { keyword: 'mini', value: { app: 'mini', format: 'mask', data: exportData } },
                { keyword: 'chara', value: window.MiniPngCard.buildTavernCard(exportData) }
            ]);
        }
        const link = document.createElement('a');
        const account = document.getElementById('inp-account').value || 'mask';
        link.download = `mask_${account}_badge.png`;
        link.href = href;
        link.click();
    }

    // ================= 初始化 =================
    document.addEventListener('DOMContentLoaded', () => {
        loadList();
    });

(function () {
  const route = "wechat_masks";
  const placeholderUrl = "../assets/初始占位图.png";
  const placeholderSelectors = [".mask-avatar","#badge-avatar"];
  const bindings = [];
  const backSelectors = ["#view-list .nav-left","#view-list .nav-title"];
  const overrideReturnToDesktop = false;
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

    if (overrideReturnToDesktop) {
      try {
        window.returnToDesktop = goBack;
      } catch (error) {}
    }

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
