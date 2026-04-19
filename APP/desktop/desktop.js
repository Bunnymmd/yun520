function initRealTimeCalendar() {
        const now = new Date();
        const year = now.getFullYear(), month = now.getMonth(), date = now.getDate();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        document.getElementById('dynamic-date').textContent = date < 10 ? '0' + date : date;
        document.getElementById('dynamic-month-year').innerHTML = `<span class="w-6-month-dec">*°</span>${monthNames[month]} ${year}<span class="w-6-month-dec">*°*</span>`;
        
        const grid = document.getElementById('dynamic-calendar-grid');
        grid.innerHTML = '<div class="w-6-day">MON</div><div class="w-6-day">TUE</div><div class="w-6-day">WED</div><div class="w-6-day">THU</div><div class="w-6-day">FRI</div><div class="w-6-day">SAT</div><div class="w-6-day">SUN</div>';
        
        const firstDay = new Date(year, month, 1).getDay();
        const startingDay = firstDay === 0 ? 6 : firstDay - 1; 
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let i = 0; i < startingDay; i++) grid.innerHTML += '<div></div>';
        for (let i = 1; i <= daysInMonth; i++) {
            let formattedDay = i < 10 ? '0' + i : i;
            grid.innerHTML += i === date ? `<div class="w-6-active">${formattedDay}</div>` : `<div class="w-6-date">${formattedDay}</div>`;
        }
    }
    initRealTimeCalendar();

// 禁止移动端页面整体上下滑动回弹，彻底锁定滚动
    document.addEventListener('touchmove', function(e) {
        if (!e.target.closest('.page')) {
            e.preventDefault();
        }
    }, { passive: false });
    document.addEventListener("DOMContentLoaded", () => {
        if (typeof Dexie === 'undefined') return console.error('Dexie.js 加载失败');
        // 数据库配置
        const db = window.MiniDB.databases.theme;
        /* ================= 1. 普通图片编辑逻辑 - 彻底移除应用图标相关 ================= */
        const imgModal = document.getElementById('ins-image-modal');
        const imgUrlInput = document.getElementById('ins-image-url');
        const imgFileInput = document.getElementById('ins-image-file');
        let currentImgTarget = null, selectedFileBase64 = null;
        // 仅保留非应用图标的可换图元素，彻底移除.app-icon
        const targetImgClasses = ['.w-88-cover', '.w-90-cover', '.w-90-r-top', '.w-14-cover', '.w-31-body', '.w-33-cover', '.w-90-box'];
        
        targetImgClasses.forEach(cls => {
            const elements = document.querySelectorAll(cls);
            elements.forEach((el, index) => {
                const dbId = cls.replace('.', '') + (index > 0 ? `-${index}` : '');
                el.dataset.dbid = dbId;
                
                db.placeholders.get(dbId).then(record => {
                    if (record && record.dataUrl) {
                        el.style.backgroundImage = `url(${record.dataUrl})`;
                        el.style.backgroundSize = 'cover';
                        el.style.backgroundPosition = 'center';
                    }
                });
                el.addEventListener('click', () => {
                    currentImgTarget = dbId;
                    imgModal.style.display = 'flex';
                    imgUrlInput.value = ''; imgFileInput.value = ''; selectedFileBase64 = null;
                });
            });
        });
        document.getElementById('ins-image-cancel').addEventListener('click', () => imgModal.style.display = 'none');
        imgFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => selectedFileBase64 = event.target.result;
                reader.readAsDataURL(file);
            }
        });
        document.getElementById('ins-image-save').addEventListener('click', () => {
            if (!currentImgTarget) return;
            let finalUrl = selectedFileBase64 || imgUrlInput.value.trim();
            if (!finalUrl) return imgModal.style.display = 'none';
            const targetEl = document.querySelector(`[data-dbid="${currentImgTarget}"]`);
            if (targetEl) {
                targetEl.style.backgroundImage = `url(${finalUrl})`;
                targetEl.style.backgroundSize = 'cover';
                targetEl.style.backgroundPosition = 'center';
                
                db.placeholders.put({ id: currentImgTarget, dataUrl: finalUrl }).then(() => imgModal.style.display = 'none');
            }
        });
        /* ================= 2. 专属名片（文案+左侧信息框背景图）复合逻辑 ================= */
        const profModal = document.getElementById('ins-profile-modal');
        const profGrpInput = document.getElementById('ins-prof-group');
        const profEmlInput = document.getElementById('ins-prof-email');
        const profPhnInput = document.getElementById('ins-prof-phone');
        const profImgUrl = document.getElementById('ins-prof-img-url');
        const profImgFile = document.getElementById('ins-prof-img-file');
        let profImgBase64 = null;
        // 初始化读取专属数据
        db.texts.get('txt-group').then(res => { if(res) document.getElementById('txt-group').textContent = res.value; });
        db.texts.get('txt-email').then(res => { if(res) document.getElementById('txt-email').textContent = res.value; });
        db.texts.get('txt-phone').then(res => { if(res) document.getElementById('txt-phone').textContent = res.value; });
        
        // 渲染专属名片的背景（左侧）
        db.placeholders.get('info-profile-bg').then(res => {
            if(res && res.dataUrl) {
                const el = document.getElementById('info-profile-bg');
                el.style.backgroundImage = `url(${res.dataUrl})`;
            }
        });
        // 监听点击左侧名片区域唤起复合弹窗
        document.querySelector('.profile-interactive-zone').addEventListener('click', () => {
            profGrpInput.value = document.getElementById('txt-group').textContent;
            profEmlInput.value = document.getElementById('txt-email').textContent;
            profPhnInput.value = document.getElementById('txt-phone').textContent;
            
            profImgUrl.value = '';
            profImgFile.value = '';
            profImgBase64 = null;
            
            profModal.style.display = 'flex';
        });
        document.getElementById('ins-prof-cancel').addEventListener('click', () => profModal.style.display = 'none');
        
        profImgFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => profImgBase64 = event.target.result;
                reader.readAsDataURL(file);
            }
        });
        // 保存专属数据（此时图片作用于左侧信息区域背景）
        document.getElementById('ins-prof-save').addEventListener('click', () => {
            const grpVal = profGrpInput.value.trim();
            const emlVal = profEmlInput.value.trim();
            const phnVal = profPhnInput.value.trim();
            const imgVal = profImgBase64 || profImgUrl.value.trim();
            if(grpVal) { document.getElementById('txt-group').textContent = grpVal; db.texts.put({id: 'txt-group', value: grpVal}); }
            if(emlVal) { document.getElementById('txt-email').textContent = emlVal; db.texts.put({id: 'txt-email', value: emlVal}); }
            if(phnVal) { document.getElementById('txt-phone').textContent = phnVal; db.texts.put({id: 'txt-phone', value: phnVal}); }
            if (imgVal) {
                const el = document.getElementById('info-profile-bg');
                el.style.backgroundImage = `url(${imgVal})`;
                db.placeholders.put({ id: 'info-profile-bg', dataUrl: imgVal });
            }
            
            profModal.style.display = 'none';
        });
        // 点击弹窗背景关闭
        document.querySelectorAll('.ins-modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.style.display = 'none';
            });
        });
        /* ================= 新增：可修改文案持久化逻辑 ================= */
        const textModal = document.getElementById('ins-text-modal');
        const textContentInput = document.getElementById('ins-text-content');
        let currentTextTarget = null;
        const editableTextIds = [
            'txt-song-title', 'txt-song-singer',
            'txt-card-likes-label', 'txt-card-like-count', 'txt-card-comment-count',
            'txt-card-main-title', 'txt-card-lyrics', 'txt-card-tags',
            'txt-music-title'
        ];
        // 初始化：从数据库读取并渲染文案
        editableTextIds.forEach(textId => {
            db.texts.get(textId).then(record => {
                if (record && record.value) {
                    document.getElementById(textId).innerHTML = record.value;
                }
            });
        });
        // 给所有可修改文案添加点击事件
        document.querySelectorAll('.text-interactive-zone').forEach(el => {
            el.addEventListener('click', () => {
                currentTextTarget = el.id;
                textContentInput.value = el.innerHTML.replace(/<br>/g, '\n');
                textModal.style.display = 'flex';
                textContentInput.focus();
            });
        });
        document.getElementById('ins-text-cancel').addEventListener('click', () => {
            textModal.style.display = 'none';
            currentTextTarget = null;
        });
        document.getElementById('ins-text-save').addEventListener('click', () => {
            if (!currentTextTarget) return;
            const newContent = textContentInput.value.trim();
            if (!newContent) return textModal.style.display = 'none';
            const targetEl = document.getElementById(currentTextTarget);
            if (targetEl) {
                targetEl.innerHTML = newContent.replace(/\n/g, '<br>');
                db.texts.put({ id: currentTextTarget, value: targetEl.innerHTML }).then(() => {
                    textModal.style.display = 'none';
                    currentTextTarget = null;
                });
            }
        });
    });

(function () {
  const route = "desktop";
  const placeholderUrl = "../assets/初始占位图.png";
  const placeholderSelectors = [".w-88-cover",".w-90-cover",".w-90-r-top","#info-profile-bg",".w-31-body",".w-33-cover",".w-14-cover",".w-90-box"];
  const bindings = [{"selector":".p1-wechat","action":"open","target":"wechat"},{"selector":".p1-anni","action":"open","target":"anniversary"},{"selector":".p2-novel","action":"open","target":"novel"},{"selector":".p2-contact","action":"open","target":"contacts"},{"selector":".dock-worldbook","action":"open","target":"worldbook"},{"selector":".dock-theme","action":"open","target":"theme"},{"selector":".dock-settings","action":"open","target":"settings"}];
  const backSelectors = [];
  const overrideReturnToDesktop = false;
  const shell = window.parent && window.parent.__miniShell;

  function openRoute(target) {
    if (shell && typeof shell.open === 'function') shell.open(target, route);
  }

  function preloadRoute(target) {
    if (shell && typeof shell.preload === 'function') shell.preload(target);
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
      if (binding.action === 'open' && binding.target) {
        const warmRoute = () => preloadRoute(binding.target);
        el.addEventListener('pointerdown', warmRoute, { capture: true, passive: true });
        el.addEventListener('mouseenter', warmRoute, { capture: true, passive: true });
        el.addEventListener('focusin', warmRoute, true);
      }
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
