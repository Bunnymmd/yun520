(function () {
  const route = "settings";
  const placeholderUrl = "../assets/初始占位图.png";
  const placeholderSelectors = [];
  const bindings = [{"selector":".settings-content .set-item:nth-child(3)","action":"open","target":"settings_api"}];
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
