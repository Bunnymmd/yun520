const defaultCSS = `/* Desktop surface */
.screen-container {
    background-color: transparent;
}

/* App grid */
.app-grid {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: none;
    grid-auto-rows: minmax(88px, auto);
    row-gap: 8px;
    align-content: start;
}
.app-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    background-color: #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}
.app-name {
    font-size: 11px;
    font-weight: 500;
    color: #1f1f1f;
}

/* Dock */
.dock {
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 24px;
}

/* Widgets */
.w-88, .w-14 {
    border-radius: 18px;
    background: #fff;
}
.w-88-cover {
    border-radius: 8px;
}
.w-31,
.w-6 {
    border-radius: 12px;
}
.w-90-body {
    border-radius: 12px;
}
.w-33 {
    border-radius: 16px;
    background: #fff;
}
`;

const db = window.MiniDB.databases.theme;
const MIN_ICON_SIZE = 36;
const MAX_ICON_SIZE = 64;
const ADD_LABEL = 'ADD';
const RESET_LABEL = 'RESET';
const HIDE_LABEL = 'HIDE';
const SHOW_LABEL = 'SHOW';

let currentView = 'view-main';
let pendingImageBase64 = { lock: null, desk: null };
let currentUploadTarget = null;
let currentIconUploadIndex = null;

const appIconConfigList = [
    { name: 'WeChat', storageKey: 1 },
    { name: '联系人', storageKey: 3 },
    { name: '情侣空间', storageKey: 16 },
    { name: '纪念日', storageKey: 6 },
    { name: '陪伴', storageKey: 7 },
    { name: '遇见', storageKey: 8 },
    { name: '音乐', storageKey: 9 },
    { name: '小说', storageKey: 10 },
    { name: '游戏', storageKey: 11 },
    { name: '购物', storageKey: 12 },
    { name: '论坛', storageKey: 14 },
    { name: '查手机', storageKey: 15 },
    { name: '占位24', storageKey: 2 },
    { name: '21st Closet', storageKey: 18 },
    { name: '直播', storageKey: 19 },
    { name: 'IF线', storageKey: 20 },
    { name: 'MESSAGE', storageKey: 21, fixed: true, note: 'DOCK' },
    { name: 'WORLDBOOK', storageKey: 22, fixed: true, note: 'DOCK' },
    { name: 'THEME', storageKey: 23, fixed: true, note: 'DOCK' },
    { name: 'SETTINGS', storageKey: 24, fixed: true, note: 'DOCK' }
];

const widgetNamesList = [
    '音乐控制台 (W-88)',
    '个人主页卡片 (W-90)',
    '日历面板 (W-6)',
    '备忘录组件 (W-31)',
    '图文卡片 (W-33)',
    '迷你播放器 (W-14)'
];

function clampIconSize(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 60;
    return Math.max(MIN_ICON_SIZE, Math.min(MAX_ICON_SIZE, parsed));
}

function getInjectedStyleTag() {
    return document.getElementById('injected-custom-css');
}

document.addEventListener('DOMContentLoaded', () => {
    db.placeholders.get('bg-lockscreen').then((res) => {
        if (res && res.dataUrl) {
            document.getElementById('mock-lock').style.backgroundImage = `url("${res.dataUrl}")`;
            pendingImageBase64.lock = res.dataUrl;
        }
    });

    db.placeholders.get('bg-desktop').then((res) => {
        if (res && res.dataUrl) {
            document.getElementById('mock-desk').style.backgroundImage = `url("${res.dataUrl}")`;
            pendingImageBase64.desk = res.dataUrl;
        }
    });

    db.settings.get('custom-dev-css').then((res) => {
        const cssContent = res && res.value ? res.value : defaultCSS;
        document.getElementById('css-editor').value = cssContent;
        const styleTag = getInjectedStyleTag();
        if (styleTag) styleTag.textContent = cssContent;
    });

    renderIcons();
    renderWidgets();

    db.settings.get('icon_radius').then((res) => {
        if (!res) return;
        document.getElementById('icon-radius-slider').value = res.value;
        updateIconRadius(res.value);
    });

    db.settings.get('icon_size').then((res) => {
        if (!res) return;
        const safeValue = clampIconSize(res.value);
        document.getElementById('icon-size-slider').value = safeValue;
        updateIconSize(safeValue);
        if (String(safeValue) !== String(res.value)) {
            saveSetting('icon_size', safeValue);
        }
    });

    db.settings.get('widget_radius').then((res) => {
        if (!res) return;
        document.getElementById('widget-radius-slider').value = res.value;
        updateWidgetRadius(res.value);
    });

    document.getElementById('hidden-file-input').addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file || !currentUploadTarget) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            const targetId = currentUploadTarget === 'lock' ? 'mock-lock' : 'mock-desk';
            const dbId = currentUploadTarget === 'lock' ? 'bg-lockscreen' : 'bg-desktop';

            document.getElementById(targetId).style.backgroundImage = `url("${base64}")`;
            pendingImageBase64[currentUploadTarget] = base64;
            db.placeholders.put({ id: dbId, dataUrl: base64 });
            e.target.value = '';
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('icon-upload-input').addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file || currentIconUploadIndex === null) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            const storageKey = getIconStorageKey(currentIconUploadIndex);
            if (!storageKey) return;
            applyIconImg(currentIconUploadIndex, base64);
            db.placeholders.put({ id: `icon_${storageKey}_img`, dataUrl: base64 });
            e.target.value = '';
        };
        reader.readAsDataURL(file);
    });
});

function switchView(viewId, title) {
    document.querySelectorAll('.view-section').forEach((view) => view.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    document.getElementById('global-nav-title').innerText = title;
    currentView = viewId;
}

function handleBack() {
    if (currentView === 'view-main') {
        history.back();
        return;
    }
    switchView('view-main', 'THEME');
}

function triggerUpload(target) {
    currentUploadTarget = target;
    document.getElementById('hidden-file-input').click();
}

function saveBg(target) {
    const base64 = pendingImageBase64[target];
    if (!base64) return;
    const dbId = target === 'lock' ? 'bg-lockscreen' : 'bg-desktop';
    db.placeholders.put({ id: dbId, dataUrl: base64 }).then(() => {
        const buttons = document.querySelectorAll('.btn-save');
        const btn = target === 'lock' ? buttons[0] : buttons[1];
        if (!btn) return;
        const originalText = btn.innerText;
        btn.innerText = 'SAVED';
        btn.style.background = '#1a1a1a';
        window.setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = '#1a1a1a';
        }, 1000);
    });
}

function resetBg(target) {
    const targetId = target === 'lock' ? 'mock-lock' : 'mock-desk';
    const dbId = target === 'lock' ? 'bg-lockscreen' : 'bg-desktop';

    document.getElementById(targetId).style.backgroundImage = 'none';
    pendingImageBase64[target] = null;
    db.placeholders.delete(dbId);
}

function getIconConfig(index) {
    return appIconConfigList[index - 1] || null;
}

function getIconStorageKey(index) {
    const config = getIconConfig(index);
    return config ? config.storageKey : null;
}

function renderIcons() {
    const container = document.getElementById('icon-grid-container');
    container.innerHTML = '';

    for (let i = 1; i <= appIconConfigList.length; i += 1) {
        const iconConfig = getIconConfig(i);
        const appName = iconConfig.name;
        const storageKey = iconConfig.storageKey;
        const fixedAttr = iconConfig.fixed ? ' data-icon-fixed="1"' : '';
        const fixedClass = iconConfig.fixed ? ' is-fixed' : '';
        const noteHtml = iconConfig.note ? `<div class="icon-note">${iconConfig.note}</div>` : '';
        container.innerHTML += `
            <div class="icon-item${fixedClass}" id="icon-item-${i}" data-icon-key="${storageKey}"${fixedAttr}>
                <div class="icon-preview" id="icon-preview-${i}" onclick="triggerIconUpload(${i})">
                    <span style="font-size: 10px; color: #aaa;">${ADD_LABEL}</span>
                </div>
                <div class="icon-name">${appName}</div>
                ${noteHtml}
                <div class="icon-actions">
                    <button onclick="resetIcon(${i})">${RESET_LABEL}</button>
                </div>
            </div>
        `;
        db.placeholders.get(`icon_${storageKey}_img`).then((res) => {
            if (res && res.dataUrl) applyIconImg(i, res.dataUrl);
        });
    }
}

function applyIconImg(index, base64) {
    const preview = document.getElementById(`icon-preview-${index}`);
    preview.innerHTML = `<img src="${base64}" alt="icon">`;
    preview.style.border = 'none';
}

function triggerIconUpload(index) {
    currentIconUploadIndex = index;
    document.getElementById('icon-upload-input').click();
}

function resetIcon(index) {
    const preview = document.getElementById(`icon-preview-${index}`);
    const storageKey = getIconStorageKey(index);
    preview.innerHTML = `<span style="font-size: 10px; color: #aaa;">${ADD_LABEL}</span>`;
    preview.style.border = '1px dashed #ccc';
    if (storageKey) db.placeholders.delete(`icon_${storageKey}_img`);
}

function renderWidgets() {
    const container = document.getElementById('widget-list-container');
    container.innerHTML = '';
    for (let i = 1; i <= widgetNamesList.length; i += 1) {
        const widgetName = widgetNamesList[i - 1];
        container.innerHTML += `
            <div class="widget-item" id="widget-item-${i}">
                <div class="widget-preview" id="widget-preview-${i}">
                    ${widgetName}
                </div>
                <div class="widget-actions">
                    <button onclick="resetWidget(${i})">${RESET_LABEL}</button>
                    <button id="widget-hide-btn-${i}" class="hide-btn" onclick="toggleWidgetHide(${i})">${HIDE_LABEL}</button>
                </div>
            </div>
        `;
        db.settings.get(`widget_${i}_hidden`).then((res) => {
            if (res && res.value) setWidgetHideState(i, true);
        });
    }
}

function resetWidget(index) {
    const preview = document.getElementById(`widget-preview-${index}`);
    preview.innerHTML = widgetNamesList[index - 1];
}

function setWidgetHideState(index, isHidden) {
    const item = document.getElementById(`widget-item-${index}`);
    const btn = document.getElementById(`widget-hide-btn-${index}`);
    if (!item || !btn) return;
    btn.dataset.hidden = isHidden ? '1' : '0';
    if (isHidden) {
        item.style.opacity = '0.4';
        btn.innerText = SHOW_LABEL;
        btn.classList.add('hidden');
    } else {
        item.style.opacity = '1';
        btn.innerText = HIDE_LABEL;
        btn.classList.remove('hidden');
    }
}

function toggleWidgetHide(index) {
    const btn = document.getElementById(`widget-hide-btn-${index}`);
    const nextHidden = btn ? btn.dataset.hidden !== '1' : true;
    setWidgetHideState(index, nextHidden);
    db.settings.put({ id: `widget_${index}_hidden`, value: nextHidden });
}

function updateIconRadius(val) {
    document.getElementById('icon-radius-val').innerText = `${val}px`;
    document.querySelectorAll('.icon-preview').forEach((el) => {
        el.style.borderRadius = `${val}px`;
    });
}

function updateIconSize(val) {
    const safeValue = clampIconSize(val);
    document.getElementById('icon-size-slider').value = safeValue;
    document.getElementById('icon-size-val').innerText = `${safeValue}px`;
    document.querySelectorAll('.icon-preview').forEach((el) => {
        el.style.width = `${safeValue}px`;
        el.style.height = `${safeValue}px`;
    });
    return safeValue;
}

function updateWidgetRadius(val) {
    document.getElementById('widget-radius-val').innerText = `${val}px`;
    document.querySelectorAll('.widget-preview').forEach((el) => {
        el.style.borderRadius = `${val}px`;
    });
}

function saveSetting(id, val) {
    const nextValue = id === 'icon_size' ? clampIconSize(val) : val;
    db.settings.put({ id, value: nextValue });
}

function saveCSS() {
    const cssContent = document.getElementById('css-editor').value;
    db.settings.put({ id: 'custom-dev-css', value: cssContent }).then(() => {
        const styleTag = getInjectedStyleTag();
        if (styleTag) styleTag.textContent = cssContent;

        const btn = document.querySelector('#view-dev .btn-save');
        if (!btn) return;
        const originalText = btn.innerText;
        btn.innerText = 'APPLIED';
        btn.style.background = '#1a1a1a';
        window.setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = '#1a1a1a';
        }, 1000);
    });
}

function resetCSS() {
    document.getElementById('css-editor').value = defaultCSS;
    saveCSS();
}

(function () {
  const route = "theme";
  const placeholderUrl = "../assets/%E5%88%9D%E5%A7%8B%E5%8D%A0%E4%BD%8D%E5%9B%BE.png";
  const placeholderSelectors = ["#mock-lock", "#mock-desk"];
  const bindings = [{"selector":"#view-main .set-item:nth-child(4)","action":"open","target":"theme_fonts"}];
  const backSelectors = [];
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
