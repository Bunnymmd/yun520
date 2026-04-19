let toastTimeout;

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove('show'), 2500);
}

const db = window.MiniDB.databases.theme;
let currentFontData = null;

function ensureStyleTag(id) {
    let styleTag = document.getElementById(id);
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = id;
        document.head.appendChild(styleTag);
    }
    return styleTag;
}

function buildFontFaceCss(fontFamily, fontSrc) {
    return `@font-face { font-family: '${fontFamily}'; src: url(${JSON.stringify(String(fontSrc || ''))}); }`;
}

function previewFont(fontSrc) {
    const styleTag = ensureStyleTag('dynamic-font-preview-style');
    styleTag.innerHTML = `
        ${buildFontFaceCss('AppCustomFontPreview', fontSrc)}
        #font-preview { font-family: 'AppCustomFontPreview', -apple-system, sans-serif !important; }
    `;
}

function applyFont(fontSrc) {
    const styleTag = ensureStyleTag('dynamic-font-style');
    styleTag.innerHTML = `
        ${buildFontFaceCss('AppCustomFont', fontSrc)}
        html, body, body * { font-family: 'AppCustomFont', -apple-system, sans-serif !important; }
    `;
}

function clearFontStyles() {
    ['dynamic-font-style', 'dynamic-font-preview-style'].forEach((id) => {
        const styleTag = document.getElementById(id);
        if (styleTag) styleTag.innerHTML = '';
    });
}

function previewScale(value) {
    document.getElementById('scale-val').innerText = `${value}%`;
    const scale = Number(value) / 100;
    document.body.style.transformOrigin = 'top left';
    document.body.style.transform = `scale(${scale})`;
    document.body.style.width = `${100 / scale}vw`;
    document.body.style.height = `${100 / scale}vh`;
}

document.getElementById('font-file').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
        currentFontData = loadEvent.target.result;
        previewFont(currentFontData);
        showToast('本地字体已载入预览');
    };
    reader.readAsDataURL(file);
});

document.getElementById('btn-save-font').addEventListener('click', () => {
    const urlInput = document.getElementById('font-url').value.trim();
    const fontToSave = currentFontData || urlInput;
    if (!fontToSave) {
        showToast('请先填写链接或选择字体文件');
        return;
    }
    applyFont(fontToSave);
    previewFont(fontToSave);
    db.settings.put({ id: 'custom_font', value: fontToSave }).then(() => showToast('字体已保存并应用'));
});

document.getElementById('btn-reset-font').addEventListener('click', () => {
    clearFontStyles();
    currentFontData = null;
    document.getElementById('font-url').value = '';
    document.getElementById('font-file').value = '';
    db.settings.delete('custom_font').then(() => showToast('字体已恢复默认'));
});

document.getElementById('btn-save-scale').addEventListener('click', () => {
    const value = document.getElementById('scale-slider').value;
    db.settings.put({ id: 'ui_scale', value }).then(() => showToast('缩放比例已保存'));
});

document.getElementById('btn-reset-scale').addEventListener('click', () => {
    document.getElementById('scale-slider').value = 100;
    previewScale(100);
    db.settings.delete('ui_scale').then(() => showToast('缩放已恢复为 100%'));
});

document.addEventListener('DOMContentLoaded', () => {
    db.settings.get('custom_font').then((res) => {
        if (res && res.value) {
            applyFont(res.value);
            previewFont(res.value);
        }
    });
    db.settings.get('ui_scale').then((res) => {
        if (res && res.value) {
            document.getElementById('scale-slider').value = res.value;
            previewScale(res.value);
        } else {
            previewScale(100);
        }
    });
});

(function () {
  const route = "theme_fonts";
  const placeholderUrl = "../assets/%E5%88%9D%E5%A7%8B%E5%8D%A0%E4%BD%8D%E5%9B%BE.png";
  const placeholderSelectors = [];
  const bindings = [];
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
