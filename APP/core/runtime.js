(function () {
  const realContacts = [];

  const realEvents = [];

  const desktopThemeIcons = [
    { selector: '.p1-wechat', name: 'WeChat', storageKey: 1, legacyKey: 5 },
    { selector: '.p2-contact', name: '\u8054\u7cfb\u4eba', storageKey: 3, legacyKey: null },
    { selector: '.p1-couple', name: '\u60c5\u4fa3\u7a7a\u95f4', storageKey: 16, legacyKey: 14 },
    { selector: '.p1-anni', name: '\u7eaa\u5ff5\u65e5', storageKey: 6, legacyKey: 6 },
    { selector: '.p1-company', name: '\u966a\u4f34', storageKey: 7, legacyKey: null },
    { selector: '.p1-meet', name: '\u9047\u89c1', storageKey: 8, legacyKey: 9 },
    { selector: '.p2-music', name: '\u97f3\u4e50', storageKey: 9, legacyKey: 15 },
    { selector: '.p2-novel', name: '\u5c0f\u8bf4', storageKey: 10, legacyKey: 1 },
    { selector: '.p2-game', name: '\u6e38\u620f', storageKey: 11, legacyKey: 11 },
    { selector: '.p2-shop', name: '\u8d2d\u7269', storageKey: 12, legacyKey: 3 },
    { selector: '.p2-forum', name: '\u8bba\u575b', storageKey: 14, legacyKey: 4 },
    { selector: '.p2-phonecheck', name: '\u67e5\u624b\u673a', storageKey: 15, legacyKey: 13 },
    { selector: '.p1-info', name: '\u5360\u4f4d24', storageKey: 2, legacyKey: 16 },
    { selector: '.p3-closet', name: '21st Closet', storageKey: 18, legacyKey: 18 },
    { selector: '.p3-live', name: '\u76f4\u64ad', storageKey: 19, legacyKey: 19 },
    { selector: '.p3-if', name: 'IF\u7ebf', storageKey: 20, legacyKey: 20 },
    { selector: '.dock-message', name: 'MESSAGE', storageKey: 21, legacyKey: null, fixed: true },
    { selector: '.dock-worldbook', name: 'WORLDBOOK', storageKey: 22, legacyKey: null, fixed: true },
    { selector: '.dock-theme', name: 'THEME', storageKey: 23, legacyKey: null, fixed: true },
    { selector: '.dock-settings', name: 'SETTINGS', storageKey: 24, legacyKey: null, fixed: true }
  ];

  const appOrder = desktopThemeIcons.map((item) => item.name);
  const desktopThemeIconSelectors = desktopThemeIcons.map((item) => item.selector);
  const legacyThemeIconKeysByStableOrder = desktopThemeIcons.map((item) => item.legacyKey);
  const legacyIconMap = legacyThemeIconKeysByStableOrder.slice();

  const runtimeCss = `
    .mini-system-toast{position:fixed;top:max(14px,env(safe-area-inset-top));left:50%;transform:translate(-50%,-18px);max-width:min(88vw,360px);z-index:2147483647;opacity:0;pointer-events:none;background:rgba(255,255,255,.97);color:#111;border:1px solid rgba(0,0,0,.06);border-radius:20px;box-shadow:0 16px 38px rgba(0,0,0,.08);padding:11px 16px;font-family:"PingFang SC","Hiragino Sans GB","Microsoft YaHei",-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;font-weight:700;line-height:1.5;text-align:center;letter-spacing:.02em;text-transform:none;transition:opacity .18s ease,transform .18s ease}
    .mini-system-toast.show{opacity:1;transform:translate(-50%,0)}
    .mini-wechat-incoming-banner{position:fixed;top:max(58px,calc(env(safe-area-inset-top) + 46px));left:50%;width:min(92vw,388px);display:grid;grid-template-columns:52px minmax(0,1fr);gap:12px;align-items:center;padding:12px 14px;transform:translate(-50%,-18px);border:1px solid rgba(0,0,0,.05);border-radius:22px;background:rgba(255,255,255,.96);box-shadow:0 22px 48px rgba(0,0,0,.12);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);z-index:2147483646;opacity:0;pointer-events:none;transition:opacity .2s ease,transform .2s ease}
    .mini-wechat-incoming-banner.show{opacity:1;transform:translate(-50%,0)}
    .mini-wechat-incoming-banner-avatar{width:52px;height:52px;border-radius:16px;background:#e9e9e9;background-size:cover;background-position:center;background-repeat:no-repeat;box-shadow:0 6px 16px rgba(0,0,0,.08)}
    .mini-wechat-incoming-banner-copy{min-width:0;display:flex;flex-direction:column;gap:5px;align-items:flex-start;text-align:left}
    .mini-wechat-incoming-banner-head{width:100%;display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
    .mini-wechat-incoming-banner-meta{min-width:0;display:flex;flex-direction:column;gap:2px}
    .mini-wechat-incoming-banner-name{max-width:100%;font-size:14px;font-weight:800;line-height:1.2;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mini-wechat-incoming-banner-app{font-size:11px;font-weight:700;line-height:1.2;color:#8a8a8a}
    .mini-wechat-incoming-banner-time{flex:0 0 auto;font-size:11px;font-weight:700;line-height:1.2;color:#8a8a8a;padding-top:1px}
    .mini-wechat-incoming-banner-text{width:100%;font-size:12px;font-weight:600;line-height:1.45;color:#2a2a2a;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
    .modal-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(250,249,248,.95);display:none;justify-content:center;align-items:center;z-index:9999;opacity:0;transition:opacity .2s ease}
    .modal-overlay.show{display:flex;opacity:1}
    .modal-box{background:#fff;border:1px solid rgba(0,0,0,.04);box-shadow:0 20px 50px rgba(0,0,0,.05);border-radius:24px;padding:30px 25px;width:85%;max-width:320px;display:flex;flex-direction:column;gap:15px;margin:auto}
    .modal-header{text-align:center;font-size:16px;font-weight:900;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;color:#111}
    .modal-box input,.modal-box select,.modal-box textarea,.modal-box .flat-input,.modal-box .flat-textarea{width:100%;padding:14px 16px;border-radius:14px;border:1px solid rgba(0,0,0,.04);background:#fff;outline:none;font-size:14px;color:#111;font-weight:600;transition:border-color .2s,box-shadow .2s;appearance:none}
    .modal-box input:focus,.modal-box select:focus,.modal-box textarea:focus,.modal-box .flat-input:focus,.modal-box .flat-textarea:focus{border-color:#1a1a1a;box-shadow:0 4px 15px rgba(0,0,0,.03)}
    .modal-actions{display:flex;gap:12px;margin-top:6px}
    .modal-actions button,.modal-box .btn-flat,.modal-box .btn-cancel,.modal-box .btn-save,.modal-box .btn-secondary,.modal-box .btn-primary,.modal-box .btn-danger{flex:1;padding:16px;border-radius:16px;border:none;font-size:14px;font-weight:800;letter-spacing:1px;cursor:pointer;transition:transform .1s}
    .modal-actions button:active,.modal-box .btn-flat:active,.modal-box .btn-cancel:active,.modal-box .btn-save:active,.modal-box .btn-secondary:active,.modal-box .btn-primary:active,.modal-box .btn-danger:active{transform:scale(.97)}
    .modal-box .btn-cancel,.modal-box .btn-secondary{background:#fff;color:#111;border:1px solid rgba(0,0,0,.05)}
    .modal-box .btn-save,.modal-box .btn-primary{background:#1a1a1a;color:#fff;box-shadow:0 8px 20px rgba(0,0,0,.1)}
    .modal-box .btn-danger{background:#fee2e2;color:#dc2626}
    .chat-input-bar{align-items:flex-end!important}
    .chat-input-bar .input-wrapper{height:auto!important;min-height:40px!important;max-height:120px!important;align-items:center!important;padding:8px 14px!important;overflow:hidden!important}
    .mini-chat-textarea{width:100%!important;min-height:24px!important;max-height:120px!important;border:0!important;padding:0!important;margin:0!important;outline:none!important;background:transparent!important;color:#111!important;resize:none!important;overflow-y:hidden;scrollbar-width:none!important;line-height:20px!important;font-size:14px!important;font-family:inherit!important;font-weight:500!important}
    .mini-chat-textarea::-webkit-scrollbar{display:none!important}
    [data-mini-route-scale-mode]{--mini-route-scale-current:var(--mini-route-scale,1);transform:scale(var(--mini-route-scale-current));will-change:transform}
    [data-mini-route-scale-mode="width-top-left"]{transform-origin:top left;width:calc(100vw / var(--mini-route-scale-current))!important;max-width:none!important}
    [data-mini-route-scale-mode="width-top-left"].settings-content,[data-mini-route-scale-mode="width-top-left"].settings-container,[data-mini-route-scale-mode="width-top-left"].view-section{align-self:flex-start!important}
    [data-mini-route-scale-mode="width-bottom-left"]{transform-origin:bottom left;width:calc(100vw / var(--mini-route-scale-current))!important;max-width:none!important}
    [data-mini-route-scale-mode="viewport-fill"]{transform-origin:top left;width:calc(100vw / var(--mini-route-scale-current))!important;height:calc(100vh / var(--mini-route-scale-current))!important;max-width:none!important;min-width:0!important;min-height:0!important}
    [data-mini-route-scale-mode="viewport-fill-bottom-offset"]{transform-origin:top left;width:calc(100vw / var(--mini-route-scale-current))!important;height:calc((100vh / var(--mini-route-scale-current)) - var(--mini-route-scale-bottom-offset,0px))!important;max-width:none!important;min-width:0!important;min-height:0!important}
    [data-mini-route-scale-mode="viewport-shell"]{transform-origin:top left;width:calc(100vw / var(--mini-route-scale-current))!important;height:calc(100vh / var(--mini-route-scale-current))!important;max-width:none!important;min-width:0!important;min-height:0!important;align-self:flex-start!important}
    [data-mini-route-scale-mode="fixed-bottom-right"]{transform-origin:bottom right}
    [data-mini-route-scale-mode="fixed-bottom-center"]{transform-origin:center bottom}
    [data-mini-route-scale-mode="fixed-bottom-center-translate"]{transform-origin:center bottom;transform:translateX(-50%) scale(var(--mini-route-scale-current))!important}
    [data-mini-route="contacts"] #view-editor,[data-mini-route="contacts"] #view-editor *,[data-mini-route="wechat_masks"] #view-editor,[data-mini-route="wechat_masks"] #view-editor *{overscroll-behavior-x:none!important}
    [data-mini-route="contacts"] #view-editor,[data-mini-route="contacts"] #view-editor .editor-scroll,[data-mini-route="contacts"] #view-editor .capture-area,[data-mini-route="contacts"] #view-editor .form-section,[data-mini-route="contacts"] #view-editor .action-group,[data-mini-route="contacts"] #view-editor .form-row,[data-mini-route="wechat_masks"] #view-editor,[data-mini-route="wechat_masks"] #view-editor .editor-scroll,[data-mini-route="wechat_masks"] #view-editor .capture-area,[data-mini-route="wechat_masks"] #view-editor .form-section,[data-mini-route="wechat_masks"] #view-editor .action-group,[data-mini-route="wechat_masks"] #view-editor .form-row{max-width:100%!important;overflow-x:hidden!important;touch-action:pan-y!important}
    [data-mini-route="contacts"] #view-editor .editor-scroll,[data-mini-route="wechat_masks"] #view-editor .editor-scroll{align-items:center!important}
    [data-mini-route="contacts"] #view-editor .capture-area,[data-mini-route="wechat_masks"] #view-editor .capture-area{padding:24px 16px 20px!important;justify-content:center!important}
    [data-mini-route="contacts"] #view-editor .form-row>[class*="form-group"],[data-mini-route="wechat_masks"] #view-editor .form-row>[class*="form-group"]{min-width:0!important}
    [data-mini-route="contacts"] #view-editor .acrylic-standee{width:min(100%,350px)!important;max-width:350px!important;flex:0 1 auto!important;height:auto!important;min-height:356px!important;overflow:visible!important}
    [data-mini-route="contacts"] #view-editor .standee-top-row,[data-mini-route="contacts"] #view-editor .standee-info-row{align-items:flex-start!important}
    [data-mini-route="contacts"] #view-editor .standee-value{display:block!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;word-break:break-word!important;overflow-wrap:anywhere!important}
    [data-mini-route="contacts"] #view-editor .standee-lore-box{height:auto!important;min-height:84px!important;max-height:none!important;overflow:visible!important;position:relative!important}
    [data-mini-route="contacts"] #view-editor .standee-lore-box::after{display:none!important}
    [data-mini-route="wechat_masks"] #view-editor .flat-badge{width:350px!important;max-width:none!important;flex:0 0 350px!important;height:284px!important;min-height:284px!important;overflow:hidden!important}
    [data-mini-route="wechat_masks"] #view-editor .badge-lore{height:66px!important;min-height:66px!important;overflow:hidden!important;position:relative!important}
    [data-mini-route="wechat_masks"] #view-editor .badge-lore::after{content:''!important;position:absolute!important;left:0!important;right:0!important;bottom:0!important;height:26px!important;background:linear-gradient(180deg,rgba(255,255,255,0),rgba(249,249,249,.98))!important;pointer-events:none!important}
    [data-mini-route="wechat"] .w-voice-name{display:flex!important;align-items:flex-end!important;gap:8px!important;flex-wrap:nowrap!important;white-space:nowrap!important;overflow:hidden!important}
    [data-mini-route="wechat"] .w-voice-name-cn{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
    [data-mini-route="wechat"] .w-voice-name-en{flex:0 0 auto!important;font-size:18px!important;font-weight:900!important;letter-spacing:.04em!important;white-space:nowrap!important}
    [data-mini-route="wechat"] .w-voice-sub{letter-spacing:.08em!important;line-height:1.3!important}
    [data-mini-route="wechat"] .w-voice-tags{display:flex!important;flex-wrap:nowrap!important;align-items:center!important;gap:8px!important;overflow:hidden!important}
    [data-mini-route="wechat"] .w-voice-tag{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:48px!important;padding:5px 7px!important;font-size:10px!important;font-weight:700!important;line-height:1!important;white-space:nowrap!important}
    [data-mini-route="wechat"] .timestamp{margin:4px 0 -2px!important;font-size:11px!important;line-height:1.4!important}
    [data-mini-route="novel"] .screen-container[data-mini-route-scale-mode="viewport-fill-bottom-offset"] .page{min-width:calc(100vw / var(--mini-route-scale-current))!important;width:calc(100vw / var(--mini-route-scale-current))!important}
    .mini-preset-panel{display:none;flex-direction:column;gap:10px;padding:12px 0 4px;border-bottom:1px solid rgba(0,0,0,.06)}
    .mini-preset-panel.open{display:flex}
    .mini-preset-list{display:flex;flex-direction:column;gap:8px}
    .mini-preset-item{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border:1px solid rgba(0,0,0,.06);border-radius:14px;background:#faf7f8;color:#111;cursor:pointer;text-align:left;font:inherit}
    .mini-preset-item:active{transform:scale(.98)}
    .mini-preset-item.active{background:#fff;border-color:#111;box-shadow:0 10px 24px rgba(0,0,0,.06)}
    .mini-preset-copy{min-width:0;display:flex;flex-direction:column;gap:4px}
    .mini-preset-name{font-size:13px;font-weight:800;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mini-preset-meta{font-size:11px;font-weight:600;color:#777;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mini-preset-empty{padding:12px 14px;border-radius:14px;background:#f7f4f5;color:#888;font-size:12px;line-height:1.6}
    .mini-preset-current{display:inline-flex;align-items:center;max-width:132px;padding:4px 9px;border-radius:999px;background:#f3eaed;color:#555;font-size:10px;font-weight:800;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mini-preset-current.is-empty{background:transparent;padding:0;color:#999}
    .mini-empty-state{padding:26px 20px;color:#aaa;font-size:12px;font-weight:600;line-height:1.8;text-align:center}
    .mini-chat-empty{padding:28px 20px;color:#aaa;font-size:12px;font-weight:600;line-height:1.8;text-align:center}
    .mini-wechat-launcher.modal-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(250,249,248,.95);display:none;justify-content:center;align-items:center;z-index:9999;opacity:0;transition:opacity .2s ease}
    .mini-wechat-launcher.modal-overlay.show{display:flex;opacity:1}
    .mini-wechat-launcher .modal-box{background:#fff;border:1px solid rgba(0,0,0,.04);box-shadow:0 20px 50px rgba(0,0,0,.05);border-radius:24px;padding:30px 25px;width:85%;max-width:320px;display:flex;flex-direction:column;gap:15px;margin:auto}
    .mini-wechat-launcher .modal-header{text-align:center;font-size:16px;font-weight:900;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;color:#111}
    .mini-wechat-launcher-shortcuts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
    .mini-wechat-launcher-shortcut{min-width:0;padding:14px 10px;border:1px solid rgba(0,0,0,.05);border-radius:16px;background:#faf7f8;color:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;text-align:center;transition:transform .1s,background .18s ease,border-color .18s ease,box-shadow .18s ease}
    .mini-wechat-launcher-shortcut:active{transform:scale(.97)}
    .mini-wechat-launcher-shortcut.is-active{background:#111;color:#fff;border-color:#111;box-shadow:0 10px 24px rgba(0,0,0,.12)}
    .mini-wechat-launcher-shortcut-title{font-size:11px;font-weight:900;letter-spacing:.08em;line-height:1.2;text-transform:uppercase}
    .mini-wechat-launcher-shortcut-sub{font-size:10px;font-weight:700;line-height:1.2;opacity:.68;text-transform:uppercase}
    .mini-wechat-launcher-section-label{font-size:11px;font-weight:900;letter-spacing:.12em;line-height:1.2;color:#777;text-transform:uppercase}
    .mini-wechat-launcher-list{display:flex;flex-direction:column;gap:10px;max-height:320px;overflow-y:auto}
    .mini-wechat-launcher-item{display:flex;align-items:center;gap:12px;width:100%;padding:14px 16px;border:1px solid rgba(0,0,0,.04);border-radius:14px;background:#fff;color:#111;cursor:pointer;text-align:left;transition:transform .1s}
    .mini-wechat-launcher-item:active{transform:scale(.97)}
    .mini-wechat-launcher-avatar{width:42px;height:42px;border-radius:12px;flex:0 0 auto;background:#eee}
    .mini-wechat-launcher-copy{min-width:0;display:flex;flex-direction:column;gap:4px;flex:1}
    .mini-wechat-launcher-name{font-size:13px;font-weight:800;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mini-wechat-launcher-meta{font-size:11px;font-weight:600;color:#777;line-height:1.5}
    .mini-wechat-launcher .btn-row{display:flex;gap:12px}
    .mini-wechat-launcher .btn-flat{flex:1;padding:16px;border-radius:16px;border:none;font-size:14px;font-weight:800;letter-spacing:1px;cursor:pointer;transition:transform .1s}
    .mini-wechat-launcher .btn-flat:active{transform:scale(.97)}
    .mini-wechat-launcher .btn-primary{background:#1a1a1a;color:#fff;box-shadow:0 8px 20px rgba(0,0,0,.1)}
    .mini-wechat-launcher .btn-secondary{background:#fff;color:#111;border:1px solid rgba(0,0,0,.05)}
    [data-mini-route="desktop"] .screen-container{position:relative!important;width:100%!important;height:calc(100% - var(--desktop-dock-reserve,103px))!important;min-height:0!important}
    [data-mini-route="desktop"] .page{position:relative!important;padding:var(--desktop-page-top,20px) var(--desktop-page-inline,15px) calc(var(--desktop-page-bottom,24px) + env(safe-area-inset-bottom))!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior-y:contain!important;touch-action:pan-x pan-y!important}
    [data-mini-route="desktop"].mini-desktop-layer-ready .apps-area{visibility:hidden!important;opacity:0!important;pointer-events:none!important;flex:0 0 0!important;min-height:0!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}
    [data-mini-route="desktop"] .app-grid{display:grid!important;flex:0 0 auto!important;height:auto!important;min-height:0!important;overflow:visible!important;align-content:start!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-template-rows:none!important;grid-auto-rows:minmax(88px,auto)!important;row-gap:8px!important}
    [data-mini-route="desktop"] .mini-desktop-icon-layer{position:absolute!important;left:var(--desktop-page-inline,15px)!important;right:var(--desktop-page-inline,15px)!important;top:var(--desktop-page-top,20px)!important;bottom:calc(var(--desktop-page-bottom,24px) + env(safe-area-inset-bottom))!important;display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-template-rows:repeat(10,minmax(0,1fr))!important;column-gap:6px!important;row-gap:8px!important;pointer-events:none!important;z-index:24!important}
    [data-mini-route="desktop"] [data-mini-desktop-draggable="1"]{position:relative!important;touch-action:pan-x!important;user-select:none!important;-webkit-user-select:none!important;-webkit-user-drag:none!important;cursor:grab!important;transform-origin:center center;transition:transform .18s ease,box-shadow .18s ease,opacity .18s ease!important}
    [data-mini-route="desktop"] [data-mini-desktop-draggable="1"] *{user-select:none!important;-webkit-user-select:none!important;-webkit-user-drag:none!important}
    [data-mini-route="desktop"] .widgets-area{width:100%!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-auto-flow:row dense!important;grid-auto-rows:8px!important;align-items:start!important;align-content:start!important;gap:20px!important}
    [data-mini-route="desktop"] .widgets-area:empty{display:none!important}
    [data-mini-route="desktop"] .widgets-area>[data-mini-desktop-widget="1"]{width:100%!important;min-width:0!important}
    [data-mini-route="desktop"] .widgets-area>[data-mini-desktop-widget="1"].w-88,[data-mini-route="desktop"] .widgets-area>[data-mini-desktop-widget="1"].w-90,[data-mini-route="desktop"] .widgets-area>[data-mini-desktop-widget="1"].w-14{grid-column:1 / -1!important}
    [data-mini-route="desktop"] .widgets-area>[data-mini-desktop-widget="1"].w-31,[data-mini-route="desktop"] .widgets-area>[data-mini-desktop-widget="1"].w-6,[data-mini-route="desktop"] .widgets-area>[data-mini-desktop-widget="1"].w-33{grid-column:span 1!important}
    [data-mini-route="desktop"] .widgets-area-below{width:100%!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-auto-flow:row dense!important;grid-auto-rows:8px!important;align-items:start!important;align-content:start!important;gap:20px!important;margin-top:18px!important;flex:0 0 auto!important}
    [data-mini-route="desktop"] .widgets-area-below:empty{display:none!important;margin-top:0!important}
    [data-mini-route="desktop"] [data-mini-desktop-widget="1"].w-31{width:100%!important;max-width:none!important;min-width:0!important;height:auto!important;min-height:0!important;aspect-ratio:1!important;overflow:hidden!important;justify-self:stretch!important;align-self:start!important;margin:0!important}
    [data-mini-route="desktop"] [data-mini-desktop-widget="1"].w-33{width:min(100%,320px)!important;max-width:100%!important;min-width:0!important;margin-inline:auto!important;justify-self:stretch!important;align-self:start!important}
    [data-mini-route="desktop"] .widgets-area-p2{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-auto-flow:row dense!important;grid-auto-rows:8px!important;align-items:start!important;gap:20px!important;align-content:start!important}
    [data-mini-route="desktop"] .widgets-area-p2>[data-mini-desktop-widget="1"].w-31{width:100%!important;max-width:none!important}
    [data-mini-route="desktop"] .widgets-area-p2>[data-mini-desktop-widget="1"].w-6{width:100%!important;height:auto!important;min-height:124px!important}
    [data-mini-route="desktop"] .widgets-area-below>[data-mini-desktop-widget="1"].w-31{width:100%!important;max-width:none!important}
    [data-mini-route="desktop"] .widgets-area-below>[data-mini-desktop-widget="1"].w-6{width:100%!important;height:auto!important;min-height:124px!important}
    [data-mini-route="desktop"] .mini-desktop-icon-layer>.app-item[data-mini-desktop-icon="1"]{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;justify-self:center!important;align-self:start!important;width:min(78px,100%)!important;height:auto!important;min-width:0!important;max-width:78px!important;padding-inline:4px!important;margin:0!important;overflow:hidden!important;pointer-events:auto!important;z-index:2!important}
    [data-mini-route="desktop"] .mini-desktop-icon-layer>[data-mini-desktop-widget="1"]{width:100%!important;max-width:none!important;min-width:0!important;justify-self:stretch!important;align-self:start!important;pointer-events:auto!important;z-index:3!important;margin:0!important}
    [data-mini-route="desktop"] .mini-desktop-icon-layer>[data-mini-desktop-widget="1"].w-33{width:100%!important;max-width:none!important;margin-inline:0!important}
    [data-mini-route="desktop"] .mini-desktop-icon-layer>[data-mini-desktop-widget="1"].w-31,[data-mini-route="desktop"] .mini-desktop-icon-layer>[data-mini-desktop-widget="1"].w-6{width:100%!important;max-width:none!important}
    [data-mini-route="desktop"] .mini-desktop-sort-mode [data-mini-desktop-draggable="1"],[data-mini-route="desktop"] [data-mini-desktop-draggable="1"].mini-desktop-dragging{touch-action:none!important}
    [data-mini-route="desktop"] .mini-desktop-sort-mode [data-mini-desktop-draggable="1"]{animation:none!important}
    [data-mini-route="desktop"] [data-mini-desktop-draggable="1"].mini-desktop-dragging{cursor:grabbing!important;z-index:4!important;opacity:.14!important;box-shadow:none!important;animation:none!important;transform:none!important}
    [data-mini-route="desktop"] .mini-desktop-icon-layer>.app-item[data-mini-desktop-icon="1"].mini-desktop-dragging{opacity:.1!important;box-shadow:none!important;filter:none!important}
    [data-mini-route="desktop"] .mini-desktop-drag-ghost{position:fixed!important;z-index:220!important;pointer-events:none!important;cursor:grabbing!important;opacity:.98!important;box-shadow:0 18px 36px rgba(0,0,0,.14)!important;animation:none!important;transform:none!important;transform-origin:center center!important;will-change:left,top,transform!important}
    [data-mini-route="desktop"] .mini-desktop-drag-ghost *{pointer-events:none!important}
    [data-mini-route="desktop"] .mini-desktop-drag-ghost[data-mini-kind="icon"]{box-shadow:none!important}
    [data-mini-route="desktop"] .mini-desktop-icon-layer>.app-item[data-mini-desktop-icon="1"] .app-icon{flex:0 0 auto;pointer-events:none;transition:transform .18s ease,filter .18s ease!important}
    [data-mini-route="desktop"] .mini-desktop-icon-layer>.app-item[data-mini-desktop-icon="1"].mini-desktop-dragging .app-icon{filter:none!important;box-shadow:none!important}
    [data-mini-route="desktop"] .mini-desktop-icon-layer>.app-item[data-mini-desktop-icon="1"] .app-name{display:block!important;width:100%;max-width:100%;min-height:1.2em!important;overflow:hidden;text-overflow:ellipsis;white-space:nowrap!important;text-align:center;line-height:1.2;padding-inline:2px;font-size:10px!important;pointer-events:none}
    [data-mini-route="desktop"] .mini-desktop-page-indicator{position:fixed;left:50%;bottom:var(--desktop-page-indicator-bottom,96px);z-index:160;display:flex;align-items:center;gap:8px;transform:translateX(-50%);padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.72);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 10px 25px rgba(0,0,0,.08)}
    [data-mini-route="desktop"] .mini-desktop-page-dot{width:8px;height:8px;border:0;border-radius:999px;background:rgba(17,17,17,.25);padding:0;cursor:pointer;transition:width .18s ease,background .18s ease,transform .18s ease}
    [data-mini-route="desktop"] .mini-desktop-page-dot.active{width:22px;background:#111}
    [data-mini-route="desktop"] .mini-desktop-page-hint{position:fixed;top:50%;z-index:170;max-width:140px;padding:10px 14px;border-radius:16px;background:rgba(17,17,17,.86);color:#fff;font-size:12px;font-weight:800;letter-spacing:.04em;opacity:0;pointer-events:none;transform:translateY(-50%) scale(.96);transition:opacity .18s ease,transform .18s ease}
    [data-mini-route="desktop"] .mini-desktop-page-hint.show{opacity:1;transform:translateY(-50%) scale(1)}
    [data-mini-route="desktop"] .mini-desktop-page-hint.is-left{left:16px}
    [data-mini-route="desktop"] .mini-desktop-page-hint.is-right{right:16px}
    @keyframes mini-desktop-jiggle{0%{transform:translate3d(0,0,0) rotate(-1deg)}100%{transform:translate3d(0,-1px,0) rotate(1deg)}}
    @keyframes mini-desktop-drag-jiggle{0%{transform:scale(1.04) rotate(-2deg)}100%{transform:scale(1.04) rotate(2deg)}}
    [data-mini-route="settings"] .nav-bar,[data-mini-route="settings_api"] .nav-bar,[data-mini-route="theme"] .nav-bar,[data-mini-route="theme_fonts"] .nav-bar{height:calc(60px + env(safe-area-inset-top))!important;min-height:calc(60px + env(safe-area-inset-top))!important;padding-top:env(safe-area-inset-top)!important;align-items:center!important}
    [data-mini-route="settings"] .settings-content,[data-mini-route="settings_api"] .settings-container,[data-mini-route="theme"] .view-section{margin-top:calc(60px + env(safe-area-inset-top))!important;padding-top:16px!important}
    [data-mini-route="theme_fonts"] .settings-container{padding-top:16px!important}
    @media (max-height:700px){[data-mini-route="desktop"] .widgets-area,[data-mini-route="desktop"] .widgets-area-p2,[data-mini-route="desktop"] .widgets-area-below{gap:14px!important}[data-mini-route="desktop"] .w-88{height:122px!important;padding:14px 18px!important}[data-mini-route="desktop"] .w-90{min-height:176px!important}[data-mini-route="desktop"] .w-6{min-height:112px!important;height:auto!important;gap:8px!important;padding:8px 6px!important}[data-mini-route="desktop"] .mini-desktop-icon-layer{top:calc(var(--desktop-page-top,20px) - 4px)!important;bottom:calc(var(--desktop-page-bottom,24px) - 6px + env(safe-area-inset-bottom))!important}}
    @media (max-width:430px){[data-mini-route="desktop"] .widgets-area-p2>[data-mini-desktop-widget="1"].w-6,[data-mini-route="desktop"] .widgets-area-below>[data-mini-desktop-widget="1"].w-6{min-height:154px!important}}
    @media (pointer:fine){.nav-bar,.nav-header,.chat-header{min-height:60px!important;height:60px!important;padding-top:0!important;align-items:center!important}.view-section{margin-top:60px!important;height:calc(100vh - 60px)!important}.settings-container{padding-top:18px!important}.chat-detail-layer .scroll-container{height:calc(100vh - 60px - 56px)!important}}
  `;

  function injectedRuntime(route, contactsSeed, eventsSeed, iconNames, oldIconMap) {
    const routeName = route;
    const themeDbName = 'UIDesignDB';
    const themeDbVersion = 3;
    const themeStores = ['placeholders', 'texts', 'settings'];
    const desktopLayoutStorageKey = 'mini.desktop.layout.v5';
    const legacyDesktopLayoutStorageKeys = ['mini.desktop.icon.layout.v2', 'mini.desktop.icon.layout.v1'];
    const desktopGridColumns = 4;
    const desktopGridRows = 10;
    const desktopDragStartThreshold = 6;
    const desktopLongPressDelay = 260;
    const desktopLongPressMoveTolerance = 10;
    const desktopPageEdgeThreshold = 52;
    const desktopPageTurnDelay = 360;
    const desktopWidgetRegionSplitRatio = 0.5;
    const themeWidgetSelectors = ['.w-88', '.w-90', '.w-6', '.w-31', '.w-33', '.w-14'];
    const desktopLayoutState = routeName === 'desktop'
      ? {
          prepared: false,
          hydrated: false,
          saveAfterHydrateQueued: false,
          clickGuardInstalled: false,
          resizeBound: false,
          scrollBound: false,
          listenersAttached: false,
          pagerReady: false,
          pages: [],
          icons: [],
          widgets: [],
          items: [],
          active: null,
          saveTimer: 0,
          pageTurnTimer: 0,
          pageTurnTarget: null,
          currentPageIndex: 0,
          lastSerialized: '',
          persistedLayout: null,
          hydratePromise: null
        }
      : null;

    try {
      document.documentElement.dataset.miniRoute = routeName;
      if (document.body) document.body.dataset.miniRoute = routeName;
    } catch (error) {}

    function onReady(fn) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
      else fn();
    }

    function getThemeOps() {
      if (!window.MiniDB) return null;
      return (window.MiniDB.ops && window.MiniDB.ops.theme)
        || (window.MiniDB.modules && window.MiniDB.modules.theme)
        || null;
    }

    function readLegacyDesktopLayout() {
      if (!window.localStorage) return null;
      try {
        const raw = [desktopLayoutStorageKey].concat(legacyDesktopLayoutStorageKeys)
          .map((key) => window.localStorage.getItem(key))
          .find((value) => value);
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        return null;
      }
    }

    function clearLegacyDesktopLayout() {
      if (!window.localStorage) return;
      try {
        legacyDesktopLayoutStorageKeys.forEach((key) => {
          window.localStorage.removeItem(key);
        });
      } catch (error) {}
    }

    function readDesktopLayout() {
      if (!desktopLayoutState || !desktopLayoutState.persistedLayout) return null;
      try {
        return JSON.parse(JSON.stringify(desktopLayoutState.persistedLayout));
      } catch (error) {
        return desktopLayoutState.persistedLayout;
      }
    }

    async function hydrateDesktopLayout() {
      if (!desktopLayoutState) return null;
      if (desktopLayoutState.hydratePromise) return desktopLayoutState.hydratePromise;

      desktopLayoutState.hydratePromise = (async () => {
        let layout = null;
        const themeOps = getThemeOps();

        if (themeOps && typeof themeOps.getSetting === 'function') {
          try {
            layout = await themeOps.getSetting(desktopLayoutStorageKey);
          } catch (error) {}
        }

        if (!layout) {
          layout = readLegacyDesktopLayout();
          if (layout && themeOps && typeof themeOps.setSetting === 'function') {
            try {
              await themeOps.setSetting(desktopLayoutStorageKey, layout);
            } catch (error) {}
          }
        }

        clearLegacyDesktopLayout();
        desktopLayoutState.persistedLayout = layout && typeof layout === 'object' ? layout : null;
        desktopLayoutState.lastSerialized = JSON.stringify(desktopLayoutState.persistedLayout || {});
        desktopLayoutState.hydrated = true;
        if (window.localStorage && desktopLayoutState.persistedLayout) {
          try {
            window.localStorage.setItem(desktopLayoutStorageKey, desktopLayoutState.lastSerialized);
          } catch (error) {}
        }
        return readDesktopLayout();
      })();

      return desktopLayoutState.hydratePromise;
    }

    function writeDesktopLayout(layout) {
      if (!desktopLayoutState || !desktopLayoutState.hydrated) return;
      try {
        const nextLayout = layout && typeof layout === 'object' ? JSON.parse(JSON.stringify(layout)) : {};
        const serialized = JSON.stringify(nextLayout);
        if (serialized === desktopLayoutState.lastSerialized) return;
        desktopLayoutState.persistedLayout = nextLayout;
        desktopLayoutState.lastSerialized = serialized;
        clearLegacyDesktopLayout();
        if (window.localStorage) {
          try {
            window.localStorage.setItem(desktopLayoutStorageKey, serialized);
          } catch (error) {}
        }
        const themeOps = getThemeOps();
        if (themeOps && typeof themeOps.setSetting === 'function') {
          Promise.resolve(themeOps.setSetting(desktopLayoutStorageKey, nextLayout)).catch(() => {});
        }
      } catch (error) {}
    }

    function getDesktopSwapTargets() {
      if (!desktopLayoutState) return { contactMeta: null, coupleMeta: null };
      const fallbackTitle = '\u672a\u547d\u540d\u6761\u76ee';
      return {
        contactMeta: desktopLayoutState.icons.find((meta) => meta.item.matches('.p2-contact')) || null,
        coupleMeta: desktopLayoutState.icons.find((meta) => meta.item.matches('.p1-couple')) || null
      };
    }

    function applyDesktopIconOverrides() {
      if (routeName !== 'desktop') return;
      document.querySelectorAll('.p1-info .app-name').forEach((node) => {
        node.textContent = '\u5360\u4f4d24';
      });
      document.querySelectorAll('.p2-contact .app-name').forEach((node) => {
        node.textContent = '\u8054\u7cfb\u4eba';
      });
      document.querySelectorAll('.p1-couple .app-name').forEach((node) => {
        node.textContent = '\u60c5\u4fa3\u7a7a\u95f4';
      });
      document.querySelectorAll('.dock-message .app-name').forEach((node) => {
        node.textContent = 'MESSAGE';
      });
      document.querySelectorAll('.dock-worldbook .app-name').forEach((node) => {
        node.textContent = 'WORLDBOOK';
      });
      document.querySelectorAll('.dock-theme .app-name').forEach((node) => {
        node.textContent = 'THEME';
      });
      document.querySelectorAll('.dock-settings .app-name').forEach((node) => {
        node.textContent = 'SETTINGS';
      });
      const monthLabel = document.getElementById('dynamic-month-year');
      if (monthLabel) {
        monthLabel.textContent = String(monthLabel.textContent || '')
          .replace(/[^A-Za-z0-9 ]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    }

    function migrateDesktopSwapLayout(layout) {
      if (!layout || typeof layout !== 'object') return layout;
      let changed = false;
      const nextLayout = JSON.parse(JSON.stringify(layout));

      const normalizeLegacyRow = (iconIds, pageIndex, fromSlots, toSlots) => {
        const matchesLegacyPattern = iconIds.every((id, index) => {
          const entry = nextLayout[id];
          return entry
            && entry.kind === 'icon'
            && Number(entry.page) === pageIndex
            && Number(entry.slot) === fromSlots[index];
        });
        if (!matchesLegacyPattern) return;

        const occupied = new Set(
          Object.entries(nextLayout)
            .filter(([id, entry]) => (
              !iconIds.includes(id)
              && entry
              && entry.kind === 'icon'
              && Number(entry.page) === pageIndex
              && Number.isInteger(Number(entry.slot))
            ))
            .map(([, entry]) => Number(entry.slot))
        );

        if (toSlots.some((slot) => occupied.has(slot))) return;

        iconIds.forEach((id, index) => {
          nextLayout[id].slot = toSlots[index];
        });
        changed = true;
      };

      // Fix the older slot-metric bug that serialized the visual second row as row 3.
      normalizeLegacyRow(['icon-4', 'icon-5', 'icon-6', 'icon-7'], 0, [8, 9, 10, 11], [4, 5, 6, 7]);
      normalizeLegacyRow(['icon-12'], 1, [8], [4]);

      if (changed) writeDesktopLayout(nextLayout);
      return changed ? nextLayout : layout;
    }

    function upsertStyle(id, css) {
      let style = document.getElementById(id);
      if (!style) {
        style = document.createElement('style');
        style.id = id;
        document.head.appendChild(style);
      }
      style.textContent = css || '';
    }

    function cleanCssUrl(value) {
      return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '');
    }

    function ensureThemeStores(db) {
      themeStores.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
      });
    }

    function readRecord(dbName, storeName, key) {
      return new Promise((resolve) => {
        if (!window.indexedDB) return resolve(null);
        let settled = false;
        function finish(value) {
          if (!settled) {
            settled = true;
            resolve(value || null);
          }
        }
        const openKnownSchema = dbName === themeDbName;
        const req = openKnownSchema ? indexedDB.open(dbName, themeDbVersion) : indexedDB.open(dbName);
        req.onerror = () => finish(null);
        req.onblocked = () => finish(null);
        req.onupgradeneeded = () => {
          if (openKnownSchema) ensureThemeStores(req.result);
        };
        req.onsuccess = () => {
          const db = req.result;
          db.onversionchange = () => {
            try { db.close(); } catch (error) {}
          };
          if (!db.objectStoreNames.contains(storeName)) {
            db.close();
            finish(null);
            return;
          }
          try {
            const tx = db.transaction(storeName, 'readonly');
            const getReq = tx.objectStore(storeName).get(key);
            getReq.onsuccess = () => finish(getReq.result || null);
            getReq.onerror = () => finish(null);
            tx.oncomplete = () => db.close();
            tx.onerror = () => {
              try { db.close(); } catch (error) {}
              finish(null);
            };
          } catch (error) {
            try { db.close(); } catch (closeError) {}
            finish(null);
          }
        };
      });
    }

    async function getSetting(id) {
      if (window.MiniDB && window.MiniDB.ops && window.MiniDB.ops.theme) {
        return window.MiniDB.ops.theme.getSetting(id);
      }
      const record = await readRecord(themeDbName, 'settings', id);
      return record && record.value != null ? record.value : null;
    }

    async function setSetting(id, value) {
      if (window.MiniDB && window.MiniDB.ops && window.MiniDB.ops.theme) {
        return window.MiniDB.ops.theme.setSetting(id, value);
      }
      return new Promise((resolve) => {
        if (!window.indexedDB) return resolve(null);
        let settled = false;
        function finish(result) {
          if (!settled) {
            settled = true;
            resolve(result || null);
          }
        }
        const req = indexedDB.open(themeDbName, themeDbVersion);
        req.onerror = () => finish(null);
        req.onblocked = () => finish(null);
        req.onupgradeneeded = () => {
          ensureThemeStores(req.result);
        };
        req.onsuccess = () => {
          const db = req.result;
          db.onversionchange = () => {
            try { db.close(); } catch (error) {}
          };
          if (!db.objectStoreNames.contains('settings')) {
            db.close();
            finish(null);
            return;
          }
          try {
            const tx = db.transaction('settings', 'readwrite');
            const request = tx.objectStore('settings').put({ id, value });
            request.onsuccess = () => finish(value);
            request.onerror = () => finish(null);
            tx.oncomplete = () => {
              try { db.close(); } catch (error) {}
            };
            tx.onerror = () => {
              try { db.close(); } catch (error) {}
              finish(null);
            };
          } catch (error) {
            try { db.close(); } catch (closeError) {}
            finish(null);
          }
        };
      });
    }

    async function getPlaceholder(id) {
      if (window.MiniDB && window.MiniDB.ops && window.MiniDB.ops.theme) {
        return window.MiniDB.ops.theme.getPlaceholder(id);
      }
      const record = await readRecord(themeDbName, 'placeholders', id);
      return record && record.dataUrl ? record.dataUrl : null;
    }

    function setBackground(el, url) {
      if (!el || !url) return;
      el.style.backgroundImage = `url("${cleanCssUrl(url)}")`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.style.backgroundRepeat = 'no-repeat';
    }

    function clearBackground(el) {
      if (!el) return;
      el.style.backgroundImage = 'none';
      el.style.backgroundSize = '';
      el.style.backgroundPosition = '';
      el.style.backgroundRepeat = '';
    }

    function resetRouteScale() {
      document.documentElement.style.zoom = '';
      document.documentElement.style.removeProperty('--mini-route-scale');
      const root = document.getElementById('mini-route-scale-root');
      if (!root) return;
      root.style.transformOrigin = '';
      root.style.transform = '';
      root.style.width = '';
      root.style.height = '';
    }

    function shouldStayOutsideRouteScaleRoot(node) {
      if (!node || node.nodeType !== 1) return true;
      if (node.id === 'mini-route-scale-root' || node.id === 'mini-system-toast') return true;
      return node.matches('.toast-banner,.nav-bar,.dock-bar,.dock-wrapper,.modal-overlay,.ins-modal-overlay,.sheet-overlay,.chat-detail-layer,.page-layer,.voice-card-overlay,.mini-desktop-drag-ghost,.mini-wechat-quickbar,[data-mini-floating-layer="1"]');
    }

    function ensureRouteScaleRoot() {
      let root = document.getElementById('mini-route-scale-root');
      if (root) return root;
      if (!document.body) return null;

      root = document.createElement('div');
      root.id = 'mini-route-scale-root';
      root.dataset.miniRouteScaleRoot = '1';
      root.style.position = 'relative';
      root.style.width = '100%';
      root.style.minWidth = '100%';
      root.style.height = '100%';
      root.style.minHeight = '100%';

      const bodyStyles = window.getComputedStyle(document.body);
      if (bodyStyles.display === 'flex' || bodyStyles.display === 'inline-flex') {
        root.style.display = bodyStyles.display;
        root.style.flex = '0 0 auto';
        root.style.alignSelf = 'flex-start';
        root.style.flexDirection = bodyStyles.flexDirection;
        root.style.justifyContent = bodyStyles.justifyContent;
        root.style.alignItems = bodyStyles.alignItems;
        root.style.alignContent = bodyStyles.alignContent;
        root.style.flexWrap = bodyStyles.flexWrap;
        root.style.gap = bodyStyles.gap;
      }

      document.body.insertBefore(root, document.body.firstChild);
      Array.from(document.body.children).forEach((child) => {
        if (child === root || shouldStayOutsideRouteScaleRoot(child)) return;
        root.appendChild(child);
      });
      return root;
    }

    function tagRouteScaleNode(node, mode, options = {}) {
      if (!node || node.nodeType !== 1) return null;
      node.dataset.miniRouteScaleMode = mode;
      if (options.bottomOffset != null) {
        node.style.setProperty('--mini-route-scale-bottom-offset', `${Math.max(0, Number(options.bottomOffset) || 0)}px`);
      } else {
        node.style.removeProperty('--mini-route-scale-bottom-offset');
      }
      return node;
    }

    function configureScaleShell(shell, container) {
      if (!shell || !container) return;
      shell.style.position = 'relative';
      shell.style.minWidth = '0';
      shell.style.minHeight = '0';
      shell.style.width = '100%';
      shell.style.height = '100%';

      const containerStyles = window.getComputedStyle(container);
      if (containerStyles.display === 'flex' || containerStyles.display === 'inline-flex') {
        shell.style.display = 'flex';
        shell.style.flex = '1 1 auto';
        shell.style.flexDirection = containerStyles.flexDirection;
        shell.style.justifyContent = containerStyles.justifyContent;
        shell.style.alignItems = containerStyles.alignItems;
        shell.style.alignContent = containerStyles.alignContent;
        shell.style.flexWrap = containerStyles.flexWrap;
        shell.style.gap = containerStyles.gap;
      } else {
        shell.style.display = 'block';
      }
    }

    function ensureScaleShell(container, excludeSelector) {
      if (!container || container.nodeType !== 1) return null;
      let shell = Array.from(container.children).find((child) => child.dataset && child.dataset.miniScaleShell === '1');
      if (!shell) {
        shell = document.createElement('div');
        shell.dataset.miniScaleShell = '1';
        container.insertBefore(shell, container.firstChild);
      }
      configureScaleShell(shell, container);
      Array.from(container.children).forEach((child) => {
        if (child === shell) return;
        if (excludeSelector && child.matches && child.matches(excludeSelector)) return;
        shell.appendChild(child);
      });
      return shell;
    }

    function applyTargetedRouteScale(scale) {
      document.documentElement.style.setProperty('--mini-route-scale', String(scale));

      if (routeName === 'contacts') {
        document.querySelectorAll('.view-container').forEach((container) => {
          tagRouteScaleNode(ensureScaleShell(container, '.fab-btn'), 'viewport-shell');
        });
        document.querySelectorAll('.dock-bar').forEach((node) => tagRouteScaleNode(node, 'width-bottom-left'));
        document.querySelectorAll('.fab-btn').forEach((node) => tagRouteScaleNode(node, 'fixed-bottom-right'));
        document.querySelectorAll('.modal-overlay').forEach((node) => tagRouteScaleNode(node, 'viewport-fill'));
        return true;
      }

      if (routeName === 'anniversary') {
        document.querySelectorAll('.page-container').forEach((container) => {
          tagRouteScaleNode(ensureScaleShell(container, '.dock-bar'), 'viewport-shell');
        });
        document.querySelectorAll('.dock-bar').forEach((node) => tagRouteScaleNode(node, 'width-bottom-left'));
        document.querySelectorAll('.modal-overlay').forEach((node) => tagRouteScaleNode(node, 'viewport-fill'));
        return true;
      }

      if (routeName === 'novel') {
        document.querySelectorAll('.screen-container').forEach((node) => tagRouteScaleNode(node, 'viewport-fill-bottom-offset', { bottomOffset: 80 }));
        document.querySelectorAll('.dock').forEach((node) => tagRouteScaleNode(node, 'width-bottom-left'));
        document.querySelectorAll('.ins-modal-overlay').forEach((node) => tagRouteScaleNode(node, 'viewport-fill'));
        return true;
      }

      if (routeName === 'worldbook') {
        document.querySelectorAll('.view-container').forEach((container) => {
          tagRouteScaleNode(ensureScaleShell(container, '.fab-btn'), 'viewport-shell');
        });
        document.querySelectorAll('.fab-btn').forEach((node) => tagRouteScaleNode(node, 'fixed-bottom-right'));
        document.querySelectorAll('.modal-overlay').forEach((node) => tagRouteScaleNode(node, 'viewport-fill'));
        return true;
      }

      if (routeName === 'wechat') {
        document.querySelectorAll('.page-container').forEach((container) => {
          tagRouteScaleNode(ensureScaleShell(container), 'viewport-shell');
        });
        document.querySelectorAll('.chat-detail-layer,.page-layer').forEach((container) => {
          tagRouteScaleNode(ensureScaleShell(container), 'viewport-shell');
        });
        document.querySelectorAll('.dock-wrapper').forEach((node) => tagRouteScaleNode(node, 'fixed-bottom-center-translate'));
        document.querySelectorAll('.ins-modal-overlay,.voice-card-overlay').forEach((node) => tagRouteScaleNode(node, 'viewport-fill'));
        return true;
      }

      if (routeName === 'wechat_masks') {
        document.querySelectorAll('.page-container').forEach((container) => {
          tagRouteScaleNode(ensureScaleShell(container), 'viewport-shell');
        });
        return true;
      }

      if (routeName === 'settings') {
        document.querySelectorAll('.nav-bar,.settings-content').forEach((node) => tagRouteScaleNode(node, 'width-top-left'));
        return true;
      }

      if (routeName === 'settings_api') {
        document.querySelectorAll('.nav-bar,.settings-container').forEach((node) => tagRouteScaleNode(node, 'width-top-left'));
        return true;
      }

      if (routeName === 'theme') {
        document.querySelectorAll('.nav-bar,.view-section').forEach((node) => tagRouteScaleNode(node, 'width-top-left'));
        return true;
      }

      return false;
    }

    function applyRouteScale(scale) {
      resetRouteScale();
      if (routeName === 'desktop' || routeName === 'theme_fonts' || scale === 1) return;
      if (applyTargetedRouteScale(scale)) return;
      const root = ensureRouteScaleRoot();
      if (!root) return;
      root.style.transformOrigin = 'top left';
      root.style.transform = `scale(${scale})`;
      root.style.width = `${100 / scale}vw`;
      root.style.height = `${100 / scale}vh`;
    }

    function getDesktopThemeIconTargets() {
      return desktopThemeIconSelectors.map((selector) => {
        const item = document.querySelector(selector);
        return item && item.classList && item.classList.contains('app-item') ? item : null;
      });
    }

    async function applyThemeSettings() {
      const [customCss, customFont, uiScale, iconRadius, iconSize, widgetRadius, desktopBg] = await Promise.all([
        getSetting('custom-dev-css'),
        getSetting('custom_font'),
        getSetting('ui_scale'),
        getSetting('icon_radius'),
        getSetting('icon_size'),
        getSetting('widget_radius'),
        getPlaceholder('bg-desktop')
      ]);

      if (customCss) upsertStyle('mini-custom-dev-css', customCss);
      if (customFont) {
        const fontUrl = cleanCssUrl(customFont);
        upsertStyle('mini-custom-font', `@font-face{font-family:"MiniCustomFont";src:url("${fontUrl}")}html,body,body *{font-family:"MiniCustomFont",Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif!important}`);
      } else {
        upsertStyle('mini-custom-font', '');
      }

      const scale = Math.max(0.5, Math.min(1.5, Number(uiScale) / 100 || 1));
      applyRouteScale(scale);
      upsertStyle(
        'mini-desktop-layout-guard',
        routeName === 'desktop'
          ? [
              '.page{position:relative!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior-y:contain!important;touch-action:pan-x pan-y!important}',
              'body[data-mini-route="desktop"].mini-desktop-layer-ready .apps-area{visibility:hidden!important;opacity:0!important;pointer-events:none!important;flex:0 0 0!important;min-height:0!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}',
              '.mini-desktop-icon-layer{position:absolute!important;left:15px!important;right:15px!important;top:20px!important;bottom:24px!important;display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-template-rows:repeat(10,minmax(0,1fr))!important;column-gap:6px!important;row-gap:8px!important;pointer-events:none!important;z-index:24!important}'
            ].join('')
          : ''
      );

      const initialDesktopLayoutPromise = routeName === 'desktop'
        ? Promise.resolve().then(() => syncDesktopIconLayout(false)).catch(() => {})
        : null;

      if (routeName !== 'desktop') return;
      setBackground(document.body, desktopBg);
      clearBackground(document.querySelector('.screen-container'));

      const iconItems = getDesktopThemeIconTargets();
      await Promise.all(iconItems.map(async (item, index) => {
        if (!item) return;
        const icon = item.querySelector('.app-icon');
        if (!icon) return;
        const iconConfig = desktopThemeIcons[index];
        if (!iconConfig) return;
        const currentKey = `icon_${iconConfig.storageKey}_img`;
        const legacyKeyIndex = legacyThemeIconKeysByStableOrder[index];
        const legacyKey = legacyKeyIndex ? `icon_${legacyKeyIndex}_img` : null;
        const hidden = iconConfig.fixed ? false : !!(await getSetting(`icon_${iconConfig.storageKey}_hidden`));
        item.dataset.miniDesktopHidden = hidden ? '1' : '0';
        const iconUrl = await getPlaceholder(currentKey) || (legacyKey ? await getPlaceholder(legacyKey) : null);
        if (iconUrl) {
          setBackground(icon, iconUrl);
          icon.style.backgroundColor = 'transparent';
          icon.dataset.miniThemeIconApplied = '1';
        } else {
          if (icon.dataset.miniThemeIconApplied === '1') {
            clearBackground(icon);
            icon.style.backgroundColor = '';
            delete icon.dataset.miniThemeIconApplied;
          }
        }
      }));

      if (iconRadius != null) document.querySelectorAll('.app-icon').forEach((el) => { el.style.borderRadius = `${iconRadius}px`; });
      const safeIconSize = iconSize != null ? Math.max(36, Math.min(64, Number(iconSize) || 60)) : null;
      if (safeIconSize != null) document.querySelectorAll('.app-icon').forEach((el) => {
        el.style.width = `${safeIconSize}px`;
        el.style.height = `${safeIconSize}px`;
      });
      if (widgetRadius != null) document.querySelectorAll('.w-88,.w-90-body,.w-6,.w-31,.w-33,.w-14').forEach((el) => { el.style.borderRadius = `${widgetRadius}px`; });

      await Promise.all(themeWidgetSelectors.map(async (selector, index) => {
        const hidden = await getSetting(`widget_${index + 1}_hidden`);
        document.querySelectorAll(selector).forEach((el) => { el.style.display = hidden ? 'none' : ''; });
      }));

      if (initialDesktopLayoutPromise) await initialDesktopLayoutPromise;
      if (desktopLayoutState && desktopLayoutState.active) finishDesktopDrag(false);
      await syncDesktopIconLayout();
    }

    function normalizeDesktopThirdPageIconRow(layout = null) {
      if (!desktopLayoutState || routeName !== 'desktop') return false;
      if (desktopGridRows > 4) return false;
      const metas = desktopLayoutState.icons
        .filter((meta) => !meta.hidden && meta.pageIndex === 2 && meta.defaultPageIndex === 2)
        .sort((left, right) => {
          const leftSlot = Number.isInteger(left.defaultSlot) ? left.defaultSlot : left.slot;
          const rightSlot = Number.isInteger(right.defaultSlot) ? right.defaultSlot : right.slot;
          return leftSlot - rightSlot;
        });
      const hasSavedPlacement = metas.some((meta) => {
        const saved = layout && layout[meta.id];
        return saved
          && saved.kind === 'icon'
          && Number(saved.page) === 2
          && Number.isInteger(Number(saved.slot));
      });
      if (hasSavedPlacement) return false;
      let changed = false;
      metas.forEach((meta, index) => {
        if (meta.slot === index) return;
        applyDesktopIconSlot(meta, index);
        changed = true;
      });
      return changed;
    }

    function getDesktopSlotCount() {
      return desktopGridColumns * desktopGridRows;
    }

    function getDesktopGridMetrics(meta) {
      const rect = meta.grid.getBoundingClientRect();
      const style = window.getComputedStyle(meta.grid);
      const columnGap = parseFloat(style.columnGap || style.gap) || 0;
      const rowGap = parseFloat(style.rowGap || style.gap) || 0;
      const cellWidth = Math.max(1, (rect.width - columnGap * (desktopGridColumns - 1)) / desktopGridColumns);
      const explicitAutoRow = parseFloat(style.gridAutoRows);
      const cellHeight = Number.isFinite(explicitAutoRow) && explicitAutoRow > 0
        ? explicitAutoRow
        : Math.max(1, (rect.height - rowGap * (desktopGridRows - 1)) / desktopGridRows);
      return { rect, columnGap, rowGap, cellWidth, cellHeight };
    }

    function getDesktopSlotInfo(meta, slot) {
      const metrics = getDesktopGridMetrics(meta);
      const pageRect = meta.page.getBoundingClientRect();
      const column = slot % desktopGridColumns;
      const row = Math.floor(slot / desktopGridColumns);
      const left = metrics.rect.left + column * (metrics.cellWidth + metrics.columnGap);
      const top = metrics.rect.top + row * (metrics.cellHeight + metrics.rowGap);
      return {
        slot,
        column,
        row,
        left,
        top,
        right: left + metrics.cellWidth,
        bottom: top + metrics.cellHeight,
        centerX: left + metrics.cellWidth / 2,
        centerY: top + metrics.cellHeight / 2,
        pageCenterX: left - pageRect.left + metrics.cellWidth / 2,
        pageCenterY: top - pageRect.top + metrics.cellHeight / 2
      };
    }

    function findDesktopNearestSlot(meta, clientX, clientY) {
      const metrics = getDesktopGridMetrics(meta);
      if (
        clientX < metrics.rect.left ||
        clientX > metrics.rect.right ||
        clientY < metrics.rect.top ||
        clientY > metrics.rect.bottom
      ) {
        return null;
      }
      let bestSlot = null;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let slot = 0; slot < getDesktopSlotCount(); slot += 1) {
        const info = getDesktopSlotInfo(meta, slot);
        const distance = Math.hypot(clientX - info.centerX, clientY - info.centerY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestSlot = slot;
        }
      }
      return bestSlot;
    }

    function findDesktopNearestSlotFromItem(meta, item) {
      const rect = item.getBoundingClientRect();
      return findDesktopNearestSlot(meta, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    function findDesktopNearestSlotFromLegacyPosition(meta, left, top) {
      if (!Number.isFinite(left) || !Number.isFinite(top)) return null;
      const itemRect = meta.item.getBoundingClientRect();
      const centerX = left + itemRect.width / 2;
      const centerY = top + itemRect.height / 2;
      let bestSlot = null;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let slot = 0; slot < getDesktopSlotCount(); slot += 1) {
        const info = getDesktopSlotInfo(meta, slot);
        const distance = Math.hypot(centerX - info.pageCenterX, centerY - info.pageCenterY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestSlot = slot;
        }
      }
      return bestSlot;
    }

    function readDesktopStoredSlot(meta, saved) {
      if (!saved || Number(saved.page) !== meta.pageIndex) return null;
      const slot = Number(saved.slot);
      if (Number.isInteger(slot) && slot >= 0 && slot < getDesktopSlotCount()) return slot;
      return findDesktopNearestSlotFromLegacyPosition(meta, Number(saved.left), Number(saved.top));
    }

    function setDesktopIconVisibility(meta, hidden) {
      meta.hidden = !!hidden;
      meta.item.dataset.miniDesktopHidden = meta.hidden ? '1' : '0';
      meta.item.style.display = meta.hidden ? 'none' : '';
    }

    function applyDesktopIconSlot(meta, slot) {
      if (!Number.isInteger(slot) || slot < 0 || slot >= getDesktopSlotCount()) return;
      meta.slot = slot;
      meta.item.dataset.miniDesktopSlot = String(slot);
      meta.item.style.gridColumnStart = String((slot % desktopGridColumns) + 1);
      meta.item.style.gridRowStart = String(Math.floor(slot / desktopGridColumns) + 1);
      meta.item.style.gridColumnEnd = 'auto';
      meta.item.style.gridRowEnd = 'auto';
    }

    function findDesktopIconBySlot(pageIndex, slot, excludeMeta = null) {
      return desktopLayoutState.icons.find((meta) => (
        meta !== excludeMeta &&
        !meta.hidden &&
        meta.pageIndex === pageIndex &&
        meta.slot === slot
      )) || null;
    }

    function findFirstFreeDesktopSlot(pageIndex, occupied) {
      for (let slot = 0; slot < getDesktopSlotCount(); slot += 1) {
        if (!occupied.has(slot)) return slot;
      }
      return null;
    }

    function serializeDesktopLayout() {
      return desktopLayoutState.icons.reduce((result, meta) => {
        result[meta.id] = {
          page: meta.pageIndex,
          slot: Number.isInteger(meta.slot) ? meta.slot : meta.defaultSlot
        };
        return result;
      }, {});
    }

    function queueDesktopLayoutSave() {
      if (!desktopLayoutState) return;
      window.clearTimeout(desktopLayoutState.saveTimer);
      if (!desktopLayoutState.hydrated) {
        if (desktopLayoutState.saveAfterHydrateQueued) return;
        desktopLayoutState.saveAfterHydrateQueued = true;
        Promise.resolve(hydrateDesktopLayout())
          .catch(() => null)
          .finally(() => {
            desktopLayoutState.saveAfterHydrateQueued = false;
            if (desktopLayoutState.hydrated) queueDesktopLayoutSave();
          });
        return;
      }
      desktopLayoutState.saveTimer = window.setTimeout(() => {
        writeDesktopLayout(serializeDesktopLayout());
      }, 80);
    }

    function updateDesktopPager() {
      if (!desktopLayoutState) return;
      desktopLayoutState.currentPageIndex = getDesktopCurrentPageIndex();
      if (!desktopLayoutState.pager) return;
      Array.from(desktopLayoutState.pager.children).forEach((node, index) => {
        node.classList.toggle('active', index === desktopLayoutState.currentPageIndex);
      });
    }

    function scrollDesktopToPage(pageIndex, behavior = 'smooth') {
      if (!desktopLayoutState) return;
      const container = getDesktopScrollContainer();
      const pageCount = getDesktopPageCount();
      if (!container || !pageCount) return;
      const nextIndex = Math.max(0, Math.min(pageCount - 1, pageIndex));
      desktopLayoutState.currentPageIndex = nextIndex;
      container.scrollTo({
        left: nextIndex * (container.clientWidth || window.innerWidth || 1),
        behavior
      });
      updateDesktopPager();
    }

    function showDesktopPageHint(message, direction = 0) {
      if (!desktopLayoutState || !desktopLayoutState.pageHint) return;
      const hint = desktopLayoutState.pageHint;
      hint.textContent = message;
      hint.classList.remove('is-left', 'is-right');
      if (direction < 0) hint.classList.add('is-left');
      if (direction > 0) hint.classList.add('is-right');
      hint.classList.add('show');
    }

    function hideDesktopPageHint() {
      if (!desktopLayoutState || !desktopLayoutState.pageHint) return;
      desktopLayoutState.pageHint.classList.remove('show', 'is-left', 'is-right');
    }

    function clearDesktopPageTurnTimer(hideHint = true) {
      if (!desktopLayoutState) return;
      window.clearTimeout(desktopLayoutState.pageTurnTimer);
      desktopLayoutState.pageTurnTimer = 0;
      desktopLayoutState.pageTurnTarget = null;
      if (hideHint) hideDesktopPageHint();
    }

    function ensureDesktopPager() {
      if (!desktopLayoutState || desktopLayoutState.pagerReady) return;
      const pageCount = getDesktopPageCount();
      if (!pageCount) return;
      let pager = document.querySelector('.mini-desktop-page-indicator');
      if (!pager) {
        pager = document.createElement('div');
        pager.className = 'mini-desktop-page-indicator';
        document.body.appendChild(pager);
      }
      pager.innerHTML = '';
      for (let index = 0; index < pageCount; index += 1) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'mini-desktop-page-dot';
        dot.setAttribute('aria-label', `Page ${index + 1}`);
        dot.addEventListener('click', () => scrollDesktopToPage(index));
        pager.appendChild(dot);
      }
      let hint = document.querySelector('.mini-desktop-page-hint');
      if (!hint) {
        hint = document.createElement('div');
        hint.className = 'mini-desktop-page-hint';
        document.body.appendChild(hint);
      }
      desktopLayoutState.pager = pager;
      desktopLayoutState.pageHint = hint;
      desktopLayoutState.pagerReady = true;
      updateDesktopPager();
    }

    function installDesktopPagerSync() {
      if (!desktopLayoutState || desktopLayoutState.scrollBound) return;
      const container = getDesktopScrollContainer();
      if (!container) return;
      desktopLayoutState.scrollBound = true;
      container.addEventListener('scroll', () => {
        window.requestAnimationFrame(updateDesktopPager);
      }, { passive: true });
    }

    function detachDesktopDragListeners() {
      if (!desktopLayoutState || !desktopLayoutState.listenersAttached) return;
      desktopLayoutState.listenersAttached = false;
      window.removeEventListener('mousemove', handleDesktopMouseMove, true);
      window.removeEventListener('mouseup', handleDesktopDragEnd, true);
      window.removeEventListener('touchmove', handleDesktopTouchMove, true);
      window.removeEventListener('touchend', handleDesktopDragEnd, true);
      window.removeEventListener('touchcancel', handleDesktopDragEnd, true);
      window.removeEventListener('blur', handleDesktopDragEnd, true);
    }

    function toggleDesktopSortMode(enabled) {
      document.body.classList.toggle('mini-desktop-sort-mode', !!enabled);
      const container = getDesktopScrollContainer();
      if (container) container.classList.toggle('mini-desktop-sort-mode', !!enabled);
    }

    function clearDesktopLongPressTimer(active = desktopLayoutState && desktopLayoutState.active) {
      if (!active) return;
      window.clearTimeout(active.longPressTimer);
      active.longPressTimer = 0;
    }

    function stripDesktopGhostIds(node) {
      if (!node || node.nodeType !== 1) return;
      const sanitize = (element) => {
        element.removeAttribute('id');
        Array.from(element.attributes || []).forEach((attribute) => {
          if (
            attribute.name === 'data-mini-suppress-click-until' ||
            attribute.name === 'data-mini-route-bound' ||
            attribute.name.startsWith('data-mini-desktop')
          ) {
            element.removeAttribute(attribute.name);
          }
        });
      };
      sanitize(node);
      node.querySelectorAll('*').forEach(sanitize);
    }

    function createDesktopDragGhost(active) {
      if (!active || active.ghost) return;
      const rect = active.dragRect;
      if (!rect || !(rect.width > 0) || !(rect.height > 0)) return;
      const ghost = active.meta.item.cloneNode(true);
      stripDesktopGhostIds(ghost);
      ghost.removeAttribute('data-mini-desktop-drag-bound');
      ghost.removeAttribute('data-mini-desktop-draggable');
      ghost.removeAttribute('data-mini-suppress-click-until');
      ghost.classList.remove('mini-desktop-dragging');
      ghost.classList.add('mini-desktop-drag-ghost');
      ghost.dataset.miniKind = active.meta.kind;
      ghost.style.setProperty('width', `${rect.width}px`, 'important');
      ghost.style.setProperty('height', `${rect.height}px`, 'important');
      ghost.style.setProperty('left', `${Math.round(Number.isFinite(active.ghostLeft) ? active.ghostLeft : -9999)}px`, 'important');
      ghost.style.setProperty('top', `${Math.round(Number.isFinite(active.ghostTop) ? active.ghostTop : -9999)}px`, 'important');
      ghost.style.visibility = 'hidden';
      document.body.appendChild(ghost);
      active.ghost = ghost;
    }

    function updateDesktopDragGhostPosition(active, clientX, clientY) {
      if (!active || !active.ghost || !active.dragRect) return;
      const left = clientX - active.grabOffsetX;
      const top = clientY - active.grabOffsetY;
      active.ghostLeft = left;
      active.ghostTop = top;
      active.ghostCenterX = left + active.dragRect.width / 2;
      active.ghostCenterY = top + active.dragRect.height / 2;
      active.ghost.style.setProperty('left', `${Math.round(left)}px`, 'important');
      active.ghost.style.setProperty('top', `${Math.round(top)}px`, 'important');
      active.ghost.style.visibility = 'visible';
    }

    function removeDesktopDragGhost(active) {
      if (!active || !active.ghost) return;
      active.ghost.remove();
      active.ghost = null;
    }

    function getDesktopDragHitPoint(active, clientX, clientY) {
      if (!active || !active.dragRect) return { centerX: clientX, centerY: clientY };
      const left = Number.isFinite(active.ghostLeft) ? active.ghostLeft : (clientX - active.grabOffsetX);
      const top = Number.isFinite(active.ghostTop) ? active.ghostTop : (clientY - active.grabOffsetY);
      return {
        centerX: left + active.dragRect.width / 2,
        centerY: top + active.dragRect.height / 2
      };
    }

    function scheduleDesktopLongPress(active) {
      if (!active) return;
      clearDesktopLongPressTimer(active);
      active.longPressTimer = window.setTimeout(() => {
        if (!desktopLayoutState || desktopLayoutState.active !== active) return;
        active.pressReady = true;
        toggleDesktopSortMode(true);
      }, desktopLongPressDelay);
    }

    function cancelDesktopPendingDrag() {
      if (!desktopLayoutState || !desktopLayoutState.active) return;
      const active = desktopLayoutState.active;
      if (active.pressReady || active.dragging) return;
      finishDesktopDrag(false);
    }

    function ensureDesktopDragStarted(clientX, clientY, event) {
      if (!desktopLayoutState || !desktopLayoutState.active) return false;
      const active = desktopLayoutState.active;
      active.lastClientX = clientX;
      active.lastClientY = clientY;
      if (!active.pressReady) return false;
      if (active.dragging) return true;
      if (Math.hypot(clientX - active.startClientX, clientY - active.startClientY) < desktopDragStartThreshold) {
        return false;
      }
      clearDesktopLongPressTimer(active);
      active.dragging = true;
      active.travelled = true;
      active.meta.item.classList.add('mini-desktop-dragging');
      createDesktopDragGhost(active);
      updateDesktopDragGhostPosition(active, clientX, clientY);
      if (event && typeof event.preventDefault === 'function') event.preventDefault();
      return true;
    }

    function finishDesktopDrag(shouldPersist) {
      if (!desktopLayoutState || !desktopLayoutState.active) return;
      const active = desktopLayoutState.active;
      desktopLayoutState.active = null;
      clearDesktopLongPressTimer(active);
      clearDesktopPageTurnTimer();
      detachDesktopDragListeners();
      removeDesktopDragGhost(active);
      active.meta.item.classList.remove('mini-desktop-dragging');
      toggleDesktopSortMode(false);
      if (active.pressReady || (active.dragging && (active.travelled || active.moved))) {
        active.meta.item.dataset.miniSuppressClickUntil = String(Date.now() + 250);
      }
      updateDesktopPager();
      if (active.dragging && active.moved && shouldPersist) {
        queueDesktopLayoutSave();
      }
    }

    function scheduleDesktopPageTurn(direction) {
      if (!desktopLayoutState || !desktopLayoutState.active) return;
      const active = desktopLayoutState.active;
      const targetPageIndex = getDesktopAdjacentPageIndex(desktopLayoutState.currentPageIndex, direction, active.meta.kind);
      if (targetPageIndex == null) {
        clearDesktopPageTurnTimer();
        return;
      }
      if (desktopLayoutState.pageTurnTarget === targetPageIndex && desktopLayoutState.pageTurnTimer) return;
      clearDesktopPageTurnTimer(false);
      desktopLayoutState.pageTurnTarget = targetPageIndex;
      showDesktopPageHint(`Hold to turn to Page ${targetPageIndex + 1}`, direction);
      desktopLayoutState.pageTurnTimer = window.setTimeout(() => {
        desktopLayoutState.pageTurnTimer = 0;
        desktopLayoutState.pageTurnTarget = null;
        scrollDesktopToPage(targetPageIndex, active.dragging ? 'auto' : 'smooth');
        showDesktopPageHint(`Page ${targetPageIndex + 1}`, direction);
        window.setTimeout(hideDesktopPageHint, 220);
        if (desktopLayoutState.active && desktopLayoutState.active.dragging) {
          const rerunDragPosition = () => updateDesktopDragPosition(
            desktopLayoutState.active.lastClientX,
            desktopLayoutState.active.lastClientY
          );
          window.requestAnimationFrame(() => window.requestAnimationFrame(rerunDragPosition));
          window.setTimeout(() => {
            if (desktopLayoutState.active && desktopLayoutState.active.dragging) rerunDragPosition();
          }, 80);
        }
      }, desktopPageTurnDelay);
    }

    function updateDesktopAutoPage(clientX) {
      const width = window.innerWidth || document.documentElement.clientWidth || 0;
      if (!width) return;
      if (clientX <= desktopPageEdgeThreshold) {
        scheduleDesktopPageTurn(-1);
        return;
      }
      if (clientX >= width - desktopPageEdgeThreshold) {
        scheduleDesktopPageTurn(1);
        return;
      }
      clearDesktopPageTurnTimer();
    }

    function updateDesktopIconDrag(clientX, clientY) {
      const active = desktopLayoutState.active;
      const targetPageIndex = desktopLayoutState.currentPageIndex;
      if (!desktopPageCanAccept(targetPageIndex, 'icon')) return;
      const previousPageIndex = active.meta.pageIndex;
      if (previousPageIndex !== targetPageIndex) {
        const landingSlot = findFirstFreeDesktopSlot(targetPageIndex, getDesktopOccupiedSlots(targetPageIndex, active.meta));
        if (!Number.isInteger(landingSlot) || !moveDesktopIconToPage(active.meta, targetPageIndex)) return;
        applyDesktopIconSlot(active.meta, landingSlot);
      }
      const nextSlot = findDesktopNearestSlot(active.meta, clientX, clientY);
      if (!Number.isInteger(nextSlot) || nextSlot === active.meta.slot) return;
      const occupied = findDesktopIconBySlot(targetPageIndex, nextSlot, active.meta);
      if (occupied) {
        if (previousPageIndex === targetPageIndex) {
          applyDesktopIconSlot(occupied, active.meta.slot);
        } else {
          const fallbackSlot = findFirstFreeDesktopSlot(
            targetPageIndex,
            getDesktopOccupiedSlots(targetPageIndex, [active.meta, occupied])
          );
          if (!Number.isInteger(fallbackSlot)) return;
          applyDesktopIconSlot(occupied, fallbackSlot);
        }
      }
      applyDesktopIconSlot(active.meta, nextSlot);
      active.moved = true;
    }

    function updateDesktopWidgetDrag(clientY) {
      const active = desktopLayoutState.active;
      const targetPageIndex = desktopLayoutState.currentPageIndex;
      if (!desktopPageCanAccept(targetPageIndex, 'widget')) return;
      const nextRegion = getDesktopWidgetDropRegion(targetPageIndex, clientY);
      const nextOrder = findDesktopWidgetInsertIndex(targetPageIndex, clientY, active.meta, nextRegion);
      if (applyDesktopWidgetOrder(active.meta, targetPageIndex, nextRegion, nextOrder)) {
        active.moved = true;
      }
    }

    function updateDesktopDragPosition(clientX, clientY) {
      if (!desktopLayoutState || !desktopLayoutState.active) return;
      const active = desktopLayoutState.active;
      active.lastClientX = clientX;
      active.lastClientY = clientY;
      if (!active.dragging) return;
      if (Math.abs(clientX - active.startClientX) > 3 || Math.abs(clientY - active.startClientY) > 3) {
        active.travelled = true;
      }
      updateDesktopPager();
      updateDesktopAutoPage(clientX);
      if (active.meta.kind === 'widget') updateDesktopWidgetDrag(clientY);
      else updateDesktopIconDrag(clientX, clientY);
    }

    function handleDesktopMouseMove(event) {
      if (!desktopLayoutState || !desktopLayoutState.active || desktopLayoutState.active.pointerType !== 'mouse') return;
      if (!desktopLayoutState.active.pressReady) {
        if (Math.hypot(event.clientX - desktopLayoutState.active.startClientX, event.clientY - desktopLayoutState.active.startClientY) >= desktopLongPressMoveTolerance) {
          cancelDesktopPendingDrag();
        }
        return;
      }
      if (!ensureDesktopDragStarted(event.clientX, event.clientY, event)) return;
      event.preventDefault();
      updateDesktopDragPosition(event.clientX, event.clientY);
    }

    function handleDesktopTouchMove(event) {
      if (!desktopLayoutState || !desktopLayoutState.active || desktopLayoutState.active.pointerType !== 'touch') return;
      const touch = (event.changedTouches && event.changedTouches[0]) || (event.touches && event.touches[0]);
      if (!touch) return;
      if (!desktopLayoutState.active.pressReady) {
        if (Math.hypot(touch.clientX - desktopLayoutState.active.startClientX, touch.clientY - desktopLayoutState.active.startClientY) >= desktopLongPressMoveTolerance) {
          cancelDesktopPendingDrag();
        }
        return;
      }
      if (!ensureDesktopDragStarted(touch.clientX, touch.clientY, event)) return;
      event.preventDefault();
      updateDesktopDragPosition(touch.clientX, touch.clientY);
    }

    function handleDesktopDragEnd() {
      finishDesktopDrag(true);
    }

    function startDesktopDrag(meta, clientX, clientY, event, pointerType) {
      if (!desktopLayoutState || meta.hidden) return;
      if (desktopLayoutState.active) finishDesktopDrag(false);
      desktopLayoutState.active = {
        meta,
        pointerType,
        startClientX: clientX,
        startClientY: clientY,
        lastClientX: clientX,
        lastClientY: clientY,
        longPressTimer: 0,
        pressReady: false,
        travelled: false,
        moved: false,
        dragging: false
      };
      scheduleDesktopLongPress(desktopLayoutState.active);
      event.stopPropagation();
      if (desktopLayoutState.listenersAttached) return;
      desktopLayoutState.listenersAttached = true;
      window.addEventListener('mousemove', handleDesktopMouseMove, true);
      window.addEventListener('mouseup', handleDesktopDragEnd, true);
      window.addEventListener('touchmove', handleDesktopTouchMove, { passive: false, capture: true });
      window.addEventListener('touchend', handleDesktopDragEnd, true);
      window.addEventListener('touchcancel', handleDesktopDragEnd, true);
      window.addEventListener('blur', handleDesktopDragEnd, true);
    }

    function bindDesktopDrag(meta) {
      if (!desktopLayoutState || meta.item.dataset.miniDesktopDragBound === '1') return;
      meta.item.dataset.miniDesktopDragBound = '1';
      meta.item.dataset.miniDesktopDraggable = '1';
      meta.item.addEventListener('dragstart', (event) => {
        event.preventDefault();
      });
      meta.item.addEventListener('selectstart', (event) => {
        event.preventDefault();
      });
      meta.item.addEventListener('mousedown', (event) => {
        if (event.button !== 0) return;
        startDesktopDrag(meta, event.clientX, event.clientY, event, 'mouse');
      });
      meta.item.addEventListener('touchstart', (event) => {
        if (event.touches && event.touches.length > 1) return;
        const touch = (event.changedTouches && event.changedTouches[0]) || (event.touches && event.touches[0]);
        if (!touch) return;
        startDesktopDrag(meta, touch.clientX, touch.clientY, event, 'touch');
      }, { passive: false });
    }

    function installDesktopClickGuard() {
      if (!desktopLayoutState || desktopLayoutState.clickGuardInstalled) return;
      desktopLayoutState.clickGuardInstalled = true;
      document.addEventListener('click', (event) => {
        const item = event.target.closest('[data-mini-desktop-draggable="1"]');
        if (!item) return;
        const until = Number(item.dataset.miniSuppressClickUntil || 0);
        if (until && Date.now() < until) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          item.dataset.miniSuppressClickUntil = '0';
        }
      }, true);
    }

    function detachDesktopDragListeners() {
      if (!desktopLayoutState || !desktopLayoutState.listenersAttached) return;
      desktopLayoutState.listenersAttached = false;
      window.removeEventListener('mousemove', handleDesktopMouseMove, true);
      window.removeEventListener('mouseup', handleDesktopDragEnd, true);
      window.removeEventListener('touchmove', handleDesktopTouchMove, true);
      window.removeEventListener('touchend', handleDesktopDragEnd, true);
      window.removeEventListener('touchcancel', handleDesktopDragEnd, true);
      window.removeEventListener('blur', handleDesktopDragEnd, true);
    }

    function finishDesktopDrag(shouldPersist) {
      if (!desktopLayoutState || !desktopLayoutState.active) return;
      const active = desktopLayoutState.active;
      desktopLayoutState.active = null;
      detachDesktopDragListeners();
      active.meta.item.classList.remove('mini-desktop-dragging');
      if (active.travelled || active.moved) {
        active.meta.item.dataset.miniSuppressClickUntil = String(Date.now() + 250);
      }
      if (active.moved && shouldPersist) {
        queueDesktopLayoutSave();
      }
    }

    function updateDesktopDragPosition(clientX, clientY) {
      if (!desktopLayoutState || !desktopLayoutState.active) return;
      const active = desktopLayoutState.active;
      if (Math.abs(clientX - active.startClientX) > 3 || Math.abs(clientY - active.startClientY) > 3) {
        active.travelled = true;
      }
      const nextSlot = findDesktopNearestSlot(active.meta, clientX, clientY);
      if (nextSlot == null || nextSlot === active.meta.slot) return;
      const previousSlot = active.meta.slot;
      const occupied = findDesktopIconBySlot(active.meta.pageIndex, nextSlot, active.meta);
      if (occupied) applyDesktopIconSlot(occupied, previousSlot);
      applyDesktopIconSlot(active.meta, nextSlot);
      active.moved = true;
    }

    function handleDesktopMouseMove(event) {
      if (!desktopLayoutState || !desktopLayoutState.active || desktopLayoutState.active.pointerType !== 'mouse') return;
      event.preventDefault();
      updateDesktopDragPosition(event.clientX, event.clientY);
    }

    function handleDesktopTouchMove(event) {
      if (!desktopLayoutState || !desktopLayoutState.active || desktopLayoutState.active.pointerType !== 'touch') return;
      const touch = (event.changedTouches && event.changedTouches[0]) || (event.touches && event.touches[0]);
      if (!touch) return;
      event.preventDefault();
      updateDesktopDragPosition(touch.clientX, touch.clientY);
    }

    function handleDesktopDragEnd() {
      finishDesktopDrag(true);
    }

    function startDesktopDrag(meta, clientX, clientY, event, pointerType) {
      if (!desktopLayoutState || meta.hidden) return;
      if (desktopLayoutState.active) finishDesktopDrag(false);
      meta.item.classList.add('mini-desktop-dragging');
      desktopLayoutState.active = {
        meta,
        pointerType,
        startClientX: clientX,
        startClientY: clientY,
        travelled: false,
        moved: false
      };
      event.stopPropagation();
      event.preventDefault();
      if (desktopLayoutState.listenersAttached) return;
      desktopLayoutState.listenersAttached = true;
      window.addEventListener('mousemove', handleDesktopMouseMove, true);
      window.addEventListener('mouseup', handleDesktopDragEnd, true);
      window.addEventListener('touchmove', handleDesktopTouchMove, { passive: false, capture: true });
      window.addEventListener('touchend', handleDesktopDragEnd, true);
      window.addEventListener('touchcancel', handleDesktopDragEnd, true);
      window.addEventListener('blur', handleDesktopDragEnd, true);
    }

    function bindDesktopDrag(meta) {
      if (!desktopLayoutState || meta.item.dataset.miniDesktopDragBound === '1') return;
      meta.item.dataset.miniDesktopDragBound = '1';
      meta.item.addEventListener('dragstart', (event) => {
        event.preventDefault();
      });
      meta.item.addEventListener('selectstart', (event) => {
        event.preventDefault();
      });
      meta.item.addEventListener('mousedown', (event) => {
        if (event.button !== 0) return;
        startDesktopDrag(meta, event.clientX, event.clientY, event, 'mouse');
      });
      meta.item.addEventListener('touchstart', (event) => {
        if (event.touches && event.touches.length > 1) return;
        const touch = (event.changedTouches && event.changedTouches[0]) || (event.touches && event.touches[0]);
        if (!touch) return;
        startDesktopDrag(meta, touch.clientX, touch.clientY, event, 'touch');
      }, { passive: false });
    }

    function installDesktopClickGuard() {
      if (!desktopLayoutState || desktopLayoutState.clickGuardInstalled) return;
      desktopLayoutState.clickGuardInstalled = true;
      document.addEventListener('click', (event) => {
        const item = event.target.closest('.app-grid > .app-item[data-mini-desktop-icon="1"]');
        if (!item) return;
        const until = Number(item.dataset.miniSuppressClickUntil || 0);
        if (until && Date.now() < until) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          item.dataset.miniSuppressClickUntil = '0';
        }
      }, true);
    }

    function installDesktopResizeSync() {
      if (!desktopLayoutState || desktopLayoutState.resizeBound) return;
      desktopLayoutState.resizeBound = true;
      window.addEventListener('resize', () => {
        if (desktopLayoutState.active) finishDesktopDrag(false);
        syncDesktopIconLayout(false);
      });
    }

    function prepareDesktopIconLayout() {
      if (!desktopLayoutState || desktopLayoutState.prepared) return;
      desktopLayoutState.prepared = true;
      let iconIndex = 0;
      document.querySelectorAll('.screen-container .page').forEach((page, pageIndex) => {
        const appsArea = page.querySelector('.apps-area');
        const grid = appsArea && appsArea.querySelector('.app-grid');
        if (!grid) return;
        const items = Array.from(grid.children).filter((node) => node.classList && node.classList.contains('app-item'));
        items.forEach((item, slotIndex) => {
          const meta = {
            id: `icon-${iconIndex}`,
            item,
            page,
            appsArea,
            grid,
            pageIndex,
            slotIndex,
            defaultSlot: slotIndex,
            slot: slotIndex,
            hidden: false
          };
          const measuredSlot = findDesktopNearestSlotFromItem(meta, item);
          if (measuredSlot != null) {
            meta.defaultSlot = measuredSlot;
            meta.slot = measuredSlot;
          }
          item.dataset.miniDesktopIcon = '1';
          item.dataset.miniDesktopIconId = meta.id;
          item.dataset.miniDesktopIconIndex = String(iconIndex + 1);
          item.dataset.miniSuppressClickUntil = '0';
          bindDesktopDrag(meta);
          desktopLayoutState.icons.push(meta);
          iconIndex += 1;
        });
      });
      installDesktopClickGuard();
      installDesktopResizeSync();
    }

    async function syncDesktopIconLayout(allowPersist = true) {
      if (!desktopLayoutState) return;
      prepareDesktopIconLayout();
      if (!desktopLayoutState.icons.length) return;
      const layout = readDesktopLayout() || {};
      const occupiedByPage = new Map();
      let changed = false;
      desktopLayoutState.icons.forEach((meta) => {
        setDesktopIconVisibility(meta, meta.item.dataset.miniDesktopHidden === '1');
      });
      desktopLayoutState.icons.forEach((meta) => {
        if (meta.hidden) return;
        let occupied = occupiedByPage.get(meta.pageIndex);
        if (!occupied) {
          occupied = new Set();
          occupiedByPage.set(meta.pageIndex, occupied);
        }
        const savedSlot = readDesktopStoredSlot(meta, layout[meta.id]);
        const preferredSlots = [];
        if (savedSlot != null) preferredSlots.push(savedSlot);
        if (Number.isInteger(meta.defaultSlot)) preferredSlots.push(meta.defaultSlot);
        let nextSlot = preferredSlots.find((slot) => !occupied.has(slot));
        if (nextSlot == null) nextSlot = findFirstFreeDesktopSlot(meta.pageIndex, occupied);
        if (!Number.isInteger(nextSlot)) nextSlot = meta.defaultSlot;
        if (meta.slot !== nextSlot || savedSlot == null) changed = true;
        applyDesktopIconSlot(meta, nextSlot);
        occupied.add(nextSlot);
      });
      desktopLayoutState.icons.forEach((meta) => {
        if (!meta.hidden) return;
        meta.item.classList.remove('mini-desktop-dragging');
      });
      if (allowPersist && changed) {
        desktopLayoutState.lastSerialized = '';
        queueDesktopLayoutSave();
        return;
      }
      desktopLayoutState.lastSerialized = JSON.stringify(serializeDesktopLayout());
    }

    function getDesktopScrollContainer() {
      return document.querySelector('.screen-container');
    }

    function getDesktopPageCount() {
      return desktopLayoutState ? desktopLayoutState.pages.length : 0;
    }

    function getDesktopPageMeta(pageIndex) {
      if (!desktopLayoutState) return null;
      return desktopLayoutState.pages[pageIndex] || null;
    }

    function desktopPageCanAccept(pageIndex, kind) {
      const pageMeta = getDesktopPageMeta(pageIndex);
      if (!pageMeta) return false;
      return !!pageMeta.grid;
    }

    function getDesktopAdjacentPageIndex(fromPageIndex, direction, kind) {
      const step = direction < 0 ? -1 : 1;
      for (let next = fromPageIndex + step; next >= 0 && next < getDesktopPageCount(); next += step) {
        if (desktopPageCanAccept(next, kind)) return next;
      }
      return null;
    }

    function getDesktopCurrentPageIndex() {
      if (!desktopLayoutState) return 0;
      const container = getDesktopScrollContainer();
      const pageCount = getDesktopPageCount();
      if (!container || !pageCount) return 0;
      const width = Math.max(1, container.clientWidth || window.innerWidth || 1);
      return Math.max(0, Math.min(pageCount - 1, Math.round(container.scrollLeft / width)));
    }

    function getDesktopSlotCount(target) {
      const pageMeta = typeof target === 'number' ? getDesktopPageMeta(target) : target;
      return pageMeta && pageMeta.grid ? desktopGridColumns * desktopGridRows : 0;
    }

    function getDesktopGridMetrics(meta) {
      if (!meta || !meta.grid) return null;
      const rawRect = meta.grid.getBoundingClientRect();
      const style = window.getComputedStyle(meta.grid);
      const columnGap = parseFloat(style.columnGap || style.gap) || 0;
      const rowGap = parseFloat(style.rowGap || style.gap) || 0;
      const cellWidth = Math.max(1, (rawRect.width - columnGap * (desktopGridColumns - 1)) / desktopGridColumns);
      const trackHeights = getDesktopGridTrackPixels(style.gridTemplateRows);
      const autoRowHeight = getDesktopGridTrackPixels(style.gridAutoRows)[0] || 0;
      const cellHeight = Math.max(
        1,
        trackHeights[0]
          || autoRowHeight
          || Math.max(1, (rawRect.height - rowGap * Math.max(0, desktopGridRows - 1)) / Math.max(1, desktopGridRows))
      );
      const virtualHeight = cellHeight * desktopGridRows + rowGap * Math.max(0, desktopGridRows - 1);
      const rect = {
        left: rawRect.left,
        top: rawRect.top,
        right: rawRect.left + rawRect.width,
        bottom: rawRect.top + virtualHeight,
        width: rawRect.width,
        height: virtualHeight
      };
      return { rect, columnGap, rowGap, cellWidth, cellHeight };
    }

    function getDesktopSlotInfo(meta, slot) {
      const metrics = getDesktopGridMetrics(meta);
      if (!metrics) return null;
      const pageRect = meta.page.getBoundingClientRect();
      const column = slot % desktopGridColumns;
      const row = Math.floor(slot / desktopGridColumns);
      const left = metrics.rect.left + column * (metrics.cellWidth + metrics.columnGap);
      const top = metrics.rect.top + row * (metrics.cellHeight + metrics.rowGap);
      return {
        slot,
        column,
        row,
        left,
        top,
        right: left + metrics.cellWidth,
        bottom: top + metrics.cellHeight,
        centerX: left + metrics.cellWidth / 2,
        centerY: top + metrics.cellHeight / 2,
        pageCenterX: left - pageRect.left + metrics.cellWidth / 2,
        pageCenterY: top - pageRect.top + metrics.cellHeight / 2
      };
    }

    function findDesktopNearestSlot(meta, clientX, clientY) {
      const metrics = getDesktopGridMetrics(meta);
      if (!metrics) return null;
      const blockedSlots = meta && meta.kind === 'icon'
        ? getDesktopWidgetBlockedSlots(meta.pageIndex)
        : new Set();
      const clampedX = Math.max(metrics.rect.left, Math.min(clientX, metrics.rect.right));
      const clampedY = Math.max(metrics.rect.top, Math.min(clientY, metrics.rect.bottom));
      let bestSlot = null;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let slot = 0; slot < getDesktopSlotCount(meta); slot += 1) {
        if (blockedSlots.has(slot)) continue;
        const info = getDesktopSlotInfo(meta, slot);
        if (!info) continue;
        const distance = Math.hypot(clampedX - info.centerX, clampedY - info.centerY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestSlot = slot;
        }
      }
      return bestSlot;
    }

    function findDesktopNearestSlotFromItem(meta, item) {
      if (!meta || !meta.grid) return null;
      const rect = item.getBoundingClientRect();
      return findDesktopNearestSlot(meta, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    function findDesktopNearestWidgetStartSlotFromItem(meta, item) {
      if (!meta || !meta.grid || !item) return null;
      const metrics = getDesktopWidgetGridMetrics(meta.pageIndex, 'top');
      if (!metrics) return findDesktopNearestSlotFromItem(meta, item);
      const rect = item.getBoundingClientRect();
      const columnSpan = Math.max(1, Math.min(metrics.columns, getDesktopWidgetColumnSpan(meta, meta.pageIndex, 'top')));
      let bestSlot = null;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let slot = 0; slot < getDesktopSlotCount(meta); slot += 1) {
        const column = slot % metrics.columns;
        if (column + columnSpan > metrics.columns) continue;
        const info = getDesktopSlotInfo(meta, slot);
        if (!info) continue;
        const distance = Math.hypot(rect.left - info.left, rect.top - info.top);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestSlot = slot;
        }
      }
      return Number.isInteger(bestSlot) ? bestSlot : findDesktopNearestSlotFromItem(meta, item);
    }

    function getDesktopIconPlacementMeta(meta, pageIndex) {
      const pageMeta = getDesktopPageMeta(pageIndex);
      if (!pageMeta || !pageMeta.grid) return null;
      return {
        item: meta.item,
        page: pageMeta.page,
        grid: pageMeta.grid,
        pageIndex
      };
    }

    function findDesktopNearestSlotFromLegacyPosition(meta, left, top) {
      if (!meta || !meta.grid || !Number.isFinite(left) || !Number.isFinite(top)) return null;
      const itemRect = meta.item.getBoundingClientRect();
      const centerX = left + itemRect.width / 2;
      const centerY = top + itemRect.height / 2;
      let bestSlot = null;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let slot = 0; slot < getDesktopSlotCount(meta); slot += 1) {
        const info = getDesktopSlotInfo(meta, slot);
        if (!info) continue;
        const distance = Math.hypot(centerX - info.pageCenterX, centerY - info.pageCenterY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestSlot = slot;
        }
      }
      return bestSlot;
    }

    function readDesktopStoredPlacement(meta, saved) {
      if (!saved) return null;
      const pageIndex = Number(saved.page);
      if (!Number.isInteger(pageIndex) || pageIndex < 0 || pageIndex >= getDesktopPageCount()) return null;
      if (meta.kind === 'icon') {
        const slot = Number(saved.slot);
        if (Number.isInteger(slot) && slot >= 0 && slot < getDesktopSlotCount(pageIndex)) {
          return { pageIndex, slot };
        }
        const legacyMeta = getDesktopIconPlacementMeta(meta, pageIndex);
        const legacySlot = legacyMeta
          ? findDesktopNearestSlotFromLegacyPosition(legacyMeta, Number(saved.left), Number(saved.top))
          : null;
        return { pageIndex, slot: legacySlot };
      }
      const order = Number(saved.order);
      const slot = Number(saved.slot);
      return {
        pageIndex,
        region: 'top',
        slot: Number.isInteger(slot) && slot >= 0 && slot < getDesktopSlotCount(pageIndex)
          ? slot
          : (Number.isInteger(order) && order >= 0 && order < getDesktopSlotCount(pageIndex) ? order : null),
        order: Number.isInteger(order) ? order : null
      };
    }

    function setDesktopItemHidden(meta, hidden) {
      meta.hidden = !!hidden;
      meta.item.dataset.miniDesktopHidden = meta.hidden ? '1' : '0';
      if (meta.kind === 'icon') meta.item.style.display = meta.hidden ? 'none' : '';
    }

    function applyDesktopIconSlot(meta, slot) {
      if (!Number.isInteger(slot) || slot < 0 || slot >= getDesktopSlotCount(meta.pageIndex)) return;
      meta.slot = slot;
      meta.item.dataset.miniDesktopSlot = String(slot);
      meta.item.dataset.miniDesktopPage = String(meta.pageIndex);
      meta.item.style.gridColumnStart = String((slot % desktopGridColumns) + 1);
      meta.item.style.gridRowStart = String(Math.floor(slot / desktopGridColumns) + 1);
      meta.item.style.gridColumnEnd = 'auto';
      meta.item.style.gridRowEnd = 'auto';
    }

    function moveDesktopIconToPage(meta, pageIndex) {
      const pageMeta = getDesktopPageMeta(pageIndex);
      if (!pageMeta || !pageMeta.grid) return false;
      if (meta.item.parentElement !== pageMeta.grid) pageMeta.grid.appendChild(meta.item);
      meta.pageIndex = pageIndex;
      meta.page = pageMeta.page;
      meta.appsArea = pageMeta.appsArea;
      meta.grid = pageMeta.grid;
      meta.item.dataset.miniDesktopPage = String(pageIndex);
      return true;
    }

    function findDesktopIconBySlot(pageIndex, slot, excludeMeta = null) {
      return desktopLayoutState.icons.find((meta) => (
        meta !== excludeMeta &&
        !meta.hidden &&
        meta.pageIndex === pageIndex &&
        meta.slot === slot
      )) || null;
    }

    function getDesktopCoveredSlotsFromPlacement(slot, columnSpan, rowSpan) {
      if (!Number.isInteger(slot) || slot < 0) return null;
      if (!Number.isInteger(columnSpan) || columnSpan < 1) return null;
      if (!Number.isInteger(rowSpan) || rowSpan < 1) return null;
      const startColumn = slot % desktopGridColumns;
      const startRow = Math.floor(slot / desktopGridColumns);
      if (startColumn + columnSpan > desktopGridColumns) return null;
      if (startRow + rowSpan > desktopGridRows) return null;
      const covered = [];
      for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
        for (let columnOffset = 0; columnOffset < columnSpan; columnOffset += 1) {
          covered.push(((startRow + rowOffset) * desktopGridColumns) + startColumn + columnOffset);
        }
      }
      return covered;
    }

    function getDesktopWidgetPlacementSpan(meta, pageIndex) {
      if (!meta) return null;
      const metrics = getDesktopWidgetGridMetrics(pageIndex, 'top');
      if (!metrics) return null;
      const columnSpan = Math.max(1, Math.min(desktopGridColumns, getDesktopWidgetColumnSpan(meta, pageIndex, 'top')));
      const rowSpan = Math.max(1, getDesktopWidgetMeasuredRowSpan(meta, pageIndex, 'top', metrics));
      return { columnSpan, rowSpan };
    }

    function getDesktopWidgetCoveredSlots(pageIndex, meta, slot = getDesktopWidgetSlotValue(meta)) {
      const span = getDesktopWidgetPlacementSpan(meta, pageIndex);
      if (!span) return [];
      return getDesktopCoveredSlotsFromPlacement(slot, span.columnSpan, span.rowSpan) || [];
    }

    function getDesktopWidgetPlacementRect(pageIndex, meta, slot) {
      const pageMeta = getDesktopPageMeta(pageIndex);
      const span = getDesktopWidgetPlacementSpan(meta, pageIndex);
      const metrics = pageMeta && pageMeta.grid ? getDesktopGridMetrics(pageMeta) : null;
      if (!pageMeta || !metrics || !span) return null;
      const coveredSlots = getDesktopCoveredSlotsFromPlacement(slot, span.columnSpan, span.rowSpan);
      if (!coveredSlots || !coveredSlots.length) return null;
      const startColumn = slot % desktopGridColumns;
      const startRow = Math.floor(slot / desktopGridColumns);
      const left = metrics.rect.left + startColumn * (metrics.cellWidth + metrics.columnGap);
      const top = metrics.rect.top + startRow * (metrics.cellHeight + metrics.rowGap);
      const width = metrics.cellWidth * span.columnSpan + metrics.columnGap * Math.max(0, span.columnSpan - 1);
      const height = metrics.cellHeight * span.rowSpan + metrics.rowGap * Math.max(0, span.rowSpan - 1);
      return {
        left,
        top,
        right: left + width,
        bottom: top + height,
        centerX: left + width / 2,
        centerY: top + height / 2,
        columnSpan: span.columnSpan,
        rowSpan: span.rowSpan
      };
    }

    function getDesktopWidgetBlockedSlots(pageIndex, excludeMeta = null) {
      const excluded = Array.isArray(excludeMeta) ? excludeMeta : [excludeMeta];
      const blocked = new Set();
      const pageMeta = getDesktopPageMeta(pageIndex);
      if (!desktopLayoutState || !pageMeta || !pageMeta.grid) return blocked;
      const widgets = desktopLayoutState.widgets.filter((meta) => (
        !excluded.includes(meta) &&
        !meta.hidden &&
        meta.pageIndex === pageIndex
      ));
      if (!widgets.length) return blocked;
      widgets.forEach((meta) => {
        getDesktopWidgetCoveredSlots(pageIndex, meta).forEach((slot) => blocked.add(slot));
      });
      return blocked;
    }

    function getDesktopOccupiedSlots(pageIndex, excludeMetas = []) {
      const excluded = Array.isArray(excludeMetas) ? excludeMetas : [excludeMetas];
      const occupied = getDesktopWidgetBlockedSlots(pageIndex, excluded);
      desktopLayoutState.icons.forEach((meta) => {
        if (meta.hidden || meta.pageIndex !== pageIndex || excluded.includes(meta)) return;
        if (Number.isInteger(meta.slot)) occupied.add(meta.slot);
      });
      return occupied;
    }

    function findFirstFreeDesktopSlot(pageIndex, occupied) {
      for (let slot = 0; slot < getDesktopSlotCount(pageIndex); slot += 1) {
        if (!occupied.has(slot)) return slot;
      }
      return null;
    }

    function getDesktopOrderedIcons(pageIndex, excludeMeta = null) {
      return desktopLayoutState.icons
        .filter((meta) => meta !== excludeMeta && !meta.hidden && meta.pageIndex === pageIndex)
        .sort((left, right) => {
          const leftSlot = Number.isInteger(left.slot) ? left.slot : left.defaultSlot;
          const rightSlot = Number.isInteger(right.slot) ? right.slot : right.defaultSlot;
          if (leftSlot !== rightSlot) return leftSlot - rightSlot;
          return left.defaultSlot - right.defaultSlot;
        });
    }

    function getDesktopIconSlotInfo(pageIndex, slot) {
      const pageMeta = getDesktopPageMeta(pageIndex);
      if (!pageMeta || !pageMeta.grid) return null;
      return getDesktopSlotInfo({
        item: null,
        page: pageMeta.page,
        grid: pageMeta.grid,
        pageIndex
      }, slot);
    }

    function normalizeDesktopIconPage(pageIndex) {
      const pageMeta = getDesktopPageMeta(pageIndex);
      if (!pageMeta || !pageMeta.grid) return false;
      const ordered = getDesktopOrderedIcons(pageIndex);
      const occupied = getDesktopWidgetBlockedSlots(pageIndex);
      let changed = false;
      ordered.forEach((meta) => {
        const nextSlot = findFirstFreeDesktopSlot(pageIndex, occupied);
        if (!Number.isInteger(nextSlot)) return;
        if (meta.pageIndex !== pageIndex || meta.slot !== nextSlot) changed = true;
        moveDesktopIconToPage(meta, pageIndex);
        applyDesktopIconSlot(meta, nextSlot);
        occupied.add(nextSlot);
      });
      return changed;
    }

    function findDesktopIconInsertIndex(pageIndex, clientX, clientY, excludeMeta = null) {
      const ordered = getDesktopOrderedIcons(pageIndex, excludeMeta);
      const maxSlot = Math.min(getDesktopSlotCount(pageIndex) - 1, ordered.length);
      if (maxSlot < 0) return null;
      let bestSlot = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      let bestCenterDistance = Number.POSITIVE_INFINITY;
      for (let slot = 0; slot <= maxSlot; slot += 1) {
        const info = getDesktopIconSlotInfo(pageIndex, slot);
        if (!info) continue;
        const clampedX = Math.max(info.left, Math.min(clientX, info.right));
        const clampedY = Math.max(info.top, Math.min(clientY, info.bottom));
        const distance = Math.hypot(clientX - clampedX, clientY - clampedY);
        const centerDistance = Math.hypot(clientX - info.centerX, clientY - info.centerY);
        const isBetter = (
          distance < bestDistance - 0.5 ||
          (
            Math.abs(distance - bestDistance) <= 0.5 &&
            centerDistance < bestCenterDistance - 0.5
          )
        );
        if (!isBetter) continue;
        bestSlot = slot;
        bestDistance = distance;
        bestCenterDistance = centerDistance;
      }
      return bestSlot;
    }

    function applyDesktopIconOrder(meta, pageIndex, slotIndex) {
      const pageMeta = getDesktopPageMeta(pageIndex);
      if (!pageMeta || !pageMeta.grid) return false;
      const ordered = getDesktopOrderedIcons(pageIndex, meta);
      const capacity = getDesktopSlotCount(pageIndex);
      if (ordered.length >= capacity && meta.pageIndex !== pageIndex) return false;
      const previousPageIndex = meta.pageIndex;
      const previousSlot = meta.slot;
      const nextSlot = Math.max(0, Math.min(Number.isInteger(slotIndex) ? slotIndex : ordered.length, ordered.length));
      ordered.splice(nextSlot, 0, meta);
      ordered.forEach((item, index) => {
        moveDesktopIconToPage(item, pageIndex);
        applyDesktopIconSlot(item, index);
      });
      if (previousPageIndex !== pageIndex) {
        normalizeDesktopIconPage(previousPageIndex);
      }
      return previousPageIndex !== pageIndex || previousSlot !== nextSlot;
    }

    function getDesktopWidgetContainer(pageMeta, region = 'top') {
      if (!pageMeta) return null;
      return pageMeta.grid || pageMeta.widgetsArea || pageMeta.widgetsBelowArea || null;
    }

    function moveDesktopWidgetToPage(meta, pageIndex, region = 'top') {
      const pageMeta = getDesktopPageMeta(pageIndex);
      const targetRegion = 'top';
      const container = getDesktopWidgetContainer(pageMeta, targetRegion);
      if (!pageMeta || !container) return false;
      if (meta.item.parentElement !== container) container.appendChild(meta.item);
      meta.pageIndex = pageIndex;
      meta.page = pageMeta.page;
      meta.widgetsArea = container;
      meta.widgetRegion = targetRegion;
      meta.item.dataset.miniDesktopPage = String(pageIndex);
      meta.item.dataset.miniDesktopRegion = targetRegion;
      return true;
    }

    function getDesktopWidgetOrderValue(meta) {
      if (!meta) return 0;
      if (Number.isInteger(meta.order) && meta.order >= 0) return meta.order;
      const legacySlot = getDesktopWidgetSlotValue(meta);
      if (Number.isInteger(legacySlot) && legacySlot >= 0) return legacySlot;
      return Number.isInteger(meta.defaultOrder) ? meta.defaultOrder : 0;
    }

    function getDesktopWidgetColumnSpan(meta, pageIndex, region = 'top') {
      if (!meta || !meta.item) return 1;
      const metrics = getDesktopWidgetGridMetrics(pageIndex, region);
      const columns = metrics && Number.isInteger(metrics.columns) ? metrics.columns : desktopGridColumns;
      if (columns <= 1) return 1;
      if (meta.item.matches('.w-88, .w-90, .w-14')) return columns;
      return Math.min(columns, 2);
    }

    function refreshDesktopWidgetGridLayout(pageIndex, region = 'top') {
      const pageMeta = getDesktopPageMeta(pageIndex);
      const targetRegion = 'top';
      const container = getDesktopWidgetContainer(pageMeta, targetRegion);
      const metrics = getDesktopWidgetGridMetrics(pageIndex, targetRegion);
      if (!pageMeta || !container || !metrics) return false;
      const ordered = desktopLayoutState.widgets
        .filter((meta) => !meta.hidden && meta.pageIndex === pageIndex)
        .sort((left, right) => {
          const leftOrder = getDesktopWidgetSlotValue(left);
          const rightOrder = getDesktopWidgetSlotValue(right);
          if (leftOrder !== rightOrder) return leftOrder - rightOrder;
          return left.defaultOrder - right.defaultOrder;
        });
      const occupied = new Set();
      desktopLayoutState.icons.forEach((meta) => {
        if (meta.hidden || meta.pageIndex !== pageIndex || !Number.isInteger(meta.slot)) return;
        occupied.add(meta.slot);
      });
      let changed = false;
      ordered.forEach((meta, index) => {
        if (meta.item.parentElement !== container) container.appendChild(meta.item);
        const preferredSlots = [];
        if (Number.isInteger(meta.widgetSlot)) preferredSlots.push(meta.widgetSlot);
        if (Number.isInteger(meta.defaultSlot)) preferredSlots.push(meta.defaultSlot);
        let nextSlot = preferredSlots.find((slot) => {
          const coveredSlots = getDesktopWidgetCoveredSlots(pageIndex, meta, slot);
          return coveredSlots.length && coveredSlots.every((covered) => !occupied.has(covered));
        });
        if (!Number.isInteger(nextSlot)) {
          const rect = meta.item.getBoundingClientRect();
          const targetX = rect.width > 0 ? rect.left + rect.width / 2 : metrics.rect.left + metrics.cellWidth / 2;
          const targetY = rect.height > 0 ? rect.top + rect.height / 2 : metrics.rect.top + metrics.cellHeight / 2;
          nextSlot = findDesktopNearestLegalWidgetSlot(pageIndex, targetX, targetY, meta, occupied);
        }
        if (!Number.isInteger(nextSlot)) return;
        if (applyDesktopWidgetGridSlot(meta, pageIndex, targetRegion, nextSlot)) changed = true;
        getDesktopWidgetCoveredSlots(pageIndex, meta, nextSlot).forEach((slot) => occupied.add(slot));
      });
      return changed;
    }

    function normalizeDesktopWidgetPage(pageIndex, region = 'top') {
      const pageMeta = getDesktopPageMeta(pageIndex);
      const targetRegion = region === 'bottom' ? 'bottom' : 'top';
      const container = getDesktopWidgetContainer(pageMeta, targetRegion);
      if (!pageMeta || !container) return false;
      const useGridSlots = isDesktopGridWidgetContainer(pageIndex, targetRegion);
      const ordered = desktopLayoutState.widgets
        .filter((meta) => meta.pageIndex === pageIndex && (meta.widgetRegion || 'top') === targetRegion)
        .sort((left, right) => {
          const leftOrder = useGridSlots ? getDesktopWidgetOrderValue(left) : (Number.isInteger(left.order) ? left.order : left.defaultOrder);
          const rightOrder = useGridSlots ? getDesktopWidgetOrderValue(right) : (Number.isInteger(right.order) ? right.order : right.defaultOrder);
          if (leftOrder !== rightOrder) return leftOrder - rightOrder;
          return left.defaultOrder - right.defaultOrder;
        });
      let changed = false;
      if (useGridSlots) {
        ordered.forEach((meta, index) => {
          if (
            meta.pageIndex !== pageIndex ||
            (meta.widgetRegion || 'top') !== targetRegion ||
            getDesktopWidgetOrderValue(meta) !== index
          ) changed = true;
          meta.order = index;
          meta.widgetSlot = null;
        });
        refreshDesktopWidgetGridLayout(pageIndex, targetRegion);
        return changed;
      }
      ordered.forEach((meta, index) => {
        container.appendChild(meta.item);
        if (meta.order !== index) changed = true;
        meta.pageIndex = pageIndex;
        meta.page = pageMeta.page;
        meta.widgetsArea = container;
        meta.widgetRegion = targetRegion;
        meta.widgetSlot = null;
        meta.order = index;
        meta.item.dataset.miniDesktopOrder = String(index);
        meta.item.dataset.miniDesktopPage = String(pageIndex);
        meta.item.dataset.miniDesktopRegion = targetRegion;
        resetDesktopWidgetGridPlacement(meta);
      });
      return changed;
    }

    function applyDesktopWidgetOrder(meta, pageIndex, region, orderIndex) {
      const pageMeta = getDesktopPageMeta(pageIndex);
      const targetRegion = region === 'bottom' ? 'bottom' : 'top';
      const container = getDesktopWidgetContainer(pageMeta, targetRegion);
      if (!pageMeta || !container) return false;
      const useGridSlots = isDesktopGridWidgetContainer(pageIndex, targetRegion);
      const previousPageIndex = meta.pageIndex;
      const previousRegion = meta.widgetRegion || 'top';
      const previousOrder = useGridSlots ? getDesktopWidgetOrderValue(meta) : meta.order;
      if (useGridSlots) {
        const ordered = desktopLayoutState.widgets
          .filter((item) => item !== meta && item.pageIndex === pageIndex && (item.widgetRegion || 'top') === targetRegion)
          .sort((left, right) => {
            const leftOrder = getDesktopWidgetOrderValue(left);
            const rightOrder = getDesktopWidgetOrderValue(right);
            if (leftOrder !== rightOrder) return leftOrder - rightOrder;
            return left.defaultOrder - right.defaultOrder;
          });
        const nextOrder = Math.max(0, Math.min(Number.isInteger(orderIndex) ? orderIndex : 0, ordered.length));
        ordered.splice(nextOrder, 0, meta);
        ordered.forEach((item, index) => {
          item.pageIndex = pageIndex;
          item.page = pageMeta.page;
          item.widgetsArea = container;
          item.widgetRegion = targetRegion;
          item.widgetSlot = null;
          item.order = index;
          item.item.dataset.miniDesktopOrder = String(index);
          item.item.dataset.miniDesktopPage = String(pageIndex);
          item.item.dataset.miniDesktopRegion = targetRegion;
        });
        refreshDesktopWidgetGridLayout(pageIndex, targetRegion);
        if (previousPageIndex !== pageIndex || previousRegion !== targetRegion) {
          normalizeDesktopWidgetPage(previousPageIndex, previousRegion);
        }
        return previousPageIndex !== pageIndex || previousRegion !== targetRegion || previousOrder !== nextOrder;
      }
      const ordered = desktopLayoutState.widgets
        .filter((item) => item !== meta && item.pageIndex === pageIndex && (item.widgetRegion || 'top') === targetRegion)
        .sort((left, right) => {
          const leftOrder = Number.isInteger(left.order) ? left.order : left.defaultOrder;
          const rightOrder = Number.isInteger(right.order) ? right.order : right.defaultOrder;
          if (leftOrder !== rightOrder) return leftOrder - rightOrder;
          return left.defaultOrder - right.defaultOrder;
        });
      const nextOrder = Math.max(0, Math.min(orderIndex, ordered.length));
      ordered.splice(nextOrder, 0, meta);
      ordered.forEach((item, index) => {
        container.appendChild(item.item);
        item.pageIndex = pageIndex;
        item.page = pageMeta.page;
        item.widgetsArea = container;
        item.widgetRegion = targetRegion;
        item.widgetSlot = null;
        item.order = index;
        item.item.dataset.miniDesktopOrder = String(index);
        item.item.dataset.miniDesktopPage = String(pageIndex);
        item.item.dataset.miniDesktopRegion = targetRegion;
        resetDesktopWidgetGridPlacement(item);
      });
      if (previousPageIndex !== pageIndex || previousRegion !== targetRegion) {
        normalizeDesktopWidgetPage(previousPageIndex, previousRegion);
      }
      return previousPageIndex !== pageIndex || previousRegion !== targetRegion || previousOrder !== nextOrder;
    }

    function getDesktopWidgetDropRegion(pageIndex, clientY) {
      return 'top';
    }

    function getDesktopMeasuredWidgets(pageIndex, region = 'top', excludeMeta = null) {
      const targetRegion = region === 'bottom' ? 'bottom' : 'top';
      return desktopLayoutState.widgets
        .filter((meta) => meta !== excludeMeta && !meta.hidden && meta.pageIndex === pageIndex && (meta.widgetRegion || 'top') === targetRegion)
        .map((meta) => {
          const rect = meta.item.getBoundingClientRect();
          return {
            meta,
            rect,
            centerX: rect.left + (rect.width / 2),
            centerY: rect.top + (rect.height / 2)
          };
        })
        .sort((left, right) => {
          if (Math.abs(left.rect.top - right.rect.top) <= 18) {
            if (Math.abs(left.rect.left - right.rect.left) <= 18) {
              return left.centerY - right.centerY;
            }
            return left.rect.left - right.rect.left;
          }
          return left.rect.top - right.rect.top;
        });
    }

    function isDesktopGridWidgetContainer(pageIndex, region = 'top') {
      const pageMeta = getDesktopPageMeta(pageIndex);
      return !!(pageMeta && pageMeta.grid);
    }

    function getDesktopGridTrackCount(trackList) {
      const value = String(trackList || '').trim();
      if (!value || value === 'none') return 0;
      const tracks = [];
      let token = '';
      let parenDepth = 0;
      let bracketDepth = 0;
      for (let index = 0; index < value.length; index += 1) {
        const char = value[index];
        if (char === '(') parenDepth += 1;
        else if (char === ')') parenDepth = Math.max(0, parenDepth - 1);
        else if (char === '[') bracketDepth += 1;
        else if (char === ']') bracketDepth = Math.max(0, bracketDepth - 1);
        if (/\s/.test(char) && parenDepth === 0 && bracketDepth === 0) {
          if (token.trim()) tracks.push(token.trim());
          token = '';
          continue;
        }
        token += char;
      }
      if (token.trim()) tracks.push(token.trim());
      return tracks.reduce((count, track) => {
        const repeatMatch = track.match(/^repeat\(\s*(\d+)\s*,/i);
        if (repeatMatch) return count + Math.max(0, Number(repeatMatch[1]) || 0);
        return count + 1;
      }, 0);
    }

    function getDesktopGridTrackPixels(trackList) {
      const value = String(trackList || '').trim();
      if (!value || value === 'none') return [];
      const tracks = [];
      let token = '';
      let parenDepth = 0;
      let bracketDepth = 0;
      for (let index = 0; index < value.length; index += 1) {
        const char = value[index];
        if (char === '(') parenDepth += 1;
        else if (char === ')') parenDepth = Math.max(0, parenDepth - 1);
        else if (char === '[') bracketDepth += 1;
        else if (char === ']') bracketDepth = Math.max(0, bracketDepth - 1);
        if (/\s/.test(char) && parenDepth === 0 && bracketDepth === 0) {
          if (token.trim()) tracks.push(token.trim());
          token = '';
          continue;
        }
        token += char;
      }
      if (token.trim()) tracks.push(token.trim());
      return tracks.map((track) => {
        const match = track.match(/(-?\d+(?:\.\d+)?)px/i);
        return match ? Number(match[1]) || 0 : 0;
      }).filter((value) => value > 0);
    }

    function getDesktopWidgetGridMetrics(pageIndex, region = 'top') {
      const pageMeta = getDesktopPageMeta(pageIndex);
      if (!pageMeta || !pageMeta.grid) return null;
      const metrics = getDesktopGridMetrics(pageMeta);
      if (!metrics) return null;
      return {
        rect: metrics.rect,
        columns: desktopGridColumns,
        columnGap: metrics.columnGap,
        rowGap: metrics.rowGap,
        autoRows: metrics.cellHeight,
        cellWidth: metrics.cellWidth,
        cellHeight: metrics.cellHeight
      };
    }

    function parseDesktopAspectRatioValue(value) {
      const raw = String(value || '').trim();
      if (!raw || raw === 'auto') return 0;
      if (raw.includes('/')) {
        const parts = raw.split('/').map((part) => Number(part.trim()));
        if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) return parts[0] / parts[1];
      }
      const numeric = Number(raw);
      return numeric > 0 ? numeric : 0;
    }

    function getDesktopWidgetPlacementWidth(meta, pageIndex, region = 'top', metrics = null) {
      const resolvedMetrics = metrics || getDesktopWidgetGridMetrics(pageIndex, region);
      if (!meta || !resolvedMetrics) return 0;
      const columnSpan = Math.max(1, Math.min(resolvedMetrics.columns, getDesktopWidgetColumnSpan(meta, pageIndex, region)));
      return (resolvedMetrics.cellWidth * columnSpan) + (resolvedMetrics.columnGap * Math.max(0, columnSpan - 1));
    }

    function getDesktopWidgetMeasuredHeight(meta) {
      if (!meta || !meta.item) return 0;
      const active = desktopLayoutState && desktopLayoutState.active;
      if (active && active.meta === meta && active.dragRect && active.dragRect.height > 0) {
        return active.dragRect.height;
      }
      return meta.item.getBoundingClientRect().height || 0;
    }

    function getDesktopWidgetMeasuredRowSpan(meta, pageIndex, region = 'top', metrics = null) {
      const resolvedMetrics = metrics || getDesktopWidgetGridMetrics(pageIndex, region);
      if (!meta || !resolvedMetrics) return 1;
      let height = getDesktopWidgetMeasuredHeight(meta);
      const aspectRatio = parseDesktopAspectRatioValue(window.getComputedStyle(meta.item).aspectRatio);
      if (aspectRatio > 0) {
        const targetWidth = getDesktopWidgetPlacementWidth(meta, pageIndex, region, resolvedMetrics);
        if (targetWidth > 0) height = targetWidth / aspectRatio;
      }
      if (!(height > 0)) return 1;
      return Math.max(1, Math.ceil((height + resolvedMetrics.rowGap) / (resolvedMetrics.autoRows + resolvedMetrics.rowGap)));
    }

    function getDesktopOrderedWidgets(pageIndex, region = 'top', excludeMeta = null) {
      const targetRegion = region === 'bottom' ? 'bottom' : 'top';
      return desktopLayoutState.widgets
        .filter((meta) => meta !== excludeMeta && !meta.hidden && meta.pageIndex === pageIndex && (meta.widgetRegion || 'top') === targetRegion)
        .sort((left, right) => {
          const leftOrder = getDesktopWidgetOrderValue(left);
          const rightOrder = getDesktopWidgetOrderValue(right);
          if (leftOrder !== rightOrder) return leftOrder - rightOrder;
          return left.defaultOrder - right.defaultOrder;
        });
    }

    function getDesktopWidgetSimulatedPlacement(pageIndex, region = 'top', targetMeta = null, insertIndex = 0) {
      const metrics = getDesktopWidgetGridMetrics(pageIndex, region);
      if (!metrics || !targetMeta) return null;
      const ordered = getDesktopOrderedWidgets(pageIndex, region, targetMeta);
      const nextIndex = Math.max(0, Math.min(Number.isInteger(insertIndex) ? insertIndex : ordered.length, ordered.length));
      ordered.splice(nextIndex, 0, targetMeta);
      const occupancy = [];
      const ensureRow = (rowIndex) => {
        while (occupancy.length <= rowIndex) occupancy.push(Array(metrics.columns).fill(false));
      };
      const canFit = (rowIndex, columnIndex, columnSpan, rowSpan) => {
        for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
          ensureRow(rowIndex + rowOffset);
          for (let columnOffset = 0; columnOffset < columnSpan; columnOffset += 1) {
            if (occupancy[rowIndex + rowOffset][columnIndex + columnOffset]) return false;
          }
        }
        return true;
      };
      const placeItem = (meta) => {
        const columnSpan = Math.max(1, Math.min(metrics.columns, getDesktopWidgetColumnSpan(meta, pageIndex, region)));
        const rowSpan = getDesktopWidgetMeasuredRowSpan(meta, pageIndex, region, metrics);
        const rowLimit = Math.max(32, ordered.length * Math.max(2, rowSpan + 2));
        for (let rowIndex = 0; rowIndex < rowLimit; rowIndex += 1) {
          for (let columnIndex = 0; columnIndex <= metrics.columns - columnSpan; columnIndex += 1) {
            if (!canFit(rowIndex, columnIndex, columnSpan, rowSpan)) continue;
            for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
              ensureRow(rowIndex + rowOffset);
              for (let columnOffset = 0; columnOffset < columnSpan; columnOffset += 1) {
                occupancy[rowIndex + rowOffset][columnIndex + columnOffset] = true;
              }
            }
            const left = metrics.rect.left + columnIndex * (metrics.cellWidth + metrics.columnGap);
            const top = metrics.rect.top + rowIndex * (metrics.autoRows + metrics.rowGap);
            const width = metrics.cellWidth * columnSpan + metrics.columnGap * Math.max(0, columnSpan - 1);
            const height = metrics.autoRows * rowSpan + metrics.rowGap * Math.max(0, rowSpan - 1);
            return {
              meta,
              index: nextIndex,
              left,
              top,
              right: left + width,
              bottom: top + height,
              centerX: left + width / 2,
              centerY: top + height / 2
            };
          }
        }
        return null;
      };
      for (const meta of ordered) {
        const placement = placeItem(meta);
        if (meta === targetMeta) return placement;
      }
      return null;
    }

    function getDesktopWidgetSlotValue(meta) {
      if (!meta) return null;
      if (Number.isInteger(meta.widgetSlot) && meta.widgetSlot >= 0) return meta.widgetSlot;
      if (Number.isInteger(meta.order) && meta.order >= 0) return meta.order;
      if (Number.isInteger(meta.defaultSlot) && meta.defaultSlot >= 0) return meta.defaultSlot;
      return Number.isInteger(meta.defaultOrder) ? meta.defaultOrder : null;
    }

    function getDesktopWidgetOccupiedSlots(pageIndex, region = 'top', excludeMetas = []) {
      const excluded = Array.isArray(excludeMetas) ? excludeMetas : [excludeMetas];
      const occupied = new Set();
      desktopLayoutState.widgets.forEach((meta) => {
        if (meta.hidden || meta.pageIndex !== pageIndex || excluded.includes(meta)) return;
        getDesktopWidgetCoveredSlots(pageIndex, meta).forEach((slot) => occupied.add(slot));
      });
      return occupied;
    }

    function findFirstFreeDesktopWidgetSlot(pageIndex, region = 'top', occupied = new Set()) {
      const maxChecks = Math.max(12, occupied.size + 8);
      for (let slot = 0; slot < maxChecks; slot += 1) {
        if (!occupied.has(slot)) return slot;
      }
      return occupied.size;
    }

    function findDesktopWidgetBySlot(pageIndex, region = 'top', slot, excludeMeta = null) {
      const targetRegion = region === 'bottom' ? 'bottom' : 'top';
      return desktopLayoutState.widgets.find((meta) => (
        meta !== excludeMeta &&
        !meta.hidden &&
        meta.pageIndex === pageIndex &&
        (meta.widgetRegion || 'top') === targetRegion &&
        getDesktopWidgetSlotValue(meta) === slot
      )) || null;
    }

    function resetDesktopWidgetGridPlacement(meta) {
      if (!meta || !meta.item) return;
      meta.item.style.order = '';
      meta.item.style.width = '';
      meta.item.style.maxWidth = '';
      meta.item.style.gridColumnStart = 'auto';
      meta.item.style.gridRowStart = 'auto';
      meta.item.style.gridColumnEnd = 'auto';
      meta.item.style.gridRowEnd = 'auto';
      meta.item.dataset.miniDesktopWidgetSlot = '';
    }

    function applyDesktopWidgetGridSlot(meta, pageIndex, region = 'top', slot) {
      const pageMeta = getDesktopPageMeta(pageIndex);
      const targetRegion = 'top';
      const container = getDesktopWidgetContainer(pageMeta, targetRegion);
      const metrics = getDesktopWidgetGridMetrics(pageIndex, targetRegion);
      if (!pageMeta || !container || !metrics || !Number.isInteger(slot) || slot < 0) return false;
      const columnSpan = Math.max(1, Math.min(metrics.columns, getDesktopWidgetColumnSpan(meta, pageIndex, targetRegion)));
      const initialSlots = getDesktopCoveredSlotsFromPlacement(slot, columnSpan, 1);
      if (!initialSlots || !initialSlots.length) return false;
      const previousPageIndex = meta.pageIndex;
      const previousRegion = meta.widgetRegion || 'top';
      const previousSlot = getDesktopWidgetSlotValue(meta);
      if (meta.item.parentElement !== container) container.appendChild(meta.item);
      meta.pageIndex = pageIndex;
      meta.page = pageMeta.page;
      meta.widgetsArea = container;
      meta.widgetRegion = targetRegion;
      meta.widgetSlot = slot;
      meta.order = slot;
      meta.item.dataset.miniDesktopPage = String(pageIndex);
      meta.item.dataset.miniDesktopRegion = targetRegion;
      meta.item.dataset.miniDesktopOrder = String(slot);
      meta.item.dataset.miniDesktopWidgetSlot = String(slot);
      meta.item.style.order = '';
      const placementWidth = getDesktopWidgetPlacementWidth(meta, pageIndex, targetRegion, metrics);
      if (placementWidth > 0) {
        meta.item.style.width = `${Math.round(placementWidth)}px`;
        meta.item.style.maxWidth = `${Math.round(placementWidth)}px`;
      } else {
        meta.item.style.width = '';
        meta.item.style.maxWidth = '';
      }
      meta.item.style.gridColumnStart = String((slot % desktopGridColumns) + 1);
      meta.item.style.gridRowStart = String(Math.floor(slot / desktopGridColumns) + 1);
      meta.item.style.gridColumnEnd = `span ${columnSpan}`;
      meta.item.style.gridRowEnd = 'span 1';
      const rowSpan = Math.max(1, getDesktopWidgetMeasuredRowSpan(meta, pageIndex, targetRegion, metrics));
      const coveredSlots = getDesktopCoveredSlotsFromPlacement(slot, columnSpan, rowSpan);
      if (!coveredSlots || !coveredSlots.length) return false;
      meta.item.style.gridRowEnd = `span ${rowSpan}`;
      return previousPageIndex !== pageIndex || previousRegion !== targetRegion || previousSlot !== slot;
    }

    function canPlaceDesktopWidgetAtSlot(pageIndex, meta, slot, excludeMetas = [], occupied = null) {
      const coveredSlots = getDesktopWidgetCoveredSlots(pageIndex, meta, slot);
      if (!coveredSlots.length) return false;
      const nextOccupied = occupied || getDesktopOccupiedSlots(pageIndex, excludeMetas);
      return coveredSlots.every((covered) => !nextOccupied.has(covered));
    }

    function findDesktopNearestLegalIconSlot(pageIndex, clientX, clientY, excludeMeta = null, occupied = null) {
      const nextOccupied = occupied || getDesktopOccupiedSlots(pageIndex, excludeMeta);
      let bestSlot = null;
      let bestDistance = Number.POSITIVE_INFINITY;
      let bestCenterDistance = Number.POSITIVE_INFINITY;
      for (let slot = 0; slot < getDesktopSlotCount(pageIndex); slot += 1) {
        if (nextOccupied.has(slot)) continue;
        const info = getDesktopIconSlotInfo(pageIndex, slot);
        if (!info) continue;
        const clampedX = Math.max(info.left, Math.min(clientX, info.right));
        const clampedY = Math.max(info.top, Math.min(clientY, info.bottom));
        const distance = Math.hypot(clientX - clampedX, clientY - clampedY);
        const centerDistance = Math.hypot(clientX - info.centerX, clientY - info.centerY);
        const isBetter = (
          distance < bestDistance - 0.5 ||
          (
            Math.abs(distance - bestDistance) <= 0.5 &&
            centerDistance < bestCenterDistance - 0.5
          )
        );
        if (!isBetter) continue;
        bestSlot = slot;
        bestDistance = distance;
        bestCenterDistance = centerDistance;
      }
      return bestSlot;
    }

    function findDesktopNearestLegalWidgetSlot(pageIndex, clientX, clientY, excludeMeta = null, occupied = null) {
      if (!excludeMeta) return null;
      let bestSlot = null;
      let bestDistance = Number.POSITIVE_INFINITY;
      let bestCenterDistance = Number.POSITIVE_INFINITY;
      for (let slot = 0; slot < getDesktopSlotCount(pageIndex); slot += 1) {
        if (!canPlaceDesktopWidgetAtSlot(pageIndex, excludeMeta, slot, excludeMeta, occupied)) continue;
        const placement = getDesktopWidgetPlacementRect(pageIndex, excludeMeta, slot);
        if (!placement) continue;
        const clampedX = Math.max(placement.left, Math.min(clientX, placement.right));
        const clampedY = Math.max(placement.top, Math.min(clientY, placement.bottom));
        const distance = Math.hypot(clientX - clampedX, clientY - clampedY);
        const centerDistance = Math.hypot(clientX - placement.centerX, clientY - placement.centerY);
        const isBetter = (
          distance < bestDistance - 0.5 ||
          (
            Math.abs(distance - bestDistance) <= 0.5 &&
            centerDistance < bestCenterDistance - 0.5
          )
        );
        if (!isBetter) continue;
        bestSlot = slot;
        bestDistance = distance;
        bestCenterDistance = centerDistance;
      }
      return bestSlot;
    }

    function getDesktopWidgetFallbackHeight(pageIndex, region = 'top', excludeMeta = null) {
      const targetRegion = region === 'bottom' ? 'bottom' : 'top';
      const heights = desktopLayoutState.widgets
        .filter((meta) => meta !== excludeMeta && !meta.hidden && meta.pageIndex === pageIndex && (meta.widgetRegion || 'top') === targetRegion)
        .map((meta) => meta.item.getBoundingClientRect().height)
        .filter((value) => value > 0);
      if (excludeMeta && excludeMeta.dragRect && excludeMeta.dragRect.height > 0) heights.push(excludeMeta.dragRect.height);
      if (!heights.length) return 160;
      return Math.max(1, Math.max(...heights));
    }

    function getDesktopWidgetGridSlotInfo(pageIndex, region = 'top', slot, excludeMeta = null) {
      const metrics = getDesktopWidgetGridMetrics(pageIndex, region);
      if (!metrics || !Number.isInteger(slot) || slot < 0) return null;
      const targetRegion = region === 'bottom' ? 'bottom' : 'top';
      const fallbackHeight = getDesktopWidgetFallbackHeight(pageIndex, targetRegion, excludeMeta);
      const rowHeights = [];
      desktopLayoutState.widgets
        .filter((meta) => meta !== excludeMeta && !meta.hidden && meta.pageIndex === pageIndex && (meta.widgetRegion || 'top') === targetRegion)
        .forEach((meta) => {
          const currentSlot = getDesktopWidgetSlotValue(meta);
          if (!Number.isInteger(currentSlot) || currentSlot < 0) return;
          const rowIndex = Math.floor(currentSlot / metrics.columns);
          const height = meta.item.getBoundingClientRect().height || fallbackHeight;
          rowHeights[rowIndex] = Math.max(rowHeights[rowIndex] || 0, height);
        });
      const row = Math.floor(slot / metrics.columns);
      const column = slot % metrics.columns;
      let top = metrics.rect.top;
      for (let index = 0; index < row; index += 1) {
        top += (rowHeights[index] || fallbackHeight) + metrics.rowGap;
      }
      const height = rowHeights[row] || fallbackHeight;
      const left = metrics.rect.left + column * (metrics.cellWidth + metrics.columnGap);
      return {
        slot,
        row,
        column,
        left,
        top,
        right: left + metrics.cellWidth,
        bottom: top + height,
        centerX: left + metrics.cellWidth / 2,
        centerY: top + height / 2
      };
    }

    function findDesktopNearestWidgetSlot(pageIndex, clientX, clientY, excludeMeta = null, region = 'top') {
      const metrics = getDesktopWidgetGridMetrics(pageIndex, region);
      if (!metrics) return null;
      const occupied = getDesktopWidgetOccupiedSlots(pageIndex, region, excludeMeta);
      const fallbackHeight = getDesktopWidgetFallbackHeight(pageIndex, region, excludeMeta);
      const totalItems = occupied.size + 1;
      const maxRow = Math.max(0, Math.ceil(totalItems / metrics.columns) - 1);
      const maxSlot = ((maxRow + 1) * metrics.columns) - 1;
      let bestSlot = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let slot = 0; slot <= maxSlot; slot += 1) {
        const info = getDesktopWidgetGridSlotInfo(pageIndex, region, slot, excludeMeta);
        if (!info) continue;
        const distance = Math.hypot(clientX - info.centerX, clientY - info.centerY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestSlot = slot;
        }
      }
      return bestSlot;
    }

    function findDesktopWidgetInsertIndex(pageIndex, clientX, clientY, excludeMeta = null, region = 'top') {
      const ordered = getDesktopOrderedWidgets(pageIndex, region, excludeMeta);
      if (!excludeMeta || !ordered.length) return 0;
      const currentOrder = Math.max(0, Math.min(getDesktopWidgetOrderValue(excludeMeta), ordered.length));
      let bestIndex = currentOrder;
      let bestDistance = Number.POSITIVE_INFINITY;
      let bestCenterDistance = Number.POSITIVE_INFINITY;
      let bestOrderBias = Number.POSITIVE_INFINITY;
      for (let index = 0; index <= ordered.length; index += 1) {
        const placement = getDesktopWidgetSimulatedPlacement(pageIndex, region, excludeMeta, index);
        if (!placement) continue;
        const clampedX = Math.max(placement.left, Math.min(clientX, placement.right));
        const clampedY = Math.max(placement.top, Math.min(clientY, placement.bottom));
        const distance = Math.hypot(clientX - clampedX, clientY - clampedY);
        const centerDistance = Math.hypot(clientX - placement.centerX, clientY - placement.centerY);
        const orderBias = Math.abs(index - currentOrder);
        const isBetter = (
          distance < bestDistance - 0.5 ||
          (
            Math.abs(distance - bestDistance) <= 0.5 && (
              centerDistance < bestCenterDistance - 0.5 ||
              (
                Math.abs(centerDistance - bestCenterDistance) <= 0.5 &&
                orderBias < bestOrderBias
              )
            )
          )
        );
        if (!isBetter) continue;
        bestIndex = index;
        bestDistance = distance;
        bestCenterDistance = centerDistance;
        bestOrderBias = orderBias;
      }
      return bestIndex;
    }

    function serializeDesktopLayout() {
      return desktopLayoutState.items.reduce((result, meta) => {
        result[meta.id] = meta.kind === 'icon'
          ? {
              kind: 'icon',
              page: meta.pageIndex,
              slot: Number.isInteger(meta.slot) ? meta.slot : meta.defaultSlot
            }
          : {
              kind: 'widget',
              page: meta.pageIndex,
              region: 'top',
              slot: Number.isInteger(meta.widgetSlot) ? meta.widgetSlot : (Number.isInteger(meta.order) ? meta.order : meta.defaultSlot),
              order: Number.isInteger(meta.widgetSlot) ? meta.widgetSlot : (Number.isInteger(meta.order) ? meta.order : meta.defaultOrder)
            };
        return result;
      }, {});
    }

    function queueDesktopLayoutSave() {
      if (!desktopLayoutState) return;
      window.clearTimeout(desktopLayoutState.saveTimer);
      if (!desktopLayoutState.hydrated) {
        if (desktopLayoutState.saveAfterHydrateQueued) return;
        desktopLayoutState.saveAfterHydrateQueued = true;
        Promise.resolve(hydrateDesktopLayout())
          .catch(() => null)
          .finally(() => {
            desktopLayoutState.saveAfterHydrateQueued = false;
            if (desktopLayoutState.hydrated) queueDesktopLayoutSave();
          });
        return;
      }
      desktopLayoutState.saveTimer = window.setTimeout(() => {
        writeDesktopLayout(serializeDesktopLayout());
      }, 80);
    }

    function updateDesktopPager() {
      if (!desktopLayoutState) return;
      desktopLayoutState.currentPageIndex = getDesktopCurrentPageIndex();
      if (!desktopLayoutState.pager) return;
      Array.from(desktopLayoutState.pager.children).forEach((node, index) => {
        node.classList.toggle('active', index === desktopLayoutState.currentPageIndex);
      });
    }

    function scrollDesktopToPage(pageIndex, behavior = 'smooth') {
      if (!desktopLayoutState) return;
      const container = getDesktopScrollContainer();
      const pageCount = getDesktopPageCount();
      if (!container || !pageCount) return;
      const nextIndex = Math.max(0, Math.min(pageCount - 1, pageIndex));
      desktopLayoutState.currentPageIndex = nextIndex;
      container.scrollTo({
        left: nextIndex * (container.clientWidth || window.innerWidth || 1),
        behavior
      });
      updateDesktopPager();
    }

    function showDesktopPageHint(message, direction = 0) {
      if (!desktopLayoutState || !desktopLayoutState.pageHint) return;
      const hint = desktopLayoutState.pageHint;
      hint.textContent = message;
      hint.classList.remove('is-left', 'is-right');
      if (direction < 0) hint.classList.add('is-left');
      if (direction > 0) hint.classList.add('is-right');
      hint.classList.add('show');
    }

    function hideDesktopPageHint() {
      if (!desktopLayoutState || !desktopLayoutState.pageHint) return;
      desktopLayoutState.pageHint.classList.remove('show', 'is-left', 'is-right');
    }

    function clearDesktopPageTurnTimer(hideHint = true) {
      if (!desktopLayoutState) return;
      window.clearTimeout(desktopLayoutState.pageTurnTimer);
      desktopLayoutState.pageTurnTimer = 0;
      desktopLayoutState.pageTurnTarget = null;
      if (hideHint) hideDesktopPageHint();
    }

    function ensureDesktopPager() {
      if (!desktopLayoutState || desktopLayoutState.pagerReady) return;
      const pageCount = getDesktopPageCount();
      if (!pageCount) return;
      let pager = document.querySelector('.mini-desktop-page-indicator');
      if (!pager) {
        pager = document.createElement('div');
        pager.className = 'mini-desktop-page-indicator';
        document.body.appendChild(pager);
      }
      pager.innerHTML = '';
      for (let index = 0; index < pageCount; index += 1) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'mini-desktop-page-dot';
        dot.setAttribute('aria-label', `Page ${index + 1}`);
        dot.addEventListener('click', () => scrollDesktopToPage(index));
        pager.appendChild(dot);
      }
      let hint = document.querySelector('.mini-desktop-page-hint');
      if (!hint) {
        hint = document.createElement('div');
        hint.className = 'mini-desktop-page-hint';
        document.body.appendChild(hint);
      }
      desktopLayoutState.pager = pager;
      desktopLayoutState.pageHint = hint;
      desktopLayoutState.pagerReady = true;
      updateDesktopPager();
    }

    function installDesktopPagerSync() {
      if (!desktopLayoutState || desktopLayoutState.scrollBound) return;
      const container = getDesktopScrollContainer();
      if (!container) return;
      desktopLayoutState.scrollBound = true;
      container.addEventListener('scroll', () => {
        window.requestAnimationFrame(updateDesktopPager);
      }, { passive: true });
    }

    function detachDesktopDragListeners() {
      if (!desktopLayoutState || !desktopLayoutState.listenersAttached) return;
      desktopLayoutState.listenersAttached = false;
      window.removeEventListener('mousemove', handleDesktopMouseMove, true);
      window.removeEventListener('mouseup', handleDesktopDragEnd, true);
      window.removeEventListener('touchmove', handleDesktopTouchMove, true);
      window.removeEventListener('touchend', handleDesktopDragEnd, true);
      window.removeEventListener('touchcancel', handleDesktopDragEnd, true);
      window.removeEventListener('blur', handleDesktopDragEnd, true);
    }

    function toggleDesktopSortMode(enabled) {
      document.body.classList.toggle('mini-desktop-sort-mode', !!enabled);
      const container = getDesktopScrollContainer();
      if (container) container.classList.toggle('mini-desktop-sort-mode', !!enabled);
    }

    function clearDesktopLongPressTimer(active = desktopLayoutState && desktopLayoutState.active) {
      if (!active) return;
      window.clearTimeout(active.longPressTimer);
      active.longPressTimer = 0;
    }

    function scheduleDesktopLongPress(active) {
      if (!active) return;
      clearDesktopLongPressTimer(active);
      active.longPressTimer = window.setTimeout(() => {
        if (!desktopLayoutState || desktopLayoutState.active !== active) return;
        active.pressReady = true;
        toggleDesktopSortMode(true);
      }, desktopLongPressDelay);
    }

    function cancelDesktopPendingDrag() {
      if (!desktopLayoutState || !desktopLayoutState.active) return;
      const active = desktopLayoutState.active;
      if (active.pressReady || active.dragging) return;
      finishDesktopDrag(false);
    }

    function ensureDesktopDragStarted(clientX, clientY, event) {
      if (!desktopLayoutState || !desktopLayoutState.active) return false;
      const active = desktopLayoutState.active;
      active.lastClientX = clientX;
      active.lastClientY = clientY;
      if (!active.pressReady) return false;
      if (active.dragging) return true;
      if (Math.hypot(clientX - active.startClientX, clientY - active.startClientY) < desktopDragStartThreshold) {
        return false;
      }
      clearDesktopLongPressTimer(active);
      active.dragging = true;
      active.travelled = true;
      active.meta.item.classList.add('mini-desktop-dragging');
      createDesktopDragGhost(active);
      updateDesktopDragGhostPosition(active, clientX, clientY);
      if (event && typeof event.preventDefault === 'function') event.preventDefault();
      return true;
    }

    function finishDesktopDrag(shouldPersist) {
      if (!desktopLayoutState || !desktopLayoutState.active) return;
      const active = desktopLayoutState.active;
      desktopLayoutState.active = null;
      clearDesktopLongPressTimer(active);
      clearDesktopPageTurnTimer();
      detachDesktopDragListeners();
      removeDesktopDragGhost(active);
      active.meta.item.classList.remove('mini-desktop-dragging');
      toggleDesktopSortMode(false);
      if (active.pressReady || (active.dragging && (active.travelled || active.moved))) {
        active.meta.item.dataset.miniSuppressClickUntil = String(Date.now() + 250);
      }
      updateDesktopPager();
      if (active.dragging && active.moved && shouldPersist) {
        queueDesktopLayoutSave();
      }
    }

    function scheduleDesktopPageTurn(direction) {
      if (!desktopLayoutState || !desktopLayoutState.active) return;
      const active = desktopLayoutState.active;
      const targetPageIndex = getDesktopAdjacentPageIndex(desktopLayoutState.currentPageIndex, direction, active.meta.kind);
      if (targetPageIndex == null) {
        clearDesktopPageTurnTimer();
        return;
      }
      if (desktopLayoutState.pageTurnTarget === targetPageIndex && desktopLayoutState.pageTurnTimer) return;
      clearDesktopPageTurnTimer(false);
      desktopLayoutState.pageTurnTarget = targetPageIndex;
      showDesktopPageHint(`Hold to turn to Page ${targetPageIndex + 1}`, direction);
      desktopLayoutState.pageTurnTimer = window.setTimeout(() => {
        desktopLayoutState.pageTurnTimer = 0;
        desktopLayoutState.pageTurnTarget = null;
        scrollDesktopToPage(targetPageIndex, active.dragging ? 'auto' : 'smooth');
        showDesktopPageHint(`Page ${targetPageIndex + 1}`, direction);
        window.setTimeout(hideDesktopPageHint, 220);
        if (desktopLayoutState.active && desktopLayoutState.active.dragging) {
          const rerunDragPosition = () => updateDesktopDragPosition(
            desktopLayoutState.active.lastClientX,
            desktopLayoutState.active.lastClientY
          );
          window.requestAnimationFrame(() => window.requestAnimationFrame(rerunDragPosition));
          window.setTimeout(() => {
            if (desktopLayoutState.active && desktopLayoutState.active.dragging) rerunDragPosition();
          }, 80);
        }
      }, desktopPageTurnDelay);
    }

    function updateDesktopAutoPage(clientX) {
      const width = window.innerWidth || document.documentElement.clientWidth || 0;
      if (!width) return;
      if (clientX <= desktopPageEdgeThreshold) {
        scheduleDesktopPageTurn(-1);
        return;
      }
      if (clientX >= width - desktopPageEdgeThreshold) {
        scheduleDesktopPageTurn(1);
        return;
      }
      clearDesktopPageTurnTimer();
    }

    function updateDesktopIconDrag(clientX, clientY) {
      const active = desktopLayoutState.active;
      const targetPageIndex = desktopLayoutState.currentPageIndex;
      if (!desktopPageCanAccept(targetPageIndex, 'icon')) return;
      const nextSlot = findDesktopNearestLegalIconSlot(targetPageIndex, clientX, clientY, active.meta);
      if (!Number.isInteger(nextSlot)) return;
      if (active.meta.pageIndex !== targetPageIndex || active.meta.slot !== nextSlot) {
        moveDesktopIconToPage(active.meta, targetPageIndex);
        applyDesktopIconSlot(active.meta, nextSlot);
        active.moved = true;
      }
    }

    function updateDesktopWidgetDrag(clientX, clientY) {
      const active = desktopLayoutState.active;
      const targetPageIndex = desktopLayoutState.currentPageIndex;
      if (!desktopPageCanAccept(targetPageIndex, 'widget')) return;
      const nextSlot = findDesktopNearestLegalWidgetSlot(targetPageIndex, clientX, clientY, active.meta);
      if (!Number.isInteger(nextSlot)) return;
      if (applyDesktopWidgetGridSlot(active.meta, targetPageIndex, 'top', nextSlot)) {
        active.moved = true;
      }
    }

    function updateDesktopDragPosition(clientX, clientY) {
      if (!desktopLayoutState || !desktopLayoutState.active) return;
      const active = desktopLayoutState.active;
      active.lastClientX = clientX;
      active.lastClientY = clientY;
      if (!active.dragging) return;
      updateDesktopDragGhostPosition(active, clientX, clientY);
      if (Math.abs(clientX - active.startClientX) > 3 || Math.abs(clientY - active.startClientY) > 3) {
        active.travelled = true;
      }
      const hitPoint = getDesktopDragHitPoint(active, clientX, clientY);
      updateDesktopPager();
      updateDesktopAutoPage(hitPoint.centerX);
      if (active.meta.kind === 'widget') updateDesktopWidgetDrag(hitPoint.centerX, hitPoint.centerY);
      else updateDesktopIconDrag(hitPoint.centerX, hitPoint.centerY);
    }

    function handleDesktopMouseMove(event) {
      if (!desktopLayoutState || !desktopLayoutState.active || desktopLayoutState.active.pointerType !== 'mouse') return;
      if (!desktopLayoutState.active.pressReady) {
        if (Math.hypot(event.clientX - desktopLayoutState.active.startClientX, event.clientY - desktopLayoutState.active.startClientY) >= desktopLongPressMoveTolerance) {
          cancelDesktopPendingDrag();
        }
        return;
      }
      if (!ensureDesktopDragStarted(event.clientX, event.clientY, event)) return;
      event.preventDefault();
      updateDesktopDragPosition(event.clientX, event.clientY);
    }

    function handleDesktopTouchMove(event) {
      if (!desktopLayoutState || !desktopLayoutState.active || desktopLayoutState.active.pointerType !== 'touch') return;
      const touch = (event.changedTouches && event.changedTouches[0]) || (event.touches && event.touches[0]);
      if (!touch) return;
      if (!desktopLayoutState.active.pressReady) {
        if (Math.hypot(touch.clientX - desktopLayoutState.active.startClientX, touch.clientY - desktopLayoutState.active.startClientY) >= desktopLongPressMoveTolerance) {
          cancelDesktopPendingDrag();
        }
        return;
      }
      if (!ensureDesktopDragStarted(touch.clientX, touch.clientY, event)) return;
      event.preventDefault();
      updateDesktopDragPosition(touch.clientX, touch.clientY);
    }

    function handleDesktopDragEnd() {
      finishDesktopDrag(true);
    }

    function startDesktopDrag(meta, clientX, clientY, event, pointerType) {
      if (!desktopLayoutState || meta.hidden) return;
      if (desktopLayoutState.active) finishDesktopDrag(false);
      const rect = meta.item.getBoundingClientRect();
      desktopLayoutState.active = {
        meta,
        pointerType,
        startClientX: clientX,
        startClientY: clientY,
        lastClientX: clientX,
        lastClientY: clientY,
        dragRect: {
          width: rect.width,
          height: rect.height
        },
        grabOffsetX: Math.max(0, Math.min(clientX - rect.left, rect.width || 0)),
        grabOffsetY: Math.max(0, Math.min(clientY - rect.top, rect.height || 0)),
        ghost: null,
        ghostLeft: rect.left,
        ghostTop: rect.top,
        ghostCenterX: rect.left + (rect.width / 2),
        ghostCenterY: rect.top + (rect.height / 2),
        longPressTimer: 0,
        pressReady: false,
        travelled: false,
        moved: false,
        dragging: false
      };
      scheduleDesktopLongPress(desktopLayoutState.active);
      event.stopPropagation();
      if (desktopLayoutState.listenersAttached) return;
      desktopLayoutState.listenersAttached = true;
      window.addEventListener('mousemove', handleDesktopMouseMove, true);
      window.addEventListener('mouseup', handleDesktopDragEnd, true);
      window.addEventListener('touchmove', handleDesktopTouchMove, { passive: false, capture: true });
      window.addEventListener('touchend', handleDesktopDragEnd, true);
      window.addEventListener('touchcancel', handleDesktopDragEnd, true);
      window.addEventListener('blur', handleDesktopDragEnd, true);
    }

    function bindDesktopDrag(meta) {
      if (!desktopLayoutState || meta.item.dataset.miniDesktopDragBound === '1') return;
      meta.item.dataset.miniDesktopDragBound = '1';
      meta.item.dataset.miniDesktopDraggable = '1';
      meta.item.addEventListener('dragstart', (event) => {
        event.preventDefault();
      });
      meta.item.addEventListener('selectstart', (event) => {
        event.preventDefault();
      });
      meta.item.addEventListener('mousedown', (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        startDesktopDrag(meta, event.clientX, event.clientY, event, 'mouse');
      });
      meta.item.addEventListener('touchstart', (event) => {
        if (event.touches && event.touches.length > 1) return;
        const touch = (event.changedTouches && event.changedTouches[0]) || (event.touches && event.touches[0]);
        if (!touch) return;
        startDesktopDrag(meta, touch.clientX, touch.clientY, event, 'touch');
      }, { passive: false });
    }

    function installDesktopClickGuard() {
      if (!desktopLayoutState || desktopLayoutState.clickGuardInstalled) return;
      desktopLayoutState.clickGuardInstalled = true;
      document.addEventListener('click', (event) => {
        const item = event.target.closest('[data-mini-desktop-draggable="1"]');
        if (!item) return;
        const until = Number(item.dataset.miniSuppressClickUntil || 0);
        if (until && Date.now() < until) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          item.dataset.miniSuppressClickUntil = '0';
        }
      }, true);
    }

    function installDesktopResizeSync() {
      if (!desktopLayoutState || desktopLayoutState.resizeBound) return;
      desktopLayoutState.resizeBound = true;
      window.addEventListener('resize', () => {
        if (desktopLayoutState.active) finishDesktopDrag(false);
        syncDesktopIconLayout(false);
        updateDesktopPager();
      });
    }

    function refreshDesktopWidgetLayouts() {
      if (!desktopLayoutState) return;
      let changed = false;
      desktopLayoutState.pages.forEach((pageMeta) => {
        if (isDesktopGridWidgetContainer(pageMeta.pageIndex, 'top')) {
          if (refreshDesktopWidgetGridLayout(pageMeta.pageIndex, 'top')) changed = true;
        }
      });
      desktopLayoutState.pages.forEach((pageMeta) => {
        const pageIndex = pageMeta.pageIndex;
        const occupied = getDesktopWidgetBlockedSlots(pageIndex);
        getDesktopOrderedIcons(pageIndex).forEach((meta) => {
          const preferredSlots = [];
          if (Number.isInteger(meta.slot)) preferredSlots.push(meta.slot);
          if (Number.isInteger(meta.defaultSlot)) preferredSlots.push(meta.defaultSlot);
          let nextSlot = preferredSlots.find((slot) => (
            Number.isInteger(slot) &&
            slot >= 0 &&
            slot < getDesktopSlotCount(pageIndex) &&
            !occupied.has(slot)
          ));
          if (!Number.isInteger(nextSlot)) {
            const currentInfo = Number.isInteger(meta.slot)
              ? getDesktopIconSlotInfo(pageIndex, meta.slot)
              : null;
            const rect = meta.item.getBoundingClientRect();
            const targetX = currentInfo
              ? currentInfo.centerX
              : (rect.width > 0 ? rect.left + rect.width / 2 : 0);
            const targetY = currentInfo
              ? currentInfo.centerY
              : (rect.height > 0 ? rect.top + rect.height / 2 : 0);
            nextSlot = findDesktopNearestLegalIconSlot(pageIndex, targetX, targetY, meta, occupied);
          }
          if (!Number.isInteger(nextSlot)) return;
          if (meta.pageIndex !== pageIndex || meta.slot !== nextSlot) changed = true;
          moveDesktopIconToPage(meta, pageIndex);
          applyDesktopIconSlot(meta, nextSlot);
          occupied.add(nextSlot);
        });
      });
      if (changed) {
        desktopLayoutState.lastSerialized = '';
        queueDesktopLayoutSave();
      }
      updateDesktopPager();
    }

    function queueDesktopWidgetLayoutRefresh() {
      if (!desktopLayoutState) return;
      window.cancelAnimationFrame(desktopLayoutState.widgetRefreshFrame || 0);
      desktopLayoutState.widgetRefreshFrame = window.requestAnimationFrame(() => {
        desktopLayoutState.widgetRefreshFrame = 0;
        if (desktopLayoutState.active) return;
        refreshDesktopWidgetLayouts();
      });
    }

    function installDesktopLayoutObservers() {
      if (!desktopLayoutState || desktopLayoutState.layoutObserversInstalled) return;
      desktopLayoutState.layoutObserversInstalled = true;
      if (typeof ResizeObserver === 'function') {
        const resizeObserver = new ResizeObserver(() => {
          queueDesktopWidgetLayoutRefresh();
        });
        desktopLayoutState.widgetResizeObserver = resizeObserver;
        desktopLayoutState.widgets.forEach((meta) => {
          resizeObserver.observe(meta.item);
        });
      }
      if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
        document.fonts.ready.then(() => queueDesktopWidgetLayoutRefresh()).catch(() => {});
      }
      window.addEventListener('load', () => queueDesktopWidgetLayoutRefresh(), { once: true });
      window.setTimeout(() => queueDesktopWidgetLayoutRefresh(), 120);
      window.setTimeout(() => queueDesktopWidgetLayoutRefresh(), 360);
    }

    function prepareDesktopIconLayout() {
      if (!desktopLayoutState || desktopLayoutState.prepared) return;
      desktopLayoutState.prepared = true;
      desktopLayoutState.pages = [];
      desktopLayoutState.icons = [];
      desktopLayoutState.widgets = [];
      desktopLayoutState.items = [];
      let iconIndex = 0;
      document.querySelectorAll('.screen-container .page').forEach((page, pageIndex) => {
        const widgetsArea = page.querySelector('.widgets-area') || (() => {
          const nextWidgetsArea = document.createElement('div');
          nextWidgetsArea.className = 'widgets-area';
          page.insertBefore(nextWidgetsArea, page.firstChild);
          return nextWidgetsArea;
        })();
        const appsArea = page.querySelector('.apps-area');
        const widgetsBelowArea = page.querySelector('.widgets-area-below') || (() => {
          const nextWidgetsBelowArea = document.createElement('div');
          nextWidgetsBelowArea.className = 'widgets-area widgets-area-below';
          if (appsArea && appsArea.parentElement === page && appsArea.nextSibling) {
            page.insertBefore(nextWidgetsBelowArea, appsArea.nextSibling);
          } else if (appsArea && appsArea.parentElement === page) {
            page.appendChild(nextWidgetsBelowArea);
          } else {
            page.appendChild(nextWidgetsBelowArea);
          }
          return nextWidgetsBelowArea;
        })();
        const sourceGrid = appsArea && appsArea.querySelector('.app-grid');
        const iconLayer = page.querySelector('.mini-desktop-icon-layer') || (() => {
          const nextIconLayer = document.createElement('div');
          nextIconLayer.className = 'mini-desktop-icon-layer';
          page.appendChild(nextIconLayer);
          return nextIconLayer;
        })();
        const pageMeta = { page, pageIndex, widgetsArea, widgetsBelowArea, appsArea, grid: iconLayer, sourceGrid, iconLayer };
        desktopLayoutState.pages.push(pageMeta);
        if (sourceGrid || iconLayer) {
          const sourceItems = sourceGrid && sourceGrid.children.length
            ? Array.from(sourceGrid.children)
            : Array.from(iconLayer.children);
          const items = sourceItems.filter((node) => node.classList && node.classList.contains('app-item'));
          items.forEach((item, slotIndex) => {
            if (item.parentElement !== iconLayer) iconLayer.appendChild(item);
            const meta = {
              kind: 'icon',
              id: `icon-${iconIndex}`,
              item,
              page,
              appsArea,
              grid: iconLayer,
              pageIndex,
              defaultPageIndex: pageIndex,
              slotIndex,
              defaultSlot: slotIndex,
              slot: slotIndex,
              hidden: false
            };
            item.dataset.miniDesktopIcon = '1';
            item.dataset.miniDesktopIconId = meta.id;
            item.dataset.miniDesktopIconIndex = String(iconIndex + 1);
            item.dataset.miniDesktopPage = String(pageIndex);
            item.dataset.miniSuppressClickUntil = '0';
            bindDesktopDrag(meta);
            desktopLayoutState.icons.push(meta);
            desktopLayoutState.items.push(meta);
            iconIndex += 1;
          });
        }
        [['top', widgetsArea], ['bottom', widgetsBelowArea]].forEach(([region, container]) => {
          const widgetItems = Array.from(container.children).filter((node) => (
            node.nodeType === 1 && themeWidgetSelectors.some((selector) => node.matches(selector))
          ));
          widgetItems.forEach((item, orderIndex) => {
            const selector = themeWidgetSelectors.find((candidate) => item.matches(candidate)) || `.widget-${orderIndex}`;
            const slotMeta = {
              kind: 'widget',
              item,
              page,
              grid: iconLayer,
              pageIndex
            };
            const defaultSlot = findDesktopNearestWidgetStartSlotFromItem(slotMeta, item);
            const meta = {
              kind: 'widget',
              id: `widget-${selector.replace(/[^a-z0-9_-]+/gi, '')}`,
              item,
              page,
              widgetsArea: container,
              widgetRegion: 'top',
              pageIndex,
              defaultPageIndex: pageIndex,
              defaultRegion: 'top',
              defaultSlot: Number.isInteger(defaultSlot) ? defaultSlot : orderIndex,
              defaultOrder: orderIndex,
              widgetSlot: null,
              order: orderIndex,
              hidden: false
            };
            item.dataset.miniDesktopWidget = '1';
            item.dataset.miniDesktopWidgetId = meta.id;
            item.dataset.miniDesktopOrder = String(orderIndex);
            item.dataset.miniDesktopWidgetSlot = '';
            item.dataset.miniDesktopPage = String(pageIndex);
            item.dataset.miniDesktopRegion = 'top';
            item.dataset.miniSuppressClickUntil = '0';
            bindDesktopDrag(meta);
            desktopLayoutState.widgets.push(meta);
            desktopLayoutState.items.push(meta);
          });
        });
      });
      document.body.classList.add('mini-desktop-layer-ready');
      applyDesktopIconOverrides();
      installDesktopClickGuard();
      ensureDesktopPager();
      installDesktopPagerSync();
      installDesktopResizeSync();
      installDesktopLayoutObservers();
    }

    async function syncDesktopIconLayout(allowPersist = true) {
      if (!desktopLayoutState) return;
      await hydrateDesktopLayout();
      prepareDesktopIconLayout();
      if (!desktopLayoutState.items.length) return;
      const layout = migrateDesktopSwapLayout(readDesktopLayout() || {});
      let changed = false;
      desktopLayoutState.icons.forEach((meta) => {
        setDesktopItemHidden(meta, meta.item.dataset.miniDesktopHidden === '1');
      });
      desktopLayoutState.widgets.forEach((meta) => {
        setDesktopItemHidden(meta, meta.item.style.display === 'none' || window.getComputedStyle(meta.item).display === 'none');
      });
      const iconPlacements = [];
      desktopLayoutState.icons.forEach((meta) => {
        if (meta.hidden) return;
        const saved = readDesktopStoredPlacement(meta, layout[meta.id]);
        let targetPageIndex = saved && desktopPageCanAccept(saved.pageIndex, 'icon')
          ? saved.pageIndex
          : meta.defaultPageIndex;
        if (!desktopPageCanAccept(targetPageIndex, 'icon')) return;
        const preferredSlots = [];
        if (saved && Number.isInteger(saved.slot)) preferredSlots.push(saved.slot);
        if (Number.isInteger(meta.defaultSlot)) preferredSlots.push(meta.defaultSlot);
        iconPlacements.push({ meta, saved, targetPageIndex, preferredSlots });
      });
      const widgetPlacements = desktopLayoutState.widgets
        .filter((meta) => !meta.hidden)
        .map((meta) => {
          const saved = readDesktopStoredPlacement(meta, layout[meta.id]);
          let targetPageIndex = saved && desktopPageCanAccept(saved.pageIndex, 'widget')
            ? saved.pageIndex
            : meta.defaultPageIndex;
          if (!desktopPageCanAccept(targetPageIndex, 'widget')) targetPageIndex = meta.defaultPageIndex;
          const preferredSlots = [];
          if (saved && Number.isInteger(saved.slot)) preferredSlots.push(saved.slot);
          if (Number.isInteger(meta.defaultSlot)) preferredSlots.push(meta.defaultSlot);
          return { meta, saved, targetPageIndex, preferredSlots };
        })
        .sort((left, right) => {
          const leftSpan = getDesktopWidgetPlacementSpan(left.meta, left.targetPageIndex) || { columnSpan: 1, rowSpan: 1 };
          const rightSpan = getDesktopWidgetPlacementSpan(right.meta, right.targetPageIndex) || { columnSpan: 1, rowSpan: 1 };
          const leftArea = leftSpan.columnSpan * leftSpan.rowSpan;
          const rightArea = rightSpan.columnSpan * rightSpan.rowSpan;
          if (leftArea !== rightArea) return rightArea - leftArea;
          return left.meta.defaultOrder - right.meta.defaultOrder;
        });
      const occupiedByPage = new Map();
      widgetPlacements.forEach(({ meta, saved, targetPageIndex, preferredSlots }) => {
        const previousPageIndex = meta.pageIndex;
        const previousRegion = meta.widgetRegion || 'top';
        const previousSlot = getDesktopWidgetSlotValue(meta);
        let occupied = occupiedByPage.get(targetPageIndex);
        if (!occupied) {
          occupied = new Set();
          occupiedByPage.set(targetPageIndex, occupied);
        }
        let nextSlot = preferredSlots.find((slot) => canPlaceDesktopWidgetAtSlot(targetPageIndex, meta, slot, meta, occupied));
        if (!Number.isInteger(nextSlot)) {
          const preferredRect = Number.isInteger(preferredSlots[0])
            ? getDesktopWidgetPlacementRect(targetPageIndex, meta, preferredSlots[0])
            : null;
          const currentRect = meta.item.getBoundingClientRect();
          const targetX = preferredRect
            ? preferredRect.centerX
            : (currentRect.width > 0 ? currentRect.left + currentRect.width / 2 : 0);
          const targetY = preferredRect
            ? preferredRect.centerY
            : (currentRect.height > 0 ? currentRect.top + currentRect.height / 2 : 0);
          nextSlot = findDesktopNearestLegalWidgetSlot(targetPageIndex, targetX, targetY, meta, occupied);
        }
        if (!Number.isInteger(nextSlot)) return;
        if (
          previousPageIndex !== targetPageIndex ||
          previousRegion !== 'top' ||
          previousSlot !== nextSlot ||
          !saved
        ) changed = true;
        if (!applyDesktopWidgetGridSlot(meta, targetPageIndex, 'top', nextSlot)) return;
        getDesktopWidgetCoveredSlots(targetPageIndex, meta, nextSlot).forEach((slot) => occupied.add(slot));
      });
      iconPlacements.forEach(({ meta, saved, targetPageIndex, preferredSlots }) => {
        let occupied = occupiedByPage.get(targetPageIndex);
        if (!occupied) {
          occupied = getDesktopWidgetBlockedSlots(targetPageIndex);
          occupiedByPage.set(targetPageIndex, occupied);
        }
        let nextSlot = preferredSlots.find((slot) => (
          Number.isInteger(slot) &&
          slot >= 0 &&
          slot < getDesktopSlotCount(targetPageIndex) &&
          !occupied.has(slot)
        ));
        if (!Number.isInteger(nextSlot)) {
          const preferredInfo = Number.isInteger(preferredSlots[0])
            ? getDesktopIconSlotInfo(targetPageIndex, preferredSlots[0])
            : null;
          const currentRect = meta.item.getBoundingClientRect();
          const targetX = preferredInfo
            ? preferredInfo.centerX
            : (currentRect.width > 0 ? currentRect.left + currentRect.width / 2 : 0);
          const targetY = preferredInfo
            ? preferredInfo.centerY
            : (currentRect.height > 0 ? currentRect.top + currentRect.height / 2 : 0);
          nextSlot = findDesktopNearestLegalIconSlot(targetPageIndex, targetX, targetY, meta, occupied);
        }
        if (!Number.isInteger(nextSlot)) return;
        if (meta.pageIndex !== targetPageIndex || meta.slot !== nextSlot || !saved) changed = true;
        moveDesktopIconToPage(meta, targetPageIndex);
        applyDesktopIconSlot(meta, nextSlot);
        occupied.add(nextSlot);
      });
      if (normalizeDesktopThirdPageIconRow(layout)) changed = true;
      desktopLayoutState.items.forEach((meta) => {
        meta.item.classList.remove('mini-desktop-dragging');
      });
      document.body.classList.remove('mini-desktop-sort-mode');
      const container = getDesktopScrollContainer();
      if (container) container.classList.remove('mini-desktop-sort-mode');
      updateDesktopPager();
      if (allowPersist && changed) {
        desktopLayoutState.lastSerialized = '';
        queueDesktopLayoutSave();
        return;
      }
      desktopLayoutState.lastSerialized = JSON.stringify(serializeDesktopLayout());
    }

    function translateMiniNoticeToChinese(message) {
      const raw = String(message == null ? '' : message).trim();
      if (!raw) return '提示';
      const replacements = [
        [/^Import successful$/i, '导入成功'],
        [/^Import failed$/i, '导入失败'],
        [/^Nickname is required$/i, '昵称为必填项'],
        [/^Please specify the custom relation$/i, '请填写自定义关系'],
        [/^Please select a target entity$/i, '请选择目标对象'],
        [/^Please describe the relation details$/i, '请填写关系描述'],
        [/^Local font loaded for preview\.?$/i, '本地字体已载入预览'],
        [/^Settings saved and applied\.?$/i, '设置已保存，已全局生效'],
        [/^Enter a URL or choose a file first\.?$/i, '请先输入链接或选择文件'],
        [/^Font reset to default\.?$/i, '字体已恢复默认'],
        [/^Scale saved\.?$/i, '缩放比例已保存'],
        [/^Scale reset to 100%\.?$/i, '缩放已恢复为 100%'],
        [/^Chat config saved$/i, '聊天配置已保存'],
        [/^Voice config saved$/i, '语音配置已保存'],
        [/^Switched to preset:\s*(.+)$/i, '已切换到预设：$1'],
        [/^Enter a preset name$/i, '请输入预设名称'],
        [/^Preset updated:\s*(.+)$/i, '预设已更新：$1'],
        [/^Saved as preset:\s*(.+)$/i, '预设已保存：$1'],
        [/^Select a preset first$/i, '请先选择预设'],
        [/^Preset deleted:\s*(.+)$/i, '预设已删除：$1'],
        [/^Chat config save failed:\s*(.+)$/i, '聊天配置保存失败：$1'],
        [/^Voice config save failed:\s*(.+)$/i, '语音配置保存失败：$1'],
        [/^Quoted message not found$/i, '未找到引用消息'],
        [/^Favorited\s+(\d+)\s+message\(s\)$/i, '已收藏 $1 条消息'],
        [/^Selected messages were already favorited$/i, '所选消息已收藏'],
        [/^Forwarded to\s+(.+)$/i, '已转发给 $1'],
        [/^This recalled message has no snapshot to inspect$/i, '这条撤回消息没有可查看的快照'],
        [/^No other contacts to forward to$/i, '没有其他可转发的联系人'],
        [/^GROUP CHAT COMING SOON$/i, '群聊功能即将上线'],
        [/^SHAKE COMING SOON$/i, '摇一摇功能即将上线'],
        [/^Location data is unavailable$/i, '定位数据不可用'],
        [/^Location send failed, please retry$/i, '定位发送失败，请重试'],
        [/^Notice$/i, '提示']
      ];
      for (const [pattern, replacement] of replacements) {
        if (pattern.test(raw)) return raw.replace(pattern, replacement);
      }
      return raw;
    }

    function normalizeNoticeMessage(message) {
      const raw = String(message == null ? '' : message).replace(/\s+/g, ' ').trim();
      return translateMiniNoticeToChinese(raw) || '提示';
    }

    function showMiniNotice(message, duration = 2600) {
      let toast = document.getElementById('mini-system-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'mini-system-toast';
        toast.className = 'mini-system-toast';
        document.body.appendChild(toast);
      }
      toast.textContent = normalizeNoticeMessage(message);
      toast.classList.remove('show');
      window.clearTimeout(window.__miniNoticeTimer);
      requestAnimationFrame(() => toast.classList.add('show'));
      window.__miniNoticeTimer = window.setTimeout(() => {
        toast.classList.remove('show');
      }, duration);
    }

    function getWechatIncomingBannerState() {
      if (!window.__miniWechatIncomingBannerState) {
        window.__miniWechatIncomingBannerState = {
          node: null,
          timer: 0
        };
      }
      return window.__miniWechatIncomingBannerState;
    }

    function formatWechatIncomingBannerTime(timestamp) {
      const value = Number(timestamp);
      if (!Number.isFinite(value) || value <= 0) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    function hideWechatIncomingBanner() {
      const state = getWechatIncomingBannerState();
      window.clearTimeout(state.timer);
      state.timer = 0;
      if (state.node) state.node.classList.remove('show');
    }

    function ensureWechatIncomingBanner() {
      if (routeName !== 'wechat' || !document.body) return null;
      const state = getWechatIncomingBannerState();
      if (state.node && state.node.isConnected) return state.node;
      const banner = document.createElement('div');
      banner.id = 'mini-wechat-incoming-banner';
      banner.className = 'mini-wechat-incoming-banner';
      banner.dataset.miniFloatingLayer = '1';
      banner.setAttribute('aria-live', 'polite');
      banner.innerHTML = [
        '<div class="mini-wechat-incoming-banner-avatar"></div>',
        '<div class="mini-wechat-incoming-banner-copy">',
        '<div class="mini-wechat-incoming-banner-head">',
        '<div class="mini-wechat-incoming-banner-meta">',
        '<div class="mini-wechat-incoming-banner-name"></div>',
        '<div class="mini-wechat-incoming-banner-app">WeChat</div>',
        '</div>',
        '<div class="mini-wechat-incoming-banner-time"></div>',
        '</div>',
        '<div class="mini-wechat-incoming-banner-text"></div>',
        '</div>'
      ].join('');
      document.body.appendChild(banner);
      state.node = banner;
      return banner;
    }

    function shouldShowWechatIncomingBanner(contact, index) {
      if (routeName !== 'wechat' || !contact) return false;
      const detailPage = document.getElementById('chat-detail-page');
      const isViewingCurrentThread = !!(
        detailPage
        && detailPage.classList.contains('active')
        && isCurrentWechatSelection(contact, index)
      );
      return !isViewingCurrentThread;
    }

    function showWechatIncomingBanner(contact, index, entry, duration = 3600) {
      if (!entry || normalizeWechatMessageDirection(entry.direction) !== 'received') return;
      if (!shouldShowWechatIncomingBanner(contact, index)) return;
      const banner = ensureWechatIncomingBanner();
      if (!banner) return;
      const avatar = banner.querySelector('.mini-wechat-incoming-banner-avatar');
      const nameNode = banner.querySelector('.mini-wechat-incoming-banner-name');
      const timeNode = banner.querySelector('.mini-wechat-incoming-banner-time');
      const textNode = banner.querySelector('.mini-wechat-incoming-banner-text');
      if (nameNode) nameNode.textContent = getWechatContactLabel(contact) || '微信联系人';
      if (timeNode) timeNode.textContent = formatWechatIncomingBannerTime(entry.timestamp || Date.now());
      if (textNode) textNode.textContent = getWechatMessageCompactPreviewText(entry) || '你收到一条新消息';
      setAvatarSurface(avatar, index || 0, { role: 'contact', contact });
      const state = getWechatIncomingBannerState();
      banner.classList.remove('show');
      window.clearTimeout(state.timer);
      requestAnimationFrame(() => banner.classList.add('show'));
      state.timer = window.setTimeout(() => {
        banner.classList.remove('show');
        state.timer = 0;
      }, Math.max(1800, Number(duration) || 3600));
    }

    function notifyThemeUpdated() {
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'mini-theme-updated' }, '*');
        }
      } catch (error) {}
    }

    function installThemeWriteBridge() {
      if (window.__miniThemeWriteBridgeInstalled || !window.IDBObjectStore || !IDBObjectStore.prototype) return;
      window.__miniThemeWriteBridgeInstalled = true;
      ['add', 'put', 'delete', 'clear'].forEach((method) => {
        const original = IDBObjectStore.prototype[method];
        if (typeof original !== 'function') return;
        IDBObjectStore.prototype[method] = function patchedThemeWrite(...args) {
          const request = original.apply(this, args);
          try {
            const db = this.transaction && this.transaction.db;
            if (db && db.name === themeDbName && request && typeof request.addEventListener === 'function') {
              request.addEventListener('success', () => setTimeout(notifyThemeUpdated, 80), { once: true });
            }
          } catch (error) {}
          return request;
        };
      });
    }

    function installNoticeBridge() {
      window.showMiniNotice = showMiniNotice;
      window.alert = (message) => { showMiniNotice(message); };
      if (typeof window.showToast === 'function') {
        window.showToast = (message) => showMiniNotice(message);
      }
      const observer = new MutationObserver(() => {
        document.querySelectorAll('.toast-banner.show').forEach((toast) => {
          window.clearTimeout(toast.__miniToastTimer);
          toast.__miniToastTimer = window.setTimeout(() => toast.classList.remove('show'), 2500);
        });
      });
      observer.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['class'] });
    }

    function setNodeText(node, value) {
      if (!node) return;
      if (!node.children.length) {
        node.textContent = value;
        return;
      }
      const textNodes = Array.from(node.childNodes).filter((child) => child.nodeType === 3);
      if (!textNodes.length) {
        node.insertBefore(document.createTextNode(value), node.firstChild);
        return;
      }
      textNodes[0].nodeValue = value;
      textNodes.slice(1).forEach((textNode) => {
        textNode.nodeValue = '';
      });
    }

    function applyTextMap(root, selector, textMap) {
      root.querySelectorAll(selector).forEach((node) => {
        const text = node.textContent.trim();
        if (!textMap[text]) return;
        const hasMatchingDescendant = Array.from(node.querySelectorAll(selector)).some((child) => (
          child !== node && child.textContent.trim() === text
        ));
        if (hasMatchingDescendant) return;
        setNodeText(node, textMap[text]);
      });
    }

    function normalizeModals() {
      const textMap = {
        '\u66f4\u6362\u56fe\u7247': 'CHANGE IMAGE',
        '\u4fee\u6539\u4e13\u5c5e\u540d\u7247': 'EDIT PROFILE CARD',
        '\u4fee\u6539\u6587\u6848': 'EDIT TEXT',
        '\u540d\u7247\u56fe\u7247\u66f4\u6362': 'CARD IMAGE',
        '\u672c\u5730\u6587\u4ef6': 'LOCAL FILE',
        '+ \u9009\u53d6\u672c\u5730\u56fe\u7247': 'CHOOSE LOCAL IMAGE',
        '+ \u9009\u53d6\u672c\u5730\u5b57\u4f53\u6587\u4ef6': 'CHOOSE LOCAL FONT',
        '\u53d6\u6d88': 'CANCEL',
        '\u4fdd\u5b58': 'SAVE',
        '\u4fdd\u5b58\u4fee\u6539': 'SAVE CHANGES',
        '\u91cd\u7f6e': 'RESET',
        '\u663e\u793a': 'SHOW',
        '\u9690\u85cf': 'HIDE',
        'Group Name / \u5206\u7ec4\u540d': 'GROUP NAME',
        'GROUP NAME / \u5206\u7ec4\u540d': 'GROUP NAME',
        '\u5173\u7cfb\u7f51': 'NETWORK',
        'Pin to Top (\u7f6e\u9876)': 'Pin to Top',
        'Memory (\u7eaa\u5ff5)': 'Memory',
        'Birthday (\u7834\u86cb)': 'Birthday',
        'Target (\u76ee\u6807)': 'Target',
        'Count Up (\u5df2\u8fc7)': 'Count Up',
        'Count Down (\u5012\u6570)': 'Count Down',
        'Signature (\u4e2a\u6027\u7b7e\u540d)': 'Signature',
        'Lore / Setting (\u8bbe\u5b9a\u5185\u5bb9)': 'Lore / Setting',
        'User Preset (\u9884\u8bbe\u5173\u8054)': 'User Preset',
        'Worldbook (\u5173\u8054\u4e16\u754c\u4e66)': 'Worldbook',
        'Target (\u76ee\u6807)': 'Target',
        'Relation (\u5173\u7cfb\u7c7b\u578b)': 'Relation',
        'Description (\u5173\u7cfb\u63cf\u8ff0)': 'Description',
        '\u5bb6\u4eba': 'Family',
        '\u604b\u4eba': 'Partner',
        '\u670b\u53cb': 'Friend',
        '\u540c\u4e8b': 'Colleague',
        '\u586b\u5199': 'Custom'
      };
      document.querySelectorAll('.ins-modal,.modal-box').forEach((modal) => {
        applyTextMap(modal, 'button,div,span,label,option,p', textMap);
      });
      document.querySelectorAll('.ins-modal-title,.modal-header').forEach((node) => {
        const text = node.textContent.trim();
        if (textMap[text]) node.textContent = textMap[text];
      });
      const placeholderMap = {
        '\u8f93\u5165URL': 'Image URL',
        '\u8f93\u5165\u8981\u4fee\u6539\u7684\u6587\u6848...': 'Text...',
        '\u56fe\u7247 URL (\u53ef\u9009)': 'Image URL (optional)',
        'Enter name (e.g. Lin Mo)': 'Enter name',
        '\u8f93\u5165\u81ea\u5b9a\u4e49\u5173\u7cfb...': 'Enter custom relation...',
        '\u63cf\u8ff0\u4ed6\u4eec\u4e4b\u95f4\u7684\u5173\u7cfb\u8be6\u60c5...': 'Describe the relation...'
      };
      document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach((node) => {
        const value = node.getAttribute('placeholder');
        if (placeholderMap[value]) node.setAttribute('placeholder', placeholderMap[value]);
      });
    }

    function getShell() {
      if (!window.parent || window.parent === window) return null;
      return window.parent.__miniShell || null;
    }

    function goBack() {
      const shell = getShell();
      if (shell && typeof shell.back === 'function') shell.back(routeName);
    }

    function goHome() {
      const shell = getShell();
      if (shell && typeof shell.home === 'function') {
        shell.home(routeName);
        return;
      }
      goBack();
    }

    function bindShellAction(selector, action) {
      document.querySelectorAll(selector).forEach((node) => {
        if (node.dataset.miniRuntimeAction === action) return;
        node.dataset.miniRuntimeAction = action;
        node.style.cursor = 'pointer';
        node.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          if (action === 'home') goHome();
          if (action === 'back') goBack();
        }, true);
      });
    }

    function bindCustomAction(selector, key, handler) {
      document.querySelectorAll(selector).forEach((node) => {
        const actionKey = `custom:${key}`;
        if (node.dataset.miniRuntimeAction === actionKey) return;
        node.dataset.miniRuntimeAction = actionKey;
        node.style.cursor = 'pointer';
        node.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          handler();
        }, true);
      });
    }

    function hideBackAffordances() {
      if (routeName === 'wechat') return;
      document.querySelectorAll('.nav-back').forEach((node) => {
        node.style.visibility = 'hidden';
        node.style.pointerEvents = 'none';
      });
      document.querySelectorAll('.nav-left').forEach((node) => {
        const icons = node.querySelectorAll('svg, .icon-svg');
        if (!icons.length) return;
        node.style.pointerEvents = 'none';
        icons.forEach((icon) => {
          icon.style.visibility = 'hidden';
          icon.style.pointerEvents = 'none';
        });
      });
    }

    function installRouteNavigationGuards() {
      const backSelectorsByRoute = {
        anniversary: ['.nav-header .nav-title'],
        contacts: ['#view-list .nav-title', '#view-network .nav-title'],
        worldbook: ['#view-groups .nav-title'],
        novel: ['.page-header .page-title']
      };
      const homeSelectorsByRoute = {
        wechat: ['#page-messages .nav-title', '#page-moments .nav-title', '#page-profile .nav-title']
      };
      (backSelectorsByRoute[routeName] || []).forEach((selector) => bindShellAction(selector, 'back'));
      (homeSelectorsByRoute[routeName] || []).forEach((selector) => bindShellAction(selector, 'home'));

      if (routeName === 'worldbook') {
        bindCustomAction('#view-entries .nav-title', 'worldbook-groups', () => {
          if (typeof window.backToGroups === 'function') window.backToGroups();
          else goBack();
        });
        bindCustomAction('#view-editor .nav-title', 'worldbook-entries', () => {
          if (typeof window.backToEntries === 'function') window.backToEntries();
          else goBack();
        });
      }

      if (routeName === 'contacts') {
        bindCustomAction('#view-network-detail .nav-title', 'contacts-network-detail', () => {
          if (typeof window.closeNetworkDetail === 'function') window.closeNetworkDetail();
          else goBack();
        });
        bindCustomAction('#view-editor .nav-title', 'contacts-editor', () => {
          if (typeof window.closeEditor === 'function') window.closeEditor();
          else goBack();
        });
      }

      if (routeName === 'wechat') {
        try { window.returnToDesktop = goHome; } catch (error) {}
      }
      if (routeName === 'anniversary' || routeName === 'worldbook') {
        try { window.returnToDesktop = goBack; } catch (error) {}
      }
      if (routeName === 'contacts') {
        try { window.returnToParent = goBack; } catch (error) {}
      }

      hideBackAffordances();
    }

    function normalizeRouteCopy() {
      const textMap = {
        '\u5173\u7cfb\u7f51': 'NETWORK',
        '\u8bbe \u7f6e': 'SETTINGS',
        '\u5bc6\u7801\u4e0e\u8bc6\u522b': 'Security & Identity',
        '\u63a8\u9001\u4e0e\u63d0\u9192': 'Push & Notifications',
        '\u63a5\u53e3\u4e0e\u53c2\u6570': 'Interfaces & Params',
        '\u8c03\u8bd5\u4e0e\u63a7\u5236': 'Debug & Control',
        '\u50a8\u5b58\u4e0e\u7ba1\u7406': 'Storage & Management',
        '\u4e3b \u9898': 'THEME',
        '\u9501\u5c4f\u4e0e\u58c1\u7eb8': 'Lock Screen & Wallpaper',
        '\u4e2a\u6027\u5316\u4e3b\u9898': 'Personalized Theme',
        '\u56fe\u6807\u4e0e\u7ec4\u4ef6': 'Icons & Widgets',
        '\u5b57\u4f53\u4e0e\u9875\u9762': 'Fonts & Pages',
        '\u5f00\u53d1\u8005\u6a21\u5f0f': 'Developer Mode',
        '\u5168\u5c40\u8bbe\u7f6e': 'Global Controls',
        '\u5e94\u7528\u56fe\u6807 (\u517120\u4e2a\uff0c\u542b Dock \u680f)': 'App Icons (20 incl. Dock)',
        '\u684c\u9762\u7ec4\u4ef6 (\u5df2\u5bf9\u9f50\u6846\u67b6)': 'Desktop Widgets',
        '\u5168\u5c40\u6837\u5f0f\u8868 (CSS)': 'Global Stylesheet (CSS)',
        '\u60a8\u53ef\u4ee5\u76f4\u63a5\u4fee\u6539\u5e94\u7528\u684c\u9762\u3001\u7ec4\u4ef6\u6a21\u5757\u3001\u5e94\u7528\u56fe\u6807\u7684\u5e95\u5c42CSS\u6837\u5f0f\u3002\u4fdd\u5b58\u540e\u7acb\u5373\u751f\u6548\u3002': 'Edit the underlying desktop, widget, and app icon CSS. Changes apply immediately after saving.',
        '\u6dfb\u52a0': '\u6dfb\u52a0',
        '\u91cd\u7f6e': '\u91cd\u7f6e',
        '\u91cd\u7f6e\u9ed8\u8ba4 CSS': 'Reset Default CSS',
        '\u4fdd\u5b58': '\u4fdd\u5b58',
        '\u9690\u85cf': '\u9690\u85cf',
        '\u663e\u793a': '\u663e\u793a',
        '\u5df2\u4fdd\u5b58': '\u5df2\u4fdd\u5b58',
        '\u5df2\u5e94\u7528\u751f\u6548': '\u5df2\u5e94\u7528\u751f\u6548',
        '\u5b57\u4f53\u4e0e\u9875\u9762': 'Fonts & Pages',
        '\u901a\u77e5\u5185\u5bb9': 'Notice',
        '\u5168\u5c40\u5b57\u4f53\u914d\u7f6e': 'Global Font',
        '\u5b57\u4f53\u7f51\u7edc\u5730\u5740 (URL)': 'Font URL',
        '\u6216': '\u6216',
        '\u6587\u4f53\u9884\u89c8': 'Font Preview',
        '\u91cd\u7f6e\u5b57\u4f53': 'Reset Font',
        '\u4fdd\u5b58\u5e76\u5e94\u7528': 'Save & Apply',
        '\u9875\u9762\u7f29\u653e\u914d\u7f6e': 'UI Scale',
        '\u6062\u590d\u9ed8\u8ba4 (100%)': 'Reset to 100%',
        '\u4fdd\u5b58\u7f29\u653e\u914d\u7f6e': 'Save Scale',
        '* \u7f29\u653e\u4f1a\u81ea\u52a8\u8c03\u6574\u89c6\u53e3\u5bbd\u9ad8\uff0c\u786e\u4fdd\u5185\u5bb9\u59cb\u7ec8\u4fdd\u6301\u5c45\u4e2d\u65e0\u504f\u79fb\u3002': '* Scale automatically adjusts the viewport to keep content aligned without offset.',
        'BB\u554a \u5176\u5b9e\u6de1\u6de1\u7684\u5c31\u4f1a\u987a\u987a\u7684\u3002': 'BB\u554a\uff0c\u5176\u5b9e\u6de1\u6de1\u7684\u5c31\u4f1a\u987a\u987a\u7684\u3002',
        '\u4e2d\u6587 (Mandarin)': 'Chinese (Mandarin)',
        'World Lore / \u4e16\u754c\u4e66': 'World Lore',
        'Title / \u8bcd\u6761\u6807\u8bc6': 'Title',
        'Category / \u5206\u7c7b': 'Category',
        '\u5168\u5c40 (GLOBAL)': 'GLOBAL',
        '\u62d3\u5c55 (EXT)': 'EXT',
        'Trigger / \u751f\u6548\u65b9\u5f0f': 'Trigger',
        '\u59cb\u7ec8\u751f\u6548': 'Always Active',
        '\u5173\u952e\u8bcd\u751f\u6548': 'Keyword Trigger',
        'Keywords / \u5173\u952e\u8bcd (\u9017\u53f7\u5206\u9694)': 'Keywords',
        'Injection Position / \u6ce8\u5165\u4f4d\u7f6e': 'Injection Position',
        '\u524d (PRE)': 'PRE',
        '\u4e2d (MID)': 'MID',
        '\u540e (POST)': 'POST',
        'Content / \u6838\u5fc3\u5185\u5bb9': 'Content',
        'SAVE ENTRY (\u4fdd\u5b58)': 'SAVE ENTRY',
        '\u5bb6\u4eba': 'Family',
        '\u604b\u4eba': 'Partner',
        '\u670b\u53cb': 'Friend',
        '\u540c\u4e8b': 'Colleague',
        '\u586b\u5199': 'Custom'
      };
      applyTextMap(document, 'label,button,div,span,option,p', textMap);
      if (routeName === 'desktop') {
        applyDesktopIconOverrides();
      }
      if (routeName === 'theme') {
        const iconLabels = document.querySelectorAll('#view-icons .slider-group label');
        if (iconLabels[0]) setNodeText(iconLabels[0], '图标圆角 ');
        if (iconLabels[1]) setNodeText(iconLabels[1], '图标尺寸 ');
        if (iconLabels[2]) setNodeText(iconLabels[2], '组件圆角 ');
      }
      if (routeName === 'theme_fonts') {
        const scaleLabel = document.querySelector('#scale-val') && document.querySelector('#scale-val').previousElementSibling;
        if (scaleLabel) scaleLabel.textContent = '全局 UI 缩放比例';
      }
      if (routeName === 'contacts') {
        document.querySelectorAll('#network-relation-list .contact-desc').forEach((node) => {
          node.textContent = node.textContent
            .replace('[\u5bb6\u4eba]', '[Family]')
            .replace('[\u604b\u4eba]', '[Partner]')
            .replace('[\u670b\u53cb]', '[Friend]')
            .replace('[\u540c\u4e8b]', '[Colleague]');
        });
      }
    }

    function installRouteCopyGuards() {
      if (routeName !== 'theme') return;
      const titleMap = {
        '\u4e3b \u9898': 'THEME',
        '\u9501\u5c4f\u4e0e\u58c1\u7eb8': 'Lock Screen & Wallpaper',
        '\u56fe\u6807\u4e0e\u7ec4\u4ef6': 'Icons & Widgets',
        '\u5f00\u53d1\u8005\u6a21\u5f0f': 'Developer Mode'
      };
      if (typeof window.switchView === 'function' && !window.switchView.__miniCopyGuardInstalled) {
        const originalSwitchView = window.switchView;
        const patchedSwitchView = function patchedSwitchView(viewId, title) {
          const result = originalSwitchView.call(this, viewId, titleMap[title] || title);
          window.setTimeout(() => normalizeRouteCopy(), 0);
          return result;
        };
        patchedSwitchView.__miniCopyGuardInstalled = true;
        window.switchView = patchedSwitchView;
      }
      ['saveBg', 'saveCSS', 'renderIcons', 'renderWidgets', 'toggleWidgetHide', 'resetIcon'].forEach((name) => {
        if (typeof window[name] !== 'function' || window[name].__miniCopyGuardInstalled) return;
        const original = window[name];
        const patched = function patchedRouteCopyFunction(...args) {
          const result = original.apply(this, args);
          window.setTimeout(() => normalizeRouteCopy(), 0);
          return result;
        };
        patched.__miniCopyGuardInstalled = true;
        window[name] = patched;
      });
    }

    function setThemeVisibilityButtonState(button, hidden) {
      if (!button) return;
      button.type = 'button';
      button.dataset.miniThemeHidden = hidden ? '1' : '0';
      button.textContent = hidden ? 'SHOW' : 'HIDE';
      button.classList.toggle('hidden', hidden);
    }

    function ensureThemeVisibilityButton(container, kind, index) {
      if (!container) return null;
      let button = kind === 'widget'
        ? container.querySelector(`#widget-hide-btn-${index}`) || container.querySelector('.hide-btn')
        : container.querySelector('.mini-theme-icon-hide-btn');
      if (!button) {
        button = document.createElement('button');
        container.appendChild(button);
      }
      button.type = 'button';
      if (kind === 'widget') {
        button.id = `widget-hide-btn-${index}`;
        button.classList.add('hide-btn', 'mini-theme-widget-hide-btn');
      } else {
        button.classList.add('hide-btn', 'mini-theme-icon-hide-btn');
      }
      button.onclick = (event) => {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        toggleThemeVisibility(kind, index);
      };
      return button;
    }

    function applyThemeIconHiddenState(index, hidden) {
      const item = document.getElementById(`icon-item-${index}`);
      if (!item) return;
      const preview = document.getElementById(`icon-preview-${index}`);
      const actions = item.querySelector('.icon-actions');
      const isFixed = getThemeIconIsFixed(index);
      const existingButton = actions && actions.querySelector('.mini-theme-icon-hide-btn');
      if (isFixed) {
        if (existingButton) existingButton.remove();
        item.style.opacity = '1';
        if (preview) preview.style.filter = '';
        return;
      }
      const button = ensureThemeVisibilityButton(actions, 'icon', index);
      item.style.opacity = hidden ? '0.4' : '1';
      if (preview) preview.style.filter = hidden ? 'grayscale(1)' : '';
      setThemeVisibilityButtonState(button, hidden);
    }

    function applyThemeWidgetHiddenState(index, hidden) {
      const item = document.getElementById(`widget-item-${index}`);
      if (!item) return;
      const preview = document.getElementById(`widget-preview-${index}`);
      const button = ensureThemeVisibilityButton(item.querySelector('.widget-actions'), 'widget', index);
      item.style.opacity = hidden ? '0.4' : '1';
      if (preview) preview.style.filter = hidden ? 'grayscale(1)' : '';
      setThemeVisibilityButtonState(button, hidden);
    }

    function getThemeIconStorageKey(index) {
      if (routeName !== 'theme') return index;
      const item = document.getElementById(`icon-item-${index}`);
      const value = Number(item && item.dataset ? item.dataset.iconKey : '');
      return Number.isInteger(value) && value > 0 ? value : index;
    }

    function getThemeIconIsFixed(index) {
      if (routeName !== 'theme') return false;
      const item = document.getElementById(`icon-item-${index}`);
      return !!(item && item.dataset && item.dataset.iconFixed === '1');
    }

    async function toggleThemeVisibility(kind, index) {
      if (kind === 'icon' && getThemeIconIsFixed(index)) return;
      const storageIndex = kind === 'icon' ? getThemeIconStorageKey(index) : index;
      const key = `${kind}_${storageIndex}_hidden`;
      const nextHidden = !(await getSetting(key));
      await setSetting(key, nextHidden);
      if (kind === 'icon') applyThemeIconHiddenState(index, nextHidden);
      else applyThemeWidgetHiddenState(index, nextHidden);
    }

    async function syncThemeIconVisibilityControls() {
      if (routeName !== 'theme') return;
      const items = Array.from(document.querySelectorAll('#icon-grid-container .icon-item'));
      await Promise.all(items.map(async (_, index) => {
        const storageIndex = getThemeIconStorageKey(index + 1);
        const hidden = getThemeIconIsFixed(index + 1) ? false : !!(await getSetting(`icon_${storageIndex}_hidden`));
        applyThemeIconHiddenState(index + 1, hidden);
      }));
    }

    async function syncThemeWidgetVisibilityControls() {
      if (routeName !== 'theme') return;
      const items = Array.from(document.querySelectorAll('#widget-list-container .widget-item'));
      await Promise.all(items.map(async (_, index) => {
        const hidden = !!(await getSetting(`widget_${index + 1}_hidden`));
        applyThemeWidgetHiddenState(index + 1, hidden);
      }));
    }

    function installThemeVisibilityControls() {
      if (routeName !== 'theme' || window.__miniThemeVisibilityInstalled) return;
      window.__miniThemeVisibilityInstalled = true;
      const wrap = (name, syncFn) => {
        if (typeof window[name] !== 'function' || window[name].__miniThemeVisibilityWrapped) return;
        const original = window[name];
        const wrapped = function wrappedThemeRenderer(...args) {
          const result = original.apply(this, args);
          Promise.resolve(result).finally(syncFn);
          return result;
        };
        wrapped.__miniThemeVisibilityWrapped = true;
        window[name] = wrapped;
      };
      window.toggleIconHide = (index) => toggleThemeVisibility('icon', index);
      window.setWidgetHideState = (index, hidden) => applyThemeWidgetHiddenState(index, !!hidden);
      window.toggleWidgetHide = (index) => toggleThemeVisibility('widget', index);
      wrap('renderIcons', syncThemeIconVisibilityControls);
      wrap('renderWidgets', syncThemeWidgetVisibilityControls);
      syncThemeIconVisibilityControls();
      syncThemeWidgetVisibilityControls();
    }

    function waitForMiniDb() {
      if (window.MiniDB && window.MiniDB.ops) {
        if (typeof window.MiniDB.ready === 'function') {
          return Promise.resolve(window.MiniDB.ready())
            .catch(() => null)
            .then(() => window.MiniDB);
        }
        return Promise.resolve(window.MiniDB);
      }
      return new Promise((resolve) => {
        let attempts = 0;
        const timer = window.setInterval(() => {
          attempts += 1;
          if ((window.MiniDB && window.MiniDB.ops) || attempts > 80) {
            window.clearInterval(timer);
            if (window.MiniDB && typeof window.MiniDB.ready === 'function') {
              Promise.resolve(window.MiniDB.ready())
                .catch(() => null)
                .then(() => resolve(window.MiniDB || null));
              return;
            }
            resolve(window.MiniDB || null);
          }
        }, 50);
      });
    }

    const miniChatProviderConfigs = {
      openai: { label: 'OpenAI', defaultBase: 'https://api.openai.com/v1', basePath: '/v1', chatPath: '/chat/completions', auth: 'bearer' },
      claude: { label: 'Anthropic Claude', defaultBase: 'https://api.anthropic.com/v1', basePath: '/v1', chatPath: '/messages', auth: 'anthropic' },
      qwen: { label: 'Qwen / DashScope', defaultBase: 'https://dashscope.aliyuncs.com/compatible-mode/v1', basePath: '/compatible-mode/v1', chatPath: '/chat/completions', auth: 'bearer' },
      deepseek: { label: 'DeepSeek', defaultBase: 'https://api.deepseek.com', basePath: '', chatPath: '/chat/completions', auth: 'bearer' },
      doubao: { label: 'Doubao / Ark', defaultBase: 'https://ark.cn-beijing.volces.com/api/v3', basePath: '/api/v3', chatPath: '/chat/completions', auth: 'bearer' },
      kimi: { label: 'Kimi / Moonshot', defaultBase: 'https://api.moonshot.cn/v1', basePath: '/v1', chatPath: '/chat/completions', auth: 'bearer' },
      llama: { label: 'Llama / OpenAI Compatible', defaultBase: 'http://localhost:8000/v1', basePath: '/v1', chatPath: '/chat/completions', auth: 'bearer' },
      newapi: { label: 'New API / One API', defaultBase: 'https://your-newapi-host.example/v1', basePath: '/v1', chatPath: '/chat/completions', auth: 'bearer' }
    };

    function getMiniChatProviderConfig(provider) {
      const key = String(provider || '').trim();
      if (typeof providerConfigs !== 'undefined' && providerConfigs && providerConfigs[key]) return providerConfigs[key];
      return miniChatProviderConfigs[key] || miniChatProviderConfigs.openai;
    }

    function cleanMiniChatPathValue(path) {
      return String(path || '').replace(/\/+$/, '');
    }

    function normalizeMiniChatBaseUrl(rawUrl, cfg) {
      const fallback = cfg && cfg.defaultBase ? cfg.defaultBase : miniChatProviderConfigs.openai.defaultBase;
      const value = String(rawUrl || fallback).trim();
      if (!value) throw new Error('Please enter the API URL first');
      let parsed;
      try {
        parsed = new URL(value);
      } catch (error) {
        throw new Error(`Invalid URL: ${value}`);
      }
      let path = cleanMiniChatPathValue(parsed.pathname);
      const knownPaths = [
        '/chat/completions',
        '/messages',
        '/models',
        '/v1/chat/completions',
        '/v1/messages',
        '/v1/models',
        '/api/v3/chat/completions',
        '/api/v3/models',
        '/compatible-mode/v1/chat/completions',
        '/compatible-mode/v1/models'
      ];
      knownPaths.forEach((known) => {
        if (path.endsWith(known)) path = cleanMiniChatPathValue(path.slice(0, -known.length));
      });
      if (cfg && cfg.basePath && !path.endsWith(cfg.basePath)) path = cleanMiniChatPathValue(`${path}${cfg.basePath}`);
      parsed.pathname = path || '/';
      parsed.search = '';
      parsed.hash = '';
      return parsed.toString().replace(/\/$/, '');
    }

    function buildMiniChatEndpoint(rawUrl, cfg, endpointPath) {
      return `${normalizeMiniChatBaseUrl(rawUrl, cfg).replace(/\/$/, '')}${endpointPath}`;
    }

    function buildMiniChatHeaders(cfg, apiKey) {
      const key = String(apiKey || '').trim();
      if (!key) throw new Error('Please enter the API key first');
      if (cfg && cfg.auth === 'anthropic') {
        return {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        };
      }
      return { Authorization: `Bearer ${key}` };
    }

    function extractMiniChatError(data) {
      if (!data) return '';
      if (typeof data === 'string') return data;
      if (data.error) {
        if (typeof data.error === 'string') return data.error;
        return [data.error.type, data.error.code, data.error.message].filter(Boolean).join(' / ');
      }
      if (Array.isArray(data.content) && data.content[0] && data.content[0].text) return data.content[0].text;
      return data.message || data.msg || '';
    }

    function getMiniChatErrorMessage(error) {
      return error && error.message ? error.message : String(error || 'Unknown error');
    }

    function sleep(ms) {
      return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    async function installSettingsApiEnhancements() {
      if (routeName !== 'settings_api' || window.__miniSettingsApiInstalled) return;
      window.__miniSettingsApiInstalled = true;

      const miniDb = await waitForMiniDb();
      const api = miniDb && miniDb.ops && miniDb.ops.api;
      if (!api) return;

      const presetKeys = {
        chat: {
          presets: 'mini.api.chat.presets',
          active: 'mini.api.chat.activePresetId',
          provider: 'mini.api.chat.provider'
        },
        voice: {
          presets: 'mini.api.voice.presets',
          active: 'mini.api.voice.activePresetId'
        }
      };

      const providerSelect = document.getElementById('api-provider');
      const chatUrlInput = document.getElementById('api-url');
      const chatModelInput = document.getElementById('chat-model');
      const chatModelList = document.getElementById('chat-model-list');
      const chatBody = document.getElementById('chat-body');
      const voiceBody = document.getElementById('voice-body');
      const chatHeader = chatBody && chatBody.previousElementSibling;
      const voiceHeader = voiceBody && voiceBody.previousElementSibling;
      if (!providerSelect || !chatUrlInput || !chatBody || !voiceBody || !chatHeader || !voiceHeader) return;

      const defaultVoiceUrl = (typeof voiceEndpointMap !== 'undefined' && voiceEndpointMap && voiceEndpointMap.official)
        ? voiceEndpointMap.official
        : 'https://api.minimax.io/v1/t2a_v2';

      function cleanPathValue(path) {
        return String(path || '').replace(/\/+$/, '');
      }

      function closePresetPanels(exceptKind = '') {
        Object.values(presetState).forEach((state) => {
          const open = !!exceptKind && exceptKind === state.kind && state.panel && !state.panel.classList.contains('open');
          if (state.panel) state.panel.classList.toggle('open', open);
          if (state.chevron) state.chevron.style.transform = open ? 'rotate(0deg)' : 'rotate(-90deg)';
        });
      }

      function getVoiceEnv(url) {
        return /api-uw\.minimax\.io/i.test(String(url || '')) ? 'uw' : 'official';
      }

      function syncVoiceEnv(url) {
        const activeEnv = getVoiceEnv(url);
        document.querySelectorAll('#voice-body .radio-pill').forEach((pill, index) => {
          pill.classList.toggle('active', activeEnv === 'official' ? index === 0 : index === 1);
        });
      }

      function updateTemperature(value) {
        const range = document.querySelector('#chat-body input[type=range]');
        const next = value == null || value === '' ? '0.7' : String(value);
        if (range) range.value = next;
        const label = document.getElementById('temp-val');
        if (label) label.innerText = next;
      }

      function updateSpeed(value) {
        const next = value == null || value === '' ? '1.0' : String(value);
        const range = document.getElementById('voice-speed');
        const label = document.getElementById('speed-val');
        if (range) range.value = next;
        if (label) label.innerText = `${next}x`;
      }

      function readChatForm() {
        const range = document.querySelector('#chat-body input[type=range]');
        return {
          provider: providerSelect.value || 'openai',
          url: chatUrlInput.value.trim(),
          apiKey: document.getElementById('chat-apikey').value || '',
          model: chatModelInput.value.trim(),
          context: document.getElementById('ctx-input').value || '20',
          temperature: range ? range.value : '0.7'
        };
      }

      function writeChatForm(data) {
        const next = data || {};
        const provider = next.provider || 'openai';
        providerSelect.value = provider;
        chatUrlInput.value = next.url != null ? next.url : '';
        document.getElementById('chat-apikey').value = next.apiKey || '';
        chatModelInput.value = next.model || '';
        document.getElementById('ctx-input').value = next.context || '20';
        updateTemperature(next.temperature);
        if (typeof window.updateCtx === 'function') window.updateCtx(document.getElementById('ctx-input').value);
        if (chatModelList) chatModelList.style.display = 'none';
      }

      function readVoiceForm() {
        const url = document.getElementById('voice-url').value.trim();
        return {
          url,
          apiKey: document.getElementById('voice-apikey').value || '',
          groupId: document.getElementById('voice-group-id').value.trim(),
          ttsModel: document.getElementById('voice-tts-model').value.trim(),
          voiceId: document.getElementById('voice-id').value.trim(),
          language: document.getElementById('voice-language').value || 'Chinese',
          speed: document.getElementById('voice-speed').value || '1.0',
          env: getVoiceEnv(url)
        };
      }

      function writeVoiceForm(data) {
        const next = data || {};
        const url = next.url != null && next.url !== '' ? next.url : defaultVoiceUrl;
        document.getElementById('voice-url').value = url;
        document.getElementById('voice-apikey').value = next.apiKey || '';
        document.getElementById('voice-group-id').value = next.groupId || '';
        document.getElementById('voice-tts-model').value = next.ttsModel || 'speech-2.8-hd';
        document.getElementById('voice-id').value = next.voiceId || '';
        document.getElementById('voice-language').value = next.language || 'Chinese';
        updateSpeed(next.speed);
        syncVoiceEnv(url);
      }

      async function persistChatProvider() {
        await api.setConfig(presetKeys.chat.provider, providerSelect.value || 'openai');
      }

      async function persistChatConfig(showNotice = true, options = {}) {
        const preserveActivePreset = !!(options && options.preserveActivePreset);
        const data = readChatForm();
        if (!preserveActivePreset && presetState.chat.activeId) {
          presetState.chat.activeId = null;
          await api.setConfig(presetKeys.chat.active, null);
          updatePresetBadge(presetState.chat);
          renderPresetList(presetState.chat);
        }
        await api.saveChatConfig(data);
        await persistChatProvider();
        if (showNotice) showMiniNotice('Chat config saved');
        return data;
      }

      async function persistVoiceConfig(showNotice = true) {
        const data = readVoiceForm();
        await api.saveVoiceConfig(data);
        if (showNotice) showMiniNotice('Voice config saved');
        return data;
      }

      function createPresetPanel(state) {
        const panel = document.createElement('div');
        panel.className = 'mini-preset-panel';
        panel.id = `mini-${state.kind}-preset-panel`;
        panel.innerHTML = '<div class="mini-preset-list"></div>';
        state.header.insertAdjacentElement('afterend', panel);
        state.panel = panel;
        state.list = panel.querySelector('.mini-preset-list');
      }

      function ensureCurrentBadge(state) {
        const badge = document.createElement('span');
        badge.className = 'mini-preset-current is-empty';
        state.title.insertBefore(badge, state.chevron || null);
        state.badge = badge;
      }

      const presetState = {
        chat: {
          kind: 'chat',
          header: chatHeader,
          title: chatHeader.querySelector('.preset-title'),
          chevron: document.getElementById('chat-chevron'),
          body: chatBody,
          keys: presetKeys.chat,
          readForm: readChatForm,
          writeForm: writeChatForm,
          getMeta(preset) {
            const cfg = (typeof providerConfigs !== 'undefined' && providerConfigs && preset.provider)
              ? providerConfigs[preset.provider]
              : null;
            return [cfg && cfg.label ? cfg.label : (preset.provider || 'Custom Provider'), preset.model || 'No Model']
              .filter(Boolean)
              .join(' / ');
          }
        },
        voice: {
          kind: 'voice',
          header: voiceHeader,
          title: voiceHeader.querySelector('.preset-title'),
          chevron: document.getElementById('voice-chevron'),
          body: voiceBody,
          keys: presetKeys.voice,
          readForm: readVoiceForm,
          writeForm: writeVoiceForm,
          getMeta(preset) {
            return [preset.ttsModel || 'speech-2.8-hd', preset.voiceId || 'No Voice ID']
              .filter(Boolean)
              .join(' / ');
          }
        }
      };

      Object.values(presetState).forEach((state) => {
        state.body.style.display = 'flex';
        createPresetPanel(state);
        ensureCurrentBadge(state);
        if (state.chevron) state.chevron.style.transform = 'rotate(-90deg)';
      });

      function getActivePreset(state) {
        return state.presets.find((preset) => preset.id === state.activeId) || null;
      }

      function updatePresetBadge(state) {
        const active = getActivePreset(state);
        if (!state.badge) return;
        if (active) {
          state.badge.textContent = active.name;
          state.badge.classList.remove('is-empty');
          state.badge.title = active.name;
        } else {
          state.badge.textContent = 'Manual config';
          state.badge.classList.add('is-empty');
          state.badge.title = 'Current manual config';
        }
      }

      function renderPresetList(state) {
        if (!state.list) return;
        state.list.innerHTML = '';

        const manual = document.createElement('button');
        manual.type = 'button';
        manual.className = `mini-preset-item${state.activeId ? '' : ' active'}`;
        manual.innerHTML = '<span class="mini-preset-copy"><span class="mini-preset-name">Manual config</span><span class="mini-preset-meta">Keep the current form values without applying a named preset.</span></span>';
        manual.addEventListener('click', async () => {
          state.activeId = null;
          await api.setConfig(state.keys.active, null);
          updatePresetBadge(state);
          renderPresetList(state);
          closePresetPanels();
          if (state.kind === 'chat') await persistChatConfig(false);
          if (state.kind === 'voice') await persistVoiceConfig(false);
        });
        state.list.appendChild(manual);

        if (!state.presets.length) {
          const empty = document.createElement('div');
          empty.className = 'mini-preset-empty';
          empty.textContent = 'No presets yet. Save the current config to create one.';
          state.list.appendChild(empty);
          return;
        }

        state.presets.forEach((preset) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = `mini-preset-item${preset.id === state.activeId ? ' active' : ''}`;
          button.innerHTML = `<span class="mini-preset-copy"><span class="mini-preset-name"></span><span class="mini-preset-meta"></span></span>`;
          button.querySelector('.mini-preset-name').textContent = preset.name;
          button.querySelector('.mini-preset-meta').textContent = state.getMeta(preset);
          button.addEventListener('click', async () => {
            state.writeForm(preset);
            state.activeId = preset.id;
            await api.setConfig(state.keys.active, preset.id);
            updatePresetBadge(state);
            renderPresetList(state);
            if (state.kind === 'chat') {
              await persistChatProvider();
              await persistChatConfig(false, { preserveActivePreset: true });
            }
            if (state.kind === 'voice') await persistVoiceConfig(false);
            closePresetPanels();
            showMiniNotice(`Switched to preset: ${preset.name}`);
          });
          state.list.appendChild(button);
        });
      }

      function ensurePresetDialog() {
        let overlay = document.getElementById('mini-preset-name-modal');
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.id = 'mini-preset-name-modal';
        overlay.className = 'modal-overlay';
        overlay.style.display = 'none';
        overlay.innerHTML = `
          <div class="modal-box">
            <div class="modal-header">Preset name</div>
            <input type="text" id="mini-preset-name-input" placeholder="Enter preset name">
            <div class="modal-actions">
              <button type="button" class="btn-cancel">Cancel</button>
              <button type="button" class="btn-save">Save</button>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
      }

      function requestPresetName(title, value) {
        const overlay = ensurePresetDialog();
        const header = overlay.querySelector('.modal-header');
        const input = overlay.querySelector('#mini-preset-name-input');
        const cancelButton = overlay.querySelector('.btn-cancel');
        const saveButton = overlay.querySelector('.btn-save');

        header.textContent = title;
        input.value = value || '';
        overlay.style.display = 'flex';
        overlay.classList.add('show');

        return new Promise((resolve) => {
          function cleanup(result) {
            overlay.classList.remove('show');
            overlay.style.display = 'none';
            cancelButton.removeEventListener('click', handleCancel);
            saveButton.removeEventListener('click', handleSave);
            overlay.removeEventListener('click', handleOverlay);
            input.removeEventListener('keydown', handleKeydown);
            resolve(result);
          }
          function handleCancel() { cleanup(null); }
          function handleSave() { cleanup(input.value.trim()); }
          function handleOverlay(event) {
            if (event.target === overlay) cleanup(null);
          }
          function handleKeydown(event) {
            if (event.key === 'Enter') {
              event.preventDefault();
              cleanup(input.value.trim());
            }
            if (event.key === 'Escape') cleanup(null);
          }
          cancelButton.addEventListener('click', handleCancel);
          saveButton.addEventListener('click', handleSave);
          overlay.addEventListener('click', handleOverlay);
          input.addEventListener('keydown', handleKeydown);
          window.setTimeout(() => {
            input.focus();
            input.select();
          }, 0);
        });
      }

      async function savePreset(kind) {
        const state = presetState[kind];
        const active = getActivePreset(state);
        const presetName = await requestPresetName(kind === 'chat' ? 'Name chat preset' : 'Name voice preset', active ? active.name : '');
        if (presetName == null) return;
        if (!presetName) {
          showMiniNotice('Enter a preset name');
          return;
        }

        const sameName = state.presets.find((preset) => preset.name === presetName);
        const shouldUpdateActive = active && active.name === presetName;
        const base = shouldUpdateActive ? active : (sameName || null);
        const stamp = Date.now();
        const nextPreset = {
          ...(base || {}),
          ...state.readForm(),
          id: base && base.id ? base.id : `${kind}-${stamp.toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          name: presetName,
          createdAt: base && base.createdAt ? base.createdAt : stamp,
          updatedAt: stamp
        };

        state.presets = [
          nextPreset,
          ...state.presets.filter((preset) => preset.id !== nextPreset.id)
        ].sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0));

        state.activeId = nextPreset.id;
        await api.setConfig(state.keys.presets, state.presets);
        await api.setConfig(state.keys.active, nextPreset.id);
        updatePresetBadge(state);
        renderPresetList(state);
        if (kind === 'chat') {
          await persistChatProvider();
          await persistChatConfig(false, { preserveActivePreset: true });
        }
        if (kind === 'voice') await persistVoiceConfig(false);
        closePresetPanels();
        showMiniNotice(base ? `Preset updated: ${presetName}` : `Saved as preset: ${presetName}`);
      }

      async function deleteActivePreset(kind) {
        const state = presetState[kind];
        const active = getActivePreset(state);
        if (!active) {
          showMiniNotice('Select a preset first');
          return;
        }
        state.presets = state.presets.filter((preset) => preset.id !== active.id);
        state.activeId = null;
        await api.setConfig(state.keys.presets, state.presets);
        await api.setConfig(state.keys.active, null);
        updatePresetBadge(state);
        renderPresetList(state);
        closePresetPanels();
        showMiniNotice(`Preset deleted: ${active.name}`);
      }

      function togglePresetPanel(kind) {
        const state = presetState[kind];
        if (!state || !state.panel) return;
        const shouldOpen = !state.panel.classList.contains('open');
        Object.values(presetState).forEach((entry) => {
          const open = entry.kind === kind ? shouldOpen : false;
          entry.panel.classList.toggle('open', open);
          if (entry.chevron) entry.chevron.style.transform = open ? 'rotate(0deg)' : 'rotate(-90deg)';
        });
      }

      const chatButtons = chatHeader.querySelectorAll('.preset-actions .icon-btn');
      const voiceButtons = voiceHeader.querySelectorAll('.preset-actions .icon-btn');

      if (typeof window.selectEnv === 'function') {
        const originalSelectEnv = window.selectEnv;
        window.selectEnv = function patchedSelectEnv(el, type) {
          const result = originalSelectEnv.call(this, el, type);
          syncVoiceEnv(document.getElementById('voice-url').value);
          return result;
        };
      }

      let autoFillHandledByRuntime = false;
      let scheduledChatPersist = 0;

      function scheduleChatConfigPersist(options = {}) {
        window.clearTimeout(scheduledChatPersist);
        scheduledChatPersist = window.setTimeout(() => {
          persistChatConfig(false, options).catch(() => persistChatProvider().catch(() => null));
        }, 0);
      }

      window.toggleCollapse = (id) => togglePresetPanel(id === 'chat-body' ? 'chat' : 'voice');
      const originalAutoFillUrl = typeof window.autoFillUrl === 'function' ? window.autoFillUrl : null;
      window.autoFillUrl = () => {
        autoFillHandledByRuntime = true;
        if (typeof originalAutoFillUrl === 'function') {
          originalAutoFillUrl();
        } else {
          const cfg = (typeof providerConfigs !== 'undefined' && providerConfigs)
            ? providerConfigs[providerSelect.value]
            : null;
          if (cfg && cfg.defaultBase != null) chatUrlInput.value = cfg.defaultBase;
        }
        if (chatModelList) chatModelList.style.display = 'none';
        scheduleChatConfigPersist();
        window.setTimeout(() => {
          autoFillHandledByRuntime = false;
        }, 0);
      };
      window.normalizeBaseUrl = function normalizeBaseUrlPatched(rawUrl, cfg) {
        const value = String(rawUrl || '').trim();
        if (!value) throw new Error('Please enter the API URL first');
        let parsed;
        try {
          parsed = new URL(value);
        } catch (error) {
          throw new Error(`Invalid URL: ${value}`);
        }
        let path = cleanPathValue(parsed.pathname);
        const knownPaths = [
          '/chat/completions',
          '/messages',
          '/models',
          '/v1/chat/completions',
          '/v1/messages',
          '/v1/models',
          '/api/v3/chat/completions',
          '/api/v3/models',
          '/compatible-mode/v1/chat/completions',
          '/compatible-mode/v1/models'
        ];
        knownPaths.forEach((known) => {
          if (path.endsWith(known)) path = cleanPathValue(path.slice(0, -known.length));
        });
        if (cfg && cfg.basePath && !path.endsWith(cfg.basePath)) path = cleanPathValue(`${path}${cfg.basePath}`);
        parsed.pathname = path || '/';
        parsed.search = '';
        parsed.hash = '';
        return parsed.toString().replace(/\/$/, '');
      };
      window.saveChatConfig = () => persistChatConfig(true).catch((error) => showMiniNotice(`Chat config save failed: ${error.message || error}`));
      window.saveVoiceConfig = () => persistVoiceConfig(true).catch((error) => showMiniNotice(`Voice config save failed: ${error.message || error}`));

      if (providerSelect.dataset.miniProviderPersist !== '1') {
        providerSelect.dataset.miniProviderPersist = '1';
        providerSelect.addEventListener('change', () => {
          if (chatModelList) chatModelList.style.display = 'none';
          window.setTimeout(() => {
            if (!autoFillHandledByRuntime) scheduleChatConfigPersist();
          }, 0);
        });
      }

      chatButtons.forEach((button, index) => {
        button.onclick = null;
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (index === 0) savePreset('chat');
          if (index === 1) deleteActivePreset('chat');
        });
      });
      voiceButtons.forEach((button, index) => {
        button.onclick = null;
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (index === 0) savePreset('voice');
          if (index === 1) deleteActivePreset('voice');
        });
      });

      [presetState.chat, presetState.voice].forEach((state) => {
        if (!state.title) return;
        state.title.onclick = null;
        state.title.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          togglePresetPanel(state.kind);
        });
      });

      const [chatConfig, voiceConfig, storedProvider, chatPresets, voicePresets, activeChatPresetId, activeVoicePresetId] = await Promise.all([
        api.getChatConfig(),
        api.getVoiceConfig(),
        api.getConfig(presetKeys.chat.provider),
        api.getConfig(presetKeys.chat.presets),
        api.getConfig(presetKeys.voice.presets),
        api.getConfig(presetKeys.chat.active),
        api.getConfig(presetKeys.voice.active)
      ]);

      writeChatForm({
        provider: storedProvider || (chatConfig && chatConfig.provider) || 'openai',
        url: chatConfig && chatConfig.url != null ? chatConfig.url : '',
        apiKey: chatConfig && chatConfig.apiKey,
        model: chatConfig && chatConfig.model,
        context: chatConfig && chatConfig.context,
        temperature: chatConfig && chatConfig.temperature
      });

      writeVoiceForm({
        url: voiceConfig && voiceConfig.url,
        apiKey: voiceConfig && voiceConfig.apiKey,
        groupId: voiceConfig && voiceConfig.groupId,
        ttsModel: voiceConfig && voiceConfig.ttsModel,
        voiceId: voiceConfig && voiceConfig.voiceId,
        language: voiceConfig && voiceConfig.language,
        speed: voiceConfig && voiceConfig.speed
      });

      presetState.chat.presets = Array.isArray(chatPresets) ? chatPresets.slice().sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0)) : [];
      presetState.voice.presets = Array.isArray(voicePresets) ? voicePresets.slice().sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0)) : [];
      presetState.chat.activeId = activeChatPresetId || null;
      presetState.voice.activeId = activeVoicePresetId || null;

      [presetState.chat, presetState.voice].forEach((state) => {
        if (state.activeId && !state.presets.some((preset) => preset.id === state.activeId)) state.activeId = null;
        updatePresetBadge(state);
        renderPresetList(state);
      });

      const initialChatPreset = getActivePreset(presetState.chat);
      const initialVoicePreset = getActivePreset(presetState.voice);
      if (initialChatPreset) writeChatForm(initialChatPreset);
      if (initialVoicePreset) writeVoiceForm(initialVoicePreset);
      if (initialChatPreset) await persistChatProvider();
    }

    function waitForDexie() {
      if (window.Dexie) return Promise.resolve(window.Dexie);
      return new Promise((resolve) => {
        let attempts = 0;
        const timer = window.setInterval(() => {
          attempts += 1;
          if (window.Dexie || attempts > 60) {
            window.clearInterval(timer);
            resolve(window.Dexie || null);
          }
        }, 50);
      });
    }

    function contactSchema(db) {
      db.version(5).stores({
        contacts: '++id, type, nickname, name, gender, account, signature, lore, presetAssoc, worldbookAssoc, language',
        relations: '++id, sourceGlobalId, targetGlobalId, relationType, relationDesc',
        messages: '++id, chatId, type, timestamp, createdAt, updatedAt, [chatId+timestamp]',
        memories: '++id, chatId, kind, importance, createdAt, updatedAt, [chatId+updatedAt], [chatId+kind]',
        schedules: '++id, contactId, kind, probability, createdAt, updatedAt, [contactId+updatedAt], [contactId+kind]'
      });
    }

    async function openContactsDatabase() {
      const miniDb = window.MiniDB && window.MiniDB.databases ? window.MiniDB : null;
      const DexieCtor = miniDb ? null : await waitForDexie();
      if (!miniDb && !DexieCtor) return null;
      const db = miniDb ? miniDb.databases.contacts : new DexieCtor('ContactsExtDB');
      if (!miniDb) {
        contactSchema(db);
        await db.open();
      }
      return {
        db,
        close: () => {
          if (!miniDb) db.close();
        }
      };
    }

    async function openAnniversaryDatabase() {
      const miniDb = window.MiniDB && window.MiniDB.databases ? window.MiniDB : null;
      const DexieCtor = miniDb ? null : await waitForDexie();
      if (!miniDb && !DexieCtor) return null;
      const db = miniDb ? miniDb.databases.anniversary : new DexieCtor('AnniversaryProDB');
      if (!miniDb) {
        db.version(3).stores({ events: '++id, title, date, identity, type, countMethod, isPinned, targetChar, targetContactId, targetContactType' });
        await db.open();
      }
      return {
        db,
        close: () => {
          if (!miniDb) db.close();
        }
      };
    }

    function matchesGeneratedRecord(record, seed) {
      return Object.entries(seed).every(([field, value]) => String(record[field] || '').trim() === value);
    }

    function isGeneratedContact(contact) {
      if (!contact) return false;
      const generatedContacts = [
        {
          account: 'wechat_team',
          nickname: 'WeChat Team',
          name: 'WeChat Team',
          signature: 'Official service contact for WeChat account and product notices.'
        },
        {
          account: 'filehelper',
          nickname: 'File Transfer',
          name: 'File Transfer Assistant',
          signature: 'Built-in WeChat chat for moving text, images, and files between devices.'
        },
        {
          account: 'tencent_news',
          nickname: 'Tencent News',
          name: 'Tencent News',
          signature: 'Tencent news service and public information feed.'
        },
        {
          account: 'tencent_service',
          nickname: 'Tencent Customer Service',
          name: 'Tencent Customer Service',
          signature: 'Tencent customer support and service channel.'
        },
        {
          nickname: 'Lin Mo',
          signature: 'Structure over decoration. Keep it pure.'
        },
        {
          nickname: 'Design Group',
          signature: 'The flat UI assets have been uploaded.'
        },
        {
          nickname: 'System Notice',
          signature: 'Database synced via Dexie.js successfully.'
        }
      ];
      return generatedContacts.some((seed) => matchesGeneratedRecord(contact, seed));
    }

    function normalizeContactIdentityText(value) {
      return String(value == null ? '' : value)
        .replace(/\r/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    }

    function isAutoGeneratedContactAccount(value) {
      return /^[CN]_[A-Z0-9]+_[A-Z0-9]{4}$/i.test(String(value || '').trim());
    }

    function buildDuplicateContactFingerprint(contact) {
      if (!contact || typeof contact !== 'object') return '';
      const type = normalizeContactIdentityText(contact.type) || 'char';
      const account = normalizeContactIdentityText(contact.account);
      if (account && !isAutoGeneratedContactAccount(account)) return `account:${type}:${account}`;

      const nickname = normalizeContactIdentityText(contact.nickname);
      const name = normalizeContactIdentityText(contact.name);
      const signature = normalizeContactIdentityText(contact.signature);
      const lore = normalizeContactIdentityText(contact.lore);
      const avatar = String(contact.avatar || '').trim();
      const identity = [nickname, name].filter(Boolean).join('|');
      const narrative = [signature, lore].filter(Boolean).join('|');

      if (!identity) return '';
      if (narrative && narrative.length >= 16) return `story:${type}:${identity}:${narrative}`;
      if (avatar && narrative) return `portrait:${type}:${identity}:${narrative}:${avatar.slice(0, 96)}`;
      if (avatar && nickname && name) return `portrait:${type}:${nickname}|${name}:${avatar.slice(0, 96)}`;
      return '';
    }

    function scoreContactCompleteness(contact) {
      if (!contact) return 0;
      const nickname = String(contact.nickname || '').trim();
      const name = String(contact.name || '').trim();
      const signature = String(contact.signature || '').trim();
      const lore = String(contact.lore || '').trim();
      const avatar = String(contact.avatar || '').trim();
      const account = String(contact.account || '').trim();
      let score = 0;
      if (nickname) score += 12 + Math.min(nickname.length, 18);
      if (name) score += 10 + Math.min(name.length, 18);
      if (signature) score += 14 + Math.min(signature.length, 48);
      if (lore) score += 18 + Math.min(lore.length, 72);
      if (avatar) score += 18;
      if (account && !isAutoGeneratedContactAccount(account)) score += 14;
      if (contact.presetAssoc && contact.presetAssoc !== 'NONE') score += 6;
      if (contact.worldbookAssoc && contact.worldbookAssoc !== 'NONE') score += 6;
      return score;
    }

    function chooseCanonicalContact(left, right) {
      if (!left) return right || null;
      if (!right) return left;
      const leftScore = scoreContactCompleteness(left);
      const rightScore = scoreContactCompleteness(right);
      if (rightScore > leftScore) return right;
      if (rightScore < leftScore) return left;
      const leftUpdated = Number(left.updatedAt || left.createdAt || 0);
      const rightUpdated = Number(right.updatedAt || right.createdAt || 0);
      if (rightUpdated > leftUpdated) return right;
      if (rightUpdated < leftUpdated) return left;
      return Number(right.id) < Number(left.id) ? right : left;
    }

    function pickPreferredContactValue(currentValue, incomingValue, options = {}) {
      const currentText = String(currentValue == null ? '' : currentValue).trim();
      const incomingText = String(incomingValue == null ? '' : incomingValue).trim();
      if (!incomingText) return currentText;
      if (!currentText) return incomingText;
      if (options.preferIncomingWhenLonger && incomingText.length > currentText.length + 8) return incomingText;
      return currentText;
    }

    function buildMergedContactChanges(primary, secondary) {
      if (!primary || !secondary) return {};
      const next = {
        nickname: pickPreferredContactValue(primary.nickname, secondary.nickname, { preferIncomingWhenLonger: true }),
        name: pickPreferredContactValue(primary.name, secondary.name, { preferIncomingWhenLonger: true }),
        gender: (primary.gender && primary.gender !== 'X') ? primary.gender : (secondary.gender || primary.gender || 'X'),
        account: (!isAutoGeneratedContactAccount(primary.account) && String(primary.account || '').trim())
          ? primary.account
          : pickPreferredContactValue(primary.account, secondary.account),
        language: pickPreferredContactValue(primary.language, secondary.language),
        signature: pickPreferredContactValue(primary.signature, secondary.signature, { preferIncomingWhenLonger: true }),
        lore: pickPreferredContactValue(primary.lore, secondary.lore, { preferIncomingWhenLonger: true }),
        presetAssoc: (primary.presetAssoc && primary.presetAssoc !== 'NONE') ? primary.presetAssoc : (secondary.presetAssoc || 'NONE'),
        worldbookAssoc: joinContactAssocValues('worldbook', [
          ...splitContactAssocValues('worldbook', primary.worldbookAssoc),
          ...splitContactAssocValues('worldbook', secondary.worldbookAssoc)
        ]),
        avatar: pickPreferredContactValue(primary.avatar, secondary.avatar)
      };
      const changes = {};
      Object.keys(next).forEach((key) => {
        const currentText = String(primary[key] == null ? '' : primary[key]).trim();
        const nextText = String(next[key] == null ? '' : next[key]).trim();
        if (currentText !== nextText) changes[key] = next[key];
      });
      return changes;
    }

    function buildRelationFingerprint(relation) {
      if (!relation) return '';
      const source = String(relation.sourceGlobalId || '').trim();
      const target = String(relation.targetGlobalId || '').trim();
      if (!source || !target) return '';
      const relationType = normalizeContactIdentityText(relation.relationType);
      const relationDesc = normalizeContactIdentityText(relation.relationDesc);
      return [source, target, relationType, relationDesc].join('|');
    }

    async function migrateContactScopedRows(table, indexName, sourceId, targetId) {
      if (!table || sourceId == null || targetId == null || sourceId === targetId) return;
      const rows = await table.where(indexName).equals(sourceId).toArray();
      for (const row of rows) {
        await table.update(row.id, { [indexName]: targetId });
      }
    }

    async function pruneDuplicateRelationsTable(db) {
      if (!db || !db.relations) return;
      const relations = await db.relations.toArray();
      const seen = new Set();
      for (const relation of relations) {
        const key = buildRelationFingerprint(relation);
        if (!key || seen.has(key)) {
          await db.relations.delete(relation.id);
          continue;
        }
        seen.add(key);
      }
    }

    async function collapseDuplicateContacts() {
      const handle = await openContactsDatabase();
      if (!handle) return [];
      const { db, close } = handle;
      try {
        const contacts = await db.contacts.toArray();
        const grouped = new Map();
        contacts.forEach((contact) => {
          const key = buildDuplicateContactFingerprint(contact);
          if (!key) return;
          if (!grouped.has(key)) grouped.set(key, []);
          grouped.get(key).push(contact);
        });
        const duplicateGroups = Array.from(grouped.values()).filter((group) => group.length > 1);
        if (!duplicateGroups.length) return contacts;

        const relations = db.relations ? await db.relations.toArray() : [];
        for (const group of duplicateGroups) {
          const sorted = group.slice().sort((left, right) => {
            const winner = chooseCanonicalContact(left, right);
            if (winner === right) return 1;
            if (winner === left) return -1;
            return 0;
          });
          let canonical = sorted[0];
          for (const duplicate of sorted.slice(1)) {
            if (!duplicate || duplicate.id === canonical.id) continue;
            const changes = buildMergedContactChanges(canonical, duplicate);
            if (Object.keys(changes).length) {
              await db.contacts.update(canonical.id, changes);
              canonical = { ...canonical, ...changes };
            }
            const sourceGlobalId = `${duplicate.type}_${duplicate.id}`;
            const targetGlobalId = `${canonical.type}_${canonical.id}`;
            for (const relation of relations) {
              const next = {};
              if (relation.sourceGlobalId === sourceGlobalId) {
                relation.sourceGlobalId = targetGlobalId;
                next.sourceGlobalId = targetGlobalId;
              }
              if (relation.targetGlobalId === sourceGlobalId) {
                relation.targetGlobalId = targetGlobalId;
                next.targetGlobalId = targetGlobalId;
              }
              if (Object.keys(next).length) await db.relations.update(relation.id, next);
            }
            await migrateContactScopedRows(db.messages, 'chatId', duplicate.id, canonical.id);
            await migrateContactScopedRows(db.memories, 'chatId', duplicate.id, canonical.id);
            await migrateContactScopedRows(db.schedules, 'contactId', duplicate.id, canonical.id);
            await db.contacts.delete(duplicate.id);
          }
        }
        await pruneDuplicateRelationsTable(db);
        return db.contacts.toArray();
      } finally {
        close();
      }
    }

    async function purgeGeneratedContacts() {
      const handle = await openContactsDatabase();
      if (!handle) return [];
      const { db, close } = handle;
      try {
        const contacts = await db.contacts.toArray();
        const deletedGlobalIds = new Set();
        const deletedContactIds = [];
        for (const contact of contacts) {
          if (!isGeneratedContact(contact)) continue;
          deletedGlobalIds.add(`${contact.type}_${contact.id}`);
          deletedContactIds.push(contact.id);
          await db.contacts.delete(contact.id);
        }
        if (deletedGlobalIds.size && db.relations) {
          const relations = await db.relations.toArray();
          for (const relation of relations) {
            if (deletedGlobalIds.has(relation.sourceGlobalId) || deletedGlobalIds.has(relation.targetGlobalId)) {
              await db.relations.delete(relation.id);
            }
          }
        }
        if (deletedContactIds.length && db.messages && db.memories && db.schedules) {
          for (const currentContactId of deletedContactIds) {
            await db.messages.where('chatId').equals(currentContactId).delete();
            await db.memories.where('chatId').equals(currentContactId).delete();
            await db.schedules.where('contactId').equals(currentContactId).delete();
          }
        }
        return db.contacts.toArray();
      } finally {
        close();
      }
    }

    async function loadUserContacts() {
      await purgeGeneratedContacts();
      return collapseDuplicateContacts();
    }

    function isGeneratedAnniversary(event) {
      if (!event) return false;
      const generatedEvents = [
        { title: 'Met Lin Mo', date: '2026-04-10', targetChar: 'Lin Mo' },
        { title: 'System Setup', date: '2026-04-14', targetChar: '' },
        { title: 'WeChat Launch', date: '2011-01-21', targetChar: 'WeChat Team' },
        { title: 'Tencent Founded', date: '1998-11-11', targetChar: 'Tencent' }
      ];
      return generatedEvents.some((seed) => (
        String(event.title || '').trim() === seed.title &&
        String(event.date || '').trim() === seed.date &&
        String(event.targetChar || '').trim() === seed.targetChar
      ));
    }

    async function purgeGeneratedAnniversaries() {
      const handle = await openAnniversaryDatabase();
      if (!handle) return;
      const { db, close } = handle;
      try {
        const events = await db.events.toArray();
        for (const event of events) {
          if (isGeneratedAnniversary(event)) {
            await db.events.delete(event.id);
          }
        }
      } finally {
        close();
      }
    }

    function getWechatAvatarFallback(index, role = 'contact') {
      const contactPalettes = [
        ['#d7e8f7', '#f8fbff'],
        ['#e6ead7', '#ffffff'],
        ['#e7dff3', '#ffffff'],
        ['#f0e4d8', '#ffffff']
      ];
      const userPalettes = [
        ['#f1e6e0', '#fffaf5'],
        ['#e2e9f7', '#fcfdff'],
        ['#e8ece1', '#ffffff'],
        ['#efe2f4', '#ffffff']
      ];
      const palettes = role === 'user' ? userPalettes : contactPalettes;
      return palettes[Math.abs(Number(index) || 0) % palettes.length];
    }

    function paintWechatAvatarFallback(el, index, role = 'contact') {
      if (!el) return;
      const colors = getWechatAvatarFallback(index, role);
      el.style.backgroundImage = `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
      el.style.backgroundColor = colors[0];
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.style.backgroundRepeat = 'no-repeat';
    }

    function getWechatLinkedUserMask(contact) {
      if (contact && contact.__miniUserMask) return contact.__miniUserMask;
      return window.__miniWechatPrimaryUserMask || null;
    }

    function getWechatAvatarUrl(role, index, options = {}) {
      const contacts = getCurrentWechatContacts();
      const selection = getCurrentWechatSelection();
      const currentIndex = Number.isInteger(index) && index >= 0 ? index : selection.index;
      const contact = options.contact || contacts[currentIndex] || selection.contact || null;
      if (role === 'user') {
        const userMask = options.userMask || getWechatLinkedUserMask(contact);
        return sanitizeWechatText(userMask && userMask.avatar);
      }
      return sanitizeWechatText(contact && contact.avatar);
    }

    function setAvatarSurface(el, index, options = {}) {
      if (!el) return;
      const role = options.role === 'user' ? 'user' : 'contact';
      const avatarUrl = getWechatAvatarUrl(role, index, options);
      if (avatarUrl) {
        el.style.backgroundImage = `url("${cleanCssUrl(avatarUrl)}")`;
        el.style.backgroundColor = 'transparent';
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.style.backgroundRepeat = 'no-repeat';
        return;
      }
      paintWechatAvatarFallback(el, index, role);
    }

    function startOfWechatDay(value) {
      const date = new Date(value);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    function isSameWechatDay(leftValue, rightValue) {
      const left = new Date(leftValue);
      const right = new Date(rightValue);
      return left.getFullYear() === right.getFullYear()
        && left.getMonth() === right.getMonth()
        && left.getDate() === right.getDate();
    }

    function formatWechatHumanTime(timestamp) {
      const value = Number(timestamp);
      if (!Number.isFinite(value) || value <= 0) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      const now = Date.now();
      if (now - value < wechatTimestampGapMs) return 'Just now';
      if (isSameWechatDay(now, value)) {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
      const todayStart = startOfWechatDay(now).getTime();
      const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
      if (value >= yesterdayStart && value < todayStart) {
        return `Yesterday ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      }
      const currentYear = new Date(now).getFullYear();
      if (date.getFullYear() === currentYear) {
        return `${date.toLocaleString('en-US', { month: 'short' })} ${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      }
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    function shouldRenderWechatTimestamp(previousTimestamp, currentTimestamp) {
      const currentValue = Number(currentTimestamp);
      if (!Number.isFinite(currentValue) || currentValue <= 0) return false;
      const previousValue = Number(previousTimestamp);
      if (!Number.isFinite(previousValue) || previousValue <= 0) return true;
      if (!isSameWechatDay(previousValue, currentValue)) return true;
      return currentValue - previousValue >= wechatTimestampGapMs;
    }

    function getLastRenderedWechatTimestamp(container) {
      if (!container) return NaN;
      const value = Number(container.dataset.lastMessageTimestamp);
      return Number.isFinite(value) && value > 0 ? value : NaN;
    }

    function addTimestamp(container, text) {
      const stamp = document.createElement('div');
      stamp.className = 'timestamp';
      const pill = document.createElement('span');
      pill.className = 'timestamp-pill';
      pill.textContent = text;
      stamp.appendChild(pill);
      container.appendChild(stamp);
    }

    function getWechatMessageStableKey(entry) {
      return String(entry && (entry.id != null ? entry.id : entry.messageId || ''));
    }

    function formatWechatQuoteClockTime(timestamp) {
      const value = Number(timestamp);
      if (!Number.isFinite(value) || value <= 0) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }

    function getWechatMessageActorName(message) {
      const normalized = normalizeWechatThreadEntry(message, { chatId: message && message.chatId });
      if (!normalized) return 'Unknown';
      if (getWechatMessageDirection(normalized) === 'received') {
        const { contact } = getCurrentWechatSelection();
        return getWechatContactLabel(contact);
      }
      return 'You';
    }

    function getWechatTranslationDisplayParts(value) {
      const content = normalizeWechatLocalizedContent(value);
      const sourceText = sanitizeWechatText(content.raw);
      const translatedText = sanitizeWechatText(content.zh);
      return {
        sourceText,
        translatedText,
        hasTranslation: !!sourceText && !!translatedText && sourceText !== translatedText
      };
    }

    function appendWechatLocalizedTextBlock(container, value, classes = {}) {
      if (!container) return;
      const translation = getWechatTranslationDisplayParts(value);
      const maxCharsPerLine = Math.max(0, Number(classes.maxCharsPerLine) || 0);
      const primaryText = translation.sourceText || translation.translatedText;
      if (!primaryText) return;
      const primary = document.createElement('div');
      primary.className = classes.primaryClass || 'mini-wechat-bubble-primary';
      primary.textContent = wrapWechatTextByColumns(primaryText, maxCharsPerLine);
      container.appendChild(primary);
      if (!translation.hasTranslation) return;
      const divider = document.createElement('div');
      divider.className = classes.dividerClass || 'mini-wechat-bubble-divider';
      container.appendChild(divider);
      const secondary = document.createElement('div');
      secondary.className = classes.secondaryClass || 'mini-wechat-bubble-secondary';
      secondary.textContent = wrapWechatTextByColumns(translation.translatedText, maxCharsPerLine);
      container.appendChild(secondary);
    }

    function getWechatEditorSupportedFormat(message) {
      const normalized = normalizeWechatThreadEntry(message, { chatId: message && message.chatId });
      if (!normalized) return '';
      if (normalized.type === 'text' || normalized.type === 'quote') {
        return getWechatTranslationDisplayParts((normalized.payload || {}).content).hasTranslation ? 'translation' : 'text';
      }
      if (normalized.type === 'image') return 'image';
      if (normalized.type === 'sticker'
        || normalized.type === 'voice'
        || normalized.type === 'photo'
        || normalized.type === 'location'
        || normalized.type === 'red_packet'
        || normalized.type === 'transfer') {
        return normalized.type;
      }
      return '';
    }

    function getWechatEditorPlaceholder(formatType) {
      if (formatType === 'translation') return '\u7b2c\u4e00\u884c\u5199\u539f\u6587\uff0c\u7b2c\u4e8c\u884c\u5199\u4e2d\u6587\u7ffb\u8bd1';
      if (formatType === 'location') return '\u7b2c\u4e00\u884c\u5199\u5730\u70b9\u540d\u79f0\uff0c\u7b2c\u4e8c\u884c\u5199\u5730\u5740';
      if (formatType === 'transfer' || formatType === 'red_packet') return '\u7b2c\u4e00\u884c\u53ef\u5199\u91d1\u989d\uff0c\u7b2c\u4e8c\u884c\u5199\u5907\u6ce8';
      return '\u76f4\u63a5\u4fee\u6539\u6c14\u6ce1\u5185\u5bb9';
    }

    function getWechatMessageEditableSeed(message, formatType = '') {
      const normalized = normalizeWechatThreadEntry(message, { chatId: message && message.chatId });
      if (!normalized) return '';
      const payload = normalized.payload || {};
      const resolvedFormat = sanitizeWechatText(formatType) || getWechatEditorSupportedFormat(normalized) || normalized.type;
      if (resolvedFormat === 'translation') {
        const translation = getWechatTranslationDisplayParts(payload.content);
        if (!translation.sourceText && !translation.translatedText) return '';
        if (!translation.sourceText) return translation.translatedText;
        return `${translation.sourceText}\n${translation.hasTranslation ? translation.translatedText : ''}`;
      }
      if (normalized.type === 'text' || normalized.type === 'quote') {
        const translation = getWechatTranslationDisplayParts(payload.content);
        return translation.sourceText || translation.translatedText;
      }
      if (normalized.type === 'sticker' || normalized.type === 'photo' || normalized.type === 'image') return getWechatLocalizedContentText(payload.description);
      if (normalized.type === 'voice') return getWechatLocalizedContentText(payload.transcript);
      if (normalized.type === 'location') {
        return [getWechatLocalizedContentText(payload.name), getWechatLocalizedContentText(payload.address)].filter(Boolean).join('\n');
      }
      if (normalized.type === 'transfer') {
        return [formatWechatMessageAmount(payload.amount, payload.currency), getWechatLocalizedContentText(payload.note)].filter(Boolean).join('\n');
      }
      if (normalized.type === 'red_packet') {
        return [formatWechatMessageAmount(payload.amount, payload.currency), getWechatLocalizedContentText(payload.greeting)].filter(Boolean).join('\n');
      }
      return getWechatMessagePreviewText(normalized);
    }

    function escapeWechatSelectorValue(value) {
      const raw = String(value == null ? '' : value);
      if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(raw);
      return raw.replace(/["\\]/g, '\\$&');
    }

    function findWechatMessageRow(message) {
      const normalized = normalizeWechatThreadEntry(message, { chatId: message && message.chatId });
      if (!normalized) return null;
      const candidates = [];
      const key = getWechatMessageStableKey(normalized);
      if (key) candidates.push(`.msg-row[data-message-key="${escapeWechatSelectorValue(key)}"]`);
      if (normalized.messageId) candidates.push(`.msg-row[data-message-id="${escapeWechatSelectorValue(normalized.messageId)}"]`);
      for (const selector of candidates) {
        const row = document.querySelector(`#chat-scroll ${selector}`);
        if (row) return row;
      }
      return null;
    }

    function flashWechatQuotedMessage(message) {
      const row = findWechatMessageRow(message);
      if (!row) return false;
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.classList.remove('is-quote-highlight');
      void row.offsetWidth;
      row.classList.add('is-quote-highlight');
      if (row.__miniQuoteFlashTimer) window.clearTimeout(row.__miniQuoteFlashTimer);
      row.__miniQuoteFlashTimer = window.setTimeout(() => {
        row.classList.remove('is-quote-highlight');
        row.__miniQuoteFlashTimer = 0;
      }, 2200);
      return true;
    }

    function buildWechatQuoteMeta(message) {
      const normalized = normalizeWechatThreadEntry(message, { chatId: message && message.chatId });
      if (!normalized) return null;
      const display = buildWechatMessageDisplayModel(normalized);
      return {
        actor: getWechatMessageActorName(normalized),
        time: formatWechatQuoteClockTime(normalized.timestamp),
        text: display.compactPreview || display.preview || display.primary || ''
      };
    }

    function openWechatQuoteTarget(message) {
      if (!flashWechatQuotedMessage(message) && typeof showMiniNotice === 'function') {
        showMiniNotice('Quoted message not found');
      }
    }

    function renderWechatRecallNotice(container, message) {
      const model = buildWechatMessageDisplayModel(message);
      const row = document.createElement('div');
      row.className = 'msg-row system';
      row.dataset.timestamp = String(Number(message.timestamp) || Date.now());
      row.dataset.messageKey = getWechatMessageStableKey(message);
      row.dataset.messageId = message.messageId || '';
      row.dataset.messageRecordId = message.id != null ? String(message.id) : '';
      row.__miniWechatMessage = message;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mini-wechat-recall-pill';
      button.dataset.messageText = model.preview || model.primary || '';
      button.dataset.messageType = 'system';
      button.dataset.messageDirection = 'system';
      button.dataset.messageKind = message.type;
      button.dataset.messageTimestamp = String(Number(message.timestamp) || Date.now());
      button.dataset.messageId = message.messageId || '';
      button.dataset.messageRecordId = message.id != null ? String(message.id) : '';
      button.__miniWechatMessage = message;
      button.innerHTML = [
        `<span class="mini-wechat-recall-text">${model.primary || model.preview || ''}</span>`,
        '<span class="mini-wechat-recall-view">鏌ョ湅</span>'
      ].join('');
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        void openWechatRecallViewer(message);
      });
      row.appendChild(button);
      if (typeof syncWechatMultiSelectRow === 'function') syncWechatMultiSelectRow(row, message);
      container.appendChild(row);
      container.dataset.lastMessageTimestamp = String(Number(message.timestamp) || Date.now());
    }

    function renderWechatSystemNotice(container, message) {
      const model = buildWechatMessageDisplayModel(message);
      const row = document.createElement('div');
      row.className = 'msg-row system';
      row.dataset.timestamp = String(Number(message.timestamp) || Date.now());
      row.dataset.messageKey = getWechatMessageStableKey(message);
      row.dataset.messageId = message.messageId || '';
      row.dataset.messageRecordId = message.id != null ? String(message.id) : '';
      row.__miniWechatMessage = message;
      const notice = document.createElement('div');
      notice.className = 'mini-wechat-thread-banner is-persistent';
      notice.textContent = model.preview || model.primary || '';
      row.appendChild(notice);
      if (typeof syncWechatMultiSelectRow === 'function') syncWechatMultiSelectRow(row, message);
      container.appendChild(row);
      container.dataset.lastMessageTimestamp = String(Number(message.timestamp) || Date.now());
    }

    function renderWechatVoiceBubbleContent(bubble, message) {
      const payload = message && message.payload ? message.payload : {};
      const transcript = getWechatLocalizedContentText(payload.transcript, '\u8bed\u97f3\u6d88\u606f');
      const durationSec = Math.max(1, Number(payload.durationSec) || estimateWechatVoiceDurationSec(transcript));
      const bubbleWidth = computeWechatVoiceBubbleWidthPx(transcript, {
        mode: 'expanded',
        maxCharsPerLine: 22
      });

      bubble.style.setProperty('--mini-voice-expanded-width', `${bubbleWidth}px`);
      bubble.setAttribute('role', 'button');
      bubble.setAttribute('tabindex', '0');
      bubble.setAttribute('aria-expanded', 'false');

      const shell = document.createElement('div');
      shell.className = 'mini-wechat-voice-shell';

      const head = document.createElement('div');
      head.className = 'mini-wechat-voice-head';

      const wave = document.createElement('div');
      wave.className = 'mini-wechat-voice-wave';
      [1, 2, 3, 4, 5].forEach((index) => {
        const bar = document.createElement('span');
        bar.className = `mini-wechat-voice-bar is-${index}`;
        wave.appendChild(bar);
      });

      const duration = document.createElement('span');
      duration.className = 'mini-wechat-voice-duration';
      duration.textContent = formatWechatVoiceDurationLabel(durationSec);

      head.appendChild(wave);
      head.appendChild(duration);

      const expand = document.createElement('div');
      expand.className = 'mini-wechat-voice-expand';

      const divider = document.createElement('div');
      divider.className = 'mini-wechat-voice-divider';
      expand.appendChild(divider);
      appendWechatLocalizedTextBlock(expand, payload.transcript || transcript, {
        primaryClass: 'mini-wechat-voice-transcript',
        dividerClass: 'mini-wechat-voice-divider',
        secondaryClass: 'mini-wechat-voice-transcript mini-wechat-voice-transcript-secondary',
        maxCharsPerLine: 22
      });

      const toggleExpanded = () => {
        const expanded = shell.classList.toggle('is-expanded');
        bubble.classList.toggle('is-voice-expanded', expanded);
        expand.classList.toggle('is-open', expanded);
        bubble.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      };

      bubble.addEventListener('click', (event) => {
        if (event.target && event.target.closest && event.target.closest('.mini-wechat-bubble-quote')) return;
        event.preventDefault();
        event.stopPropagation();
        toggleExpanded();
      });
      bubble.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopPropagation();
        toggleExpanded();
      });

      shell.appendChild(head);
      shell.appendChild(expand);
      bubble.appendChild(shell);
    }

    function getWechatImageSourceUrl(message) {
      const payload = message && message.payload ? message.payload : {};
      return sanitizeWechatText(payload.dataUrl || payload.imageUrl || payload.url);
    }

    function getWechatStickerSourceUrl(message) {
      const payload = message && message.payload ? message.payload : {};
      return sanitizeWechatText(payload.dataUrl || payload.imageUrl || payload.url);
    }

    function getWechatImageCardDimensions(message, maxEdge = 200) {
      const payload = message && message.payload ? message.payload : {};
      const width = Math.max(0, Number(payload.width) || 0);
      const height = Math.max(0, Number(payload.height) || 0);
      if (!width || !height) return { width: 160, height: 160 };
      const scale = Math.min(maxEdge / width, maxEdge / height, 1);
      return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale))
      };
    }

    function formatWechatImageBytes(bytes) {
      const value = Math.max(0, Number(bytes) || 0);
      if (!value) return '';
      if (value < 1024) return `${value} B`;
      if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
      return `${(value / (1024 * 1024)).toFixed(2)} MB`;
    }

    function getWechatImageViewerState() {
      if (!window.__miniWechatImageViewer) {
        window.__miniWechatImageViewer = {
          overlay: null,
          image: null,
          dismissBound: false
        };
      }
      return window.__miniWechatImageViewer;
    }

    function closeWechatImageViewer() {
      const state = getWechatImageViewerState();
      if (state.overlay) state.overlay.classList.remove('show');
    }

    function ensureWechatImageViewer() {
      const state = getWechatImageViewerState();
      if (state.overlay && state.overlay.isConnected) return state;

      const overlay = document.createElement('div');
      overlay.id = 'mini-wechat-image-viewer';
      overlay.className = 'modal-overlay mini-wechat-image-viewer';
      overlay.innerHTML = [
        '<div class="mini-wechat-image-viewer-shell" onclick="event.stopPropagation()">',
        '<img class="mini-wechat-image-viewer-image" alt="">',
        '</div>'
      ].join('');

      state.overlay = overlay;
      state.image = overlay.querySelector('.mini-wechat-image-viewer-image');

      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeWechatImageViewer();
      });

      if (!state.dismissBound) {
        state.dismissBound = true;
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') closeWechatImageViewer();
        });
      }

      document.body.appendChild(overlay);
      return state;
    }

    function openWechatImageViewer(message) {
      const src = getWechatImageSourceUrl(message);
      if (!src) {
        showMiniNotice('\u56fe\u7247\u8d44\u6e90\u4e0d\u5b58\u5728');
        return;
      }
      const state = ensureWechatImageViewer();
      const payload = message && message.payload ? message.payload : {};
      if (state.image) {
        state.image.src = src;
        state.image.alt = getWechatLocalizedContentText(payload.description, '\u56fe\u7247')
          || sanitizeWechatText(payload.fileName)
          || 'Image';
      }
      if (state.overlay) state.overlay.classList.add('show');
    }

    function renderWechatImageBubbleContent(bubble, message) {
      const payload = message && message.payload ? message.payload : {};
      const src = getWechatImageSourceUrl(message);
      const description = getWechatLocalizedContentText(payload.description, '\u56fe\u7247')
        || sanitizeWechatText(payload.fileName)
        || 'Image';
      if (!src) {
        appendWechatLocalizedTextBlock(bubble, payload.description || description);
        return;
      }

      const size = getWechatImageCardDimensions(message);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'mini-wechat-image-card';
      card.style.setProperty('--mini-image-width', `${size.width}px`);
      card.style.setProperty('--mini-image-height', `${size.height}px`);

      const image = document.createElement('img');
      image.className = 'mini-wechat-image-thumb';
      image.loading = 'lazy';
      image.decoding = 'async';
      image.alt = description;
      image.src = src;
      card.appendChild(image);

      card.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openWechatImageViewer(message);
      });
      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopPropagation();
        openWechatImageViewer(message);
      });

      bubble.appendChild(card);
    }

    function renderWechatStickerBubbleContent(bubble, message) {
      const payload = message && message.payload ? message.payload : {};
      const src = getWechatStickerSourceUrl(message);
      const description = getWechatLocalizedContentText(payload.description, '\u8868\u60c5') || '\u8868\u60c5';
      if (!src) {
        appendWechatLocalizedTextBlock(bubble, payload.description || description);
        return;
      }

      const card = document.createElement('div');
      card.className = 'mini-wechat-sticker-card';
      card.setAttribute('role', 'img');
      card.setAttribute('aria-label', description);

      const image = document.createElement('img');
      image.className = 'mini-wechat-sticker-thumb';
      image.loading = 'lazy';
      image.decoding = 'async';
      image.alt = description;
      image.src = src;
      card.appendChild(image);

      bubble.appendChild(card);
    }

    function renderWechatPhotoBubbleContent(bubble, message) {
      const payload = message && message.payload ? message.payload : {};
      const description = getWechatLocalizedContentText(payload.description, '\u7167\u7247');
      const card = document.createElement('div');
      card.className = 'mini-wechat-photo-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-expanded', 'false');
      card.setAttribute('aria-label', description || 'Photo card');

      const inner = document.createElement('div');
      inner.className = 'mini-wechat-photo-card-inner';

      const front = document.createElement('div');
      front.className = 'mini-wechat-photo-face is-front';

      const frontCopy = document.createElement('div');
      frontCopy.className = 'mini-wechat-photo-copy';

      const frontKicker = document.createElement('div');
      frontKicker.className = 'mini-wechat-photo-kicker';
      frontKicker.textContent = 'Photo';

      const frontTitle = document.createElement('div');
      frontTitle.className = 'mini-wechat-photo-front-title';
      const frontTitlePrimary = document.createElement('div');
      frontTitlePrimary.className = 'mini-wechat-photo-front-title-primary';
      frontTitlePrimary.textContent = 'Captured Frame';
      const frontTitleSecondary = document.createElement('div');
      frontTitleSecondary.className = 'mini-wechat-photo-front-title-secondary';
      frontTitleSecondary.textContent = 'Soft gradient study';
      frontTitle.appendChild(frontTitlePrimary);
      frontTitle.appendChild(frontTitleSecondary);

      frontCopy.appendChild(frontKicker);
      frontCopy.appendChild(frontTitle);

      const visualShell = document.createElement('div');
      visualShell.className = 'mini-wechat-photo-scene-shell';
      visualShell.setAttribute('aria-hidden', 'true');
      visualShell.innerHTML = [
        '<div class="mini-wechat-photo-stage">',
        '<span class="mini-wechat-photo-stage-sheet is-back"></span>',
        '<span class="mini-wechat-photo-stage-sheet is-middle"></span>',
        '<span class="mini-wechat-photo-stage-sheet is-front"></span>',
        '<span class="mini-wechat-photo-stage-wash is-sky"></span>',
        '<span class="mini-wechat-photo-stage-wash is-drift"></span>',
        '<span class="mini-wechat-photo-stage-line is-one"></span>',
        '<span class="mini-wechat-photo-stage-line is-two"></span>',
        '<span class="mini-wechat-photo-stage-line is-three"></span>',
        '<span class="mini-wechat-photo-stage-orb is-one"></span>',
        '<span class="mini-wechat-photo-stage-orb is-two"></span>',
        '<span class="mini-wechat-photo-stage-gloss"></span>',
        '<span class="mini-wechat-photo-stage-grain"></span>',
        '</div>'
      ].join('');

      front.appendChild(frontCopy);
      front.appendChild(visualShell);

      const back = document.createElement('div');
      back.className = 'mini-wechat-photo-face is-back';

      const backCopy = document.createElement('div');
      backCopy.className = 'mini-wechat-photo-copy';

      const backKicker = document.createElement('div');
      backKicker.className = 'mini-wechat-photo-kicker';
      backKicker.textContent = 'Description';
      backCopy.appendChild(backKicker);

      const scroll = document.createElement('div');
      scroll.className = 'mini-wechat-photo-copy-scroll';
      const scrollInner = document.createElement('div');
      scrollInner.className = 'mini-wechat-photo-copy-inner';
      const copyText = document.createElement('div');
      copyText.className = 'mini-wechat-photo-copy-text';
      appendWechatLocalizedTextBlock(copyText, payload.description || description, {
        primaryClass: 'mini-wechat-photo-copy-primary',
        dividerClass: 'mini-wechat-photo-copy-divider',
        secondaryClass: 'mini-wechat-photo-copy-secondary'
      });
      scrollInner.appendChild(copyText);
      scroll.appendChild(scrollInner);

      ['pointerdown', 'mousedown', 'touchstart'].forEach((eventName) => {
        scroll.addEventListener(eventName, (event) => {
          event.stopPropagation();
        });
      });

      back.appendChild(backCopy);
      back.appendChild(scroll);

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);

      const toggleRevealed = () => {
        const revealed = !card.classList.contains('is-revealed');
        card.classList.toggle('is-revealed', revealed);
        card.setAttribute('aria-expanded', revealed ? 'true' : 'false');
      };

      card.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleRevealed();
      });
      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        event.stopPropagation();
        toggleRevealed();
      });

      bubble.appendChild(card);
    }

    function renderWechatBubbleContent(bubble, message) {
      const model = buildWechatMessageDisplayModel(message);
      bubble.innerHTML = '';
      bubble.classList.toggle('is-quote-message', message.type === 'quote');
      bubble.classList.toggle('is-recall-message', message.type === 'recall');
      bubble.classList.toggle('is-favorite-message', !!message.favorite);
      bubble.classList.toggle('is-sticker-message', message.type === 'sticker' && !!getWechatStickerSourceUrl(message));
      bubble.classList.toggle('is-voice-message', message.type === 'voice');
      bubble.classList.toggle('is-photo-message', message.type === 'photo');
      bubble.classList.toggle('is-image-message', message.type === 'image' && !!getWechatImageSourceUrl(message));
      bubble.classList.toggle('is-location-message', message.type === 'location');
      if (model.quotePreview) {
        const quote = document.createElement('button');
        quote.type = 'button';
        quote.className = 'mini-wechat-bubble-quote';
        const meta = buildWechatQuoteMeta(message.payload && message.payload.quote);
        quote.innerHTML = [
          '<span class="mini-wechat-bubble-quote-bar"></span>',
          '<span class="mini-wechat-bubble-quote-copy">',
          '<span class="mini-wechat-bubble-quote-head">',
          `<span class="mini-wechat-bubble-quote-name">${escapeHtml(meta && meta.actor ? meta.actor : '\u539f\u6587')}</span>`,
          `<span class="mini-wechat-bubble-quote-time">${escapeHtml(meta && meta.time ? meta.time : '')}</span>`,
          '</span>',
          `<span class="mini-wechat-bubble-quote-text">${escapeHtml(meta && meta.text ? meta.text : model.quotePreview)}</span>`,
          '</span>'
        ].join('');
        quote.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          openWechatQuoteTarget(message.payload && message.payload.quote);
        });
        bubble.appendChild(quote);
      }
      if (message.type === 'voice') {
        renderWechatVoiceBubbleContent(bubble, message);
        return;
      }
      if (message.type === 'sticker' && getWechatStickerSourceUrl(message)) {
        renderWechatStickerBubbleContent(bubble, message);
        return;
      }
      if (message.type === 'photo') {
        renderWechatPhotoBubbleContent(bubble, message);
        return;
      }
      if (message.type === 'image' && getWechatImageSourceUrl(message)) {
        renderWechatImageBubbleContent(bubble, message);
        return;
      }
      if (message.type === 'location') {
        renderWechatLocationBubbleContent(bubble, message);
        return;
      }
      const primary = document.createElement('div');
      primary.className = 'mini-wechat-bubble-primary';
      primary.textContent = wrapWechatTextByColumns(model.primary || model.preview, 22);
      bubble.appendChild(primary);
      if (model.layout === 'translation' && model.secondary) {
        const divider = document.createElement('div');
        divider.className = 'mini-wechat-bubble-divider';
        bubble.appendChild(divider);
        const translated = document.createElement('div');
        translated.className = 'mini-wechat-bubble-primary';
        translated.textContent = wrapWechatTextByColumns(model.secondary, 22);
        bubble.appendChild(translated);
        return;
      }
      if (model.secondary) {
        const secondary = document.createElement('div');
        secondary.className = 'mini-wechat-bubble-secondary';
        secondary.textContent = wrapWechatTextByColumns(model.secondary, 22);
        bubble.appendChild(secondary);
      }
    }

    function appendChatBubble(container, entry, index, previousTimestamp) {
      const message = normalizeWechatThreadEntry(entry, { chatId: entry && entry.chatId });
      if (!message) return;
      const direction = getWechatMessageDirection(message);
      const currentTimestamp = Number(message.timestamp) || Date.now();
      if (shouldRenderWechatTimestamp(previousTimestamp, currentTimestamp)) {
        addTimestamp(container, formatWechatHumanTime(currentTimestamp));
      }
      if (message.type === 'recall') {
        renderWechatRecallNotice(container, message);
        return;
      }
      if (message.type === 'pat') {
        renderWechatSystemNotice(container, message);
        return;
      }
      const row = document.createElement('div');
      row.className = `msg-row ${direction}`;
      row.dataset.timestamp = String(currentTimestamp);
      row.dataset.messageKey = getWechatMessageStableKey(message);
      row.dataset.messageId = message.messageId || '';
      row.dataset.messageRecordId = message.id != null ? String(message.id) : '';
      const avatar = document.createElement('div');
      avatar.className = `msg-avatar chat-avatar-target ${direction === 'sent' ? 'user-trigger' : 'contact-trigger'}`;
      setAvatarSurface(avatar, index || 0, { role: direction === 'sent' ? 'user' : 'contact' });
      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      bubble.dataset.messageText = getWechatMessagePreviewText(message);
      bubble.dataset.messageType = direction;
      bubble.dataset.messageDirection = direction;
      bubble.dataset.messageKind = message.type;
      bubble.dataset.messageTimestamp = String(currentTimestamp);
      bubble.dataset.messageId = message.messageId || '';
      bubble.dataset.messageRecordId = message.id != null ? String(message.id) : '';
      bubble.__miniWechatMessage = message;
      row.__miniWechatMessage = message;
      renderWechatBubbleContent(bubble, message);
      row.appendChild(avatar);
      row.appendChild(bubble);
      if (typeof syncWechatMultiSelectRow === 'function') syncWechatMultiSelectRow(row, message);
      container.appendChild(row);
      container.dataset.lastMessageTimestamp = String(currentTimestamp);
    }

    function getWechatBubbleQuickActionState() {
      if (!window.__miniWechatBubbleQuickActionState) {
        window.__miniWechatBubbleQuickActionState = {
          timer: 0,
          startX: 0,
          startY: 0,
          pendingBubble: null,
          activeBubble: null,
          activeText: '',
          activeMessage: null,
          bar: null
        };
      }
      return window.__miniWechatBubbleQuickActionState;
    }

    function cancelWechatBubbleQuickActionHold() {
      const state = getWechatBubbleQuickActionState();
      if (state.timer) window.clearTimeout(state.timer);
      state.timer = 0;
      state.pendingBubble = null;
    }

    async function copyWechatBubbleText(text) {
      const value = String(text || '');
      if (!value) return false;
      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(value);
          return true;
        }
      } catch (error) {}
      if (!document.body || typeof document.execCommand !== 'function') return false;
      const field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', 'readonly');
      field.style.position = 'fixed';
      field.style.left = '-9999px';
      field.style.top = '0';
      field.style.opacity = '0';
      field.style.pointerEvents = 'none';
      document.body.appendChild(field);
      field.focus();
      field.select();
      field.setSelectionRange(0, field.value.length);
      let copied = false;
      try {
        copied = document.execCommand('copy');
      } catch (error) {
        copied = false;
      }
      field.remove();
      return copied;
    }

    function getWechatThreadActionContext() {
      const { contact, index } = getCurrentWechatSelection();
      return {
        contact,
        index,
        currentContactId: getWechatCurrentContactId(contact)
      };
    }

    function getWechatMultiSelectState() {
      if (!window.__miniWechatMultiSelectState) {
        window.__miniWechatMultiSelectState = {
          active: false,
          selectedKeys: new Set(),
          toolbar: null
        };
      }
      return window.__miniWechatMultiSelectState;
    }

    function getWechatMultiSelectableRows() {
      return Array.from(document.querySelectorAll('#chat-scroll .msg-row')).filter((row) => !!row.__miniWechatMessage);
    }

    function getWechatAllVisibleMessageKeys() {
      return getWechatMultiSelectableRows()
        .map((row) => getWechatMessageStableKey(row.__miniWechatMessage))
        .filter(Boolean);
    }

    function syncWechatComposerVisibility() {
      const state = getWechatMultiSelectState();
      const composer = window.__miniWechatComposer;
      if (composer && composer.bar) composer.bar.classList.toggle('is-hidden', state.active);
      const detailPage = document.getElementById('chat-detail-page');
      if (detailPage) detailPage.classList.toggle('is-multiselect-active', state.active);
      const extPanel = document.getElementById('ext-panel');
      if (state.active && extPanel) extPanel.style.display = 'none';
      if (state.active && typeof closeWechatStickerPicker === 'function') closeWechatStickerPicker();
    }

    function ensureWechatMultiSelectToolbar() {
      const state = getWechatMultiSelectState();
      if (state.toolbar && document.body && document.body.contains(state.toolbar)) return state.toolbar;
      if (!document.body) return null;
      const toolbar = document.createElement('div');
      toolbar.className = 'mini-wechat-multiselect-toolbar';
      toolbar.innerHTML = [
        '<button type="button" class="mini-wechat-multiselect-toggle" data-action="toggle-all">',
        '<span class="mini-wechat-multiselect-toggle-label">Select All</span>',
        '</button>',
        '<div class="mini-wechat-multiselect-copy">',
        '<span class="mini-wechat-multiselect-count"></span>',
        '</div>',
        '<div class="mini-wechat-multiselect-actions">',
        '<button type="button" class="mini-wechat-multiselect-icon-btn" data-action="favorite" aria-label="Favorite">',
        '<span class="mini-wechat-multiselect-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21l-1.68-.88C5.19 17.36 2 14.78 2 10.75 2 7.7 4.42 5.5 7.37 5.5c1.77 0 3.46.84 4.63 2.18C13.17 6.34 14.86 5.5 16.63 5.5 19.58 5.5 22 7.7 22 10.75c0 4.03-3.19 6.61-8.32 9.37L12 21z"/></svg></span>',
        '<span class="mini-wechat-multiselect-icon-label">Favorite</span>',
        '</button>',
        '<button type="button" class="mini-wechat-multiselect-icon-btn" data-action="forward" aria-label="Forward">',
        '<span class="mini-wechat-multiselect-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14 4l7 8-7 8"/><path d="M21 12H9"/><path d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/></svg></span>',
        '<span class="mini-wechat-multiselect-icon-label">Forward</span>',
        '</button>',
        '<button type="button" class="mini-wechat-multiselect-icon-btn is-danger" data-action="delete" aria-label="Delete">',
        '<span class="mini-wechat-multiselect-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/></svg></span>',
        '<span class="mini-wechat-multiselect-icon-label">Delete</span>',
        '</button>',
        '<button type="button" class="mini-wechat-multiselect-icon-btn" data-action="cancel" aria-label="Cancel">',
        '<span class="mini-wechat-multiselect-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg></span>',
        '<span class="mini-wechat-multiselect-icon-label">Cancel</span>',
        '</button>',
        '</div>'
      ].join('');
      toolbar.addEventListener('click', (event) => {
        const button = event.target.closest('[data-action]');
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        const action = button.dataset.action;
        if (action === 'toggle-all') toggleWechatMultiSelectAll();
        if (action === 'favorite') void favoriteSelectedWechatMessages();
        if (action === 'forward') void forwardSelectedWechatMessages();
        if (action === 'cancel') clearWechatMultiSelectMode();
        if (action === 'delete') void deleteSelectedWechatMessages();
      });
      document.body.appendChild(toolbar);
      state.toolbar = toolbar;
      return toolbar;
    }

    function syncWechatMultiSelectToolbar() {
      const state = getWechatMultiSelectState();
      const toolbar = ensureWechatMultiSelectToolbar();
      if (!toolbar) return;
      const countNode = toolbar.querySelector('.mini-wechat-multiselect-count');
      const toggleLabel = toolbar.querySelector('.mini-wechat-multiselect-toggle-label');
      const count = state.selectedKeys.size;
      const allKeys = getWechatAllVisibleMessageKeys();
      const isAllSelected = !!allKeys.length && allKeys.every((key) => state.selectedKeys.has(key));
      if (countNode) countNode.textContent = `Selected ${count}`;
      if (toggleLabel) toggleLabel.textContent = isAllSelected ? 'Clear All' : 'Select All';
      toolbar.querySelectorAll('.mini-wechat-multiselect-icon-btn[data-action]').forEach((button) => {
        if (button.dataset.action === 'cancel') return;
        button.disabled = count === 0;
      });
      toolbar.classList.toggle('is-visible', state.active);
      syncWechatComposerVisibility();
    }

    function syncWechatMultiSelectRow(row, message) {
      if (!row) return;
      const state = getWechatMultiSelectState();
      const key = getWechatMessageStableKey(message || row.__miniWechatMessage || (row.querySelector('.msg-bubble') && row.querySelector('.msg-bubble').__miniWechatMessage));
      row.classList.toggle('is-multi-select', state.active);
      row.classList.toggle('is-selected', !!(state.active && key && state.selectedKeys.has(key)));
    }

    function syncWechatMultiSelectRows() {
      document.querySelectorAll('#chat-scroll .msg-row').forEach((row) => {
        syncWechatMultiSelectRow(row, row.__miniWechatMessage || (row.querySelector('.msg-bubble') && row.querySelector('.msg-bubble').__miniWechatMessage));
      });
      syncWechatMultiSelectToolbar();
    }

    function clearWechatMultiSelectMode() {
      const state = getWechatMultiSelectState();
      state.active = false;
      state.selectedKeys.clear();
      syncWechatMultiSelectRows();
    }

    function enterWechatMultiSelectMode(message) {
      const state = getWechatMultiSelectState();
      state.active = true;
      state.selectedKeys.clear();
      const key = getWechatMessageStableKey(message);
      if (key) state.selectedKeys.add(key);
      hideWechatBubbleQuickActionBar();
      syncWechatMultiSelectRows();
    }

    function toggleWechatMultiSelectMessage(message) {
      const state = getWechatMultiSelectState();
      if (!state.active) return;
      const key = getWechatMessageStableKey(message);
      if (!key) return;
      if (state.selectedKeys.has(key)) state.selectedKeys.delete(key);
      else state.selectedKeys.add(key);
      syncWechatMultiSelectRows();
    }

    function toggleWechatMultiSelectAll() {
      const state = getWechatMultiSelectState();
      if (!state.active) return;
      const allKeys = getWechatAllVisibleMessageKeys();
      if (!allKeys.length) return;
      const shouldClear = allKeys.every((key) => state.selectedKeys.has(key));
      state.selectedKeys.clear();
      if (!shouldClear) allKeys.forEach((key) => state.selectedKeys.add(key));
      syncWechatMultiSelectRows();
    }

    async function favoriteSelectedWechatMessages() {
      const state = getWechatMultiSelectState();
      const { contact, index, currentContactId } = getWechatThreadActionContext();
      if (!contact || currentContactId == null || !state.selectedKeys.size) return;
      const thread = await loadMessages(currentContactId);
      const selected = thread.filter((message) => state.selectedKeys.has(getWechatMessageStableKey(message)));
      let updatedCount = 0;
      for (const message of selected) {
        if (!message || message.favorite || message.type === 'recall') continue;
        await updateMessage(currentContactId, message.id != null ? message.id : message.messageId, {
          ...message,
          favorite: true,
          favoriteAt: Date.now()
        });
        await saveWechatFavoriteMemory(currentContactId, { ...message, favorite: true });
        updatedCount += 1;
      }
      clearWechatMultiSelectMode();
      await refreshWechatThreadAfterMutation(contact, index, currentContactId);
      if (typeof showMiniNotice === 'function') {
        showMiniNotice(updatedCount ? `Favorited ${updatedCount} message(s)` : 'Selected messages were already favorited');
      }
    }

    function buildWechatForwardEntryFromMessage(message, targetChatId, timestamp) {
      const normalized = normalizeWechatThreadEntry(message, { chatId: message && message.chatId });
      if (!normalized) return null;
      const source = normalized.type === 'recall' && normalized.payload && normalized.payload.snapshot
        ? normalizeWechatThreadEntry(normalized.payload.snapshot, { chatId: targetChatId })
        : normalized;
      const cloned = cloneWechatMessageForPayload(source, { chatId: targetChatId });
      if (!cloned) {
        const preview = getWechatMessagePreviewText(normalized);
        return normalizeWechatThreadEntry({
          chatId: targetChatId,
          messageId: createWechatMessageId('text', timestamp),
          direction: 'sent',
          type: 'text',
          timestamp,
          payload: {
            content: normalizeWechatLocalizedContent(preview, preview)
          }
        }, { chatId: targetChatId });
      }
      return normalizeWechatThreadEntry({
        ...cloned,
        chatId: targetChatId,
        messageId: createWechatMessageId(cloned.type || 'text', timestamp),
        direction: 'sent',
        timestamp,
        favorite: false,
        favoriteAt: null
      }, { chatId: targetChatId });
    }

    async function forwardSelectedWechatMessages() {
      const state = getWechatMultiSelectState();
      const { contact, currentContactId } = getWechatThreadActionContext();
      if (!contact || currentContactId == null || !state.selectedKeys.size) return;
      const target = await requestWechatForwardTarget(currentContactId);
      if (!target) return;
      const targetChatId = getWechatCurrentContactId(target);
      if (targetChatId == null) return;
      const thread = await loadMessages(currentContactId);
      const selected = thread
        .filter((message) => state.selectedKeys.has(getWechatMessageStableKey(message)))
        .sort((left, right) => (Number(left && left.timestamp) || 0) - (Number(right && right.timestamp) || 0));
      if (!selected.length) return;
      const baseTimestamp = Date.now();
      for (let index = 0; index < selected.length; index += 1) {
        const entry = buildWechatForwardEntryFromMessage(selected[index], targetChatId, baseTimestamp + index);
        if (entry) await saveMessage(targetChatId, entry);
      }
      await revealWechatConversation(getWechatContactKey(target), { notice: false });
      const targetIndex = getCurrentWechatContacts().findIndex((item) => getWechatCurrentContactId(item) === targetChatId);
      if (targetIndex >= 0) await refreshWechatListPreview(targetIndex);
      clearWechatMultiSelectMode();
      if (typeof showMiniNotice === 'function') showMiniNotice(`Forwarded to ${getWechatContactLabel(target)}`);
    }

    async function deleteSelectedWechatMessages() {
      const state = getWechatMultiSelectState();
      const { contact, index, currentContactId } = getWechatThreadActionContext();
      if (!contact || currentContactId == null || !state.selectedKeys.size) return;
      const keys = Array.from(state.selectedKeys);
      await deleteMessages(currentContactId, keys);
      if (typeof clearWechatQuoteDraftIfMatches === 'function') clearWechatQuoteDraftIfMatches(keys);
      clearWechatMultiSelectMode();
      await renderWechatThread(currentContactId, contact, index);
      await refreshWechatListPreview(index);
      if (typeof showMiniNotice === 'function') showMiniNotice('\u5df2\u5220\u9664\u9009\u4e2d\u6d88\u606f');
    }

    function replaceWechatLocalizedContentText(target, nextText) {
      const source = target && typeof target === 'object' ? target : {};
      return normalizeWechatLocalizedContent({
        ...source,
        raw: nextText,
        zh: nextText || source.zh,
        sourceLang: source.sourceLang,
        targetLang: source.targetLang
      }, nextText);
    }

    function applyPlainTextEditToWechatMessage(message, rawText) {
      const text = sanitizeWechatText(rawText);
      if (!text) return null;
      const draft = normalizeWechatThreadEntry(message, { chatId: message && message.chatId });
      if (!draft) return null;
      const payload = draft.payload || {};
      if (draft.type === 'text') payload.content = replaceWechatLocalizedContentText(payload.content, text);
      else if (draft.type === 'quote') payload.content = replaceWechatLocalizedContentText(payload.content, text);
      else if (draft.type === 'sticker') payload.description = replaceWechatLocalizedContentText(payload.description, text);
      else if (draft.type === 'voice') payload.transcript = replaceWechatLocalizedContentText(payload.transcript, text);
      else if (draft.type === 'photo' || draft.type === 'image') payload.description = replaceWechatLocalizedContentText(payload.description, text);
      else if (draft.type === 'location') payload.name = replaceWechatLocalizedContentText(payload.name, text);
      else if (draft.type === 'transfer') payload.note = replaceWechatLocalizedContentText(payload.note, text);
      else if (draft.type === 'red_packet') payload.greeting = replaceWechatLocalizedContentText(payload.greeting, text);
      else if (draft.type === 'gift') payload.note = replaceWechatLocalizedContentText(payload.note, text);
      else if (draft.type === 'takeout') payload.note = replaceWechatLocalizedContentText(payload.note, text);
      else return null;
      return normalizeWechatThreadEntry({ ...draft, payload }, { chatId: draft.chatId });
    }

    function extractWechatEditorAmount(text, fallback = 88.88) {
      const matched = String(text || '').match(/-?\d+(?:\.\d+)?/);
      const value = matched ? Number(matched[0]) : NaN;
      return Number.isFinite(value) && value >= 0 ? value : fallback;
    }

    function parseWechatEditorSeedText(rawInput, message, formatType = '') {
      const raw = String(rawInput == null ? '' : rawInput).trim();
      if (!raw) return getWechatMessageEditableSeed(message, formatType);
      try {
        const parsed = JSON.parse(raw);
        const normalized = normalizeWechatThreadEntry({
          ...(message && typeof message === 'object' ? message : {}),
          ...(parsed && typeof parsed === 'object' ? parsed : {}),
          chatId: message && message.chatId
        }, { chatId: message && message.chatId });
        return getWechatMessageEditableSeed(normalized || message, formatType);
      } catch (error) {
        return raw;
      }
    }

    function buildWechatEditorFormatDraft(message, formatType, rawInput) {
      const normalized = normalizeWechatThreadEntry(message, { chatId: message && message.chatId });
      if (!normalized) return '';
      const seed = parseWechatEditorSeedText(rawInput, normalized);
      const lines = String(seed || '').split(/\n+/).map((item) => sanitizeWechatText(item)).filter(Boolean);
      const primary = lines[0] || '';
      const secondary = lines.slice(1).join(' / ');
      const base = {
        messageId: normalized.messageId,
        chatId: normalized.chatId,
        direction: normalized.direction,
        timestamp: normalized.timestamp
      };
      let draft = null;
      if (formatType === 'text') {
        draft = {
          ...base,
          type: 'text',
          payload: {
            content: normalizeWechatLocalizedContent(primary || 'Text content', primary || 'Text content')
          }
        };
      }
      if (formatType === 'sticker') {
        draft = {
          ...base,
          type: 'sticker',
          payload: {
            libraryId: 'default',
            packId: 'emoji',
            assetId: 'sticker_asset',
            description: normalizeWechatLocalizedContent(primary || 'Sticker description', primary || 'Sticker description')
          }
        };
      }
      if (formatType === 'voice') {
        draft = {
          ...base,
          type: 'voice',
          payload: {
            assetId: 'voice_asset',
            durationSec: Math.max(1, Math.round(extractWechatEditorAmount(seed, 3))),
            transcript: normalizeWechatLocalizedContent(primary || 'Voice transcript', primary || 'Voice transcript')
          }
        };
      }
      if (formatType === 'photo') {
        draft = {
          ...base,
          type: 'photo',
          payload: {
            assetId: 'photo_asset',
            origin: 'camera_generated',
            description: normalizeWechatLocalizedContent(primary || 'Photo description', primary || 'Photo description')
          }
        };
      }
      if (formatType === 'location') {
        draft = {
          ...base,
          type: 'location',
          payload: {
            name: normalizeWechatLocalizedContent(primary || 'New location', primary || 'New location'),
            address: normalizeWechatLocalizedContent(secondary || 'Location address', secondary || 'Location address'),
            distanceMeters: 0,
            lat: 0,
            lng: 0
          }
        };
      }
      if (formatType === 'red_packet') {
        draft = {
          ...base,
          type: 'red_packet',
          payload: {
            amount: extractWechatEditorAmount(seed, 88.88),
            currency: 'CNY',
            greeting: normalizeWechatLocalizedContent(primary || 'Best wishes', primary || 'Best wishes'),
            status: 'unopened'
          }
        };
      }
      if (formatType === 'transfer') {
        draft = {
          ...base,
          type: 'transfer',
          payload: {
            amount: extractWechatEditorAmount(seed, 88.88),
            currency: 'CNY',
            note: normalizeWechatLocalizedContent(primary || 'Transfer note', primary || 'Transfer note'),
            status: 'pending'
          }
        };
      }
      if (formatType === 'translation') {
        const sourceText = primary || 'Original text';
        const translatedText = secondary || (primary ? `Translation: ${primary}` : 'Translated text');
        draft = {
          ...base,
          type: 'text',
          payload: {
            content: normalizeWechatLocalizedContent({
              raw: sourceText,
              zh: translatedText,
              sourceLang: 'auto',
              targetLang: 'zh-CN'
            }, translatedText)
          }
        };
      }
      return draft ? JSON.stringify(draft, null, 2) : '';
    }

    function buildWechatEditorFormatMessage(message, formatType, rawInput) {
      const normalized = normalizeWechatThreadEntry(message, { chatId: message && message.chatId });
      if (!normalized) return null;
      const seed = parseWechatEditorSeedText(rawInput, normalized, formatType);
      const lines = String(seed == null ? '' : seed).replace(/\r/g, '').split('\n').map((item) => sanitizeWechatText(item));
      const nonEmptyLines = lines.filter(Boolean);
      const primary = nonEmptyLines[0] || '';
      const secondary = nonEmptyLines.slice(1).join('\n');
      const fullText = lines.join('\n').trim();
      const payload = normalized.payload || {};
      const base = {
        messageId: normalized.messageId,
        chatId: normalized.chatId,
        direction: normalized.direction,
        timestamp: normalized.timestamp
      };
      let draft = null;
      if (formatType === 'text') {
        draft = {
          ...base,
          type: 'text',
          payload: {
            content: normalizeWechatLocalizedContent(fullText || 'Text content', fullText || 'Text content')
          }
        };
      }
      if (formatType === 'sticker') {
        draft = {
          ...base,
          type: 'sticker',
          payload: {
            libraryId: 'default',
            packId: 'emoji',
            assetId: 'sticker_asset',
            description: normalizeWechatLocalizedContent(fullText || 'Sticker description', fullText || 'Sticker description')
          }
        };
      }
      if (formatType === 'voice') {
        draft = {
          ...base,
          type: 'voice',
          payload: {
            assetId: 'voice_asset',
            durationSec: Math.max(1, Math.round(extractWechatEditorAmount(seed, 3))),
            transcript: normalizeWechatLocalizedContent(fullText || 'Voice transcript', fullText || 'Voice transcript')
          }
        };
      }
      if (formatType === 'photo') {
        draft = {
          ...base,
          type: 'photo',
          payload: {
            assetId: 'photo_asset',
            origin: 'camera_generated',
            description: normalizeWechatLocalizedContent(fullText || 'Photo caption', fullText || 'Photo caption')
          }
        };
      }
      if (formatType === 'location') {
        draft = {
          ...base,
          type: 'location',
          payload: {
            name: normalizeWechatLocalizedContent(primary || getWechatLocalizedContentText(payload.name) || 'Location name', primary || getWechatLocalizedContentText(payload.name) || 'Location name'),
            address: normalizeWechatLocalizedContent(secondary || getWechatLocalizedContentText(payload.address) || 'Location address', secondary || getWechatLocalizedContentText(payload.address) || 'Location address'),
            distanceMeters: 0,
            lat: 0,
            lng: 0
          }
        };
      }
      if (formatType === 'red_packet') {
        draft = {
          ...base,
          type: 'red_packet',
          payload: {
            amount: extractWechatEditorAmount(seed, Number(payload.amount) || 88.88),
            currency: 'CNY',
            greeting: normalizeWechatLocalizedContent(secondary || primary || getWechatLocalizedContentText(payload.greeting) || 'Best wishes', secondary || primary || getWechatLocalizedContentText(payload.greeting) || 'Best wishes'),
            status: 'unopened'
          }
        };
      }
      if (formatType === 'transfer') {
        draft = {
          ...base,
          type: 'transfer',
          payload: {
            amount: extractWechatEditorAmount(seed, Number(payload.amount) || 88.88),
            currency: 'CNY',
            note: normalizeWechatLocalizedContent(secondary || primary || getWechatLocalizedContentText(payload.note) || 'Transfer note', secondary || primary || getWechatLocalizedContentText(payload.note) || 'Transfer note'),
            status: 'pending'
          }
        };
      }
      if (formatType === 'translation') {
        const translation = getWechatTranslationDisplayParts(payload.content);
        const sourceText = primary || translation.sourceText || 'Original text';
        const translatedText = secondary || (translation.hasTranslation ? translation.translatedText : '');
        const translatedContent = normalizeWechatLocalizedContent({
          raw: sourceText,
          zh: translatedText || sourceText,
          sourceLang: 'auto',
          targetLang: 'zh-CN'
        }, sourceText);
        draft = {
          ...base,
          type: normalized.type === 'quote' ? 'quote' : 'text',
          payload: normalized.type === 'quote'
            ? {
              quote: cloneWechatMessageForPayload(payload.quote, { chatId: normalized.chatId }),
              content: translatedContent
            }
            : {
              content: translatedContent
            }
        };
      }
      return draft ? normalizeWechatThreadEntry(draft, { chatId: normalized.chatId }) : null;
    }

    function buildWechatEditorFormatDraft(message, formatType, rawInput) {
      const draft = buildWechatEditorFormatMessage(message, formatType, rawInput);
      if (!draft) return '';
      return formatWechatMessageForEditor(draft);
    }

    function formatWechatMessageForEditor(message) {
      const normalized = normalizeWechatThreadEntry(message, { chatId: message && message.chatId });
      const payload = cloneWechatMessageForPayload(normalized, { chatId: normalized && normalized.chatId });
      return JSON.stringify(payload, null, 2);
    }

    function ensureWechatMessageEditorModal() {
      let overlay = document.getElementById('mini-wechat-message-editor');
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.id = 'mini-wechat-message-editor';
      overlay.className = 'modal-overlay';
      overlay.style.display = 'none';
      overlay.style.zIndex = '2147483601';
      overlay.innerHTML = [
        '<div class="modal-box mini-wechat-message-editor" onclick="event.stopPropagation()">',
        '<div class="modal-header">EDIT MESSAGE</div>',
        '<div class="modal-sub mini-wechat-editor-hint">Edit the JSON directly, or use the format buttons below to switch the message type.</div>',
        '<textarea class="flat-textarea mini-wechat-editor-textarea" spellcheck="false"></textarea>',
        '<div class="mini-wechat-editor-formatbar">',
        '<button type="button" class="mini-wechat-editor-format-btn" data-format="text">Text</button>',
        '<button type="button" class="mini-wechat-editor-format-btn" data-format="sticker">Sticker</button>',
        '<button type="button" class="mini-wechat-editor-format-btn" data-format="voice">Voice</button>',
        '<button type="button" class="mini-wechat-editor-format-btn" data-format="photo">Photo</button>',
        '<button type="button" class="mini-wechat-editor-format-btn" data-format="location">Location</button>',
        '<button type="button" class="mini-wechat-editor-format-btn" data-format="red_packet">Red Packet</button>',
        '<button type="button" class="mini-wechat-editor-format-btn" data-format="transfer">Transfer</button>',
        '<button type="button" class="mini-wechat-editor-format-btn" data-format="translation">Translation</button>',
        '</div>',
        '<div class="modal-actions">',
        '<button type="button" class="btn-cancel" data-action="cancel">CANCEL</button>',
        '<button type="button" class="btn-save" data-action="save">SAVE</button>',
        '</div>',
        '</div>'
      ].join('');
      document.body.appendChild(overlay);
      return overlay;
    }

    function requestWechatMessageEdit(message) {
      if (typeof hideWechatBubbleQuickActionBar === 'function') hideWechatBubbleQuickActionBar();
      const overlay = ensureWechatMessageEditorModal();
      const hint = overlay.querySelector('.mini-wechat-editor-hint');
      const textarea = overlay.querySelector('.mini-wechat-editor-textarea');
      const cancelButton = overlay.querySelector('[data-action="cancel"]');
      const saveButton = overlay.querySelector('[data-action="save"]');
      const formatButtons = Array.from(overlay.querySelectorAll('.mini-wechat-editor-format-btn'));
      const detectedFormat = getWechatEditorSupportedFormat(message);
      const initialFormat = detectedFormat === 'translation' ? detectedFormat : '';
      if (hint) hint.textContent = '\u53ef\u76f4\u63a5\u4fee\u6539\u5f53\u524d\u683c\u5f0f\u7684\u7eaf\u6587\u672c\uff0c\u4e5f\u53ef\u4ee5\u70b9\u4e0b\u65b9\u6309\u94ae\u751f\u6210\u643a\u5e26 type \u5b57\u6bb5\u7684 JSON \u8349\u7a3f\u3002';
      textarea.value = getWechatMessageEditableSeed(message, initialFormat);
      overlay.style.zIndex = '2147483601';
      overlay.style.display = 'flex';
      overlay.classList.add('show');
      return new Promise((resolve) => {
        function syncFormatState(formatType) {
          const nextFormat = sanitizeWechatText(formatType);
          overlay.dataset.formatType = nextFormat;
          textarea.placeholder = getWechatEditorPlaceholder(nextFormat);
          formatButtons.forEach((button) => {
            button.classList.toggle('is-active', button.dataset.format === nextFormat);
          });
        }
        function syncTextareaMode() {
          textarea.classList.toggle('is-json', /^\s*[\[{]/.test(textarea.value));
        }
        function cleanup(result) {
          overlay.classList.remove('show');
          overlay.style.display = 'none';
          cancelButton.removeEventListener('click', handleCancel);
          saveButton.removeEventListener('click', handleSave);
          overlay.removeEventListener('click', handleOverlay);
          textarea.removeEventListener('keydown', handleKeydown);
          textarea.removeEventListener('input', handleInput);
          formatButtons.forEach((button) => button.removeEventListener('click', handleFormat));
          resolve(result);
        }
        function handleCancel() { cleanup(null); }
        function handleSave() {
          cleanup({
            value: textarea.value,
            formatType: overlay.dataset.formatType || ''
          });
        }
        function handleInput() {
          syncTextareaMode();
        }
        function handleFormat(event) {
          const formatType = event.currentTarget && event.currentTarget.dataset && event.currentTarget.dataset.format;
          if (!formatType) return;
          const nextValue = buildWechatEditorFormatDraft(message, formatType, textarea.value);
          if (!nextValue) return;
          syncFormatState(formatType);
          textarea.value = nextValue;
          syncTextareaMode();
          textarea.focus();
          textarea.setSelectionRange(0, textarea.value.length);
        }
        function handleOverlay(event) {
          if (event.target === overlay) cleanup(null);
        }
        function handleKeydown(event) {
          if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            handleSave();
          }
          if (event.key === 'Escape') cleanup(null);
        }
        cancelButton.addEventListener('click', handleCancel);
        saveButton.addEventListener('click', handleSave);
        overlay.addEventListener('click', handleOverlay);
        textarea.addEventListener('keydown', handleKeydown);
        textarea.addEventListener('input', handleInput);
        formatButtons.forEach((button) => button.addEventListener('click', handleFormat));
        syncFormatState(initialFormat);
        syncTextareaMode();
        window.setTimeout(() => {
          textarea.focus();
          textarea.select();
        }, 0);
      });
    }

    function ensureWechatInfoModal() {
      let overlay = document.getElementById('mini-wechat-info-modal');
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.id = 'mini-wechat-info-modal';
      overlay.className = 'modal-overlay';
      overlay.style.display = 'none';
      overlay.innerHTML = [
        '<div class="modal-box mini-wechat-info-modal" onclick="event.stopPropagation()">',
        '<div class="modal-header">NOTICE</div>',
        '<div class="mini-wechat-info-copy"></div>',
        '<div class="modal-actions">',
        '<button type="button" class="btn-save" data-action="close">CLOSE</button>',
        '</div>',
        '</div>'
      ].join('');
      document.body.appendChild(overlay);
      return overlay;
    }

    function showWechatInfoModal(title, message, buttonText = 'CLOSE') {
      const overlay = ensureWechatInfoModal();
      const header = overlay.querySelector('.modal-header');
      const copy = overlay.querySelector('.mini-wechat-info-copy');
      const closeButton = overlay.querySelector('[data-action="close"]');
      header.textContent = sanitizeWechatText(title) || 'NOTICE';
      copy.textContent = sanitizeWechatText(message);
      closeButton.textContent = sanitizeWechatText(buttonText) || 'CLOSE';
      overlay.style.display = 'flex';
      overlay.classList.add('show');
      return new Promise((resolve) => {
        function cleanup() {
          overlay.classList.remove('show');
          overlay.style.display = 'none';
          closeButton.removeEventListener('click', handleClose);
          overlay.removeEventListener('click', handleOverlay);
          window.removeEventListener('keydown', handleKeydown);
          resolve();
        }
        function handleClose() { cleanup(); }
        function handleOverlay(event) {
          if (event.target === overlay) cleanup();
        }
        function handleKeydown(event) {
          if (event.key === 'Escape' || event.key === 'Enter') cleanup();
        }
        closeButton.addEventListener('click', handleClose);
        overlay.addEventListener('click', handleOverlay);
        window.addEventListener('keydown', handleKeydown);
      });
    }

    function ensureWechatRecallViewerModal() {
      let overlay = document.getElementById('mini-wechat-recall-viewer');
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.id = 'mini-wechat-recall-viewer';
      overlay.className = 'modal-overlay';
      overlay.style.display = 'none';
      overlay.innerHTML = [
        '<div class="modal-box mini-wechat-recall-viewer" onclick="event.stopPropagation()">',
        '<div class="modal-header">VIEW RECALL</div>',
        '<div class="mini-wechat-recall-meta"></div>',
        '<div class="mini-wechat-recall-preview"></div>',
        '<textarea class="flat-textarea mini-wechat-recall-textarea" readonly spellcheck="false"></textarea>',
        '<div class="modal-actions">',
        '<button type="button" class="btn-save" data-action="close">CLOSE</button>',
        '</div>',
        '</div>'
      ].join('');
      document.body.appendChild(overlay);
      return overlay;
    }

    function openWechatRecallViewer(message) {
      const normalized = normalizeWechatThreadEntry(message, { chatId: message && message.chatId });
      const snapshot = normalized && normalized.payload && normalized.payload.snapshot
        ? normalizeWechatThreadEntry(normalized.payload.snapshot, { chatId: normalized.chatId })
        : null;
      if (!normalized || !snapshot) {
        if (typeof showMiniNotice === 'function') showMiniNotice('This recalled message has no snapshot to inspect');
        return Promise.resolve();
      }
      const overlay = ensureWechatRecallViewerModal();
      const meta = overlay.querySelector('.mini-wechat-recall-meta');
      const preview = overlay.querySelector('.mini-wechat-recall-preview');
      const textarea = overlay.querySelector('.mini-wechat-recall-textarea');
      const closeButton = overlay.querySelector('[data-action="close"]');
      meta.textContent = `${getWechatMessageActorName(snapshot)} 路 ${formatWechatQuoteClockTime(snapshot.timestamp) || '--'}`;
      preview.textContent = getWechatMessagePreviewText(snapshot);
      textarea.value = JSON.stringify(cloneWechatMessageForPayload(snapshot, { chatId: snapshot.chatId }), null, 2);
      overlay.style.display = 'flex';
      overlay.classList.add('show');
      return new Promise((resolve) => {
        function cleanup() {
          overlay.classList.remove('show');
          overlay.style.display = 'none';
          closeButton.removeEventListener('click', handleClose);
          overlay.removeEventListener('click', handleOverlay);
          window.removeEventListener('keydown', handleKeydown);
          resolve();
        }
        function handleClose() { cleanup(); }
        function handleOverlay(event) {
          if (event.target === overlay) cleanup();
        }
        function handleKeydown(event) {
          if (event.key === 'Escape' || event.key === 'Enter') cleanup();
        }
        closeButton.addEventListener('click', handleClose);
        overlay.addEventListener('click', handleOverlay);
        window.addEventListener('keydown', handleKeydown);
      });
    }

    function ensureWechatForwardTargetModal() {
      let overlay = document.getElementById('mini-wechat-forward-target');
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.id = 'mini-wechat-forward-target';
      overlay.className = 'modal-overlay';
      overlay.style.display = 'none';
      overlay.innerHTML = [
        '<div class="modal-box mini-wechat-forward-modal" onclick="event.stopPropagation()">',
        '<div class="modal-header">FORWARD TO</div>',
        '<div class="mini-wechat-forward-list"></div>',
        '<div class="modal-actions">',
        '<button type="button" class="btn-cancel" data-action="cancel">CANCEL</button>',
        '</div>',
        '</div>'
      ].join('');
      document.body.appendChild(overlay);
      return overlay;
    }

    function requestWechatForwardTarget(currentContactId) {
      const contacts = getWechatAllContacts().filter((contact) => {
        const contactId = getWechatCurrentContactId(contact);
        return contactId != null && String(contactId) !== String(currentContactId);
      });
      if (!contacts.length) {
        if (typeof showMiniNotice === 'function') showMiniNotice('No other contacts to forward to');
        return Promise.resolve(null);
      }
      const overlay = ensureWechatForwardTargetModal();
      const list = overlay.querySelector('.mini-wechat-forward-list');
      const cancelButton = overlay.querySelector('[data-action="cancel"]');
      overlay.style.display = 'flex';
      overlay.classList.add('show');
      return new Promise((resolve) => {
        list.innerHTML = '';
        function cleanup(result = null) {
          overlay.classList.remove('show');
          overlay.style.display = 'none';
          cancelButton.removeEventListener('click', handleCancel);
          overlay.removeEventListener('click', handleOverlay);
          window.removeEventListener('keydown', handleKeydown);
          resolve(result);
        }
        function handleCancel() { cleanup(null); }
        function handleOverlay(event) {
          if (event.target === overlay) cleanup(null);
        }
        function handleKeydown(event) {
          if (event.key === 'Escape') cleanup(null);
        }
        contacts.forEach((contact) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'mini-wechat-forward-contact';
          button.innerHTML = [
            '<span class="mini-wechat-forward-avatar"></span>',
            '<span class="mini-wechat-forward-copy">',
            `<span class="mini-wechat-forward-name">${escapeHtml(getWechatContactLabel(contact))}</span>`,
            `<span class="mini-wechat-forward-meta">${escapeHtml(getWechatContactTypeLabel(contact && contact.relationshipType))}</span>`,
            '</span>'
          ].join('');
          const avatar = button.querySelector('.mini-wechat-forward-avatar');
          const contactIndex = getWechatAllContacts().findIndex((item) => getWechatCurrentContactId(item) === getWechatCurrentContactId(contact));
          if (avatar) setAvatarSurface(avatar, Math.max(0, contactIndex), { role: 'contact', contact });
          button.addEventListener('click', () => cleanup(contact));
          list.appendChild(button);
        });
        cancelButton.addEventListener('click', handleCancel);
        overlay.addEventListener('click', handleOverlay);
        window.addEventListener('keydown', handleKeydown);
      });
    }

    async function deleteWechatMemoriesBySourceMessageId(currentContactId, sourceMessageId) {
      if (currentContactId == null || !sourceMessageId) return 0;
      const contactsOps = await getWechatRoleDataOps();
      const rows = await loadMemories(currentContactId);
      const targets = rows.filter((row) => row && row.sourceMessageId === sourceMessageId);
      await Promise.all(targets.map((row) => contactsOps.memories.remove(row.id)));
      return targets.length;
    }

    async function saveWechatFavoriteMemory(currentContactId, message) {
      if (currentContactId == null || !message || !message.messageId) return null;
      const existing = await loadMemories(currentContactId);
      const matched = existing.find((row) => row && row.sourceMessageId === message.messageId && row.kind === 'favorite_message');
      if (matched) return matched;
      const preview = getWechatMessagePreviewText(message);
      return saveMemory(currentContactId, {
        kind: 'favorite_message',
        title: normalizeWechatShortText(preview, '\u6536\u85cf\u6d88\u606f', 18),
        content: preview,
        summary: preview,
        source: getWechatMessageDirection(message) === 'received' ? 'assistant' : 'user',
        importance: 0.8,
        sourceMessageId: message.messageId,
        messageType: message.type
      });
    }

    function buildWechatRecallEntryFromMessage(message, operator, timestamp = Date.now()) {
      return normalizeWechatThreadEntry({
        chatId: message.chatId,
        messageId: createWechatMessageId('recall', timestamp),
        direction: 'sent',
        type: 'recall',
        timestamp,
        payload: {
          operator,
          targetMessageId: message.messageId,
          targetMessageType: message.type,
          targetMessageTimestamp: message.timestamp,
          recalledAt: timestamp,
          snapshot: cloneWechatMessageForPayload(message, { chatId: message.chatId })
        }
      }, { chatId: message.chatId });
    }

    function collectWechatReplyRoundKeys(thread, pivotIndex) {
      if (!Array.isArray(thread) || pivotIndex < 0 || pivotIndex >= thread.length) return [];
      const pivot = thread[pivotIndex];
      if (!pivot || getWechatMessageDirection(pivot) !== 'received') return [];
      let start = pivotIndex;
      while (start > 0 && getWechatMessageDirection(thread[start - 1]) === 'received') start -= 1;
      let end = pivotIndex;
      while (end + 1 < thread.length && getWechatMessageDirection(thread[end + 1]) === 'received') end += 1;
      return thread.slice(start, end + 1).map((entry) => getWechatMessageStableKey(entry)).filter(Boolean);
    }

    async function refreshWechatThreadAfterMutation(contact, index, currentContactId) {
      if (!contact || currentContactId == null) return;
      await renderWechatThread(currentContactId, contact, index);
      await refreshWechatListPreview(index);
    }

    async function editWechatActiveMessage(message) {
      const { contact, index, currentContactId } = getWechatThreadActionContext();
      if (!message || !contact || currentContactId == null) return;
      hideWechatBubbleQuickActionBar();
      const editorResult = await requestWechatMessageEdit(message);
      if (editorResult == null) return;
      const raw = editorResult && typeof editorResult === 'object' ? editorResult.value : editorResult;
      const formatType = sanitizeWechatText(editorResult && typeof editorResult === 'object' ? editorResult.formatType : '');
      const rawText = String(raw == null ? '' : raw);
      let next = null;
      if (formatType) {
        if (/^\s*[\[{]/.test(rawText)) {
          try {
            const parsed = JSON.parse(rawText);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid_json');
            if (!sanitizeWechatText(parsed.type)) throw new Error('missing_type');
            next = normalizeWechatThreadEntry({
              ...message,
              ...(parsed && typeof parsed === 'object' ? parsed : {}),
              chatId: currentContactId,
              messageId: sanitizeWechatText(parsed && parsed.messageId) || message.messageId
            }, { chatId: currentContactId });
          } catch (error) {
            if (typeof showMiniNotice === 'function') showMiniNotice('\u683c\u5f0f\u4fee\u6539\u5fc5\u987b\u4fdd\u5b58\u4e3a\u643a\u5e26 type \u5b57\u6bb5\u7684 JSON');
            return;
          }
        } else {
          if (!sanitizeWechatText(rawText)) {
            if (typeof showMiniNotice === 'function') showMiniNotice('\u683c\u5f0f\u5185\u5bb9\u4e0d\u80fd\u4e3a\u7a7a');
            return;
          }
          next = buildWechatEditorFormatMessage(message, formatType, rawText);
        }
      } else if (/^\s*[\[{]/.test(rawText)) {
        try {
          const parsed = JSON.parse(rawText);
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid_json');
          if (!sanitizeWechatText(parsed.type)) throw new Error('missing_type');
          next = normalizeWechatThreadEntry({
            ...message,
            ...(parsed && typeof parsed === 'object' ? parsed : {}),
            chatId: currentContactId,
            messageId: sanitizeWechatText(parsed && parsed.messageId) || message.messageId
          }, { chatId: currentContactId });
        } catch (error) {
          if (typeof showMiniNotice === 'function') showMiniNotice('JSON \u7f16\u8f91\u9700\u643a\u5e26 type \u5b57\u6bb5');
          return;
        }
      }
      if (!next) next = applyPlainTextEditToWechatMessage(message, rawText);
      if (!next) {
        if (typeof showMiniNotice === 'function') showMiniNotice('\u683c\u5f0f\u4e0d\u53ef\u7528\uff0c\u8bf7\u68c0\u67e5 JSON \u6216\u6539\u7528\u53ef\u7f16\u8f91\u6587\u672c\u7c7b\u578b');
        return;
      }
      next.favorite = !!message.favorite;
      next.favoriteAt = message.favoriteAt || null;
      await updateMessage(currentContactId, message.id != null ? message.id : message.messageId, next);
      hideWechatBubbleQuickActionBar();
      await refreshWechatThreadAfterMutation(contact, index, currentContactId);
      if (typeof showMiniNotice === 'function') showMiniNotice('\u6d88\u606f\u5df2\u66f4\u65b0');
    }

    async function favoriteWechatActiveMessage(message) {
      const { contact, index, currentContactId } = getWechatThreadActionContext();
      if (!message || !contact || currentContactId == null) return;
      if (message.favorite) {
        if (typeof showMiniNotice === 'function') showMiniNotice('\u8fd9\u6761\u6d88\u606f\u5df2\u7ecf\u6536\u85cf');
        return;
      }
      await updateMessage(currentContactId, message.id != null ? message.id : message.messageId, {
        ...message,
        favorite: true,
        favoriteAt: Date.now()
      });
      await saveWechatFavoriteMemory(currentContactId, { ...message, favorite: true });
      hideWechatBubbleQuickActionBar();
      await refreshWechatThreadAfterMutation(contact, index, currentContactId);
      if (typeof showMiniNotice === 'function') showMiniNotice('\u5df2\u6536\u85cf\u5230\u8bb0\u5fc6');
    }

    async function recallWechatActiveMessage(message) {
      const { contact, index, currentContactId } = getWechatThreadActionContext();
      if (!message || !contact || currentContactId == null) return;
      if (message.type === 'recall') {
        if (typeof showMiniNotice === 'function') showMiniNotice('\u64a4\u56de\u8bb0\u5f55\u4e0d\u80fd\u518d\u6b21\u64a4\u56de');
        return;
      }
      const direction = getWechatMessageDirection(message);
      if (direction !== 'sent') return deleteWechatActiveMessage(message);
      const operator = 'self';
      const recallEntry = buildWechatRecallEntryFromMessage(message, operator, Date.now());
      await deleteMessage(currentContactId, message.id != null ? message.id : message.messageId);
      await saveMessage(currentContactId, recallEntry);
      hideWechatBubbleQuickActionBar();
      await refreshWechatThreadAfterMutation(contact, index, currentContactId);
      if (typeof showMiniNotice === 'function') showMiniNotice('\u5df2\u64a4\u56de\u8fd9\u6761\u6d88\u606f');
    }

    async function rewindWechatActiveMessage(message) {
      const { contact, index, currentContactId } = getWechatThreadActionContext();
      if (!message || !contact || currentContactId == null) return;
      if (getWechatMessageDirection(message) !== 'received') {
        hideWechatBubbleQuickActionBar();
        await showWechatInfoModal('REWIND', 'Only received messages can be rewound');
        return;
      }
      const thread = await loadMessages(currentContactId);
      const currentKey = getWechatMessageStableKey(message);
      const pivotIndex = thread.findIndex((item) => getWechatMessageStableKey(item) === currentKey);
      if (pivotIndex < 0) return;
      const targets = collectWechatReplyRoundKeys(thread, pivotIndex);
      if (!targets.length) {
        if (typeof showMiniNotice === 'function') showMiniNotice('\u5f53\u524d\u5df2\u662f\u6700\u540e\u4e00\u6761\u6d88\u606f');
        return;
      }
      await deleteMessages(currentContactId, targets);
      if (typeof clearWechatQuoteDraftIfMatches === 'function') clearWechatQuoteDraftIfMatches(targets);
      hideWechatBubbleQuickActionBar();
      await refreshWechatThreadAfterMutation(contact, index, currentContactId);
      if (typeof showMiniNotice === 'function') showMiniNotice('\u5df2\u91cd\u56de\uff0c\u6b63\u5728\u91cd\u65b0\u751f\u6210');
      await runWechatCharacterReply(contact, index);
    }

    async function deleteWechatActiveMessage(message) {
      const { contact, index, currentContactId } = getWechatThreadActionContext();
      if (!message || !contact || currentContactId == null) return;
      await deleteMessage(currentContactId, message.id != null ? message.id : message.messageId);
      if (typeof clearWechatQuoteDraftIfMatches === 'function') clearWechatQuoteDraftIfMatches([getWechatMessageStableKey(message)]);
      hideWechatBubbleQuickActionBar();
      await refreshWechatThreadAfterMutation(contact, index, currentContactId);
      if (typeof showMiniNotice === 'function') showMiniNotice('\u6d88\u606f\u5df2\u5220\u9664');
    }

    function syncWechatBubbleQuickActionBarState() {
      const state = getWechatBubbleQuickActionState();
      const bar = state.bar;
      if (!bar) return;
      const favoriteLabel = bar.querySelector('[data-action="favorite"] .mini-wechat-quick-label');
      if (favoriteLabel) favoriteLabel.textContent = state.activeMessage && state.activeMessage.favorite ? '\u5df2\u6536\u85cf' : '\u6536\u85cf';
      const recallLabel = bar.querySelector('[data-action="recall"] .mini-wechat-quick-label');
      if (recallLabel) {
        recallLabel.textContent = state.activeMessage && getWechatMessageDirection(state.activeMessage) === 'received'
          ? '\u5220\u6b64\u6761'
          : '\u64a4\u56de';
      }
    }

    async function handleWechatBubbleQuickAction(action) {
      const state = getWechatBubbleQuickActionState();
      const message = state.activeMessage;
      if (!message) return;
      if (action === 'copy') {
        const copied = await copyWechatBubbleText(state.activeText);
        hideWechatBubbleQuickActionBar();
        if (typeof showMiniNotice === 'function') showMiniNotice(copied ? '\u5df2\u590d\u5236\u6d88\u606f' : '\u590d\u5236\u5931\u8d25');
        return;
      }
      if (action === 'edit') return editWechatActiveMessage(message);
      if (action === 'favorite') return favoriteWechatActiveMessage(message);
      if (action === 'quote') {
        hideWechatBubbleQuickActionBar();
        if (typeof setWechatQuoteDraft === 'function') setWechatQuoteDraft(message);
        return;
      }
      if (action === 'select') {
        enterWechatMultiSelectMode(message);
        return;
      }
      if (action === 'recall') return recallWechatActiveMessage(message);
      if (action === 'rewind') return rewindWechatActiveMessage(message);
      if (action === 'delete') return deleteWechatActiveMessage(message);
    }

    function ensureWechatBubbleQuickActionBar() {
      const state = getWechatBubbleQuickActionState();
      if (state.bar && document.body && document.body.contains(state.bar)) return state.bar;
      if (!document.body) return null;
      const bar = document.createElement('div');
      bar.className = 'mini-wechat-quickbar';
      bar.setAttribute('role', 'toolbar');
      bar.setAttribute('aria-label', '\u804a\u5929\u5feb\u6377\u529f\u80fd');
      const actions = [
        ['copy', '\u590d\u5236'],
        ['edit', '\u7f16\u8f91'],
        ['favorite', '\u6536\u85cf'],
        ['quote', '\u5f15\u7528'],
        ['select', '\u591a\u9009'],
        ['recall', '\u64a4\u56de'],
        ['rewind', '\u91cd\u56de'],
        ['delete', '\u5220\u9664']
      ];
      bar.innerHTML = actions.map(([action, label]) => (
        `<button type="button" class="mini-wechat-quick-action" data-action="${action}" aria-label="${label}"><span class="mini-wechat-quick-label">${label}</span></button>`
      )).join('');
      bar.addEventListener('pointerdown', (event) => event.stopPropagation());
      bar.addEventListener('click', async (event) => {
        const button = event.target.closest('.mini-wechat-quick-action');
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        const action = button.dataset.action;
        if (!action) return;
        await handleWechatBubbleQuickAction(action);
      });
      document.body.appendChild(bar);
      state.bar = bar;
      return bar;
    }

    function positionWechatBubbleQuickActionBar(bubble) {
      const bar = ensureWechatBubbleQuickActionBar();
      if (!bar || !bubble) return;
      const bubbleRect = bubble.getBoundingClientRect();
      const side = bubble.dataset && bubble.dataset.messageType === 'sent' ? 'sent' : 'received';
      bar.dataset.side = side;
      const barRect = bar.getBoundingClientRect();
      const viewportPadding = 12;
      const top = Math.max(viewportPadding, bubbleRect.top - barRect.height - 10);
      const preferredLeft = side === 'sent'
        ? bubbleRect.right - barRect.width
        : bubbleRect.left;
      const left = Math.min(
        Math.max(viewportPadding, preferredLeft),
        window.innerWidth - viewportPadding - barRect.width
      );
      bar.style.top = `${Math.round(top)}px`;
      bar.style.left = `${Math.round(left)}px`;
    }

    function hideWechatBubbleQuickActionBar() {
      const state = getWechatBubbleQuickActionState();
      cancelWechatBubbleQuickActionHold();
      if (state.activeBubble && state.activeBubble.classList) {
        state.activeBubble.classList.remove('is-quickbar-active');
      }
      state.activeBubble = null;
      state.activeText = '';
      state.activeMessage = null;
      if (state.bar) state.bar.classList.remove('is-visible');
    }

    function showWechatBubbleQuickActionBar(bubble) {
      if (!bubble) return;
      if (getWechatMultiSelectState().active) return;
      const message = bubble.__miniWechatMessage || bubble.parentElement && bubble.parentElement.__miniWechatMessage;
      if (!message) return;
      if (message.type === 'recall') return;
      const text = String((bubble.dataset && bubble.dataset.messageText) || bubble.textContent || '').trim();
      if (!text) return;
      const state = getWechatBubbleQuickActionState();
      const bar = ensureWechatBubbleQuickActionBar();
      if (!bar) return;
      bar.dataset.side = bubble.dataset && bubble.dataset.messageType === 'sent' ? 'sent' : 'received';
      if (state.activeBubble && state.activeBubble !== bubble && state.activeBubble.classList) {
        state.activeBubble.classList.remove('is-quickbar-active');
      }
      state.activeBubble = bubble;
      state.activeText = text;
      state.activeMessage = message;
      bubble.classList.add('is-quickbar-active');
      syncWechatBubbleQuickActionBarState();
      bar.classList.add('is-visible');
      positionWechatBubbleQuickActionBar(bubble);
    }

    function installWechatBubbleQuickActions() {
      if (routeName !== 'wechat' || window.__miniWechatBubbleQuickActionsInstalled) return;
      window.__miniWechatBubbleQuickActionsInstalled = true;
      const state = getWechatBubbleQuickActionState();
      cancelWechatBubbleQuickActionHold();
      hideWechatBubbleQuickActionBar();
      document.querySelectorAll('.msg-bubble.is-quickbar-active').forEach((bubble) => {
        bubble.classList.remove('is-quickbar-active');
      });
      if (state.bar && state.bar.remove) state.bar.remove();
      state.bar = null;
    }

    function getWechatContactLabel(contact) {
      if (!contact) return '\u672a\u9009\u62e9\u8054\u7cfb\u4eba';
      const remark = getWechatContactRemark(contact);
      return remark || contact.nickname || contact.name || contact.account || '\u672a\u547d\u540d\u8054\u7cfb\u4eba';
    }

    function getWechatContactTypeLabel(type) {
      const value = String(type || '').trim().toUpperCase();
      if (value === 'CHAR') return '\u89d2\u8272';
      if (value === 'NPC') return '\u670d\u52a1';
      if (value === 'ME') return '\u6211';
      return String(type || '').trim() || '\u672a\u8bbe\u7f6e';
    }

    const wechatLegacyThreadStorageKey = 'mini.wechat.threads.v2';
    const wechatSilentReplyToken = '[[SILENT_NUDGE]]';
    const wechatTimestampGapMs = 5 * 60 * 1000;
    const wechatBubbleQuickActionHoldDelay = 360;
    const wechatBubbleQuickActionMoveTolerance = 10;
    const wechatMessageTypes = new Set([
      'text',
      'quote',
      'recall',
      'pat',
      'sticker',
      'voice',
      'photo',
      'image',
      'location',
      'transfer',
      'red_packet',
      'gift',
      'takeout',
      'call',
      'video'
    ]);
    const wechatStrictJsonMessageTypes = new Set([
      'sticker',
      'voice',
      'photo',
      'image',
      'location'
    ]);
    const wechatRoleReplySpecialTypes = Object.freeze(['sticker', 'voice', 'photo', 'location']);
    const wechatRoleReplySpecialProbability = 0.2;
    const wechatRoleReplyMaxMessages = 6;
    const wechatRolePromptStickerLimit = 40;
    const wechatThreadListConfigId = 'mini.wechat.threadListState';
    const wechatThreadLongPressMs = 420;
    const wechatContactSettingsConfigPrefix = 'mini.wechat.contactSettings.';
    const wechatTokenStatsConfigId = 'mini.wechat.tokenStats';
    const wechatWeatherSenseProbability = 0.08;
    const wechatWeatherCacheTtlMs = 30 * 60 * 1000;
    const wechatAutoSummaryMinimumThreshold = 50;
    const wechatAutoPatProbability = 0.12;

    function getWechatContactKey(contact, index) {
      if (contact && contact.id != null) return `contact:${contact.id}`;
      if (contact && contact.account) return `account:${contact.account}`;
      return `contact:${index}`;
    }

    function getWechatCurrentContactId(contact) {
      return contact && contact.id != null ? contact.id : null;
    }

    function sanitizeWechatText(value) {
      return String(value == null ? '' : value).replace(/\r/g, '').trim();
    }

    function clampWechatNumber(value, min, max, fallback) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return fallback;
      return Math.min(max, Math.max(min, numeric));
    }

    function normalizeWechatBoolean(value, fallback = false) {
      if (value == null) return !!fallback;
      if (typeof value === 'string') {
        const lower = value.trim().toLowerCase();
        if (!lower) return !!fallback;
        if (['1', 'true', 'yes', 'on'].includes(lower)) return true;
        if (['0', 'false', 'no', 'off'].includes(lower)) return false;
      }
      return !!value;
    }

    function getWechatContactSettingsConfigId(contactId) {
      return `${wechatContactSettingsConfigPrefix}${sanitizeWechatText(contactId)}`;
    }

    function normalizeWechatContactSettings(value) {
      const source = value && typeof value === 'object' ? value : {};
      const minReply = Math.round(clampWechatNumber(source.replyCountMin, 1, wechatRoleReplyMaxMessages, 1));
      const maxReply = Math.round(clampWechatNumber(
        source.replyCountMax,
        minReply,
        wechatRoleReplyMaxMessages,
        Math.max(minReply, 3)
      ));
      const autoSummaryThreshold = Math.round(clampWechatNumber(
        source.autoSummaryThreshold,
        wechatAutoSummaryMinimumThreshold,
        500,
        wechatAutoSummaryMinimumThreshold
      ));
      return {
        remark: sanitizeWechatText(source.remark),
        wallpaper: sanitizeWechatText(source.wallpaper),
        timezone: sanitizeWechatText(source.timezone),
        weatherEnabled: normalizeWechatBoolean(source.weatherEnabled, false),
        userCity: sanitizeWechatText(source.userCity),
        contactCity: sanitizeWechatText(source.contactCity),
        replyCountMin: minReply,
        replyCountMax: maxReply,
        autoReply: normalizeWechatBoolean(source.autoReply, false),
        timeAwareness: normalizeWechatBoolean(source.timeAwareness, false),
        patEnabled: normalizeWechatBoolean(source.patEnabled, false),
        patUserSuffix: sanitizeWechatText(source.patUserSuffix),
        patContactSuffix: sanitizeWechatText(source.patContactSuffix),
        autoSummaryEnabled: normalizeWechatBoolean(source.autoSummaryEnabled, false),
        autoSummaryThreshold,
        lastSummaryAt: Number(source.lastSummaryAt) || 0,
        lastSummaryMessageId: sanitizeWechatText(source.lastSummaryMessageId),
        lastSummaryTimestamp: Number(source.lastSummaryTimestamp) || 0,
        linkedAccountEnabled: normalizeWechatBoolean(source.linkedAccountEnabled, false),
        parentModeEnabled: normalizeWechatBoolean(source.parentModeEnabled, false),
        conflictModeEnabled: normalizeWechatBoolean(source.conflictModeEnabled, false),
        autoAvatarEnabled: normalizeWechatBoolean(source.autoAvatarEnabled, false),
        autonomyEnabled: normalizeWechatBoolean(source.autonomyEnabled, false),
        independentVoiceApi: normalizeWechatBoolean(source.independentVoiceApi, false),
        proactiveChatEnabled: normalizeWechatBoolean(source.proactiveChatEnabled, false),
        backgroundKeepAliveEnabled: normalizeWechatBoolean(source.backgroundKeepAliveEnabled, false)
      };
    }

    function getWechatContactSettings(contact) {
      return normalizeWechatContactSettings(contact && contact.__miniWechatSettings);
    }

    function getWechatContactRemark(contact) {
      return sanitizeWechatText(getWechatContactSettings(contact).remark);
    }

    async function readWechatContactSettings(contactId) {
      if (contactId == null) return normalizeWechatContactSettings();
      const miniDb = await waitForMiniDb().catch(() => null);
      const wechatOps = miniDb && miniDb.ops && miniDb.ops.wechat;
      if (!wechatOps || typeof wechatOps.getConfig !== 'function') return normalizeWechatContactSettings();
      try {
        return normalizeWechatContactSettings(await wechatOps.getConfig(getWechatContactSettingsConfigId(contactId)));
      } catch (error) {
        return normalizeWechatContactSettings();
      }
    }

    function applyWechatContactSettingsToLiveContacts(contactId, nextSettings) {
      const normalized = normalizeWechatContactSettings(nextSettings);
      [window.__miniWechatAllContacts, window.__miniWechatContacts].forEach((list) => {
        if (!Array.isArray(list)) return;
        list.forEach((contact) => {
          if (!contact || String(contact.id) !== String(contactId)) return;
          contact.__miniWechatSettings = normalized;
        });
      });
      const selection = typeof getCurrentWechatSelection === 'function' ? getCurrentWechatSelection() : null;
      if (selection && selection.contact && String(selection.contact.id) === String(contactId)) {
        selection.contact.__miniWechatSettings = normalized;
      }
      return normalized;
    }

    async function writeWechatContactSettings(contactId, patch, options = {}) {
      if (contactId == null) return normalizeWechatContactSettings();
      const miniDb = await waitForMiniDb().catch(() => null);
      const wechatOps = miniDb && miniDb.ops && miniDb.ops.wechat;
      const current = options.replace
        ? normalizeWechatContactSettings(patch)
        : normalizeWechatContactSettings({
            ...(await readWechatContactSettings(contactId)),
            ...(patch && typeof patch === 'object' ? patch : {})
          });
      if (wechatOps && typeof wechatOps.setConfig === 'function') {
        await wechatOps.setConfig(getWechatContactSettingsConfigId(contactId), current);
      }
      return applyWechatContactSettingsToLiveContacts(contactId, current);
    }

    function normalizeWechatTokenStats(value) {
      const source = value && typeof value === 'object' ? value : {};
      const normalizeBucket = (bucket) => ({
        requests: Math.max(0, Number(bucket && bucket.requests) || 0),
        promptTokens: Math.max(0, Number(bucket && bucket.promptTokens) || 0),
        completionTokens: Math.max(0, Number(bucket && bucket.completionTokens) || 0),
        totalTokens: Math.max(
          0,
          Number(bucket && bucket.totalTokens)
          || ((Number(bucket && bucket.promptTokens) || 0) + (Number(bucket && bucket.completionTokens) || 0))
        ),
        lastUpdatedAt: Math.max(0, Number(bucket && bucket.lastUpdatedAt) || 0)
      });
      const contacts = {};
      const contactBuckets = source.contacts && typeof source.contacts === 'object' ? source.contacts : {};
      Object.keys(contactBuckets).forEach((key) => {
        const safeKey = sanitizeWechatText(key);
        if (!safeKey) return;
        contacts[safeKey] = normalizeBucket(contactBuckets[key]);
      });
      return {
        global: normalizeBucket(source.global),
        contacts
      };
    }

    async function loadWechatTokenStats() {
      const miniDb = await waitForMiniDb().catch(() => null);
      const wechatOps = miniDb && miniDb.ops && miniDb.ops.wechat;
      if (!wechatOps || typeof wechatOps.getConfig !== 'function') return normalizeWechatTokenStats();
      try {
        return normalizeWechatTokenStats(await wechatOps.getConfig(wechatTokenStatsConfigId));
      } catch (error) {
        return normalizeWechatTokenStats();
      }
    }

    async function saveWechatTokenStats(stats) {
      const normalized = normalizeWechatTokenStats(stats);
      const miniDb = await waitForMiniDb().catch(() => null);
      const wechatOps = miniDb && miniDb.ops && miniDb.ops.wechat;
      if (wechatOps && typeof wechatOps.setConfig === 'function') {
        await wechatOps.setConfig(wechatTokenStatsConfigId, normalized);
      }
      return normalized;
    }

    async function recordWechatTokenUsage(contactId, usage) {
      const promptTokens = Math.max(0, Number(usage && usage.promptTokens) || 0);
      const completionTokens = Math.max(0, Number(usage && usage.completionTokens) || 0);
      const totalTokens = Math.max(0, Number(usage && usage.totalTokens) || (promptTokens + completionTokens));
      if (!promptTokens && !completionTokens && !totalTokens) return normalizeWechatTokenStats();
      const next = await loadWechatTokenStats();
      const stamp = Date.now();
      const mergeIntoBucket = (bucket) => ({
        requests: Math.max(0, Number(bucket && bucket.requests) || 0) + 1,
        promptTokens: Math.max(0, Number(bucket && bucket.promptTokens) || 0) + promptTokens,
        completionTokens: Math.max(0, Number(bucket && bucket.completionTokens) || 0) + completionTokens,
        totalTokens: Math.max(0, Number(bucket && bucket.totalTokens) || 0) + totalTokens,
        lastUpdatedAt: stamp
      });
      next.global = mergeIntoBucket(next.global);
      if (contactId != null) {
        const key = sanitizeWechatText(contactId);
        next.contacts[key] = mergeIntoBucket(next.contacts[key]);
      }
      const saved = await saveWechatTokenStats(next);
      if (routeName === 'wechat' && typeof refreshWechatSettingsPageTokenBoard === 'function') {
        void refreshWechatSettingsPageTokenBoard(saved);
      }
      return saved;
    }

    function normalizeWechatThreadKeyList(values) {
      const seen = new Set();
      const list = [];
      (Array.isArray(values) ? values : []).forEach((value) => {
        const key = sanitizeWechatText(value);
        if (!key || seen.has(key)) return;
        seen.add(key);
        list.push(key);
      });
      return list;
    }

    function normalizeWechatThreadListState(value, allowedKeys = null) {
      const source = value && typeof value === 'object' ? value : {};
      let hiddenKeys = normalizeWechatThreadKeyList(source.hiddenKeys);
      let pinnedKeys = normalizeWechatThreadKeyList(source.pinnedKeys).filter((key) => !hiddenKeys.includes(key));
      let knownKeys = normalizeWechatThreadKeyList(source.knownKeys);
      if (allowedKeys instanceof Set) {
        hiddenKeys = hiddenKeys.filter((key) => allowedKeys.has(key));
        pinnedKeys = pinnedKeys.filter((key) => allowedKeys.has(key));
        knownKeys = knownKeys.filter((key) => allowedKeys.has(key));
      }
      return { hiddenKeys, pinnedKeys, knownKeys };
    }

    function areWechatThreadListsEqual(left, right) {
      const safeLeft = normalizeWechatThreadListState(left);
      const safeRight = normalizeWechatThreadListState(right);
      return safeLeft.hiddenKeys.join('\n') === safeRight.hiddenKeys.join('\n')
        && safeLeft.pinnedKeys.join('\n') === safeRight.pinnedKeys.join('\n')
        && safeLeft.knownKeys.join('\n') === safeRight.knownKeys.join('\n');
    }

    function getWechatThreadListStateSync() {
      const normalized = normalizeWechatThreadListState(window.__miniWechatThreadListState);
      window.__miniWechatThreadListState = normalized;
      return normalized;
    }

    async function loadWechatThreadListState() {
      if (window.__miniWechatThreadListStateLoaded) return getWechatThreadListStateSync();
      const miniDb = await waitForMiniDb().catch(() => null);
      const wechatOps = miniDb && miniDb.ops && miniDb.ops.wechat;
      let stored = null;
      if (wechatOps && typeof wechatOps.getConfig === 'function') {
        try {
          stored = await wechatOps.getConfig(wechatThreadListConfigId);
        } catch (error) {
          stored = null;
        }
      }
      window.__miniWechatThreadListState = normalizeWechatThreadListState(stored);
      window.__miniWechatThreadListStateLoaded = true;
      return getWechatThreadListStateSync();
    }

    async function persistWechatThreadListState() {
      const state = getWechatThreadListStateSync();
      const miniDb = await waitForMiniDb().catch(() => null);
      const wechatOps = miniDb && miniDb.ops && miniDb.ops.wechat;
      if (!wechatOps || typeof wechatOps.setConfig !== 'function') return state;
      await wechatOps.setConfig(wechatThreadListConfigId, {
        hiddenKeys: state.hiddenKeys.slice(),
        pinnedKeys: state.pinnedKeys.slice(),
        knownKeys: state.knownKeys.slice()
      });
      return state;
    }

    async function updateWechatThreadListState(mutator) {
      const current = await loadWechatThreadListState();
      const draft = {
        hiddenKeys: current.hiddenKeys.slice(),
        pinnedKeys: current.pinnedKeys.slice(),
        knownKeys: current.knownKeys.slice()
      };
      const candidate = typeof mutator === 'function' ? mutator(draft) : draft;
      const next = normalizeWechatThreadListState(candidate && typeof candidate === 'object'
        ? { ...draft, ...candidate }
        : draft);
      if (areWechatThreadListsEqual(current, next)) return getWechatThreadListStateSync();
      window.__miniWechatThreadListState = next;
      await persistWechatThreadListState();
      return getWechatThreadListStateSync();
    }

    function isWechatChineseLanguage(value) {
      const raw = sanitizeWechatText(value).toLowerCase();
      if (!raw) return true;
      return raw.includes('中文')
        || raw.includes('mandarin')
        || raw.includes('cantonese')
        || raw.includes('粤语')
        || raw.includes('chinese');
    }

    function detectWechatLanguageCode(value) {
      const raw = sanitizeWechatText(value).toLowerCase();
      if (!raw) return 'zh-CN';
      if (raw.includes('english') || raw.includes('英语')) return 'en';
      if (raw.includes('japanese') || raw.includes('日语')) return 'ja';
      if (raw.includes('korean') || raw.includes('韩语')) return 'ko';
      if (raw.includes('cantonese') || raw.includes('粤语')) return 'yue';
      if (raw.includes('中文') || raw.includes('mandarin') || raw.includes('chinese')) return 'zh-CN';
      return 'auto';
    }

    function buildWechatLanguagePolicy(languageLabel) {
      const label = sanitizeWechatText(languageLabel) || '中文 (Mandarin)';
      const sourceLang = detectWechatLanguageCode(label);
      const requiresTranslation = !isWechatChineseLanguage(label);
      return {
        label,
        sourceLang,
        targetLang: 'zh-CN',
        requiresTranslation
      };
    }

    function escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function normalizeWechatMessageDirection(value) {
      const raw = sanitizeWechatText(value).toLowerCase();
      if (raw === 'received' || raw === 'receive' || raw === 'incoming' || raw === 'assistant' || raw === 'other') return 'received';
      return 'sent';
    }

    function normalizeWechatLocalizedContent(value, fallback = '', options = {}) {
      const source = value && typeof value === 'object' && !Array.isArray(value) ? value : null;
      const raw = sanitizeWechatText(source ? (source.raw != null ? source.raw : source.text) : value) || sanitizeWechatText(fallback);
      const zh = sanitizeWechatText(source && source.zh) || raw;
      const sourceLang = sanitizeWechatText(source && source.sourceLang) || sanitizeWechatText(options.sourceLang) || 'auto';
      const targetLang = sanitizeWechatText(source && source.targetLang) || sanitizeWechatText(options.targetLang) || 'zh-CN';
      return { raw, zh, sourceLang, targetLang };
    }

    function getWechatLocalizedContentText(value, fallback = '') {
      const normalized = normalizeWechatLocalizedContent(value, fallback);
      return sanitizeWechatText(normalized.raw || normalized.zh || fallback);
    }

    function buildWechatReplyLocalizedValue(value, fallback = '', options = {}) {
      const normalized = normalizeWechatLocalizedContent(value, fallback, options);
      if (!normalized.raw && !normalized.zh) return null;
      const hasTranslation = !!normalized.raw && !!normalized.zh && normalized.raw !== normalized.zh;
      if (hasTranslation || options.forceObject) return normalized;
      return normalized.raw || normalized.zh;
    }

    function pickWechatReplyLocalizedValue(candidates, fallback = '', options = {}) {
      const list = Array.isArray(candidates) ? candidates : [candidates];
      for (const candidate of list) {
        const next = buildWechatReplyLocalizedValue(candidate, '', options);
        if (next) return next;
      }
      return buildWechatReplyLocalizedValue(fallback, '', options);
    }

    function countWechatVoiceCharacters(value) {
      const compact = sanitizeWechatText(value).replace(/\s+/g, '');
      return Array.from(compact).length;
    }

    function wrapWechatTextByColumns(value, maxCharsPerLine = 0) {
      const text = sanitizeWechatText(value);
      const limit = Math.max(0, Number(maxCharsPerLine) || 0);
      if (!text || !limit) return text;
      return text
        .split('\n')
        .map((line) => {
          const chars = Array.from(line);
          if (!chars.length) return '';
          const segments = [];
          for (let index = 0; index < chars.length; index += limit) {
            segments.push(chars.slice(index, index + limit).join(''));
          }
          return segments.join('\n');
        })
        .join('\n');
    }

    function getWechatWrappedMaxLineLength(value, maxCharsPerLine = 22) {
      const wrapped = wrapWechatTextByColumns(value, maxCharsPerLine);
      if (!wrapped) return 0;
      return wrapped.split('\n').reduce((maxLength, line) => {
        return Math.max(maxLength, Array.from(line).length);
      }, 0);
    }

    function estimateWechatVoiceDurationSec(value) {
      const count = countWechatVoiceCharacters(value);
      return Math.max(1, Math.ceil(count / 3) || 1);
    }

    function formatWechatVoiceDurationLabel(durationSec) {
      return `${Math.max(1, Number(durationSec) || 1)}"`;
    }

    function computeWechatVoiceBubbleWidthPx(value, options = {}) {
      const mode = sanitizeWechatText(options && options.mode).toLowerCase();
      if (mode !== 'expanded') return 104;
      const maxCharsPerLine = Math.max(1, Number(options.maxCharsPerLine) || 22);
      const lineLength = Math.max(6, getWechatWrappedMaxLineLength(value, maxCharsPerLine));
      return Math.max(132, Math.min(308, Math.round(38 + lineLength * 12)));
    }

    function buildWechatStrictVoiceObject(transcript, durationSec = null) {
      const safeTranscript = sanitizeWechatText(transcript);
      return {
        type: 'voice',
        transcript: safeTranscript,
        durationSec: Math.max(1, Number(durationSec) || estimateWechatVoiceDurationSec(safeTranscript))
      };
    }

    function createWechatMessageId(type = 'text', timestamp = Date.now()) {
      return `msg_${sanitizeWechatText(type) || 'text'}_${Number(timestamp || Date.now()).toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    }

    function getWechatExplicitMessageType(entry) {
      const rawType = sanitizeWechatText(entry && (entry.type || entry.messageType || entry.kind)).toLowerCase();
      return wechatMessageTypes.has(rawType) ? rawType : '';
    }

    function inferWechatMessageTypeFromShape(entry, fallbackType = '') {
      const payload = entry && entry.payload && typeof entry.payload === 'object' ? entry.payload : {};
      if (payload.quote) return 'quote';
      if (payload.targetMessageId || payload.snapshot || payload.recalledAt) return 'recall';
      if (payload.libraryId || payload.packId) return 'sticker';
      if (payload.assetId && payload.transcript) return 'voice';
      if (payload.name && (payload.lat != null || payload.lng != null)) return 'location';
      if (payload.greeting) return 'red_packet';
      if (payload.giftId) return 'gift';
      if (payload.merchant || Array.isArray(payload.items)) return 'takeout';
      if (payload.amount != null && sanitizeWechatText(payload.status).toLowerCase() !== 'unopened') return 'transfer';
      if (payload.amount != null && payload.greeting) return 'red_packet';
      if (payload.startedAt && fallbackType === 'video') return 'video';
      if (payload.startedAt) return 'call';
      const imageSource = sanitizeWechatText(payload.dataUrl || payload.imageUrl || payload.url);
      if (payload.assetId && sanitizeWechatText(payload.origin).toLowerCase() === 'camera_generated') return 'photo';
      if (imageSource || payload.fileName || payload.width != null || payload.height != null || payload.original != null) {
        return fallbackType === 'photo' ? 'photo' : 'image';
      }
      if (payload.assetId && payload.description) return fallbackType === 'photo' ? 'photo' : 'image';
      return 'text';
    }

    function inferWechatMessageType(entry) {
      const rawType = getWechatExplicitMessageType(entry);
      if (rawType) return rawType;
      return inferWechatMessageTypeFromShape(entry, rawType);
    }

    function normalizeWechatMessageType(value, entry) {
      const raw = sanitizeWechatText(value).toLowerCase();
      if (wechatMessageTypes.has(raw)) return raw;
      return inferWechatMessageType(entry);
    }

    function cloneWechatMessageForPayload(entry, context = {}, depth = 0) {
      const normalized = normalizeWechatThreadEntry(entry, context, depth + 1);
      if (!normalized) return null;
      const { id, createdAt, updatedAt, text, favorite, favoriteAt, ...rest } = normalized;
      return JSON.parse(JSON.stringify(rest));
    }

    function normalizeWechatThreadEntry(entry, context = {}, depth = 0) {
      if (!entry || typeof entry !== 'object' || depth > 4) return null;
      const fallbackChatId = sanitizeWechatText(context.chatId || context.currentContactId || entry.chatId);
      if (!fallbackChatId) return null;
      const timestamp = Number(entry.timestamp);
      const safeTimestamp = Number.isFinite(timestamp) && timestamp > 0 ? timestamp : Date.now();
      const direction = normalizeWechatMessageDirection(entry.direction || (entry.type === 'received' || entry.type === 'sent' ? entry.type : ''));
      const explicitType = getWechatExplicitMessageType(entry);
      const type = normalizeWechatMessageType(entry.type || entry.messageType, entry);
      if (wechatStrictJsonMessageTypes.has(type) && explicitType !== type) return null;
      const payloadSource = entry.payload && typeof entry.payload === 'object' ? entry.payload : {};
      const base = {
        ...(entry.id != null ? { id: entry.id } : {}),
        messageId: sanitizeWechatText(entry.messageId) || createWechatMessageId(type, safeTimestamp),
        chatId: fallbackChatId,
        direction,
        type,
        timestamp: safeTimestamp,
        favorite: !!entry.favorite,
        favoriteAt: Number(entry.favoriteAt) || null
      };
      if (entry.createdAt != null) base.createdAt = entry.createdAt;
      if (entry.updatedAt != null) base.updatedAt = entry.updatedAt;

      let payload = {};
      if (type === 'text') {
        payload = {
          content: normalizeWechatLocalizedContent(payloadSource.content || entry.content || entry.text)
        };
      }
      if (type === 'quote') {
        payload = {
          quote: cloneWechatMessageForPayload(payloadSource.quote || entry.quote, { chatId: fallbackChatId }, depth),
          content: normalizeWechatLocalizedContent(payloadSource.content || entry.content || entry.text)
        };
      }
      if (type === 'recall') {
        const snapshot = cloneWechatMessageForPayload(payloadSource.snapshot || entry.snapshot, { chatId: fallbackChatId }, depth);
        payload = {
          operator: sanitizeWechatText(payloadSource.operator || entry.operator).toLowerCase() === 'self' ? 'self' : 'other',
          targetMessageId: sanitizeWechatText(payloadSource.targetMessageId || entry.targetMessageId || (snapshot && snapshot.messageId)),
          targetMessageType: normalizeWechatMessageType(payloadSource.targetMessageType || entry.targetMessageType || (snapshot && snapshot.type) || 'text', snapshot || {}),
          targetMessageTimestamp: Number(payloadSource.targetMessageTimestamp || entry.targetMessageTimestamp || (snapshot && snapshot.timestamp)) || safeTimestamp,
          recalledAt: Number(payloadSource.recalledAt || entry.recalledAt) || safeTimestamp,
          snapshot
        };
      }
      if (type === 'pat') {
        payload = {
          text: sanitizeWechatText(payloadSource.text || entry.text),
          actor: sanitizeWechatText(payloadSource.actor || entry.actor) || 'system'
        };
      }
      if (type === 'sticker') {
        payload = {
          libraryId: sanitizeWechatText(payloadSource.libraryId || entry.libraryId),
          packId: sanitizeWechatText(payloadSource.packId || entry.packId),
          assetId: sanitizeWechatText(payloadSource.assetId || entry.assetId),
          description: normalizeWechatLocalizedContent(payloadSource.description || entry.description || entry.text, '琛ㄦ儏'),
          dataUrl: sanitizeWechatText(payloadSource.dataUrl || payloadSource.imageUrl || payloadSource.url || entry.dataUrl || entry.imageUrl || entry.url)
        };
      }
      if (type === 'voice') {
        payload = {
          assetId: sanitizeWechatText(payloadSource.assetId || entry.assetId),
          durationSec: Math.max(0, Number(payloadSource.durationSec || entry.durationSec) || 0),
          transcript: normalizeWechatLocalizedContent(payloadSource.transcript || entry.transcript || entry.text, 'Voice message')
        };
      }
      if (type === 'photo') {
        payload = {
          assetId: sanitizeWechatText(payloadSource.assetId || entry.assetId),
          origin: sanitizeWechatText(payloadSource.origin || entry.origin || 'camera_generated'),
          description: normalizeWechatLocalizedContent(payloadSource.description || entry.description || entry.text, '\u7167\u7247')
        };
      }
      if (type === 'image') {
        payload = {
          assetId: sanitizeWechatText(payloadSource.assetId || entry.assetId),
          origin: sanitizeWechatText(payloadSource.origin || entry.origin || 'upload'),
          description: normalizeWechatLocalizedContent(payloadSource.description || entry.description || entry.text, '\u56fe\u7247'),
          dataUrl: sanitizeWechatText(payloadSource.dataUrl || payloadSource.imageUrl || payloadSource.url || entry.dataUrl || entry.imageUrl || entry.url),
          fileName: sanitizeWechatText(payloadSource.fileName || entry.fileName),
          mimeType: sanitizeWechatText(payloadSource.mimeType || entry.mimeType),
          width: Math.max(0, Number(payloadSource.width || entry.width) || 0),
          height: Math.max(0, Number(payloadSource.height || entry.height) || 0),
          sizeBytes: Math.max(0, Number(payloadSource.sizeBytes || entry.sizeBytes) || 0),
          original: !!(payloadSource.original || entry.original)
        };
      }
      if (type === 'location') {
        payload = {
          name: normalizeWechatLocalizedContent(payloadSource.name || entry.name || entry.text, '浣嶇疆'),
          address: normalizeWechatLocalizedContent(payloadSource.address || entry.address, ''),
          distanceMeters: Number(payloadSource.distanceMeters || entry.distanceMeters) || 0,
          lat: Number(payloadSource.lat != null ? payloadSource.lat : entry.lat) || 0,
          lng: Number(payloadSource.lng != null ? payloadSource.lng : entry.lng) || 0
        };
      }
      if (type === 'transfer') {
        payload = {
          amount: Number(payloadSource.amount || entry.amount) || 0,
          currency: sanitizeWechatText(payloadSource.currency || entry.currency) || 'CNY',
          note: normalizeWechatLocalizedContent(payloadSource.note || entry.note || entry.text, ''),
          status: sanitizeWechatText(payloadSource.status || entry.status) || 'pending'
        };
      }
      if (type === 'red_packet') {
        payload = {
          amount: Number(payloadSource.amount || entry.amount) || 0,
          currency: sanitizeWechatText(payloadSource.currency || entry.currency) || 'CNY',
          greeting: normalizeWechatLocalizedContent(payloadSource.greeting || entry.greeting || entry.text, 'Best wishes'),
          status: sanitizeWechatText(payloadSource.status || entry.status) || 'unopened'
        };
      }
      if (type === 'gift') {
        payload = {
          giftId: sanitizeWechatText(payloadSource.giftId || entry.giftId) || 'gift',
          title: normalizeWechatLocalizedContent(payloadSource.title || entry.title || entry.text, '绀肩墿'),
          count: Math.max(1, Number(payloadSource.count || entry.count) || 1),
          note: normalizeWechatLocalizedContent(payloadSource.note || entry.note, ''),
          status: sanitizeWechatText(payloadSource.status || entry.status) || 'received'
        };
      }
      if (type === 'takeout') {
        payload = {
          merchant: normalizeWechatLocalizedContent(payloadSource.merchant || entry.merchant || entry.text, '澶栧崠'),
          items: Array.isArray(payloadSource.items || entry.items)
            ? (payloadSource.items || entry.items).map((item) => normalizeWechatLocalizedContent(item)).filter((item) => item.raw)
            : [],
          amount: Number(payloadSource.amount || entry.amount) || 0,
          currency: sanitizeWechatText(payloadSource.currency || entry.currency) || 'CNY',
          etaMinutes: Math.max(0, Number(payloadSource.etaMinutes || entry.etaMinutes) || 0),
          note: normalizeWechatLocalizedContent(payloadSource.note || entry.note, ''),
          status: sanitizeWechatText(payloadSource.status || entry.status) || 'placed'
        };
      }
      if (type === 'call' || type === 'video') {
        payload = {
          status: sanitizeWechatText(payloadSource.status || entry.status) || 'missed',
          durationSec: Math.max(0, Number(payloadSource.durationSec || entry.durationSec) || 0),
          startedAt: Number(payloadSource.startedAt || entry.startedAt) || safeTimestamp
        };
      }

      const normalized = {
        ...base,
        payload
      };
      normalized.text = buildWechatMessageDisplayModel(normalized).preview;
      if (!normalized.text && type !== 'recall') return null;
      return normalized;
    }

    function getWechatMessageDirection(entry) {
      return normalizeWechatMessageDirection(entry && (entry.direction || entry.type));
    }

    function formatWechatMessageAmount(amount, currency) {
      const numeric = Number(amount);
      const safeAmount = Number.isFinite(numeric) ? numeric : 0;
      const safeCurrency = sanitizeWechatText(currency) || 'CNY';
      return `${safeCurrency} ${safeAmount.toFixed(2)}`;
    }

    function buildWechatMessageDisplayModel(entry) {
      const message = entry && entry.payload ? entry : normalizeWechatThreadEntry(entry, { chatId: entry && entry.chatId });
      if (!message) return { primary: '', secondary: '', quotePreview: '', preview: '' };
      const payload = message.payload || {};
      if (message.type === 'text') {
        const content = normalizeWechatLocalizedContent(payload.content);
        const sourceText = sanitizeWechatText(content.raw);
        const translatedText = sanitizeWechatText(content.zh);
        if (sourceText && translatedText && sourceText !== translatedText) {
          return {
            primary: translatedText,
            secondary: sourceText,
            quotePreview: '',
            preview: `[缈昏瘧] ${translatedText} ${sourceText}`
          };
        }
        const primary = sourceText || translatedText;
        return { primary, secondary: '', quotePreview: '', preview: primary };
      }
      if (message.type === 'quote') {
        const content = normalizeWechatLocalizedContent(payload.content);
        const sourceText = sanitizeWechatText(content.raw);
        const translatedText = sanitizeWechatText(content.zh);
        const primary = sourceText && translatedText && sourceText !== translatedText
          ? translatedText
          : (sourceText || translatedText);
        const secondary = sourceText && translatedText && sourceText !== translatedText ? sourceText : '';
        const quotePreview = payload.quote ? buildWechatMessageDisplayModel(payload.quote).preview : '';
        return { primary, secondary, quotePreview, preview: primary ? `[\u5f15\u7528] ${primary}` : `[\u5f15\u7528] ${quotePreview}` };
      }
      if (message.type === 'recall') {
        const primary = payload.operator === 'self' ? '\u4f60\u64a4\u56de\u4e86\u4e00\u6761\u6d88\u606f' : '\u5bf9\u65b9\u64a4\u56de\u4e86\u4e00\u6761\u6d88\u606f';
        return { primary, secondary: '', quotePreview: '', preview: primary };
      }
      if (message.type === 'sticker') {
        const primary = `[\u8868\u60c5] ${getWechatLocalizedContentText(payload.description, '\u8868\u60c5')}`;
        return { primary, secondary: '', quotePreview: '', preview: primary };
      }
      if (message.type === 'voice') {
        const transcript = getWechatLocalizedContentText(payload.transcript, '\u8bed\u97f3\u6d88\u606f');
        const duration = Math.max(0, Number(payload.durationSec) || 0);
        const primary = `[\u8bed\u97f3 ${duration}s] ${transcript}`.trim();
        return { primary, secondary: '', quotePreview: '', preview: primary };
      }
      if (message.type === 'photo') {
        const primary = `[\u7167\u7247] ${getWechatLocalizedContentText(payload.description, '\u7167\u7247')}`;
        return { primary, secondary: '', quotePreview: '', preview: primary };
      }
      if (message.type === 'image') {
        const primary = `[\u56fe\u7247] ${getWechatLocalizedContentText(payload.description, '\u56fe\u7247')}`;
        return { primary, secondary: '', quotePreview: '', preview: primary };
      }
      if (message.type === 'location') {
        const primary = `[\u4f4d\u7f6e] ${getWechatLocalizedContentText(payload.name, '\u4f4d\u7f6e')}`;
        const distanceLabel = formatWechatLocationDistanceLabel(payload.distanceMeters);
        const address = getWechatLocalizedContentText(payload.address);
        const secondary = [distanceLabel !== '--' ? distanceLabel : '', address].filter(Boolean).join(' / ');
        return { primary, secondary, quotePreview: '', preview: secondary ? `${primary} ${secondary}` : primary };
      }
      if (message.type === 'transfer') {
        const primary = `[\u8f6c\u8d26] ${formatWechatMessageAmount(payload.amount, payload.currency)}`;
        const secondary = getWechatLocalizedContentText(payload.note) || sanitizeWechatText(payload.status);
        return { primary, secondary, quotePreview: '', preview: secondary ? `${primary} ${secondary}` : primary };
      }
      if (message.type === 'red_packet') {
        const primary = `[\u7ea2\u5305] ${formatWechatMessageAmount(payload.amount, payload.currency)}`;
        const secondary = getWechatLocalizedContentText(payload.greeting) || sanitizeWechatText(payload.status);
        return { primary, secondary, quotePreview: '', preview: secondary ? `${primary} ${secondary}` : primary };
      }
      if (message.type === 'gift') {
        const title = getWechatLocalizedContentText(payload.title, '\u793c\u7269');
        const primary = `[\u793c\u7269] ${title} x${Math.max(1, Number(payload.count) || 1)}`;
        const secondary = getWechatLocalizedContentText(payload.note) || sanitizeWechatText(payload.status);
        return { primary, secondary, quotePreview: '', preview: secondary ? `${primary} ${secondary}` : primary };
      }
      if (message.type === 'takeout') {
        const merchant = getWechatLocalizedContentText(payload.merchant, '\u5916\u5356');
        const items = Array.isArray(payload.items) ? payload.items.map((item) => getWechatLocalizedContentText(item)).filter(Boolean).join(' / ') : '';
        const primary = `[\u5916\u5356] ${merchant}`;
        return { primary, secondary: items || sanitizeWechatText(payload.status), quotePreview: '', preview: items ? `${primary} ${items}` : primary };
      }
      if (message.type === 'call') {
        const primary = `[\u901a\u8bdd] ${sanitizeWechatText(payload.status) || 'missed'}`;
        return { primary, secondary: '', quotePreview: '', preview: primary };
      }
      if (message.type === 'video') {
        const primary = `[\u89c6\u9891] ${sanitizeWechatText(payload.status) || 'missed'}`;
        return { primary, secondary: '', quotePreview: '', preview: primary };
      }
      return { primary: '', secondary: '', quotePreview: '', preview: '' };
    }

    function getWechatMessageCompactTypePreview(type, fallback = '') {
      const normalizedType = sanitizeWechatText(type).toLowerCase();
      if (normalizedType === 'quote') return '[引用]';
      if (normalizedType === 'recall') return '[撤回]';
      if (normalizedType === 'pat') return '[拍一拍]';
      if (normalizedType === 'sticker') return '[表情]';
      if (normalizedType === 'voice') return '[语音]';
      if (normalizedType === 'photo') return '[照片]';
      if (normalizedType === 'image') return '[图片]';
      if (normalizedType === 'location') return '[位置]';
      if (normalizedType === 'transfer') return '[转账]';
      if (normalizedType === 'red_packet') return '[红包]';
      if (normalizedType === 'gift') return '[礼物]';
      if (normalizedType === 'takeout') return '[外卖]';
      if (normalizedType === 'call') return '[通话]';
      if (normalizedType === 'video') return '[视频]';
      return sanitizeWechatText(fallback);
    }

    function buildWechatMessageDisplayModel(entry) {
      const message = entry && entry.payload ? entry : normalizeWechatThreadEntry(entry, { chatId: entry && entry.chatId });
      if (!message) return { primary: '', secondary: '', quotePreview: '', preview: '', compactPreview: '', layout: 'default' };
      const payload = message.payload || {};
      if (message.type === 'text') {
        const translation = getWechatTranslationDisplayParts(payload.content);
        if (translation.hasTranslation) {
          const preview = `[\u7ffb\u8bd1] ${translation.translatedText} ${translation.sourceText}`;
          return {
            primary: translation.sourceText,
            secondary: translation.translatedText,
            quotePreview: '',
            preview,
            compactPreview: preview,
            layout: 'translation'
          };
        }
        const primary = translation.sourceText || translation.translatedText;
        return { primary, secondary: '', quotePreview: '', preview: primary, compactPreview: primary, layout: 'default' };
      }
      if (message.type === 'quote') {
        const translation = getWechatTranslationDisplayParts(payload.content);
        const primary = translation.hasTranslation
          ? translation.sourceText
          : (translation.sourceText || translation.translatedText);
        const secondary = translation.hasTranslation ? translation.translatedText : '';
        const quoteDisplay = payload.quote ? buildWechatMessageDisplayModel(payload.quote) : null;
        const quotePreview = quoteDisplay ? (quoteDisplay.compactPreview || quoteDisplay.preview) : '';
        return {
          primary,
          secondary,
          quotePreview,
          preview: primary ? `[\u5f15\u7528] ${primary}` : `[\u5f15\u7528] ${quotePreview}`,
          compactPreview: '[引用]',
          layout: translation.hasTranslation ? 'translation' : 'default'
        };
      }
      if (message.type === 'recall') {
        const primary = payload.operator === 'self' ? '\u4f60\u64a4\u56de\u4e86\u4e00\u6761\u6d88\u606f' : '\u5bf9\u65b9\u64a4\u56de\u4e86\u4e00\u6761\u6d88\u606f';
        return { primary, secondary: '', quotePreview: '', preview: primary, compactPreview: '[撤回]', layout: 'default' };
      }
      if (message.type === 'pat') {
        const primary = sanitizeWechatText(payload.text);
        return { primary, secondary: '', quotePreview: '', preview: primary, compactPreview: primary, layout: 'default' };
      }
      if (message.type === 'sticker') {
        const primary = getWechatLocalizedContentText(payload.description, '\u8868\u60c5');
        return {
          primary,
          secondary: '',
          quotePreview: '',
          preview: `[\u8868\u60c5] ${primary}`,
          compactPreview: '[表情]',
          layout: 'default'
        };
      }
      if (message.type === 'voice') {
        const transcript = getWechatLocalizedContentText(payload.transcript, '\u8bed\u97f3\u6d88\u606f');
        const duration = Math.max(0, Number(payload.durationSec) || 0);
        const primary = `${duration ? `${duration}s ` : ''}${transcript}`.trim();
        const preview = `[\u8bed\u97f3 ${duration}s] ${transcript}`.trim();
        return { primary, secondary: '', quotePreview: '', preview, compactPreview: '[语音]', layout: 'default' };
      }
      if (message.type === 'photo') {
        const primary = getWechatLocalizedContentText(payload.description, '\u7167\u7247');
        return { primary, secondary: '', quotePreview: '', preview: `[\u7167\u7247] ${primary}`, compactPreview: '[照片]', layout: 'default' };
      }
      if (message.type === 'image') {
        const primary = getWechatLocalizedContentText(payload.description, '\u56fe\u7247');
        return { primary, secondary: '', quotePreview: '', preview: `[\u56fe\u7247] ${primary}`, compactPreview: '[图片]', layout: 'default' };
      }
      if (message.type === 'location') {
        const primary = getWechatLocalizedContentText(payload.name, '\u4f4d\u7f6e');
        const distanceLabel = formatWechatLocationDistanceLabel(payload.distanceMeters);
        const address = getWechatLocalizedContentText(payload.address);
        const secondary = [distanceLabel !== '--' ? distanceLabel : '', address].filter(Boolean).join(' / ');
        const preview = secondary ? `[\u4f4d\u7f6e] ${primary} ${secondary}` : `[\u4f4d\u7f6e] ${primary}`;
        return { primary, secondary, quotePreview: '', preview, compactPreview: '[位置]', layout: 'default' };
      }
      if (message.type === 'transfer') {
        const primary = formatWechatMessageAmount(payload.amount, payload.currency);
        const secondary = getWechatLocalizedContentText(payload.note) || sanitizeWechatText(payload.status);
        const preview = secondary ? `[\u8f6c\u8d26] ${primary} ${secondary}` : `[\u8f6c\u8d26] ${primary}`;
        return { primary, secondary, quotePreview: '', preview, compactPreview: '[转账]', layout: 'default' };
      }
      if (message.type === 'red_packet') {
        const primary = formatWechatMessageAmount(payload.amount, payload.currency);
        const secondary = getWechatLocalizedContentText(payload.greeting) || sanitizeWechatText(payload.status);
        const preview = secondary ? `[\u7ea2\u5305] ${primary} ${secondary}` : `[\u7ea2\u5305] ${primary}`;
        return { primary, secondary, quotePreview: '', preview, compactPreview: '[红包]', layout: 'default' };
      }
      if (message.type === 'gift') {
        const title = getWechatLocalizedContentText(payload.title, '\u793c\u7269');
        const primary = `${title} x${Math.max(1, Number(payload.count) || 1)}`;
        const secondary = getWechatLocalizedContentText(payload.note) || sanitizeWechatText(payload.status);
        const preview = secondary ? `[\u793c\u7269] ${primary} ${secondary}` : `[\u793c\u7269] ${primary}`;
        return { primary, secondary, quotePreview: '', preview, compactPreview: '[礼物]', layout: 'default' };
      }
      if (message.type === 'takeout') {
        const merchant = getWechatLocalizedContentText(payload.merchant, '\u5916\u5356');
        const items = Array.isArray(payload.items) ? payload.items.map((item) => getWechatLocalizedContentText(item)).filter(Boolean).join(' / ') : '';
        const primary = merchant;
        const secondary = items || sanitizeWechatText(payload.status);
        const preview = secondary ? `[\u5916\u5356] ${primary} ${secondary}` : `[\u5916\u5356] ${primary}`;
        return { primary, secondary, quotePreview: '', preview, compactPreview: '[外卖]', layout: 'default' };
      }
      if (message.type === 'call') {
        const primary = sanitizeWechatText(payload.status) || 'missed';
        return { primary, secondary: '', quotePreview: '', preview: `[\u901a\u8bdd] ${primary}`, compactPreview: '[通话]', layout: 'default' };
      }
      if (message.type === 'video') {
        const primary = sanitizeWechatText(payload.status) || 'missed';
        return { primary, secondary: '', quotePreview: '', preview: `[\u89c6\u9891] ${primary}`, compactPreview: '[视频]', layout: 'default' };
      }
      const compactPreview = getWechatMessageCompactTypePreview(message.type);
      return { primary: '', secondary: '', quotePreview: '', preview: '', compactPreview, layout: 'default' };
    }

    function getWechatMessagePreviewText(entry) {
      return buildWechatMessageDisplayModel(entry).preview;
    }

    function getWechatMessageCompactPreviewText(entry) {
      const display = buildWechatMessageDisplayModel(entry);
      return display.compactPreview || display.preview;
    }

    function sliceWechatDisplayText(value, maxLength) {
      return Array.from(String(value || '')).slice(0, Math.max(1, maxLength)).join('');
    }

    function normalizeWechatShortText(value, fallback = '', maxLength = 25) {
      const source = sanitizeWechatText(value) || sanitizeWechatText(fallback);
      if (!source) return '';
      return sliceWechatDisplayText(source, maxLength);
    }

    function normalizeWechatTagText(value, fallback = '', maxLength = 12) {
      const source = sanitizeWechatText(value) || sanitizeWechatText(fallback);
      if (!source) return '';
      return sliceWechatDisplayText(source, maxLength);
    }

    function normalizeWechatMbti(value, fallback = '') {
      const source = sanitizeWechatText(value).toUpperCase();
      const fallbackValue = sanitizeWechatText(fallback).toUpperCase();
      const match = source.match(/\b(?:INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)\b/);
      if (match) return match[0];
      const fallbackMatch = fallbackValue.match(/\b(?:INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)\b/);
      return fallbackMatch ? fallbackMatch[0] : '';
    }

    function extractWechatTagKeyword(value, maxLength = 12) {
      const source = sanitizeWechatText(value);
      if (!source) return '';
      const parts = source
        .split(/[锛?銆亅/锛?銆傦紒锛??]/)
        .map((part) => part.trim())
        .filter(Boolean);
      const candidate = parts.find((part) => part.length <= maxLength) || parts[0] || '';
      return normalizeWechatTagText(candidate, '', maxLength);
    }

    function buildWechatVoiceDisplayName(contact) {
      if (!contact) return 'No contact selected';
      const nickname = sanitizeWechatText(contact.nickname);
      const name = sanitizeWechatText(contact.name);
      if (nickname && name && nickname !== name) return `${nickname} ${name}`;
      return nickname || name || sanitizeWechatText(contact.account) || 'Unnamed contact';
    }

    function buildWechatVoiceIdentity(contact) {
      const currentNode = document.querySelector('.w-voice-sub');
      if (currentNode && !currentNode.dataset.defaultValue) {
        currentNode.dataset.defaultValue = sanitizeWechatText(currentNode.textContent);
      }
      const fallback = sanitizeWechatText(currentNode && (currentNode.dataset.defaultValue || currentNode.textContent));
      const identity = extractWechatProfessionText(contact && contact.signature)
        || extractWechatProfessionText(contact && contact.lore)
        || fallback
        || 'IDENTITY LOCKED';
      return identity.toUpperCase();
    }

    function extractWechatMbtiFromContact(contact) {
      if (!contact) return '';
      return normalizeWechatMbti([
        contact.nickname,
        contact.name,
        contact.signature,
        contact.lore
      ].map((value) => sanitizeWechatText(value)).filter(Boolean).join(' '));
    }

    function getWechatExistingVoiceTags() {
      return Array.from(document.querySelectorAll('.w-voice-tags .w-voice-tag'))
        .map((node) => sanitizeWechatText(node.textContent))
        .filter(Boolean);
    }

    function buildWechatRolePanelTags(contact, thought, state) {
      const existing = getWechatExistingVoiceTags();
      const mbti = normalizeWechatMbti(
        thought && thought.mbti,
        extractWechatMbtiFromContact(contact) || existing[0] || 'INTJ'
      ) || 'INTJ';
      const trait = normalizeWechatTagText(
        thought && thought.trait,
        (state && state.mood) || extractWechatTagKeyword(contact && contact.lore, 8) || existing[1] || 'Reserved'
      ) || 'Reserved';
      const specialTag = normalizeWechatTagText(
        thought && thought.specialTag,
        (thought && thought.focus) || (state && state.phase) || existing[2] || 'Night Walk'
      ) || 'Night Walk';
      return [mbti, trait, specialTag];
    }

    function extractWechatTagKeywordSafe(value, maxLength = 12) {
      const source = sanitizeWechatText(value);
      if (!source) return '';
      const parts = source
        .split(/[\uFF0C,\u3001|/\uFF1B;\u3002\uFF01\uFF1F!?]/)
        .map((part) => part.trim())
        .filter(Boolean);
      const candidate = parts.find((part) => part.length <= maxLength) || parts[0] || '';
      return normalizeWechatTagText(candidate, '', maxLength);
    }

    function normalizeWechatPersonaTagText(value, fallback = '') {
      const source = extractWechatTagKeywordSafe(value, 4)
        || extractWechatTagKeywordSafe(fallback, 4)
        || sanitizeWechatText(value)
        || sanitizeWechatText(fallback);
      if (!source) return '';
      return sliceWechatDisplayText(source.replace(/\s+/g, ''), 4);
    }

    const WECHAT_PINYIN_FALLBACK_MAP = {
      '\u6D4B': 'CE',
      '\u8BD5': 'SHI',
      '\u6797': 'LIN',
      '\u9ED8': 'MO'
    };

    function extractWechatChineseName(value) {
      const source = sanitizeWechatText(value);
      if (!source) return '';
      const matches = source.match(/[\u3400-\u9FFF]+/g);
      return matches && matches.length ? matches.join('').trim() : '';
    }

    function buildWechatChinesePinyinFallback(value) {
      const source = extractWechatChineseName(value);
      if (!source) return '';
      const chars = Array.from(source);
      const syllables = chars.map((char) => WECHAT_PINYIN_FALLBACK_MAP[char]).filter(Boolean);
      if (syllables.length !== chars.length) return '';
      return syllables.join(' ');
    }

    function buildWechatCompactAlias(value) {
      const source = sanitizeWechatText(value).replace(/[^A-Za-z\s._-]/g, ' ');
      if (!source) return '';
      const parts = source.split(/[\s._-]+/).map((part) => part.trim()).filter(Boolean);
      if (!parts.length) return '';
      return parts
        .map((part) => {
          const restSource = part.slice(1);
          const rest = /^[A-Z]+$/.test(restSource) || /^[a-z]+$/.test(restSource)
            ? restSource.toLowerCase()
            : restSource;
          return `${part.charAt(0).toUpperCase()}${rest}`;
        })
        .join('')
        .slice(0, 16);
    }

    function normalizeWechatUppercaseRomanizedName(value, fallback = '') {
      const source = sanitizeWechatText(value) || sanitizeWechatText(fallback);
      if (!source) return '';
      const normalized = source
        .replace(/[^A-Za-z0-9\s-]/g, ' ')
        .replace(/[_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return normalized ? normalized.toUpperCase() : '';
    }

    function isWechatAutoAccount(value) {
      return /^(?:[CN]_[A-Z0-9]+(?:_[A-Z0-9]+)?)$/i.test(sanitizeWechatText(value));
    }

    function extractWechatEnglishNickname(contact) {
      if (!contact) return '';
      const nicknameAlias = buildWechatCompactAlias(contact.nickname);
      if (nicknameAlias) return nicknameAlias;
      const nameAlias = buildWechatCompactAlias(contact.name);
      if (nameAlias) return nameAlias;
      const account = sanitizeWechatText(contact.account);
      if (account && !isWechatAutoAccount(account)) return buildWechatCompactAlias(account);
      return '';
    }

    function getWechatVoiceNameParts(contact) {
      if (!contact) return { primary: '\u672a\u9009\u62e9\u8054\u7cfb\u4eba', secondary: '' };
      const englishAlias = extractWechatEnglishNickname(contact);
      const primary = extractWechatChineseName(contact.nickname)
        || extractWechatChineseName(contact.name)
        || sanitizeWechatText(contact.nickname)
        || englishAlias
        || sanitizeWechatText(contact.name)
        || sanitizeWechatText(contact.account)
        || '\u672a\u547d\u540d\u8054\u7cfb\u4eba';
      return {
        primary,
        secondary: englishAlias && englishAlias !== primary ? englishAlias : ''
      };
    }

    function extractWechatProfessionText(value) {
      const source = sanitizeWechatText(value);
      if (!source) return '';
      if (source.length <= 24 && !/[.!?\u3002\uFF01\uFF1F]/.test(source)) return source;
      const englishMatch = source.match(/[A-Za-z][A-Za-z/&\s-]{0,28}(designer|writer|artist|photographer|developer|producer|manager|consultant|teacher|doctor|lawyer|stylist|editor|musician|actor|model|architect|barista|student|founder|director|assistant|planner|engineer)\b/i);
      if (englishMatch) return sanitizeWechatText(englishMatch[0]);
      return '';
    }

    function buildWechatVoiceDisplayNameSafe(contact) {
      if (!contact) return '\u672a\u9009\u62e9\u8054\u7cfb\u4eba';
      const parts = getWechatVoiceNameParts(contact);
      return parts.secondary ? `${parts.primary} ${parts.secondary}` : parts.primary;
    }

    function normalizeWechatProfessionLabel(value, fallback = '') {
      const source = sanitizeWechatText(value) || sanitizeWechatText(fallback);
      if (!source) return '';
      return sliceWechatDisplayText(source, 24);
    }

    function normalizeWechatIdeologyTag(value, fallback = '\u5b8c\u7f8e\u4e3b\u4e49') {
      const source = sanitizeWechatText(value).replace(/\s+/g, '');
      if (source.endsWith('\u4e3b\u4e49')) return sliceWechatDisplayText(source, 6);
      const fallbackBase = sanitizeWechatText(fallback).replace(/\s+/g, '').replace(/\u4e3b\u4e49$/u, '') || '\u5b8c\u7f8e';
      const base = normalizeWechatPersonaTagText(source || fallbackBase, fallbackBase) || '\u5b8c\u7f8e';
      return `${base.replace(/\u4e3b\u4e49$/u, '')}\u4e3b\u4e49`;
    }

    function normalizeWechatSyndromeTag(value, fallback = '\u5931\u7720\u75c7') {
      const source = sanitizeWechatText(value).replace(/\s+/g, '');
      if (source.endsWith('\u75c7')) return sliceWechatDisplayText(source, 6);
      const fallbackBase = sanitizeWechatText(fallback).replace(/\s+/g, '').replace(/\u75c7$/u, '') || '\u5931\u7720';
      const base = normalizeWechatPersonaTagText(source || fallbackBase, fallbackBase) || '\u5931\u7720';
      return `${base.replace(/\u75c7$/u, '')}\u75c7`;
    }

    function formatWechatMbtiPersonaTag(value, fallback = 'INTJ') {
      const mbti = normalizeWechatMbti(value, fallback) || 'INTJ';
      return mbti;
    }

    function stripWechatPanelQuotes(value) {
      return sanitizeWechatText(value).replace(/^[“"'`]+|[”"'`]+$/g, '').trim();
    }

    function formatWechatQuotedPanelText(value, fallback = '', maxLength = 25) {
      const text = clampWechatPanelText(
        stripWechatPanelQuotes(value),
        stripWechatPanelQuotes(fallback),
        maxLength
      );
      return text ? `“${text}”` : '';
    }

    function buildWechatContactPersonaProfileFallback(contact) {
      const parts = getWechatVoiceNameParts(contact);
      const primaryName = parts.primary
        || sanitizeWechatText(contact && contact.nickname)
        || sanitizeWechatText(contact && contact.name)
        || sanitizeWechatText(contact && contact.account)
        || '\u672a\u547d\u540d\u8054\u7cfb\u4eba';
      const safeAccount = sanitizeWechatText(contact && contact.account);
      const romanizedName = normalizeWechatUppercaseRomanizedName(
        buildWechatChinesePinyinFallback(contact && contact.nickname)
          || buildWechatChinesePinyinFallback(contact && contact.name)
          || extractWechatEnglishNickname(contact)
          || sanitizeWechatText(contact && contact.name)
          || sanitizeWechatText(contact && contact.nickname)
          || (safeAccount && !isWechatAutoAccount(safeAccount) ? safeAccount : '')
      );
      return {
        primaryName,
        romanizedName: romanizedName && romanizedName.replace(/\s+/g, '') !== sanitizeWechatText(primaryName).replace(/\s+/g, '').toUpperCase()
          ? romanizedName
          : '',
        profession: normalizeWechatProfessionLabel(
          extractWechatProfessionText(contact && contact.signature)
            || extractWechatProfessionText(contact && contact.lore)
            || sanitizeWechatText(contact && contact.signature)
            || sanitizeWechatText(contact && contact.lore),
          '\u8eab\u4efd\u672a\u660e'
        ) || '\u8eab\u4efd\u672a\u660e',
        mbti: normalizeWechatMbti(extractWechatMbtiFromContact(contact), 'INTJ') || 'INTJ',
        ideologyTag: normalizeWechatIdeologyTag('', '\u5b8c\u7f8e\u4e3b\u4e49'),
        syndromeTag: normalizeWechatSyndromeTag('', '\u5931\u7720\u75c7')
      };
    }

    function normalizeWechatContactPersonaProfile(profile, contact) {
      const source = profile && typeof profile === 'object' ? profile : {};
      const fallback = buildWechatContactPersonaProfileFallback(contact);
      const primaryName = sanitizeWechatText(
        source.primaryName || source.displayName || source.name || source.nickname || fallback.primaryName
      ) || fallback.primaryName;
      const romanizedName = normalizeWechatUppercaseRomanizedName(
        buildWechatChinesePinyinFallback(contact && contact.nickname)
          || buildWechatChinesePinyinFallback(contact && contact.name)
          || source.romanizedName
          || source.pinyin
          || source.alias
          || source.aliasEn,
        fallback.romanizedName
      );
      return {
        primaryName,
        romanizedName: romanizedName && romanizedName.replace(/\s+/g, '') !== sanitizeWechatText(primaryName).replace(/\s+/g, '').toUpperCase()
          ? romanizedName
          : '',
        profession: normalizeWechatProfessionLabel(
          source.profession || source.identity || source.occupation || source.role,
          fallback.profession
        ) || fallback.profession,
        mbti: normalizeWechatMbti(source.mbti, fallback.mbti) || fallback.mbti,
        ideologyTag: normalizeWechatIdeologyTag(
          source.ideologyTag || source.ideology || source.trait,
          fallback.ideologyTag
        ) || fallback.ideologyTag,
        syndromeTag: normalizeWechatSyndromeTag(
          source.syndromeTag || source.syndrome || source.symptom || source.specialTag,
          fallback.syndromeTag
        ) || fallback.syndromeTag
      };
    }

    function getWechatContactPersonaProfile(contact) {
      return normalizeWechatContactPersonaProfile(contact && contact.wechatPersonaProfile, contact);
    }

    function isWechatContactPersonaProfileComplete(profile) {
      return !!(profile
        && profile.primaryName
        && profile.romanizedName
        && profile.profession
        && profile.mbti
        && profile.ideologyTag
        && profile.syndromeTag);
    }

    function buildWechatRolePanelTagsSafe(contact, thought, state) {
      const existing = getWechatExistingVoiceTags();
      const mbti = normalizeWechatMbti(
        thought && thought.mbti,
        extractWechatMbtiFromContact(contact) || existing[0] || 'INTJ'
      ) || 'INTJ';
      const trait = normalizeWechatPersonaTagText(
        thought && thought.trait,
        (state && state.mood) || extractWechatTagKeywordSafe(contact && contact.lore, 4) || existing[1] || '\u514b\u5236'
      ) || '\u514b\u5236';
      const specialTag = normalizeWechatPersonaTagText(
        thought && thought.specialTag,
        (thought && thought.focus) || (state && state.phase) || existing[2] || '\u591c\u884c'
      ) || '\u591c\u884c';
      return [mbti, trait, specialTag];
    }

    function normalizeWechatDiaryContentSafe(value, fallback = '') {
      const source = sanitizeWechatText(value) || sanitizeWechatText(fallback);
      if (!source) return '';
      if (source.length <= 500) return source;
      const slice = source.slice(0, 500);
      for (let index = slice.length - 1; index >= 280; index -= 1) {
        if (/[\u3002\uFF01\uFF1F!?]/.test(slice[index])) return slice.slice(0, index + 1).trim();
      }
      return slice.trim();
    }

    function normalizeWechatProbability(value, fallback = null) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return fallback;
      if (numeric > 1) return Math.max(0, Math.min(1, numeric / 100));
      return Math.max(0, Math.min(1, numeric));
    }

    function normalizeWechatPercent(value, fallback = null) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return fallback;
      if (numeric <= 1 && numeric >= 0) return Math.round(numeric * 100);
      return Math.max(0, Math.min(100, Math.round(numeric)));
    }

    function formatWechatProbabilityLabel(value, fallback = '--') {
      const probability = normalizeWechatProbability(value, null);
      return probability == null ? fallback : `${Math.round(probability * 100)}%`;
    }

    async function getWechatRoleDataOps() {
      const miniDb = await waitForMiniDb();
      const contactsOps = miniDb && miniDb.ops && miniDb.ops.contacts;
      if (!contactsOps) throw new Error('Role-scoped contact storage is unavailable');
      return contactsOps;
    }

    async function getWechatRoleDataDb() {
      const miniDb = await waitForMiniDb();
      const contactsDb = miniDb && miniDb.databases && miniDb.databases.contacts;
      if (!contactsDb || !contactsDb.messages) throw new Error('Role-scoped contact database is unavailable');
      return contactsDb;
    }

    const wechatLegacyMediaMigrationTasks = new Map();
    const wechatLegacyMediaMigrationDone = new Set();

    async function migrateWechatLegacyMediaMessages(currentContactId) {
      if (currentContactId == null) return 0;
      const chatId = sanitizeWechatText(currentContactId);
      if (!chatId) return 0;
      if (wechatLegacyMediaMigrationDone.has(chatId)) return 0;
      if (wechatLegacyMediaMigrationTasks.has(chatId)) return wechatLegacyMediaMigrationTasks.get(chatId);

      const task = (async () => {
        const [contactsOps, contactsDb] = await Promise.all([getWechatRoleDataOps(), getWechatRoleDataDb()]);
        const rows = await contactsOps.loadMessages(chatId);
        let migratedCount = 0;

        for (const row of rows || []) {
          if (!row || typeof row !== 'object' || row.id == null) continue;
          const explicitType = getWechatExplicitMessageType(row);
          const inferredType = inferWechatMessageTypeFromShape(row, explicitType);
          const needsTypeBackfill = wechatStrictJsonMessageTypes.has(inferredType) && explicitType !== inferredType;
          const needsPayloadBackfill = wechatStrictJsonMessageTypes.has(explicitType)
            && (!row.payload || typeof row.payload !== 'object' || Array.isArray(row.payload));
          if (!needsTypeBackfill && !needsPayloadBackfill) continue;

          const legacyDirection = row.direction || (
            sanitizeWechatText(row.type).toLowerCase() === 'received' || sanitizeWechatText(row.type).toLowerCase() === 'sent'
              ? row.type
              : ''
          );
          const normalized = normalizeWechatThreadEntry({
            ...row,
            direction: legacyDirection,
            type: needsTypeBackfill ? inferredType : explicitType
          }, { chatId });
          if (!normalized) continue;

          await contactsDb.messages.put({
            ...normalized,
            id: row.id,
            createdAt: row.createdAt != null ? row.createdAt : normalized.createdAt,
            updatedAt: Date.now()
          });
          migratedCount += 1;
        }

        wechatLegacyMediaMigrationDone.add(chatId);
        return migratedCount;
      })()
        .catch((error) => {
          console.warn('Migrate WeChat legacy media messages failed', error);
          return 0;
        })
        .finally(() => {
          wechatLegacyMediaMigrationTasks.delete(chatId);
        });

      wechatLegacyMediaMigrationTasks.set(chatId, task);
      return task;
    }

    async function loadMessages(currentContactId, options = {}) {
      if (currentContactId == null) return [];
      await migrateWechatLegacyMediaMessages(currentContactId);
      const contactsOps = await getWechatRoleDataOps();
      const rows = await contactsOps.loadMessages(currentContactId, options);
      return (rows || []).map((row) => normalizeWechatThreadEntry(row, { chatId: currentContactId })).filter(Boolean);
    }

    async function getMessage(currentContactId, messageRecordId) {
      if (currentContactId == null || messageRecordId == null) return null;
      await migrateWechatLegacyMediaMessages(currentContactId);
      const contactsOps = await getWechatRoleDataOps();
      const row = await contactsOps.getMessage(currentContactId, messageRecordId);
      return normalizeWechatThreadEntry(row, { chatId: currentContactId });
    }

    async function saveMessage(currentContactId, message) {
      if (currentContactId == null) return null;
      const contactsOps = await getWechatRoleDataOps();
      const normalized = normalizeWechatThreadEntry(message, { chatId: currentContactId });
      if (!normalized) return null;
      const id = await contactsOps.saveMessage(currentContactId, normalized);
      if (id != null) normalized.id = id;
      return normalized;
    }

    async function updateMessage(currentContactId, messageRecordId, message) {
      if (currentContactId == null || messageRecordId == null) return null;
      const contactsOps = await getWechatRoleDataOps();
      const normalized = normalizeWechatThreadEntry(message, { chatId: currentContactId });
      if (!normalized) return null;
      const updated = await contactsOps.updateMessage(currentContactId, messageRecordId, normalized);
      return normalizeWechatThreadEntry(updated, { chatId: currentContactId });
    }

    async function deleteMessage(currentContactId, messageRecordId) {
      if (currentContactId == null || messageRecordId == null) return false;
      const contactsOps = await getWechatRoleDataOps();
      return !!(await contactsOps.deleteMessage(currentContactId, messageRecordId));
    }

    async function deleteMessages(currentContactId, messageRecordIds = []) {
      if (currentContactId == null || !Array.isArray(messageRecordIds) || !messageRecordIds.length) return 0;
      const contactsOps = await getWechatRoleDataOps();
      return contactsOps.deleteMessages(currentContactId, messageRecordIds);
    }

    async function loadMemories(currentContactId, options = {}) {
      if (currentContactId == null) return [];
      const contactsOps = await getWechatRoleDataOps();
      return contactsOps.loadMemories(currentContactId, options);
    }

    async function saveMemory(currentContactId, memory) {
      if (currentContactId == null) return null;
      const contactsOps = await getWechatRoleDataOps();
      return contactsOps.saveMemory(currentContactId, memory);
    }

    async function loadSchedules(currentContactId, options = {}) {
      if (currentContactId == null) return [];
      const contactsOps = await getWechatRoleDataOps();
      return contactsOps.loadSchedules(currentContactId, options);
    }

    async function saveThought(currentContactId, thought) {
      if (currentContactId == null) return null;
      const contactsOps = await getWechatRoleDataOps();
      return contactsOps.saveThought(currentContactId, thought);
    }

    async function saveDiary(currentContactId, diary) {
      if (currentContactId == null) return null;
      const contactsOps = await getWechatRoleDataOps();
      return contactsOps.saveDiary(currentContactId, diary);
    }

    async function saveState(currentContactId, state) {
      if (currentContactId == null) return null;
      const contactsOps = await getWechatRoleDataOps();
      return contactsOps.saveState(currentContactId, state);
    }

    async function getScheduleEntry(currentContactId, scheduleId) {
      if (currentContactId == null || scheduleId == null) return null;
      const contactsOps = await getWechatRoleDataOps();
      const entry = await contactsOps.schedules.get(scheduleId);
      if (!entry || entry.contactId !== currentContactId) return null;
      return entry;
    }

    async function migrateLegacyWechatThreads(contacts = []) {
      if (window.__miniWechatLegacyThreadMigrationDone) return;
      if (!window.localStorage) {
        window.__miniWechatLegacyThreadMigrationDone = true;
        return;
      }
      let parsed = null;
      try {
        const raw = window.localStorage.getItem(wechatLegacyThreadStorageKey);
        parsed = raw ? JSON.parse(raw) : null;
      } catch (error) {
        parsed = null;
      }
      if (!parsed || typeof parsed !== 'object') {
        window.__miniWechatLegacyThreadMigrationDone = true;
        return;
      }
      const byId = new Map();
      const byAccount = new Map();
      (contacts || []).forEach((contact) => {
        if (!contact || contact.id == null) return;
        byId.set(`contact:${contact.id}`, contact);
        if (contact.account) byAccount.set(`account:${contact.account}`, contact);
      });
      for (const [legacyKey, value] of Object.entries(parsed)) {
        const contact = byId.get(legacyKey) || byAccount.get(legacyKey) || null;
        const currentContactId = getWechatCurrentContactId(contact);
        if (currentContactId == null || !Array.isArray(value)) continue;
        const existing = await loadMessages(currentContactId, { limit: 1 });
        if (existing.length) continue;
        const normalizedEntries = value.map((entry) => normalizeWechatThreadEntry(entry, { chatId: currentContactId })).filter(Boolean);
        for (const entry of normalizedEntries) {
          await saveMessage(currentContactId, entry);
        }
      }
      try {
        window.localStorage.removeItem(wechatLegacyThreadStorageKey);
      } catch (error) {}
      window.__miniWechatLegacyThreadMigrationDone = true;
    }

    function getCurrentWechatContacts() {
      return Array.isArray(window.__miniWechatContacts) ? window.__miniWechatContacts : [];
    }

    function getWechatAllContacts() {
      return Array.isArray(window.__miniWechatAllContacts) ? window.__miniWechatAllContacts : getCurrentWechatContacts();
    }

    function findWechatContactByKey(contactKey, contacts = getWechatAllContacts()) {
      const safeKey = sanitizeWechatText(contactKey);
      if (!safeKey) return null;
      return (contacts || []).find((contact, index) => getWechatContactKey(contact, index) === safeKey) || null;
    }

    async function reconcileWechatThreadListStateForContacts(contacts = []) {
      const allowedKeys = new Set((contacts || []).map((contact, index) => getWechatContactKey(contact, index)).filter(Boolean));
      const current = await loadWechatThreadListState();
      const next = normalizeWechatThreadListState(current, allowedKeys);
      const knownKeys = new Set(next.knownKeys);
      const newlySeenKeys = [];
      allowedKeys.forEach((key) => {
        if (!knownKeys.has(key)) newlySeenKeys.push(key);
      });
      if (newlySeenKeys.length) {
        const hiddenKeys = new Set(next.hiddenKeys);
        const historyChecks = await Promise.all(newlySeenKeys.map(async (key) => {
          const contact = findWechatContactByKey(key, contacts);
          const currentContactId = getWechatCurrentContactId(contact);
          if (currentContactId == null) return { key, hasHistory: false };
          const messages = await loadMessages(currentContactId, { limit: 1 }).catch(() => []);
          return { key, hasHistory: Array.isArray(messages) && messages.length > 0 };
        }));
        historyChecks.forEach(({ key, hasHistory }) => {
          if (!hasHistory) hiddenKeys.add(key);
        });
        next.hiddenKeys = Array.from(hiddenKeys);
        next.knownKeys = next.knownKeys.concat(newlySeenKeys);
      }
      if (!areWechatThreadListsEqual(current, next)) {
        window.__miniWechatThreadListState = next;
        await persistWechatThreadListState();
      }
      return getWechatThreadListStateSync();
    }

    function buildVisibleWechatContacts(contacts = [], threadState = getWechatThreadListStateSync()) {
      const hidden = new Set(threadState.hiddenKeys);
      const pinnedOrder = new Map(threadState.pinnedKeys.map((key, index) => [key, index]));
      return (contacts || [])
        .filter((contact, index) => !hidden.has(getWechatContactKey(contact, index)))
        .slice()
        .sort((left, right) => {
          const leftKey = getWechatContactKey(left);
          const rightKey = getWechatContactKey(right);
          const leftPinned = pinnedOrder.has(leftKey);
          const rightPinned = pinnedOrder.has(rightKey);
          if (leftPinned !== rightPinned) return leftPinned ? -1 : 1;
          if (leftPinned && rightPinned) return pinnedOrder.get(leftKey) - pinnedOrder.get(rightKey);
          return 0;
        });
    }

    function isWechatThreadPinned(contact, index = 0) {
      return getWechatThreadListStateSync().pinnedKeys.includes(getWechatContactKey(contact, index));
    }

    function getCurrentWechatSelection() {
      const contacts = getCurrentWechatContacts();
      const index = Number(window.__miniCurrentWechatContactIndex);
      if (!Number.isInteger(index) || index < 0) return { contact: null, index: -1 };
      return { contact: contacts[index] || null, index };
    }

    function getWechatDefaultTitle(contact) {
      return contact && contact.account ? `@${contact.account}` : '@\u672a\u9009\u62e9\u8054\u7cfb\u4eba';
    }

    function getWechatTypingMap() {
      if (!window.__miniWechatTypingMap) window.__miniWechatTypingMap = {};
      return window.__miniWechatTypingMap;
    }

    function isCurrentWechatSelection(contact, index) {
      const current = getCurrentWechatSelection();
      if (!current.contact) return false;
      return getWechatContactKey(current.contact, current.index) === getWechatContactKey(contact, index);
    }

    function isWechatTypingActiveFor(contact, index) {
      if (!contact) return false;
      return !!getWechatTypingMap()[getWechatContactKey(contact, index)];
    }

    function setWechatHeaderTitle(text) {
      const title = document.getElementById('header-title-btn');
      if (title) title.textContent = text;
    }

    function beginWechatTyping(contact, index) {
      if (!contact) return '';
      const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      getWechatTypingMap()[getWechatContactKey(contact, index)] = token;
      if (isCurrentWechatSelection(contact, index)) setWechatHeaderTitle('\u5bf9\u65b9\u6b63\u5728\u8f93\u5165...');
      return token;
    }

    function endWechatTyping(contact, index, token) {
      if (!contact) return;
      const key = getWechatContactKey(contact, index);
      const typingMap = getWechatTypingMap();
      if (typingMap[key] !== token) return;
      delete typingMap[key];
      if (isCurrentWechatSelection(contact, index)) setWechatHeaderTitle(getWechatDefaultTitle(contact));
    }

    function scrollWechatThreadToBottom() {
      const scroll = document.getElementById('chat-scroll');
      if (scroll) scroll.scrollTop = scroll.scrollHeight;
    }

    function formatWechatPreviewTime(timestamp) {
      return formatWechatHumanTime(timestamp);
    }

    async function getWechatThreadPreview(currentContactId, contact) {
      const thread = await loadMessages(currentContactId, { limit: 1 });
      const last = thread[thread.length - 1];
      const previewText = last ? getWechatMessageCompactPreviewText(last) : '';
      if (last && previewText) {
        return {
          text: previewText,
          time: formatWechatPreviewTime(last.timestamp)
        };
      }
      return {
        text: contact ? (contact.signature || contact.lore || '\u70b9\u51fb\u5f00\u59cb\u804a\u5929') : '',
        time: ''
      };
    }

    async function refreshWechatListPreview(index) {
      const list = document.querySelector('#page-messages .chat-list');
      const contacts = getCurrentWechatContacts();
      const contact = contacts[index] || null;
      if (!list || !contact) return;
      const currentContactId = getWechatCurrentContactId(contact);
      if (currentContactId == null) return;
      const rows = list.querySelectorAll('.chat-item');
      const row = rows[index];
      if (!row) return;
      const preview = await getWechatThreadPreview(currentContactId, contact);
      const time = row.querySelector('.chat-time');
      const msg = row.querySelector('.chat-msg');
      if (time) time.textContent = preview.time;
      if (msg) msg.textContent = preview.text;
    }

    async function appendWechatThreadEntryToUi(currentContactId, contact, index, entry) {
      if (!entry || !isCurrentWechatSelection(contact, index)) return;
      const messages = document.querySelector('#chat-scroll .chat-messages');
      if (!messages) return;
      if (messages.querySelector('.mini-chat-empty')) await renderWechatThread(currentContactId, contact, index);
      else appendChatBubble(messages, entry, index, getLastRenderedWechatTimestamp(messages));
      scrollWechatThreadToBottom();
    }

    function compactWechatApiMessages(messages) {
      const compacted = [];
      (messages || []).forEach((message) => {
        const role = message && message.role === 'assistant' ? 'assistant' : 'user';
        const content = String(message && message.content != null ? message.content : '').trim();
        if (!content) return;
        const previous = compacted[compacted.length - 1];
        if (previous && previous.role === role) previous.content = `${previous.content}\n${content}`;
        else compacted.push({ role, content });
      });
      return compacted;
    }

    function parseWechatAssocId(rawValue, prefix) {
      const raw = String(rawValue || '').trim();
      const expected = `${prefix}:`;
      if (!raw.startsWith(expected)) return null;
      return raw.slice(expected.length).trim() || null;
    }

    function parseWechatAssocIds(rawValue, prefix) {
      const raw = String(rawValue || '').trim();
      if (!raw || /^none$/i.test(raw)) return [];
      const expected = `${prefix}:`;
      return [...new Set(
        raw
          .split(/[|,\n]/)
          .map((item) => String(item || '').trim())
          .filter((item) => item.startsWith(expected))
          .map((item) => item.slice(expected.length).trim())
          .filter(Boolean)
      )];
    }

    async function loadWechatUserPreset(contact, miniDb) {
      const presetId = parseWechatAssocId(contact && contact.presetAssoc, 'mask');
      const ops = miniDb && miniDb.ops;
      if (!presetId || !ops || !ops.masks || typeof ops.masks.getMask !== 'function') return null;
      try {
        return await ops.masks.getMask(Number.isNaN(Number(presetId)) ? presetId : Number(presetId));
      } catch (error) {
        return null;
      }
    }

    async function loadWechatWorldbook(contact, miniDb) {
      const worldbookIds = parseWechatAssocIds(contact && contact.worldbookAssoc, 'worldbook');
      const ops = miniDb && miniDb.ops;
      if (!worldbookIds.length || !ops || !ops.worldbook) return [];
      try {
        const groups = await Promise.all(worldbookIds.map(async (worldbookId) => {
          const id = Number.isNaN(Number(worldbookId)) ? worldbookId : Number(worldbookId);
          const group = ops.worldbook.groups && typeof ops.worldbook.groups.get === 'function'
            ? await ops.worldbook.groups.get(id)
            : null;
          const entries = typeof ops.worldbook.listEntries === 'function'
            ? await ops.worldbook.listEntries(id)
            : [];
          return {
            id,
            name: group && group.name ? group.name : `Worldbook ${worldbookId}`,
            entries: Array.isArray(entries) ? entries.map((entry) => ({
              title: entry.title || '',
              category: entry.category || '',
              triggerType: entry.triggerType || '',
              keywords: entry.keywords || '',
              position: entry.position || '',
              content: entry.content || ''
            })) : []
          };
        }));
        return groups.filter(Boolean);
      } catch (error) {
        return [];
      }
    }

    async function loadWechatStickerCatalog(miniDb) {
      const wechatOps = miniDb && miniDb.ops && miniDb.ops.wechat;
      if (!wechatOps || !wechatOps.stickers || !wechatOps.stickerGroups) return [];
      try {
        const [groups, stickers] = await Promise.all([
          Promise.resolve(wechatOps.stickerGroups.list()).catch(() => []),
          Promise.resolve(wechatOps.stickers.list()).catch(() => [])
        ]);
        const groupMap = new Map((groups || []).map((group) => [String(group.id), group]));
        return (stickers || [])
          .map((sticker) => {
            if (!sticker || sticker.id == null) return null;
            const description = sanitizeWechatText(sticker.description);
            const dataUrl = sanitizeWechatText(sticker.url);
            if (!description || !dataUrl) return null;
            const group = groupMap.get(String(sticker.groupId)) || null;
            return {
              assetId: String(sticker.id),
              packId: sanitizeWechatText(sticker.groupId),
              packName: sanitizeWechatText(group && group.name) || 'Default',
              description,
              dataUrl
            };
          })
          .filter(Boolean)
          .sort((left, right) => {
            const leftPack = sanitizeWechatText(left && left.packName);
            const rightPack = sanitizeWechatText(right && right.packName);
            if (leftPack !== rightPack) return leftPack.localeCompare(rightPack, 'zh-CN');
            return Number(left && left.assetId) - Number(right && right.assetId);
          });
      } catch (error) {
        return [];
      }
    }

    function buildWechatRoleReplyPolicy(contact, config = {}, stickerCatalog = []) {
      const language = buildWechatLanguagePolicy(contact && contact.language);
      const settings = getWechatContactSettings(contact);
      const temperatureValue = Number.parseFloat(config && config.temperature);
      const safeTemperature = Number.isFinite(temperatureValue) ? temperatureValue : 0.7;
      const candidates = ['photo', 'voice', 'location'];
      if (stickerCatalog.length) candidates.push('sticker');
      const triggerRoll = Math.random();
      let allowedType = 'none';
      if (candidates.length && triggerRoll < wechatRoleReplySpecialProbability) {
        const pickRoll = Math.random();
        allowedType = candidates[Math.min(candidates.length - 1, Math.floor(pickRoll * candidates.length))] || 'none';
      }
      return {
        language,
        temperature: safeTemperature,
        messageCount: {
          min: settings.replyCountMin,
          max: settings.replyCountMax
        },
        specialMessage: {
          probability: wechatRoleReplySpecialProbability,
          triggerRoll,
          allowedType,
          maxCount: allowedType === 'none' ? 0 : 1
        },
        automation: {
          autoReply: !!settings.autoReply,
          timeAwareness: !!settings.timeAwareness,
          weatherEnabled: !!settings.weatherEnabled,
          patEnabled: !!settings.patEnabled
        },
        stickerCatalog: Array.isArray(stickerCatalog) ? stickerCatalog : [],
        promptStickerCatalog: (Array.isArray(stickerCatalog) ? stickerCatalog : [])
          .slice(0, wechatRolePromptStickerLimit)
          .map((item) => ({
            assetId: item.assetId,
            packId: item.packId,
            packName: item.packName,
            description: item.description
          }))
      };
    }

    function buildWechatPromptMessages(entries, userLabel, contactLabel) {
      return (entries || []).map((entry) => {
        const message = normalizeWechatThreadEntry(entry, { chatId: entry && entry.chatId });
        if (!message) return null;
        return {
          speaker: getWechatMessageDirection(message) === 'sent' ? userLabel : contactLabel,
          role: getWechatMessageDirection(message) === 'sent' ? 'user' : 'assistant',
          timestamp: Number(message.timestamp) || Date.now(),
          messageId: message.messageId,
          type: message.type,
          preview: getWechatMessagePreviewText(message),
          data: serializeWechatMessagePayloadForPrompt(message)
        };
      }).filter(Boolean);
    }

    /*
    function splitWechatReplyText(text, targetCount = 3) {
      const source = String(text || '').replace(/\r/g, '').trim();
      if (!source) return [];
      const fromLines = source.split(/\n+/).map((part) => part.trim()).filter(Boolean);
      const fromSentences = fromLines.flatMap((line) => (line.match(/[^銆傦紒锛??鈥︼紱;]+[銆傦紒锛??鈥︼紱;]?/g) || [line]).map((part) => part.trim()));
      const pool = fromSentences
        .flatMap((part) => {
          if (!part) return [];
          if (part.length <= 24) return [part];
          return part.split(/(?<=锛寍,|銆?/).map((chunk) => chunk.trim()).filter(Boolean);
        })
        .filter(Boolean);
      if (!pool.length) return [];
      const result = [];
      pool.forEach((part) => {
        if (!result.length) {
          result.push(part);
          return;
        }
        const lastIndex = result.length - 1;
        if (result.length < targetCount || result[lastIndex].length >= 26) result.push(part);
        else result[lastIndex] = `${result[lastIndex]}${/^[锛屻€傘€??锛侊紵]/.test(part) ? '' : ' '}${part}`.trim();
      });
      return result.slice(0, 6).filter(Boolean);
    }

    */

    function splitWechatReplyText(text, targetCount = 3) {
      const source = String(text || '').replace(/\r/g, '').trim();
      if (!source) return [];
      const fromLines = source.split(/\n+/).map((part) => part.trim()).filter(Boolean);
      const sentenceMatcher = /[^\u3002\uFF01\uFF1F!?鈥︼紱;]+[\u3002\uFF01\uFF1F!?鈥︼紱;]?/g;
      const fromSentences = fromLines.flatMap((line) => (line.match(sentenceMatcher) || [line]).map((part) => part.trim()));
      const pool = fromSentences
        .flatMap((part) => {
          if (!part) return [];
          if (part.length <= 24) return [part];
          return part.split(/(?<=[\uFF0C,\u3001])/).map((chunk) => chunk.trim()).filter(Boolean);
        })
        .filter(Boolean);
      if (!pool.length) return [];
      const result = [];
      pool.forEach((part) => {
        if (!result.length) {
          result.push(part);
          return;
        }
        const lastIndex = result.length - 1;
        if (result.length < targetCount || result[lastIndex].length >= 26) result.push(part);
        else result[lastIndex] = `${result[lastIndex]}${/^[\uFF0C\u3002\u3001!?锛侊紵]/.test(part) ? '' : ' '}${part}`.trim();
      });
      return result.slice(0, 6).filter(Boolean);
    }

    function serializeWechatMessagePayloadForPrompt(entry) {
      const message = entry && entry.payload ? entry : normalizeWechatThreadEntry(entry, { chatId: entry && entry.chatId });
      if (!message) return {};
      const payload = message.payload || {};
      if (message.type === 'text') {
        const translation = getWechatTranslationDisplayParts(payload.content);
        return translation.hasTranslation
          ? { content: translation.sourceText, translation: translation.translatedText }
          : { content: translation.sourceText || translation.translatedText };
      }
      if (message.type === 'quote') {
        return {
          content: getWechatLocalizedContentText(payload.content),
          quoteMessageId: sanitizeWechatText(payload.quote && payload.quote.messageId),
          quotePreview: payload.quote ? getWechatMessagePreviewText(payload.quote) : ''
        };
      }
      if (message.type === 'recall') {
        return {
          operator: sanitizeWechatText(payload.operator),
          targetMessageId: sanitizeWechatText(payload.targetMessageId),
          targetMessageType: sanitizeWechatText(payload.targetMessageType),
          snapshotPreview: payload.snapshot ? getWechatMessagePreviewText(payload.snapshot) : ''
        };
      }
      if (message.type === 'pat') {
        return {
          text: sanitizeWechatText(payload.text),
          actor: sanitizeWechatText(payload.actor)
        };
      }
      if (message.type === 'sticker') return { description: getWechatLocalizedContentText(payload.description) };
      if (message.type === 'voice') {
        return {
          transcript: getWechatLocalizedContentText(payload.transcript),
          durationSec: Math.max(0, Number(payload.durationSec) || 0)
        };
      }
      if (message.type === 'photo' || message.type === 'image') return { description: getWechatLocalizedContentText(payload.description) };
      if (message.type === 'location') {
        return {
          name: getWechatLocalizedContentText(payload.name),
          address: getWechatLocalizedContentText(payload.address),
          lat: Number(payload.lat) || 0,
          lng: Number(payload.lng) || 0
        };
      }
      if (message.type === 'transfer') {
        return {
          amount: Number(payload.amount) || 0,
          currency: sanitizeWechatText(payload.currency) || 'CNY',
          note: getWechatLocalizedContentText(payload.note),
          status: sanitizeWechatText(payload.status)
        };
      }
      if (message.type === 'red_packet') {
        return {
          amount: Number(payload.amount) || 0,
          currency: sanitizeWechatText(payload.currency) || 'CNY',
          greeting: getWechatLocalizedContentText(payload.greeting),
          status: sanitizeWechatText(payload.status)
        };
      }
      if (message.type === 'gift') {
        return {
          title: getWechatLocalizedContentText(payload.title),
          count: Math.max(1, Number(payload.count) || 1),
          note: getWechatLocalizedContentText(payload.note),
          status: sanitizeWechatText(payload.status)
        };
      }
      if (message.type === 'takeout') {
        return {
          merchant: getWechatLocalizedContentText(payload.merchant),
          items: Array.isArray(payload.items) ? payload.items.map((item) => getWechatLocalizedContentText(item)).filter(Boolean) : [],
          amount: Number(payload.amount) || 0,
          currency: sanitizeWechatText(payload.currency) || 'CNY',
          etaMinutes: Math.max(0, Number(payload.etaMinutes) || 0),
          note: getWechatLocalizedContentText(payload.note),
          status: sanitizeWechatText(payload.status)
        };
      }
      if (message.type === 'call' || message.type === 'video') {
        return {
          status: sanitizeWechatText(payload.status),
          durationSec: Math.max(0, Number(payload.durationSec) || 0)
        };
      }
      return {};
    }

    function normalizeWechatReplyObject(item) {
      if (typeof item === 'string') {
        const content = sanitizeWechatText(item);
        return content ? { type: 'text', content } : null;
      }
      if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
      const type = getWechatExplicitMessageType(item);
      if (!type) return null;
      if (type === 'text') {
        const content = pickWechatReplyLocalizedValue([
          item.content,
          item.message,
          item.text
        ]);
        return content ? { type: 'text', content } : null;
      }
      if (type === 'quote') {
        const quoteSource = item.quote && typeof item.quote === 'object' ? item.quote : {};
        const content = pickWechatReplyLocalizedValue([
          item.content,
          item.message,
          item.text,
          item.reply
        ]);
        const quoteMessageId = sanitizeWechatText(item.quoteMessageId || item.replyToMessageId || quoteSource.messageId || quoteSource.id);
        const quotePreview = sanitizeWechatText(item.quotePreview || quoteSource.preview || quoteSource.content || quoteSource.text);
        const quoteType = sanitizeWechatText(item.quoteType || quoteSource.type || 'text').toLowerCase();
        if (!content && !quoteMessageId && !quotePreview) return null;
        return {
          type: 'quote',
          content: content || quotePreview || '...',
          quoteMessageId,
          quotePreview,
          quoteType: wechatMessageTypes.has(quoteType) ? quoteType : 'text'
        };
      }
      if (type === 'recall') {
        const targetMessageId = sanitizeWechatText(item.targetMessageId || item.messageId || item.recallMessageId);
        const snapshotPreview = sanitizeWechatText(item.snapshotPreview || item.preview || item.snapshotText || item.content || item.text);
        if (!targetMessageId && !snapshotPreview) return null;
        const targetMessageType = sanitizeWechatText(item.targetMessageType || item.messageType || 'text').toLowerCase();
        return {
          type: 'recall',
          operator: sanitizeWechatText(item.operator).toLowerCase() === 'other' ? 'other' : 'self',
          targetMessageId,
          targetMessageType: wechatMessageTypes.has(targetMessageType) ? targetMessageType : 'text',
          snapshotPreview
        };
      }
      if (type === 'sticker') {
        const description = pickWechatReplyLocalizedValue([
          item.description,
          item.content,
          item.text
        ]);
        return description ? {
          type: 'sticker',
          assetId: sanitizeWechatText(item.assetId || item.stickerId),
          packId: sanitizeWechatText(item.packId || item.groupId),
          description
        } : null;
      }
      if (type === 'voice') {
        const transcript = pickWechatReplyLocalizedValue([
          item.transcript,
          item.content,
          item.text
        ]);
        const durationSec = Math.max(1, Number(item.durationSec) || 0);
        if (!transcript) return null;
        return { type: 'voice', transcript, durationSec: durationSec || 3 };
      }
      if (type === 'photo' || type === 'image') {
        const description = pickWechatReplyLocalizedValue([
          item.description,
          item.content,
          item.text
        ]);
        return description ? { type, description } : null;
      }
      if (type === 'location') {
        const name = pickWechatReplyLocalizedValue([
          item.name,
          item.title,
          item.content,
          item.text
        ]);
        const address = pickWechatReplyLocalizedValue([item.address]);
        if (!name && !address) return null;
        return {
          type: 'location',
          name: name || address,
          address,
          distanceMeters: Math.max(0, Number(item.distanceMeters) || 0),
          lat: Number(item.lat) || 0,
          lng: Number(item.lng) || 0
        };
      }
      if (type === 'transfer') {
        return {
          type: 'transfer',
          amount: Number(item.amount) || 0,
          currency: sanitizeWechatText(item.currency) || 'CNY',
          note: sanitizeWechatText(item.note || item.content || item.text),
          status: sanitizeWechatText(item.status) || 'pending'
        };
      }
      if (type === 'red_packet') {
        return {
          type: 'red_packet',
          amount: Number(item.amount) || 0,
          currency: sanitizeWechatText(item.currency) || 'CNY',
          greeting: sanitizeWechatText(item.greeting || item.content || item.text),
          status: sanitizeWechatText(item.status) || 'unopened'
        };
      }
      if (type === 'gift') {
        const title = sanitizeWechatText(item.title || item.content || item.text);
        return title ? {
          type: 'gift',
          title,
          count: Math.max(1, Number(item.count) || 1),
          note: sanitizeWechatText(item.note),
          status: sanitizeWechatText(item.status) || 'received'
        } : null;
      }
      if (type === 'takeout') {
        const merchant = sanitizeWechatText(item.merchant || item.title || item.content || item.text);
        const items = Array.isArray(item.items) ? item.items.map((entry) => sanitizeWechatText(entry)).filter(Boolean) : [];
        if (!merchant && !items.length) return null;
        return {
          type: 'takeout',
          merchant: merchant || 'Takeout',
          items,
          amount: Number(item.amount) || 0,
          currency: sanitizeWechatText(item.currency) || 'CNY',
          etaMinutes: Math.max(0, Number(item.etaMinutes) || 0),
          note: sanitizeWechatText(item.note),
          status: sanitizeWechatText(item.status) || 'placed'
        };
      }
      if (type === 'call' || type === 'video') {
        return {
          type,
          status: sanitizeWechatText(item.status || item.content || item.text) || 'missed',
          durationSec: Math.max(0, Number(item.durationSec) || 0)
        };
      }
      return null;
    }

    function normalizeWechatThoughtObject(item) {
      if (!item || typeof item !== 'object') return null;
      const content = sanitizeWechatText(item.content || item.text || item.innerVoice);
      if (!content) return null;
      const tags = Array.isArray(item.tags) ? item.tags.map((tag) => sanitizeWechatText(tag)).filter(Boolean) : [];
      return {
        content: normalizeWechatShortText(content, '', 25),
        summary: normalizeWechatShortText(sanitizeWechatText(item.summary) || content, '', 25),
        mood: sanitizeWechatText(item.mood),
        focus: sanitizeWechatText(item.focus),
        mbti: normalizeWechatMbti(item.mbti || tags[0]),
        trait: normalizeWechatPersonaTagText(item.trait || item.personality || tags[1]),
        specialTag: normalizeWechatPersonaTagText(item.specialTag || item.label || tags[2]),
        probability: normalizeWechatProbability(item.probability, 0.5),
        restraint: normalizeWechatPercent(item.restraint, 70),
        tension: normalizeWechatPercent(item.tension, 50),
        closeness: normalizeWechatPercent(item.closeness, 30)
      };
    }

    function normalizeWechatDiaryContent(value, fallback = '') {
      const source = sanitizeWechatText(value) || sanitizeWechatText(fallback);
      if (!source) return '';
      if (source.length <= 800) return source;
      const slice = source.slice(0, 800);
      for (let index = slice.length - 1; index >= 499; index -= 1) {
        if ('銆傦紒锛??'.includes(slice[index])) return slice.slice(0, index + 1).trim();
      }
      return slice.trim();
    }

    function normalizeWechatDiaryObject(item) {
      if (!item || typeof item !== 'object') return null;
      const title = sanitizeWechatText(item.title || item.headline);
      const content = sanitizeWechatText(item.content || item.text || item.body);
      if (!title && !content) return null;
      const fallbackTitle = '\u672a\u547d\u540d\u6761\u76ee';
      const preview = sanitizeWechatText(item.preview || item.summary) || content || title || fallbackTitle;
      return {
        title: title || fallbackTitle,
        preview,
        content: normalizeWechatDiaryContentSafe(content, preview),
        location: sanitizeWechatText(item.location),
        mood: sanitizeWechatText(item.mood),
        tags: Array.isArray(item.tags) ? item.tags.map((tag) => sanitizeWechatText(tag)).filter(Boolean).slice(0, 4) : [],
        probability: normalizeWechatProbability(item.probability, 0.5),
        writtenAt: item.writtenAt || Date.now()
      };
    }

    function normalizeWechatStateObject(item) {
      if (!item || typeof item !== 'object') return null;
      const summary = sanitizeWechatText(item.darkSide || item.summary || item.content || item.phase);
      if (!summary) return null;
      return {
        summary: normalizeWechatShortText(summary, '', 25),
        phase: sanitizeWechatText(item.phase),
        mood: sanitizeWechatText(item.mood),
        restraint: normalizeWechatPercent(item.restraint, 70),
        tension: normalizeWechatPercent(item.tension, 50),
        closeness: normalizeWechatPercent(item.closeness, 30),
        volatility: normalizeWechatPercent(item.volatility, 20)
      };
    }

    function normalizeWechatMemoryObject(item) {
      if (!item || typeof item !== 'object') return null;
      const content = sanitizeWechatText(item.content || item.memory || item.text);
      if (!content) return null;
      return {
        title: sanitizeWechatText(item.title),
        content,
        summary: sanitizeWechatText(item.summary) || content,
        kind: sanitizeWechatText(item.kind) || 'long_term',
        importance: normalizeWechatProbability(item.importance, 0.5),
        source: 'assistant'
      };
    }

    function normalizeWechatReplyList(items, cleaned) {
      let normalized = Array.isArray(items)
        ? items.map((item) => normalizeWechatReplyObject(item)).filter(Boolean)
        : [];
      if (!normalized.length && cleaned) {
        normalized = splitWechatReplyText(cleaned, 4).map((content) => ({ type: 'text', content }));
      }
      const hasStructured = normalized.some((item) => item && item.type && item.type !== 'text');
      if (normalized.length < 3 && !hasStructured) {
        const repaired = splitWechatReplyText(normalized.map((item) => item.content).join('\n') || cleaned, 4);
        if (repaired.length >= normalized.length) normalized = repaired.map((content) => ({ type: 'text', content }));
      }
      return normalized.slice(0, 6);
    }

    function buildWechatReplyTextFallback(reply) {
      if (!reply || typeof reply !== 'object') return '';
      if (reply.type === 'text') return getWechatLocalizedContentText(reply.content);
      if (reply.type === 'quote') return getWechatLocalizedContentText(reply.content) || sanitizeWechatText(reply.quotePreview);
      if (reply.type === 'sticker') return getWechatLocalizedContentText(reply.description, '[表情]');
      if (reply.type === 'voice') return getWechatLocalizedContentText(reply.transcript, '[语音]');
      if (reply.type === 'photo' || reply.type === 'image') return getWechatLocalizedContentText(reply.description, '[照片]');
      if (reply.type === 'location') {
        return [
          getWechatLocalizedContentText(reply.name),
          getWechatLocalizedContentText(reply.address)
        ].filter(Boolean).join(' ');
      }
      if (reply.type === 'transfer') return getWechatLocalizedContentText(reply.note) || formatWechatMessageAmount(reply.amount, reply.currency);
      if (reply.type === 'red_packet') return getWechatLocalizedContentText(reply.greeting) || formatWechatMessageAmount(reply.amount, reply.currency);
      if (reply.type === 'gift') return getWechatLocalizedContentText(reply.title) || getWechatLocalizedContentText(reply.note);
      if (reply.type === 'takeout') return getWechatLocalizedContentText(reply.merchant);
      if (reply.type === 'call' || reply.type === 'video') return sanitizeWechatText(reply.status);
      return '';
    }

    function buildWechatReplyTextMessage(reply, fallback = '') {
      const content = pickWechatReplyLocalizedValue([
        reply && reply.content,
        reply && reply.description,
        reply && reply.transcript,
        reply && reply.name,
        reply && reply.note,
        reply && reply.greeting,
        reply && reply.title
      ], fallback || buildWechatReplyTextFallback(reply) || '...');
      if (!content) return null;
      return {
        type: 'text',
        content
      };
    }

    function resolveWechatStickerCatalogItem(reply, replyPolicy) {
      const catalog = replyPolicy && Array.isArray(replyPolicy.stickerCatalog) ? replyPolicy.stickerCatalog : [];
      if (!catalog.length) return null;
      const wantedAssetId = sanitizeWechatText(reply && (reply.assetId || reply.stickerId));
      const wantedPackId = sanitizeWechatText(reply && reply.packId);
      const wantedDescription = sanitizeWechatText(getWechatLocalizedContentText(reply && reply.description)).toLowerCase();
      if (wantedAssetId) {
        const byId = catalog.find((item) =>
          sanitizeWechatText(item && item.assetId) === wantedAssetId
          && (!wantedPackId || sanitizeWechatText(item && item.packId) === wantedPackId)
        );
        if (byId) return byId;
      }
      if (wantedDescription) {
        return catalog.find((item) =>
          sanitizeWechatText(item && item.description).toLowerCase() === wantedDescription
          && (!wantedPackId || sanitizeWechatText(item && item.packId) === wantedPackId)
        ) || null;
      }
      return null;
    }

    function getWechatReplyLocalizedFieldRefs(reply) {
      if (!reply || typeof reply !== 'object') return [];
      const refs = [];
      const pushField = (getter, setter) => refs.push({ get: getter, set: setter });
      if (reply.type === 'text' || reply.type === 'quote') {
        pushField(() => reply.content, (value) => { reply.content = value; });
      }
      if (reply.type === 'sticker') {
        pushField(() => reply.description, (value) => { reply.description = value; });
      }
      if (reply.type === 'voice') {
        pushField(() => reply.transcript, (value) => { reply.transcript = value; });
      }
      if (reply.type === 'photo' || reply.type === 'image') {
        pushField(() => reply.description, (value) => { reply.description = value; });
      }
      if (reply.type === 'location') {
        pushField(() => reply.name, (value) => { reply.name = value; });
        pushField(() => reply.address, (value) => { reply.address = value; });
      }
      return refs;
    }

    function shouldWechatTranslateReplyField(raw, zh, languagePolicy) {
      if (!languagePolicy || !languagePolicy.requiresTranslation) return false;
      const source = sanitizeWechatText(raw);
      const translated = sanitizeWechatText(zh);
      if (!source) return false;
      if (!translated) return true;
      return source === translated;
    }

    async function requestWechatTranslationBatch(config, languagePolicy, items = []) {
      if (!Array.isArray(items) || !items.length) return new Map();
      const systemPrompt = [
        '你是一个只做多语言修复的助手。',
        '',
        '[Task]',
        `- 把每条输入修复成「${sanitizeWechatText(languagePolicy && languagePolicy.label) || '目标语言'}原文 raw + 简体中文翻译 zh」的成对结果。`,
        '- 如果输入已经是目标语言，只做最小修复并保留语气、停顿、人称和暧昧感。',
        '- 如果输入不是目标语言，先改写成目标语言 raw，再给出简体中文 zh。',
        '- 只输出裸 JSON 对象，格式必须是 {"items":[{"id":"原样返回","raw":"目标语言原文","zh":"中文翻译"}]}。',
        '- 不要丢失任何 id，不要新增任何字段。'
      ].join('\n');
      const translationResponse = await requestWechatChatCompletion({
        ...(config || {}),
        temperature: 0.2
      }, systemPrompt, [{
        role: 'user',
        content: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            text: item.text
          }))
        }, null, 2)
      }]);
      const cleaned = String((translationResponse && translationResponse.text) || '')
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();
      const parsed = tryParseWechatJson(cleaned);
      const rows = Array.isArray(parsed)
        ? parsed
        : (parsed && Array.isArray(parsed.items) ? parsed.items : []);
      const translations = new Map();
      rows.forEach((item) => {
        const id = sanitizeWechatText(item && item.id);
        const raw = sanitizeWechatText(item && item.raw);
        const zh = sanitizeWechatText(item && (item.zh || item.translation || item.text));
        if (id && (raw || zh)) translations.set(id, { raw, zh });
      });
      return translations;
    }

    async function ensureWechatReplyTranslations(config, replyPolicy, messages = []) {
      const languagePolicy = replyPolicy && replyPolicy.language;
      if (!languagePolicy || !languagePolicy.requiresTranslation || !Array.isArray(messages) || !messages.length) return messages;
      const records = [];
      messages.forEach((reply, replyIndex) => {
        getWechatReplyLocalizedFieldRefs(reply).forEach((field, fieldIndex) => {
          const current = normalizeWechatLocalizedContent(field.get());
          const raw = sanitizeWechatText(current.raw);
          const zh = sanitizeWechatText(current.zh);
          if (!raw) return;
          records.push({
            id: `reply_${replyIndex}_${fieldIndex}`,
            field,
            raw,
            zh,
            needsTranslation: shouldWechatTranslateReplyField(raw, zh, languagePolicy)
          });
        });
      });
      if (!records.length) return messages;
      let translations = new Map();
      const pending = records.filter((record) => record.needsTranslation).map((record) => ({
        id: record.id,
        text: record.raw
      }));
      if (pending.length) {
        try {
          translations = await requestWechatTranslationBatch(config, languagePolicy, pending);
        } catch (error) {
          console.warn('Repair WeChat reply translations failed', error);
        }
      }
      records.forEach((record) => {
        const repaired = record.needsTranslation ? translations.get(record.id) : null;
        const nextRaw = sanitizeWechatText(repaired && repaired.raw) || record.raw;
        const nextZh = sanitizeWechatText(repaired && repaired.zh) || record.zh || record.raw;
        record.field.set({
          raw: nextRaw,
          zh: nextZh,
          sourceLang: languagePolicy.sourceLang,
          targetLang: languagePolicy.targetLang
        });
      });
      return messages;
    }

    async function enforceWechatAiPayloadPolicy(payload, replyPolicy, config) {
      const minMessageCount = Math.max(1, Number(replyPolicy && replyPolicy.messageCount && replyPolicy.messageCount.min) || 1);
      const messageLimit = Math.max(1, Number(replyPolicy && replyPolicy.messageCount && replyPolicy.messageCount.max) || wechatRoleReplyMaxMessages);
      const allowedSpecialType = sanitizeWechatText(replyPolicy && replyPolicy.specialMessage && replyPolicy.specialMessage.allowedType).toLowerCase() || 'none';
      const specialLimit = Math.max(0, Number(replyPolicy && replyPolicy.specialMessage && replyPolicy.specialMessage.maxCount) || 0);
      const nextMessages = [];
      let specialCount = 0;

      for (const item of (payload && Array.isArray(payload.messages) ? payload.messages : [])) {
        let reply = normalizeWechatReplyObject(item);
        if (!reply) continue;

        if (reply.type === 'image') reply.type = 'photo';

        if (reply.type === 'sticker') {
          const sticker = resolveWechatStickerCatalogItem(reply, replyPolicy);
          if (!sticker) {
            reply = buildWechatReplyTextMessage(reply, getWechatLocalizedContentText(reply.description, '[表情]'));
          } else {
            reply = {
              ...reply,
              assetId: sticker.assetId,
              packId: sticker.packId,
              dataUrl: sticker.dataUrl,
              description: reply.description || sticker.description
            };
          }
        }

        const replyType = sanitizeWechatText(reply && reply.type).toLowerCase();
        const isRegular = replyType === 'text' || replyType === 'quote';
        const isSpecial = wechatRoleReplySpecialTypes.includes(replyType);
        if (!isRegular) {
          if (!isSpecial || replyType !== allowedSpecialType || specialCount >= specialLimit) {
            reply = buildWechatReplyTextMessage(reply);
          } else {
            specialCount += 1;
          }
        }

        if (!reply) continue;
        nextMessages.push(reply);
        if (nextMessages.length >= messageLimit) break;
      }

      if (!nextMessages.length) {
        const fallback = buildWechatReplyTextMessage({
          type: 'text',
          content: '...'
        });
        if (fallback) nextMessages.push(fallback);
      }

      if (nextMessages.length < minMessageCount) {
        const baseText = nextMessages
          .map((item) => buildWechatReplyTextFallback(item))
          .filter(Boolean)
          .join('\n');
        const repaired = splitWechatReplyText(baseText, minMessageCount)
          .slice(0, messageLimit)
          .map((content) => buildWechatReplyTextMessage({ type: 'text', content }, content))
          .filter(Boolean);
        if (repaired.length >= minMessageCount) {
          nextMessages.splice(0, nextMessages.length, ...repaired);
        }
      }

      await ensureWechatReplyTranslations(config, replyPolicy, nextMessages);

      return {
        ...(payload && typeof payload === 'object' ? payload : {}),
        messages: nextMessages.slice(0, messageLimit)
      };
    }

    function findWechatReplyReferenceMessage(referenceMessages, wantedId, currentContactId) {
      const targetId = sanitizeWechatText(wantedId);
      if (!targetId) return null;
      for (const entry of referenceMessages || []) {
        const message = entry && entry.payload ? entry : normalizeWechatThreadEntry(entry, { chatId: currentContactId });
        if (!message) continue;
        if (sanitizeWechatText(message.messageId) === targetId) return message;
        if (message.id != null && String(message.id) === targetId) return message;
      }
      return null;
    }

    function buildFallbackWechatReferenceMessage(preview, type, currentContactId, timestamp, direction = 'received') {
      const text = sanitizeWechatText(preview);
      if (!text || currentContactId == null) return null;
      const safeType = wechatMessageTypes.has(type) && type !== 'quote' && type !== 'recall' ? type : 'text';
      const seed = {
        chatId: currentContactId,
        direction,
        type: safeType,
        timestamp: Number(timestamp) || Date.now()
      };
      if (safeType === 'call' || safeType === 'video') seed.status = text;
      else seed.text = text;
      return normalizeWechatThreadEntry(seed, { chatId: currentContactId });
    }

    function buildWechatAiReplyEntry(reply, currentContactId, referenceMessages = [], timestamp = Date.now()) {
      if (currentContactId == null || !reply || typeof reply !== 'object') return null;
      const replyType = getWechatExplicitMessageType(reply);
      if (!replyType) return null;
      const safeTimestamp = Number(timestamp) || Date.now();
      const base = {
        chatId: currentContactId,
        direction: 'received',
        type: replyType,
        timestamp: safeTimestamp
      };
      if (base.type === 'text') {
        return normalizeWechatThreadEntry({
          ...base,
          content: normalizeWechatLocalizedContent(reply.content, reply.content)
        }, { chatId: currentContactId });
      }
      if (base.type === 'quote') {
        const quoted = findWechatReplyReferenceMessage(referenceMessages, reply.quoteMessageId, currentContactId)
          || buildFallbackWechatReferenceMessage(reply.quotePreview, reply.quoteType, currentContactId, safeTimestamp - 1, 'sent');
        if (!quoted) {
          return normalizeWechatThreadEntry({
            ...base,
            type: 'text',
            content: normalizeWechatLocalizedContent(reply.content, reply.content)
          }, { chatId: currentContactId });
        }
        return normalizeWechatThreadEntry({
          ...base,
          payload: {
            quote: cloneWechatMessageForPayload(quoted, { chatId: currentContactId }),
            content: normalizeWechatLocalizedContent(reply.content || reply.quotePreview, reply.content || reply.quotePreview)
          }
        }, { chatId: currentContactId });
      }
      if (base.type === 'recall') {
        const snapshot = findWechatReplyReferenceMessage(referenceMessages, reply.targetMessageId, currentContactId)
          || buildFallbackWechatReferenceMessage(reply.snapshotPreview, reply.targetMessageType, currentContactId, safeTimestamp - 1, reply.operator === 'self' ? 'sent' : 'received');
        return normalizeWechatThreadEntry({
          ...base,
          direction: reply.operator === 'self' ? 'sent' : 'received',
          payload: {
            operator: reply.operator === 'other' ? 'other' : 'self',
            targetMessageId: sanitizeWechatText(reply.targetMessageId || (snapshot && snapshot.messageId)),
            targetMessageType: sanitizeWechatText(reply.targetMessageType || (snapshot && snapshot.type) || 'text'),
            targetMessageTimestamp: Number(snapshot && snapshot.timestamp) || safeTimestamp,
            recalledAt: safeTimestamp,
            snapshot: snapshot ? cloneWechatMessageForPayload(snapshot, { chatId: currentContactId }) : null
          }
        }, { chatId: currentContactId });
      }
      if (base.type === 'sticker') {
        return normalizeWechatThreadEntry({
          ...base,
          payload: {
            libraryId: 'mini_sticker_picker',
            packId: sanitizeWechatText(reply.packId),
            assetId: sanitizeWechatText(reply.assetId || reply.stickerId),
            dataUrl: sanitizeWechatText(reply.dataUrl || reply.url),
            description: normalizeWechatLocalizedContent(reply.description, reply.description)
          }
        }, { chatId: currentContactId });
      }
      if (base.type === 'voice') {
        return normalizeWechatThreadEntry({
          ...base,
          durationSec: Math.max(1, Number(reply.durationSec) || 3),
          transcript: normalizeWechatLocalizedContent(reply.transcript, reply.transcript)
        }, { chatId: currentContactId });
      }
      if (base.type === 'photo' || base.type === 'image') {
        return normalizeWechatThreadEntry({
          ...base,
          assetId: sanitizeWechatText(reply.assetId) || 'photo_asset',
          origin: sanitizeWechatText(reply.origin) || 'camera_generated',
          description: normalizeWechatLocalizedContent(reply.description, reply.description)
        }, { chatId: currentContactId });
      }
      if (base.type === 'location') {
        return normalizeWechatThreadEntry({
          ...base,
          name: normalizeWechatLocalizedContent(reply.name, reply.name),
          address: normalizeWechatLocalizedContent(reply.address, reply.address),
          distanceMeters: Math.max(0, Number(reply.distanceMeters) || 0),
          lat: Number(reply.lat) || 0,
          lng: Number(reply.lng) || 0
        }, { chatId: currentContactId });
      }
      if (base.type === 'transfer') {
        return normalizeWechatThreadEntry({
          ...base,
          amount: Number(reply.amount) || 0,
          currency: sanitizeWechatText(reply.currency) || 'CNY',
          note: normalizeWechatLocalizedContent(reply.note, reply.note),
          status: sanitizeWechatText(reply.status) || 'pending'
        }, { chatId: currentContactId });
      }
      if (base.type === 'red_packet') {
        return normalizeWechatThreadEntry({
          ...base,
          amount: Number(reply.amount) || 0,
          currency: sanitizeWechatText(reply.currency) || 'CNY',
          greeting: normalizeWechatLocalizedContent(reply.greeting, reply.greeting),
          status: sanitizeWechatText(reply.status) || 'unopened'
        }, { chatId: currentContactId });
      }
      if (base.type === 'gift') {
        return normalizeWechatThreadEntry({
          ...base,
          title: normalizeWechatLocalizedContent(reply.title, reply.title),
          count: Math.max(1, Number(reply.count) || 1),
          note: normalizeWechatLocalizedContent(reply.note, reply.note),
          status: sanitizeWechatText(reply.status) || 'received'
        }, { chatId: currentContactId });
      }
      if (base.type === 'takeout') {
        return normalizeWechatThreadEntry({
          ...base,
          merchant: normalizeWechatLocalizedContent(reply.merchant, reply.merchant),
          items: Array.isArray(reply.items) ? reply.items.map((item) => normalizeWechatLocalizedContent(item, item)).filter((item) => item.raw) : [],
          amount: Number(reply.amount) || 0,
          currency: sanitizeWechatText(reply.currency) || 'CNY',
          etaMinutes: Math.max(0, Number(reply.etaMinutes) || 0),
          note: normalizeWechatLocalizedContent(reply.note, reply.note),
          status: sanitizeWechatText(reply.status) || 'placed'
        }, { chatId: currentContactId });
      }
      if (base.type === 'call' || base.type === 'video') {
        return normalizeWechatThreadEntry({
          ...base,
          status: sanitizeWechatText(reply.status) || 'missed',
          durationSec: Math.max(0, Number(reply.durationSec) || 0),
          startedAt: safeTimestamp
        }, { chatId: currentContactId });
      }
      return null;
    }

    function tryParseWechatJson(cleaned) {
      try {
        return JSON.parse(cleaned);
      } catch (error) {
        return null;
      }
    }

    function parseWechatAiReply(raw) {
      const source = String(raw == null ? '' : raw).trim();
      if (!source) {
        return { messages: [], thought: null, diary: null, state: null, memories: [] };
      }
      const cleaned = source
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();
      const parsed = tryParseWechatJson(cleaned);
      if (Array.isArray(parsed)) {
        return {
          messages: normalizeWechatReplyList(parsed, cleaned),
          thought: null,
          diary: null,
          state: null,
          memories: []
        };
      }
      if (parsed && typeof parsed === 'object') {
        const replyCandidates = Array.isArray(parsed.messages)
          ? parsed.messages
          : Array.isArray(parsed.reply)
            ? parsed.reply
            : Array.isArray(parsed.replies)
              ? parsed.replies
              : parsed.content
                ? [{ type: 'text', content: parsed.content }]
                : [];
        return {
          messages: normalizeWechatReplyList(replyCandidates, cleaned),
          thought: normalizeWechatThoughtObject(parsed.thought || parsed.innerVoice || parsed.panel || parsed.voice),
          diary: normalizeWechatDiaryObject(parsed.diary || parsed.journal || parsed.entry),
          state: normalizeWechatStateObject(parsed.state || parsed.status),
          memories: Array.isArray(parsed.memories) ? parsed.memories.map((item) => normalizeWechatMemoryObject(item)).filter(Boolean).slice(0, 2) : []
        };
      }
      return {
        messages: normalizeWechatReplyList([], cleaned),
        thought: null,
        diary: null,
        state: null,
        memories: []
      };
    }

    function syncWechatComposerState(contact) {
      const state = window.__miniWechatComposer;
      if (!state || !state.textarea || !state.sendButton) return;
      const currentContactId = getWechatCurrentContactId(contact);
      const enabled = !!contact;
      state.textarea.disabled = !enabled;
      state.textarea.placeholder = enabled ? '\u8f93\u5165\u6d88\u606f...' : '\u8bf7\u5148\u901a\u8fc7\u53f3\u4e0a\u89d2\u9009\u62e9\u8054\u7cfb\u4eba';
      state.sendButton.style.pointerEvents = '';
      if (typeof state.syncActionState === 'function') state.syncActionState();
      else {
        state.sendButton.style.opacity = enabled ? '1' : '0.45';
        state.sendButton.style.cursor = enabled ? 'pointer' : 'not-allowed';
        state.sendButton.setAttribute('aria-disabled', enabled ? 'false' : 'true');
      }
      if (!enabled || (state.quoteChatId != null && state.quoteChatId !== currentContactId)) clearWechatQuoteDraft();
      if (!enabled && typeof closeWechatStickerPicker === 'function') closeWechatStickerPicker();
      syncWechatQuoteDraftUi();
      syncWechatVoiceComposerState(contact);
      syncWechatCameraComposerState(contact);
      syncWechatImageComposerState(contact);
      syncWechatLocationComposerState(contact);
    }

    async function renderWechatThread(currentContactId, contact, index) {
      const messages = document.querySelector('#chat-scroll .chat-messages');
      if (!messages) return;
      hideWechatBubbleQuickActionBar();
      messages.innerHTML = '';
      messages.dataset.lastMessageTimestamp = '';
      if (!contact) {
        addTimestamp(messages, '\u672a\u9009\u62e9\u8054\u7cfb\u4eba');
        const empty = document.createElement('div');
        empty.className = 'mini-chat-empty';
        empty.textContent = '\u8bf7\u5148\u901a\u8fc7\u6d88\u606f\u9875\u53f3\u4e0a\u89d2\u9009\u62e9\u8054\u7cfb\u4eba\uff0c\u518d\u53d1\u8d77\u804a\u5929\u3002';
        messages.appendChild(empty);
        return;
      }
      const thread = await loadMessages(currentContactId);
      if (!thread.length) {
        addTimestamp(messages, '\u804a\u5929\u5df2\u521b\u5efa');
        const empty = document.createElement('div');
        empty.className = 'mini-chat-empty';
        empty.textContent = '\u6682\u65e0\u5386\u53f2\u6d88\u606f\uff0c\u8f93\u5165\u540e\u5373\u53ef\u5f00\u59cb\u804a\u5929\u3002';
        messages.appendChild(empty);
        return;
      }
      let previousTimestamp = NaN;
      thread.forEach((entry) => {
        appendChatBubble(messages, entry, index, previousTimestamp);
        previousTimestamp = Number(entry.timestamp) || previousTimestamp;
      });
      scrollWechatThreadToBottom();
    }

    function serializeWechatMemoryForPrompt(memory) {
      return {
        title: sanitizeWechatText(memory && memory.title),
        content: sanitizeWechatText(memory && memory.content),
        summary: sanitizeWechatText(memory && memory.summary),
        kind: sanitizeWechatText(memory && memory.kind),
        importance: normalizeWechatProbability(memory && memory.importance, 0.5)
      };
    }

    function serializeWechatScheduleForPrompt(entry) {
      const base = {
        kind: sanitizeWechatText(entry && entry.kind),
        probability: normalizeWechatProbability(entry && entry.probability, null),
        updatedAt: Number(entry && (entry.updatedAt || entry.createdAt || entry.timestamp)) || Date.now()
      };
      if (base.kind === 'thought') {
        return {
          ...base,
          thought: {
            content: sanitizeWechatText(entry && entry.thought && entry.thought.content),
            mbti: sanitizeWechatText(entry && entry.thought && entry.thought.mbti),
            trait: sanitizeWechatText(entry && entry.thought && entry.thought.trait),
            specialTag: sanitizeWechatText(entry && entry.thought && entry.thought.specialTag),
            mood: sanitizeWechatText(entry && entry.thought && entry.thought.mood),
            focus: sanitizeWechatText(entry && entry.thought && entry.thought.focus),
            restraint: normalizeWechatPercent(entry && entry.thought && entry.thought.restraint, null),
            tension: normalizeWechatPercent(entry && entry.thought && entry.thought.tension, null),
            closeness: normalizeWechatPercent(entry && entry.thought && entry.thought.closeness, null)
          }
        };
      }
      if (base.kind === 'diary') {
        return {
          ...base,
          diary: {
            title: sanitizeWechatText(entry && entry.diary && entry.diary.title),
            preview: sanitizeWechatText(entry && entry.diary && entry.diary.preview),
            mood: sanitizeWechatText(entry && entry.diary && entry.diary.mood),
            location: sanitizeWechatText(entry && entry.diary && entry.diary.location)
          }
        };
      }
      if (base.kind === 'state') {
        return {
          ...base,
          state: {
            summary: sanitizeWechatText(entry && entry.state && entry.state.summary),
            phase: sanitizeWechatText(entry && entry.state && entry.state.phase),
            mood: sanitizeWechatText(entry && entry.state && entry.state.mood),
            restraint: normalizeWechatPercent(entry && entry.state && entry.state.restraint, null),
            tension: normalizeWechatPercent(entry && entry.state && entry.state.tension, null),
            closeness: normalizeWechatPercent(entry && entry.state && entry.state.closeness, null),
            volatility: normalizeWechatPercent(entry && entry.state && entry.state.volatility, null)
          }
        };
      }
      return base;
    }

    function normalizeWechatTimeZoneDescriptor(value) {
      const raw = sanitizeWechatText(value);
      if (!raw) return null;
      const offsetMatch = raw.match(/^(?:UTC|GMT)?\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?$/i);
      if (offsetMatch) {
        const sign = offsetMatch[1] === '-' ? -1 : 1;
        const hours = Math.min(23, Math.max(0, Number(offsetMatch[2]) || 0));
        const minutes = Math.min(59, Math.max(0, Number(offsetMatch[3]) || 0));
        const offsetMinutes = sign * ((hours * 60) + minutes);
        const label = `UTC${sign >= 0 ? '+' : '-'}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        return { type: 'offset', label, offsetMinutes, key: label };
      }
      try {
        new Intl.DateTimeFormat('zh-CN', { timeZone: raw }).format(new Date());
        return { type: 'iana', label: raw, timeZone: raw, key: raw };
      } catch (error) {
        return null;
      }
    }

    function getWechatZonedDateParts(descriptor, source = new Date()) {
      const safeDate = source instanceof Date ? source : new Date(source);
      if (!(safeDate instanceof Date) || Number.isNaN(safeDate.getTime())) return null;
      if (!descriptor) {
        return {
          year: safeDate.getFullYear(),
          month: safeDate.getMonth() + 1,
          day: safeDate.getDate(),
          hour: safeDate.getHours(),
          minute: safeDate.getMinutes()
        };
      }
      if (descriptor.type === 'offset') {
        const shifted = new Date(safeDate.getTime() + (descriptor.offsetMinutes * 60 * 1000));
        return {
          year: shifted.getUTCFullYear(),
          month: shifted.getUTCMonth() + 1,
          day: shifted.getUTCDate(),
          hour: shifted.getUTCHours(),
          minute: shifted.getUTCMinutes()
        };
      }
      try {
        const parts = new Intl.DateTimeFormat('en-CA', {
          timeZone: descriptor.timeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).formatToParts(safeDate);
        const read = (type) => Number((parts.find((item) => item.type === type) || {}).value) || 0;
        return {
          year: read('year'),
          month: read('month'),
          day: read('day'),
          hour: read('hour'),
          minute: read('minute')
        };
      } catch (error) {
        return null;
      }
    }

    function formatWechatZonedDateTime(descriptor, source = new Date()) {
      const parts = getWechatZonedDateParts(descriptor, source);
      if (!parts) return '';
      return [
        `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`,
        `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`
      ].join(' ');
    }

    function getWechatActivityStateByHour(hour) {
      const safeHour = Math.max(0, Math.min(23, Number(hour) || 0));
      if (safeHour <= 5) return 'sleeping';
      if (safeHour <= 8) return 'waking_up';
      if (safeHour <= 21) return 'active';
      return 'winding_down';
    }

    function getWechatActivitySummary(state) {
      if (state === 'sleeping') return '\u5927\u6982\u5904\u4e8e\u7761\u7720\u65f6\u6bb5\uff0c\u56de\u5e94\u8282\u594f\u5e94\u66f4\u56f0\u503c\u3001\u77ed\u4fc3\u6216\u7f13\u6162\u3002';
      if (state === 'waking_up') return '\u521a\u8d77\u5e8a\u6216\u6e05\u6668\u8fc7\u6e21\u6bb5\uff0c\u72b6\u6001\u504f\u6162\u70ed\u3002';
      if (state === 'winding_down') return '\u5df2\u8fdb\u5165\u6536\u675f\u65f6\u6bb5\uff0c\u8bed\u6c14\u53ef\u4ee5\u66f4\u4f4e\u538b\u3001\u66f4\u61d2\u3001\u66f4\u79c1\u4eba\u3002';
      return '\u6b63\u5e38\u6e05\u9192\u65f6\u6bb5\uff0c\u56de\u5e94\u8282\u594f\u53ef\u4ee5\u66f4\u81ea\u7136\u3001\u7a33\u5b9a\u3002';
    }

    function buildWechatTimeRuntimeContext(settings = {}) {
      const browserTimeZone = (() => {
        try {
          return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
        } catch (error) {
          return 'Local';
        }
      })();
      const contactZone = normalizeWechatTimeZoneDescriptor(settings.timezone) || normalizeWechatTimeZoneDescriptor(browserTimeZone);
      const browserZone = normalizeWechatTimeZoneDescriptor(browserTimeZone);
      const contactParts = getWechatZonedDateParts(contactZone, new Date());
      const activityState = getWechatActivityStateByHour(contactParts && contactParts.hour);
      return {
        enabled: !!settings.timeAwareness,
        timeAwareness: !!settings.timeAwareness,
        userTimeZone: browserZone ? browserZone.label : browserTimeZone,
        contactTimeZone: contactZone ? contactZone.label : browserTimeZone,
        preciseNow: settings.timeAwareness ? formatWechatZonedDateTime(contactZone, new Date()) : '',
        userNow: settings.timeAwareness ? formatWechatZonedDateTime(browserZone, new Date()) : '',
        activityState,
        activitySummary: getWechatActivitySummary(activityState)
      };
    }

    function getWechatWeatherCache() {
      if (!window.__miniWechatWeatherCache) window.__miniWechatWeatherCache = new Map();
      return window.__miniWechatWeatherCache;
    }

    function getWechatWeatherCodeLabel(code) {
      const labels = {
        0: '\u6674',
        1: '\u5927\u90e8\u6674',
        2: '\u5c11\u4e91',
        3: '\u9634',
        45: '\u96fe',
        48: '\u51bb\u96fe',
        51: '\u5c0f\u6bdb\u6bdb\u96e8',
        53: '\u6bdb\u6bdb\u96e8',
        55: '\u5f3a\u6bdb\u6bdb\u96e8',
        61: '\u5c0f\u96e8',
        63: '\u4e2d\u96e8',
        65: '\u5927\u96e8',
        71: '\u5c0f\u96ea',
        73: '\u4e2d\u96ea',
        75: '\u5927\u96ea',
        80: '\u9635\u96e8',
        81: '\u5f3a\u9635\u96e8',
        82: '\u66b4\u96e8',
        95: '\u96f7\u66b4',
        96: '\u96f7\u66b4\u5939\u51b0\u96f9',
        99: '\u5f3a\u96f7\u66b4\u5939\u51b0\u96f9'
      };
      return labels[Number(code)] || '\u5929\u6c14\u672a\u77e5';
    }

    async function fetchWechatCityWeather(cityName) {
      const city = sanitizeWechatText(cityName);
      if (!city) return null;
      const cache = getWechatWeatherCache();
      const cached = cache.get(city);
      if (cached && (Date.now() - cached.fetchedAt) < wechatWeatherCacheTtlMs) return cached.data;
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`);
      const geoJson = await geoResponse.json();
      const place = geoJson && Array.isArray(geoJson.results) ? geoJson.results[0] : null;
      if (!place) return null;
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(place.latitude)}&longitude=${encodeURIComponent(place.longitude)}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&timezone=auto`
      );
      const weatherJson = await weatherResponse.json();
      const current = weatherJson && weatherJson.current ? weatherJson.current : null;
      if (!current) return null;
      const data = {
        city,
        resolvedName: [place.name, place.admin1, place.country].filter(Boolean).join(', '),
        temperatureC: Number(current.temperature_2m) || 0,
        apparentTemperatureC: Number(current.apparent_temperature) || Number(current.temperature_2m) || 0,
        windSpeedKmh: Number(current.wind_speed_10m) || 0,
        weatherCode: Number(current.weather_code) || 0,
        weatherLabel: getWechatWeatherCodeLabel(current.weather_code),
        isDay: Number(current.is_day) === 1
      };
      cache.set(city, { fetchedAt: Date.now(), data });
      return data;
    }

    async function maybeLoadWechatWeatherContext(settings = {}, options = {}) {
      if (!settings.weatherEnabled || !settings.userCity || !settings.contactCity) return null;
      if (options.mode && options.mode !== 'reply') return null;
      if (Math.random() >= wechatWeatherSenseProbability) return null;
      try {
        const [userWeather, contactWeather] = await Promise.all([
          fetchWechatCityWeather(settings.userCity),
          fetchWechatCityWeather(settings.contactCity)
        ]);
        if (!userWeather || !contactWeather) return null;
        return {
          sensed: true,
          probability: wechatWeatherSenseProbability,
          user: userWeather,
          contact: contactWeather
        };
      } catch (error) {
        console.warn('Load WeChat weather context failed', error);
        return null;
      }
    }

    function normalizeWechatRelationTypeLabel(value) {
      const raw = sanitizeWechatText(value);
      if (!raw) return '';
      const labels = {
        Family: '\u5bb6\u4eba',
        Partner: '\u604b\u4eba',
        Friend: '\u670b\u53cb',
        Colleague: '\u540c\u4e8b',
        '\u5bb6\u4eba': '\u5bb6\u4eba',
        '\u604b\u4eba': '\u604b\u4eba',
        '\u670b\u53cb': '\u670b\u53cb',
        '\u540c\u4e8b': '\u540c\u4e8b'
      };
      return labels[raw] || raw;
    }

    function parseWechatRelationGlobalId(globalId) {
      const raw = sanitizeWechatText(globalId);
      const splitIndex = raw.indexOf('_');
      if (splitIndex < 0) return { type: '', id: raw };
      return {
        type: raw.slice(0, splitIndex),
        id: raw.slice(splitIndex + 1)
      };
    }

    async function loadWechatRelationshipNetwork(contact, currentContactId, miniDb) {
      const handle = await openContactsDatabase();
      if (!handle || !contact || currentContactId == null) return [];
      const { db, close } = handle;
      try {
        const contactsPromise = db.contacts ? db.contacts.toArray() : Promise.resolve([]);
        const relationsPromise = db.relations ? db.relations.toArray() : Promise.resolve([]);
        const userMasksPromise = miniDb && miniDb.ops && miniDb.ops.masks && typeof miniDb.ops.masks.listByType === 'function'
          ? miniDb.ops.masks.listByType('USER')
          : Promise.resolve([]);
        const [contacts, relations, userMasks] = await Promise.all([contactsPromise, relationsPromise, userMasksPromise]);
        const entityMap = new Map();
        (contacts || []).forEach((item) => {
          if (!item || item.id == null) return;
          entityMap.set(`${item.type}_${item.id}`, {
            name: item.nickname || item.name || item.account || `Contact ${item.id}`,
            type: item.type || '',
            account: item.account || ''
          });
        });
        (userMasks || []).forEach((item) => {
          if (!item || item.id == null) return;
          entityMap.set(`USER_${item.id}`, {
            name: item.nickname || item.name || item.account || `USER ${item.id}`,
            type: 'USER',
            account: item.account || ''
          });
        });
        const selfGlobalId = `${sanitizeWechatText(contact.type) || 'CHAR'}_${currentContactId}`;
        return (relations || [])
          .filter((relation) => relation && (relation.sourceGlobalId === selfGlobalId || relation.targetGlobalId === selfGlobalId))
          .map((relation) => {
            const isOutgoing = relation.sourceGlobalId === selfGlobalId;
            const otherGlobalId = isOutgoing ? relation.targetGlobalId : relation.sourceGlobalId;
            const fallbackEntity = parseWechatRelationGlobalId(otherGlobalId);
            const otherEntity = entityMap.get(otherGlobalId) || null;
            return {
              targetName: sanitizeWechatText(otherEntity && otherEntity.name) || fallbackEntity.id || otherGlobalId,
              targetType: sanitizeWechatText(otherEntity && otherEntity.type) || fallbackEntity.type || '',
              targetAccount: sanitizeWechatText(otherEntity && otherEntity.account),
              relationType: normalizeWechatRelationTypeLabel(relation.relationType || relation.relationDesc),
              relationDetail: sanitizeWechatText(relation.relationDesc),
              direction: isOutgoing ? 'outgoing' : 'incoming'
            };
          })
          .filter((item) => item.targetName || item.relationType || item.relationDetail)
          .slice(0, 24);
      } finally {
        close();
      }
    }

    async function buildPromptContext(currentContactId, contact, options = {}, config = {}) {
      const miniDb = await waitForMiniDb();
      const contactsOps = miniDb && miniDb.ops && miniDb.ops.contacts;
      const currentContact = contact || (contactsOps && typeof contactsOps.getContact === 'function'
        ? await contactsOps.getContact(currentContactId)
        : null);
      if (!currentContact || currentContact.id == null || currentContact.id !== currentContactId) {
        throw new Error('Current contact is missing or out of scope');
      }
      currentContact.__miniWechatSettings = currentContact.__miniWechatSettings || await readWechatContactSettings(currentContactId);
      const [userPreset, worldbooks, relationshipNetwork, stickerCatalog] = await Promise.all([
        loadWechatUserPreset(currentContact, miniDb),
        loadWechatWorldbook(currentContact, miniDb),
        loadWechatRelationshipNetwork(currentContact, currentContactId, miniDb),
        loadWechatStickerCatalog(miniDb)
      ]);
      const replyPolicy = buildWechatRoleReplyPolicy(currentContact, config || {}, stickerCatalog);
      const contactSettings = getWechatContactSettings(currentContact);
      const rawContextLimit = parseInt(config && config.context, 10);
      const historyWindow = Number.isFinite(rawContextLimit) && rawContextLimit > 0 ? rawContextLimit * 2 : 40;
      const [memories, recentMessages, schedules, weatherContext] = await Promise.all([
        loadMemories(currentContactId, { limit: Math.max(8, Math.ceil(historyWindow / 2)) }),
        loadMessages(currentContactId, { limit: historyWindow }),
        loadSchedules(currentContactId, { limit: 12 }),
        maybeLoadWechatWeatherContext(contactSettings, options)
      ]);
      const summaryMemories = memories
        .filter((memory) => sanitizeWechatText(memory && memory.kind).toLowerCase() === 'summary')
        .slice(0, 6);
      const promptMemories = memories
        .filter((memory) => sanitizeWechatText(memory && memory.kind).toLowerCase() !== 'summary')
        .slice(0, Math.max(8, Math.ceil(historyWindow / 2)));
      const timeContext = buildWechatTimeRuntimeContext(contactSettings);
      const userLabel = userPreset && (userPreset.nickname || userPreset.name || userPreset.account)
        ? (userPreset.nickname || userPreset.name || userPreset.account)
        : '\u4f60';
      const contactLabel = getWechatContactLabel(currentContact);
      const promptPayload = {
        persona: {
          contactId: currentContact.id,
          nickname: currentContact.nickname || '',
          fullName: currentContact.name || '',
          gender: currentContact.gender || '',
          accountId: currentContact.account || '',
          language: currentContact.language || '\u4e2d\u6587',
          signature: currentContact.signature || '',
          lore: currentContact.lore || '',
          presetPersona: userPreset ? {
            nickname: userPreset.nickname || '',
            name: userPreset.name || '',
            gender: userPreset.gender || '',
            accountId: userPreset.account || '',
            signature: userPreset.signature || '',
            lore: userPreset.lore || ''
          } : null,
          worldbook: Array.isArray(worldbooks) && worldbooks.length ? {
            name: worldbooks.map((item) => item && item.name).filter(Boolean).join(' / '),
            entries: worldbooks.flatMap((item) => Array.isArray(item && item.entries) ? item.entries : [])
          } : null,
          worldbooks: Array.isArray(worldbooks) ? worldbooks : [],
          remark: contactSettings.remark || ''
        },
        summaries: summaryMemories.map((memory) => serializeWechatMemoryForPrompt(memory)),
        memories: promptMemories.map((memory) => serializeWechatMemoryForPrompt(memory)),
        recentMessages: buildWechatPromptMessages(recentMessages, userLabel, contactLabel),
        schedules: schedules.map((entry) => serializeWechatScheduleForPrompt(entry)),
        relationshipNetwork,
        runtime: {
          triggerMode: options && options.mode === 'silent' ? 'silent_nudge' : 'reply',
          silentTriggerToken: wechatSilentReplyToken,
          temperature: replyPolicy.temperature,
          messageCount: replyPolicy.messageCount,
          languagePolicy: replyPolicy.language,
          specialMessagePolicy: replyPolicy.specialMessage,
          availableStickerCount: replyPolicy.stickerCatalog.length,
          availableStickers: replyPolicy.promptStickerCatalog,
          time: timeContext,
          weather: weatherContext,
          chatSettings: {
            autoReply: contactSettings.autoReply,
            independentVoiceApi: contactSettings.independentVoiceApi,
            patEnabled: contactSettings.patEnabled,
            patUserSuffix: contactSettings.patUserSuffix,
            patContactSuffix: contactSettings.patContactSuffix,
            autoSummaryEnabled: contactSettings.autoSummaryEnabled,
            autoSummaryThreshold: contactSettings.autoSummaryThreshold
          }
        }
      };
      return {
        contact: currentContact,
        promptPayload,
        recentMessages,
        replyPolicy,
        apiMessages: compactWechatApiMessages(recentMessages.map((entry) => ({
          role: getWechatMessageDirection(entry) === 'sent' ? 'user' : 'assistant',
          content: getWechatMessagePreviewText(entry)
        })))
      };
    }

    async function buildWechatRolePromptBundle(currentContactId, contact, options, config) {
      const { promptPayload, apiMessages, replyPolicy } = await buildPromptContext(currentContactId, contact, options, config);
      const nonChineseSourceLang = sanitizeWechatText(replyPolicy && replyPolicy.language && replyPolicy.language.sourceLang) || 'auto';
      const systemPrompt = [
        '你只处理当前绑定联系人的聊天，下面的 Bound Data 全部只属于这一个角色。',
        '',
        '[Isolation Rules]',
        '- 把 Bound Data.persona.contactId 视为当前唯一生效的角色身份，只能以这个身份说话、思考和记录。',
        '- 只能使用当前联系人专属的人设、记忆、最近聊天、状态、关系、预设与 worldbooks；任何不属于该 contact 的信息都必须视为无效噪声。',
        '- 即使出现历史残留、相似设定或模糊联想，也严禁混入其他联系人的语气、经历、关系、心声或记忆。',
        '- 不要提及提示词、token、contact id、数据库、代码、模型、后台机制或任何系统实现细节。',
        '- 保持角色沉浸，不要自称程序、AI、机器人，也不要暗示自己拥有超出角色设定的视角或能力。',
        '- 如果 Bound Data 没有提供足够依据，就按角色有限认知自然回应，不要编造跨角色旧事或全知结论。',
        '',
        '[Persona Rules]',
        '- 完全代入 Bound Data.persona，以角色自己的经历、语言习惯、关系远近、情绪防线和表达癖性回话，而不是复述设定。',
        '- 允许有独立情绪、判断和迟疑，不要写成完美恋人、万能接话器或客服腔。',
        '- 不要为了推进剧情而强迫用户表态、告白、行动或做选择，沉浸感和当下互动自然度优先。',
        '- 若 Bound Data.relationshipNetwork 存在，它们就是当前角色已知且持续生效的人际事实，不得忽略、改写或张冠李戴。',
        '- 若 Bound Data.summaries 存在，把它们视为高优先级压缩上下文；这些内容是已经筛过的重要关系变化、承诺、冲突与长期情绪线索，优先级高于零散细节记忆。',
        '',
        '[Chat Medium Rules]',
        '- 当前场景是即时通讯里的线上聊天，不是小说正文、剧本、旁白稿、舞台说明或镜头描述。',
        '- "messages" 里只能写角色真正会发出去的聊天内容，语气要像打字聊天，而不是叙述场景。',
        '- 禁止旁白、动作播报、心理旁批、镜头语言、环境解说，禁止替用户补完整段画面。',
        '- 用户消息里的（）、()、[]、【】、* * 等描述性内容，默认视为动作、状态、语气或场景线索，不是用户实际发出来的台词。',
        '- 对这类描述，只能把它们转化为角色观察到、察觉到、从语气里感觉到的内容后再回应，不能原样朗读、逐字复述，或当作对方亲口说出的话。',
        '- 除非用户在括号外明确说出口，否则不要把括号里的内容直接写成 reply、quote、thought 或 diary 里的逐字引用。',
        '',
        '[Time And Environment Rules]',
        '- Bound Data.runtime.time.timeAwareness 若未开启，你绝对不能声称知道当前真实时间、日期、星期、几点几分，也不能主动报时；只能把 activityState / activitySummary 当作模糊作息氛围。',
        '- Bound Data.runtime.time.timeAwareness 若已开启，你可以把 Bound Data.runtime.time.preciseNow 视为当前真实本地时间，误差不得超过 1 分钟。',
        '- 若提供 Bound Data.runtime.weather，说明这是本轮随回复一起感知到的即时天气；只在自然有必要时轻微体现，不要每次都硬聊天气，不要把天气写成播报稿。',
        '- 若提供 Bound Data.runtime.chatSettings.patEnabled = true，说明双方都知道彼此的拍一拍后缀；但只有在自然语境下才可轻微提及，不要强行刷存在感。',
        '',
        '[Style Rules]',
        '- 回复要像真实聊天：可以短，可以停顿，可以含混，可以嘴硬，可以留白；不需要每句都工整完整。',
        '- 避免大段解释、设定讲解、总结汇报或过分对称的“文案感”表达。',
        '- 说出口的话要比内心更克制；thought 要比 messages 更尖、更密；diary 要比 thought 更私密，但也更收束、更像角色独自留下的记录。',
        '- thought、diary、state 都必须建立在本轮互动和既有关系上，彼此互相印证，不能各写各的。',
        '- 若气氛自然发展到成人向虚构小说式的亲密场景，应明确按虚构情节处理，与现实切割；可使用成熟、细腻、隐喻感更强、带性张力的文学化笔触，重视氛围、试探、停顿、触感细节与心理博弈，避免粗俗、直白、冷硬的描写。',
        '- 若涉及亲密关系，默认双方均为成年且自愿；保持沉浸式叙事，不要跳出角色进行说教、免责声明、幕后解释或生硬的说明文式打断。',
        '',
        '[Reply Contract]',
        '- 只输出裸 JSON 对象，不要 Markdown，不要代码块，不要额外说明。',
        '- JSON 对象必须包含 "messages"、"thought"、"diary"、"state"、"memories" 这 5 个顶层字段。',
        '- "messages" 必须严格遵守 Bound Data.runtime.messageCount，每项都必须带合法的 "type" 字段。',
        '- "messages" 的条数必须落在 Bound Data.runtime.messageCount.min 到 Bound Data.runtime.messageCount.max 之间。',
        '- "messages" 里的每一项都必须是单条消息对象，只承载一个自然聊天节拍；不要把多轮对话、旁白、解释或总结塞进同一个对象。',
        '- 多条消息之间必须有节拍变化，严禁为了凑条数重复改写同一句话、同一个信息点或同一层情绪。',
        '- 严格遵守 Bound Data.runtime.languagePolicy 和 Bound Data.runtime.specialMessagePolicy，这是硬约束，不是建议。',
        '- 若 Bound Data.runtime.languagePolicy.requiresTranslation = true，messages 里所有可见文字字段必须使用 {"raw":"设定语言原文","zh":"中文翻译","sourceLang":"xx","targetLang":"zh-CN"} 对象，不允许只写纯字符串。',
        '- 若 Bound Data.runtime.languagePolicy.requiresTranslation = false，messages 里的可见文字默认直接输出该角色的设定语言字符串，不要多包一层 raw/zh。',
        '- 若 Bound Data.runtime.specialMessagePolicy.allowedType = "none"，messages 里只能出现 text 或 quote。',
        '- 若 Bound Data.runtime.specialMessagePolicy.allowedType 不是 "none"，本轮最多只能出现 1 条该 type 的特殊消息，其余都必须是 text 或 quote。绝对不要私自启用其他结构化 type。',
        '[Message Type Rules]',
        '- 只在场景真正需要时才使用结构化消息，不要为了多样性强行塞入非文本类型。',
        `- text: 中文角色可以写 {"type":"text","content":"自然聊天句子"}；任何非中文角色都必须写 {"type":"text","content":{"raw":"设定语言原文","zh":"中文翻译","sourceLang":"${nonChineseSourceLang}","targetLang":"zh-CN"}}。多条 text 时要有聊天节奏差，不要每条都写成工整完整的小作文。`,
        '- quote: 中文角色可以写 {"type":"quote","content":"对引用的回复","quoteMessageId":"recentMessages 里已出现的 messageId"}；任何非中文角色都必须把 content 写成 raw/zh 对象。只有 recentMessages 里确实存在明确目标时才能用。',
        '- sticker: {"type":"sticker","assetId":"真实 assetId","packId":"真实 packId","description":"表情包说明"}。assetId 和 packId 必须从 Bound Data.runtime.availableStickers 里选，绝不允许虚构不存在的表情包。',
        '- voice: {"type":"voice","transcript":"语音转写文本","durationSec":3}。transcript 必须像真实语音转写，不要写成旁白描述。',
        '- photo: {"type":"photo","description":"相机直拍照片的简短说明"}',
        '- location: {"type":"location","name":"地点名称","address":"详细地址"}',
        '- "thought" 可以为 null；若填写，必须是结构化心声，包含 content、summary、mbti、trait、specialTag、mood、focus、probability(0-1)、restraint(0-100)、tension(0-100)、closeness(0-100)。content 专供 INNER VOICE 面板使用，必须严格控制在 8 到 25 字内，像刚被压回去的一瞬间念头；mbti、trait、specialTag 会按顺序直接显示成 3 个标签，不能缺项，不能写成整句；trait 和 specialTag 必须是 2 到 4 个汉字的短标签，mbti 固定为 4 位 MBTI 代码。',
        '- "diary" 可以为 null；只有当这一轮确实留下值得被私下记下的余温、事件或情绪残响时才填写。若填写，必须是结构化日记，包含 title、preview、content、location、mood、tags、probability(0-1)。title 要像角色给自己留的私密标题，不要像章节名；preview 用于时间线预览，控制在 40 到 90 字，只截取一个最有情绪的切口；content 不能是一两行短条，必须写成完整日记，建议控制在 300 到 500 字，绝不超过 500 字。日记必须使用角色私下书写时的第一人称或贴身视角，比对话更真，比心声更完整，但仍然克制收束，不能写成设定说明、剧情梗概、给读者看的旁白或对用户公开说的话。',
        '- "state" 可以为 null；若填写，必须包含 summary、phase、mood、restraint、tension、closeness、volatility，数值范围 0 到 100。summary 专供 DARK SIDE 面板使用，必须严格控制在 8 到 25 字内，像角色不愿明说却持续存在的暗面，不要直接复述 messages 或 diary。',
        '- "memories" 可以是空数组，或 0 到 2 条值得长期记住的记忆，每条包含 title、content、summary、importance(0-1)。只保留真正会改变后续相处方式的内容，避免空泛纪要。',
        `- 若用户静默点击发送，你会看到 token ${wechatSilentReplyToken}，请将它当成不可见的催促，自然续上当前气氛，不要提及这个 token。`,
        '',
        '[Bound Data]',
        JSON.stringify(promptPayload, null, 2)
      ].join('\n');
      if (options && options.mode === 'silent') apiMessages.push({ role: 'user', content: wechatSilentReplyToken });
      return { systemPrompt, apiMessages, replyPolicy };
    }

    function extractWechatUsageStats(providerAuth, data) {
      if (providerAuth === 'anthropic') {
        const usage = data && data.usage ? data.usage : {};
        const promptTokens = Math.max(0, Number(usage.input_tokens) || 0);
        const completionTokens = Math.max(0, Number(usage.output_tokens) || 0);
        return {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens
        };
      }
      const usage = data && data.usage ? data.usage : {};
      const promptTokens = Math.max(0, Number(usage.prompt_tokens) || 0);
      const completionTokens = Math.max(0, Number(usage.completion_tokens) || 0);
      const totalTokens = Math.max(0, Number(usage.total_tokens) || (promptTokens + completionTokens));
      return { promptTokens, completionTokens, totalTokens };
    }

    async function requestWechatChatCompletion(config, systemPrompt, apiMessages) {
      if (!config || !config.apiKey) throw new Error('\u8bf7\u5148\u5728\u300c\u63a5\u53e3\u4e0e\u914d\u7f6e\u300d\u4e2d\u586b\u5199\u804a\u5929 API Key');
      if (!config.model) throw new Error('\u8bf7\u5148\u5728\u300c\u63a5\u53e3\u4e0e\u914d\u7f6e\u300d\u4e2d\u586b\u5199\u804a\u5929\u6a21\u578b');
      const cfg = getMiniChatProviderConfig(config.provider);
      const endpoint = buildMiniChatEndpoint(config.url, cfg, cfg.chatPath || '/chat/completions');
      const temperature = Number.parseFloat(config.temperature);
      const safeTemperature = Number.isFinite(temperature) ? temperature : 0.7;
      const headers = {
        ...buildMiniChatHeaders(cfg, config.apiKey),
        'Content-Type': 'application/json'
      };
      const messages = compactWechatApiMessages(apiMessages);
      const timeoutMs = Math.max(10000, Number(config.timeoutMs) || 30000);
      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      const signal = controller ? controller.signal : undefined;
      const timeoutId = controller ? window.setTimeout(() => controller.abort(), timeoutMs) : 0;
      let response;
      try {
        if (cfg.auth === 'anthropic') {
          const anthropicMessages = messages.slice();
          if (!anthropicMessages.length || anthropicMessages[0].role !== 'user') {
            anthropicMessages.unshift({ role: 'user', content: wechatSilentReplyToken });
          }
          response = await fetch(endpoint, {
            method: 'POST',
            headers,
            signal,
            body: JSON.stringify({
              model: config.model,
              system: systemPrompt,
              messages: anthropicMessages,
              max_tokens: 700,
              temperature: safeTemperature
            })
          });
        } else {
          response = await fetch(endpoint, {
            method: 'POST',
            headers,
            signal,
            body: JSON.stringify({
              model: config.model,
              messages: [{ role: 'system', content: systemPrompt }].concat(messages),
              temperature: safeTemperature,
              stream: false
            })
          });
        }
      } catch (error) {
        if (error && error.name === 'AbortError') {
          throw new Error(`\u804a\u5929\u8bf7\u6c42\u8d85\u65f6\uff08${Math.round(timeoutMs / 1000)}\u79d2\uff09`);
        }
        throw error;
      } finally {
        if (timeoutId) window.clearTimeout(timeoutId);
      }
      const rawText = await response.text();
      let data = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch (error) {}
      if (!response.ok) throw new Error(extractMiniChatError(data) || `${response.status} ${response.statusText}`);
      if (cfg.auth === 'anthropic') {
        const blocks = data && Array.isArray(data.content) ? data.content : [];
        const text = blocks
          .filter((block) => block && block.type === 'text' && typeof block.text === 'string')
          .map((block) => block.text)
          .join('\n')
          .trim();
        if (!text) throw new Error('Claude response was empty');
        return {
          text,
          usage: extractWechatUsageStats(cfg.auth, data),
          provider: cfg.auth
        };
      }
      const content = data && data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : '';
      if (typeof content === 'string' && content.trim()) {
        return {
          text: content,
          usage: extractWechatUsageStats(cfg.auth, data),
          provider: cfg.auth
        };
      }
      if (Array.isArray(content)) {
        const text = content
          .map((part) => {
            if (!part) return '';
            if (typeof part === 'string') return part;
            if (part.type === 'text') return part.text || '';
            return '';
          })
          .join('\n')
          .trim();
        if (text) {
          return {
            text,
            usage: extractWechatUsageStats(cfg.auth, data),
            provider: cfg.auth
          };
        }
      }
      throw new Error('Chat response was empty');
    }

    async function getMiniChatConfig() {
      const miniDb = await waitForMiniDb();
      const api = miniDb && miniDb.ops && miniDb.ops.api;
      if (!api || typeof api.getChatConfig !== 'function') return null;
      return api.getChatConfig();
    }

    window.waitForMiniDb = waitForMiniDb;
    window.getMiniChatConfig = getMiniChatConfig;
    window.getMiniChatErrorMessage = getMiniChatErrorMessage;
    window.requestMiniChatCompletion = requestWechatChatCompletion;
    window.buildMiniContactPromptContext = buildPromptContext;

    async function requestWechatContactPersonaProfile(contact, config) {
      const promptPayload = {
        nickname: sanitizeWechatText(contact && contact.nickname),
        name: sanitizeWechatText(contact && contact.name),
        signature: sanitizeWechatText(contact && contact.signature),
        lore: sanitizeWechatText(contact && contact.lore),
        language: sanitizeWechatText(contact && contact.language),
        gender: sanitizeWechatText(contact && contact.gender)
      };
      const systemPrompt = [
        '\u4f60\u8d1f\u8d23\u751f\u6210\u5fae\u4fe1\u300c\u5fc3\u58f0\u9762\u677f\u300d\u7684\u56fa\u5b9a\u89d2\u8272\u6863\u6848\uff0c\u53ea\u751f\u6210\u524d 3 \u884c\u6240\u9700\u7684\u5b57\u6bb5\u3002',
        '',
        '[Output]',
        '- \u53ea\u80fd\u8f93\u51fa\u88f8 JSON \u5bf9\u8c61\uff0c\u4e0d\u8981 Markdown\uff0c\u4e0d\u8981\u4ee3\u7801\u5757\uff0c\u4e0d\u8981\u89e3\u91ca\u3002',
        '- JSON \u5fc5\u987b\u5305\u542b romanizedName, profession, mbti, ideologyTag, syndromeTag \u8fd9 5 \u4e2a\u5b57\u6bb5\u3002',
        '',
        '[Rules]',
        '- romanizedName\uff1a\u89d2\u8272\u6635\u79f0\u6216\u59d3\u540d\u7684\u5927\u5199\u62fc\u97f3 / \u7f57\u9a6c\u5b57\u8f6c\u5199\uff0c\u53ea\u80fd\u7528 A-Z \u548c\u7a7a\u683c\u3002',
        '- profession\uff1a\u89d2\u8272\u804c\u4e1a\u6216\u8eab\u4efd\uff0c1 \u884c\u77ed\u8bed\uff0c\u4e0d\u8981\u6807\u70b9\u3002',
        '- mbti\uff1a\u5fc5\u987b\u662f 4 \u4f4d MBTI \u4ee3\u7801\u3002',
        '- ideologyTag\uff1a\u5fc5\u987b\u662f\u300c??\u4e3b\u4e49\u300d\u683c\u5f0f\uff0c\u8d34\u5408\u4eba\u8bbe\uff0c\u4e0d\u80fd\u5199\u6210\u53e5\u5b50\u3002',
        '- syndromeTag\uff1a\u5fc5\u987b\u662f\u300c??\u75c7\u300d\u683c\u5f0f\uff0c\u8d34\u5408\u4eba\u8bbe\uff0c\u4e0d\u80fd\u5199\u6210\u53e5\u5b50\u3002',
        '- \u4e0d\u8981\u751f\u6210\u5fc3\u58f0\u3001\u9634\u6697\u9762\u3001\u65e5\u8bb0\u6216\u804a\u5929\u5185\u5bb9\u3002',
        '',
        '[Contact]',
        JSON.stringify(promptPayload, null, 2)
      ].join('\n');
      const profileResponse = await requestWechatChatCompletion(
        config || {},
        systemPrompt,
        [{ role: 'user', content: '\u8bf7\u8f93\u51fa\u89d2\u8272\u56fa\u5b9a\u6863\u6848 JSON\u3002' }]
      );
      if (contact && contact.id != null && profileResponse && profileResponse.usage) {
        void recordWechatTokenUsage(contact.id, profileResponse.usage);
      }
      const cleaned = String((profileResponse && profileResponse.text) || '')
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();
      const parsed = tryParseWechatJson(cleaned);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('\u89d2\u8272\u6863\u6848\u751f\u6210\u7ed3\u679c\u4e0d\u662f\u6709\u6548 JSON');
      }
      return normalizeWechatContactPersonaProfile(parsed, contact);
    }

    async function ensureWechatContactPersonaProfile(contactId, options = {}) {
      if (contactId == null) return null;
      const miniDb = await waitForMiniDb();
      const ops = miniDb && miniDb.ops;
      const contactOps = ops && ops.contacts;
      const apiOps = ops && ops.api;
      if (!contactOps || typeof contactOps.getContact !== 'function' || typeof contactOps.updateContact !== 'function') {
        return null;
      }

      const contact = await contactOps.getContact(contactId);
      if (!contact) return null;

      const existingStoredProfile = contact.wechatPersonaProfile && typeof contact.wechatPersonaProfile === 'object'
        ? contact.wechatPersonaProfile
        : null;
      const existingProfile = normalizeWechatContactPersonaProfile(existingStoredProfile, contact);
      if (!options.force && existingStoredProfile && existingStoredProfile.generatedAt) {
        return existingProfile;
      }
      if (!options.force && isWechatContactPersonaProfileComplete(existingProfile)) {
        return existingProfile;
      }

      let nextProfile = existingProfile;
      let source = 'fallback';
      try {
        const config = apiOps && typeof apiOps.getChatConfig === 'function'
          ? await apiOps.getChatConfig()
          : null;
        if (config && config.apiKey && config.model) {
          nextProfile = await requestWechatContactPersonaProfile(contact, config);
          source = 'ai';
        } else {
          nextProfile = normalizeWechatContactPersonaProfile({}, contact);
        }
      } catch (error) {
        if (!options.silent && typeof showMiniNotice === 'function') {
          showMiniNotice('\u89d2\u8272\u56fa\u5b9a\u6863\u6848\u751f\u6210\u5931\u8d25\uff1a' + getMiniChatErrorMessage(error), 3200);
        }
        nextProfile = normalizeWechatContactPersonaProfile(contact.wechatPersonaProfile, contact);
        if (!isWechatContactPersonaProfileComplete(nextProfile)) {
          nextProfile = normalizeWechatContactPersonaProfile({}, contact);
        }
      }

      const storedProfile = {
        ...nextProfile,
        source,
        generatedAt: Date.now()
      };
      await contactOps.updateContact(contactId, { wechatPersonaProfile: storedProfile });

      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('mini-contact-persona-updated', {
          detail: { contactId, profile: storedProfile }
        }));
      }

      if (routeName === 'wechat' && typeof getCurrentWechatSelection === 'function') {
        const selection = getCurrentWechatSelection();
        const currentWechatContactId = getWechatCurrentContactId(selection && selection.contact);
        if (String(currentWechatContactId) === String(contactId)) {
          if (selection && selection.contact && typeof selection.contact === 'object') {
            selection.contact.wechatPersonaProfile = storedProfile;
          }
          await renderWechatThoughtPanel(contactId, (selection && selection.contact) || contact, selection ? selection.index : 0);
        }
      }

      return storedProfile;
    }

    window.ensureWechatContactPersonaProfile = ensureWechatContactPersonaProfile;

    function getWechatReplyQueueStore() {
      if (!window.__miniWechatReplyQueues) window.__miniWechatReplyQueues = {};
      return window.__miniWechatReplyQueues;
    }

    async function persistWechatAiArtifacts(currentContactId, payload) {
      if (currentContactId == null || !payload) return;
      const tasks = [];
      if (payload.thought) tasks.push(saveThought(currentContactId, payload.thought));
      if (payload.diary) tasks.push(saveDiary(currentContactId, payload.diary));
      if (payload.state) tasks.push(saveState(currentContactId, payload.state));
      (payload.memories || [])
        .filter((item) => item && sanitizeWechatText(item.content))
        .filter((item) => normalizeWechatProbability(item.importance, 0) >= 0.55)
        .slice(0, 2)
        .forEach((item) => {
          tasks.push(saveMemory(currentContactId, item));
        });
      await Promise.all(tasks);
    }

    const wechatAutoReplyTriggerTypes = Object.freeze(['location', 'call', 'video']);

    function shouldWechatAutoReplyForSentMessage(messageType, contact) {
      if (contact && getWechatContactSettings(contact).autoReply) return true;
      const safeType = sanitizeWechatText(messageType).toLowerCase();
      return wechatAutoReplyTriggerTypes.includes(safeType);
    }

    async function triggerWechatAutoReplyForSentMessage(contact, index, messageType) {
      if (!contact) return false;
      if (!shouldWechatAutoReplyForSentMessage(messageType, contact)) {
        void maybeRunWechatConversationSummary(contact, index, { force: false });
        return false;
      }
      await enqueueWechatCharacterReply(contact, index, { mode: 'reply' });
      return true;
    }

    function enqueueWechatCharacterReply(contact, index, options) {
      const key = getWechatContactKey(contact, index);
      const queues = getWechatReplyQueueStore();
      const previous = queues[key] || Promise.resolve();
      const next = previous
        .catch(() => null)
        .then(() => runWechatCharacterReply(contact, index, options));
      queues[key] = next.finally(() => {
        if (queues[key] === next) delete queues[key];
      });
      return queues[key];
    }

    async function runWechatCharacterReply(contact, index, options = {}) {
      const currentContactId = getWechatCurrentContactId(contact);
      if (currentContactId == null) return;
      const typingToken = beginWechatTyping(contact, index);
      try {
        const miniDb = await waitForMiniDb();
        const api = miniDb && miniDb.ops && miniDb.ops.api;
        if (!api || typeof api.getChatConfig !== 'function') throw new Error('\u804a\u5929 API \u914d\u7f6e\u672a\u52a0\u8f7d');
        const config = await api.getChatConfig();
        const { systemPrompt, apiMessages, replyPolicy } = await buildWechatRolePromptBundle(currentContactId, contact, options, config || {});
        const replyResponse = await requestWechatChatCompletion(config || {}, systemPrompt, apiMessages);
        if (replyResponse && replyResponse.usage) {
          void recordWechatTokenUsage(currentContactId, replyResponse.usage);
        }
        const parsedPayload = parseWechatAiReply(replyResponse && replyResponse.text);
        const payload = await enforceWechatAiPayloadPolicy(parsedPayload, replyPolicy, config || {});
        if (!payload.messages.length) throw new Error('\u89d2\u8272\u56de\u590d\u4e3a\u7a7a');
        await persistWechatAiArtifacts(currentContactId, payload);
        const referenceMessages = await loadMessages(currentContactId);
        let appendedCount = 0;
        for (const reply of payload.messages) {
          await sleep(1000);
          const draft = buildWechatAiReplyEntry(reply, currentContactId, referenceMessages, Date.now());
          if (!draft) continue;
          const entry = await saveMessage(currentContactId, draft);
          if (!entry) continue;
          appendedCount += 1;
          referenceMessages.push(entry);
          await appendWechatThreadEntryToUi(currentContactId, contact, index, entry);
          showWechatIncomingBanner(contact, index, entry);
        }
        if (!appendedCount) throw new Error('\u89d2\u8272\u56de\u590d\u65e0\u6cd5\u89e3\u6790');
        await refreshWechatListPreview(index);
        await renderWechatThoughtPanel(currentContactId, contact, index);
        await refreshWechatDiaryIfVisible(currentContactId);
        if (contact && getWechatContactSettings(contact).patEnabled && Math.random() < wechatAutoPatProbability) {
          void emitWechatPatInteraction(contact, index, 'contact');
        }
        void maybeRunWechatConversationSummary(contact, index, { force: false });
      } catch (error) {
        showMiniNotice('\u89d2\u8272\u56de\u590d\u5931\u8d25\uff1a' + getMiniChatErrorMessage(error), 4200);
      } finally {
        endWechatTyping(contact, index, typingToken);
      }
    }

    async function hydrateWechatContactsForUi(contacts = []) {
      const nextContacts = Array.isArray(contacts)
        ? contacts.map((contact) => (contact && typeof contact === 'object' ? { ...contact } : contact)).filter(Boolean)
        : [];
      const miniDb = await waitForMiniDb();
      const ops = miniDb && miniDb.ops;
      const wechatOps = ops && ops.wechat;
      let userMasks = [];
      if (ops && ops.masks && typeof ops.masks.listByType === 'function') {
        try {
          userMasks = await ops.masks.listByType('USER');
        } catch (error) {
          userMasks = [];
        }
      }
      const normalizedMasks = Array.isArray(userMasks)
        ? userMasks.map((mask) => (mask && typeof mask === 'object' ? { ...mask } : mask)).filter(Boolean)
        : [];
      const primaryUserMask = normalizedMasks[0] || null;
      const userMaskMap = new Map();
      normalizedMasks.forEach((mask) => {
        if (!mask || mask.id == null) return;
        userMaskMap.set(String(mask.id), mask);
      });
      window.__miniWechatPrimaryUserMask = primaryUserMask;
      const settingsByContactId = new Map();
      if (wechatOps && typeof wechatOps.getConfig === 'function') {
        const settingsRows = await Promise.all(nextContacts.map(async (contact) => {
          if (!contact || contact.id == null) return null;
          try {
            return [contact.id, normalizeWechatContactSettings(await wechatOps.getConfig(getWechatContactSettingsConfigId(contact.id)))];
          } catch (error) {
            return [contact.id, normalizeWechatContactSettings()];
          }
        }));
        settingsRows.forEach((row) => {
          if (!row) return;
          settingsByContactId.set(String(row[0]), row[1]);
        });
      }
      nextContacts.forEach((contact) => {
        const presetId = parseWechatAssocId(contact && contact.presetAssoc, 'mask');
        const normalizedPresetId = presetId == null
          ? null
          : String(Number.isNaN(Number(presetId)) ? presetId : Number(presetId));
        contact.__miniUserMask = (normalizedPresetId && userMaskMap.get(normalizedPresetId)) || primaryUserMask || null;
        contact.__miniWechatSettings = settingsByContactId.get(String(contact.id)) || normalizeWechatContactSettings(contact.__miniWechatSettings);
      });
      return nextContacts;
    }

    function isWechatDefaultLikeText(value, patterns = [], fallback = '') {
      const text = sanitizeWechatText(value);
      if (!text) return true;
      if (fallback && text === sanitizeWechatText(fallback)) return true;
      return patterns.some((pattern) => pattern.test(text));
    }

    async function applyWechatProfileDefaults() {
      const textDefaults = [
        {
          id: 'profile-name',
          value: '\u6211\u7684\u5fae\u4fe1',
          patterns: [/^LIN MO$/i, /^WECHAT TEAM$/i, /^WECHAT$/i, /^\u6211\u7684\u5fae\u4fe1$/]
        },
        {
          id: 'profile-id',
          value: '@\u6211\u7684\u8d26\u53f7',
          patterns: [/^@OLD_ORANGE_ARCH$/i, /^@wechat_team$/i, /^@my-account$/i, /^@\u6211\u7684\u8d26\u53f7$/]
        },
        {
          id: 'moments-name',
          value: '\u6211\u7684\u670b\u53cb\u5708',
          patterns: [/^LIN MO$/i, /^WECHAT TEAM$/i, /^Moments$/i, /^\u6211\u7684\u670b\u53cb\u5708$/]
        },
        {
          id: 'moments-sign',
          value: '\u6682\u65e0\u670b\u53cb\u5708\u5185\u5bb9',
          patterns: [/silent aesthetic/i, /Official WeChat service contact/i, /^No posts yet$/i, /^\u6682\u65e0\u670b\u53cb\u5708\u5185\u5bb9$/]
        }
      ];
      textDefaults.forEach((item) => {
        const node = document.getElementById(item.id);
        if (!node) return;
        const text = node.textContent.trim();
        if (item.patterns.some((pattern) => pattern.test(text))) {
          node.textContent = item.value;
        }
      });

      const miniDb = await waitForMiniDb();
      const wechatOps = miniDb && miniDb.ops && miniDb.ops.wechat;
      const storedTextValues = wechatOps
        ? await Promise.all(textDefaults.map((item) => Promise.resolve(wechatOps.getConfig(item.id)).catch(() => null)))
        : textDefaults.map(() => null);

      textDefaults.forEach((item, itemIndex) => {
        const node = document.getElementById(item.id);
        if (!node) return;
        const storedValue = sanitizeWechatText(storedTextValues[itemIndex]);
        if (storedValue) {
          node.textContent = storedValue;
          return;
        }
        if (!sanitizeWechatText(node.textContent) || isWechatDefaultLikeText(node.textContent, item.patterns, item.value)) {
          node.textContent = item.value;
        }
      });

      const storedImages = wechatOps
        ? await Promise.all([
            Promise.resolve(wechatOps.getImage('profile-avatar')).catch(() => null),
            Promise.resolve(wechatOps.getImage('moments-avatar')).catch(() => null),
            Promise.resolve(wechatOps.getImage('moments-bg')).catch(() => null)
          ])
        : [null, null, null];

      const profileAvatar = document.getElementById('profile-avatar');
      const momentsAvatar = document.getElementById('moments-avatar');
      const momentsBg = document.getElementById('moments-bg');

      if (storedImages[0]) setBackground(profileAvatar, storedImages[0]);
      else paintWechatAvatarFallback(profileAvatar, 0, 'user');

      if (storedImages[1]) setBackground(momentsAvatar, storedImages[1]);
      else paintWechatAvatarFallback(momentsAvatar, 1, 'user');

      if (storedImages[2]) setBackground(momentsBg, storedImages[2]);
      else clearBackground(momentsBg);
    }

    function renderWechatMomentsEmptyState() {
      const feed = document.querySelector('.moments-feed');
      if (!feed) return;
      feed.innerHTML = '';
      const empty = document.createElement('div');
      empty.className = 'mini-empty-state';
      empty.textContent = '\u6682\u65e0\u670b\u53cb\u5708\u5185\u5bb9\u3002\u5f53\u524d\u53ea\u4fdd\u7559\u7528\u6237\u81ea\u5df1\u540e\u7eed\u6dfb\u52a0\u7684\u6570\u636e\u3002';
      feed.appendChild(empty);
    }

    function updateWechatDetail(contact, index) {
      // Legacy implementation removed. See the contact-scoped override below.
    }

    function applyWechatData(contacts) {
      // Legacy implementation removed. See the contact-scoped override below.
    }

    function selectWechatContact(index, openDetail = false) {
      // Legacy implementation removed. See the contact-scoped override below.
    }

    function ensureWechatLauncher() {
      let overlay = document.getElementById('mini-wechat-launcher');
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.id = 'mini-wechat-launcher';
      overlay.className = 'modal-overlay mini-wechat-launcher';
      overlay.innerHTML = [
        '<div class="modal-box" onclick="event.stopPropagation()">',
        '<div class="modal-header">ADD CHAT</div>',
        '<div class="mini-wechat-launcher-shortcuts">',
        '<button type="button" class="mini-wechat-launcher-shortcut is-active" data-action="chat">',
        '<span class="mini-wechat-launcher-shortcut-title">START CHAT</span>',
        '<span class="mini-wechat-launcher-shortcut-sub">CONTACTS</span>',
        '</button>',
        '<button type="button" class="mini-wechat-launcher-shortcut" data-action="group">',
        '<span class="mini-wechat-launcher-shortcut-title">START GROUP CHAT</span>',
        '<span class="mini-wechat-launcher-shortcut-sub">COMING SOON</span>',
        '</button>',
        '<button type="button" class="mini-wechat-launcher-shortcut" data-action="shake">',
        '<span class="mini-wechat-launcher-shortcut-title">SHAKE</span>',
        '<span class="mini-wechat-launcher-shortcut-sub">COMING SOON</span>',
        '</button>',
        '</div>',
        '<div class="mini-wechat-launcher-section-label">START CHAT</div>',
        '<div class="mini-wechat-launcher-list"></div>',
        '<div class="btn-row mini-wechat-launcher-actions">',
        '<button type="button" class="btn-flat btn-secondary" data-action="close">CANCEL</button>',
        '</div>',
        '</div>'
      ].join('');
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) overlay.classList.remove('show');
      });
      const closeButton = overlay.querySelector('[data-action="close"]');
      const chatButton = overlay.querySelector('[data-action="chat"]');
      const groupButton = overlay.querySelector('[data-action="group"]');
      const shakeButton = overlay.querySelector('[data-action="shake"]');
      const shortcutButtons = Array.from(overlay.querySelectorAll('.mini-wechat-launcher-shortcut'));
      const list = overlay.querySelector('.mini-wechat-launcher-list');
      const sectionLabel = overlay.querySelector('.mini-wechat-launcher-section-label');

      function setLauncherShortcut(action) {
        const safeAction = sanitizeWechatText(action).toLowerCase() || 'chat';
        shortcutButtons.forEach((button) => {
          button.classList.toggle('is-active', button.dataset.action === safeAction);
        });
        const showChatList = safeAction === 'chat';
        if (list) list.style.display = showChatList ? 'flex' : 'none';
        if (sectionLabel) sectionLabel.style.display = showChatList ? 'block' : 'none';
      }

      if (closeButton) {
        closeButton.addEventListener('click', () => {
          overlay.classList.remove('show');
        });
      }
      if (chatButton) {
        chatButton.addEventListener('click', () => {
          setLauncherShortcut('chat');
        });
      }
      if (groupButton) {
        groupButton.addEventListener('click', () => {
          setLauncherShortcut('group');
          showMiniNotice('GROUP CHAT COMING SOON');
        });
      }
      if (shakeButton) {
        shakeButton.addEventListener('click', () => {
          setLauncherShortcut('shake');
          showMiniNotice('SHAKE COMING SOON');
        });
      }
      setLauncherShortcut('chat');
      return overlay;
    }

    function renderWechatLauncherContacts() {
      const overlay = ensureWechatLauncher();
      const list = overlay.querySelector('.mini-wechat-launcher-list');
      const sectionLabel = overlay.querySelector('.mini-wechat-launcher-section-label');
      overlay.querySelectorAll('.mini-wechat-launcher-shortcut').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.action === 'chat');
      });
      if (!list) return overlay;
      if (sectionLabel) sectionLabel.style.display = 'block';
      list.style.display = 'flex';
      list.innerHTML = '';
      const contacts = getWechatAllContacts();
      const visibleKeys = new Set(getCurrentWechatContacts().map((contact, index) => getWechatContactKey(contact, index)));
      if (!contacts.length) {
        const empty = document.createElement('div');
        empty.className = 'mini-empty-state';
        empty.textContent = 'ADD CONTACTS FIRST, THEN START A CHAT HERE.';
        list.appendChild(empty);
        return overlay;
      }
      contacts.forEach((contact, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mini-wechat-launcher-item';
        button.innerHTML = '<div class="mini-wechat-launcher-avatar"></div><div class="mini-wechat-launcher-copy"><div class="mini-wechat-launcher-name"></div><div class="mini-wechat-launcher-meta"></div></div>';
        const avatar = button.querySelector('.mini-wechat-launcher-avatar');
        const name = button.querySelector('.mini-wechat-launcher-name');
        const meta = button.querySelector('.mini-wechat-launcher-meta');
        const contactKey = getWechatContactKey(contact, index);
        const visible = visibleKeys.has(contactKey);
        if (name) name.textContent = getWechatContactLabel(contact);
        if (meta) meta.textContent = visible
          ? (contact.signature || contact.lore || 'OPEN CHAT')
          : 'ADD TO CHAT LIST';
        setAvatarSurface(avatar, index, { role: 'contact', contact });
        button.addEventListener('click', async () => {
          overlay.classList.remove('show');
          await revealWechatConversation(contactKey, { openDetail: true });
        });
        list.appendChild(button);
      });
      return overlay;
    }

    function installWechatChatLauncher() {
      if (routeName !== 'wechat') return;
      const trigger = document.querySelector('#page-messages [data-wechat-launcher-trigger="1"]')
        || document.querySelector('#page-messages .nav-right');
      if (!trigger) return;
      renderWechatLauncherContacts();
      if (trigger.dataset.miniWechatLauncherBound === '1') return;
      trigger.dataset.miniWechatLauncherBound = '1';
      trigger.style.cursor = 'pointer';
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        const overlay = renderWechatLauncherContacts();
        overlay.classList.add('show');
      }, true);
    }

    function initWechatSend() {
      // Legacy implementation removed. See the contact-scoped override below.
    }

    function installWechatDiaryOverride() {
      // Legacy implementation removed. See the contact-scoped override below.
    }

    function buildWechatVoiceTag(text) {
      const tag = document.createElement('span');
      tag.className = 'w-voice-tag';
      tag.textContent = text;
      return tag;
    }

    function formatWechatDiaryDate(value) {
      const date = new Date(Number(value) || Date.now());
      if (Number.isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      return `${year}.${month}.${day} / ${hour}:${minute}`;
    }

    function clampWechatPanelText(value, fallback = '', maxLength = 20) {
      const source = sanitizeWechatText(value) || sanitizeWechatText(fallback);
      if (!source) return '';
      return source.slice(0, Math.max(1, maxLength));
    }

    function deriveWechatRolePanelFallback(contact, field) {
      if (!contact) return '';
      if (field === 'thought') {
        return sanitizeWechatText(contact.signature || contact.nickname || contact.name || contact.account);
      }
      return sanitizeWechatText(contact.lore || contact.signature || contact.nickname || contact.name);
    }

    function formatWechatTagToken(value, fallback = 'HOLD', maxLength = 8) {
      const source = sanitizeWechatText(value) || fallback;
      return source.slice(0, Math.max(1, maxLength)).toUpperCase();
    }

    async function renderWechatThoughtPanel(currentContactId, contact, index) {
      const voiceName = document.querySelector('.w-voice-name');
      const voiceSub = document.querySelector('.w-voice-sub');
      const tagsWrap = document.querySelector('.w-voice-tags');
      const titles = document.querySelectorAll('.w-voice-sec-title');
      const texts = document.querySelectorAll('.w-voice-sec-text');
      if (titles[0]) titles[0].textContent = 'INNER VOICE';
      if (titles[1]) titles[1].textContent = 'DARK SIDE';
      const applyDefaultPanel = () => {
        if (voiceName) voiceName.textContent = '\u672a\u9009\u62e9\u8054\u7cfb\u4eba';
        if (voiceSub) voiceSub.textContent = '\u8eab\u4efd\u672a\u89e3\u6790';
        if (texts[0]) texts[0].textContent = '“\u672a\u9009\u62e9\u89d2\u8272”';
        if (texts[1]) texts[1].textContent = '“\u7b49\u5f85\u9634\u6697\u9762\u751f\u6210”';
        if (tagsWrap) {
          tagsWrap.innerHTML = '';
          [
            formatWechatMbtiPersonaTag('INTJ'),
            '\u5b8c\u7f8e\u4e3b\u4e49',
            '\u5931\u7720\u75c7'
          ].forEach((label) => tagsWrap.appendChild(buildWechatVoiceTag(label)));
        }
      };
      if (!contact || currentContactId == null) {
        applyDefaultPanel();
        return;
      }
      const [thoughtEntry, stateEntry, diaryEntry] = await Promise.all([
        loadSchedules(currentContactId, { kind: 'thought', limit: 1 }).then((rows) => rows[0] || null),
        loadSchedules(currentContactId, { kind: 'state', limit: 1 }).then((rows) => rows[0] || null),
        loadSchedules(currentContactId, { kind: 'diary', limit: 1 }).then((rows) => rows[0] || null)
      ]);
      const thought = thoughtEntry && thoughtEntry.thought ? thoughtEntry.thought : null;
      const state = stateEntry && stateEntry.state ? stateEntry.state : null;
      const diary = diaryEntry && diaryEntry.diary ? diaryEntry.diary : null;
      const profile = getWechatContactPersonaProfile(contact);
      const hasGeneratedProfile = !!(contact.wechatPersonaProfile && contact.wechatPersonaProfile.generatedAt);
      if (!hasGeneratedProfile && !contact.__miniPersonaProfilePending) {
        contact.__miniPersonaProfilePending = true;
        Promise.resolve()
          .then(() => ensureWechatContactPersonaProfile(currentContactId, { force: false, silent: true }))
          .catch(() => null)
          .finally(() => {
            delete contact.__miniPersonaProfilePending;
          });
      }
      if (voiceName) {
        voiceName.textContent = '';
        const primaryNode = document.createElement('span');
        primaryNode.className = 'w-voice-name-cn';
        primaryNode.textContent = profile.primaryName;
        voiceName.appendChild(primaryNode);
        if (profile.romanizedName) {
          const secondaryNode = document.createElement('span');
          secondaryNode.className = 'w-voice-name-en';
          secondaryNode.textContent = profile.romanizedName;
          voiceName.appendChild(secondaryNode);
        }
      }
      if (voiceSub) voiceSub.textContent = profile.profession || '\u8eab\u4efd\u672a\u660e';
      if (texts[0]) {
        texts[0].textContent = formatWechatQuotedPanelText(
          thought && (thought.content || thought.summary),
          '\u7b49\u5f85\u5fc3\u58f0\u751f\u6210',
          25
        );
      }
      if (texts[1]) {
        texts[1].textContent = formatWechatQuotedPanelText(
          state && (state.summary || state.phase || state.mood),
          '\u7b49\u5f85\u9634\u6697\u9762\u751f\u6210',
          25
        );
      }
      if (tagsWrap) {
        const tags = [
          formatWechatMbtiPersonaTag(profile.mbti, 'INTJ'),
          profile.ideologyTag || '\u5b8c\u7f8e\u4e3b\u4e49',
          profile.syndromeTag || '\u5931\u7720\u75c7'
        ];
        tagsWrap.innerHTML = '';
        tags.forEach((label) => tagsWrap.appendChild(buildWechatVoiceTag(label)));
      }
      document.querySelectorAll('.profile-avatar-big,.w-voice-photo,.msg-avatar.contact-trigger').forEach((el) => {
        setAvatarSurface(el, index || 0, { role: 'contact', contact });
      });
      document.querySelectorAll('.msg-avatar.user-trigger').forEach((el) => {
        setAvatarSurface(el, index || 0, { role: 'user', contact });
      });
    }

    function fillWechatDiaryDetail(entry) {
      const diary = entry && entry.diary ? entry.diary : {};
      const detailPage = document.getElementById('diary-detail-page');
      if (!detailPage) return;
      detailPage.dataset.entryId = String(entry.id);
      const dateNode = document.getElementById('dd-date');
      const titleNode = document.getElementById('dd-title');
      const locationNode = document.getElementById('dd-location');
      const moodNode = document.getElementById('dd-mood');
      const textNode = document.getElementById('dd-text');
      if (dateNode) dateNode.textContent = formatWechatDiaryDate(diary.writtenAt || entry.updatedAt || entry.createdAt);
      if (titleNode) titleNode.textContent = diary.title || '\u672a\u547d\u540d\u6761\u76ee';
      if (locationNode) locationNode.textContent = `LOC: ${diary.location || '\u672a\u6807\u8bb0'} / P: ${formatWechatProbabilityLabel(entry.probability, '--')}`;
      if (moodNode) moodNode.textContent = `MOOD: ${diary.mood || '\u672a\u6807\u8bb0'}`;
      if (textNode) textNode.textContent = diary.content || diary.preview || '\u6682\u65e0\u5185\u5bb9';
      detailPage.classList.add('active');
    }

    async function renderWechatDiaryTimeline(currentContactId) {
      const container = document.getElementById('timeline-content');
      if (!container) return;
      container.innerHTML = '';
      if (currentContactId == null) {
        const empty = document.createElement('div');
        empty.className = 'mini-empty-state';
        empty.style.margin = '20px';
        empty.textContent = '\u8bf7\u5148\u9009\u62e9\u8054\u7cfb\u4eba\u3002';
        container.appendChild(empty);
        return;
      }
      const entries = await loadSchedules(currentContactId, { kind: 'diary', limit: 48 });
      if (!entries.length) {
        const empty = document.createElement('div');
        empty.className = 'mini-empty-state';
        empty.style.margin = '20px';
        empty.textContent = '\u6682\u65e0\u65e5\u8bb0\u6761\u76ee\u3002\u65b0\u7684\u5bf9\u8bdd\u4ea7\u51fa\u540e\uff0c\u4f1a\u53ea\u5199\u5165\u5f53\u524d\u89d2\u8272\u81ea\u5df1\u7684\u6761\u76ee\u3002';
        container.appendChild(empty);
        return;
      }
      entries.forEach((entry) => {
        const diary = entry.diary || {};
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.addEventListener('click', () => {
          void window.openDiaryDetail(entry.id);
        });
        const dot = document.createElement('div');
        dot.className = 'timeline-dot';
        const date = document.createElement('div');
        date.className = 'timeline-date';
        date.textContent = formatWechatDiaryDate(diary.writtenAt || entry.updatedAt || entry.createdAt);
        const card = document.createElement('div');
        card.className = 'timeline-card';
        const meta = document.createElement('div');
        meta.className = 'timeline-meta';
        const metaItems = [
          diary.location || '\u672a\u6807\u8bb0',
          diary.mood || '\u672a\u6807\u8bb0',
          `P ${formatWechatProbabilityLabel(entry.probability, '--')}`
        ];
        metaItems.forEach((label) => {
          const tag = document.createElement('span');
          tag.className = 'meta-tag';
          tag.textContent = label;
          meta.appendChild(tag);
        });
        const title = document.createElement('div');
        title.className = 'timeline-title';
        title.textContent = diary.title || '\u672a\u547d\u540d\u6761\u76ee';
        const preview = document.createElement('div');
        preview.className = 'timeline-preview';
        preview.textContent = clampWechatPanelText(diary.preview || diary.content || '\u6682\u65e0\u9884\u89c8', '\u6682\u65e0\u9884\u89c8', 120);
        card.appendChild(meta);
        card.appendChild(title);
        card.appendChild(preview);
        item.appendChild(dot);
        item.appendChild(date);
        item.appendChild(card);
        container.appendChild(item);
      });
    }

    async function refreshWechatDiaryIfVisible(currentContactId) {
      const listPage = document.getElementById('diary-list-page');
      if (listPage && listPage.classList.contains('active')) {
        await renderWechatDiaryTimeline(currentContactId);
      }
      const detailPage = document.getElementById('diary-detail-page');
      const openId = detailPage ? Number(detailPage.dataset.entryId) : NaN;
      if (detailPage && detailPage.classList.contains('active') && Number.isFinite(openId)) {
        const entry = await getScheduleEntry(currentContactId, openId);
        if (entry && entry.kind === 'diary') fillWechatDiaryDetail(entry);
      }
    }

    async function updateWechatDetail(contact, index) {
      const currentContactId = getWechatCurrentContactId(contact);
      clearWechatMultiSelectMode();
      const title = document.getElementById('header-title-btn');
      if (title) title.textContent = isWechatTypingActiveFor(contact, index) ? '\u5bf9\u65b9\u6b63\u5728\u8f93\u5165...' : getWechatDefaultTitle(contact);
      document.querySelectorAll('.profile-name-big').forEach((el) => { el.textContent = getWechatContactLabel(contact); });
      await applyWechatProfileDefaults(contact, index);
      document.querySelectorAll('.profile-avatar-big,.w-voice-photo,.msg-avatar.contact-trigger').forEach((el) => {
        setAvatarSurface(el, index || 0, { role: 'contact', contact });
      });
      document.querySelectorAll('.msg-avatar.user-trigger').forEach((el) => {
        setAvatarSurface(el, index || 0, { role: 'user', contact });
      });
      document.querySelectorAll('.stat-box').forEach((box, statIndex) => {
        const value = box.querySelector('.stat-val');
        const label = box.querySelector('.stat-lbl');
        if (value && label) {
          const values = ['23876', '4598', '9999+'];
          const labels = ['Following', 'Follower', 'Like'];
          value.textContent = values[statIndex] || '--';
          label.textContent = labels[statIndex] || 'Info';
        }
      });
      await renderWechatThoughtPanel(currentContactId, contact, index);
      await renderWechatThread(currentContactId, contact, index);
      applyWechatThreadWallpaper(contact);
      await refreshWechatDiaryIfVisible(currentContactId);
      syncWechatComposerState(contact);
    }

    function dedupeWechatContactsForUi(contacts = []) {
      const order = [];
      const bestByKey = new Map();
      (contacts || []).forEach((contact, index) => {
        if (!contact) return;
        const key = buildDuplicateContactFingerprint(contact) || `id:${contact.id != null ? contact.id : index}`;
        if (!bestByKey.has(key)) {
          order.push(key);
          bestByKey.set(key, contact);
          return;
        }
        bestByKey.set(key, chooseCanonicalContact(bestByKey.get(key), contact));
      });
      return order.map((key) => bestByKey.get(key)).filter(Boolean);
    }

    function bindWechatChatItemInteractions(row, contact, index) {
      if (!row) return;
      let pressTimer = 0;
      let startX = 0;
      let startY = 0;

      function clearPressTimer() {
        if (!pressTimer) return;
        window.clearTimeout(pressTimer);
        pressTimer = 0;
      }

      function suppressRowClick() {
        row.dataset.miniWechatSuppressClickUntil = String(Date.now() + 320);
      }

      row.addEventListener('pointerdown', (event) => {
        if (event.button != null && event.button !== 0) return;
        clearPressTimer();
        startX = Number(event.clientX) || 0;
        startY = Number(event.clientY) || 0;
        pressTimer = window.setTimeout(() => {
          pressTimer = 0;
          suppressRowClick();
          showWechatThreadActionSheet(contact, index);
        }, wechatThreadLongPressMs);
      });

      row.addEventListener('pointermove', (event) => {
        if (!pressTimer) return;
        const deltaX = Math.abs((Number(event.clientX) || 0) - startX);
        const deltaY = Math.abs((Number(event.clientY) || 0) - startY);
        if (deltaX > 8 || deltaY > 8) clearPressTimer();
      });

      ['pointerup', 'pointerleave', 'pointercancel'].forEach((eventName) => {
        row.addEventListener(eventName, clearPressTimer);
      });

      row.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        clearPressTimer();
        suppressRowClick();
        showWechatThreadActionSheet(contact, index);
      });

      row.addEventListener('click', (event) => {
        const until = Number(row.dataset.miniWechatSuppressClickUntil || 0);
        if (until > Date.now()) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return;
        }
        void selectWechatContact(index, true);
      }, true);
    }

    async function renderWechatConversationList() {
      const list = document.querySelector('#page-messages .chat-list');
      const visibleContacts = getCurrentWechatContacts();
      const allContacts = getWechatAllContacts();
      const pinnedKeys = new Set(getWechatThreadListStateSync().pinnedKeys);
      if (!list) return;
      list.innerHTML = '';
      if (!allContacts.length) {
        const empty = document.createElement('div');
        empty.className = 'mini-empty-state';
        empty.textContent = '\u6682\u65e0\u8054\u7cfb\u4eba\u3002\u8bf7\u5148\u5728\u8054\u7cfb\u4eba\u9875\u6dfb\u52a0\uff0c\u518d\u901a\u8fc7\u53f3\u4e0a\u89d2\u53d1\u8d77\u804a\u5929\u3002';
        list.appendChild(empty);
        return;
      }
      if (!visibleContacts.length) {
        const empty = document.createElement('div');
        empty.className = 'mini-empty-state';
        empty.textContent = '\u6682\u65e0\u5bf9\u8bdd\u3002\u8bf7\u901a\u8fc7\u53f3\u4e0a\u89d2 + \u91cd\u65b0\u6dfb\u52a0\uff0c\u957f\u6309\u6761\u76ee\u53ef\u7f6e\u9876\u6216\u5220\u9664\u3002';
        list.appendChild(empty);
        return;
      }
      const previews = await Promise.all(visibleContacts.map((contact) => getWechatThreadPreview(getWechatCurrentContactId(contact), contact)));
      visibleContacts.forEach((contact, index) => {
        const contactKey = getWechatContactKey(contact, index);
        const isPinned = pinnedKeys.has(contactKey);
        const row = document.createElement('div');
        row.className = `chat-item${isPinned ? ' is-pinned' : ''}`;
        row.dataset.wechatContactKey = contactKey;
        row.innerHTML = [
          '<div class="chat-avatar"></div>',
          '<div class="chat-info">',
          '<div class="chat-top">',
          `<div class="chat-name-group"><span class="chat-name"></span>${isPinned ? '<span class="chat-pin-badge">PINNED</span>' : ''}</div>`,
          '<span class="chat-time"></span>',
          '</div>',
          '<div class="chat-msg"></div>',
          '</div>'
        ].join('');
        const avatar = row.querySelector('.chat-avatar');
        const name = row.querySelector('.chat-name');
        const time = row.querySelector('.chat-time');
        const msg = row.querySelector('.chat-msg');
        const preview = previews[index];
        if (name) name.textContent = getWechatContactLabel(contact);
        if (time) time.textContent = preview.time;
        if (msg) msg.textContent = preview.text;
        setAvatarSurface(avatar, index, { role: 'contact', contact });
        bindWechatChatItemInteractions(row, contact, index);
        list.appendChild(row);
      });
    }

    async function refreshWechatConversationUi(options = {}) {
      const previousContacts = getCurrentWechatContacts().slice();
      const previousIndex = Number(window.__miniCurrentWechatContactIndex);
      const previousContact = Number.isInteger(previousIndex) && previousIndex >= 0 ? previousContacts[previousIndex] || null : null;
      const fallbackKey = sanitizeWechatText(options.selectionKey) || (previousContact ? getWechatContactKey(previousContact, previousIndex) : '');
      const allContacts = getWechatAllContacts();
      const threadState = await reconcileWechatThreadListStateForContacts(allContacts);
      window.__miniWechatContacts = buildVisibleWechatContacts(allContacts, threadState);
      await renderWechatConversationList();
      renderWechatLauncherContacts();
      if (window.__miniWechatContacts.length) {
        let nextIndex = fallbackKey
          ? window.__miniWechatContacts.findIndex((contact, index) => getWechatContactKey(contact, index) === fallbackKey)
          : -1;
        if (nextIndex < 0) nextIndex = 0;
        await selectWechatContact(nextIndex, !!options.openDetail);
      } else {
        window.__miniCurrentWechatContactIndex = -1;
        await updateWechatDetail(null, 0);
        if (options.closeDetail && typeof window.closeChatDetail === 'function') window.closeChatDetail();
      }
      return getCurrentWechatContacts();
    }

    async function toggleWechatThreadPinned(contactKey) {
      const safeKey = sanitizeWechatText(contactKey);
      if (!safeKey) return;
      const wasPinned = getWechatThreadListStateSync().pinnedKeys.includes(safeKey);
      await updateWechatThreadListState((state) => {
        const hiddenKeys = state.hiddenKeys.filter((key) => key !== safeKey);
        const pinnedKeys = state.pinnedKeys.filter((key) => key !== safeKey);
        if (!wasPinned) pinnedKeys.unshift(safeKey);
        return { hiddenKeys, pinnedKeys };
      });
      await refreshWechatConversationUi({ selectionKey: safeKey });
      if (typeof showMiniNotice === 'function') {
        showMiniNotice(wasPinned ? '\u5df2\u53d6\u6d88\u7f6e\u9876' : '\u5df2\u7f6e\u9876\u5bf9\u8bdd');
      }
    }

    async function revealWechatConversation(contactKey, options = {}) {
      const safeKey = sanitizeWechatText(contactKey);
      if (!safeKey) return null;
      const wasHidden = getWechatThreadListStateSync().hiddenKeys.includes(safeKey);
      await updateWechatThreadListState((state) => ({
        hiddenKeys: state.hiddenKeys.filter((key) => key !== safeKey),
        pinnedKeys: state.pinnedKeys.slice()
      }));
      await refreshWechatConversationUi({ selectionKey: safeKey, openDetail: !!options.openDetail });
      if (wasHidden && options.notice !== false && typeof showMiniNotice === 'function') {
        showMiniNotice('\u5df2\u6dfb\u52a0\u5bf9\u8bdd');
      }
      return findWechatContactByKey(safeKey);
    }

    async function deleteWechatConversation(contactKey) {
      const safeKey = sanitizeWechatText(contactKey);
      const contact = findWechatContactByKey(safeKey);
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) return;
      const contactLabel = getWechatContactLabel(contact) || 'THIS CONTACT';
      if (window.confirm && !window.confirm(`DELETE CHAT WITH ${contactLabel}?\nCHAT HISTORY, MEMORIES, AND DERIVED STATE WILL BE REMOVED.`)) {
        return;
      }
      const contactsOps = await getWechatRoleDataOps().catch(() => null);
      if (contactsOps && typeof contactsOps.deleteContactUniverse === 'function') {
        await contactsOps.deleteContactUniverse(currentContactId);
      }
      await updateWechatThreadListState((state) => ({
        hiddenKeys: [safeKey].concat(state.hiddenKeys.filter((key) => key !== safeKey)),
        pinnedKeys: state.pinnedKeys.filter((key) => key !== safeKey)
      }));
      if (window.__miniWechatComposer && String(window.__miniWechatComposer.quoteChatId || '') === String(currentContactId)) {
        clearWechatQuoteDraft();
      }
      delete getWechatTypingMap()[getWechatContactKey(contact)];
      await refreshWechatConversationUi({ closeDetail: true });
      if (typeof showMiniNotice === 'function') {
        showMiniNotice('\u5bf9\u8bdd\u5df2\u5220\u9664');
      }
    }

    function ensureWechatThreadActionSheet() {
      let overlay = document.getElementById('mini-wechat-thread-sheet');
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.id = 'mini-wechat-thread-sheet';
      overlay.className = 'modal-overlay mini-wechat-thread-sheet';
      overlay.innerHTML = [
        '<div class="modal-box" onclick="event.stopPropagation()">',
        '<div class="modal-header mini-wechat-thread-sheet-title"></div>',
        '<div class="mini-wechat-thread-sheet-subtitle"></div>',
        '<div class="mini-wechat-thread-sheet-actions">',
        '<button type="button" class="mini-wechat-thread-sheet-btn" data-action="pin"></button>',
        '<button type="button" class="mini-wechat-thread-sheet-btn danger" data-action="delete">DELETE CHAT</button>',
        '</div>',
        '<button type="button" class="mini-wechat-thread-sheet-cancel" data-action="cancel">CANCEL</button>',
        '</div>'
      ].join('');
      document.body.appendChild(overlay);
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) hideWechatThreadActionSheet();
      });
      const cancelButton = overlay.querySelector('[data-action="cancel"]');
      const pinButton = overlay.querySelector('[data-action="pin"]');
      const deleteButton = overlay.querySelector('[data-action="delete"]');
      if (cancelButton) cancelButton.addEventListener('click', hideWechatThreadActionSheet);
      if (pinButton) {
        pinButton.addEventListener('click', async () => {
          const key = sanitizeWechatText(overlay.dataset.contactKey);
          hideWechatThreadActionSheet();
          if (!key) return;
          await toggleWechatThreadPinned(key);
        });
      }
      if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
          const key = sanitizeWechatText(overlay.dataset.contactKey);
          hideWechatThreadActionSheet();
          if (!key) return;
          await deleteWechatConversation(key);
        });
      }
      window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && overlay.classList.contains('show')) {
          hideWechatThreadActionSheet();
        }
      });
      return overlay;
    }

    function hideWechatThreadActionSheet() {
      const overlay = document.getElementById('mini-wechat-thread-sheet');
      if (!overlay) return;
      overlay.classList.remove('show');
      overlay.style.display = 'none';
      delete overlay.dataset.contactKey;
    }

    function showWechatThreadActionSheet(contact, index) {
      if (!contact) return;
      const overlay = ensureWechatThreadActionSheet();
      const contactKey = getWechatContactKey(contact, index);
      const title = overlay.querySelector('.mini-wechat-thread-sheet-title');
      const subtitle = overlay.querySelector('.mini-wechat-thread-sheet-subtitle');
      const pinButton = overlay.querySelector('[data-action="pin"]');
      const pinned = isWechatThreadPinned(contact, index);
      overlay.dataset.contactKey = contactKey;
      if (title) title.textContent = sanitizeWechatText(getWechatContactLabel(contact)).toUpperCase();
      if (subtitle) subtitle.textContent = pinned
        ? 'THIS CHAT IS PINNED'
        : 'PIN OR DELETE THIS CHAT';
      if (pinButton) pinButton.textContent = pinned ? 'UNPIN CHAT' : 'PIN CHAT';
      overlay.style.display = 'flex';
      overlay.classList.add('show');
    }

    async function applyWechatData(contacts) {
      const previous = getCurrentWechatSelection();
      const previousKey = previous.contact ? getWechatContactKey(previous.contact, previous.index) : '';
      const hydratedContacts = await hydrateWechatContactsForUi(contacts);
      window.__miniWechatAllContacts = dedupeWechatContactsForUi(hydratedContacts);
      await migrateLegacyWechatThreads(window.__miniWechatAllContacts);
      renderWechatMomentsEmptyState();
      await refreshWechatConversationUi({ selectionKey: previousKey });
    }

    async function selectWechatContact(index, openDetail = false) {
      const contacts = getCurrentWechatContacts();
      const contact = contacts[index] || null;
      hideWechatIncomingBanner();
      if (!contact) {
        await updateWechatDetail(null, 0);
        return;
      }
      window.__miniCurrentWechatContactIndex = index;
      await updateWechatDetail(contact, index);
      if (openDetail) {
        if (typeof window.openChatDetail === 'function') window.openChatDetail();
        else {
          const detailPage = document.getElementById('chat-detail-page');
          if (detailPage) detailPage.classList.add('active');
        }
      }
    }

    function ensureWechatQuoteDraftBar(bar) {
      if (!bar) return null;
      let draft = bar.querySelector('.mini-wechat-quote-draft');
      if (draft) return draft;
      draft = document.createElement('div');
      draft.className = 'mini-wechat-quote-draft';
      draft.innerHTML = [
        '<div class="mini-wechat-quote-copy">',
        '<div class="mini-wechat-quote-title">\u56de\u590d</div>',
        '<div class="mini-wechat-quote-text"></div>',
        '</div>',
        '<button type="button" class="mini-wechat-quote-close" aria-label="\u53d6\u6d88\u5f15\u7528">\u00d7</button>'
      ].join('');
      const closeButton = draft.querySelector('.mini-wechat-quote-close');
      if (closeButton) {
        closeButton.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          clearWechatQuoteDraft();
        });
      }
      bar.insertBefore(draft, bar.firstChild);
      return draft;
    }

    function syncWechatQuoteDraftUi() {
      const state = window.__miniWechatComposer;
      if (!state || !state.bar) return;
      const draft = ensureWechatQuoteDraftBar(state.bar);
      if (!draft) return;
      const active = !!state.quoteMessage;
      draft.classList.toggle('is-visible', active);
      if (active) {
        const titleNode = draft.querySelector('.mini-wechat-quote-title');
        const textNode = draft.querySelector('.mini-wechat-quote-text');
        if (titleNode) titleNode.textContent = 'Reply to ' + getWechatMessageActorName(state.quoteMessage) + ':';
        if (textNode) textNode.textContent = getWechatMessageCompactPreviewText(state.quoteMessage);
      }
    }

    function setWechatQuoteDraft(message) {
      const state = window.__miniWechatComposer;
      if (!state || !message) return;
      state.quoteMessage = cloneWechatMessageForPayload(message, { chatId: message.chatId });
      state.quoteMessageKey = getWechatMessageStableKey(message);
      state.quoteChatId = message.chatId;
      syncWechatQuoteDraftUi();
      if (state.textarea) state.textarea.focus();
      if (typeof showMiniNotice === 'function') showMiniNotice('\u5df2\u8fdb\u5165\u5f15\u7528\u72b6\u6001');
    }

    function clearWechatQuoteDraft() {
      const state = window.__miniWechatComposer;
      if (!state) return;
      state.quoteMessage = null;
      state.quoteMessageKey = '';
      state.quoteChatId = null;
      syncWechatQuoteDraftUi();
    }

    function clearWechatQuoteDraftIfMatches(keys = []) {
      const state = window.__miniWechatComposer;
      if (!state || !state.quoteMessageKey) return;
      const wanted = new Set((keys || []).map((value) => String(value)).filter(Boolean));
      if (!wanted.has(String(state.quoteMessageKey))) return;
      clearWechatQuoteDraft();
    }

    function getWechatVoiceComposerState() {
      if (!window.__miniWechatVoiceComposer) {
        window.__miniWechatVoiceComposer = {
          overlay: null,
          textarea: null,
          lockNode: null,
          durationNode: null,
          jsonNode: null,
          sendButton: null,
          lockChatId: null,
          lockContactKey: '',
          lockContactLabel: ''
        };
      }
      return window.__miniWechatVoiceComposer;
    }

    function isWechatVoiceComposerScopeValid(lockChatId, lockContactKey) {
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) return false;
      return String(lockChatId) === String(currentContactId) && String(lockContactKey || '') === getWechatContactKey(contact, index);
    }

    function refreshWechatVoiceComposerPreview() {
      const state = getWechatVoiceComposerState();
      if (!state.durationNode || !state.sendButton) return;
      const transcript = sanitizeWechatText(state.textarea && state.textarea.value);
      const voiceObject = buildWechatStrictVoiceObject(transcript);
      state.durationNode.textContent = formatWechatVoiceDurationLabel(voiceObject.durationSec);
      const allowed = !!transcript && isWechatVoiceComposerScopeValid(state.lockChatId, state.lockContactKey);
      state.sendButton.disabled = !allowed;
      state.sendButton.style.opacity = allowed ? '1' : '0.45';
      state.sendButton.style.cursor = allowed ? 'pointer' : 'not-allowed';
    }

    function closeWechatVoiceComposer(clearInput = true) {
      const state = getWechatVoiceComposerState();
      if (state.overlay) state.overlay.classList.remove('show');
      if (clearInput && state.textarea) state.textarea.value = '';
      if (clearInput) {
        state.lockChatId = null;
        state.lockContactKey = '';
        state.lockContactLabel = '';
        if (state.lockNode) state.lockNode.textContent = 'CHAT NOT LOCKED';
      }
      refreshWechatVoiceComposerPreview();
    }

    function ensureWechatVoiceComposerModal() {
      const state = getWechatVoiceComposerState();
      if (state.overlay && state.overlay.isConnected) return state;

      const overlay = document.createElement('div');
      overlay.id = 'mini-wechat-voice-compose-modal';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = [
        '<div class="modal-box mini-wechat-voice-modal" onclick="event.stopPropagation()">',
        '<div class="modal-header">VOICE MESSAGE</div>',
        '<textarea class="flat-textarea mini-wechat-voice-input" placeholder="Type voice content..."></textarea>',
        '<div class="mini-wechat-voice-meta"><span class="mini-wechat-voice-lock">CHAT NOT LOCKED</span><strong class="mini-wechat-voice-duration-preview">1"</strong></div>',
        '<div class="modal-actions">',
        '<button type="button" class="btn-secondary" data-action="cancel">CANCEL</button>',
        '<button type="button" class="btn-primary" data-action="send">SEND</button>',
        '</div>',
        '</div>'
      ].join('');

      const textarea = overlay.querySelector('.mini-wechat-voice-input');
      const lockNode = overlay.querySelector('.mini-wechat-voice-lock');
      const durationNode = overlay.querySelector('.mini-wechat-voice-duration-preview');
      const cancelButton = overlay.querySelector('[data-action="cancel"]');
      const sendButton = overlay.querySelector('[data-action="send"]');

      state.overlay = overlay;
      state.textarea = textarea;
      state.lockNode = lockNode;
      state.durationNode = durationNode;
      state.jsonNode = null;
      state.sendButton = sendButton;

      if (textarea) {
        textarea.addEventListener('input', () => {
          refreshWechatVoiceComposerPreview();
        });
        textarea.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            closeWechatVoiceComposer(true);
            return;
          }
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            void submitWechatVoiceComposer();
          }
        });
      }
      if (cancelButton) {
        cancelButton.addEventListener('click', (event) => {
          event.preventDefault();
          closeWechatVoiceComposer(true);
        });
      }
      if (sendButton) {
        sendButton.addEventListener('click', (event) => {
          event.preventDefault();
          void submitWechatVoiceComposer();
        });
      }
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeWechatVoiceComposer(true);
      });

      document.body.appendChild(overlay);
      refreshWechatVoiceComposerPreview();
      return state;
    }

    function openWechatVoiceComposer() {
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) {
        showMiniNotice('\u8bf7\u5148\u901a\u8fc7\u53f3\u4e0a\u89d2\u9009\u62e9\u8054\u7cfb\u4eba');
        return;
      }
      const state = ensureWechatVoiceComposerModal();
      state.lockChatId = currentContactId;
      state.lockContactKey = getWechatContactKey(contact, index);
      state.lockContactLabel = getWechatContactLabel(contact) || '\u5f53\u524d\u4f1a\u8bdd';
      if (state.lockNode) state.lockNode.textContent = 'LOCKED: ' + state.lockContactLabel;
      if (state.textarea) state.textarea.value = '';
      const extPanel = document.getElementById('ext-panel');
      if (extPanel) extPanel.style.display = 'none';
      refreshWechatVoiceComposerPreview();
      state.overlay.classList.add('show');
      if (state.textarea) state.textarea.focus();
    }

    async function submitWechatVoiceComposer() {
      const state = ensureWechatVoiceComposerModal();
      const transcript = sanitizeWechatText(state.textarea && state.textarea.value);
      if (!transcript) {
        showMiniNotice('\u8bf7\u8f93\u5165\u8bed\u97f3\u5185\u5bb9');
        if (state.textarea) state.textarea.focus();
        return;
      }
      if (!isWechatVoiceComposerScopeValid(state.lockChatId, state.lockContactKey)) {
        closeWechatVoiceComposer(true);
        showMiniNotice('\u5f53\u524d\u4f1a\u8bdd\u5df2\u5207\u6362\uff0c\u5df2\u963b\u6b62\u4e32\u89d2\u8272\u53d1\u9001');
        return;
      }
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) {
        showMiniNotice('\u8bf7\u5148\u901a\u8fc7\u53f3\u4e0a\u89d2\u9009\u62e9\u8054\u7cfb\u4eba');
        return;
      }
      const voiceObject = buildWechatStrictVoiceObject(transcript);
      const extPanel = document.getElementById('ext-panel');
      if (extPanel) extPanel.style.display = 'none';
      if (state.sendButton) {
        state.sendButton.disabled = true;
        state.sendButton.style.opacity = '0.45';
        state.sendButton.style.cursor = 'not-allowed';
      }
      try {
        const sentType = voiceObject.type;
        const entry = await saveMessage(currentContactId, {
          chatId: currentContactId,
          direction: 'sent',
          type: sentType,
          timestamp: Date.now(),
          payload: {
            transcript: normalizeWechatLocalizedContent(voiceObject.transcript, voiceObject.transcript),
            durationSec: voiceObject.durationSec
          }
        });
        if (entry) await appendWechatThreadEntryToUi(currentContactId, contact, index, entry);
        await refreshWechatListPreview(index);
        closeWechatVoiceComposer(true);
        await triggerWechatAutoReplyForSentMessage(contact, index, sentType);
      } finally {
        refreshWechatVoiceComposerPreview();
      }
    }

    function bindWechatVoiceComposerTrigger() {
      const voiceItem = Array.from(document.querySelectorAll('#ext-panel .ext-item')).find((item) => {
        const labelNode = item.querySelector('.ext-label');
        const text = sanitizeWechatText(labelNode && labelNode.textContent).toLowerCase();
        return text === 'voice' || text === '\u8bed\u97f3';
      });
      if (!voiceItem || voiceItem.dataset.miniWechatVoiceBound === '1') return;
      voiceItem.dataset.miniWechatVoiceBound = '1';
      voiceItem.style.cursor = 'pointer';
      voiceItem.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openWechatVoiceComposer();
      }, true);
    }

    function syncWechatVoiceComposerState(contact) {
      const state = window.__miniWechatVoiceComposer;
      if (!state || !state.overlay || !state.overlay.classList.contains('show')) return;
      const { index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      const currentKey = contact && currentContactId != null ? getWechatContactKey(contact, index) : '';
      if (!contact || currentContactId == null || String(state.lockChatId) !== String(currentContactId) || state.lockContactKey !== currentKey) {
        closeWechatVoiceComposer(true);
        showMiniNotice('\u4f1a\u8bdd\u5df2\u5207\u6362\uff0c\u8bed\u97f3\u8349\u7a3f\u5df2\u5173\u95ed');
        return;
      }
      if (state.lockNode && state.lockContactLabel) state.lockNode.textContent = 'LOCKED: ' + state.lockContactLabel;
      refreshWechatVoiceComposerPreview();
    }

    function getWechatCameraComposerState() {
      if (!window.__miniWechatCameraComposer) {
        window.__miniWechatCameraComposer = {
          overlay: null,
          textarea: null,
          lockNode: null,
          countNode: null,
          sendButton: null,
          lockChatId: null,
          lockContactKey: '',
          lockContactLabel: ''
        };
      }
      return window.__miniWechatCameraComposer;
    }

    function isWechatCameraComposerScopeValid(lockChatId, lockContactKey) {
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) return false;
      return String(lockChatId) === String(currentContactId) && String(lockContactKey || '') === getWechatContactKey(contact, index);
    }

    function refreshWechatCameraComposerPreview() {
      const state = getWechatCameraComposerState();
      if (!state.sendButton) return;
      const description = sanitizeWechatText(state.textarea && state.textarea.value);
      if (state.countNode) state.countNode.textContent = String(description.length) + ' CHAR';
      const allowed = !!description && isWechatCameraComposerScopeValid(state.lockChatId, state.lockContactKey);
      state.sendButton.disabled = !allowed;
      state.sendButton.style.opacity = allowed ? '1' : '0.45';
      state.sendButton.style.cursor = allowed ? 'pointer' : 'not-allowed';
    }

    function closeWechatCameraComposer(clearInput = true) {
      const state = getWechatCameraComposerState();
      if (state.overlay) state.overlay.classList.remove('show');
      if (clearInput && state.textarea) state.textarea.value = '';
      if (clearInput) {
        state.lockChatId = null;
        state.lockContactKey = '';
        state.lockContactLabel = '';
        if (state.lockNode) state.lockNode.textContent = 'CHAT NOT LOCKED';
      }
      refreshWechatCameraComposerPreview();
    }

    function ensureWechatCameraComposerModal() {
      const state = getWechatCameraComposerState();
      if (state.overlay && state.overlay.isConnected) return state;

      const overlay = document.createElement('div');
      overlay.id = 'mini-wechat-camera-compose-modal';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = [
        '<div class="modal-box mini-wechat-camera-modal" onclick="event.stopPropagation()">',
        '<div class="modal-header">CAMERA SHOT</div>',
        '<textarea class="flat-textarea mini-wechat-camera-input" placeholder="Describe what you captured..."></textarea>',
        '<div class="mini-wechat-camera-meta"><span class="mini-wechat-camera-lock">CHAT NOT LOCKED</span><strong class="mini-wechat-camera-count">0 CHAR</strong></div>',
        '<div class="modal-actions">',
        '<button type="button" class="btn-secondary" data-action="cancel">CANCEL</button>',
        '<button type="button" class="btn-primary" data-action="send">SEND</button>',
        '</div>',
        '</div>'
      ].join('');

      const textarea = overlay.querySelector('.mini-wechat-camera-input');
      const lockNode = overlay.querySelector('.mini-wechat-camera-lock');
      const countNode = overlay.querySelector('.mini-wechat-camera-count');
      const cancelButton = overlay.querySelector('[data-action="cancel"]');
      const sendButton = overlay.querySelector('[data-action="send"]');

      state.overlay = overlay;
      state.textarea = textarea;
      state.lockNode = lockNode;
      state.countNode = countNode;
      state.sendButton = sendButton;

      if (textarea) {
        textarea.addEventListener('input', () => {
          refreshWechatCameraComposerPreview();
        });
        textarea.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            closeWechatCameraComposer(true);
            return;
          }
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            void submitWechatCameraComposer();
          }
        });
      }
      if (cancelButton) {
        cancelButton.addEventListener('click', (event) => {
          event.preventDefault();
          closeWechatCameraComposer(true);
        });
      }
      if (sendButton) {
        sendButton.addEventListener('click', (event) => {
          event.preventDefault();
          void submitWechatCameraComposer();
        });
      }
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeWechatCameraComposer(true);
      });

      document.body.appendChild(overlay);
      refreshWechatCameraComposerPreview();
      return state;
    }

    function openWechatCameraComposer() {
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) {
        showMiniNotice('\u8bf7\u5148\u901a\u8fc7\u53f3\u4e0a\u89d2\u9009\u62e9\u8054\u7cfb\u4eba');
        return;
      }
      const state = ensureWechatCameraComposerModal();
      state.lockChatId = currentContactId;
      state.lockContactKey = getWechatContactKey(contact, index);
      state.lockContactLabel = getWechatContactLabel(contact) || '\u5f53\u524d\u4f1a\u8bdd';
      if (state.lockNode) state.lockNode.textContent = 'LOCKED: ' + state.lockContactLabel;
      if (state.textarea) state.textarea.value = '';
      const extPanel = document.getElementById('ext-panel');
      if (extPanel) extPanel.style.display = 'none';
      refreshWechatCameraComposerPreview();
      state.overlay.classList.add('show');
      if (state.textarea) state.textarea.focus();
    }

    async function submitWechatCameraComposer() {
      const state = ensureWechatCameraComposerModal();
      const description = sanitizeWechatText(state.textarea && state.textarea.value);
      if (!description) {
        showMiniNotice('\u8bf7\u8f93\u5165\u62cd\u6444\u5185\u5bb9');
        if (state.textarea) state.textarea.focus();
        return;
      }
      if (!isWechatCameraComposerScopeValid(state.lockChatId, state.lockContactKey)) {
        closeWechatCameraComposer(true);
        showMiniNotice('\u5f53\u524d\u4f1a\u8bdd\u5df2\u5207\u6362\uff0c\u5df2\u963b\u6b62\u4e32\u89d2\u8272\u53d1\u9001');
        return;
      }
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) {
        showMiniNotice('\u8bf7\u5148\u901a\u8fc7\u53f3\u4e0a\u89d2\u9009\u62e9\u8054\u7cfb\u4eba');
        return;
      }
      const extPanel = document.getElementById('ext-panel');
      if (extPanel) extPanel.style.display = 'none';
      if (state.sendButton) {
        state.sendButton.disabled = true;
        state.sendButton.style.opacity = '0.45';
        state.sendButton.style.cursor = 'not-allowed';
      }
      try {
        const sentType = 'photo';
        const entry = await saveMessage(currentContactId, {
          chatId: currentContactId,
          direction: 'sent',
          type: sentType,
          timestamp: Date.now(),
          payload: {
            assetId: 'camera_note_card',
            origin: 'camera_generated',
            description: normalizeWechatLocalizedContent(description, description)
          }
        });
        if (entry) await appendWechatThreadEntryToUi(currentContactId, contact, index, entry);
        await refreshWechatListPreview(index);
        closeWechatCameraComposer(true);
        await triggerWechatAutoReplyForSentMessage(contact, index, sentType);
      } finally {
        refreshWechatCameraComposerPreview();
      }
    }

    function bindWechatCameraComposerTrigger() {
      const cameraItem = document.querySelector('#ext-panel [data-wechat-feature="camera"]')
        || Array.from(document.querySelectorAll('#ext-panel .ext-item')).find((item) => {
          const labelNode = item.querySelector('.ext-label');
          const text = sanitizeWechatText(labelNode && labelNode.textContent).toLowerCase();
          return text === 'camera' || text === '\u76f8\u673a';
        });
      if (!cameraItem || cameraItem.dataset.miniWechatCameraBound === '1') return;
      cameraItem.dataset.miniWechatCameraBound = '1';
      cameraItem.style.cursor = 'pointer';
      cameraItem.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openWechatCameraComposer();
      }, true);
    }

    function syncWechatCameraComposerState(contact) {
      const state = window.__miniWechatCameraComposer;
      if (!state || !state.overlay || !state.overlay.classList.contains('show')) return;
      const { index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      const currentKey = contact && currentContactId != null ? getWechatContactKey(contact, index) : '';
      if (!contact || currentContactId == null || String(state.lockChatId) !== String(currentContactId) || state.lockContactKey !== currentKey) {
        closeWechatCameraComposer(true);
        showMiniNotice('\u4f1a\u8bdd\u5df2\u5207\u6362\uff0c\u76f8\u673a\u8349\u7a3f\u5df2\u5173\u95ed');
        return;
      }
      if (state.lockNode && state.lockContactLabel) state.lockNode.textContent = 'LOCKED: ' + state.lockContactLabel;
      refreshWechatCameraComposerPreview();
    }

    function readWechatFileAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    }

    function readWechatImageDimensions(src) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          resolve({
            width: Math.max(0, Number(image.naturalWidth || image.width) || 0),
            height: Math.max(0, Number(image.naturalHeight || image.height) || 0)
          });
        };
        image.onerror = () => reject(new Error('Failed to decode image'));
        image.src = src;
      });
    }

    function getWechatImageComposerState() {
      if (!window.__miniWechatImageComposer) {
        window.__miniWechatImageComposer = {
          overlay: null,
          fileInput: null,
          previewNode: null,
          metaNode: null,
          originalInput: null,
          lockNode: null,
          sendButton: null,
          lockChatId: null,
          lockContactKey: '',
          lockContactLabel: '',
          pendingAsset: null
        };
      }
      return window.__miniWechatImageComposer;
    }

    function isWechatImageComposerScopeValid(lockChatId, lockContactKey) {
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) return false;
      return String(lockChatId) === String(currentContactId) && String(lockContactKey || '') === getWechatContactKey(contact, index);
    }

    function renderWechatImageComposerPreview() {
      const state = getWechatImageComposerState();
      const asset = state.pendingAsset;
      if (state.previewNode) {
        state.previewNode.innerHTML = '';
        state.previewNode.classList.toggle('is-empty', !asset);
        if (!asset || !asset.dataUrl) {
          state.previewNode.textContent = 'NO LOCAL IMAGE SELECTED';
        } else {
          const image = document.createElement('img');
          image.src = asset.dataUrl;
          image.alt = sanitizeWechatText(asset.fileName) || 'Image';
          state.previewNode.appendChild(image);
        }
      }
      if (state.metaNode) {
        if (!asset) {
          state.metaNode.textContent = 'SELECT A LOCAL IMAGE BEFORE SENDING';
        } else {
          const parts = [
            sanitizeWechatText(asset.fileName),
            asset.width && asset.height ? (String(asset.width) + ' x ' + String(asset.height)) : '',
            formatWechatImageBytes(asset.sizeBytes),
            asset.original ? '\u539f\u56fe' : ''
          ].filter(Boolean);
          state.metaNode.textContent = parts.join(' / ');
        }
      }
      if (state.originalInput) {
        state.originalInput.disabled = !asset;
        state.originalInput.checked = !!(asset && asset.original);
      }
      if (state.sendButton) {
        const allowed = !!(asset && asset.dataUrl) && isWechatImageComposerScopeValid(state.lockChatId, state.lockContactKey);
        state.sendButton.disabled = !allowed;
        state.sendButton.style.opacity = allowed ? '1' : '0.45';
        state.sendButton.style.cursor = allowed ? 'pointer' : 'not-allowed';
      }
    }

    function closeWechatImageComposer(clearSelection = true) {
      const state = getWechatImageComposerState();
      if (state.overlay) state.overlay.classList.remove('show');
      if (clearSelection) {
        state.pendingAsset = null;
        state.lockChatId = null;
        state.lockContactKey = '';
        state.lockContactLabel = '';
        if (state.fileInput) state.fileInput.value = '';
        if (state.lockNode) state.lockNode.textContent = 'CHAT NOT LOCKED';
      }
      renderWechatImageComposerPreview();
    }

    async function handleWechatImageComposerFileChange(event) {
      const state = getWechatImageComposerState();
      const file = event && event.target && event.target.files ? event.target.files[0] : null;
      if (!file) {
        renderWechatImageComposerPreview();
        return;
      }
      const safeName = sanitizeWechatText(file.name);
      const safeType = sanitizeWechatText(file.type).toLowerCase();
      if (safeType && !safeType.startsWith('image/')) {
        state.pendingAsset = null;
        renderWechatImageComposerPreview();
        showMiniNotice('\u8bf7\u9009\u62e9\u56fe\u7247\u6587\u4ef6');
        return;
      }
      try {
        const dataUrl = await readWechatFileAsDataUrl(file);
        const size = await readWechatImageDimensions(dataUrl);
        state.pendingAsset = {
          dataUrl,
          fileName: safeName,
          mimeType: safeType,
          width: size.width,
          height: size.height,
          sizeBytes: Math.max(0, Number(file.size) || 0),
          original: !!(state.originalInput && state.originalInput.checked)
        };
      } catch (error) {
        state.pendingAsset = null;
        showMiniNotice('\u8bfb\u53d6\u56fe\u7247\u5931\u8d25');
      } finally {
        if (state.fileInput) state.fileInput.value = '';
        renderWechatImageComposerPreview();
      }
    }

    function ensureWechatImageComposerModal() {
      const state = getWechatImageComposerState();
      if (state.overlay && state.overlay.isConnected) return state;

      const overlay = document.createElement('div');
      overlay.id = 'mini-wechat-image-compose-modal';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = [
        '<div class="modal-box mini-wechat-image-modal" onclick="event.stopPropagation()">',
        '<div class="modal-header">IMAGE</div>',
        '<input class="mini-wechat-image-file-input" type="file" accept="image/*">',
        '<button type="button" class="btn-secondary mini-wechat-image-picker-btn" data-action="pick">SELECT LOCAL IMAGE</button>',
        '<div class="mini-wechat-image-preview is-empty"></div>',
        '<div class="mini-wechat-image-meta">SELECT A LOCAL IMAGE BEFORE SENDING</div>',
        '<label class="mini-wechat-image-original-toggle"><input type="checkbox" data-action="original"><span>\u539f\u56fe</span></label>',
        '<div class="mini-wechat-camera-meta"><span class="mini-wechat-camera-lock">CHAT NOT LOCKED</span><strong>LOCAL FILE</strong></div>',
        '<div class="modal-actions">',
        '<button type="button" class="btn-secondary" data-action="cancel">CANCEL</button>',
        '<button type="button" class="btn-primary" data-action="send">SEND</button>',
        '</div>',
        '</div>'
      ].join('');

      const fileInput = overlay.querySelector('.mini-wechat-image-file-input');
      const pickButton = overlay.querySelector('[data-action="pick"]');
      const previewNode = overlay.querySelector('.mini-wechat-image-preview');
      const metaNode = overlay.querySelector('.mini-wechat-image-meta');
      const originalInput = overlay.querySelector('[data-action="original"]');
      const lockNode = overlay.querySelector('.mini-wechat-camera-lock');
      const cancelButton = overlay.querySelector('[data-action="cancel"]');
      const sendButton = overlay.querySelector('[data-action="send"]');

      state.overlay = overlay;
      state.fileInput = fileInput;
      state.previewNode = previewNode;
      state.metaNode = metaNode;
      state.originalInput = originalInput;
      state.lockNode = lockNode;
      state.sendButton = sendButton;

      if (fileInput) {
        fileInput.addEventListener('change', (event) => {
          void handleWechatImageComposerFileChange(event);
        });
      }
      if (pickButton) {
        pickButton.addEventListener('click', (event) => {
          event.preventDefault();
          if (state.fileInput) state.fileInput.click();
        });
      }
      if (originalInput) {
        originalInput.addEventListener('change', () => {
          if (state.pendingAsset) state.pendingAsset.original = !!originalInput.checked;
          renderWechatImageComposerPreview();
        });
      }
      if (cancelButton) {
        cancelButton.addEventListener('click', (event) => {
          event.preventDefault();
          closeWechatImageComposer(true);
        });
      }
      if (sendButton) {
        sendButton.addEventListener('click', (event) => {
          event.preventDefault();
          void submitWechatImageComposer();
        });
      }
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeWechatImageComposer(true);
      });

      document.body.appendChild(overlay);
      renderWechatImageComposerPreview();
      return state;
    }

    function openWechatImageComposer() {
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) {
        showMiniNotice('\u8bf7\u5148\u901a\u8fc7\u53f3\u4e0a\u89d2\u9009\u62e9\u8054\u7cfb\u4eba');
        return;
      }
      const state = ensureWechatImageComposerModal();
      state.lockChatId = currentContactId;
      state.lockContactKey = getWechatContactKey(contact, index);
      state.lockContactLabel = getWechatContactLabel(contact) || '\u5f53\u524d\u4f1a\u8bdd';
      state.pendingAsset = null;
      if (state.fileInput) state.fileInput.value = '';
      if (state.lockNode) state.lockNode.textContent = 'LOCKED: ' + state.lockContactLabel;
      const extPanel = document.getElementById('ext-panel');
      if (extPanel) extPanel.style.display = 'none';
      renderWechatImageComposerPreview();
      if (state.overlay) state.overlay.classList.add('show');
      if (state.fileInput) state.fileInput.click();
    }

    async function submitWechatImageComposer() {
      const state = ensureWechatImageComposerModal();
      const asset = state.pendingAsset;
      if (!asset || !asset.dataUrl) {
        showMiniNotice('\u8bf7\u5148\u9009\u62e9\u672c\u5730\u56fe\u7247');
        return;
      }
      if (!isWechatImageComposerScopeValid(state.lockChatId, state.lockContactKey)) {
        closeWechatImageComposer(true);
        showMiniNotice('\u5f53\u524d\u4f1a\u8bdd\u5df2\u5207\u6362\uff0c\u5df2\u963b\u6b62\u4e32\u89d2\u8272\u53d1\u9001');
        return;
      }
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) {
        showMiniNotice('\u8bf7\u5148\u901a\u8fc7\u53f3\u4e0a\u89d2\u9009\u62e9\u8054\u7cfb\u4eba');
        return;
      }
      const extPanel = document.getElementById('ext-panel');
      if (extPanel) extPanel.style.display = 'none';
      if (state.sendButton) {
        state.sendButton.disabled = true;
        state.sendButton.style.opacity = '0.45';
        state.sendButton.style.cursor = 'not-allowed';
      }
      const descriptionText = sanitizeWechatText(asset.fileName).replace(/\.[^.]+$/, '') || '\u56fe\u7247';
      try {
        const sentType = 'image';
        const entry = await saveMessage(currentContactId, {
          chatId: currentContactId,
          direction: 'sent',
          type: sentType,
          timestamp: Date.now(),
          payload: {
            assetId: 'local_image_asset',
            origin: 'local_upload',
            description: normalizeWechatLocalizedContent(descriptionText, descriptionText),
            dataUrl: asset.dataUrl,
            fileName: sanitizeWechatText(asset.fileName),
            mimeType: sanitizeWechatText(asset.mimeType),
            width: Math.max(0, Number(asset.width) || 0),
            height: Math.max(0, Number(asset.height) || 0),
            sizeBytes: Math.max(0, Number(asset.sizeBytes) || 0),
            original: !!asset.original
          }
        });
        if (entry) await appendWechatThreadEntryToUi(currentContactId, contact, index, entry);
        await refreshWechatListPreview(index);
        closeWechatImageComposer(true);
        await triggerWechatAutoReplyForSentMessage(contact, index, sentType);
      } finally {
        renderWechatImageComposerPreview();
      }
    }

    function bindWechatImageComposerTrigger() {
      const imageItem = document.querySelector('#ext-panel [data-wechat-feature="image"]')
        || Array.from(document.querySelectorAll('#ext-panel .ext-item')).find((item) => {
          const labelNode = item.querySelector('.ext-label');
          const text = sanitizeWechatText(labelNode && labelNode.textContent).toLowerCase();
          return text === 'image' || text === 'images' || text === 'photos' || text === '\u56fe\u7247';
        });
      if (!imageItem || imageItem.dataset.miniWechatImageBound === '1') return;
      imageItem.dataset.miniWechatImageBound = '1';
      imageItem.style.cursor = 'pointer';
      imageItem.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openWechatImageComposer();
      }, true);
    }

    function syncWechatImageComposerState(contact) {
      const state = window.__miniWechatImageComposer;
      if (!state || !state.overlay || !state.overlay.classList.contains('show')) return;
      const { index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      const currentKey = contact && currentContactId != null ? getWechatContactKey(contact, index) : '';
      if (!contact || currentContactId == null || String(state.lockChatId) !== String(currentContactId) || state.lockContactKey !== currentKey) {
        closeWechatImageComposer(true);
        showMiniNotice('\u4f1a\u8bdd\u5df2\u5207\u6362\uff0c\u56fe\u7247\u8349\u7a3f\u5df2\u5173\u95ed');
        return;
      }
      if (state.lockNode && state.lockContactLabel) state.lockNode.textContent = 'LOCKED: ' + state.lockContactLabel;
      renderWechatImageComposerPreview();
    }

    function normalizeWechatLocationDistanceInput(value) {
      const raw = String(value == null ? '' : value).replace(/[^\d.]/g, '').trim();
      if (!raw) return null;
      const numeric = Number(raw);
      if (!Number.isFinite(numeric) || numeric < 0) return null;
      return numeric;
    }

    function trimWechatLocationZeros(value, fractionDigits) {
      return Number(value).toFixed(fractionDigits).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
    }

    function formatWechatLocationDistanceLabel(value) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric) || numeric < 0) return '--';
      if (numeric >= 1000) {
        const precision = numeric >= 10000 ? 0 : 1;
        return `${trimWechatLocationZeros(numeric / 1000, precision)} KM`;
      }
      const precision = numeric >= 100 ? 0 : 1;
      return `${trimWechatLocationZeros(numeric, precision)} M`;
    }

    function hashWechatLocationSeed(value) {
      const input = String(value == null ? '' : value);
      let hash = 2166136261;
      for (let index = 0; index < input.length; index += 1) {
        hash ^= input.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return hash >>> 0;
    }

    function deriveWechatLocationCoordinates(name, address, distanceMeters) {
      const seed = hashWechatLocationSeed(`${name}|${address}|${distanceMeters}`);
      const lat = 22 + ((seed % 240000) / 10000);
      const lng = 100 + (((seed >>> 8) % 220000) / 10000);
      return {
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4))
      };
    }

    function buildWechatLocationRenderModel(message) {
      const normalized = normalizeWechatThreadEntry(message, { chatId: message && message.chatId });
      const fallbackPayload = message && message.payload && typeof message.payload === 'object'
        ? message.payload
        : (message && typeof message === 'object' ? message : {});
      const payload = normalized && normalized.payload ? normalized.payload : fallbackPayload;
      const nameValue = normalizeWechatLocalizedContent(payload.name || (message && message.name), 'Location');
      const addressValue = normalizeWechatLocalizedContent(payload.address || (message && message.address), '');
      const name = getWechatLocalizedContentText(nameValue, 'Location') || 'Location';
      const address = getWechatLocalizedContentText(addressValue, '');
      const distanceMeters = Math.max(0, Number(payload.distanceMeters != null ? payload.distanceMeters : (message && message.distanceMeters)) || 0);
      let lat = Number(payload.lat != null ? payload.lat : (message && message.lat));
      let lng = Number(payload.lng != null ? payload.lng : (message && message.lng));
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || (!lat && !lng)) {
        const derived = deriveWechatLocationCoordinates(name, address, distanceMeters);
        lat = derived.lat;
        lng = derived.lng;
      }
      lat = Number((Number.isFinite(lat) ? lat : 0).toFixed(4));
      lng = Number((Number.isFinite(lng) ? lng : 0).toFixed(4));

      const seed = hashWechatLocationSeed(`${name}|${address}|${distanceMeters}|${lat}|${lng}`);
      return {
        message: normalized || message || null,
        name,
        address,
        nameValue,
        addressValue,
        distanceMeters,
        distanceLabel: formatWechatLocationDistanceLabel(distanceMeters),
        lat,
        lng,
        coordinatesLabel: `LAT ${lat.toFixed(4)} / LNG ${lng.toFixed(4)}`,
        pinX: 28 + (seed % 42),
        pinY: 30 + ((seed >>> 6) % 34),
        roadA: -22 + ((seed >>> 12) % 38),
        roadB: -30 + ((seed >>> 18) % 50),
        roadC: -18 + ((seed >>> 24) % 36),
        northLabel: `N-${String(10 + (seed % 90)).padStart(2, '0')}`,
        eastLabel: `E-${String(10 + ((seed >>> 9) % 90)).padStart(2, '0')}`
      };
    }

    function buildWechatLocationMapMarkup(data, variant = 'bubble') {
      const mapClass = variant === 'detail' ? 'mini-wechat-location-map is-detail' : 'mini-wechat-location-map is-bubble';
      return [
        `<div class="${mapClass}" style="--mini-location-pin-x:${data.pinX}%; --mini-location-pin-y:${data.pinY}%; --mini-location-road-a:${data.roadA}deg; --mini-location-road-b:${data.roadB}deg; --mini-location-road-c:${data.roadC}deg;">`,
        '<div class="mini-wechat-location-grid is-major"></div>',
        '<div class="mini-wechat-location-grid is-minor"></div>',
        '<div class="mini-wechat-location-terrain is-one"></div>',
        '<div class="mini-wechat-location-terrain is-two"></div>',
        '<div class="mini-wechat-location-route is-one"></div>',
        '<div class="mini-wechat-location-route is-two"></div>',
        '<div class="mini-wechat-location-route is-three"></div>',
        '<div class="mini-wechat-location-ring"></div>',
        '<div class="mini-wechat-location-pin"></div>',
        `<div class="mini-wechat-location-legend is-north">${escapeHtml(data.northLabel)}</div>`,
        `<div class="mini-wechat-location-legend is-east">${escapeHtml(data.eastLabel)}</div>`,
        '</div>'
      ].join('');
    }

    function buildWechatLocationCardMarkup(data) {
      return [
        '<div class="mini-wechat-location-copy">',
        '<div class="mini-wechat-location-kicker">Place</div>',
        `<div class="mini-wechat-location-name">${escapeHtml(data.name || 'Location')}</div>`,
        '</div>',
        '<div class="mini-wechat-location-copy">',
        '<div class="mini-wechat-location-kicker">Distance</div>',
        `<div class="mini-wechat-location-distance">${escapeHtml(data.distanceLabel)}</div>`,
        '</div>',
        `<div class="mini-wechat-location-map-shell">${buildWechatLocationMapMarkup(data, 'bubble')}</div>`
      ].join('');
    }

    function getWechatLocationDetailState() {
      if (!window.__miniWechatLocationDetail) {
        window.__miniWechatLocationDetail = {
          overlay: null,
          body: null
        };
      }
      return window.__miniWechatLocationDetail;
    }

    function closeWechatLocationDetailModal() {
      const state = getWechatLocationDetailState();
      if (state.overlay) state.overlay.classList.remove('show');
    }

    function ensureWechatLocationDetailModal() {
      const state = getWechatLocationDetailState();
      if (state.overlay && state.overlay.isConnected) return state;

      const overlay = document.createElement('div');
      overlay.id = 'mini-wechat-location-detail-modal';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = [
        '<div class="modal-box mini-wechat-location-detail-modal" onclick="event.stopPropagation()">',
        '<div class="modal-header">LOCATION DETAIL</div>',
        '<div class="mini-wechat-location-detail-body"></div>',
        '<div class="modal-actions">',
        '<button type="button" class="btn-secondary" data-action="close">CLOSE</button>',
        '</div>',
        '</div>'
      ].join('');

      const closeButton = overlay.querySelector('[data-action="close"]');
      state.overlay = overlay;
      state.body = overlay.querySelector('.mini-wechat-location-detail-body');

      if (closeButton) {
        closeButton.addEventListener('click', (event) => {
          event.preventDefault();
          closeWechatLocationDetailModal();
        });
      }
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeWechatLocationDetailModal();
      });

      document.body.appendChild(overlay);
      return state;
    }

    function openWechatLocationDetailModal(message) {
      const state = ensureWechatLocationDetailModal();
      const data = buildWechatLocationRenderModel(message);
      if (!state.body || !data) {
        showMiniNotice('Location data is unavailable');
        return;
      }
      state.body.innerHTML = '';

      const summary = document.createElement('div');
      summary.className = 'mini-wechat-location-detail-summary';

      const kicker = document.createElement('div');
      kicker.className = 'mini-wechat-location-detail-kicker';
      kicker.textContent = 'Pinned Place';

      const name = document.createElement('div');
      name.className = 'mini-wechat-location-detail-name';
      appendWechatLocalizedTextBlock(name, data.nameValue || data.name, {
        primaryClass: 'mini-wechat-location-detail-name-primary',
        dividerClass: 'mini-wechat-location-detail-divider',
        secondaryClass: 'mini-wechat-location-detail-name-secondary'
      });

      const distance = document.createElement('div');
      distance.className = 'mini-wechat-location-detail-distance';
      distance.textContent = data.distanceLabel;

      summary.appendChild(kicker);
      summary.appendChild(name);
      summary.appendChild(distance);

      const mapShell = document.createElement('div');
      mapShell.className = 'mini-wechat-location-detail-map-shell';
      mapShell.innerHTML = buildWechatLocationMapMarkup(data, 'detail');

      const notes = document.createElement('div');
      notes.className = 'mini-wechat-location-detail-notes';
      const notesLabel = document.createElement('div');
      notesLabel.className = 'mini-wechat-location-detail-label';
      notesLabel.textContent = 'Detail Location';
      const notesText = document.createElement('div');
      notesText.className = 'mini-wechat-location-detail-text';
      appendWechatLocalizedTextBlock(notesText, data.addressValue || data.address || 'No detailed location.', {
        primaryClass: 'mini-wechat-location-detail-text-primary',
        dividerClass: 'mini-wechat-location-detail-divider',
        secondaryClass: 'mini-wechat-location-detail-text-secondary'
      });
      notes.appendChild(notesLabel);
      notes.appendChild(notesText);

      const coordinates = document.createElement('div');
      coordinates.className = 'mini-wechat-location-detail-notes';
      const coordinatesLabel = document.createElement('div');
      coordinatesLabel.className = 'mini-wechat-location-detail-label';
      coordinatesLabel.textContent = 'Coordinates';
      const coordinatesText = document.createElement('div');
      coordinatesText.className = 'mini-wechat-location-detail-text mini-wechat-location-detail-text-primary';
      coordinatesText.textContent = data.coordinatesLabel;
      coordinates.appendChild(coordinatesLabel);
      coordinates.appendChild(coordinatesText);

      state.body.appendChild(summary);
      state.body.appendChild(mapShell);
      state.body.appendChild(notes);
      state.body.appendChild(coordinates);
      const extPanel = document.getElementById('ext-panel');
      if (extPanel) extPanel.style.display = 'none';
      state.overlay.classList.add('show');
    }

    function renderWechatLocationBubbleContent(bubble, message) {
      const fallbackToText = () => {
        const fallback = document.createElement('div');
        fallback.className = 'mini-wechat-bubble-primary';
        fallback.textContent = getWechatMessagePreviewText(message) || 'Location';
        bubble.appendChild(fallback);
        bubble.classList.remove('is-location-message');
      };
      try {
        const data = buildWechatLocationRenderModel(message);
        if (!data) {
          fallbackToText();
          return;
        }
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'mini-wechat-location-card';

        const placeCopy = document.createElement('div');
        placeCopy.className = 'mini-wechat-location-copy';
        const placeKicker = document.createElement('div');
        placeKicker.className = 'mini-wechat-location-kicker';
        placeKicker.textContent = 'Place';
        const placeName = document.createElement('div');
        placeName.className = 'mini-wechat-location-name';
        appendWechatLocalizedTextBlock(placeName, data.nameValue || data.name, {
          primaryClass: 'mini-wechat-location-name-primary',
          dividerClass: 'mini-wechat-location-name-divider',
          secondaryClass: 'mini-wechat-location-name-secondary'
        });
        placeCopy.appendChild(placeKicker);
        placeCopy.appendChild(placeName);

        const distanceCopy = document.createElement('div');
        distanceCopy.className = 'mini-wechat-location-copy';
        const distanceKicker = document.createElement('div');
        distanceKicker.className = 'mini-wechat-location-kicker';
        distanceKicker.textContent = 'Distance';
        const distanceValue = document.createElement('div');
        distanceValue.className = 'mini-wechat-location-distance';
        distanceValue.textContent = data.distanceLabel;
        distanceCopy.appendChild(distanceKicker);
        distanceCopy.appendChild(distanceValue);

        const mapShell = document.createElement('div');
        mapShell.className = 'mini-wechat-location-map-shell';
        mapShell.innerHTML = buildWechatLocationMapMarkup(data, 'bubble');

        card.appendChild(placeCopy);
        card.appendChild(distanceCopy);
        card.appendChild(mapShell);
        card.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          openWechatLocationDetailModal(message);
        });
        bubble.appendChild(card);
      } catch (error) {
        console.error('Render WeChat location bubble failed', error);
        fallbackToText();
      }
    }

    function getWechatLocationComposerState() {
      if (!window.__miniWechatLocationComposer) {
        window.__miniWechatLocationComposer = {
          overlay: null,
          nameInput: null,
          distanceInput: null,
          detailInput: null,
          lockNode: null,
          unitNode: null,
          sendButton: null,
          lockChatId: null,
          lockContactKey: '',
          lockContactLabel: ''
        };
      }
      return window.__miniWechatLocationComposer;
    }

    function isWechatLocationComposerScopeValid(lockChatId, lockContactKey) {
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) return false;
      return String(lockChatId) === String(currentContactId) && String(lockContactKey || '') === getWechatContactKey(contact, index);
    }

    function refreshWechatLocationComposerPreview() {
      const state = getWechatLocationComposerState();
      if (!state.sendButton) return;
      const name = sanitizeWechatText(state.nameInput && state.nameInput.value);
      const detail = sanitizeWechatText(state.detailInput && state.detailInput.value);
      const distanceValue = normalizeWechatLocationDistanceInput(state.distanceInput && state.distanceInput.value);
      if (state.unitNode) state.unitNode.textContent = distanceValue == null ? 'AUTO UNIT' : formatWechatLocationDistanceLabel(distanceValue);
      const allowed = !!name && !!detail && distanceValue != null && isWechatLocationComposerScopeValid(state.lockChatId, state.lockContactKey);
      state.sendButton.disabled = !allowed;
      state.sendButton.style.opacity = allowed ? '1' : '0.45';
      state.sendButton.style.cursor = allowed ? 'pointer' : 'not-allowed';
    }

    function closeWechatLocationComposer(clearInput = true) {
      const state = getWechatLocationComposerState();
      if (state.overlay) state.overlay.classList.remove('show');
      if (clearInput) {
        if (state.nameInput) state.nameInput.value = '';
        if (state.distanceInput) state.distanceInput.value = '';
        if (state.detailInput) state.detailInput.value = '';
        state.lockChatId = null;
        state.lockContactKey = '';
        state.lockContactLabel = '';
        if (state.lockNode) state.lockNode.textContent = 'CHAT NOT LOCKED';
      }
      refreshWechatLocationComposerPreview();
    }

    function ensureWechatLocationComposerModal() {
      const state = getWechatLocationComposerState();
      if (state.overlay && state.overlay.isConnected) return state;

      const overlay = document.createElement('div');
      overlay.id = 'mini-wechat-location-compose-modal';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = [
        '<div class="modal-box mini-wechat-location-modal" onclick="event.stopPropagation()">',
        '<div class="modal-header">LOCATION</div>',
        '<div class="mini-wechat-location-field">',
        '<label class="mini-wechat-location-label"><span>Location</span></label>',
        '<input type="text" class="flat-input mini-wechat-location-name-input" placeholder="Enter place name">',
        '</div>',
        '<div class="mini-wechat-location-field">',
        '<label class="mini-wechat-location-label"><span>Distance</span><span class="mini-wechat-location-note">Number Only / Auto Unit</span></label>',
        '<input type="number" class="flat-input mini-wechat-location-distance-input" placeholder="1200" inputmode="decimal" min="0" step="0.1">',
        '</div>',
        '<div class="mini-wechat-location-field">',
        '<label class="mini-wechat-location-label"><span>Detail Location</span></label>',
        '<textarea class="flat-textarea mini-wechat-location-textarea mini-wechat-location-detail-input" placeholder="Enter detailed location"></textarea>',
        '</div>',
        '<div class="mini-wechat-location-meta"><span class="mini-wechat-location-lock">CHAT NOT LOCKED</span><strong class="mini-wechat-location-unit">AUTO UNIT</strong></div>',
        '<div class="modal-actions">',
        '<button type="button" class="btn-secondary" data-action="cancel">CANCEL</button>',
        '<button type="button" class="btn-primary" data-action="send">SEND</button>',
        '</div>',
        '</div>'
      ].join('');

      const nameInput = overlay.querySelector('.mini-wechat-location-name-input');
      const distanceInput = overlay.querySelector('.mini-wechat-location-distance-input');
      const detailInput = overlay.querySelector('.mini-wechat-location-detail-input');
      const lockNode = overlay.querySelector('.mini-wechat-location-lock');
      const unitNode = overlay.querySelector('.mini-wechat-location-unit');
      const cancelButton = overlay.querySelector('[data-action="cancel"]');
      const sendButton = overlay.querySelector('[data-action="send"]');

      state.overlay = overlay;
      state.nameInput = nameInput;
      state.distanceInput = distanceInput;
      state.detailInput = detailInput;
      state.lockNode = lockNode;
      state.unitNode = unitNode;
      state.sendButton = sendButton;

      [nameInput, distanceInput, detailInput].forEach((input) => {
        if (!input) return;
        input.addEventListener('input', refreshWechatLocationComposerPreview);
      });
      if (detailInput) {
        detailInput.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            closeWechatLocationComposer(true);
            return;
          }
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            void submitWechatLocationComposer();
          }
        });
      }
      if (cancelButton) {
        cancelButton.addEventListener('click', (event) => {
          event.preventDefault();
          closeWechatLocationComposer(true);
        });
      }
      if (sendButton) {
        sendButton.addEventListener('click', (event) => {
          event.preventDefault();
          void submitWechatLocationComposer();
        });
      }
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeWechatLocationComposer(true);
      });

      document.body.appendChild(overlay);
      refreshWechatLocationComposerPreview();
      return state;
    }

    function openWechatLocationComposer() {
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) {
        showMiniNotice('\u8bf7\u5148\u901a\u8fc7\u53f3\u4e0a\u89d2\u9009\u62e9\u8054\u7cfb\u4eba');
        return;
      }
      const state = ensureWechatLocationComposerModal();
      state.lockChatId = currentContactId;
      state.lockContactKey = getWechatContactKey(contact, index);
      state.lockContactLabel = getWechatContactLabel(contact) || '\u5f53\u524d\u4f1a\u8bdd';
      if (state.lockNode) state.lockNode.textContent = 'LOCKED: ' + state.lockContactLabel;
      if (state.nameInput) state.nameInput.value = '';
      if (state.distanceInput) state.distanceInput.value = '';
      if (state.detailInput) state.detailInput.value = '';
      const extPanel = document.getElementById('ext-panel');
      if (extPanel) extPanel.style.display = 'none';
      refreshWechatLocationComposerPreview();
      state.overlay.classList.add('show');
      if (state.nameInput) state.nameInput.focus();
    }

    async function submitWechatLocationComposer() {
      const state = ensureWechatLocationComposerModal();
      const name = sanitizeWechatText(state.nameInput && state.nameInput.value);
      const detail = sanitizeWechatText(state.detailInput && state.detailInput.value);
      const distanceValue = normalizeWechatLocationDistanceInput(state.distanceInput && state.distanceInput.value);
      if (!name || !detail || distanceValue == null) {
        showMiniNotice('\u8bf7\u586b\u5199\u5730\u70b9\u3001\u8ddd\u79bb\u548c\u8be6\u7ec6\u4f4d\u7f6e');
        if (!name && state.nameInput) state.nameInput.focus();
        else if (distanceValue == null && state.distanceInput) state.distanceInput.focus();
        else if (state.detailInput) state.detailInput.focus();
        return;
      }
      if (!isWechatLocationComposerScopeValid(state.lockChatId, state.lockContactKey)) {
        closeWechatLocationComposer(true);
        showMiniNotice('\u5f53\u524d\u4f1a\u8bdd\u5df2\u5207\u6362\uff0c\u5df2\u963b\u6b62\u4e32\u89d2\u8272\u53d1\u9001');
        return;
      }
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) {
        showMiniNotice('\u8bf7\u5148\u901a\u8fc7\u53f3\u4e0a\u89d2\u9009\u62e9\u8054\u7cfb\u4eba');
        return;
      }
      const extPanel = document.getElementById('ext-panel');
      if (extPanel) extPanel.style.display = 'none';
      if (state.sendButton) {
        state.sendButton.disabled = true;
        state.sendButton.style.opacity = '0.45';
        state.sendButton.style.cursor = 'not-allowed';
      }
      const distanceMeters = Number(distanceValue.toFixed(distanceValue >= 100 ? 0 : 1));
      const coordinates = deriveWechatLocationCoordinates(name, detail, distanceMeters);
      try {
        const sentType = 'location';
        const entry = await saveMessage(currentContactId, {
          chatId: currentContactId,
          direction: 'sent',
          type: sentType,
          timestamp: Date.now(),
          payload: {
            name: normalizeWechatLocalizedContent(name, name),
            address: normalizeWechatLocalizedContent(detail, detail),
            distanceMeters,
            lat: coordinates.lat,
            lng: coordinates.lng
          }
        });
        closeWechatLocationComposer(true);
        if (entry) {
          try {
            await appendWechatThreadEntryToUi(currentContactId, contact, index, entry);
          } catch (error) {
            console.error('Append WeChat location entry failed', error);
            await renderWechatThread(currentContactId, contact, index);
          }
        }
        try {
          await refreshWechatListPreview(index);
        } catch (error) {
          console.error('Refresh WeChat list preview after location send failed', error);
        }
        await triggerWechatAutoReplyForSentMessage(contact, index, sentType);
      } catch (error) {
        console.error('Submit WeChat location composer failed', error);
        showMiniNotice('Location send failed, please retry');
      } finally {
        refreshWechatLocationComposerPreview();
      }
    }

    function bindWechatLocationComposerTrigger() {
      const locationItem = document.querySelector('#ext-panel [data-wechat-feature="location"]')
        || Array.from(document.querySelectorAll('#ext-panel .ext-item')).find((item) => {
          const labelNode = item.querySelector('.ext-label');
          const text = sanitizeWechatText(labelNode && labelNode.textContent).toLowerCase();
          return text === 'location' || text === '\u5b9a\u4f4d' || text === '\u4f4d\u7f6e';
        });
      if (!locationItem || locationItem.dataset.miniWechatLocationBound === '1') return;
      locationItem.dataset.miniWechatLocationBound = '1';
      locationItem.style.cursor = 'pointer';
      locationItem.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openWechatLocationComposer();
      }, true);
    }

    function syncWechatLocationComposerState(contact) {
      const state = window.__miniWechatLocationComposer;
      if (!state || !state.overlay || !state.overlay.classList.contains('show')) return;
      const { index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      const currentKey = contact && currentContactId != null ? getWechatContactKey(contact, index) : '';
      if (!contact || currentContactId == null || String(state.lockChatId) !== String(currentContactId) || state.lockContactKey !== currentKey) {
        closeWechatLocationComposer(true);
        showMiniNotice('\u4f1a\u8bdd\u5df2\u5207\u6362\uff0c\u5b9a\u4f4d\u8349\u7a3f\u5df2\u5173\u95ed');
        return;
      }
      if (state.lockNode && state.lockContactLabel) state.lockNode.textContent = 'LOCKED: ' + state.lockContactLabel;
      refreshWechatLocationComposerPreview();
    }

    function sortWechatStickerPickerRecords(left, right) {
      const leftOrder = Number(left && left.sortOrder);
      const rightOrder = Number(right && right.sortOrder);
      const safeLeftOrder = Number.isFinite(leftOrder) ? leftOrder : Number.MAX_SAFE_INTEGER;
      const safeRightOrder = Number.isFinite(rightOrder) ? rightOrder : Number.MAX_SAFE_INTEGER;
      if (safeLeftOrder !== safeRightOrder) return safeLeftOrder - safeRightOrder;
      const leftCreated = Number(left && (left.createdAt || left.created || left.updatedAt)) || 0;
      const rightCreated = Number(right && (right.createdAt || right.created || right.updatedAt)) || 0;
      if (leftCreated !== rightCreated) return leftCreated - rightCreated;
      return Number(left && left.id) - Number(right && right.id);
    }

    function getWechatStickerPickerState() {
      if (!window.__miniWechatStickerPicker) {
        window.__miniWechatStickerPicker = {
          root: null,
          groupsNode: null,
          gridNode: null,
          emptyNode: null,
          bar: null,
          trigger: null,
          groups: [],
          stickersByGroup: new Map(),
          activeGroupId: null,
          dismissBound: false
        };
      }
      return window.__miniWechatStickerPicker;
    }

    function closeWechatStickerPicker() {
      const state = getWechatStickerPickerState();
      if (state.root) state.root.classList.remove('is-visible');
      if (state.trigger) state.trigger.classList.remove('is-active');
    }

    function renderWechatStickerPicker() {
      const state = getWechatStickerPickerState();
      if (!state.groupsNode || !state.gridNode || !state.emptyNode) return;

      state.groupsNode.innerHTML = '';
      state.gridNode.innerHTML = '';

      const hasActiveGroup = state.groups.some((group) => String(group.id) === String(state.activeGroupId));
      if (!hasActiveGroup) {
        const firstGroup = state.groups.find((group) => {
          const stickers = state.stickersByGroup.get(String(group.id)) || [];
          return stickers.length > 0;
        }) || state.groups[0] || null;
        state.activeGroupId = firstGroup ? firstGroup.id : null;
      }

      state.groups.forEach((group) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mini-wechat-sticker-picker-group';
        if (String(group.id) === String(state.activeGroupId)) button.classList.add('active');
        button.textContent = sanitizeWechatText(group.name) || '\u672a\u547d\u540d';
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          state.activeGroupId = group.id;
          renderWechatStickerPicker();
        });
        state.groupsNode.appendChild(button);
      });

      const stickers = state.activeGroupId == null
        ? []
        : (state.stickersByGroup.get(String(state.activeGroupId)) || []);

      state.emptyNode.textContent = state.groups.length
        ? '\u5f53\u524d\u5206\u7ec4\u8fd8\u6ca1\u6709\u8868\u60c5\u5305\u3002'
        : '\u8fd8\u6ca1\u6709\u6dfb\u52a0\u8868\u60c5\u5305\u3002';
      state.emptyNode.classList.toggle('is-visible', stickers.length === 0);

      stickers.forEach((sticker) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mini-wechat-sticker-picker-card';
        button.disabled = !sanitizeWechatText(sticker && sticker.description);

        const thumb = document.createElement('div');
        thumb.className = 'mini-wechat-sticker-picker-thumb';
        const image = document.createElement('img');
        image.loading = 'lazy';
        image.alt = sanitizeWechatText(sticker && sticker.description) || 'sticker';
        image.src = sanitizeWechatText(sticker && sticker.url);
        thumb.appendChild(image);

        const desc = document.createElement('div');
        desc.className = 'mini-wechat-sticker-picker-desc';
        desc.textContent = sanitizeWechatText(sticker && sticker.description) || '\u672a\u547d\u540d';

        button.appendChild(thumb);
        button.appendChild(desc);
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          void sendWechatStickerFromPicker(sticker);
        });
        state.gridNode.appendChild(button);
      });
    }

    async function loadWechatStickerPickerData() {
      const miniDb = await waitForMiniDb();
      const wechatOps = miniDb && miniDb.ops && miniDb.ops.wechat;
      if (!wechatOps || !wechatOps.stickerGroups || !wechatOps.stickers) {
        return { groups: [], stickersByGroup: new Map() };
      }

      let groups = (await Promise.resolve(wechatOps.stickerGroups.list())).slice().sort(sortWechatStickerPickerRecords);
      let stickers = (await Promise.resolve(wechatOps.stickers.list())).slice();

      if (!groups.length && stickers.length && typeof wechatOps.stickerGroups.add === 'function') {
        await wechatOps.stickerGroups.add({ name: '\u9ed8\u8ba4', sortOrder: 0 });
        groups = (await Promise.resolve(wechatOps.stickerGroups.list())).slice().sort(sortWechatStickerPickerRecords);
      }

      stickers = stickers.sort((left, right) => {
        if (Number(left && left.groupId) !== Number(right && right.groupId)) {
          return Number(left && left.groupId) - Number(right && right.groupId);
        }
        return sortWechatStickerPickerRecords(left, right);
      });

      const fallbackGroupId = groups.length ? groups[0].id : null;
      const stickersByGroup = new Map(groups.map((group) => [String(group.id), []]));
      stickers.forEach((sticker) => {
        let groupKey = String(sticker && sticker.groupId);
        if (!stickersByGroup.has(groupKey) && fallbackGroupId != null) groupKey = String(fallbackGroupId);
        if (!stickersByGroup.has(groupKey)) return;
        stickersByGroup.get(groupKey).push(sticker);
      });

      return { groups, stickersByGroup };
    }

    function ensureWechatStickerPicker(bar, trigger) {
      const state = getWechatStickerPickerState();
      state.bar = bar || state.bar;
      state.trigger = trigger || state.trigger;
      if (state.root && state.root.isConnected) return state;
      if (!state.bar) return state;

      const root = document.createElement('div');
      root.className = 'mini-wechat-sticker-picker';

      const groupsNode = document.createElement('div');
      groupsNode.className = 'mini-wechat-sticker-picker-groups';

      const emptyNode = document.createElement('div');
      emptyNode.className = 'mini-wechat-sticker-picker-empty';

      const gridNode = document.createElement('div');
      gridNode.className = 'mini-wechat-sticker-picker-grid';

      root.appendChild(groupsNode);
      root.appendChild(emptyNode);
      root.appendChild(gridNode);
      root.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      state.root = root;
      state.groupsNode = groupsNode;
      state.emptyNode = emptyNode;
      state.gridNode = gridNode;

      if (state.bar.firstChild) state.bar.insertBefore(root, state.bar.firstChild);
      else state.bar.appendChild(root);

      if (!state.dismissBound) {
        state.dismissBound = true;
        document.addEventListener('click', (event) => {
          const current = getWechatStickerPickerState();
          if (!current.root || !current.root.classList.contains('is-visible')) return;
          if (current.root.contains(event.target) || (current.trigger && current.trigger.contains(event.target))) return;
          closeWechatStickerPicker();
        });
        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') closeWechatStickerPicker();
        });
      }

      return state;
    }

    async function openWechatStickerPicker(bar, trigger) {
      const { contact } = getCurrentWechatSelection();
      if (!contact) {
        showMiniNotice('\u8bf7\u5148\u901a\u8fc7\u53f3\u4e0a\u89d2\u9009\u62e9\u8054\u7cfb\u4eba');
        return;
      }
      const state = ensureWechatStickerPicker(bar, trigger);
      const extPanel = document.getElementById('ext-panel');
      if (extPanel) extPanel.style.display = 'none';
      const data = await loadWechatStickerPickerData();
      state.groups = data.groups;
      state.stickersByGroup = data.stickersByGroup;
      renderWechatStickerPicker();
      if (state.root) state.root.classList.add('is-visible');
      if (state.trigger) state.trigger.classList.add('is-active');
    }

    async function toggleWechatStickerPicker(bar, trigger) {
      const state = ensureWechatStickerPicker(bar, trigger);
      if (state.root && state.root.classList.contains('is-visible')) {
        closeWechatStickerPicker();
        return;
      }
      await openWechatStickerPicker(bar, trigger);
    }

    async function sendWechatStickerFromPicker(sticker) {
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) {
        showMiniNotice('\u8bf7\u5148\u901a\u8fc7\u53f3\u4e0a\u89d2\u9009\u62e9\u8054\u7cfb\u4eba');
        return;
      }
      const description = sanitizeWechatText(sticker && sticker.description);
      if (!description) {
        showMiniNotice('\u8be5\u8868\u60c5\u7f3a\u5c11\u63cf\u8ff0\uff0c\u65e0\u6cd5\u53d1\u9001');
        return;
      }
      const sentType = 'sticker';
      const entry = await saveMessage(currentContactId, {
        chatId: currentContactId,
        direction: 'sent',
        type: sentType,
        timestamp: Date.now(),
        payload: {
          libraryId: 'mini_sticker_picker',
          packId: sanitizeWechatText(sticker && sticker.groupId),
          assetId: sanitizeWechatText(sticker && sticker.id),
          dataUrl: sanitizeWechatText(sticker && sticker.url),
          description: normalizeWechatLocalizedContent(description, description)
        }
      });
      if (entry) await appendWechatThreadEntryToUi(currentContactId, contact, index, entry);
      await refreshWechatListPreview(index);
      closeWechatStickerPicker();
      await triggerWechatAutoReplyForSentMessage(contact, index, sentType);
    }

    function appendWechatThreadBanner(text) {
      const copy = sanitizeWechatText(text);
      if (!copy) return null;
      const messages = document.querySelector('#chat-scroll .chat-messages');
      if (!messages) return null;
      const banner = document.createElement('div');
      banner.className = 'mini-wechat-thread-banner';
      banner.textContent = copy;
      messages.appendChild(banner);
      scrollWechatThreadToBottom();
      return banner;
    }

    function applyWechatThreadWallpaper(contact) {
      const scroll = document.getElementById('chat-scroll');
      if (!scroll) return;
      const settings = getWechatContactSettings(contact);
      const wallpaper = sanitizeWechatText(settings.wallpaper);
      if (wallpaper) {
        scroll.style.backgroundImage = `url("${cleanCssUrl(wallpaper)}")`;
        scroll.style.backgroundSize = 'cover';
        scroll.style.backgroundPosition = 'center';
        scroll.style.backgroundRepeat = 'no-repeat';
      } else {
        scroll.style.backgroundImage = '';
        scroll.style.backgroundSize = '';
        scroll.style.backgroundPosition = '';
        scroll.style.backgroundRepeat = '';
      }
    }

    function getWechatSummaryTaskStore() {
      if (!window.__miniWechatSummaryTasks) window.__miniWechatSummaryTasks = {};
      return window.__miniWechatSummaryTasks;
    }

    function normalizeWechatSummaryPayload(value, fallbackContent = '') {
      const source = value && typeof value === 'object' ? value : {};
      const title = sanitizeWechatText(source.title) || '\u804a\u5929\u603b\u7ed3';
      const content = sanitizeWechatText(source.content) || sanitizeWechatText(source.summary) || sanitizeWechatText(fallbackContent);
      if (!content) return null;
      return {
        title,
        summary: sanitizeWechatText(source.summary) || content,
        content,
        importance: normalizeWechatProbability(source.importance, 0.82),
        memories: Array.isArray(source.memories)
          ? source.memories.map((item) => normalizeWechatMemoryObject(item)).filter(Boolean).slice(0, 2)
          : []
      };
    }

    async function requestWechatConversationSummary(currentContactId, contact, config, messages) {
      const userMask = getWechatLinkedUserMask(contact);
      const userLabel = sanitizeWechatText(userMask && (userMask.nickname || userMask.name || userMask.account)) || '\u4f60';
      const contactLabel = getWechatContactLabel(contact);
      const systemPrompt = [
        '\u4f60\u662f\u4e00\u4e2a\u53ea\u505a\u9ad8\u5bc6\u5ea6\u804a\u5929\u538b\u7f29\u7684\u603b\u7ed3\u5668\u3002',
        '',
        '[Task]',
        '- \u628a\u8fd9\u6bb5\u5bf9\u8bdd\u538b\u7f29\u6210\u540e\u7eed\u53ef\u4f9b\u89d2\u8272 prompt \u76f4\u63a5\u4f7f\u7528\u7684\u957f\u671f\u4e0a\u4e0b\u6587\u3002',
        '- \u53ea\u4fdd\u7559\u771f\u6b63\u4f1a\u5f71\u54cd\u540e\u7eed\u76f8\u5904\u65b9\u5f0f\u7684\u4e8b\uff1a\u5df2\u786e\u8ba4\u7684\u5173\u7cfb\u53d8\u5316\uff0c\u91cd\u8981\u60c5\u7eea\u6298\u70b9\uff0c\u7ea6\u5b9a\uff0c\u51b2\u7a81\uff0c\u79d8\u5bc6\uff0c\u8bc1\u660e\uff0c\u504f\u597d\uff0c\u5fcc\u8bb3\uff0c\u957f\u671f\u672a\u89e3\u7684\u5fc3\u7ed3\u3002',
        '- \u4e0d\u8981\u5199\u6d41\u6c34\u8d26\uff0c\u4e0d\u8981\u91cd\u590d\u804a\u5929\u91cc\u7684\u53e3\u6c34\u8bdd\uff0c\u4e0d\u8981\u8f93\u51fa\u65e0\u610f\u4e49\u7ec6\u8282\u3002',
        '- \u53ea\u8f93\u51fa\u88f8 JSON \u5bf9\u8c61\uff0c\u683c\u5f0f\u5fc5\u987b\u662f {"title":"","summary":"","content":"","importance":0.82,"memories":[...]}',
        '- title \u662f 6 \u5230 16 \u5b57\u7684\u5c0f\u6807\u9898\uff1bsummary \u662f 1 \u53e5 30 \u5b57\u5185\u6982\u62ec\uff1bcontent \u662f 80 \u5230 220 \u5b57\u7684\u538b\u7f29\u603b\u7ed3\u3002',
        '- memories \u6700\u591a 2 \u6761\uff0c\u6bcf\u6761\u5305\u542b title/content/summary/importance\uff0c\u53ea\u6536\u5f55\u771f\u6b63\u503c\u5f97\u957f\u671f\u8bb0\u4f4f\u7684\u4e8b\u3002'
      ].join('\n');
      const apiMessages = [{
        role: 'user',
        content: JSON.stringify({
          participants: { user: userLabel, contact: contactLabel },
          messages: buildWechatPromptMessages(messages, userLabel, contactLabel)
        }, null, 2)
      }];
      const summaryResponse = await requestWechatChatCompletion(config || {}, systemPrompt, apiMessages);
      if (summaryResponse && summaryResponse.usage) {
        void recordWechatTokenUsage(currentContactId, summaryResponse.usage);
      }
      const parsed = tryParseWechatJson(String((summaryResponse && summaryResponse.text) || '').replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim());
      return normalizeWechatSummaryPayload(parsed, '');
    }

    async function maybeRunWechatConversationSummary(contact, index, options = {}) {
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) return false;
      const settings = await readWechatContactSettings(currentContactId);
      const force = !!options.force;
      if (!force && !settings.autoSummaryEnabled) return false;
      const thread = await loadMessages(currentContactId);
      if (!thread.length) return false;
      const lastTimestamp = Number(settings.lastSummaryTimestamp) || 0;
      const candidates = thread.filter((entry) => Number(entry && entry.timestamp) > lastTimestamp);
      const threshold = force ? 1 : Math.max(wechatAutoSummaryMinimumThreshold, Number(settings.autoSummaryThreshold) || wechatAutoSummaryMinimumThreshold);
      if (candidates.length < threshold) return false;
      const tasks = getWechatSummaryTaskStore();
      const taskKey = String(currentContactId);
      if (tasks[taskKey]) return tasks[taskKey];
      tasks[taskKey] = Promise.resolve().then(async () => {
        if (isCurrentWechatSelection(contact, index)) appendWechatThreadBanner('\u7cfb\u7edf\u6b63\u5728\u603b\u7ed3...');
        try {
          const miniDb = await waitForMiniDb();
          const api = miniDb && miniDb.ops && miniDb.ops.api;
          if (!api || typeof api.getChatConfig !== 'function') throw new Error('\u804a\u5929 API \u914d\u7f6e\u672a\u52a0\u8f7d');
          const config = await api.getChatConfig();
          const summary = await requestWechatConversationSummary(currentContactId, contact, config || {}, candidates);
          if (!summary) throw new Error('\u603b\u7ed3\u5185\u5bb9\u4e3a\u7a7a');
          const latest = candidates[candidates.length - 1];
          await saveMemory(currentContactId, {
            kind: 'summary',
            title: summary.title,
            content: summary.content,
            summary: summary.summary,
            importance: summary.importance,
            source: 'summary',
            coveredUntilTimestamp: Number(latest && latest.timestamp) || Date.now(),
            coveredUntilMessageId: sanitizeWechatText(latest && latest.messageId),
            sourceMessageCount: candidates.length
          });
          for (const item of summary.memories || []) {
            await saveMemory(currentContactId, {
              ...item,
              kind: sanitizeWechatText(item.kind) || 'summary_memory',
              source: 'summary'
            });
          }
          await writeWechatContactSettings(currentContactId, {
            lastSummaryAt: Date.now(),
            lastSummaryTimestamp: Number(latest && latest.timestamp) || Date.now(),
            lastSummaryMessageId: sanitizeWechatText(latest && latest.messageId)
          });
          if (isCurrentWechatSelection(contact, index)) appendWechatThreadBanner('\u7cfb\u7edf\u603b\u7ed3\u5df2\u5199\u5165\u4e0a\u4e0b\u6587');
          if (routeName === 'wechat' && typeof renderWechatSummaryPage === 'function') {
            void renderWechatSummaryPage();
          }
          return true;
        } catch (error) {
          showMiniNotice('\u603b\u7ed3\u5931\u8d25\uff1a' + getMiniChatErrorMessage(error), 3200);
          return false;
        } finally {
          delete tasks[taskKey];
        }
      });
      return tasks[taskKey];
    }

    function buildWechatPatBannerText(contact, actor) {
      const settings = getWechatContactSettings(contact);
      const label = getWechatContactLabel(contact) || '\u5bf9\u65b9';
      if (actor === 'user') {
        return `\u4f60\u62cd\u4e86\u62cd${label}${settings.patContactSuffix || ''}`;
      }
      return `${label}\u62cd\u4e86\u62cd\u4f60${settings.patUserSuffix || ''}`;
    }

    async function emitWechatPatInteraction(contact, index, actor = 'contact') {
      const settings = getWechatContactSettings(contact);
      const currentContactId = getWechatCurrentContactId(contact);
      if (!settings.patEnabled || currentContactId == null) return null;
      const entry = await saveMessage(currentContactId, {
        chatId: currentContactId,
        direction: actor === 'user' ? 'sent' : 'received',
        type: 'pat',
        timestamp: Date.now(),
        payload: {
          text: buildWechatPatBannerText(contact, actor),
          actor
        }
      });
      if (!entry) return null;
      await appendWechatThreadEntryToUi(currentContactId, contact, index, entry);
      await refreshWechatListPreview(index);
      return entry;
    }

    function installWechatPatInteractions() {
      if (window.__miniWechatPatInteractionsInstalled) return;
      window.__miniWechatPatInteractionsInstalled = true;
      document.addEventListener('dblclick', (event) => {
        const trigger = event.target && event.target.closest ? event.target.closest('.contact-trigger') : null;
        if (!trigger) return;
        const { contact, index } = getCurrentWechatSelection();
        if (!contact || !getWechatContactSettings(contact).patEnabled) return;
        event.preventDefault();
        event.stopPropagation();
        void emitWechatPatInteraction(contact, index, 'user');
        window.setTimeout(() => {
          void emitWechatPatInteraction(contact, index, 'contact');
        }, 520);
        void maybeRunWechatConversationSummary(contact, index, { force: false });
      }, true);
    }

    function formatWechatSettingNumber(value) {
      return new Intl.NumberFormat('en-US').format(Math.max(0, Number(value) || 0));
    }

    function getWechatSettingsUiState() {
      if (!window.__miniWechatSettingsUi) {
        window.__miniWechatSettingsUi = {
          ready: false,
          settingsPage: null,
          searchPage: null,
          summaryPage: null,
          archivePage: null,
          homePage: null,
          importModal: null
        };
      }
      return window.__miniWechatSettingsUi;
    }

    function setWechatToggleButton(button, value, disabled = false) {
      if (!button) return;
      button.classList.toggle('is-on', !!value);
      button.setAttribute('aria-pressed', value ? 'true' : 'false');
      button.disabled = !!disabled;
    }

    async function pickWechatAssetFile(accept = 'image/*') {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.style.display = 'none';
        input.addEventListener('change', () => {
          const file = input.files && input.files[0] ? input.files[0] : null;
          if (input.parentNode) input.parentNode.removeChild(input);
          resolve(file);
        }, { once: true });
        document.body.appendChild(input);
        input.click();
      });
    }

    function downloadWechatBlob(fileName, blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    }

    async function ensureWechatJsZip() {
      if (window.JSZip) return window.JSZip;
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('JSZip load failed'));
        document.head.appendChild(script);
      });
      if (!window.JSZip) throw new Error('JSZip unavailable');
      return window.JSZip;
    }

    async function buildWechatHistoryExportPayload() {
      const contacts = await loadUserContacts();
      const payloadContacts = [];
      for (const contact of contacts) {
        if (!contact || contact.id == null) continue;
        const [messages, memories, schedules, settings] = await Promise.all([
          loadMessages(contact.id),
          loadMemories(contact.id),
          loadSchedules(contact.id, { limit: 120 }),
          readWechatContactSettings(contact.id)
        ]);
        payloadContacts.push({
          contactSnapshot: {
            id: contact.id,
            type: contact.type,
            nickname: contact.nickname,
            name: contact.name,
            gender: contact.gender,
            account: contact.account,
            signature: contact.signature,
            lore: contact.lore,
            presetAssoc: contact.presetAssoc,
            worldbookAssoc: contact.worldbookAssoc,
            language: contact.language,
            avatar: contact.avatar
          },
          wechatSettings: settings,
          messages,
          memories,
          schedules
        });
      }
      return {
        version: 1,
        exportedAt: Date.now(),
        route: 'wechat',
        contacts: payloadContacts
      };
    }

    async function exportWechatHistory(format = 'json') {
      const payload = await buildWechatHistoryExportPayload();
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      if (format === 'zip') {
        const JSZip = await ensureWechatJsZip();
        const zip = new JSZip();
        zip.file('wechat-export.json', JSON.stringify(payload, null, 2));
        const blob = await zip.generateAsync({ type: 'blob' });
        downloadWechatBlob(`wechat-history-${stamp}.zip`, blob);
        return;
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      downloadWechatBlob(`wechat-history-${stamp}.json`, blob);
    }

    async function requestWechatImportMode() {
      const state = getWechatSettingsUiState();
      const modal = state.importModal;
      if (!modal) return 'compatible';
      return new Promise((resolve) => {
        modal.style.display = 'flex';
        modal.classList.add('show');
        const finalize = (mode) => {
          modal.classList.remove('show');
          modal.style.display = 'none';
          resolve(mode);
        };
        modal.querySelectorAll('[data-import-mode]').forEach((button) => {
          button.onclick = () => finalize(button.dataset.importMode || 'cancel');
        });
        const cancel = modal.querySelector('[data-import-cancel]');
        if (cancel) cancel.onclick = () => finalize('cancel');
        modal.onclick = (event) => {
          if (event.target === modal) finalize('cancel');
        };
      });
    }

    function buildWechatImportMemoryKey(item) {
      return [
        sanitizeWechatText(item && item.kind),
        sanitizeWechatText(item && item.title),
        sanitizeWechatText(item && item.summary),
        sanitizeWechatText(item && item.content)
      ].join('|');
    }

    function findWechatImportTargetContact(item, contacts) {
      const snapshot = item && item.contactSnapshot ? item.contactSnapshot : {};
      const account = sanitizeWechatText(snapshot.account);
      if (account) {
        const byAccount = (contacts || []).find((contact) => sanitizeWechatText(contact && contact.account) === account);
        if (byAccount) return byAccount;
      }
      const id = snapshot && snapshot.id != null ? String(snapshot.id) : '';
      if (id) {
        const byId = (contacts || []).find((contact) => String(contact && contact.id) === id);
        if (byId) return byId;
      }
      return null;
    }

    async function importWechatHistoryFromPayload(payload, mode = 'compatible') {
      if (!payload || !Array.isArray(payload.contacts)) throw new Error('Invalid history payload');
      const miniDb = await waitForMiniDb();
      const ops = miniDb && miniDb.ops;
      const contactOps = ops && ops.contacts;
      if (!contactOps) throw new Error('Contacts store unavailable');
      const knownContacts = await loadUserContacts();
      let importedMessages = 0;
      for (const item of payload.contacts) {
        const snapshot = item && item.contactSnapshot ? item.contactSnapshot : null;
        if (!snapshot) continue;
        let target = findWechatImportTargetContact(item, knownContacts);
        if (!target) {
          const nextId = await contactOps.addContact({
            type: snapshot.type || 'CHAR',
            nickname: snapshot.nickname || snapshot.name || 'Imported',
            name: snapshot.name || '',
            gender: snapshot.gender || 'X',
            account: snapshot.account || '',
            signature: snapshot.signature || '',
            lore: snapshot.lore || '',
            presetAssoc: snapshot.presetAssoc || 'NONE',
            worldbookAssoc: snapshot.worldbookAssoc || 'NONE',
            language: snapshot.language || '\u4e2d\u6587',
            avatar: snapshot.avatar || ''
          });
          target = await contactOps.getContact(nextId);
          knownContacts.push(target);
        } else if (mode === 'overwrite') {
          await contactOps.deleteContactUniverse(target.id);
        }
        if (!target || target.id == null) continue;
        const targetId = target.id;
        const existingMessages = mode === 'compatible' ? await loadMessages(targetId) : [];
        const existingMessageIds = new Set(existingMessages.map((entry) => sanitizeWechatText(entry && entry.messageId)).filter(Boolean));
        for (const message of (item.messages || [])) {
          const normalized = normalizeWechatThreadEntry(message, { chatId: targetId });
          if (!normalized) continue;
          const messageId = sanitizeWechatText(normalized.messageId);
          if (mode === 'compatible' && messageId && existingMessageIds.has(messageId)) continue;
          await saveMessage(targetId, normalized);
          if (messageId) existingMessageIds.add(messageId);
          importedMessages += 1;
        }
        const existingMemories = mode === 'compatible' ? await loadMemories(targetId) : [];
        const existingMemoryKeys = new Set(existingMemories.map((memory) => buildWechatImportMemoryKey(memory)).filter(Boolean));
        for (const memory of (item.memories || [])) {
          const normalized = normalizeWechatMemoryObject(memory);
          if (!normalized) continue;
          const key = buildWechatImportMemoryKey(normalized);
          if (mode === 'compatible' && key && existingMemoryKeys.has(key)) continue;
          await saveMemory(targetId, normalized);
          if (key) existingMemoryKeys.add(key);
        }
        const existingSchedules = mode === 'compatible' ? await loadSchedules(targetId, { limit: 240 }) : [];
        const existingScheduleKeys = new Set(existingSchedules.map((entry) => buildWechatImportMemoryKey({
          kind: entry.kind,
          title: entry.diary && entry.diary.title,
          summary: entry.summary || (entry.state && entry.state.summary),
          content: (entry.diary && entry.diary.content) || (entry.thought && entry.thought.content) || (entry.state && entry.state.summary)
        })).filter(Boolean));
        for (const schedule of (item.schedules || [])) {
          const key = buildWechatImportMemoryKey({
            kind: schedule && schedule.kind,
            title: schedule && schedule.diary && schedule.diary.title,
            summary: schedule && (schedule.summary || (schedule.state && schedule.state.summary)),
            content: schedule && ((schedule.diary && schedule.diary.content) || (schedule.thought && schedule.thought.content) || (schedule.state && schedule.state.summary))
          });
          if (mode === 'compatible' && key && existingScheduleKeys.has(key)) continue;
          if (schedule && schedule.kind === 'thought') await saveThought(targetId, schedule.thought || schedule);
          else if (schedule && schedule.kind === 'diary') await saveDiary(targetId, schedule.diary || schedule);
          else if (schedule && schedule.kind === 'state') await saveState(targetId, schedule.state || schedule);
          if (key) existingScheduleKeys.add(key);
        }
        if (item.wechatSettings) {
          await writeWechatContactSettings(targetId, item.wechatSettings, { replace: mode === 'overwrite' });
        }
      }
      await applyWechatData(await loadUserContacts());
      return importedMessages;
    }

    async function importWechatHistoryFromFile(file) {
      if (!file) return;
      const mode = await requestWechatImportMode();
      if (mode === 'cancel') return;
      let payload = null;
      if (/\.zip$/i.test(file.name)) {
        const JSZip = await ensureWechatJsZip();
        const zip = await JSZip.loadAsync(await file.arrayBuffer());
        const jsonFile = zip.file('wechat-export.json') || Object.values(zip.files).find((entry) => /\.json$/i.test(entry.name));
        if (!jsonFile) throw new Error('Zip missing JSON payload');
        payload = JSON.parse(await jsonFile.async('string'));
      } else {
        payload = JSON.parse(await file.text());
      }
      const importedCount = await importWechatHistoryFromPayload(payload, mode);
      showMiniNotice(`\u5df2\u5bfc\u5165 ${importedCount} \u6761\u804a\u5929\u8bb0\u5f55`);
    }

    async function renderWechatSearchPage(query = '') {
      const state = getWechatSettingsUiState();
      const page = state.searchPage;
      if (!page) return;
      const results = page.querySelector('#mini-wechat-search-results');
      const input = page.querySelector('#mini-wechat-search-input');
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (input && input.value !== query) input.value = query;
      if (!results) return;
      results.innerHTML = '';
      if (!contact || currentContactId == null) {
        results.innerHTML = '<div class="mini-wechat-search-empty">\u8bf7\u5148\u9009\u62e9\u4e00\u4e2a\u804a\u5929\u3002</div>';
        return;
      }
      const keyword = sanitizeWechatText(query).toLowerCase();
      const thread = await loadMessages(currentContactId);
      const matches = thread.filter((entry) => {
        if (!keyword) return false;
        return getWechatMessagePreviewText(entry).toLowerCase().includes(keyword);
      });
      if (!matches.length) {
        results.innerHTML = `<div class="mini-wechat-search-empty">${keyword ? '\u6ca1\u6709\u627e\u5230\u5339\u914d\u6d88\u606f\u3002' : '\u8f93\u5165\u5173\u952e\u8bcd\u540e\uff0c\u8fd9\u91cc\u4f1a\u663e\u793a\u5339\u914d\u7684\u804a\u5929\u8bb0\u5f55\u3002'}</div>`;
        return;
      }
      matches.reverse().forEach((entry) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mini-wechat-search-item';
        button.innerHTML = [
          `<div class="mini-wechat-search-meta"><span>${getWechatMessageDirection(entry) === 'sent' ? '\u4f60' : getWechatContactLabel(contact)}</span><span>${formatWechatHumanTime(entry.timestamp)}</span></div>`,
          `<div class="mini-wechat-search-name">${entry.type.toUpperCase()}</div>`,
          `<div class="mini-wechat-search-preview">${escapeHtml(getWechatMessagePreviewText(entry))}</div>`
        ].join('');
        button.addEventListener('click', async () => {
          page.classList.remove('active');
          await renderWechatThread(currentContactId, contact, index);
          flashWechatQuotedMessage(entry);
        });
        results.appendChild(button);
      });
    }

    async function renderWechatSummaryPage() {
      const state = getWechatSettingsUiState();
      const page = state.summaryPage;
      if (!page) return;
      const list = page.querySelector('#mini-wechat-summary-list');
      if (!list) return;
      const { contact } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      list.innerHTML = '';
      if (!contact || currentContactId == null) {
        list.innerHTML = '<div class="mini-wechat-summary-empty">\u8bf7\u5148\u9009\u62e9\u4e00\u4e2a\u804a\u5929\u3002</div>';
        return;
      }
      const memories = await loadMemories(currentContactId, { limit: 64 });
      const rows = memories.filter((memory) => {
        const kind = sanitizeWechatText(memory && memory.kind).toLowerCase();
        return kind === 'summary' || kind === 'manual' || kind === 'summary_memory';
      });
      if (!rows.length) {
        list.innerHTML = '<div class="mini-wechat-summary-empty">\u6682\u65e0\u603b\u7ed3\u6216\u624b\u52a8\u8bb0\u5fc6\u3002</div>';
        return;
      }
      rows.forEach((memory) => {
        const entry = document.createElement('div');
        entry.className = 'mini-wechat-summary-entry';
        entry.innerHTML = [
          `<div class="mini-wechat-summary-meta"><span>${escapeHtml((memory.kind || 'memory').toUpperCase())}</span><span>${formatWechatHumanTime(memory.updatedAt || memory.createdAt)}</span></div>`,
          `<div class="mini-wechat-summary-title">${escapeHtml(memory.title || '\u672a\u547d\u540d\u8bb0\u5fc6')}</div>`,
          `<div class="mini-wechat-summary-preview">${escapeHtml(memory.summary || memory.content || '')}</div>`
        ].join('');
        list.appendChild(entry);
      });
    }

    async function openWechatArchivePage() {
      const state = getWechatSettingsUiState();
      const page = state.archivePage;
      if (!page) return;
      const { contact } = getCurrentWechatSelection();
      const userMask = getWechatLinkedUserMask(contact);
      page.classList.add('active');
      const setValue = (id, value) => {
        const node = page.querySelector(id);
        if (node) node.value = value || '';
      };
      setValue('#mini-wechat-archive-user-nickname', userMask && userMask.nickname);
      setValue('#mini-wechat-archive-user-signature', userMask && userMask.signature);
      setValue('#mini-wechat-archive-user-lore', userMask && userMask.lore);
      setValue('#mini-wechat-archive-contact-nickname', contact && contact.nickname);
      setValue('#mini-wechat-archive-contact-name', contact && contact.name);
      setValue('#mini-wechat-archive-contact-signature', contact && contact.signature);
      setValue('#mini-wechat-archive-contact-lore', contact && contact.lore);
      setValue('#mini-wechat-archive-contact-language', contact && contact.language);
    }

    async function saveWechatArchivePage() {
      const state = getWechatSettingsUiState();
      const page = state.archivePage;
      if (!page) return;
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) return;
      const miniDb = await waitForMiniDb();
      const ops = miniDb && miniDb.ops;
      const userMask = getWechatLinkedUserMask(contact);
      if (ops && ops.contacts && typeof ops.contacts.updateContact === 'function') {
        await ops.contacts.updateContact(currentContactId, {
          nickname: sanitizeWechatText(page.querySelector('#mini-wechat-archive-contact-nickname').value),
          name: sanitizeWechatText(page.querySelector('#mini-wechat-archive-contact-name').value),
          signature: sanitizeWechatText(page.querySelector('#mini-wechat-archive-contact-signature').value),
          lore: sanitizeWechatText(page.querySelector('#mini-wechat-archive-contact-lore').value),
          language: sanitizeWechatText(page.querySelector('#mini-wechat-archive-contact-language').value) || '\u4e2d\u6587'
        });
      }
      if (userMask && userMask.id != null && ops && ops.masks && typeof ops.masks.updateMask === 'function') {
        await ops.masks.updateMask(userMask.id, {
          nickname: sanitizeWechatText(page.querySelector('#mini-wechat-archive-user-nickname').value),
          signature: sanitizeWechatText(page.querySelector('#mini-wechat-archive-user-signature').value),
          lore: sanitizeWechatText(page.querySelector('#mini-wechat-archive-user-lore').value)
        });
      }
      const selectionKey = getWechatContactKey(contact, index);
      await applyWechatData(await loadUserContacts());
      await refreshWechatConversationUi({ selectionKey, openDetail: true });
      page.classList.remove('active');
      void renderWechatSettingsPage();
      showMiniNotice('\u6863\u6848\u5df2\u66f4\u65b0');
    }

    async function saveWechatManualMemoryFromPage() {
      const state = getWechatSettingsUiState();
      const page = state.summaryPage;
      if (!page) return;
      const { contact } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) return;
      const titleNode = page.querySelector('#mini-wechat-manual-memory-title');
      const contentNode = page.querySelector('#mini-wechat-manual-memory-content');
      const title = sanitizeWechatText(titleNode && titleNode.value) || '\u624b\u52a8\u8bb0\u5fc6';
      const content = sanitizeWechatText(contentNode && contentNode.value);
      if (!content) {
        showMiniNotice('\u8bf7\u5148\u8f93\u5165\u8bb0\u5fc6\u5185\u5bb9');
        return;
      }
      await saveMemory(currentContactId, {
        kind: 'manual',
        title,
        content,
        summary: content,
        importance: 0.9,
        source: 'manual'
      });
      if (titleNode) titleNode.value = '';
      if (contentNode) contentNode.value = '';
      await renderWechatSummaryPage();
      showMiniNotice('\u624b\u52a8\u8bb0\u5fc6\u5df2\u4fdd\u5b58');
    }

    async function refreshWechatSettingsPageTokenBoard(stats = null) {
      const state = getWechatSettingsUiState();
      const page = state.settingsPage;
      if (!page) return;
      const { contact } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      const currentStats = stats || await loadWechatTokenStats();
      const contactStats = currentContactId != null ? (currentStats.contacts[String(currentContactId)] || {}) : {};
      const assignments = {
        '#mini-wechat-token-current-total': formatWechatSettingNumber(contactStats.totalTokens),
        '#mini-wechat-token-current-requests': formatWechatSettingNumber(contactStats.requests),
        '#mini-wechat-token-global-total': formatWechatSettingNumber(currentStats.global.totalTokens),
        '#mini-wechat-token-global-requests': formatWechatSettingNumber(currentStats.global.requests)
      };
      Object.entries(assignments).forEach(([selector, value]) => {
        const node = page.querySelector(selector);
        if (node) node.textContent = value;
      });
    }

    async function updateCurrentWechatSettingField(field, rawValue) {
      const { contact, index } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      if (!contact || currentContactId == null) return;
      const patch = {};
      if (field === 'remark') patch.remark = sanitizeWechatText(rawValue);
      if (field === 'timezone') {
        const clean = sanitizeWechatText(rawValue);
        if (clean && !normalizeWechatTimeZoneDescriptor(clean)) {
          showMiniNotice('\u65f6\u533a\u8bf7\u8f93\u5165 IANA \u540d\u79f0\u6216 UTC+8 \u8fd9\u7c7b\u683c\u5f0f');
          return;
        }
        patch.timezone = clean;
      }
      if (field === 'userCity') patch.userCity = sanitizeWechatText(rawValue);
      if (field === 'contactCity') patch.contactCity = sanitizeWechatText(rawValue);
      if (field === 'replyCountMin') patch.replyCountMin = clampWechatNumber(rawValue, 1, wechatRoleReplyMaxMessages, 1);
      if (field === 'replyCountMax') patch.replyCountMax = clampWechatNumber(rawValue, 1, wechatRoleReplyMaxMessages, 3);
      if (field === 'autoSummaryThreshold') patch.autoSummaryThreshold = clampWechatNumber(rawValue, wechatAutoSummaryMinimumThreshold, 500, wechatAutoSummaryMinimumThreshold);
      if (field === 'patUserSuffix') patch.patUserSuffix = sanitizeWechatText(rawValue);
      if (field === 'patContactSuffix') patch.patContactSuffix = sanitizeWechatText(rawValue);
      if (field.endsWith('Enabled') || ['weatherEnabled', 'autoReply', 'timeAwareness', 'patEnabled', 'autoSummaryEnabled', 'independentVoiceApi'].includes(field)) {
        patch[field] = normalizeWechatBoolean(rawValue, false);
      }
      await writeWechatContactSettings(currentContactId, patch);
      applyWechatThreadWallpaper(contact);
      await refreshWechatConversationUi({ selectionKey: getWechatContactKey(contact, index), openDetail: true });
      void renderWechatSettingsPage();
    }

    async function renderWechatSettingsPage() {
      const state = getWechatSettingsUiState();
      const page = state.settingsPage;
      if (!page) return;
      const { contact } = getCurrentWechatSelection();
      const currentContactId = getWechatCurrentContactId(contact);
      const settings = contact ? await readWechatContactSettings(currentContactId) : normalizeWechatContactSettings();
      const userMask = getWechatLinkedUserMask(contact);
      const assignValue = (selector, value) => {
        const node = page.querySelector(selector);
        if (node) node.value = value || '';
      };
      const assignText = (selector, value) => {
        const node = page.querySelector(selector);
        if (node) node.textContent = value || '--';
      };
      assignText('#mini-wechat-contact-avatar-name', contact ? getWechatContactLabel(contact) : '\u672a\u9009\u62e9');
      assignText('#mini-wechat-user-avatar-name', sanitizeWechatText(userMask && (userMask.nickname || userMask.name || userMask.account)) || '\u6211');
      const contactAvatar = page.querySelector('#mini-wechat-contact-avatar-preview');
      const userAvatar = page.querySelector('#mini-wechat-user-avatar-preview');
      if (contactAvatar) setAvatarSurface(contactAvatar, getCurrentWechatSelection().index || 0, { role: 'contact', contact });
      if (userAvatar) setAvatarSurface(userAvatar, getCurrentWechatSelection().index || 0, { role: 'user', contact });
      assignValue('[data-setting-field="remark"]', settings.remark);
      assignValue('[data-setting-field="timezone"]', settings.timezone);
      assignValue('[data-setting-field="userCity"]', settings.userCity);
      assignValue('[data-setting-field="contactCity"]', settings.contactCity);
      assignValue('[data-setting-field="replyCountMin"]', settings.replyCountMin);
      assignValue('[data-setting-field="replyCountMax"]', settings.replyCountMax);
      assignValue('[data-setting-field="patUserSuffix"]', settings.patUserSuffix);
      assignValue('[data-setting-field="patContactSuffix"]', settings.patContactSuffix);
      assignValue('[data-setting-field="autoSummaryThreshold"]', settings.autoSummaryThreshold);
      assignText('#mini-wechat-wallpaper-value', settings.wallpaper ? '\u5df2\u8bbe\u7f6e' : '\u672a\u8bbe\u7f6e');
      [
        'weatherEnabled',
        'autoReply',
        'timeAwareness',
        'patEnabled',
        'autoSummaryEnabled',
        'linkedAccountEnabled',
        'parentModeEnabled',
        'conflictModeEnabled',
        'autoAvatarEnabled',
        'autonomyEnabled',
        'independentVoiceApi',
        'proactiveChatEnabled',
        'backgroundKeepAliveEnabled'
      ].forEach((field) => {
        setWechatToggleButton(page.querySelector(`[data-setting-toggle="${field}"]`), settings[field], !contact);
      });
      const enableControls = !!contact;
      page.querySelectorAll('[data-contact-required="1"]').forEach((node) => {
        node.disabled = !enableControls;
      });
      page.querySelectorAll('[data-setting-expand]').forEach((node) => {
        const field = sanitizeWechatText(node.dataset.settingExpand);
        node.hidden = !settings[field];
      });
      await refreshWechatSettingsPageTokenBoard();
    }

    async function ensureWechatSettingsPages() {
      const state = getWechatSettingsUiState();
      if (state.ready) return state;
      state.ready = true;
      const createHeader = (title, backAttr) => [
        '<div class="chat-header">',
        `<div class="btn-action" ${backAttr}><svg class="icon-svg icon-stroke" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg></div>`,
        `<div class="header-title">${title}</div>`,
        '<div class="header-spacer"></div>',
        '</div>'
      ].join('');

      const settingsPage = document.createElement('div');
      settingsPage.id = 'mini-wechat-settings-page';
      settingsPage.className = 'page-layer mini-wechat-settings-page';
      settingsPage.innerHTML = [
        createHeader('CHAT SETTINGS', 'data-wechat-settings-back="1"'),
        '<div class="mini-wechat-settings-scroll">',
        '<div class="mini-wechat-settings-section"><div class="mini-wechat-section-title">Avatar</div><div class="mini-wechat-settings-card"><div class="mini-wechat-avatar-grid">',
        '<button type="button" class="mini-wechat-avatar-button" data-action="pick-contact-avatar" data-contact-required="1"><div class="mini-wechat-avatar-preview" id="mini-wechat-contact-avatar-preview"></div><div class="mini-wechat-avatar-role">\u5bf9\u65b9</div><div class="mini-wechat-avatar-name" id="mini-wechat-contact-avatar-name"></div></button>',
        '<button type="button" class="mini-wechat-avatar-button" data-action="pick-user-avatar"><div class="mini-wechat-avatar-preview" id="mini-wechat-user-avatar-preview"></div><div class="mini-wechat-avatar-role">\u6211</div><div class="mini-wechat-avatar-name" id="mini-wechat-user-avatar-name"></div></button>',
        '</div><div class="mini-wechat-avatar-tip">\u4fee\u6539\u540e\u4f1a\u540c\u6b65\u5230\u5176\u5b83 App \u5171\u7528\u8d44\u6599\u3002</div></div></div>',
        '<div class="mini-wechat-settings-section"><div class="mini-wechat-section-title">Profile</div><div class="mini-wechat-settings-card">',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">REMARK</div><div class="mini-wechat-setting-sub">TOP PRIORITY DISPLAY NAME INSIDE WECHAT.</div></div></div><input class="mini-wechat-setting-input" data-setting-field="remark" data-contact-required="1" placeholder="\u7ed9\u5bf9\u65b9\u4e00\u4e2a\u5907\u6ce8">',
        '<div class="mini-wechat-setting-divider"></div>',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">HOME</div><div class="mini-wechat-setting-sub">OPEN A PLACEHOLDER HOME PAGE FOR THIS CONTACT.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-link is-secondary" data-action="open-home" data-contact-required="1">Open</button></div></div>',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">ARCHIVE</div><div class="mini-wechat-setting-sub">EDIT BOTH SIDES FAST AND SYNC BACK TO CONTACTS / MASKS.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-link is-secondary" data-action="open-archive" data-contact-required="1">Edit</button></div></div>',
        '</div></div>',
        '<div class="mini-wechat-settings-section"><div class="mini-wechat-section-title">Chat</div><div class="mini-wechat-settings-card">',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">CHAT WALLPAPER</div><div class="mini-wechat-setting-sub">UPLOAD A WALLPAPER ONLY FOR THIS THREAD.</div></div><div class="mini-wechat-setting-control"><div class="mini-wechat-setting-value" id="mini-wechat-wallpaper-value">\u672a\u8bbe\u7f6e</div><button type="button" class="mini-wechat-setting-link is-secondary" data-action="pick-wallpaper" data-contact-required="1">Upload</button><button type="button" class="mini-wechat-setting-link is-secondary" data-action="clear-wallpaper" data-contact-required="1">Clear</button></div></div>',
        '<div class="mini-wechat-setting-divider"></div>',
        '<div class="mini-wechat-inline-fields"><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u65f6\u533a</span><input class="mini-wechat-setting-input" data-setting-field="timezone" data-contact-required="1" placeholder="Asia/Tokyo \u6216 UTC+9"></label><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u5929\u6c14\u611f\u77e5</span><button type="button" class="mini-wechat-setting-toggle" data-setting-toggle="weatherEnabled" data-contact-required="1"></button></label></div>',
        '<div class="mini-wechat-inline-fields"><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u7528\u6237\u57ce\u5e02</span><input class="mini-wechat-setting-input" data-setting-field="userCity" data-contact-required="1" placeholder="\u4f8b\u5982\uff1a\u4e0a\u6d77"></label><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u8054\u7cfb\u4eba\u57ce\u5e02</span><input class="mini-wechat-setting-input" data-setting-field="contactCity" data-contact-required="1" placeholder="\u4f8b\u5982\uff1a\u4e1c\u4eac"></label></div>',
        '<div class="mini-wechat-inline-fields"><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u6700\u5c11\u56de\u590d</span><input type="number" min="1" max="6" class="mini-wechat-setting-input" data-setting-field="replyCountMin" data-contact-required="1"></label><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u6700\u591a\u56de\u590d</span><input type="number" min="1" max="6" class="mini-wechat-setting-input" data-setting-field="replyCountMax" data-contact-required="1"></label></div>',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">AUTO REPLY</div><div class="mini-wechat-setting-sub">TRIGGER A REPLY RIGHT AFTER EVERY USER MESSAGE.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-toggle" data-setting-toggle="autoReply" data-contact-required="1"></button></div></div>',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">TIME AWARENESS</div><div class="mini-wechat-setting-sub">ONLY ENABLED MODELS MAY KNOW THE REAL CLOCK TIME WITHIN ONE MINUTE.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-toggle" data-setting-toggle="timeAwareness" data-contact-required="1"></button></div></div>',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">PAT</div><div class="mini-wechat-setting-sub">DOUBLE TAP THE CONTACT AVATAR TO TRIGGER A PERSISTENT SYSTEM NOTICE AND ALLOW RANDOM RETURN PATS.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-toggle" data-setting-toggle="patEnabled" data-contact-required="1"></button></div></div>',
        '<div class="mini-wechat-setting-expand" data-setting-expand="patEnabled" hidden><div class="mini-wechat-inline-fields"><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u62cd\u4f60\u540e\u7f00</span><input class="mini-wechat-setting-input" data-setting-field="patUserSuffix" data-contact-required="1" placeholder="\u4f8b\u5982\uff1a\u7684\u80a9\u8180"></label><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u62cd\u5bf9\u65b9\u540e\u7f00</span><input class="mini-wechat-setting-input" data-setting-field="patContactSuffix" data-contact-required="1" placeholder="\u4f8b\u5982\uff1a\u7684\u5934"></label></div></div>',
        '</div></div>',
        '<div class="mini-wechat-settings-section"><div class="mini-wechat-section-title">Memory</div><div class="mini-wechat-settings-card">',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">MEMORY & SUMMARY</div><div class="mini-wechat-setting-sub">VIEW SUMMARY HISTORY AND ADD MANUAL LONG-TERM MEMORY.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-link is-secondary" data-action="open-summary" data-contact-required="1">Open</button></div></div>',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">AUTO SUMMARY</div><div class="mini-wechat-setting-sub">DEFAULT THRESHOLD IS 50. VALUES BELOW 50 ARE NOT ALLOWED.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-toggle" data-setting-toggle="autoSummaryEnabled" data-contact-required="1"></button></div></div>',
        '<div class="mini-wechat-setting-expand" data-setting-expand="autoSummaryEnabled" hidden><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u603b\u7ed3\u9608\u503c</span><input type="number" min="50" max="500" class="mini-wechat-setting-input" data-setting-field="autoSummaryThreshold" data-contact-required="1"></label></div>',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">RUN SUMMARY</div><div class="mini-wechat-setting-sub">SUMMARIZE THE UNSUMMARIZED PART OF THIS THREAD RIGHT NOW.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-link" data-action="run-summary" data-contact-required="1">Run now</button></div></div>',
        '</div></div>',
        '<div class="mini-wechat-settings-section"><div class="mini-wechat-section-title">Tools</div><div class="mini-wechat-settings-card">',
        '<div class="mini-wechat-token-board"><div class="mini-wechat-token-box"><div class="mini-wechat-token-label">CURRENT TOTAL</div><div class="mini-wechat-token-value" id="mini-wechat-token-current-total">0</div><div class="mini-wechat-token-sub">TOKENS</div></div><div class="mini-wechat-token-box"><div class="mini-wechat-token-label">CURRENT REQUESTS</div><div class="mini-wechat-token-value" id="mini-wechat-token-current-requests">0</div><div class="mini-wechat-token-sub">CALLS</div></div><div class="mini-wechat-token-box"><div class="mini-wechat-token-label">GLOBAL TOTAL</div><div class="mini-wechat-token-value" id="mini-wechat-token-global-total">0</div><div class="mini-wechat-token-sub">TOKENS</div></div><div class="mini-wechat-token-box"><div class="mini-wechat-token-label">GLOBAL REQUESTS</div><div class="mini-wechat-token-value" id="mini-wechat-token-global-requests">0</div><div class="mini-wechat-token-sub">CALLS</div></div></div>',
        '<div class="mini-wechat-setting-divider"></div>',
        '<div class="mini-wechat-summary-toolbar"><button type="button" class="mini-wechat-plain-btn is-secondary" data-action="open-search" data-contact-required="1">SEARCH HISTORY</button><button type="button" class="mini-wechat-plain-btn is-secondary" data-action="export-json">EXPORT JSON</button><button type="button" class="mini-wechat-plain-btn is-secondary" data-action="export-zip">EXPORT ZIP</button><button type="button" class="mini-wechat-plain-btn is-secondary" data-action="import-history">IMPORT</button></div>',
        '</div></div>',
        '<div class="mini-wechat-settings-section"><div class="mini-wechat-section-title">Labs</div><div class="mini-wechat-settings-card">',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">LINKED ACCOUNT</div><div class="mini-wechat-setting-sub">SAVE THE FLAG NOW. LOGIN PIPELINE COMES LATER.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-toggle" data-setting-toggle="linkedAccountEnabled" data-contact-required="1"></button><span class="mini-wechat-setting-badge is-muted">PENDING</span></div></div>',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">PARENT MODE</div><div class="mini-wechat-setting-sub">RESERVED FOR FUTURE HIGH-EMOTION DEVICE LOCK RULES.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-toggle" data-setting-toggle="parentModeEnabled" data-contact-required="1"></button><span class="mini-wechat-setting-badge is-muted">PENDING</span></div></div>',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">CONFLICT MODE</div><div class="mini-wechat-setting-sub">RESERVED FOR FUTURE MULTI-CONTACT CONFLICT LOGIC.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-toggle" data-setting-toggle="conflictModeEnabled" data-contact-required="1"></button><span class="mini-wechat-setting-badge is-muted">PENDING</span></div></div>',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">AUTO AVATAR</div><div class="mini-wechat-setting-sub">RESERVED FOR FUTURE MOOD-BASED AVATAR CHANGES.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-toggle" data-setting-toggle="autoAvatarEnabled" data-contact-required="1"></button><span class="mini-wechat-setting-badge is-muted">PENDING</span></div></div>',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">AUTONOMY</div><div class="mini-wechat-setting-sub">RESERVED FOR FUTURE BACKGROUND AUTONOMOUS ACTIVITY.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-toggle" data-setting-toggle="autonomyEnabled" data-contact-required="1"></button><span class="mini-wechat-setting-badge is-muted">PENDING</span></div></div>',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">INDEPENDENT API VOICE</div><div class="mini-wechat-setting-sub">SAVE THE FLAG NOW. A SEPARATE VOICE PIPELINE CAN BE WIRED LATER.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-toggle" data-setting-toggle="independentVoiceApi" data-contact-required="1"></button></div></div>',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">PROACTIVE CHAT</div><div class="mini-wechat-setting-sub">RESERVED FOR FUTURE NO-INPUT CONVERSATION OPENERS.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-toggle" data-setting-toggle="proactiveChatEnabled" data-contact-required="1"></button><span class="mini-wechat-setting-badge is-muted">PENDING</span></div></div>',
        '<div class="mini-wechat-setting-row"><div class="mini-wechat-setting-copy"><div class="mini-wechat-setting-label">BACKGROUND KEEP ALIVE</div><div class="mini-wechat-setting-sub">RESERVED FOR FUTURE BACKGROUND RUNTIME STRATEGY.</div></div><div class="mini-wechat-setting-control"><button type="button" class="mini-wechat-setting-toggle" data-setting-toggle="backgroundKeepAliveEnabled" data-contact-required="1"></button><span class="mini-wechat-setting-badge is-muted">PENDING</span></div></div>',
        '</div></div>',
        '</div>'
      ].join('');

      const searchPage = document.createElement('div');
      searchPage.id = 'mini-wechat-search-page';
      searchPage.className = 'page-layer mini-wechat-search-page';
      searchPage.innerHTML = [
        createHeader('SEARCH', 'data-wechat-search-back="1"'),
        '<div class="mini-wechat-search-scroll"><div class="mini-wechat-search-card"><input id="mini-wechat-search-input" class="mini-wechat-search-input" placeholder="\u8f93\u5165\u5173\u952e\u8bcd\u641c\u7d22\u5f53\u524d\u804a\u5929"><div class="mini-wechat-search-results" id="mini-wechat-search-results"></div></div></div>'
      ].join('');

      const summaryPage = document.createElement('div');
      summaryPage.id = 'mini-wechat-summary-page';
      summaryPage.className = 'page-layer mini-wechat-summary-page';
      summaryPage.innerHTML = [
        createHeader('MEMORY', 'data-wechat-summary-back="1"'),
        '<div class="mini-wechat-summary-scroll"><div class="mini-wechat-summary-card"><div class="mini-wechat-summary-toolbar"><button type="button" class="mini-wechat-plain-btn" data-action="summary-run-now">RUN SUMMARY</button><button type="button" class="mini-wechat-plain-btn is-secondary" data-action="summary-refresh">REFRESH</button></div><div class="mini-wechat-setting-divider"></div><div class="mini-wechat-inline-fields"><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u8bb0\u5fc6\u6807\u9898</span><input id="mini-wechat-manual-memory-title" class="mini-wechat-setting-input" placeholder="\u4f8b\u5982\uff1a\u7b2c\u4e00\u6b21\u575a\u5b9a\u8868\u6001"></label><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u624b\u52a8\u8bb0\u5fc6</span><textarea id="mini-wechat-manual-memory-content" class="mini-wechat-setting-textarea" placeholder="\u8f93\u5165\u5e0c\u671b\u957f\u671f\u4fdd\u7559\u7684\u4e8b..."></textarea></label></div><button type="button" class="mini-wechat-plain-btn" data-action="save-manual-memory">SAVE MEMORY</button></div><div class="mini-wechat-summary-card"><div class="mini-wechat-section-title">History</div><div class="mini-wechat-summary-list" id="mini-wechat-summary-list"></div></div></div>'
      ].join('');

      const archivePage = document.createElement('div');
      archivePage.id = 'mini-wechat-archive-page';
      archivePage.className = 'page-layer mini-wechat-archive-page';
      archivePage.innerHTML = [
        createHeader('ARCHIVE', 'data-wechat-archive-back="1"'),
        '<div class="mini-wechat-archive-scroll"><div class="mini-wechat-archive-card"><div class="mini-wechat-section-title">User</div><div class="mini-wechat-inline-fields"><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u6635\u79f0</span><input id="mini-wechat-archive-user-nickname" class="mini-wechat-setting-input"></label><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u7b7e\u540d</span><input id="mini-wechat-archive-user-signature" class="mini-wechat-setting-input"></label></div><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">Lore</span><textarea id="mini-wechat-archive-user-lore" class="mini-wechat-setting-textarea"></textarea></label></div><div class="mini-wechat-archive-card"><div class="mini-wechat-section-title">Contact</div><div class="mini-wechat-inline-fields"><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u6635\u79f0</span><input id="mini-wechat-archive-contact-nickname" class="mini-wechat-setting-input"></label><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u540d\u5b57</span><input id="mini-wechat-archive-contact-name" class="mini-wechat-setting-input"></label></div><div class="mini-wechat-inline-fields"><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u7b7e\u540d</span><input id="mini-wechat-archive-contact-signature" class="mini-wechat-setting-input"></label><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">\u8bed\u8a00</span><input id="mini-wechat-archive-contact-language" class="mini-wechat-setting-input"></label></div><label class="mini-wechat-inline-field"><span class="mini-wechat-inline-label">Lore</span><textarea id="mini-wechat-archive-contact-lore" class="mini-wechat-setting-textarea"></textarea></label></div><div class="mini-wechat-archive-card"><div class="mini-wechat-archive-toolbar"><button type="button" class="mini-wechat-plain-btn" data-action="save-archive">SAVE ARCHIVE</button></div></div></div>'
      ].join('');

      const homePage = document.createElement('div');
      homePage.id = 'mini-wechat-home-page';
      homePage.className = 'page-layer mini-wechat-home-page';
      homePage.innerHTML = [
        createHeader('HOME', 'data-wechat-home-back="1"'),
        '<div class="mini-wechat-home-scroll"><div class="mini-wechat-home-card"><div class="mini-wechat-home-kicker">COMING SOON</div><div class="mini-wechat-home-title">\u8054\u7cfb\u4eba\u4e3b\u9875</div><div class="mini-wechat-home-copy">\u8fd9\u4e2a\u5165\u53e3\u5df2\u7ecf\u6253\u901a\uff0c\u540e\u9762\u53ef\u4ee5\u7ee7\u7eed\u63a5\u5bf9\u65b9\u7684\u52a8\u6001\uff0c\u684c\u9762\uff0c\u8d44\u6599\u5c55\u793a\u6216\u4e13\u5c5e\u4e3b\u9875\u5e03\u5c40\u3002</div></div></div>'
      ].join('');

      const importModal = document.createElement('div');
      importModal.className = 'modal-overlay';
      importModal.id = 'mini-wechat-import-modal';
      importModal.innerHTML = [
        '<div class="modal-box" onclick="event.stopPropagation()">',
        '<div class="modal-header">IMPORT CHAT HISTORY</div>',
        '<div class="mini-wechat-home-copy">\u8bf7\u9009\u62e9\u5bfc\u5165\u65b9\u5f0f\uff1a\u8986\u76d6\u4f1a\u5148\u6e05\u7a7a\u5df2\u5339\u914d\u804a\u5929\u7684\u5386\u53f2\uff1b\u517c\u5bb9\u4f1a\u5c3d\u91cf\u6309 messageId \u53bb\u91cd\u5408\u5e76\u3002</div>',
        '<div class="modal-actions"><button type="button" class="btn-cancel" data-import-cancel>CANCEL</button><button type="button" class="btn-save" data-import-mode="compatible">COMPATIBLE</button><button type="button" class="btn-danger" data-import-mode="overwrite">OVERWRITE</button></div>',
        '</div>'
      ].join('');

      [settingsPage, searchPage, summaryPage, archivePage, homePage, importModal].forEach((node) => document.body.appendChild(node));
      state.settingsPage = settingsPage;
      state.searchPage = searchPage;
      state.summaryPage = summaryPage;
      state.archivePage = archivePage;
      state.homePage = homePage;
      state.importModal = importModal;

      settingsPage.querySelector('[data-wechat-settings-back]').addEventListener('click', () => settingsPage.classList.remove('active'));
      searchPage.querySelector('[data-wechat-search-back]').addEventListener('click', () => searchPage.classList.remove('active'));
      summaryPage.querySelector('[data-wechat-summary-back]').addEventListener('click', () => summaryPage.classList.remove('active'));
      archivePage.querySelector('[data-wechat-archive-back]').addEventListener('click', () => archivePage.classList.remove('active'));
      homePage.querySelector('[data-wechat-home-back]').addEventListener('click', () => homePage.classList.remove('active'));

      settingsPage.addEventListener('click', async (event) => {
        const target = event.target.closest('[data-action],[data-setting-toggle]');
        if (!target) return;
        const action = target.dataset.action;
        const toggleField = target.dataset.settingToggle;
        if (toggleField) {
          const { contact } = getCurrentWechatSelection();
          const settings = getWechatContactSettings(contact);
          await updateCurrentWechatSettingField(toggleField, !settings[toggleField]);
          return;
        }
        if (action === 'open-home') {
          homePage.classList.add('active');
          return;
        }
        if (action === 'open-archive') {
          await openWechatArchivePage();
          return;
        }
        if (action === 'open-summary') {
          summaryPage.classList.add('active');
          await renderWechatSummaryPage();
          return;
        }
        if (action === 'run-summary') {
          const { contact, index } = getCurrentWechatSelection();
          await maybeRunWechatConversationSummary(contact, index, { force: true });
          return;
        }
        if (action === 'open-search') {
          searchPage.classList.add('active');
          await renderWechatSearchPage('');
          const input = searchPage.querySelector('#mini-wechat-search-input');
          if (input) input.focus();
          return;
        }
        if (action === 'export-json') {
          await exportWechatHistory('json');
          return;
        }
        if (action === 'export-zip') {
          await exportWechatHistory('zip');
          return;
        }
        if (action === 'import-history') {
          const file = await pickWechatAssetFile('.json,.zip,application/json,application/zip');
          if (file) await importWechatHistoryFromFile(file);
          return;
        }
        const { contact, index } = getCurrentWechatSelection();
        const currentContactId = getWechatCurrentContactId(contact);
        if (action === 'pick-wallpaper' && currentContactId != null) {
          const file = await pickWechatAssetFile('image/*');
          if (!file) return;
          await writeWechatContactSettings(currentContactId, { wallpaper: await readWechatFileAsDataUrl(file) });
          applyWechatThreadWallpaper(contact);
          await renderWechatSettingsPage();
          return;
        }
        if (action === 'clear-wallpaper' && currentContactId != null) {
          await writeWechatContactSettings(currentContactId, { wallpaper: '' });
          applyWechatThreadWallpaper(contact);
          await renderWechatSettingsPage();
          return;
        }
        if (action === 'pick-contact-avatar' && currentContactId != null) {
          const file = await pickWechatAssetFile('image/*');
          if (!file) return;
          const miniDb = await waitForMiniDb();
          await miniDb.ops.contacts.updateContact(currentContactId, { avatar: await readWechatFileAsDataUrl(file) });
          await applyWechatData(await loadUserContacts());
          await refreshWechatConversationUi({ selectionKey: getWechatContactKey(contact, index), openDetail: true });
          await renderWechatSettingsPage();
          return;
        }
        if (action === 'pick-user-avatar') {
          const file = await pickWechatAssetFile('image/*');
          const userMask = getWechatLinkedUserMask(contact);
          if (!file || !userMask || userMask.id == null) return;
          const miniDb = await waitForMiniDb();
          await miniDb.ops.masks.updateMask(userMask.id, { avatar: await readWechatFileAsDataUrl(file) });
          await applyWechatData(await loadUserContacts());
          await refreshWechatConversationUi({ selectionKey: contact ? getWechatContactKey(contact, index) : '', openDetail: true });
          await renderWechatSettingsPage();
        }
      });

      settingsPage.querySelectorAll('[data-setting-field]').forEach((input) => {
        input.addEventListener('change', () => {
          void updateCurrentWechatSettingField(input.dataset.settingField, input.value);
        });
      });
      searchPage.querySelector('#mini-wechat-search-input').addEventListener('input', (event) => {
        void renderWechatSearchPage(event.target.value);
      });
      summaryPage.querySelector('[data-action="summary-run-now"]').addEventListener('click', async () => {
        const { contact, index } = getCurrentWechatSelection();
        await maybeRunWechatConversationSummary(contact, index, { force: true });
        await renderWechatSummaryPage();
      });
      summaryPage.querySelector('[data-action="summary-refresh"]').addEventListener('click', () => {
        void renderWechatSummaryPage();
      });
      summaryPage.querySelector('[data-action="save-manual-memory"]').addEventListener('click', () => {
        void saveWechatManualMemoryFromPage();
      });
      archivePage.querySelector('[data-action="save-archive"]').addEventListener('click', () => {
        void saveWechatArchivePage();
      });

      return state;
    }

    async function openWechatSettingsPage() {
      const state = await ensureWechatSettingsPages();
      state.settingsPage.classList.add('active');
      await renderWechatSettingsPage();
    }

    function initWechatSend() {
      if (window.__miniWechatSendReady) return;
      const wrapper = document.querySelector('#chat-detail-page .input-wrapper');
      const bar = document.querySelector('#chat-detail-page .chat-input-bar');
      if (!wrapper || !bar) return;
      window.__miniWechatSendReady = true;
      void ensureWechatSettingsPages();
      installWechatPatInteractions();

      const originalInput = wrapper.querySelector('input');
      const textarea = document.createElement('textarea');
      textarea.className = 'mini-chat-textarea';
      textarea.placeholder = '\u8f93\u5165\u6d88\u606f...';
      textarea.rows = 1;
      if (originalInput) originalInput.replaceWith(textarea);
      else wrapper.appendChild(textarea);

      function resize() {
        textarea.style.height = 'auto';
        const nextHeight = Math.min(textarea.scrollHeight, 120);
        textarea.style.height = String(Math.max(24, nextHeight)) + 'px';
        textarea.style.overflowY = textarea.scrollHeight > 120 ? 'auto' : 'hidden';
      }

      const actionButtons = Array.from(bar.querySelectorAll(':scope > .btn-action'));
      const stickerButton = document.getElementById('trigger-sticker-picker') || actionButtons[actionButtons.length - 2];
      const sendButton = actionButtons[actionButtons.length - 1];
      const detailMenuTrigger = document.getElementById('wechat-detail-menu-trigger');

      function syncActionState() {
        if (!sendButton) return;
        const { contact } = getCurrentWechatSelection();
        const hasContact = !!contact;
        sendButton.style.opacity = hasContact ? '1' : '0.45';
        sendButton.style.cursor = hasContact ? 'pointer' : 'not-allowed';
        sendButton.setAttribute('aria-disabled', hasContact ? 'false' : 'true');
      }

      async function sendMessage(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
        }
        const { contact, index } = getCurrentWechatSelection();
        const currentContactId = getWechatCurrentContactId(contact);
        if (!contact || currentContactId == null) {
          showMiniNotice('\u8bf7\u5148\u901a\u8fc7\u53f3\u4e0a\u89d2\u9009\u62e9\u8054\u7cfb\u4eba');
          return;
        }
        const messages = document.querySelector('#chat-scroll .chat-messages');
        if (!messages) return;
        const extPanel = document.getElementById('ext-panel');
        if (extPanel) extPanel.style.display = 'none';
        const text = textarea.value.trim();
        if (!text) {
          if (isWechatTypingActiveFor(contact, index)) return;
          await enqueueWechatCharacterReply(contact, index, { mode: 'reply', trigger: 'manual_empty_send' });
          return;
        }
        if (text) {
          const composerState = window.__miniWechatComposer || {};
          const quoteMessage = composerState.quoteMessage || null;
          const sentType = quoteMessage ? 'quote' : 'text';
          const entry = await saveMessage(currentContactId, quoteMessage ? {
            chatId: currentContactId,
            direction: 'sent',
            type: sentType,
            timestamp: Date.now(),
            payload: {
              quote: quoteMessage,
              content: normalizeWechatLocalizedContent(text, text)
            }
          } : {
            chatId: currentContactId,
            direction: 'sent',
            type: sentType,
            timestamp: Date.now(),
            payload: {
              content: normalizeWechatLocalizedContent(text, text)
            }
          });
          if (entry) await appendWechatThreadEntryToUi(currentContactId, contact, index, entry);
          await refreshWechatListPreview(index);
          textarea.value = '';
          clearWechatQuoteDraft();
          resize();
          syncActionState();
          await triggerWechatAutoReplyForSentMessage(contact, index, sentType);
          return;
        }
      }

      textarea.addEventListener('input', () => {
        resize();
        syncActionState();
      });
      textarea.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) void sendMessage(event);
      });
      if (sendButton) {
        sendButton.addEventListener('click', (event) => {
          void sendMessage(event);
        }, true);
      }
      if (stickerButton && stickerButton.dataset.miniWechatStickerBound !== '1') {
        stickerButton.dataset.miniWechatStickerBound = '1';
        stickerButton.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          void toggleWechatStickerPicker(bar, stickerButton);
        }, true);
      }
      const triggerExt = document.getElementById('trigger-ext');
      if (triggerExt && triggerExt.dataset.miniWechatExtBound !== '1') {
        triggerExt.dataset.miniWechatExtBound = '1';
        triggerExt.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (typeof closeWechatStickerPicker === 'function') closeWechatStickerPicker();
          const extPanel = document.getElementById('ext-panel');
          if (!extPanel) return;
          extPanel.style.display = extPanel.style.display === 'flex' ? 'none' : 'flex';
        };
      }
      if (detailMenuTrigger && detailMenuTrigger.dataset.miniWechatSettingsBound !== '1') {
        detailMenuTrigger.dataset.miniWechatSettingsBound = '1';
        detailMenuTrigger.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          void openWechatSettingsPage();
        }, true);
      }
      ensureWechatStickerPicker(bar, stickerButton);
      bindWechatVoiceComposerTrigger();
      bindWechatCameraComposerTrigger();
      bindWechatImageComposerTrigger();
      bindWechatLocationComposerTrigger();
      window.__miniWechatComposer = {
        textarea,
        sendButton,
        bar,
        quoteMessage: null,
        quoteMessageKey: '',
        quoteChatId: null,
        syncActionState
      };
      ensureWechatQuoteDraftBar(bar);
      syncWechatQuoteDraftUi();
      syncWechatComposerState(getCurrentWechatSelection().contact);
      syncWechatComposerVisibility();
      resize();
    }

    function installWechatDiaryOverride() {
      if (routeName !== 'wechat') return;
      window.openDiaryList = async function openDiaryListOverride() {
        const page = document.getElementById('diary-list-page');
        if (!page) return;
        const { contact } = getCurrentWechatSelection();
        const currentContactId = getWechatCurrentContactId(contact);
        page.classList.add('active');
        await renderWechatDiaryTimeline(currentContactId);
      };
      window.openDiaryDetail = async function openDiaryDetailOverride(id) {
        const { contact } = getCurrentWechatSelection();
        const currentContactId = getWechatCurrentContactId(contact);
        const entry = await getScheduleEntry(currentContactId, id);
        if (!entry || entry.kind !== 'diary') {
          showMiniNotice('\u6682\u65e0\u53ef\u67e5\u770b\u7684\u65e5\u8bb0\u5185\u5bb9');
          return;
        }
        fillWechatDiaryDetail(entry);
      };
    }

    async function runWechatCharacterReply(contact, index, options = {}) {
      const currentContactId = getWechatCurrentContactId(contact);
      if (currentContactId == null) return;
      const typingToken = beginWechatTyping(contact, index);
      try {
        const miniDb = await waitForMiniDb();
        const api = miniDb && miniDb.ops && miniDb.ops.api;
        if (!api || typeof api.getChatConfig !== 'function') throw new Error('\u804a\u5929 API \u914d\u7f6e\u672a\u52a0\u8f7d');
        const config = await api.getChatConfig();
        const { systemPrompt, apiMessages, replyPolicy } = await buildWechatRolePromptBundle(currentContactId, contact, options, config || {});
        const replyResponse = await requestWechatChatCompletion(config || {}, systemPrompt, apiMessages);
        if (replyResponse && replyResponse.usage) {
          void recordWechatTokenUsage(currentContactId, replyResponse.usage);
        }
        const parsedPayload = parseWechatAiReply(replyResponse && replyResponse.text);
        const payload = await enforceWechatAiPayloadPolicy(parsedPayload, replyPolicy, config || {});
        if (!payload.messages.length) throw new Error('\u89d2\u8272\u56de\u590d\u4e3a\u7a7a');
        await persistWechatAiArtifacts(currentContactId, payload);
        const referenceMessages = await loadMessages(currentContactId);
        let appendedCount = 0;
        for (const reply of payload.messages) {
          await sleep(1000);
          const draft = buildWechatAiReplyEntry(reply, currentContactId, referenceMessages, Date.now());
          if (!draft) continue;
          const entry = await saveMessage(currentContactId, draft);
          if (!entry) continue;
          appendedCount += 1;
          referenceMessages.push(entry);
          await appendWechatThreadEntryToUi(currentContactId, contact, index, entry);
          showWechatIncomingBanner(contact, index, entry);
        }
        if (!appendedCount) throw new Error('\u89d2\u8272\u56de\u590d\u65e0\u6cd5\u89e3\u6790');
        await refreshWechatListPreview(index);
        await renderWechatThoughtPanel(currentContactId, contact, index);
        await refreshWechatDiaryIfVisible(currentContactId);
        if (contact && getWechatContactSettings(contact).patEnabled && Math.random() < wechatAutoPatProbability) {
          void emitWechatPatInteraction(contact, index, 'contact');
        }
        void maybeRunWechatConversationSummary(contact, index, { force: false });
      } catch (error) {
        showMiniNotice('\u89d2\u8272\u56de\u590d\u5931\u8d25\uff1a' + getMiniChatErrorMessage(error), 4200);
      } finally {
        endWechatTyping(contact, index, typingToken);
      }
    }

    function relabelThemeIconGrid() {
      if (routeName !== 'theme') return;
      document.querySelectorAll('#icon-grid-container .icon-name').forEach((node, index) => {
        if (iconNames[index]) node.textContent = iconNames[index];
      });
    }

    function relabelContactsShell() {
      if (routeName !== 'contacts') return;
      document.querySelectorAll('#dock-bar .dock-item span').forEach((node) => {
        const value = node.textContent.trim();
        if (value === 'CHAR') node.textContent = 'PEOPLE';
        if (value === 'NPC') node.textContent = 'SERVICES';
        if (value === '\u5173\u7cfb\u7f51') node.textContent = 'NETWORK';
      });
    }

    function installRouteEditorPanLock() {
      if ((routeName !== 'contacts' && routeName !== 'wechat_masks') || window.__miniRouteEditorPanLockInstalled) return;
      window.__miniRouteEditorPanLockInstalled = true;
      const editor = document.getElementById('view-editor');
      if (!editor) return;
      let startX = 0;
      let startY = 0;
      editor.addEventListener('touchstart', (event) => {
        const touch = event.touches && event.touches[0];
        if (!touch) return;
        startX = touch.clientX;
        startY = touch.clientY;
      }, { passive: true });
      editor.addEventListener('touchmove', (event) => {
        const touch = event.touches && event.touches[0];
        if (!touch || !event.cancelable) return;
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
          event.preventDefault();
        }
      }, { passive: false });
    }

    function installContactIsolationBridge() {
      if (routeName !== 'contacts' || window.__miniContactIsolationBridgeInstalled) return;
      window.__miniContactIsolationBridgeInstalled = true;
      if (typeof window.openEditor === 'function') {
        const originalOpenEditor = window.openEditor;
        window.openEditor = async function openEditorWithIsolation(id = null) {
          window.__miniCurrentContactEditorId = id == null ? null : id;
          return originalOpenEditor.apply(this, arguments);
        };
      }
      if (typeof window.closeEditor === 'function') {
        const originalCloseEditor = window.closeEditor;
        window.closeEditor = function closeEditorWithIsolation() {
          window.__miniCurrentContactEditorId = null;
          return originalCloseEditor.apply(this, arguments);
        };
      }
      if (typeof window.deleteContact === 'function') {
        window.deleteContact = async function deleteContactWithIsolation() {
          const currentEditId = window.__miniCurrentContactEditorId;
          if (!currentEditId) return;
          if (confirm('Delete this contact?')) {
            await window.MiniDB.ops.contacts.deleteContact(currentEditId);
            if (typeof window.closeEditor === 'function') window.closeEditor();
          }
        };
      }
    }

    const legacyContactPresetAssocValues = new Set(['MAIN_CHAR', 'SIDE_KICK', 'VILLAIN']);
    const legacyContactWorldbookAssocValues = new Set(['GLOBAL_RULE', 'CITY_LORE']);

    function buildContactAssocValue(type, id) {
      return (type === 'preset' ? 'mask' : 'worldbook') + ':' + id;
    }

    function getContactAssocOptionsState() {
      return window.__miniContactAssocOptions || { preset: [], worldbook: [] };
    }

    function splitContactAssocValues(type, rawValue) {
      const raw = String(rawValue == null ? '' : rawValue).trim();
      if (!raw || /^none$/i.test(raw)) return [];
      if (type !== 'worldbook') return [raw];
      return [...new Set(
        raw
          .split(/[|,\n]/)
          .map((item) => String(item || '').trim())
          .filter((item) => item && !/^none$/i.test(item))
      )];
    }

    function joinContactAssocValues(type, values = []) {
      const normalized = [...new Set((Array.isArray(values) ? values : [])
        .map((item) => String(item || '').trim())
        .filter(Boolean))];
      if (!normalized.length) return 'NONE';
      return type === 'worldbook' ? normalized.join('|') : normalized[0];
    }

    function resolveContactAssocLabels(type, rawValue, optionsState = getContactAssocOptionsState()) {
      const values = splitContactAssocValues(type, rawValue);
      const options = Array.isArray(optionsState[type]) ? optionsState[type] : [];
      return values.map((value) => {
        const match = options.find((item) => item && item.value === value);
        if (match && match.label) return match.label;
        if (type === 'preset') return value.replace(/^mask:/i, 'Mask ');
        return value.replace(/^worldbook:/i, 'Group ');
      }).filter(Boolean);
    }

    function formatContactAssocDisplayLabel(type, labels = []) {
      if (!labels.length) return 'None';
      if (type !== 'worldbook') return labels[0];
      if (labels.length === 1) return labels[0];
      if (labels.length === 2) return labels.join(' / ');
      return `${labels.slice(0, 2).join(' / ')} +${labels.length - 2}`;
    }

    function syncContactAssocChipRow(type, labels = []) {
      if (type !== 'worldbook') return;
      const container = document.getElementById('worldbook-selection-tags');
      if (!container) return;
      if (!labels.length) {
        container.innerHTML = '';
        return;
      }
      container.innerHTML = labels
        .map((label) => `<span class="assoc-chip">${escapeHtml(label)}</span>`)
        .join('');
    }

    function syncContactAssocDropdownSelection(type) {
      const list = document.getElementById(type + '-list');
      if (!list) return;
      const activeValues = new Set(splitContactAssocValues(type, document.getElementById('inp-' + type)?.value));
      list.querySelectorAll('.dropdown-item[data-value]').forEach((item) => {
        const itemValue = item.dataset.value || '';
        const isSelected = itemValue === 'NONE'
          ? activeValues.size === 0
          : activeValues.has(itemValue);
        item.classList.toggle('is-selected', isSelected);
      });
    }

    function updateContactAssocBadge(type) {
      const badgeId = type === 'preset' ? 'badge-preset' : 'badge-worldbook';
      const prefix = type === 'preset' ? 'P' : 'W';
      const badge = document.getElementById(badgeId);
      const hiddenInput = document.getElementById('inp-' + type);
      if (!badge) return;
      const labels = resolveContactAssocLabels(type, hiddenInput && hiddenInput.value);
      const displayValue = type === 'worldbook' && labels.length > 1
        ? `${labels.length} BOOKS`
        : formatContactAssocDisplayLabel(type, labels);
      badge.textContent = prefix + ': ' + displayValue;
    }

    function applyContactAssocSelection(type, value, label, dispatch = true) {
      const hiddenInput = document.getElementById('inp-' + type);
      const displayInput = document.getElementById('disp-' + type);
      const list = document.getElementById(type + '-list');
      if (!hiddenInput) return;

      let nextValues = splitContactAssocValues(type, hiddenInput.value);
      if (type === 'worldbook') {
        const explicitValues = splitContactAssocValues(type, value);
        const token = String(value || '').trim();
        if (!dispatch) {
          nextValues = explicitValues;
        } else if (!token || /^none$/i.test(token)) {
          nextValues = [];
        } else if (nextValues.includes(token)) {
          nextValues = nextValues.filter((item) => item !== token);
        } else {
          nextValues = nextValues.concat(token);
        }
      } else {
        nextValues = !value || /^none$/i.test(String(value).trim()) ? [] : [String(value).trim()];
      }

      const nextValue = joinContactAssocValues(type, nextValues);
      const labels = resolveContactAssocLabels(type, nextValue);
      if (displayInput) displayInput.value = formatContactAssocDisplayLabel(type, labels);
      hiddenInput.value = nextValue;
      if (dispatch) hiddenInput.dispatchEvent(new Event('input'));
      syncContactAssocChipRow(type, labels);
      syncContactAssocDropdownSelection(type);

      if (type !== 'worldbook' && list) {
        if (typeof window.closeDropdownList === 'function') window.closeDropdownList(list);
        else list.style.display = 'none';
      }
      updateContactAssocBadge(type);
    }

    function normalizeContactAssocValue(type, value, validValues) {
      const raw = String(value == null ? '' : value).trim();
      if (!raw || /^none$/i.test(raw)) return 'NONE';
      const legacyValues = type === 'preset' ? legacyContactPresetAssocValues : legacyContactWorldbookAssocValues;
      if (legacyValues.has(raw)) return 'NONE';
      if (type !== 'worldbook') return validValues.has(raw) ? raw : 'NONE';
      const nextValues = splitContactAssocValues(type, raw).filter((item) => validValues.has(item));
      return nextValues.length ? nextValues.join('|') : 'NONE';
    }

    async function loadContactAssocOptions() {
      const miniDb = await waitForMiniDb();
      const ops = miniDb && miniDb.ops ? miniDb.ops : null;
      const [presetMasks, worldbookGroups] = await Promise.all([
        ops && ops.masks && typeof ops.masks.listByType === 'function'
          ? ops.masks.listByType('USER')
          : Promise.resolve([]),
        ops && ops.worldbook && typeof ops.worldbook.listGroups === 'function'
          ? ops.worldbook.listGroups()
          : Promise.resolve([])
      ]);
      return {
        preset: (Array.isArray(presetMasks) ? presetMasks : []).map((mask) => ({
          value: buildContactAssocValue('preset', mask.id),
          label: mask.nickname || mask.name || mask.account || ('Mask ' + mask.id)
        })),
        worldbook: (Array.isArray(worldbookGroups) ? worldbookGroups : []).map((group) => ({
          value: buildContactAssocValue('worldbook', group.id),
          label: group.name || ('Group ' + group.id)
        }))
      };
    }

    function renderContactAssocDropdown(type, options) {
      const list = document.getElementById(type + '-list');
      if (!list) return;
      const emptyCopy = type === 'preset' ? 'No user presets yet' : 'No worldbooks yet';
      list.innerHTML = '';

      const addOption = (value, label) => {
        const item = document.createElement('div');
        item.className = type === 'worldbook' ? 'dropdown-item dropdown-item-multi' : 'dropdown-item';
        item.dataset.value = value;
        if (type === 'worldbook') {
          item.innerHTML = `<span>${escapeHtml(label)}</span><span class="dropdown-item-check"></span>`;
        } else {
          item.textContent = label;
        }
        item.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (typeof window.selectDropdownItem === 'function') {
            window.selectDropdownItem(type, value, label, event);
          } else {
            applyContactAssocSelection(type, value, label, true);
          }
        });
        list.appendChild(item);
      };

      addOption('NONE', type === 'worldbook' ? 'Clear all' : 'None');

      if (!options.length) {
        const empty = document.createElement('div');
        empty.className = 'dropdown-item';
        empty.textContent = emptyCopy;
        empty.style.opacity = '0.55';
        empty.style.cursor = 'default';
        list.appendChild(empty);
        return;
      }

      options.forEach((option) => addOption(option.value, option.label));
      syncContactAssocDropdownSelection(type);
    }

    async function sanitizeStoredContactAssociations(optionsState) {
      const handle = await openContactsDatabase();
      if (!handle) return;
      const { db, close } = handle;
      const validPresetValues = new Set(['NONE', ...optionsState.preset.map((item) => item.value)]);
      const validWorldbookValues = new Set(['NONE', ...optionsState.worldbook.map((item) => item.value)]);
      try {
        const contacts = await db.contacts.toArray();
        for (const contact of contacts) {
          const nextPreset = normalizeContactAssocValue('preset', contact.presetAssoc, validPresetValues);
          const nextWorldbook = normalizeContactAssocValue('worldbook', contact.worldbookAssoc, validWorldbookValues);
          const changes = {};
          if (String(contact.presetAssoc || 'NONE').trim() !== nextPreset) changes.presetAssoc = nextPreset;
          if (String(contact.worldbookAssoc || 'NONE').trim() !== nextWorldbook) changes.worldbookAssoc = nextWorldbook;
          if (Object.keys(changes).length) await db.contacts.update(contact.id, changes);
        }
      } finally {
        close();
      }
    }

    async function syncContactAssocSelection(contactId = null, optionsState = getContactAssocOptionsState()) {
      const resolveSelection = (type, rawValue) => {
        const options = optionsState[type] || [];
        const validValues = new Set(['NONE', ...options.map((item) => item.value)]);
        const nextValue = normalizeContactAssocValue(type, rawValue, validValues);
        const labels = resolveContactAssocLabels(type, nextValue, optionsState);
        return {
          value: nextValue,
          label: formatContactAssocDisplayLabel(type, labels)
        };
      };

      if (contactId != null) {
        const handle = await openContactsDatabase();
        if (!handle) {
          applyContactAssocSelection('preset', 'NONE', 'None', false);
          applyContactAssocSelection('worldbook', 'NONE', 'None', false);
          return;
        }
        const { db, close } = handle;
        try {
          const contact = await db.contacts.get(contactId);
          const presetSelection = resolveSelection('preset', contact && contact.presetAssoc);
          const worldbookSelection = resolveSelection('worldbook', contact && contact.worldbookAssoc);
          applyContactAssocSelection('preset', presetSelection.value, presetSelection.label, false);
          applyContactAssocSelection('worldbook', worldbookSelection.value, worldbookSelection.label, false);
        } finally {
          close();
        }
        return;
      }

      const presetInput = document.getElementById('inp-preset');
      const worldbookInput = document.getElementById('inp-worldbook');
      const presetSelection = resolveSelection('preset', presetInput && presetInput.value);
      const worldbookSelection = resolveSelection('worldbook', worldbookInput && worldbookInput.value);
      applyContactAssocSelection('preset', presetSelection.value, presetSelection.label, false);
      applyContactAssocSelection('worldbook', worldbookSelection.value, worldbookSelection.label, false);
    }

    function installContactAssocSelectionPatch() {
      if (routeName !== 'contacts' || window.__miniContactAssocSelectionPatched) return;
      window.__miniContactAssocSelectionPatched = true;
      const originalSelectDropdownItem = typeof window.selectDropdownItem === 'function'
        ? window.selectDropdownItem
        : null;
      window.selectDropdownItem = function patchedSelectDropdownItem(type, value, label, event) {
        if (type === 'preset' || type === 'worldbook') {
          if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
          applyContactAssocSelection(type, value, label, true);
          return;
        }
        if (originalSelectDropdownItem) return originalSelectDropdownItem.apply(this, arguments);
      };

      ['preset', 'worldbook'].forEach((type) => {
        const hiddenInput = document.getElementById('inp-' + type);
        if (!hiddenInput || hiddenInput.dataset.miniAssocBadgeBound === '1') return;
        hiddenInput.dataset.miniAssocBadgeBound = '1';
        hiddenInput.addEventListener('input', () => updateContactAssocBadge(type));
      });
    }

    function installContactAssocEditorPatch() {
      if (routeName !== 'contacts' || window.__miniContactAssocEditorPatched) return;
      window.__miniContactAssocEditorPatched = true;

      const originalResetForm = typeof window.resetForm === 'function' ? window.resetForm : null;
      if (originalResetForm) {
        window.resetForm = function patchedResetForm() {
          const result = originalResetForm.apply(this, arguments);
          applyContactAssocSelection('preset', 'NONE', 'None', false);
          applyContactAssocSelection('worldbook', 'NONE', 'None', false);
          return result;
        };
      }

      const originalOpenEditor = typeof window.openEditor === 'function' ? window.openEditor : null;
      if (originalOpenEditor) {
        window.openEditor = async function patchedOpenEditor(id = null) {
          const result = await originalOpenEditor.apply(this, arguments);
          await refreshContactAssocOptions(id);
          return result;
        };
      }

      const originalImportData = typeof window.importData === 'function' ? window.importData : null;
      if (originalImportData) {
        window.importData = async function patchedImportData(event) {
          const result = await originalImportData.apply(this, arguments);
          await refreshContactAssocOptions();
          return result;
        };
      }
    }

    async function refreshContactAssocOptions(contactId = null) {
      if (routeName !== 'contacts') return;
      installContactAssocSelectionPatch();
      installContactAssocEditorPatch();
      const optionsState = await loadContactAssocOptions();
      window.__miniContactAssocOptions = optionsState;
      renderContactAssocDropdown('preset', optionsState.preset);
      renderContactAssocDropdown('worldbook', optionsState.worldbook);
      await sanitizeStoredContactAssociations(optionsState);
      await syncContactAssocSelection(contactId, optionsState);
    }

    async function runRouteDataFixes() {
      if (routeName === 'contacts') {
        await loadUserContacts();
        await refreshContactAssocOptions();
        relabelContactsShell();
        if (typeof window.loadList === 'function') window.loadList();
      }
      if (routeName === 'anniversary') {
        await purgeGeneratedContacts();
        await purgeGeneratedAnniversaries();
        if (typeof window.renderUI === 'function') window.renderUI();
      }
      if (routeName === 'wechat') {
        await purgeGeneratedAnniversaries();
        const contacts = await loadUserContacts();
        await applyWechatData(contacts);
        initWechatSend();
        installWechatChatLauncher();
        installWechatDiaryOverride();
      }
      if (routeName === 'desktop') applyDesktopIconOverrides();
      relabelThemeIconGrid();
    }

    onReady(async () => {
      installRouteEditorPanLock();
      installThemeWriteBridge();
      installNoticeBridge();
      installContactIsolationBridge();
      installWechatBubbleQuickActions();
      installWechatDiaryOverride();
      installRouteNavigationGuards();
      installRouteCopyGuards();
      await applyThemeSettings();
      if (routeName === 'desktop') {
        refreshDesktopWidgetLayouts();
        queueDesktopWidgetLayoutRefresh();
      }
      await installSettingsApiEnhancements();
      await runRouteDataFixes();
      installThemeVisibilityControls();
      installRouteNavigationGuards();
      normalizeModals();
      normalizeRouteCopy();
      relabelContactsShell();
      relabelThemeIconGrid();
      window.addEventListener('message', (event) => {
        if (!event.data || event.data.type !== 'mini-apply-theme') return;
        applyThemeSettings();
        if (routeName === 'wechat' || routeName === 'contacts' || routeName === 'anniversary') runRouteDataFixes();
        installRouteNavigationGuards();
        installThemeVisibilityControls();
        installContactIsolationBridge();
        if (routeName === 'theme') {
          syncThemeIconVisibilityControls();
          syncThemeWidgetVisibilityControls();
        }
        normalizeModals();
        normalizeRouteCopy();
      });
    });
  }

  function injectBefore(html, token, payload) {
    const index = html.lastIndexOf(token);
    if (index === -1) return html + payload;
    return html.slice(0, index) + payload + html.slice(index);
  }

  function replaceHtmlLiterals(html, replacements) {
    return replacements.reduce((result, [from, to]) => result.split(from).join(to), html);
  }

  function normalizePageHtml(route, html) {
    let next = html;

    if (route === 'desktop') {
      next = next
        .replace(/<style data-mini-desktop-pager-style>[\s\S]*?<\/style>/i, '')
        .replace(/<script>\s*\(function\s*\(\)\s*\{\s*if \(window\.__miniDesktopPagerReady\) return;[\s\S]*?<\/script>/i, '');
    }

    if (route === 'contacts') {
      next = next.replace(
        /const db = window\.MiniDB\.databases\.contacts;\r?\n\s*\}\);\r?\n/,
        'const db = window.MiniDB.databases.contacts;\n'
      );
      next = replaceHtmlLiterals(next, [
        ['onclick="returnToParent()">CONTACTS', 'onclick="returnToParent()">CONTACTS'],
        ['onclick="returnToParent()">NETWORK', 'onclick="returnToParent()">NETWORK'],
        ['Target (鐩爣)', 'Target'],
        ['Relation (鍏崇郴绫诲瀷)', 'Relation'],
        ['Description (鍏崇郴鎻忚堪)', 'Description'],
        ['placeholder="杈撳叆鑷畾涔夊叧绯?.."', 'placeholder="Enter custom relation..."'],
        ['placeholder="鎻忚堪浠栦滑涔嬮棿鐨勫叧绯昏鎯?.."', 'placeholder="Describe the relation..."'],
        ['onclick="setRelationType(\'瀹朵汉\', this)">瀹朵汉', 'onclick="setRelationType(\'Family\', this)">Family'],
        ['onclick="setRelationType(\'鎭嬩汉\', this)">鎭嬩汉', 'onclick="setRelationType(\'Partner\', this)">Partner'],
        ['onclick="setRelationType(\'鏈嬪弸\', this)">鏈嬪弸', 'onclick="setRelationType(\'Friend\', this)">Friend'],
        ['onclick="setRelationType(\'鍚屼簨\', this)">鍚屼簨', 'onclick="setRelationType(\'Colleague\', this)">Colleague'],
        ['onclick="setRelationType(\'CUSTOM\', this)">濉啓', 'onclick="setRelationType(\'CUSTOM\', this)">Custom'],
        ['<input type="hidden" id="inp-rel-type" value="瀹朵汉">', '<input type="hidden" id="inp-rel-type" value="Family">'],
        ['setRelationType(\'瀹朵汉\', document.querySelectorAll(\'#relation-modal .tab-btn\')[0]);', 'setRelationType(\'Family\', document.querySelectorAll(\'#relation-modal .tab-btn\')[0]);'],
        ['const type = rel.relationType || \'CUSTOM\';', 'const type = ({ \'瀹朵汉\': \'Family\', \'鎭嬩汉\': \'Partner\', \'鏈嬪弸\': \'Friend\', \'鍚屼簨\': \'Colleague\' }[rel.relationType] || rel.relationType || \'CUSTOM\');'],
        ['const relTypeDisp = rel.relationType || rel.relationDesc || \'Unknown\';', 'const relTypeDisp = ({ \'瀹朵汉\': \'Family\', \'鎭嬩汉\': \'Partner\', \'鏈嬪弸\': \'Friend\', \'鍚屼簨\': \'Colleague\' }[rel.relationType] || rel.relationType || rel.relationDesc || \'Unknown\');'],
        ['Please specify the custom relation. (璇峰～鍐欒嚜瀹氫箟鍏崇郴)', 'Please specify the custom relation.'],
        ['Please select a target entity. (璇烽€夋嫨鐩爣)', 'Please select a target entity.'],
        ['Please describe the relation details. (璇峰～鍐欏叧绯绘弿杩?', 'Please describe the relation details.'],
        ['Delete this contact? (鍒犻櫎涓嶅彲閫嗚浆)', 'Delete this contact?'],
        ['Delete this relation? (纭鍒犻櫎姝ゅ叧绯伙紵)', 'Delete this relation?']
      ]);
    }

    if (route === 'contacts') {
      next = next
        .replace(
          /<div class="dropdown-item" onclick="selectDropdownItem\('preset', 'NONE', 'None', event\)">None<\/div>\s*<div class="dropdown-item" onclick="selectDropdownItem\('preset', 'MAIN_CHAR', 'Main Character', event\)">Main Character<\/div>\s*<div class="dropdown-item" onclick="selectDropdownItem\('preset', 'SIDE_KICK', 'Side Kick', event\)">Side Kick<\/div>\s*<div class="dropdown-item" onclick="selectDropdownItem\('preset', 'VILLAIN', 'Villain', event\)">Villain<\/div>/,
          ''
        )
        .replace(
          /<div class="dropdown-item" onclick="selectDropdownItem\('worldbook', 'NONE', 'None', event\)">None<\/div>\s*<div class="dropdown-item" onclick="selectDropdownItem\('worldbook', 'GLOBAL_RULE', 'Global Rules', event\)">Global Rules<\/div>\s*<div class="dropdown-item" onclick="selectDropdownItem\('worldbook', 'CITY_LORE', 'City Lore', event\)">City Lore<\/div>/,
          ''
        );
    }

    if (route === 'anniversary') {
      next = replaceHtmlLiterals(next, [
        ['Memory (绾康)', 'Memory'],
        ['Birthday (鐮磋泲)', 'Birthday'],
        ['Target (鐩爣)', 'Target'],
        ['Count Up (宸茶繃)', 'Count Up'],
        ['Count Down (鍊掓暟)', 'Count Down'],
        ['Pin to Top (缃《)', 'Pin to Top'],
        ['placeholder="Enter name (e.g. Lin Mo)"', 'placeholder="Enter name"']
      ]);
      next = next.replace(
        /\/\/ 鎻掑叆涓€鏉″垵濮嬪寲绌烘暟鎹互渚涢瑙堬紙濡傛灉鏁版嵁搴撲负绌猴級[\s\S]*?renderUI\(\);/,
        [
          'const count = await db.events.count();',
          'if (count === 0) {',
          '    // Keep the empty state until the user adds real events.',
          '}',
          'renderUI();'
        ].join('\n')
      );
    }

    if (route === 'wechat') {
      next = next
        .replace(
          /<div class="chat-list">[\s\S]*?(?=\s*<\/div>\s*<\/div>\s*<div class="page-container" id="page-moments">)/,
          '<div class="chat-list">'
        )
        .replace(
          /<div class="moments-feed">[\s\S]*?(?=\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="page-container" id="page-profile">)/,
          '<div class="moments-feed">'
        )
        .replace(
          /const charDiaryData = \[[\s\S]*?\];/,
          'const charDiaryData = [];'
        )
        .replace(
          /(<div class="header-title" id="header-title-btn">)[\s\S]*?(<\/div>)/,
          '$1@\u672a\u9009\u62e9\u8054\u7cfb\u4eba$2'
        )
        .replace(
          /(<div class="moments-name edit-text" id="moments-name">)[\s\S]*?(<\/div>)/,
          '$1\u6211\u7684\u670b\u53cb\u5708$2'
        )
        .replace(
          /(<div class="moments-signature edit-text" id="moments-sign">)[\s\S]*?(<\/div>)/,
          '$1\u6682\u65e0\u670b\u53cb\u5708\u5185\u5bb9$2'
        )
        .replace(
          /(<div class="profile-nickname edit-text" id="profile-name">)[\s\S]*?(<\/div>)/,
          '$1\u6211\u7684\u5fae\u4fe1$2'
        )
        .replace(
          /(<div class="profile-name-big">)[\s\S]*?(<\/div>)/,
          '$1\u672a\u9009\u62e9\u8054\u7cfb\u4eba$2'
        )
        .replace(
          /(<div class="profile-id edit-text" id="profile-id">)[\s\S]*?(<\/div>)/,
          '$1@\u6211\u7684\u8d26\u53f7$2'
        );
    }

    return next;
  }

  function bootstrapMiniRuntime(route) {
    const routeName = String(route || '').trim();
    if (!routeName) return;
    let runtimeStyle = document.querySelector('style[data-mini-runtime-style]');
    if (!runtimeStyle) {
      runtimeStyle = document.createElement('style');
      runtimeStyle.setAttribute('data-mini-runtime-style', '');
      runtimeStyle.textContent = runtimeCss;
      (document.head || document.documentElement || document.body).appendChild(runtimeStyle);
    } else if (runtimeStyle.textContent !== runtimeCss) {
      runtimeStyle.textContent = runtimeCss;
    }
    if (window.__miniRuntimeBootedRoute === routeName) return;
    window.__miniRuntimeBootedRoute = routeName;
    injectedRuntime(routeName, realContacts, realEvents, appOrder, legacyIconMap);
  }

  window.decorateMiniPage = function decorateMiniPage(route, html) {
    const normalizedHtml = normalizePageHtml(route, html);
    const styleTag = '<style data-mini-runtime-style>' + runtimeCss + '</style>';
    const dexieTag = /<script[^>]+dexie/i.test(normalizedHtml) ? '' : '<script src="https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.min.js"><\/script>';
    const dbTag = '<script src="./APP/core/db.js"><\/script>';
    const args = [
      JSON.stringify(route),
      JSON.stringify(realContacts),
      JSON.stringify(realEvents),
      JSON.stringify(appOrder),
      JSON.stringify(legacyIconMap)
    ].join(',');
    const scriptTag = '<script data-mini-runtime-script>(' + injectedRuntime.toString() + ')(' + args + ');<\/script>';
    const withStyle = injectBefore(normalizedHtml, '</head>', dexieTag + dbTag + styleTag);
    return injectBefore(withStyle, '</body>', scriptTag);
  };

  window.bootstrapMiniRuntime = bootstrapMiniRuntime;

  const liveRoute = window.__MINI_ROUTE__
    || (document.documentElement && document.documentElement.dataset && document.documentElement.dataset.miniRoute)
    || (document.body && document.body.dataset && document.body.dataset.miniRoute);

  if (liveRoute) {
    bootstrapMiniRuntime(liveRoute);
  }
})();


