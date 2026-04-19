function returnToDesktop() {
    console.log('Return to Desktop');
}

const anniversaryDb = window.MiniDB.databases.anniversary;
const contactsDb = window.MiniDB.databases.contacts;
const masksDb = window.MiniDB.databases.masks;
const anniversaryOps = window.MiniDB.ops.anniversary;
const contactsOps = window.MiniDB.ops.contacts;

const ANNIVERSARY_THOUGHT_KIND = 'anniversary_thought';
const GENERATED_EVENT_SOURCE = 'ta_contact_refresh';

let currentView = 'me';
let currentTaPage = 'overview';
let selectedTaContactId = null;
let currentEditId = null;
let currentEditRecord = null;
let cachedTaContacts = [];
let cachedTaThoughtEntry = null;
let isRefreshingTaContact = false;

function normalizeText(value) {
    return String(value == null ? '' : value)
        .replace(/\r/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeIdentity(value) {
    const text = normalizeText(value).toUpperCase();
    if (text === 'ME') return 'ME';
    if (text === 'NPC') return 'NPC';
    return 'CHAR';
}

function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function sliceChars(value, maxLength) {
    const chars = Array.from(normalizeText(value));
    return chars.length > maxLength ? `${chars.slice(0, maxLength).join('')}...` : chars.join('');
}

function hashString(value) {
    let hash = 2166136261;
    const text = String(value == null ? '' : value);
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function createSeededRandom(seed) {
    let state = (Number(seed) >>> 0) || 1;
    return function nextRandom() {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

function pickRandom(list, random) {
    if (!Array.isArray(list) || !list.length) return '';
    return list[Math.floor(random() * list.length)] || list[0] || '';
}

function shuffleWithRandom(list, random) {
    const next = Array.isArray(list) ? list.slice() : [];
    for (let index = next.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    }
    return next;
}

function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function formatDateInput(value) {
    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return formatDateInput(new Date());
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getTodayInputValue() {
    return formatDateInput(new Date());
}

function shiftDateByDays(baseDate, deltaDays) {
    const next = new Date(baseDate);
    next.setHours(0, 0, 0, 0);
    next.setDate(next.getDate() + Number(deltaDays || 0));
    return formatDateInput(next);
}

function formatDateTimeLabel(timestamp) {
    const date = new Date(Number(timestamp) || Date.now());
    if (Number.isNaN(date.getTime())) return '刚刚生成';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}.${day} ${hours}:${minutes}`;
}

function buildContactGlobalId(contact) {
    if (!contact || contact.id == null) return '';
    return `${normalizeText(contact.type || 'CHAR')}_${contact.id}`;
}

function parseGlobalId(value) {
    const raw = normalizeText(value);
    const splitIndex = raw.indexOf('_');
    if (splitIndex < 0) return { type: '', id: raw };
    return {
        type: raw.slice(0, splitIndex),
        id: raw.slice(splitIndex + 1)
    };
}

function normalizeRelationLabel(value) {
    const raw = normalizeText(value);
    const labelMap = {
        Family: '家人',
        Partner: '恋人',
        Friend: '朋友',
        Colleague: '同事',
        家人: '家人',
        恋人: '恋人',
        朋友: '朋友',
        同事: '同事'
    };
    return labelMap[raw] || raw;
}

function resolveRelationTone(relationLabel) {
    const text = normalizeRelationLabel(relationLabel);
    if (text === '恋人') {
        return {
            label: '恋人',
            scenes: ['深夜散步', '晚安通话', '约会返程', '共享耳机'],
            rituals: ['晚安', '等你回消息', '对视停顿', '并肩靠近'],
            futurePlans: ['去看海', '过下一次纪念日', '看一场夜场电影', '去想去的城市'],
            moods: ['心动', '偏爱', '想念', '靠近']
        };
    }
    if (text === '家人') {
        return {
            label: '家人',
            scenes: ['晚餐时间', '节日归家', '回家路上', '报平安之后'],
            rituals: ['等你回家', '提醒吃饭', '节日问候', '替你记住小事'],
            futurePlans: ['一起吃顿饭', '回家过节', '拍一张合照', '认真聊一次近况'],
            moods: ['安心', '牵挂', '熟悉', '温热']
        };
    }
    if (text === '同事') {
        return {
            label: '同事',
            scenes: ['午休咖啡', '项目收尾', '并肩加班', '通勤路上'],
            rituals: ['帮你收尾', '默认配合', '留一份备份', '互相提醒'],
            futurePlans: ['一起提案', '早点下班', '吃顿庆功饭', '完成下一轮合作'],
            moods: ['信任', '默契', '松弛', '稳定']
        };
    }
    if (text === '朋友') {
        return {
            label: '朋友',
            scenes: ['夜聊以后', '临时见面', '并肩发呆', '一起回去的路上'],
            rituals: ['分享日常', '互相救场', '顺手带点东西', '嘴硬关心'],
            futurePlans: ['一起散步', '去吃想吃的店', '补上那次见面', '把计划真的落地'],
            moods: ['自在', '默契', '松弛', '偏袒']
        };
    }
    return {
        label: text || '羁绊',
        scenes: ['聊天之后', '见面以后', '一起停下来的那刻', '各自安静的时候'],
        rituals: ['记住你的偏好', '等一句回应', '把话慢慢说开', '留下专属暗号'],
        futurePlans: ['再见一面', '把话说完', '一起走走', '完成一个约定'],
        moods: ['在意', '期待', '靠近', '认真']
    };
}

function extractKeywordCandidates(...values) {
    const generic = new Set(['unknown', 'memory', 'target', 'birthday', 'char', 'npc', 'user', 'mini']);
    const output = [];

    values.forEach((value) => {
        const source = normalizeText(value);
        if (!source) return;
        source
            .split(/[\s,，。.!！？、；;:：|/]+/)
            .map((part) => part.trim())
            .filter(Boolean)
            .forEach((part) => {
                const matches = part.match(/[\u4e00-\u9fff]{2,8}|[A-Za-z][A-Za-z'-]{2,14}/g) || [];
                matches.forEach((match) => {
                    const token = match.replace(/['-]/g, '').trim();
                    const lower = token.toLowerCase();
                    if (!token || generic.has(lower)) return;
                    output.push(/[A-Za-z]/.test(token) ? token.slice(0, 10) : token.slice(0, 6));
                });
            });
    });

    return [...new Set(output)];
}

function compactKeyword(value, fallback) {
    const text = normalizeText(value || fallback);
    if (!text) return normalizeText(fallback);
    return /[A-Za-z]/.test(text) ? text.slice(0, 10) : text.slice(0, 6);
}

function isTaContact(contact) {
    return !!contact && (contact.type === 'CHAR' || contact.type === 'NPC');
}

function getContactDisplayName(contact) {
    return normalizeText(contact && (contact.nickname || contact.name)) || 'Unknown';
}

function matchesContactName(contact, name) {
    const target = normalizeText(name).toLowerCase();
    if (!target || !contact) return false;
    return [contact.nickname, contact.name].some((value) => normalizeText(value).toLowerCase() === target);
}

function findContactById(contactId, contacts = cachedTaContacts) {
    const key = String(contactId == null ? '' : contactId).trim();
    if (!key) return null;
    return contacts.find((contact) => String(contact && contact.id) === key) || null;
}

function findContactByName(name, contacts = cachedTaContacts, preferredType = '') {
    const target = normalizeText(name).toLowerCase();
    if (!target) return null;

    const matches = contacts.filter((contact) => matchesContactName(contact, target));
    if (!matches.length) return null;

    const preferred = normalizeIdentity(preferredType);
    return matches.find((contact) => contact.type === preferred) || matches[0];
}

function getSelectedTaContact(contacts = cachedTaContacts) {
    return findContactById(selectedTaContactId, contacts);
}

function getRelatedContactSelect() {
    return document.getElementById('ev-related-contact');
}

function getSelectedRelatedContact(contacts = cachedTaContacts) {
    const select = getRelatedContactSelect();
    return select ? findContactById(select.value, contacts) : null;
}

function setRelatedContactSelection(contactId = '') {
    const select = getRelatedContactSelect();
    if (!select) return;
    select.value = contactId == null ? '' : String(contactId);
}

function isTaDetailVisible() {
    return currentView === 'ta' && currentTaPage === 'detail' && !!getSelectedTaContact();
}

function syncPrimaryActionVisibility() {
    const addButton = document.querySelector('.dock-add-btn');
    if (!addButton) return;
    const shouldHide = currentView === 'ta' && currentTaPage === 'overview';
    addButton.classList.toggle('is-hidden', shouldHide);
}

function updateRefreshButtonState() {
    const button = document.getElementById('ta-refresh-fab');
    if (!button) return;
    button.classList.toggle('is-loading', isRefreshingTaContact);
    button.disabled = !isTaDetailVisible() || isRefreshingTaContact;
}

function getCountTabButton(value) {
    const group = document.querySelectorAll('.tab-group')[0];
    if (!group) return null;
    return value === 'Down' ? group.children[1] : group.children[0];
}

function getIdentityTabButton(value) {
    const group = document.querySelectorAll('.tab-group')[1];
    if (!group) return null;
    const normalized = normalizeIdentity(value);
    if (normalized === 'ME') return group.children[0];
    if (normalized === 'NPC') return group.children[2];
    return group.children[1];
}

function setCountMethod(value) {
    const button = getCountTabButton(value);
    if (button) setTab('ev-count', value === 'Down' ? 'Down' : 'Up', button);
}

function setIdentity(value) {
    const normalized = normalizeIdentity(value);
    const button = getIdentityTabButton(normalized);
    if (button) setTab('ev-identity', normalized, button);
    toggleCharInput(normalized !== 'ME');
}

async function loadTaContacts() {
    const contacts = await contactsDb.contacts.toArray();
    return contacts
        .filter(isTaContact)
        .sort((left, right) => getContactDisplayName(left).localeCompare(getContactDisplayName(right), 'zh-CN'));
}

async function loadUserMasks() {
    if (!masksDb || !masksDb.masks || typeof masksDb.masks.where !== 'function') return [];
    try {
        return await masksDb.masks.where('type').equals('USER').toArray();
    } catch (error) {
        console.warn('Failed to load user masks', error);
        return [];
    }
}

function resolveEventContact(event, contacts = cachedTaContacts) {
    if (!event) return null;
    const identity = normalizeIdentity(event.identity);
    if (identity === 'ME') {
        return findContactById(event.targetContactId, contacts);
    }
    const linkedById = findContactById(event.targetContactId, contacts);
    if (linkedById) return linkedById;
    return findContactByName(event.targetChar, contacts, event.targetContactType || event.identity);
}

function getEventIdentityLabel(event, contact = null) {
    const resolvedContact = contact || resolveEventContact(event);
    const identity = normalizeIdentity(event && event.identity);
    if (identity === 'ME') {
        return resolvedContact ? `ME + ${getContactDisplayName(resolvedContact)}` : 'ME';
    }
    const name = resolvedContact ? getContactDisplayName(resolvedContact) : normalizeText(event.targetChar);
    return name ? `${identity}: ${name}` : identity;
}

function getEventScopeKeys(event, contacts = cachedTaContacts) {
    const identity = normalizeIdentity(event && event.identity);
    const scopeKeys = [];
    if (identity === 'ME') scopeKeys.push('ME');

    const linkedContact = resolveEventContact(event, contacts);
    if (linkedContact) {
        scopeKeys.push(`CONTACT:${linkedContact.id}`);
        return [...new Set(scopeKeys)];
    }

    const fallbackName = normalizeText(event && event.targetChar).toLowerCase();
    if (identity !== 'ME') {
        scopeKeys.push(fallbackName ? `${identity}:${fallbackName}` : `${identity}:__unassigned__`);
    }
    return [...new Set(scopeKeys)];
}

function isEventVisibleInMeView(event, contacts = cachedTaContacts) {
    return getEventScopeKeys(event, contacts).includes('ME');
}

function isEventVisibleInTaView(event, contact, contacts = cachedTaContacts) {
    if (!contact) return false;
    return getEventScopeKeys(event, contacts).includes(`CONTACT:${contact.id}`);
}

function sortEvents(events) {
    return (events || []).slice().sort((left, right) => {
        if (!!left.isPinned !== !!right.isPinned) return left.isPinned ? -1 : 1;
        const leftScore = Number(left.updatedAt || left.createdAt || left.id) || 0;
        const rightScore = Number(right.updatedAt || right.createdAt || right.id) || 0;
        return rightScore - leftScore;
    });
}

async function syncEventsWithContacts(events, contacts) {
    const updates = [];

    (events || []).forEach((event) => {
        if (!event || event.id == null) return;

        const linkedContact = resolveEventContact(event, contacts);
        if (!linkedContact) return;

        const displayName = getContactDisplayName(linkedContact);
        const changes = {};

        if (normalizeIdentity(event.identity) !== 'ME' && normalizeIdentity(event.identity) !== linkedContact.type) {
            changes.identity = linkedContact.type;
        }
        if (normalizeText(event.targetChar) !== displayName) changes.targetChar = displayName;
        if (String(event.targetContactId == null ? '' : event.targetContactId) !== String(linkedContact.id)) {
            changes.targetContactId = linkedContact.id;
        }
        if (normalizeText(event.targetContactType) !== linkedContact.type) {
            changes.targetContactType = linkedContact.type;
        }

        if (Object.keys(changes).length) updates.push({ id: event.id, changes });
    });

    if (!updates.length) return events;

    await Promise.all(updates.map((item) => anniversaryDb.events.update(item.id, item.changes)));
    return anniversaryDb.events.toArray();
}

function renderRelatedContactOptions(contacts = cachedTaContacts) {
    const select = getRelatedContactSelect();
    if (!select) return;

    const currentValue = String(select.value || '').trim();
    const options = ['<option value="">No linked contact</option>'];
    contacts.forEach((contact) => {
        options.push(
            `<option value="${Number(contact.id)}">${escapeHtml(getContactDisplayName(contact))} / ${escapeHtml(contact.type)}</option>`
        );
    });
    select.innerHTML = options.join('');

    if (findContactById(currentValue, contacts)) {
        select.value = currentValue;
    } else {
        select.value = '';
    }
}

function renderTaSelector(contacts = cachedTaContacts) {
    const selector = document.getElementById('char-selector');
    if (!selector) return;

    selector.innerHTML = '';
    if (!contacts.length) {
        selectedTaContactId = null;
        selector.innerHTML = '<div class="ta-grid-empty">还没有联系人，请先在通讯录里创建 TA。</div>';
        return;
    }

    if (!getSelectedTaContact(contacts)) {
        selectedTaContactId = contacts[0].id;
    }

    const fragments = contacts.map((contact) => {
        const isActive = String(contact.id) === String(selectedTaContactId) ? 'active' : '';
        const avatarStyle = contact.avatar
            ? `style="background-image: url('${contact.avatar}');"`
            : 'style="background-color: #d8e0e8;"';

        return `
            <button class="char-item ${isActive}" type="button" onclick="openTaContactDetail(${Number(contact.id)})">
                <div class="char-avatar" ${avatarStyle}></div>
                <div class="char-name">${escapeHtml(getContactDisplayName(contact))}</div>
            </button>
        `;
    });

    selector.innerHTML = fragments.join('');
}

function renderTaViewState(showDetail) {
    const overview = document.getElementById('ta-overview');
    const detail = document.getElementById('ta-detail-panel');
    if (overview) overview.classList.toggle('hidden', !!showDetail);
    if (detail) detail.classList.toggle('active', !!showDetail);
    syncPrimaryActionVisibility();
    updateRefreshButtonState();
}

function renderTaDetailHero(contact) {
    const headerName = document.getElementById('ta-detail-header-name');
    const name = document.getElementById('ta-detail-name');
    const meta = document.getElementById('ta-detail-meta');
    const avatar = document.getElementById('ta-detail-avatar');

    if (!contact) {
        if (headerName) headerName.textContent = 'Contact';
        if (name) name.textContent = '未选择联系人';
        if (meta) meta.textContent = '点击右上角魔棒按双方设定生成 4-6 条纪念日。';
        if (avatar) {
            avatar.style.backgroundImage = '';
            avatar.style.backgroundColor = '#d8e0e8';
        }
        return;
    }

    if (headerName) headerName.textContent = getContactDisplayName(contact);
    if (name) name.textContent = getContactDisplayName(contact);
    if (meta) meta.textContent = `这里只展示 ${getContactDisplayName(contact)} 的纪念日，心声会内嵌在下方每条卡片里。`;
    if (avatar) {
        avatar.style.backgroundImage = contact.avatar ? `url('${contact.avatar}')` : '';
        avatar.style.backgroundColor = contact.avatar ? 'transparent' : '#d8e0e8';
    }
}

function renderThoughtTags(tags = [], targetId = 'ta-thought-tags') {
    const wrap = document.getElementById(targetId);
    if (!wrap) return;
    const cleanTags = tags.map((value) => normalizeText(value)).filter(Boolean).slice(0, 3);
    wrap.innerHTML = cleanTags.map((tag) => `<span class="ta-thought-tag">${escapeHtml(tag)}</span>`).join('');
}

function collectTaThoughtTags(contact, thoughtEntry) {
    const thought = thoughtEntry && thoughtEntry.thought ? thoughtEntry.thought : null;
    const source = thought
        ? [thought.mbti, thought.trait || thought.mood, thought.specialTag || thought.focus]
        : [contact && contact.type, '待生成'];
    return source.map((value) => normalizeText(value)).filter(Boolean).slice(0, 3);
}

function buildTaInlineThoughtHtml(contact, thoughtEntry, options = {}) {
    if (!contact) return '';

    const thought = thoughtEntry && thoughtEntry.thought ? thoughtEntry.thought : null;
    const timeLabel = thought ? formatDateTimeLabel(thoughtEntry.updatedAt || thoughtEntry.createdAt) : '待生成';
    const previewSource = thought
        ? (thought.summary || thought.content || '')
        : `还没有为 ${getContactDisplayName(contact)} 生成心声，点击右上角魔棒生成。`;
    const previewText = thought
        ? sliceChars(previewSource, options.isHero ? 100 : 72)
        : previewSource;
    const tags = collectTaThoughtTags(contact, thoughtEntry);
    const tagsHtml = tags.length
        ? `<div class="ta-inline-thought-tags">${tags
            .map((tag) => `<span class="ta-inline-thought-tag">${escapeHtml(tag)}</span>`)
            .join('')}</div>`
        : '';

    return `
        <div class="ta-inline-thought${thought ? '' : ' is-empty'}">
            <div class="ta-inline-thought-bar"></div>
            <div class="ta-inline-thought-copy">
                <div class="ta-inline-thought-head">
                    <span class="ta-inline-thought-kicker">${escapeHtml(`${getContactDisplayName(contact)} 的心声`)}</span>
                    <span class="ta-inline-thought-time">${escapeHtml(timeLabel)}</span>
                </div>
                <div class="ta-inline-thought-text">${escapeHtml(previewText)}</div>
                ${tagsHtml}
            </div>
        </div>
    `;
}

function renderTaThoughtSummary(contact, thoughtEntry) {
    const time = document.getElementById('ta-thought-time');
    const preview = document.getElementById('ta-thought-preview');
    const thought = thoughtEntry && thoughtEntry.thought ? thoughtEntry.thought : null;

    if (!contact) {
        if (time) time.textContent = '未生成';
        if (preview) preview.textContent = '点击右上角魔棒后，会为当前联系人生成一条独立心声。';
        renderThoughtTags([]);
        return;
    }

    if (!thought) {
        if (time) time.textContent = '未生成';
        if (preview) preview.textContent = `还没有为 ${getContactDisplayName(contact)} 生成心声，点击右上角魔棒。`;
        renderThoughtTags([contact.type, '独立隔离']);
        return;
    }

    if (time) time.textContent = formatDateTimeLabel(thoughtEntry.updatedAt || thoughtEntry.createdAt);
    if (preview) preview.textContent = sliceChars(thought.content || thought.summary, 60);
    renderThoughtTags([
        thought.mbti,
        thought.trait || thought.mood,
        thought.specialTag || thought.focus
    ]);
}

function fillThoughtModal(contact, thoughtEntry) {
    const modalName = document.getElementById('thought-modal-name');
    const modalMeta = document.getElementById('thought-modal-meta');
    const modalText = document.getElementById('thought-modal-text');
    const modalTags = document.getElementById('thought-modal-tags');
    const thought = thoughtEntry && thoughtEntry.thought ? thoughtEntry.thought : null;

    if (!contact) {
        if (modalName) modalName.textContent = '未选择联系人';
        if (modalMeta) modalMeta.textContent = '请先进入联系人纪念日页。';
        if (modalText) modalText.textContent = '当前没有可查看的心声。';
        if (modalTags) modalTags.innerHTML = '';
        return;
    }

    if (modalName) modalName.textContent = getContactDisplayName(contact);
    if (modalMeta) {
        modalMeta.textContent = thought
            ? `独立心声 / ${formatDateTimeLabel(thoughtEntry.updatedAt || thoughtEntry.createdAt)}`
            : '独立心声 / 点击右上角魔棒后生成';
    }
    if (modalText) {
        modalText.textContent = thought
            ? (thought.content || thought.summary || '暂无内容')
            : `还没有为 ${getContactDisplayName(contact)} 生成心声。点击魔棒时只会写入当前联系人的独立心声，不会覆盖其他模块的数据。`;
    }
    if (modalTags) {
        const tags = thought
            ? [thought.mbti, thought.trait || thought.mood, thought.specialTag || thought.focus]
            : [contact.type, '隔离存储'];
        modalTags.innerHTML = tags
            .map((value) => normalizeText(value))
            .filter(Boolean)
            .slice(0, 3)
            .map((tag) => `<span class="ta-thought-tag">${escapeHtml(tag)}</span>`)
            .join('');
    }
}

function calculateDays(dateStr, method) {
    const target = new Date(dateStr);
    const now = new Date();
    target.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = method === 'Down' ? (target - now) : (now - target);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
}

function generateCardHTML(event, contact, isHero, options = {}) {
    const days = calculateDays(event.date, event.countMethod);
    const dayLabel = event.countMethod === 'Down' ? '倒数' : '已过';
    const primaryIdentity = normalizeIdentity(event.identity);
    const tagClass = primaryIdentity === 'CHAR' ? 'tag-char' : (primaryIdentity === 'ME' ? 'tag-me' : 'tag-npc');
    const bgStyle = event.bgImage ? `style="background-image: url('${event.bgImage}');"` : '';
    const hasBgClass = event.bgImage ? 'has-bg' : '';
    const identityText = escapeHtml(getEventIdentityLabel(event, contact));
    const title = escapeHtml(event.title);
    const type = escapeHtml(event.type);
    const date = escapeHtml(String(event.date || '').replace(/-/g, '.'));
    const inlineThoughtHtml = options.includeThought
        ? buildTaInlineThoughtHtml(options.thoughtContact || contact, options.thoughtEntry, { isHero })
        : '';

    if (isHero) {
        return `
            <div class="hero-card ${hasBgClass}" ${bgStyle} onclick="openEditModal(${Number(event.id)})">
                ${event.isPinned ? '<div class="pin-badge"></div>' : ''}
                <div class="hero-identity">${identityText}</div>
                <div class="hero-label">${event.countMethod === 'Down' ? '距离这一天' : '已经走过'}</div>
                <div class="hero-days">${days}</div>
                <div class="hero-title">${title}</div>
                ${inlineThoughtHtml}
            </div>
        `;
    }

    return `
        <div class="list-card ${hasBgClass}" ${bgStyle} onclick="openEditModal(${Number(event.id)})">
            <div class="list-main">
                <div class="list-info">
                    <div class="list-title">${event.isPinned ? '<div class="pin-dot"></div>' : ''}${title}</div>
                    <div class="list-meta">
                        <span class="type-tag">${type}</span>
                        <span class="id-tag ${tagClass}">${identityText}</span>
                        <span class="list-date">${date}</span>
                    </div>
                </div>
                <div class="list-days">${days}<span>${dayLabel}</span></div>
            </div>
            ${inlineThoughtHtml}
        </div>
    `;
}

function buildMeEmptyStateHtml() {
    return '<div class="ta-empty-state">还没有 ME 纪念日，点击 + 新增。</div>';
}

function buildTaDetailEmptyStateHtml(contact) {
    if (!contact) {
        return '<div class="ta-empty-state">先从联系人总览里选择一个联系人。</div>';
    }
    return `<div class="ta-empty-state">${escapeHtml(getContactDisplayName(contact))} 还没有纪念日，点击右上角魔棒生成。</div>`;
}

function renderEventList(container, events, contacts, emptyHtml, options = {}) {
    if (!container) return;
    container.innerHTML = '';

    if (!events.length) {
        container.innerHTML = emptyHtml;
        return;
    }

    container.innerHTML = events.map((event, index) => {
        const contact = resolveEventContact(event, contacts);
        return generateCardHTML(event, contact, index === 0, options);
    }).join('');
}

async function loadAnniversaryThought(contactId) {
    if (contactId == null) return null;
    const rows = await contactsOps.loadSchedules(contactId, { kind: ANNIVERSARY_THOUGHT_KIND, limit: 1 });
    return rows[0] || null;
}

async function loadPairContext(contact) {
    const [userMasks, relations] = await Promise.all([
        loadUserMasks(),
        contactsDb.relations.toArray()
    ]);

    const contactGlobalId = buildContactGlobalId(contact);
    const relatedRelation = (relations || []).find((relation) => {
        if (!relation) return false;
        const source = normalizeText(relation.sourceGlobalId);
        const target = normalizeText(relation.targetGlobalId);
        const hasContact = source === contactGlobalId || target === contactGlobalId;
        const otherId = source === contactGlobalId ? target : source;
        return hasContact && /^USER_/i.test(otherId);
    }) || null;

    let userMask = null;
    if (relatedRelation) {
        const otherGlobalId = normalizeText(relatedRelation.sourceGlobalId) === contactGlobalId
            ? relatedRelation.targetGlobalId
            : relatedRelation.sourceGlobalId;
        const parsed = parseGlobalId(otherGlobalId);
        userMask = (userMasks || []).find((item) => String(item.id) === String(parsed.id)) || null;
    }
    if (!userMask) {
        userMask = (userMasks || [])[0] || null;
    }

    const userName = normalizeText(userMask && (userMask.nickname || userMask.name)) || '你';
    const contactName = getContactDisplayName(contact);
    const relationLabel = normalizeRelationLabel(
        (relatedRelation && (relatedRelation.relationType || relatedRelation.relationDesc)) || ''
    ) || '羁绊';
    const relationDetail = normalizeText(relatedRelation && relatedRelation.relationDesc);
    const tone = resolveRelationTone(relationLabel);
    const userKeywords = extractKeywordCandidates(
        userMask && userMask.nickname,
        userMask && userMask.signature,
        userMask && userMask.lore
    );
    const contactKeywords = extractKeywordCandidates(
        contact.nickname,
        contact.signature,
        contact.lore
    );
    const sharedKeywords = [...new Set([...userKeywords, ...contactKeywords])];

    return {
        userName,
        contactName,
        relationLabel,
        relationDetail,
        tone,
        userKeywords,
        contactKeywords,
        sharedKeywords,
        fingerprint: [
            contact.id,
            normalizeText(userMask && userMask.id),
            contactName,
            userName,
            relationLabel,
            relationDetail,
            userKeywords.join('|'),
            contactKeywords.join('|')
        ].join('|')
    };
}

function buildGeneratedAnniversaryRecords(contact, pairContext) {
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    const refreshSeed = `${Date.now()}|${pairContext.fingerprint}|${contact.id}`;
    const random = createSeededRandom(hashString(refreshSeed));
    const count = 4 + Math.floor(random() * 3);

    const tone = pairContext.tone;
    const sharedKeyword = compactKeyword(
        pickRandom(pairContext.sharedKeywords, random),
        pickRandom(tone.moods, random) || '真心话'
    );
    const userKeyword = compactKeyword(
        pickRandom(pairContext.userKeywords, random),
        pickRandom(tone.moods, random) || '在意的事'
    );
    const contactKeyword = compactKeyword(
        pickRandom(pairContext.contactKeywords, random),
        pickRandom(tone.moods, random) || '心事'
    );
    const scene = compactKeyword(pickRandom(tone.scenes, random), '见面以后');
    const ritual = compactKeyword(pickRandom(tone.rituals, random), '专属暗号');
    const futurePlan = compactKeyword(pickRandom(tone.futurePlans, random), '再见一面');

    const coreTemplates = [
        {
            title: `第一次把${sharedKeyword}说开`,
            type: 'Memory',
            countMethod: 'Up',
            offsetDays: -(12 + Math.floor(random() * 36))
        },
        {
            title: `${scene}变成固定默契`,
            type: 'Memory',
            countMethod: 'Up',
            offsetDays: -(42 + Math.floor(random() * 90))
        },
        {
            title: `${pairContext.contactName}主动提起${userKeyword}`,
            type: 'Memory',
            countMethod: 'Up',
            offsetDays: -(88 + Math.floor(random() * 150))
        },
        {
            title: `下次一起${futurePlan}`,
            type: 'Target',
            countMethod: 'Down',
            offsetDays: 7 + Math.floor(random() * 45)
        }
    ];

    const optionalTemplates = shuffleWithRandom([
        {
            title: `你们把${ritual}留成暗号`,
            type: 'Memory',
            countMethod: 'Up',
            offsetDays: -(18 + Math.floor(random() * 50))
        },
        {
            title: `关于${sharedKeyword}的下一次约定`,
            type: 'Target',
            countMethod: 'Down',
            offsetDays: 30 + Math.floor(random() * 60)
        },
        {
            title: `${pairContext.contactName}第一次为你留出${contactKeyword}`,
            type: 'Memory',
            countMethod: 'Up',
            offsetDays: -(130 + Math.floor(random() * 220))
        },
        {
            title: `${pairContext.relationLabel}想再往前一步`,
            type: 'Target',
            countMethod: 'Down',
            offsetDays: 55 + Math.floor(random() * 90)
        }
    ], random);

    const chosenTemplates = coreTemplates.concat(optionalTemplates.slice(0, count - coreTemplates.length));

    return chosenTemplates.map((template, index) => ({
        title: template.title,
        date: shiftDateByDays(baseDate, template.offsetDays),
        type: template.type,
        countMethod: template.countMethod,
        identity: contact.type,
        targetChar: getContactDisplayName(contact),
        targetContactId: contact.id,
        targetContactType: contact.type,
        isPinned: false,
        bgImage: '',
        isSystemGenerated: true,
        generatedForContactId: contact.id,
        generatedSource: GENERATED_EVENT_SOURCE,
        generatedBatchId: refreshSeed,
        generatedOrder: index
    }));
}

function buildAnniversaryThoughtRecord(contact, pairContext) {
    const random = createSeededRandom(hashString(`${pairContext.fingerprint}|thought|${Date.now()}`));
    const tone = pairContext.tone;
    const scene = compactKeyword(pickRandom(tone.scenes, random), '见面以后');
    const futurePlan = compactKeyword(pickRandom(tone.futurePlans, random), '再见一面');
    const userKeyword = compactKeyword(
        pickRandom(pairContext.userKeywords, random),
        pickRandom(tone.moods, random) || '那句在意的话'
    );
    const contactKeyword = compactKeyword(
        pickRandom(pairContext.contactKeywords, random),
        pairContext.contactName
    );
    const sharedKeyword = compactKeyword(
        pickRandom(pairContext.sharedKeywords, random),
        pickRandom(tone.moods, random) || '真心'
    );
    const mood = compactKeyword(pickRandom(tone.moods, random), '期待');
    const mbtiOptions = ['INFJ', 'INTJ', 'ISFP', 'ENFP', 'ISTP', 'ENTJ'];
    const mbti = pickRandom(mbtiOptions, random) || 'INFJ';
    const trait = compactKeyword(pairContext.relationLabel, '认真');
    const specialTag = sharedKeyword;
    const focus = futurePlan;
    const probability = clampNumber(0.62 + random() * 0.28, 0, 1);
    const summary = `我已经把关于${sharedKeyword}的那句话，放在心里很久了。`;
    const content = [
        `${scene}之后，我开始下意识记住和你有关的细节。`,
        `你提过的${userKeyword}，还有我自己不愿轻易说出的${contactKeyword}，都被我放进了最靠前的位置。`,
        `如果下一次真的能一起${futurePlan}，我想我会比现在更坦白一点，至少会先把那句关于${sharedKeyword}的真心话，说给你听。`
    ].join('');

    return {
        kind: ANNIVERSARY_THOUGHT_KIND,
        source: 'anniversary',
        summary,
        probability,
        thought: {
            content,
            summary,
            mbti,
            trait,
            specialTag,
            mood,
            focus,
            restraint: clampNumber(0.28 + random() * 0.2, 0, 1),
            tension: clampNumber(0.18 + random() * 0.28, 0, 1),
            closeness: clampNumber(0.72 + random() * 0.2, 0, 1),
            probability
        }
    };
}

async function renderUI() {
    const [rawEvents, taContacts] = await Promise.all([
        anniversaryDb.events.toArray(),
        loadTaContacts()
    ]);

    cachedTaContacts = taContacts;
    renderRelatedContactOptions(taContacts);

    const allEvents = await syncEventsWithContacts(rawEvents, taContacts);
    renderTaSelector(taContacts);

    if (!taContacts.length) {
        selectedTaContactId = null;
        currentTaPage = 'overview';
    } else if (!getSelectedTaContact(taContacts)) {
        selectedTaContactId = taContacts[0].id;
    }

    const meEvents = sortEvents(allEvents.filter((event) => isEventVisibleInMeView(event, taContacts)));
    renderEventList(
        document.getElementById('events-container-me'),
        meEvents,
        taContacts,
        buildMeEmptyStateHtml()
    );

    const selectedContact = getSelectedTaContact(taContacts);
    const showDetail = currentView === 'ta' && currentTaPage === 'detail' && !!selectedContact;

    renderTaViewState(showDetail);

    if (!showDetail) {
        cachedTaThoughtEntry = null;
        renderTaDetailHero(null);
        document.getElementById('events-container-ta').innerHTML = '';
        closeThoughtModal();
        return;
    }

    const taThoughtEntry = await loadAnniversaryThought(selectedContact.id);
    cachedTaThoughtEntry = taThoughtEntry;
    renderTaDetailHero(selectedContact);

    const taEvents = sortEvents(allEvents.filter((event) => isEventVisibleInTaView(event, selectedContact, taContacts)));
    renderEventList(
        document.getElementById('events-container-ta'),
        taEvents,
        taContacts,
        buildTaDetailEmptyStateHtml(selectedContact),
        {
            includeThought: true,
            thoughtEntry: taThoughtEntry,
            thoughtContact: selectedContact
        }
    );
}

function switchView(viewName, dockEl) {
    document.querySelectorAll('.view-container').forEach((item) => item.classList.remove('active'));
    document.querySelectorAll('.dock-item').forEach((item) => item.classList.remove('active'));

    document.getElementById(`view-${viewName}`).classList.add('active');
    dockEl.classList.add('active');
    currentView = viewName;

    if (viewName === 'ta') {
        currentTaPage = 'overview';
    } else {
        closeThoughtModal();
    }

    renderUI();
}

function setTab(inputId, value, el) {
    const group = el && el.closest('.tab-group');
    if (group) group.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
    if (el) el.classList.add('active');
    document.getElementById(inputId).value = value;
}

function updateRelatedContactUi() {
    const identity = normalizeIdentity(document.getElementById('ev-identity').value);
    const label = document.getElementById('ev-related-contact-label');
    const hint = document.getElementById('ev-related-contact-hint');
    const select = getRelatedContactSelect();
    const wrap = document.getElementById('char-name-wrap');
    if (wrap) wrap.style.display = 'flex';
    if (select && select.options && select.options.length) {
        select.options[0].text = identity === 'ME' ? 'No linked contact' : 'Select a contact';
    }
    if (label) {
        label.textContent = identity === 'ME' ? 'Associated Contact' : 'Target Contact';
    }
    if (hint) {
        hint.textContent = identity === 'ME'
            ? 'Choosing a contact here will also sync this memory to that contact page.'
            : 'TA memories must link to one existing contact and stay isolated under that contact.';
    }
}

function toggleCharInput() {
    updateRelatedContactUi();
}

function openAddModal() {
    if (currentView === 'ta' && currentTaPage !== 'detail') {
        return;
    }

    currentEditId = null;
    currentEditRecord = null;
    document.querySelector('.modal-header').innerText = 'NEW MEMORY';
    document.getElementById('btn-delete').style.display = 'none';

    document.getElementById('ev-title').value = '';
    document.getElementById('ev-date').value = getTodayInputValue();
    document.getElementById('ev-type').value = 'Memory';
    document.getElementById('ev-pin').classList.remove('active');
    document.getElementById('ev-bg-file').value = '';

    document.getElementById('ev-bg-base64').value = '';
    document.getElementById('bg-preview').style.display = 'none';
    document.getElementById('upload-placeholder').style.display = 'flex';
    document.querySelector('.file-upload-area').style.border = '1px dashed rgba(0,0,0,0.15)';

    setCountMethod('Up');

    const selectedContact = getSelectedTaContact();
    if (currentView === 'ta' && selectedContact) {
        setIdentity(selectedContact.type);
        setRelatedContactSelection(selectedContact.id);
    } else {
        setIdentity('ME');
        setRelatedContactSelection('');
    }

    updateRelatedContactUi();
    document.getElementById('add-modal').classList.add('show');
}

async function openEditModal(id) {
    const [event, taContacts] = await Promise.all([
        anniversaryDb.events.get(id),
        loadTaContacts()
    ]);
    if (!event) return;

    cachedTaContacts = taContacts;
    renderRelatedContactOptions(taContacts);

    currentEditId = id;
    currentEditRecord = event;
    document.querySelector('.modal-header').innerText = 'EDIT MEMORY';

    const linkedContact = resolveEventContact(event, taContacts);
    document.getElementById('ev-title').value = event.title || '';
    document.getElementById('ev-date').value = event.date || getTodayInputValue();
    document.getElementById('ev-type').value = event.type || 'Memory';
    setRelatedContactSelection(linkedContact ? linkedContact.id : '');

    document.getElementById('ev-pin').classList.toggle('active', !!event.isPinned);
    document.getElementById('ev-bg-file').value = '';

    document.getElementById('ev-bg-base64').value = event.bgImage || '';
    const preview = document.getElementById('bg-preview');
    const placeholder = document.getElementById('upload-placeholder');
    const area = document.querySelector('.file-upload-area');
    if (event.bgImage) {
        preview.style.backgroundImage = `url(${event.bgImage})`;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
        area.style.border = 'none';
    } else {
        preview.style.display = 'none';
        placeholder.style.display = 'flex';
        area.style.border = '1px dashed rgba(0,0,0,0.15)';
    }

    setCountMethod(event.countMethod);
    setIdentity(event.identity);
    updateRelatedContactUi();

    if (linkedContact) {
        selectedTaContactId = linkedContact.id;
    }

    document.getElementById('btn-delete').style.display = 'block';
    document.getElementById('add-modal').classList.add('show');
}

function closeAddModal() {
    currentEditId = null;
    currentEditRecord = null;
    document.getElementById('add-modal').classList.remove('show');
}

async function deleteEvent() {
    if (!currentEditId) return;
    await anniversaryDb.events.delete(currentEditId);
    closeAddModal();
    renderUI();
}

async function saveEvent() {
    const identity = normalizeIdentity(document.getElementById('ev-identity').value);
    const taContacts = await loadTaContacts();
    cachedTaContacts = taContacts;
    const relatedContact = getSelectedRelatedContact(taContacts);

    const eventData = {
        title: document.getElementById('ev-title').value.trim(),
        date: document.getElementById('ev-date').value,
        type: document.getElementById('ev-type').value,
        countMethod: document.getElementById('ev-count').value === 'Down' ? 'Down' : 'Up',
        identity,
        targetChar: '',
        targetContactId: '',
        targetContactType: '',
        isPinned: document.getElementById('ev-pin').classList.contains('active'),
        bgImage: document.getElementById('ev-bg-base64').value
    };

    if (!eventData.title || !eventData.date) {
        alert('Title and Date are required.');
        return;
    }

    if (eventData.identity !== 'ME' && !relatedContact) {
        alert('TA events must link to an existing contact.');
        return;
    }

    if (relatedContact) {
        if (eventData.identity !== 'ME') {
            eventData.identity = relatedContact.type;
        }
        eventData.targetChar = getContactDisplayName(relatedContact);
        eventData.targetContactId = relatedContact.id;
        eventData.targetContactType = relatedContact.type;
    }

    if (currentEditRecord && currentEditRecord.isSystemGenerated) {
        eventData.isSystemGenerated = false;
        eventData.generatedForContactId = '';
        eventData.generatedSource = '';
        eventData.generatedBatchId = '';
        eventData.generatedOrder = '';
    }

    if (eventData.isPinned) {
        const allEvents = await anniversaryDb.events.toArray();
        const nextScopeKeys = new Set(getEventScopeKeys(eventData, taContacts));

        for (const event of allEvents) {
            if (!event || event.id === currentEditId || !event.isPinned) continue;
            const overlap = getEventScopeKeys(event, taContacts).some((scopeKey) => nextScopeKeys.has(scopeKey));
            if (!overlap) continue;
            await anniversaryDb.events.update(event.id, { isPinned: false });
        }
    }

    if (currentEditId) {
        await anniversaryDb.events.update(currentEditId, eventData);
    } else {
        await anniversaryOps.addEvent(eventData);
    }

    if (currentView === 'ta' && relatedContact) {
        selectedTaContactId = relatedContact.id;
        currentTaPage = 'detail';
    }

    closeAddModal();
    renderUI();
}

function clipNormalizedText(value, maxLength) {
    const chars = Array.from(normalizeText(value));
    return chars.length > maxLength ? chars.slice(0, maxLength).join('') : chars.join('');
}

function normalizeAnniversaryType(value) {
    const raw = normalizeText(value).toLowerCase();
    if (raw === 'birthday') return 'Birthday';
    if (raw === 'target' || raw === 'countdown') return 'Target';
    return 'Memory';
}

function normalizeAnniversaryCountMethod(value) {
    return normalizeText(value).toLowerCase() === 'down' ? 'Down' : 'Up';
}

function normalizeAnniversaryRatio(value, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    const normalized = number > 1 ? number / 100 : number;
    return clampNumber(normalized, 0, 1);
}

function normalizeAnniversaryTag(value, fallback, maxLength = 8) {
    const text = clipNormalizedText(value || fallback, maxLength);
    return text || clipNormalizedText(fallback, maxLength);
}

function isValidDateInputValue(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || '').trim())) return false;
    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime());
}

function extractJsonBlock(rawText) {
    const source = String(rawText || '')
        .replace(/^```json/i, '')
        .replace(/^```/i, '')
        .replace(/```$/i, '')
        .trim();
    if (!source) return '';
    const directObject = source.match(/\{[\s\S]*\}$/);
    if (directObject) return directObject[0];
    const directArray = source.match(/\[[\s\S]*\]$/);
    if (directArray) return directArray[0];
    const firstBrace = source.indexOf('{');
    const lastBrace = source.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) return source.slice(firstBrace, lastBrace + 1);
    return source;
}

function parseAnniversaryAiPayload(rawText) {
    const jsonText = extractJsonBlock(rawText);
    if (!jsonText) return null;
    try {
        return JSON.parse(jsonText);
    } catch (error) {
        return null;
    }
}

function normalizeAiGeneratedEvents(contact, items, generatedBatchId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const output = [];
    const seen = new Set();

    (Array.isArray(items) ? items : []).forEach((item) => {
        if (!item || typeof item !== 'object') return;
        const title = clipNormalizedText(item.title || item.name, 32);
        let date = normalizeText(item.date);
        if (!date && Number.isFinite(Number(item.offsetDays))) {
            date = shiftDateByDays(today, Number(item.offsetDays));
        }
        if (!title || !isValidDateInputValue(date)) return;
        const type = normalizeAnniversaryType(item.type || item.category);
        const countMethod = normalizeAnniversaryCountMethod(item.countMethod || item.method);
        const key = `${title}|${date}|${type}|${countMethod}`;
        if (seen.has(key)) return;
        seen.add(key);
        output.push({
            title,
            date,
            type,
            countMethod,
            identity: contact.type,
            targetChar: getContactDisplayName(contact),
            targetContactId: contact.id,
            targetContactType: contact.type,
            isPinned: false,
            bgImage: '',
            isSystemGenerated: true,
            generatedForContactId: contact.id,
            generatedSource: GENERATED_EVENT_SOURCE,
            generatedBatchId,
            generatedOrder: output.length
        });
    });

    return output.slice(0, 6);
}

function buildAiThoughtRecord(contact, pairContext, item) {
    const source = item && typeof item === 'object' ? item : {};
    const sharedTag = normalizeAnniversaryTag(
        source.specialTag,
        pairContext.sharedKeywords[0] || pairContext.relationLabel || contact.type
    );
    const summary = clipNormalizedText(source.summary || source.content || source.text, 48);
    const content = clipNormalizedText(source.content || source.text || source.summary, 140);
    if (!summary && !content) {
        throw new Error('AI thought payload was empty');
    }
    const mbti = normalizeText(source.mbti).toUpperCase().match(/[A-Z]{4}/);
    const probability = normalizeAnniversaryRatio(source.probability, 0.68);
    return {
        kind: ANNIVERSARY_THOUGHT_KIND,
        source: 'anniversary_ai',
        summary: summary || clipNormalizedText(content, 48),
        probability,
        thought: {
            content: content || summary,
            summary: summary || clipNormalizedText(content, 48),
            mbti: mbti ? mbti[0] : 'INFJ',
            trait: normalizeAnniversaryTag(source.trait, pairContext.relationLabel || '认真'),
            specialTag: sharedTag,
            mood: normalizeAnniversaryTag(source.mood, pairContext.tone.moods[0] || '在意'),
            focus: normalizeAnniversaryTag(source.focus, pairContext.tone.futurePlans[0] || '靠近'),
            restraint: normalizeAnniversaryRatio(source.restraint, 0.56),
            tension: normalizeAnniversaryRatio(source.tension, 0.38),
            closeness: normalizeAnniversaryRatio(source.closeness, 0.74),
            probability
        }
    };
}

async function requestContactAnniversaryPayload(contact) {
    if (typeof window.requestMiniChatCompletion !== 'function' || typeof window.buildMiniContactPromptContext !== 'function') {
        throw new Error('AI runtime is not ready yet');
    }

    const config = typeof window.getMiniChatConfig === 'function'
        ? await window.getMiniChatConfig()
        : (window.MiniDB && window.MiniDB.ops && window.MiniDB.ops.api && typeof window.MiniDB.ops.api.getChatConfig === 'function'
            ? await window.MiniDB.ops.api.getChatConfig()
            : null);

    if (!config || !config.apiKey || !config.model) {
        throw new Error('Please configure the chat API first.');
    }

    const [pairContext, promptContext] = await Promise.all([
        loadPairContext(contact),
        window.buildMiniContactPromptContext(contact.id, contact, { mode: 'anniversary' }, config || {})
    ]);

    const today = formatDateInput(new Date());
    const systemPrompt = [
        '你只为当前联系人生成独立纪念日，不得混入任何其他联系人、任何其他关系线、任何其他记忆。',
        '',
        '[Isolation Rules]',
        '- 所有内容都只属于当前联系人页面。',
        '- 严禁引用别的联系人昵称、关系、世界书、心声或记忆。',
        '- 输出必须可直接写入倒数日应用，不要解释，不要备注。',
        '',
        '[Task]',
        '- 根据双方设定、关系网、世界书、已有记忆与日程，为当前联系人生成 4 到 6 条纪念日。',
        '- 纪念日标题要具体、亲密、像真实会写进倒数日的条目。',
        '- 纪念日 type 只允许 Memory、Target、Birthday。',
        '- countMethod 只允许 Up 或 Down。',
        '- date 必须是 YYYY-MM-DD。',
        '- 另外生成 1 条当前联系人专属心声 thought。',
        '',
        '[Output Contract]',
        '- 只输出 JSON 对象，不要 Markdown，不要代码块。',
        '- 顶层字段必须是 anniversaries 和 thought。',
        '- anniversaries 必须是 4 到 6 条对象数组，每条包含 title、date、type、countMethod。',
        '- thought 必须包含 content、summary、mbti、trait、specialTag、mood、focus、probability、restraint、tension、closeness。',
        '',
        '[Bound Data]',
        JSON.stringify({
            today,
            pairSnapshot: {
                userName: pairContext.userName,
                contactName: pairContext.contactName,
                relationLabel: pairContext.relationLabel,
                relationDetail: pairContext.relationDetail
            },
            promptContext: promptContext && promptContext.promptPayload ? promptContext.promptPayload : null
        }, null, 2)
    ].join('\n');

    const rawReply = await window.requestMiniChatCompletion(config || {}, systemPrompt, [
        {
            role: 'user',
            content: `今天是 ${today}。请为 ${getContactDisplayName(contact)} 生成专属纪念日与心声。`
        }
    ]);

    const parsed = parseAnniversaryAiPayload(rawReply);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('AI response was not valid JSON');
    }
    return { parsed, pairContext };
}

async function refreshSelectedTaContact() {
    const contact = getSelectedTaContact();
    if (!contact || isRefreshingTaContact) return;

    isRefreshingTaContact = true;
    updateRefreshButtonState();

    try {
        const { parsed, pairContext } = await requestContactAnniversaryPayload(contact);
        const batchId = `${Date.now()}|${contact.id}|ai`;
        const generatedEvents = normalizeAiGeneratedEvents(contact, parsed.anniversaries, batchId);
        const thoughtRecord = buildAiThoughtRecord(contact, pairContext, parsed.thought);
        if (generatedEvents.length < 4) {
            throw new Error('AI did not return enough anniversaries');
        }

        const allEvents = await anniversaryDb.events.toArray();
        const eventsToDelete = allEvents.filter((event) => {
            return !!event
                && !!event.isSystemGenerated
                && normalizeText(event.generatedSource) === GENERATED_EVENT_SOURCE
                && String(event.generatedForContactId) === String(contact.id);
        });

        await Promise.all(eventsToDelete.map((event) => anniversaryDb.events.delete(event.id)));
        await contactsOps.clearSchedules(contact.id, { kind: ANNIVERSARY_THOUGHT_KIND });
        await Promise.all(generatedEvents.map((event) => anniversaryOps.addEvent(event)));
        await contactsOps.saveSchedule(contact.id, thoughtRecord);
        await renderUI();
    } catch (error) {
        console.error('Failed to refresh contact anniversaries', error);
        alert(`Refresh failed: ${error && error.message ? error.message : error}`);
    } finally {
        isRefreshingTaContact = false;
        updateRefreshButtonState();
    }
}

function openTaContactDetail(contactId) {
    const nextContact = findContactById(contactId, cachedTaContacts);
    if (!nextContact) return;
    selectedTaContactId = nextContact.id;
    currentTaPage = 'detail';
    renderUI();
}

function closeTaContactDetail() {
    currentTaPage = 'overview';
    closeThoughtModal();
    renderUI();
}

function openThoughtModal() {
    if (!isTaDetailVisible()) return;
    const modal = document.getElementById('thought-modal');
    if (!modal) return;
    fillThoughtModal(getSelectedTaContact(), cachedTaThoughtEntry);
    modal.classList.add('show');
}

function closeThoughtModal() {
    const modal = document.getElementById('thought-modal');
    if (modal) modal.classList.remove('show');
}

document.getElementById('ev-bg-file').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
        const base64 = loadEvent.target.result;
        document.getElementById('ev-bg-base64').value = base64;
        const preview = document.getElementById('bg-preview');
        preview.style.backgroundImage = `url(${base64})`;
        preview.style.display = 'block';
        document.getElementById('upload-placeholder').style.display = 'none';
        document.querySelector('.file-upload-area').style.border = 'none';
    };
    reader.readAsDataURL(file);
});

document.getElementById('ev-bg-file').addEventListener('click', (event) => {
    event.target.value = '';
});

getRelatedContactSelect().addEventListener('change', () => {
    const relatedContact = getSelectedRelatedContact();
    const identity = normalizeIdentity(document.getElementById('ev-identity').value);
    if (relatedContact && identity !== 'ME') {
        setIdentity(relatedContact.type);
    } else {
        updateRelatedContactUi();
    }
});

window.renderUI = renderUI;
window.switchView = switchView;
window.setTab = setTab;
window.toggleCharInput = toggleCharInput;
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.closeAddModal = closeAddModal;
window.deleteEvent = deleteEvent;
window.saveEvent = saveEvent;
window.refreshSelectedTaContact = refreshSelectedTaContact;
window.openTaContactDetail = openTaContactDetail;
window.closeTaContactDetail = closeTaContactDetail;
window.openThoughtModal = openThoughtModal;
window.closeThoughtModal = closeThoughtModal;
window.filterByTaContact = openTaContactDetail;

document.addEventListener('DOMContentLoaded', async () => {
    document.addEventListener('touchmove', (event) => {
        if (!event.target.closest('.content-scroll') && !event.target.closest('.modal-scroll-wrap')) {
            event.preventDefault();
        }
    }, { passive: false });

    updateRelatedContactUi();
    syncPrimaryActionVisibility();
    updateRefreshButtonState();
    await renderUI();
});

(function () {
    const route = 'anniversary';
    const placeholderUrl = '../assets/初始占位图.png';
    const placeholderSelectors = ['#bg-preview', '.char-avatar', '.ta-contact-avatar'];
    const bindings = [];
    const backSelectors = [];
    const overrideReturnToDesktop = true;
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
