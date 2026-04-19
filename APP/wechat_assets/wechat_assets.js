const ASSETS_ROUTE = "wechat_assets";
const ASSETS_STORAGE_KEY = "wechat.assets.page";
const ASSETS_DEFAULT_STATE = Object.freeze({
    totalAssets: "0.00",
    wechatBalance: "0.00",
    showBalance: true,
    linkedMaskId: "",
    linkedMaskName: "",
    updatedAt: 0,
    bills: []
});

const MINI_CHAT_PROVIDER_CONFIGS = {
    openai: { defaultBase: "https://api.openai.com/v1", basePath: "/v1", chatPath: "/chat/completions", auth: "bearer" },
    claude: { defaultBase: "https://api.anthropic.com/v1", basePath: "/v1", chatPath: "/messages", auth: "anthropic" },
    qwen: { defaultBase: "https://dashscope.aliyuncs.com/compatible-mode/v1", basePath: "/compatible-mode/v1", chatPath: "/chat/completions", auth: "bearer" },
    deepseek: { defaultBase: "https://api.deepseek.com", basePath: "", chatPath: "/chat/completions", auth: "bearer" },
    doubao: { defaultBase: "https://ark.cn-beijing.volces.com/api/v3", basePath: "/api/v3", chatPath: "/chat/completions", auth: "bearer" },
    kimi: { defaultBase: "https://api.moonshot.cn/v1", basePath: "/v1", chatPath: "/chat/completions", auth: "bearer" },
    llama: { defaultBase: "http://localhost:8000/v1", basePath: "/v1", chatPath: "/chat/completions", auth: "bearer" },
    newapi: { defaultBase: "https://your-newapi-host.example/v1", basePath: "/v1", chatPath: "/chat/completions", auth: "bearer" }
};

let assetsState = cloneAssetsState(ASSETS_DEFAULT_STATE);
let currentBillType = "expense";
let cachedUserMasks = [];
let estimateBusy = false;

function cloneAssetsState(source) {
    return {
        totalAssets: source.totalAssets,
        wechatBalance: source.wechatBalance,
        showBalance: source.showBalance,
        linkedMaskId: source.linkedMaskId || "",
        linkedMaskName: source.linkedMaskName || "",
        updatedAt: Number(source.updatedAt) || 0,
        bills: Array.isArray(source.bills) ? source.bills.map((bill) => ({ ...bill })) : []
    };
}

function getWechatOps() {
    return window.MiniDB && window.MiniDB.ops && window.MiniDB.ops.wechat
        ? window.MiniDB.ops.wechat
        : null;
}

function getMasksOps() {
    return window.MiniDB && window.MiniDB.ops && window.MiniDB.ops.masks
        ? window.MiniDB.ops.masks
        : null;
}

function getApiOps() {
    return window.MiniDB && window.MiniDB.ops && window.MiniDB.ops.api
        ? window.MiniDB.ops.api
        : null;
}

function notify(message, duration = 3200) {
    if (typeof window.showMiniNotice === "function") {
        window.showMiniNotice(message, duration);
        return;
    }
    if (typeof window.showToast === "function") {
        window.showToast(message, duration);
        return;
    }
    window.alert(message);
}

function normalizeMoney(value, fallback = "0.00") {
    const cleaned = String(value == null ? "" : value).replace(/[^\d.-]/g, "").trim();
    if (!cleaned) return fallback;
    const numericValue = Number(cleaned);
    return Number.isFinite(numericValue) ? numericValue.toFixed(2) : fallback;
}

function formatMoney(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return "0.00";
    return numericValue.toLocaleString("zh-CN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function maskMoney(showBalance, prefix = "") {
    return showBalance ? null : `${prefix}****`;
}

function escapeHtml(value) {
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function normalizeBill(rawBill, index = 0) {
    const bill = rawBill && typeof rawBill === "object" ? rawBill : {};
    return {
        id: String(bill.id || `bill_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`),
        title: String(bill.title || "未命名账单").trim() || "未命名账单",
        category: String(bill.category || "未分类").trim() || "未分类",
        timeLabel: String(bill.timeLabel || "刚刚").trim() || "刚刚",
        type: bill.type === "income" ? "income" : "expense",
        amount: normalizeMoney(bill.amount, "0.00")
    };
}

function normalizeAssetsState(rawState) {
    const state = rawState && typeof rawState === "object" ? rawState : {};
    const normalizedTotal = normalizeMoney(
        state.totalAssets != null ? state.totalAssets : state.wechatBalance,
        ASSETS_DEFAULT_STATE.totalAssets
    );

    return {
        totalAssets: normalizedTotal,
        wechatBalance: normalizedTotal,
        showBalance: state.showBalance !== false,
        linkedMaskId: state.linkedMaskId == null ? "" : String(state.linkedMaskId),
        linkedMaskName: String(state.linkedMaskName || "").trim(),
        updatedAt: Number(state.updatedAt) || 0,
        bills: Array.isArray(state.bills) ? state.bills.map(normalizeBill) : []
    };
}

async function readAssetsState() {
    const wechatOps = getWechatOps();
    if (!wechatOps || typeof wechatOps.getConfig !== "function") {
        return cloneAssetsState(ASSETS_DEFAULT_STATE);
    }

    try {
        const savedState = await wechatOps.getConfig(ASSETS_STORAGE_KEY);
        return normalizeAssetsState(savedState);
    } catch (error) {
        console.warn("Failed to read assets state", error);
        return cloneAssetsState(ASSETS_DEFAULT_STATE);
    }
}

async function persistAssetsState() {
    const wechatOps = getWechatOps();
    assetsState.wechatBalance = assetsState.totalAssets;
    assetsState.updatedAt = Date.now();

    if (wechatOps && typeof wechatOps.setConfig === "function") {
        try {
            await wechatOps.setConfig(ASSETS_STORAGE_KEY, cloneAssetsState(assetsState));
        } catch (error) {
            console.warn("Failed to persist assets state", error);
        }
    }

    renderAssetsPage();
}

function getDisplayedMoney(value, prefix = "") {
    const maskedValue = maskMoney(assetsState.showBalance, prefix);
    return maskedValue == null ? `${prefix}${formatMoney(value)}` : maskedValue;
}

function updateEyeIcon() {
    const eyeOutline = document.getElementById("eye-outline");
    const eyePupil = document.getElementById("eye-pupil");
    if (!eyeOutline || !eyePupil) return;

    if (assetsState.showBalance) {
        eyeOutline.setAttribute("d", "M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z");
        eyePupil.style.display = "block";
    } else {
        eyeOutline.setAttribute("d", "M2 2l20 20M10.58 10.58A2 2 0 0 0 10 12a2 2 0 0 0 3.42 1.42M9.88 5.09A9.77 9.77 0 0 1 12 5c7 0 11 7 11 7a18.75 18.75 0 0 1-3.04 3.81M6.23 6.23C3.6 8.06 2 12 2 12s4 7 10 7a9.7 9.7 0 0 0 4.18-.93");
        eyePupil.style.display = "none";
    }
}

function renderBillList() {
    const billList = document.getElementById("bill-list");
    if (!billList) return;

    if (!assetsState.bills.length) {
        billList.innerHTML = '<div class="empty-state">暂无账单记录，点击“新增”添加一条。</div>';
        return;
    }

    billList.innerHTML = assetsState.bills.map((bill) => {
        const isIncome = bill.type === "income";
        const amountPrefix = isIncome ? "+" : "-";
        const displayAmount = assetsState.showBalance
            ? `${amountPrefix}¥${formatMoney(bill.amount)}`
            : `${amountPrefix}¥****`;
        const badgePath = isIncome
            ? '<path d="M12 19V5"></path><path d="M6 11l6-6 6 6"></path>'
            : '<path d="M12 5v14"></path><path d="M18 13l-6 6-6-6"></path>';

        return `
            <div class="bill-item">
                <div class="bill-main">
                    <div class="bill-badge ${bill.type}">
                        <svg class="icon-svg" viewBox="0 0 24 24">${badgePath}</svg>
                    </div>
                    <div class="bill-copy">
                        <div class="bill-topline">
                            <div class="bill-title">${escapeHtml(bill.title)}</div>
                            <span class="bill-tag">${isIncome ? "收入" : "支出"}</span>
                        </div>
                        <div class="bill-meta">${escapeHtml(bill.category)} · ${escapeHtml(bill.timeLabel)}</div>
                    </div>
                </div>
                <div class="bill-side">
                    <div class="bill-amount ${bill.type}">${displayAmount}</div>
                    <button class="bill-delete" type="button" data-action="delete-bill" data-bill-id="${escapeHtml(bill.id)}">删除</button>
                </div>
            </div>
        `;
    }).join("");
}

function renderAssetsPage() {
    const totalAssets = document.getElementById("total-assets");
    if (totalAssets) totalAssets.textContent = getDisplayedMoney(assetsState.totalAssets);

    updateEyeIcon();
    renderBillList();
}

function setModalVisibility(modalId, visible) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.hidden = !visible;
}

function closeEstimateModal() {
    setModalVisibility("estimate-modal", false);
    setEstimateStatus("");
}

async function openEstimateModal() {
    await loadUserMasks();
    renderMaskOptions();
    setEstimateStatus("");
    setModalVisibility("estimate-modal", true);
}

function openBillModal() {
    const titleInput = document.getElementById("bill-title-input");
    const categoryInput = document.getElementById("bill-category-input");
    const timeInput = document.getElementById("bill-time-input");
    const amountInput = document.getElementById("bill-amount-input");

    if (titleInput) titleInput.value = "";
    if (categoryInput) categoryInput.value = "";
    if (timeInput) timeInput.value = "";
    if (amountInput) amountInput.value = "";

    currentBillType = "expense";
    updateBillTypeButtons();
    setModalVisibility("bill-modal", true);
}

function closeBillModal() {
    setModalVisibility("bill-modal", false);
}

function updateBillTypeButtons() {
    document.querySelectorAll("#bill-type-toggle .type-toggle-btn").forEach((button) => {
        button.classList.toggle("active", button.dataset.type === currentBillType);
    });
}

async function handleBillSubmit(event) {
    event.preventDefault();
    const titleInput = document.getElementById("bill-title-input");
    const categoryInput = document.getElementById("bill-category-input");
    const timeInput = document.getElementById("bill-time-input");
    const amountInput = document.getElementById("bill-amount-input");

    const nextBill = normalizeBill({
        id: `bill_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: titleInput && titleInput.value,
        category: categoryInput && categoryInput.value,
        timeLabel: (timeInput && timeInput.value) || "刚刚",
        type: currentBillType,
        amount: amountInput && amountInput.value
    });

    assetsState.bills.unshift(nextBill);
    closeBillModal();
    await persistAssetsState();
}

async function deleteBillById(billId) {
    assetsState.bills = assetsState.bills.filter((bill) => bill.id !== billId);
    await persistAssetsState();
}

async function loadUserMasks() {
    const masksOps = getMasksOps();
    if (masksOps && typeof masksOps.listByType === "function") {
        try {
            cachedUserMasks = (await masksOps.listByType("USER")) || [];
            return;
        } catch (error) {
            console.warn("Failed to load user masks", error);
        }
    }

    const db = window.MiniDB && window.MiniDB.databases ? window.MiniDB.databases.masks : null;
    if (db && db.masks && typeof db.masks.where === "function") {
        try {
            cachedUserMasks = (await db.masks.where("type").equals("USER").toArray()) || [];
            return;
        } catch (error) {
            console.warn("Failed to read user masks from database", error);
        }
    }

    cachedUserMasks = [];
}

function findMaskById(maskId) {
    const normalizedId = String(maskId == null ? "" : maskId);
    return cachedUserMasks.find((mask) => String(mask && mask.id) === normalizedId) || null;
}

function getSelectedMask() {
    const select = document.getElementById("asset-mask-select");
    if (!select) return null;
    return findMaskById(select.value);
}

function renderMaskPreview(mask) {
    const preview = document.getElementById("asset-mask-preview");
    if (!preview) return;

    if (!mask) {
        preview.innerHTML = '<div class="mask-empty">NO USER MASK PRESET FOUND. OPEN MASKS TO CREATE OR IMPORT ONE FIRST.</div>';
        return;
    }

    const nickname = String(mask.nickname || mask.name || `Mask ${mask.id}`).trim();
    const account = String(mask.account || "").trim();
    const signature = String(mask.signature || "").trim();
    const lore = String(mask.lore || "").trim();

    preview.innerHTML = `
        <div class="mask-preview-card">
            <div class="mask-preview-row">
                <span class="mask-preview-key">NICKNAME</span>
                <span class="mask-preview-value">${escapeHtml(nickname)}</span>
            </div>
            <div class="mask-preview-row">
                <span class="mask-preview-key">ACCOUNT</span>
                <span class="mask-preview-value">${escapeHtml(account || "NOT SET")}</span>
            </div>
            <div class="mask-preview-row">
                <span class="mask-preview-key">SIGN</span>
                <span class="mask-preview-value">${escapeHtml(signature || "NOT SET")}</span>
            </div>
            <div class="mask-preview-block">${escapeHtml(lore || "NO EXTRA LORE PROVIDED. THE SYSTEM WILL USE A SAFE, ORDINARY USER ESTIMATE.")}</div>
        </div>
    `;
}

function renderMaskOptions() {
    const select = document.getElementById("asset-mask-select");
    const generateButton = document.getElementById("generate-assets-button");
    if (!select || !generateButton) return;

    const masks = Array.isArray(cachedUserMasks) ? cachedUserMasks.slice() : [];
    if (!masks.length) {
        select.innerHTML = '<option value="">NO USER MASK PRESET</option>';
        select.disabled = true;
        generateButton.disabled = true;
        renderMaskPreview(null);
        return;
    }

    select.disabled = false;
    select.innerHTML = masks.map((mask) => {
        const label = String(mask.nickname || mask.name || `Mask ${mask.id}`).trim();
        return `<option value="${escapeHtml(String(mask.id))}">${escapeHtml(label)}</option>`;
    }).join("");

    const preferredMask = findMaskById(assetsState.linkedMaskId) || masks[0];
    if (preferredMask) select.value = String(preferredMask.id);

    generateButton.disabled = false;
    renderMaskPreview(getSelectedMask());
}

function setEstimateStatus(message, tone = "") {
    const status = document.getElementById("estimate-status");
    if (!status) return;
    status.textContent = message || "";
    status.className = tone ? `sheet-status ${tone}` : "sheet-status";
}

function setEstimateBusy(nextBusy) {
    estimateBusy = !!nextBusy;
    const generateButton = document.getElementById("generate-assets-button");
    const select = document.getElementById("asset-mask-select");
    if (generateButton) {
        generateButton.disabled = nextBusy || !cachedUserMasks.length;
        generateButton.textContent = nextBusy ? "GENERATING..." : "GENERATE";
    }
    if (select) select.disabled = nextBusy || !cachedUserMasks.length;
}

function getMiniChatProviderConfig(provider) {
    const key = String(provider || "").trim();
    return MINI_CHAT_PROVIDER_CONFIGS[key] || MINI_CHAT_PROVIDER_CONFIGS.openai;
}

function cleanMiniChatPathValue(path) {
    return String(path || "").replace(/\/+$/, "");
}

function normalizeMiniChatBaseUrl(rawUrl, cfg) {
    const fallback = cfg && cfg.defaultBase ? cfg.defaultBase : MINI_CHAT_PROVIDER_CONFIGS.openai.defaultBase;
    const value = String(rawUrl || fallback).trim();
    if (!value) throw new Error("PLEASE SET THE CHAT API URL IN SETTINGS");

    let parsed;
    try {
        parsed = new URL(value);
    } catch (error) {
        throw new Error(`CHAT API URL IS INVALID: ${value}`);
    }

    let path = cleanMiniChatPathValue(parsed.pathname);
    const knownPaths = [
        "/chat/completions",
        "/messages",
        "/models",
        "/v1/chat/completions",
        "/v1/messages",
        "/v1/models",
        "/api/v3/chat/completions",
        "/api/v3/models",
        "/compatible-mode/v1/chat/completions",
        "/compatible-mode/v1/models"
    ];

    knownPaths.forEach((known) => {
        if (path.endsWith(known)) path = cleanMiniChatPathValue(path.slice(0, -known.length));
    });

    if (cfg && cfg.basePath && !path.endsWith(cfg.basePath)) {
        path = cleanMiniChatPathValue(`${path}${cfg.basePath}`);
    }

    parsed.pathname = path || "/";
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
}

function buildMiniChatEndpoint(rawUrl, cfg, endpointPath) {
    return `${normalizeMiniChatBaseUrl(rawUrl, cfg).replace(/\/$/, "")}${endpointPath}`;
}

function buildMiniChatHeaders(cfg, apiKey) {
    const key = String(apiKey || "").trim();
    if (!key) throw new Error("PLEASE SET THE CHAT API KEY IN SETTINGS");

    if (cfg && cfg.auth === "anthropic") {
        return {
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true"
        };
    }

    return { Authorization: `Bearer ${key}` };
}

function extractMiniChatError(data) {
    if (!data) return "";
    if (typeof data === "string") return data;
    if (data.error) {
        if (typeof data.error === "string") return data.error;
        return [data.error.type, data.error.code, data.error.message].filter(Boolean).join(" / ");
    }
    if (Array.isArray(data.content) && data.content[0] && data.content[0].text) return data.content[0].text;
    return data.message || data.msg || "";
}

async function requestAssetsEstimateCompletion(config, systemPrompt, userPrompt) {
    if (!config || !config.apiKey) throw new Error("PLEASE SET THE CHAT API KEY IN SETTINGS");
    if (!config.model) throw new Error("PLEASE SET THE CHAT MODEL IN SETTINGS");

    const cfg = getMiniChatProviderConfig(config.provider);
    const endpoint = buildMiniChatEndpoint(config.url, cfg, cfg.chatPath || "/chat/completions");
    const temperature = Number.parseFloat(config.temperature);
    const safeTemperature = Number.isFinite(temperature) ? Math.min(Math.max(temperature, 0), 0.8) : 0.4;
    const headers = {
        ...buildMiniChatHeaders(cfg, config.apiKey),
        "Content-Type": "application/json"
    };

    const timeoutMs = 30000;
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const signal = controller ? controller.signal : undefined;
    const timeoutId = controller ? window.setTimeout(() => controller.abort(), timeoutMs) : 0;
    let response;

    try {
        if (cfg.auth === "anthropic") {
            response = await fetch(endpoint, {
                method: "POST",
                headers,
                signal,
                body: JSON.stringify({
                    model: config.model,
                    system: systemPrompt,
                    messages: [{ role: "user", content: userPrompt }],
                    max_tokens: 260,
                    temperature: safeTemperature
                })
            });
        } else {
            response = await fetch(endpoint, {
                method: "POST",
                headers,
                signal,
                body: JSON.stringify({
                    model: config.model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    temperature: safeTemperature,
                    stream: false
                })
            });
        }
    } catch (error) {
        if (error && error.name === "AbortError") {
            throw new Error(`ESTIMATE REQUEST TIMED OUT (${Math.round(timeoutMs / 1000)}S)`);
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

    if (cfg.auth === "anthropic") {
        const blocks = data && Array.isArray(data.content) ? data.content : [];
        const text = blocks
            .filter((block) => block && block.type === "text" && typeof block.text === "string")
            .map((block) => block.text)
            .join("\n")
            .trim();
        if (!text) throw new Error("CLAUDE RESPONSE IS EMPTY");
        return text;
    }

    const content = data && data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : "";

    if (typeof content === "string" && content.trim()) return content;

    if (Array.isArray(content)) {
        const text = content
            .map((part) => {
                if (!part) return "";
                if (typeof part === "string") return part;
                if (part.type === "text") return part.text || "";
                return "";
            })
            .join("\n")
            .trim();
        if (text) return text;
    }

    throw new Error("CHAT RESPONSE IS EMPTY");
}

function buildEstimatePrompts(mask) {
    const systemPrompt = [
        "你是一名金融评估员。",
        "你的任务是根据一个人的面具预设信息，估算他或她在“微信支付”场景下的可用余额。",
        "这里的“总资产”仅指微信支付或零钱中可直接看到的余额，不是现实中的全部资产。",
        "估值必须克制、现实、偏保守，不要夸张，不要轻易给出离谱高额。",
        "如果信息不足，就按普通个人用户给出中性偏保守估算。",
        "请综合身份气质、生活阶段、消费习惯、人设背景来判断。",
        "金额使用人民币，保留两位小数。",
        "你必须只返回 JSON，不要代码块，不要解释，不要额外文本。",
        'JSON 格式固定为：{"amount":"1234.56","summary":"不超过30字的简短理由"}'
    ].join("\n");

    const userPrompt = [
        "请根据以下面具预设，估算该人物当前微信支付余额：",
        JSON.stringify({
            nickname: String(mask.nickname || "").trim(),
            name: String(mask.name || "").trim(),
            gender: String(mask.gender || "").trim(),
            account: String(mask.account || "").trim(),
            signature: String(mask.signature || "").trim(),
            lore: String(mask.lore || "").trim().slice(0, 800)
        }, null, 2)
    ].join("\n");

    return { systemPrompt, userPrompt };
}

function extractJsonCandidate(text) {
    const raw = String(text || "").trim();
    const withoutFence = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");
    if (start !== -1 && end > start) return withoutFence.slice(start, end + 1);
    return withoutFence;
}

function parseAssetsEstimateResponse(text) {
    const candidate = extractJsonCandidate(text);
    let parsed = null;

    try {
        parsed = JSON.parse(candidate);
    } catch (error) {}

    let amount = parsed && parsed.amount != null ? parsed.amount : null;
    if (amount == null) {
        const match = candidate.match(/-?\d[\d,]*(?:\.\d{1,2})?/);
        if (match) amount = match[0];
    }

    const normalizedAmount = normalizeMoney(amount, "");
    if (!normalizedAmount) throw new Error("MODEL DID NOT RETURN A VALID AMOUNT");

    return {
        amount: normalizedAmount,
        summary: parsed && parsed.summary != null ? String(parsed.summary).trim() : ""
    };
}

async function generateAssetsEstimate() {
    if (estimateBusy) return;

    const mask = getSelectedMask();
    if (!mask) {
        notify("SELECT A MASK PRESET");
        return;
    }

    const apiOps = getApiOps();
    if (!apiOps || typeof apiOps.getChatConfig !== "function") {
        notify("CHAT CONFIG NOT READY");
        return;
    }

    setEstimateBusy(true);
    setEstimateStatus("ESTIMATING WECHAT PAY BALANCE FROM MASK PRESET...", "is-pending");

    try {
        const chatConfig = await apiOps.getChatConfig();
        const { systemPrompt, userPrompt } = buildEstimatePrompts(mask);
        const responseText = await requestAssetsEstimateCompletion(chatConfig || {}, systemPrompt, userPrompt);
        const result = parseAssetsEstimateResponse(responseText);

        assetsState.totalAssets = result.amount;
        assetsState.wechatBalance = result.amount;
        assetsState.linkedMaskId = String(mask.id);
        assetsState.linkedMaskName = String(mask.nickname || mask.name || `Mask ${mask.id}`).trim();

        await persistAssetsState();
        closeEstimateModal();

        const note = result.summary ? ` · ${result.summary}` : "";
        notify(`WECHAT PAY BALANCE UPDATED TO ¥${formatMoney(result.amount)}${note}`, 4200);
    } catch (error) {
        const message = error && error.message ? error.message : String(error || "未知错误");
        setEstimateStatus(message, "is-error");
        notify(`GENERATE FAILED: ${message}`, 4200);
    } finally {
        setEstimateBusy(false);
    }
}

function openMasksRoute() {
    const shell = window.parent && window.parent.__miniShell;
    if (shell && typeof shell.open === "function") {
        shell.open("wechat_masks", ASSETS_ROUTE);
        return;
    }
    window.location.href = "../wechat_masks/wechat_masks.html";
}

function installAssetsBindings() {
    const toggleBalanceButton = document.getElementById("toggle-balance");
    const openEstimateButton = document.getElementById("open-estimate-modal");
    const cancelEstimateButton = document.getElementById("cancel-estimate-modal");
    const openMasksButton = document.getElementById("open-masks-route");
    const generateAssetsButton = document.getElementById("generate-assets-button");
    const maskSelect = document.getElementById("asset-mask-select");
    const openBillButton = document.getElementById("open-bill-modal");
    const billForm = document.getElementById("bill-form");
    const billList = document.getElementById("bill-list");

    if (toggleBalanceButton) {
        toggleBalanceButton.addEventListener("click", async () => {
            assetsState.showBalance = !assetsState.showBalance;
            await persistAssetsState();
        });
    }

    if (openEstimateButton) openEstimateButton.addEventListener("click", openEstimateModal);
    if (cancelEstimateButton) cancelEstimateButton.addEventListener("click", closeEstimateModal);
    if (openMasksButton) openMasksButton.addEventListener("click", openMasksRoute);
    if (generateAssetsButton) generateAssetsButton.addEventListener("click", generateAssetsEstimate);
    if (maskSelect) {
        maskSelect.addEventListener("change", () => {
            renderMaskPreview(getSelectedMask());
            setEstimateStatus("");
        });
    }

    if (openBillButton) openBillButton.addEventListener("click", openBillModal);
    if (billForm) billForm.addEventListener("submit", handleBillSubmit);

    const cancelBillButton = document.getElementById("cancel-bill-modal");
    if (cancelBillButton) cancelBillButton.addEventListener("click", closeBillModal);

    document.querySelectorAll(".sheet-overlay").forEach((overlay) => {
        overlay.addEventListener("click", () => {
            overlay.hidden = true;
            setEstimateStatus("");
        });
    });

    document.querySelectorAll("#bill-type-toggle .type-toggle-btn").forEach((button) => {
        button.addEventListener("click", () => {
            currentBillType = button.dataset.type === "income" ? "income" : "expense";
            updateBillTypeButtons();
        });
    });

    if (billList) {
        billList.addEventListener("click", (event) => {
            const deleteButton = event.target.closest("[data-action='delete-bill']");
            if (!deleteButton) return;
            const billId = deleteButton.getAttribute("data-bill-id");
            if (!billId) return;
            deleteBillById(billId);
        });
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    assetsState = await readAssetsState();
    installAssetsBindings();
    renderAssetsPage();
});

(function () {
    const shell = window.parent && window.parent.__miniShell;

    function goBack() {
        if (shell && typeof shell.back === "function") shell.back(ASSETS_ROUTE);
    }

    function patchHistoryBack() {
        try {
            if (window.history) window.history.back = goBack;
            if (window.History && window.History.prototype) window.History.prototype.back = goBack;
        } catch (error) {}
    }

    function bindBack(selector) {
        document.querySelectorAll(selector).forEach((element) => {
            if (element.dataset.assetsBackBound === "1") return;
            element.dataset.assetsBackBound = "1";
            element.style.cursor = "pointer";
            element.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();
                goBack();
            }, true);
        });
    }

    function initRouteBridge() {
        patchHistoryBack();
        bindBack(".nav-left");
        bindBack(".nav-title");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initRouteBridge, { once: true });
    } else {
        initRouteBridge();
    }
})();
