(function () {
  const ROUTES = {
    desktop: './APP/desktop/desktop.html',
    wechat: './APP/wechat/wechat.html',
    wechat_assets: './APP/wechat_assets/wechat_assets.html',
    contacts: './APP/contacts/contacts.html',
    anniversary: './APP/anniversary/anniversary.html',
    novel: './APP/novel/novel.html',
    worldbook: './APP/worldbook/worldbook.html',
    wechat_masks: './APP/wechat_masks/wechat_masks.html',
    settings: './APP/settings/settings.html',
    settings_api: './APP/settings_api/settings_api.html',
    theme: './APP/theme/theme.html',
    theme_fonts: './APP/theme_fonts/theme_fonts.html'
  };
  const ROUTE_VERSION = '20260418-lazy-boot-3';

  const DEFAULT_ROUTE = 'desktop';
  const PREWARM_ROUTES = [
    'wechat',
    'contacts',
    'anniversary',
    'theme',
    'settings',
    'worldbook',
    'novel',
    'wechat_assets',
    'wechat_masks',
    'settings_api',
    'theme_fonts'
  ];
  const CRITICAL_PREWARM_ROUTES = [
    'wechat',
    'contacts',
    'anniversary',
    'theme',
    'settings',
    'worldbook',
  ];
  const DESKTOP_SHELL_MEDIA = window.matchMedia('(hover: hover) and (pointer: fine)');
  const ROOT_STYLE = document.documentElement.style;
  const app = document.getElementById('app');
  const boot = document.getElementById('mini-boot');
  const frames = new Map();
  const frameReady = new Map();
  const historyStack = [];
  let activeRoute = null;
  let pendingNavigationToken = 0;
  let prewarmStarted = false;

  function readRootCssPixels(variableName, fallbackValue) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallbackValue;
  }

  function updateMiniShellScale() {
    if (!DESKTOP_SHELL_MEDIA.matches) {
      ROOT_STYLE.setProperty('--mini-shell-scale', '1');
      return;
    }

    const shellWidth = readRootCssPixels('--mini-shell-width', 468);
    const shellHeight = readRootCssPixels('--mini-shell-height', 984);
    const availableWidth = Math.max(window.innerWidth - 48, 0);
    const availableHeight = Math.max(window.innerHeight - 48, 0);
    let scale = Math.min(1, availableWidth / shellWidth, availableHeight / shellHeight);

    if (!Number.isFinite(scale) || scale <= 0) {
      scale = 1;
    }

    ROOT_STYLE.setProperty('--mini-shell-scale', scale.toFixed(4));
  }

  function clearRouteState() {
    if (!window.location.hash) return;
    try {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (error) {}
  }

  function postThemeApply(frame) {
    try {
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage({ type: 'mini-apply-theme' }, '*');
      }
    } catch (error) {}
  }

  function buildFrameSrc(route) {
    const src = ROUTES[route];
    if (!src) return '';
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}v=${encodeURIComponent(ROUTE_VERSION)}`;
  }

  function scheduleIdleWork(callback, delay = 0) {
    const run = () => {
      window.setTimeout(callback, delay);
    };

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(run, { timeout: 1200 });
      return;
    }

    window.setTimeout(callback, Math.max(delay, 120));
  }

  function createFrame(route) {
    if (!ROUTES[route]) return null;
    if (frames.has(route)) return frames.get(route);

    let resolveFrameReady = null;
    const readyPromise = new Promise((resolve) => {
      resolveFrameReady = resolve;
    });

    const iframe = document.createElement('iframe');
    iframe.className = 'mini-frame';
    iframe.dataset.route = route;
    iframe.dataset.loaded = '0';
    iframe.setAttribute('title', route);
    iframe.setAttribute('allow', 'clipboard-read; clipboard-write');
    frameReady.set(route, readyPromise);
    iframe.addEventListener('load', () => {
      iframe.dataset.loaded = '1';
      if (resolveFrameReady) {
        resolveFrameReady(iframe);
        resolveFrameReady = null;
      }
      if (route === DEFAULT_ROUTE && boot) boot.classList.add('hidden');
      if (route === DEFAULT_ROUTE) startRoutePrewarm();
      postThemeApply(iframe);
    }, { once: true });
    iframe.src = buildFrameSrc(route);
    app.appendChild(iframe);
    frames.set(route, iframe);
    return iframe;
  }

  function getFrame(route) {
    return frames.get(route) || createFrame(route);
  }

  function ensureFrameReady(route) {
    const frame = getFrame(route);
    if (!frame) return Promise.resolve(null);
    if (frame.dataset.loaded === '1') return Promise.resolve(frame);
    return frameReady.get(route) || Promise.resolve(frame);
  }

  function preloadRoute(route) {
    if (!ROUTES[route]) return Promise.resolve(null);
    return ensureFrameReady(route);
  }

  function activate(route) {
    if (!ROUTES[route]) return;

    const frame = getFrame(route);
    activeRoute = route;

    frames.forEach((item, name) => {
      item.classList.toggle('active', name === route);
    });

    if (frame) {
      frame.classList.add('active');
    }
  }

  function startRoutePrewarm() {
    if (prewarmStarted) return;
    prewarmStarted = true;

    const criticalRoutes = CRITICAL_PREWARM_ROUTES.filter((route) => route !== DEFAULT_ROUTE && ROUTES[route]);
    const queue = PREWARM_ROUTES.filter((route) => route !== DEFAULT_ROUTE && ROUTES[route] && !criticalRoutes.includes(route));

    criticalRoutes.forEach((route) => {
      preloadRoute(route).catch(() => {});
    });

    const warmNext = () => {
      if (!queue.length) return;
      if (document.hidden) {
        scheduleIdleWork(warmNext, 320);
        return;
      }

      const nextRoute = queue.shift();
      preloadRoute(nextRoute)
        .catch(() => null)
        .finally(() => {
          scheduleIdleWork(warmNext, 180);
        });
    };

    scheduleIdleWork(warmNext, 240);
  }

  function show(route, options = {}) {
    if (!ROUTES[route]) return;
    const currentRoute = activeRoute;

    if (currentRoute === route) {
      activate(route);
      return;
    }

    const frame = getFrame(route);
    const isReady = frame && frame.dataset.loaded === '1';

    if (isReady) {
      pendingNavigationToken += 1;
      if (options.recordHistory && currentRoute && currentRoute !== route) {
        historyStack.push(currentRoute);
      }
      activate(route);
      return;
    }

    const token = ++pendingNavigationToken;
    preloadRoute(route)
      .then(() => {
        if (token !== pendingNavigationToken) return;
        if (options.recordHistory && activeRoute === currentRoute && currentRoute && currentRoute !== route) {
          historyStack.push(currentRoute);
        }
        activate(route);
      })
      .catch(() => {});
  }

  function open(route) {
    show(route, { recordHistory: true });
  }

  function back() {
    if (!historyStack.length) {
      activate(DEFAULT_ROUTE);
      return;
    }

    const previousRoute = historyStack.pop();
    activate(previousRoute || DEFAULT_ROUTE);
  }

  function home() {
    historyStack.length = 0;
    activate(DEFAULT_ROUTE);
  }

  window.__miniShell = { open, back, home, preload: preloadRoute };

  window.addEventListener('message', (event) => {
    if (!event.data || event.data.type !== 'mini-theme-updated') return;
    frames.forEach((frame) => postThemeApply(frame));
  });

  if (typeof DESKTOP_SHELL_MEDIA.addEventListener === 'function') {
    DESKTOP_SHELL_MEDIA.addEventListener('change', updateMiniShellScale);
  } else if (typeof DESKTOP_SHELL_MEDIA.addListener === 'function') {
    DESKTOP_SHELL_MEDIA.addListener(updateMiniShellScale);
  }

  window.addEventListener('resize', updateMiniShellScale, { passive: true });
  window.addEventListener('load', updateMiniShellScale, { once: true });

  updateMiniShellScale();
  clearRouteState();
  activate(DEFAULT_ROUTE);
  startRoutePrewarm();
})();
