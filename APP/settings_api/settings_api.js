let toastTimeout; let currentAudioUrl = null;
function showToast(msg, duration = 3200) { const toast = document.getElementById('toast'); toast.innerText = msg; toast.classList.add('show'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => toast.classList.remove('show'), duration); }
function toggleCollapse(id) { const body = document.getElementById(id); const chevron = document.getElementById(id === 'chat-body' ? 'chat-chevron' : 'voice-chevron'); if (body.style.display === 'none') { body.style.display = 'flex'; chevron.style.transform = 'rotate(0deg)'; } else { body.style.display = 'none'; chevron.style.transform = 'rotate(-90deg)'; } }
const svgEyeOpen = '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="3"/>'; const svgEyeClosed = '<path d="M2 2l20 20"/><path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6"/><path d="M7.1 7.8C4.1 9.2 2 12 2 12s3.5 6 10 6c1.6 0 3-.3 4.2-.8"/><path d="M14.1 6.3C19.1 7.1 22 12 22 12s-.9 1.6-2.5 3.1"/>';
function togglePwd(inputId, iconId) { const input = document.getElementById(inputId); const icon = document.getElementById(iconId); if (input.type === 'password') { input.type = 'text'; icon.innerHTML = svgEyeClosed; } else { input.type = 'password'; icon.innerHTML = svgEyeOpen; } }
const providerConfigs = { openai:{label:'OpenAI',defaultBase:'https://api.openai.com/v1',basePath:'/v1',chatPath:'/chat/completions',modelsPath:'/models',auth:'bearer',list:true}, claude:{label:'Anthropic Claude',defaultBase:'https://api.anthropic.com/v1',basePath:'/v1',chatPath:'/messages',modelsPath:'/models',auth:'anthropic',list:true}, qwen:{label:'千问 / 阿里百炼',defaultBase:'https://dashscope.aliyuncs.com/compatible-mode/v1',basePath:'/compatible-mode/v1',chatPath:'/chat/completions',modelsPath:'/models',auth:'bearer',list:false,fallbackModels:['qwen3-max','qwen3-max-preview','qwen3.6-plus','qwen3.5-plus','qwen-plus','qwen-max','qwen-flash','qwen-turbo','qwen3-coder-plus','qwen3-coder-flash']}, deepseek:{label:'DeepSeek',defaultBase:'https://api.deepseek.com',basePath:'',chatPath:'/chat/completions',modelsPath:'/models',auth:'bearer',list:true}, doubao:{label:'豆包 / 火山方舟',defaultBase:'https://ark.cn-beijing.volces.com/api/v3',basePath:'/api/v3',chatPath:'/chat/completions',modelsPath:'/models',auth:'bearer',list:false,fallbackModels:[]}, kimi:{label:'Kimi / Moonshot',defaultBase:'https://api.moonshot.cn/v1',basePath:'/v1',chatPath:'/chat/completions',modelsPath:'/models',auth:'bearer',list:true,fallbackModels:['kimi-k2.5','kimi-k2','kimi-k2-thinking','moonshot-v1-8k','moonshot-v1-32k','moonshot-v1-128k']}, llama:{label:'Llama / OpenAI 兼容',defaultBase:'http://localhost:8000/v1',basePath:'/v1',chatPath:'/chat/completions',modelsPath:'/models',auth:'bearer',list:true}, newapi:{label:'New API / One API',defaultBase:'https://你的newapi服务器地址/v1',basePath:'/v1',chatPath:'/chat/completions',modelsPath:'/models',auth:'bearer',list:true} };
const voiceEndpointMap = { official:'https://api.minimax.io/v1/t2a_v2', uw:'https://api-uw.minimax.io/v1/t2a_v2' };
function autoFillUrl(){ const cfg=providerConfigs[document.getElementById('api-provider').value]; document.getElementById('api-url').value=cfg.defaultBase; document.getElementById('chat-model-list').style.display='none'; }
function cleanPath(path){ return (path||'').replace(/\/+$/,''); }
function normalizeBaseUrl(rawUrl,cfg){ const value=(rawUrl||cfg.defaultBase||'').trim(); if(!value) throw new Error('请先填写接口地址'); let parsed; try{parsed=new URL(value);}catch(error){throw new Error('接口地址不是有效 URL：'+value);} let path=cleanPath(parsed.pathname); const knownPaths=['/chat/completions','/messages','/models','/v1/chat/completions','/v1/messages','/v1/models','/api/v3/chat/completions','/api/v3/models','/compatible-mode/v1/chat/completions','/compatible-mode/v1/models']; for(const known of knownPaths){ if(path.endsWith(known)){ path=cleanPath(path.slice(0,-known.length)); break; } } if(cfg.basePath&&!path.endsWith(cfg.basePath)) path=cleanPath(path+cfg.basePath); parsed.pathname=path||'/'; parsed.search=''; parsed.hash=''; return parsed.toString().replace(/\/$/,''); }
function buildEndpoint(rawUrl,cfg,endpointPath){ return normalizeBaseUrl(rawUrl,cfg).replace(/\/$/,'')+endpointPath; }
function buildModelHeaders(cfg,apiKey){ const key=(apiKey||'').trim(); if(!key) throw new Error('请先填写 API Key'); if(cfg.auth==='anthropic') return {'x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'}; return {'Authorization':'Bearer '+key}; }
function extractModels(data){ const raw=Array.isArray(data)?data:data&&Array.isArray(data.data)?data.data:[]; return raw.map(item=>typeof item==='string'?item:item&&(item.id||item.name)).filter(Boolean); }
function populateModelList(models,listId,inputId){ const list=document.getElementById(listId); list.innerHTML=''; Array.from(new Set(models)).forEach(model=>{ const item=document.createElement('div'); item.className='dropdown-item'; item.innerText=model; item.onclick=()=>selectModelItem(inputId,listId,model); list.appendChild(item); }); document.querySelectorAll('.custom-dropdown').forEach(el=>el.style.display='none'); list.style.display=models.length?'flex':'none'; }
async function fetchChatModels(event){ if(event) event.stopPropagation(); const cfg=providerConfigs[document.getElementById('api-provider').value]; const urlInput=document.getElementById('api-url'); const rawUrl=urlInput.value; try{ const chatEndpoint=buildEndpoint(rawUrl,cfg,cfg.chatPath); urlInput.value=chatEndpoint; if(!cfg.list){ if(cfg.fallbackModels&&cfg.fallbackModels.length){ populateModelList(cfg.fallbackModels,'chat-model-list','chat-model'); showToast(cfg.label+' 未提供公开模型列表接口，已列出官方文档模型名；仍可手动填写。',4600); } else { populateModelList([],'chat-model-list','chat-model'); showToast(cfg.label+' 的模型/接入点 ID 需在控制台复制；接口后缀已补齐。',4600); } return; } const modelsEndpoint=buildEndpoint(rawUrl,cfg,cfg.modelsPath); showToast('正在拉取模型列表...'); const response=await fetch(modelsEndpoint,{method:'GET',headers:buildModelHeaders(cfg,document.getElementById('chat-apikey').value)}); const text=await response.text(); let data=null; try{data=text?JSON.parse(text):null;}catch(error){} if(!response.ok) throw new Error(extractApiError(data)||(response.status+' '+response.statusText+(text?': '+text.slice(0,180):''))); const models=extractModels(data); if(!models.length) throw new Error('接口返回成功，但没有可用模型字段'); populateModelList(models,'chat-model-list','chat-model'); showToast('模型拉取成功，接口已补齐后缀。'); }catch(error){ const fallback=cfg&&cfg.fallbackModels?cfg.fallbackModels:[]; if(fallback.length) populateModelList(fallback,'chat-model-list','chat-model'); showToast('模型拉取失败：'+getErrorMessage(error),6500); } }
function toggleDropdown(listId){ const list=document.getElementById(listId); if(!list) return; if(list.style.display==='flex') list.style.display='none'; else { document.querySelectorAll('.custom-dropdown').forEach(el=>el.style.display='none'); if(list.children.length) list.style.display='flex'; } }
function selectModelItem(inputId,listId,value){ document.getElementById(inputId).value=value; document.getElementById(listId).style.display='none'; }
function selectEnv(el,type){ document.querySelectorAll('#voice-body .radio-pill').forEach(pill=>pill.classList.remove('active')); el.classList.add('active'); document.getElementById('voice-url').value=voiceEndpointMap[type]||voiceEndpointMap.official; }
function normalizeVoiceEndpoint(rawUrl){ const value=(rawUrl||voiceEndpointMap.official).trim(); let parsed; try{parsed=new URL(value);}catch(error){throw new Error('语音接口地址不是有效 URL：'+value);} let path=cleanPath(parsed.pathname); if(path.endsWith('/t2a_v2')){} else if(path.endsWith('/v1')) path+='/t2a_v2'; else path=cleanPath(path+'/v1/t2a_v2'); parsed.pathname=path; parsed.hash=''; return parsed.toString(); }
function extractApiError(data){ if(!data) return ''; if(typeof data==='string') return data; if(data.error){ if(typeof data.error==='string') return data.error; return [data.error.type,data.error.code,data.error.message].filter(Boolean).join(' / '); } if(data.base_resp&&data.base_resp.status_code&&data.base_resp.status_code!==0) return [data.base_resp.status_code,data.base_resp.status_msg].filter(Boolean).join(' / '); return data.message||data.msg||''; }
function getErrorMessage(error){ return error&&error.message?error.message:String(error||'未知错误'); }
function hexToBytes(hex){ const clean=String(hex||'').replace(/\s+/g,''); if(!clean||clean.length%2!==0) throw new Error('语音接口返回的 audio 不是有效 hex'); const bytes=new Uint8Array(clean.length/2); for(let i=0;i<clean.length;i+=2) bytes[i/2]=parseInt(clean.slice(i,i+2),16); return bytes; }
async function testVoiceApi(event){ if(event) event.stopPropagation(); const apiKey=document.getElementById('voice-apikey').value.trim(); const voiceId=document.getElementById('voice-id').value.trim(); const model=document.getElementById('voice-tts-model').value.trim()||'speech-2.8-hd'; const groupId=document.getElementById('voice-group-id').value.trim(); const language=document.getElementById('voice-language').value||'auto'; const speed=Number(document.getElementById('voice-speed').value||1); try{ if(!apiKey) throw new Error('请先填写语音 API Key'); if(!voiceId) throw new Error('请先填写 Voice ID'); const endpoint=new URL(normalizeVoiceEndpoint(document.getElementById('voice-url').value)); if(groupId) endpoint.searchParams.set('GroupId',groupId); document.getElementById('voice-url').value=endpoint.origin+endpoint.pathname; showToast('正在生成测试语音...'); const response=await fetch(endpoint.toString(),{method:'POST',headers:{'Authorization':'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify({model,text:'语音连接成功，Cloud Rabbit 已正常启动。',stream:false,language_boost:language,output_format:'hex',voice_setting:{voice_id:voiceId,speed,vol:1,pitch:0},audio_setting:{sample_rate:32000,bitrate:128000,format:'mp3',channel:1}})}); const text=await response.text(); let data=null; try{data=text?JSON.parse(text):null;}catch(error){} if(!response.ok) throw new Error(extractApiError(data)||(response.status+' '+response.statusText+(text?': '+text.slice(0,180):''))); if(data&&data.base_resp&&data.base_resp.status_code!==0) throw new Error(extractApiError(data)); const audioHex=data&&data.data&&data.data.audio; const audioUrl=data&&data.data&&data.data.audio_url; if(currentAudioUrl) URL.revokeObjectURL(currentAudioUrl); let playableUrl=audioUrl; if(!playableUrl&&audioHex){ currentAudioUrl=URL.createObjectURL(new Blob([hexToBytes(audioHex)],{type:'audio/mpeg'})); playableUrl=currentAudioUrl; } if(!playableUrl) throw new Error('语音接口返回成功，但没有 audio 或 audio_url'); const audio=new Audio(playableUrl); await audio.play(); showToast('语音连接成功，Cloud Rabbit 已正常启动。',4200); }catch(error){ showToast('语音连接失败：'+getErrorMessage(error),7000); } }
async function saveChatConfig(){ const data={provider:document.getElementById('api-provider').value,url:document.getElementById('api-url').value.trim(),apiKey:document.getElementById('chat-apikey').value,model:document.getElementById('chat-model').value.trim(),context:document.getElementById('ctx-input').value,temperature:document.querySelector('#chat-body input[type=range]').value}; const api=window.MiniDB&&window.MiniDB.ops&&window.MiniDB.ops.api; if(!api){ showToast('\u6570\u636e\u5c42\u672a\u52a0\u8f7d'); return; } await api.saveChatConfig(data); showToast('\u804a\u5929\u914d\u7f6e\u5df2\u4fdd\u5b58'); }
async function saveVoiceConfig(){ const data={url:document.getElementById('voice-url').value.trim(),apiKey:document.getElementById('voice-apikey').value,groupId:document.getElementById('voice-group-id').value.trim(),ttsModel:document.getElementById('voice-tts-model').value.trim(),voiceId:document.getElementById('voice-id').value.trim(),language:document.getElementById('voice-language').value,speed:document.getElementById('voice-speed').value}; const api=window.MiniDB&&window.MiniDB.ops&&window.MiniDB.ops.api; if(!api){ showToast('\u6570\u636e\u5c42\u672a\u52a0\u8f7d'); return; } await api.saveVoiceConfig(data); showToast('\u8bed\u97f3\u914d\u7f6e\u5df2\u4fdd\u5b58'); }
async function loadApiConfig(){ try{ const api=window.MiniDB&&window.MiniDB.ops&&window.MiniDB.ops.api; if(!api) return; const chat=await api.getChatConfig(); if(chat){ document.getElementById('api-provider').value=chat.provider||'openai'; document.getElementById('api-url').value=chat.url||providerConfigs[document.getElementById('api-provider').value].defaultBase; document.getElementById('chat-apikey').value=chat.apiKey||''; document.getElementById('chat-model').value=chat.model||''; document.getElementById('ctx-input').value=chat.context||'20'; updateCtx(document.getElementById('ctx-input').value); if(chat.temperature){ const range=document.querySelector('#chat-body input[type=range]'); range.value=chat.temperature; document.getElementById('temp-val').innerText=chat.temperature; } } const voice=await api.getVoiceConfig(); if(voice){ document.getElementById('voice-url').value=voice.url||voiceEndpointMap.official; document.getElementById('voice-apikey').value=voice.apiKey||''; document.getElementById('voice-group-id').value=voice.groupId||''; document.getElementById('voice-tts-model').value=voice.ttsModel||'speech-2.8-hd'; document.getElementById('voice-id').value=voice.voiceId||''; document.getElementById('voice-language').value=voice.language||'Chinese'; document.getElementById('voice-speed').value=voice.speed||'1.0'; document.getElementById('speed-val').innerText=(voice.speed||'1.0')+'x'; } }catch(error){ console.warn('Load API config failed',error); } }
function updateCtx(val){ const label=document.getElementById('ctx-val'); if(!val||val==0){ label.innerText='UNLIMITED'; label.style.color='#e53935'; } else { label.innerText=val+' TURNS'; label.style.color='#1a1a1a'; } }
document.addEventListener('click',function(e){ if(!e.target.closest('.input-wrap')) document.querySelectorAll('.custom-dropdown').forEach(el=>el.style.display='none'); }); document.addEventListener('DOMContentLoaded',loadApiConfig);

(function () {
  const route = "settings_api";
  const placeholderUrl = "../assets/初始占位图.png";
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
