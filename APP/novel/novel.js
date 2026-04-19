document.addEventListener("DOMContentLoaded", () => {
        const scroller = document.getElementById('main-scroller');
        const dockBtns = document.querySelectorAll('.dock-btn');
        if (!scroller || !dockBtns.length) return;

        const getPageWidth = () => Math.max(
            1,
            scroller.clientWidth || window.innerWidth || document.documentElement.clientWidth || 1
        );

        const syncActiveDock = () => {
            const activeIndex = Math.max(
                0,
                Math.min(dockBtns.length - 1, Math.round(scroller.scrollLeft / getPageWidth()))
            );

            dockBtns.forEach((btn, index) => {
                btn.classList.toggle('active', index === activeIndex);
            });
        };

        dockBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const pageIndex = Number.parseInt(btn.getAttribute('data-page'), 10);
                if (Number.isNaN(pageIndex)) return;
                scroller.scrollTo({ left: pageIndex * getPageWidth(), behavior: 'smooth' });
            });
        });

        scroller.addEventListener('scroll', syncActiveDock);
        window.addEventListener('resize', syncActiveDock);
        syncActiveDock();

        if (typeof Dexie === 'undefined') return console.error('Dexie.js Load Failed');
        const db = window.MiniDB.databases.novel;

        const modal = document.getElementById('ins-profile-modal');
        const inNick = document.getElementById('input-nickname');
        const inAcc = document.getElementById('input-account');
        const inFile = document.getElementById('input-avatar-file');
        const txtNick = document.getElementById('txt-nickname');
        const txtAcc = document.getElementById('txt-account');
        const avatarBg = document.getElementById('txt-avatar-bg');

        let tempAvatarBase64 = null;

        db.texts.get('prof-nickname').then(res => { if(res) txtNick.textContent = res.value; });
        db.texts.get('prof-account').then(res => { if(res) txtAcc.textContent = res.value; });
        db.images.get('prof-avatar').then(res => { 
            if(res && res.dataUrl) {
                avatarBg.style.backgroundImage = `url(${res.dataUrl})`;
                avatarBg.textContent = ''; 
            }
        });

        document.getElementById('btn-edit-profile').addEventListener('click', () => {
            inNick.value = txtNick.textContent;
            inAcc.value = txtAcc.textContent.replace('UID: ', '');
            tempAvatarBase64 = null;
            inFile.value = '';
            modal.style.display = 'flex';
        });

        inFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => { tempAvatarBase64 = event.target.result; };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('btn-save').addEventListener('click', () => {
            const nickVal = inNick.value.trim();
            const accVal = inAcc.value.trim();
            if(nickVal) { txtNick.textContent = nickVal; db.texts.put({id: 'prof-nickname', value: nickVal}); }
            if(accVal) { txtAcc.textContent = 'UID: ' + accVal; db.texts.put({id: 'prof-account', value: 'UID: ' + accVal}); }
            if(tempAvatarBase64) {
                avatarBg.style.backgroundImage = `url(${tempAvatarBase64})`;
                avatarBg.textContent = '';
                db.images.put({id: 'prof-avatar', dataUrl: tempAvatarBase64});
            }
            modal.style.display = 'none';
        });

        document.getElementById('btn-cancel').addEventListener('click', () => modal.style.display = 'none');
        modal.addEventListener('click', (e) => { if(e.target === modal) modal.style.display = 'none'; });
    });

(function () {
  const route = "novel";
  const placeholderUrl = "../assets/初始占位图.png";
  const placeholderSelectors = ["#txt-avatar-bg"];
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
