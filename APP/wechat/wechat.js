// ================= 全局函数 =================
    function switchTab(pageId, dockElement) {
        document.querySelectorAll('.page-container').forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        targetPage.classList.add('active');

        const scrollContainer = targetPage.querySelector('.chat-list, .moments-scroll, .profile-scroll');
        if (scrollContainer) scrollContainer.scrollTop = 0;

        document.querySelectorAll('.dock-item').forEach(item => item.classList.remove('active'));
        dockElement.classList.add('active');
    }

    function returnToDesktop() {
        console.log('Action: Return to system desktop');
    }

    // 聊天详情页开启与关闭
    function openChatDetail() {
        document.getElementById('chat-detail-page').classList.add('active');
        setTimeout(() => {
            const scroll = document.getElementById('chat-scroll');
            if(scroll) scroll.scrollTop = scroll.scrollHeight;
        }, 50);
    }

    function closeChatDetail() {
        document.getElementById('chat-detail-page').classList.remove('active');
    }

    // 日记数据与功能
    const charDiaryData = [];

    function openDiaryList() {
        document.getElementById('diary-list-page').classList.add('active');
        renderTimeline();
    }

    function closeDiaryList() { document.getElementById('diary-list-page').classList.remove('active'); }

    function renderTimeline() {
        const container = document.getElementById('timeline-content');
        container.innerHTML = charDiaryData.map(d => `
            <div class="timeline-item" onclick="openDiaryDetail(${d.id})">
                <div class="timeline-dot"></div>
                <div class="timeline-date">${d.date}</div>
                <div class="timeline-card">
                    <div class="timeline-meta"><span class="meta-tag">${d.location}</span><span class="meta-tag">${d.mood}</span></div>
                    <div class="timeline-title">${d.title}</div>
                    <div class="timeline-preview">${d.content}</div>
                </div>
            </div>
        `).join('');
    }

    function openDiaryDetail(id) {
        const data = charDiaryData.find(d => d.id === id);
        if(!data) return;
        document.getElementById('dd-date').innerText = data.date;
        document.getElementById('dd-title').innerText = data.title;
        document.getElementById('dd-location').innerText = `LOC: ${data.location}`;
        document.getElementById('dd-mood').innerText = `MOOD: ${data.mood}`;
        document.getElementById('dd-text').innerText = data.content;
        document.getElementById('diary-detail-page').classList.add('active');
    }

    function closeDiaryDetail() { document.getElementById('diary-detail-page').classList.remove('active'); }

    // 时间更新功能
    function updateDateTime(){
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const dtEl = document.getElementById('current-datetime');
        if(dtEl) dtEl.innerText = `${year}.${month}.${day} / ${hours}:${minutes}`;
    }
    setInterval(updateDateTime, 60000);

    const stickerRepoState = {
        groups: [],
        stickersByGroup: new Map(),
        activeGroupId: null,
        selectedStickerIds: new Set(),
        editMode: false,
        fabPressTimer: 0,
        fabLongPressTriggered: false,
        pendingDrag: null,
        drag: null,
        dragListenersAttached: false
    };

    function getWechatOps() {
        return window.MiniDB && window.MiniDB.ops ? window.MiniDB.ops.wechat : null;
    }

    function getWechatDb() {
        return window.MiniDB && window.MiniDB.databases ? window.MiniDB.databases.wechat : null;
    }

    async function readWechatEditableText(id) {
        const wechatOps = getWechatOps();
        if (wechatOps && typeof wechatOps.getConfig === 'function') {
            try {
                return await wechatOps.getConfig(id);
            } catch (error) {
                console.warn('Failed to read WeChat text config', id, error);
            }
        }
        const wechatDb = getWechatDb();
        if (!wechatDb || !wechatDb.configs || typeof wechatDb.configs.get !== 'function') return null;
        try {
            const record = await wechatDb.configs.get(id);
            return record && record.value != null ? record.value : null;
        } catch (error) {
            console.warn('Failed to read legacy WeChat text config', id, error);
            return null;
        }
    }

    async function writeWechatEditableText(id, value) {
        const wechatOps = getWechatOps();
        if (wechatOps && typeof wechatOps.setConfig === 'function') {
            return wechatOps.setConfig(id, value);
        }
        const wechatDb = getWechatDb();
        if (!wechatDb || !wechatDb.configs || typeof wechatDb.configs.put !== 'function') return null;
        return wechatDb.configs.put({ id, value });
    }

    async function readWechatEditableImage(id) {
        const wechatOps = getWechatOps();
        if (wechatOps && typeof wechatOps.getImage === 'function') {
            try {
                return await wechatOps.getImage(id);
            } catch (error) {
                console.warn('Failed to read WeChat image config', id, error);
            }
        }
        const wechatDb = getWechatDb();
        if (!wechatDb || !wechatDb.images || typeof wechatDb.images.get !== 'function') return null;
        try {
            const record = await wechatDb.images.get(id);
            return record && record.dataUrl ? record.dataUrl : null;
        } catch (error) {
            console.warn('Failed to read legacy WeChat image config', id, error);
            return null;
        }
    }

    async function writeWechatEditableImage(id, dataUrl) {
        const wechatOps = getWechatOps();
        if (wechatOps && typeof wechatOps.setImage === 'function') {
            return wechatOps.setImage(id, dataUrl);
        }
        const wechatDb = getWechatDb();
        if (!wechatDb || !wechatDb.images || typeof wechatDb.images.put !== 'function') return null;
        return wechatDb.images.put({ id, dataUrl });
    }

    function escapeStickerHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function sortByOrderThenCreated(left, right) {
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

    function getActiveStickerList() {
        return stickerRepoState.stickersByGroup.get(String(stickerRepoState.activeGroupId)) || [];
    }

    function clearStickerSelection() {
        stickerRepoState.selectedStickerIds.clear();
    }

    function syncStickerSelectionWithActiveGroup() {
        const activeIds = new Set(getActiveStickerList().map((sticker) => String(sticker.id)));
        stickerRepoState.selectedStickerIds = new Set(
            Array.from(stickerRepoState.selectedStickerIds).filter((id) => activeIds.has(String(id)))
        );
    }

    function clearStickerFabPressTimer() {
        if (stickerRepoState.fabPressTimer) {
            window.clearTimeout(stickerRepoState.fabPressTimer);
            stickerRepoState.fabPressTimer = 0;
        }
    }

    function attachStickerDragListeners() {
        if (stickerRepoState.dragListenersAttached) return;
        stickerRepoState.dragListenersAttached = true;
        window.addEventListener('pointermove', handleStickerDragMove, true);
        window.addEventListener('pointerup', handleStickerDragEnd, true);
        window.addEventListener('pointercancel', handleStickerDragEnd, true);
        window.addEventListener('blur', handleStickerWindowBlur, true);
    }

    function detachStickerDragListeners() {
        if (!stickerRepoState.dragListenersAttached) return;
        stickerRepoState.dragListenersAttached = false;
        window.removeEventListener('pointermove', handleStickerDragMove, true);
        window.removeEventListener('pointerup', handleStickerDragEnd, true);
        window.removeEventListener('pointercancel', handleStickerDragEnd, true);
        window.removeEventListener('blur', handleStickerWindowBlur, true);
    }

    function clearPendingStickerDrag(detachIfIdle = true) {
        if (stickerRepoState.pendingDrag && stickerRepoState.pendingDrag.timer) {
            window.clearTimeout(stickerRepoState.pendingDrag.timer);
        }
        stickerRepoState.pendingDrag = null;
        if (detachIfIdle && !stickerRepoState.drag) {
            detachStickerDragListeners();
        }
    }

    function cleanupStickerDrag(renderAfter = true) {
        clearPendingStickerDrag(false);
        if (stickerRepoState.drag && stickerRepoState.drag.ghost && stickerRepoState.drag.ghost.parentNode) {
            stickerRepoState.drag.ghost.parentNode.removeChild(stickerRepoState.drag.ghost);
        }
        stickerRepoState.drag = null;
        detachStickerDragListeners();
        if (renderAfter) renderStickerGrid();
    }

    async function ensureStickerRepositoryDefaults() {
        const wechatOps = getWechatOps();
        if (!wechatOps) return [];

        let groups = (await wechatOps.stickerGroups.list()).slice().sort(sortByOrderThenCreated);
        if (!groups.length) {
            await wechatOps.stickerGroups.add({ name: '\u9ed8\u8ba4', sortOrder: 0 });
            groups = (await wechatOps.stickerGroups.list()).slice().sort(sortByOrderThenCreated);
        }

        const fixes = [];
        groups.forEach((group, index) => {
            if (Number(group.sortOrder) !== index) {
                group.sortOrder = index;
                fixes.push(wechatOps.stickerGroups.update(group.id, { sortOrder: index }));
            }
        });
        if (fixes.length) await Promise.all(fixes);
        return groups;
    }

    async function refreshStickerRepository() {
        const wechatOps = getWechatOps();
        if (!wechatOps) return;

        const groups = await ensureStickerRepositoryDefaults();
        const fallbackGroupId = groups.length ? groups[0].id : null;
        const stickers = (await wechatOps.stickers.list()).slice().sort((left, right) => {
            if (Number(left && left.groupId) !== Number(right && right.groupId)) {
                return Number(left && left.groupId) - Number(right && right.groupId);
            }
            return sortByOrderThenCreated(left, right);
        });

        const stickersByGroup = new Map(groups.map((group) => [String(group.id), []]));
        const stickerFixes = [];

        stickers.forEach((sticker) => {
            let groupKey = String(sticker.groupId);
            if (!stickersByGroup.has(groupKey) && fallbackGroupId != null) {
                groupKey = String(fallbackGroupId);
                sticker.groupId = fallbackGroupId;
                stickerFixes.push(wechatOps.stickers.update(sticker.id, { groupId: fallbackGroupId }));
            }
            if (stickersByGroup.has(groupKey)) {
                stickersByGroup.get(groupKey).push(sticker);
            }
        });

        stickersByGroup.forEach((groupStickers) => {
            groupStickers.forEach((sticker, index) => {
                if (Number(sticker.sortOrder) !== index) {
                    sticker.sortOrder = index;
                    stickerFixes.push(wechatOps.stickers.update(sticker.id, { sortOrder: index }));
                }
            });
        });

        if (stickerFixes.length) await Promise.all(stickerFixes);

        stickerRepoState.groups = groups;
        stickerRepoState.stickersByGroup = stickersByGroup;

        const hasActiveGroup = groups.some((group) => String(group.id) === String(stickerRepoState.activeGroupId));
        if (!hasActiveGroup) {
            stickerRepoState.activeGroupId = groups.length ? groups[0].id : null;
        }

        syncStickerSelectionWithActiveGroup();
        updateStickerRepositoryUi();
    }

    function updateStickerRepositoryUi() {
        const repoPage = document.getElementById('sticker-repo-page');
        const stickerFab = document.getElementById('sticker-add-fab');
        const pageTitle = document.getElementById('sticker-page-title');
        const deleteSelectedButton = document.getElementById('sticker-delete-selected-btn');
        const deleteAllButton = document.getElementById('sticker-delete-all-btn');
        const selectedCount = stickerRepoState.selectedStickerIds.size;
        const activeCount = getActiveStickerList().length;
        if (repoPage) repoPage.classList.toggle('is-edit-mode', stickerRepoState.editMode);
        if (stickerFab) {
            stickerFab.textContent = stickerRepoState.editMode ? 'OK' : '+';
            stickerFab.setAttribute('aria-label', stickerRepoState.editMode ? 'Done editing emoticons' : 'Add emoticon');
        }
        if (pageTitle) {
            pageTitle.textContent = stickerRepoState.editMode && selectedCount ? `${selectedCount} SELECTED` : 'EMOTICONS';
        }
        if (deleteSelectedButton) deleteSelectedButton.disabled = !stickerRepoState.editMode || selectedCount === 0;
        if (deleteAllButton) deleteAllButton.disabled = !stickerRepoState.editMode || activeCount === 0;
        renderStickerGroupBar();
        renderStickerGrid();
    }

    function renderStickerGroupBar() {
        const container = document.getElementById('sticker-group-bar');
        if (!container) return;

        container.innerHTML = stickerRepoState.groups.map((group) => {
            const isActive = String(group.id) === String(stickerRepoState.activeGroupId);
            return `
                <div class="sticker-group-pill${isActive ? ' active' : ''}" data-group-id="${group.id}">
                    <span class="sticker-group-name">${escapeStickerHtml(group.name || '\u672a\u547d\u540d')}</span>
                    <button type="button" class="sticker-group-remove" data-remove-group="${group.id}" aria-label="Delete group">&times;</button>
                </div>
            `;
        }).join('') + '<button type="button" class="sticker-group-pill is-add" id="sticker-group-add-btn" aria-label="Add group">+</button>';

        container.querySelectorAll('[data-group-id]').forEach((pill) => {
            pill.addEventListener('click', (event) => {
                if (event.target.closest('[data-remove-group]')) return;
                clearStickerSelection();
                stickerRepoState.activeGroupId = Number(pill.dataset.groupId);
                updateStickerRepositoryUi();
            });
        });

        container.querySelectorAll('[data-remove-group]').forEach((button) => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                await deleteStickerGroup(Number(button.dataset.removeGroup));
            });
        });

        const addGroupButton = document.getElementById('sticker-group-add-btn');
        if (addGroupButton) {
            addGroupButton.addEventListener('click', () => {
                openStickerGroupModal();
            });
        }
    }

    function renderStickerGrid() {
        const grid = document.getElementById('sticker-grid');
        const emptyState = document.getElementById('sticker-empty-state');
        if (!grid || !emptyState) return;

        const stickers = getActiveStickerList();
        emptyState.classList.toggle('show', stickers.length === 0);
        grid.innerHTML = stickers.map((sticker) => {
            const isDragSource = stickerRepoState.drag && String(stickerRepoState.drag.stickerId) === String(sticker.id);
            const isSelected = stickerRepoState.selectedStickerIds.has(String(sticker.id));
            return `
                <div class="sticker-card${isDragSource ? ' is-drag-source' : ''}${isSelected ? ' is-selected' : ''}" data-sticker-id="${sticker.id}">
                    <button type="button" class="sticker-delete-btn" data-delete-sticker="${sticker.id}" aria-label="Delete emoticon">&times;</button>
                    <div class="sticker-select-mark">&#10003;</div>
                    <div class="sticker-thumb">
                        <img src="${escapeStickerHtml(sticker.url)}" alt="${escapeStickerHtml(sticker.description || 'sticker')}" loading="lazy">
                    </div>
                    <div class="sticker-desc">${escapeStickerHtml(sticker.description || 'Untitled')}</div>
                </div>
            `;
        }).join('');

        grid.querySelectorAll('[data-delete-sticker]').forEach((button) => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (!stickerRepoState.editMode) return;
                await deleteStickerItem(Number(button.dataset.deleteSticker));
            });
        });

        grid.querySelectorAll('.sticker-card').forEach((card) => {
            card.addEventListener('pointerdown', handleStickerCardPointerDown);
        });
    }

    function updateStickerDragGhostPosition(drag, clientX, clientY) {
        if (!drag || !drag.ghost) return;
        drag.ghost.style.left = `${clientX - drag.offsetX}px`;
        drag.ghost.style.top = `${clientY - drag.offsetY}px`;
    }

    function toggleStickerSelection(stickerId) {
        const key = String(stickerId);
        if (stickerRepoState.selectedStickerIds.has(key)) {
            stickerRepoState.selectedStickerIds.delete(key);
        } else {
            stickerRepoState.selectedStickerIds.add(key);
        }
        updateStickerRepositoryUi();
    }

    function startStickerCardDrag() {
        const pending = stickerRepoState.pendingDrag;
        if (!pending) return;

        const sourceCard = document.querySelector(`.sticker-card[data-sticker-id="${pending.stickerId}"]`) || pending.sourceCard;
        if (!sourceCard) {
            clearPendingStickerDrag();
            return;
        }

        const rect = sourceCard.getBoundingClientRect();
        const ghost = sourceCard.cloneNode(true);
        ghost.classList.remove('is-drag-source');
        ghost.classList.add('sticker-drag-ghost');
        ghost.style.width = `${rect.width}px`;
        ghost.style.left = `${rect.left}px`;
        ghost.style.top = `${rect.top}px`;
        document.body.appendChild(ghost);

        stickerRepoState.pendingDrag = null;
        stickerRepoState.drag = {
            stickerId: pending.stickerId,
            pointerId: pending.pointerId,
            ghost,
            offsetX: pending.lastX - rect.left,
            offsetY: pending.lastY - rect.top
        };

        updateStickerDragGhostPosition(stickerRepoState.drag, pending.lastX, pending.lastY);
        renderStickerGrid();
    }

    function moveStickerInActiveGroup(sourceId, targetId) {
        const groupKey = String(stickerRepoState.activeGroupId);
        const current = getActiveStickerList();
        const next = current.slice();
        const sourceIndex = next.findIndex((item) => String(item.id) === String(sourceId));
        const targetIndex = next.findIndex((item) => String(item.id) === String(targetId));
        if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
        const [moved] = next.splice(sourceIndex, 1);
        next.splice(targetIndex, 0, moved);
        stickerRepoState.stickersByGroup.set(groupKey, next);
        renderStickerGrid();
    }

    async function persistActiveStickerOrder() {
        const wechatOps = getWechatOps();
        if (!wechatOps) return;
        const stickers = getActiveStickerList();
        await Promise.all(stickers.map((sticker, index) => wechatOps.stickers.update(sticker.id, { sortOrder: index })));
    }

    function handleStickerCardPointerDown(event) {
        if (!stickerRepoState.editMode) return;
        if (event.button != null && event.button !== 0) return;
        if (event.target.closest('[data-delete-sticker]')) return;

        clearPendingStickerDrag(false);
        attachStickerDragListeners();

        stickerRepoState.pendingDrag = {
            stickerId: Number(event.currentTarget.dataset.stickerId),
            pointerId: event.pointerId,
            sourceCard: event.currentTarget,
            startX: event.clientX,
            startY: event.clientY,
            lastX: event.clientX,
            lastY: event.clientY,
            moved: false,
            timer: window.setTimeout(() => {
                startStickerCardDrag();
            }, 220)
        };
    }

    function handleStickerDragMove(event) {
        const pending = stickerRepoState.pendingDrag;
        const drag = stickerRepoState.drag;

        if (pending && event.pointerId === pending.pointerId) {
            pending.lastX = event.clientX;
            pending.lastY = event.clientY;
            if (!drag && Math.hypot(event.clientX - pending.startX, event.clientY - pending.startY) > 10) {
                pending.moved = true;
                clearPendingStickerDrag();
            }
        }

        if (!drag || event.pointerId !== drag.pointerId) return;
        event.preventDefault();

        updateStickerDragGhostPosition(drag, event.clientX, event.clientY);
        const target = document.elementFromPoint(event.clientX, event.clientY);
        const overCard = target && target.closest ? target.closest('.sticker-card') : null;
        if (overCard && String(overCard.dataset.stickerId) !== String(drag.stickerId)) {
            moveStickerInActiveGroup(drag.stickerId, Number(overCard.dataset.stickerId));
        }
    }

    async function finishStickerDrag(shouldPersist) {
        const hadDrag = !!stickerRepoState.drag;
        cleanupStickerDrag();
        if (hadDrag && shouldPersist) {
            await persistActiveStickerOrder();
        }
    }

    function handleStickerDragEnd(event) {
        const pending = stickerRepoState.pendingDrag;
        const drag = stickerRepoState.drag;
        if (pending && event.pointerId === pending.pointerId) {
            const stickerId = pending.stickerId;
            const shouldToggleSelection = !pending.moved;
            clearPendingStickerDrag();
            if (shouldToggleSelection) toggleStickerSelection(stickerId);
            return;
        }
        if (drag && event.pointerId === drag.pointerId) {
            event.preventDefault();
            void finishStickerDrag(true);
        }
    }

    function handleStickerWindowBlur() {
        void finishStickerDrag(false);
    }

    function setStickerEditMode(nextValue) {
        const enabled = Boolean(nextValue);
        cleanupStickerDrag();
        clearStickerSelection();
        stickerRepoState.editMode = enabled;
        updateStickerRepositoryUi();
    }

    function toggleStickerEditMode(forceValue) {
        if (typeof forceValue === 'boolean') {
            setStickerEditMode(forceValue);
            return;
        }
        setStickerEditMode(!stickerRepoState.editMode);
    }

    function openStickerGroupModal() {
        const modal = document.getElementById('sticker-group-modal');
        const input = document.getElementById('sticker-group-name');
        if (!modal || !input) return;
        input.value = '';
        modal.style.display = 'flex';
        window.setTimeout(() => input.focus(), 30);
    }

    function closeStickerGroupModal() {
        const modal = document.getElementById('sticker-group-modal');
        if (modal) modal.style.display = 'none';
    }

    async function saveStickerGroup() {
        const wechatOps = getWechatOps();
        const input = document.getElementById('sticker-group-name');
        if (!wechatOps || !input) return;
        const name = input.value.trim();
        if (!name) return;
        const id = await wechatOps.stickerGroups.add({ name, sortOrder: stickerRepoState.groups.length });
        stickerRepoState.activeGroupId = id;
        closeStickerGroupModal();
        await refreshStickerRepository();
    }

    async function deleteStickerGroup(groupId) {
        const wechatDb = getWechatDb();
        if (!wechatDb) return;
        cleanupStickerDrag(false);
        await wechatDb.transaction('rw', wechatDb.stickerGroups, wechatDb.stickers, async () => {
            await wechatDb.stickerGroups.delete(groupId);
            await wechatDb.stickers.where('groupId').equals(groupId).delete();
        });
        if (String(stickerRepoState.activeGroupId) === String(groupId)) {
            stickerRepoState.activeGroupId = null;
        }
        await refreshStickerRepository();
    }

    function populateStickerGroupSelect(selectedGroupId = stickerRepoState.activeGroupId) {
        const select = document.getElementById('sticker-group-select');
        if (!select) return;
        select.innerHTML = stickerRepoState.groups.map((group) => `
            <option value="${group.id}">${escapeStickerHtml(group.name || '\u672a\u547d\u540d')}</option>
        `).join('');
        if (selectedGroupId != null) {
            select.value = String(selectedGroupId);
        }
    }

    function openStickerAddModal() {
        const modal = document.getElementById('sticker-add-modal');
        const input = document.getElementById('sticker-bulk-input');
        if (!modal || !input || !stickerRepoState.groups.length) return;
        populateStickerGroupSelect();
        input.value = '';
        modal.style.display = 'flex';
        window.setTimeout(() => input.focus(), 30);
    }

    function closeStickerAddModal() {
        const modal = document.getElementById('sticker-add-modal');
        if (modal) modal.style.display = 'none';
    }

    function parseStickerLine(line) {
        const raw = String(line == null ? '' : line).replace(/\r/g, '').trim();
        if (!raw) return null;

        const colonMatch = raw.match(/^(.+?)\s*[:\uFF1A]\s*((?:https?:\/\/|data:image\/)\S+)\s*$/i);
        if (colonMatch && colonMatch[1] && colonMatch[2]) {
            return { description: colonMatch[1].trim(), url: colonMatch[2].trim() };
        }

        const spacedMatch = raw.match(/^(.+?)\s+((?:https?:\/\/|data:image\/)\S+)\s*$/i);
        if (spacedMatch && spacedMatch[1] && spacedMatch[2]) {
            return { description: spacedMatch[1].trim(), url: spacedMatch[2].trim() };
        }

        return null;
    }

    function parseStickerBulkInput(text) {
        const validItems = [];
        const invalidLines = [];
        String(text == null ? '' : text).split('\n').forEach((line, index) => {
            const trimmed = line.replace(/\r/g, '').trim();
            if (!trimmed) return;
            const parsed = parseStickerLine(trimmed);
            if (parsed) validItems.push(parsed);
            else invalidLines.push(index + 1);
        });
        return { validItems, invalidLines };
    }

    async function saveStickerItems() {
        const wechatOps = getWechatOps();
        const select = document.getElementById('sticker-group-select');
        const input = document.getElementById('sticker-bulk-input');
        if (!wechatOps || !select || !input) return;

        const groupId = Number(select.value);
        const { validItems, invalidLines } = parseStickerBulkInput(input.value);
        if (!validItems.length) {
            alert('Please enter at least one valid item.');
            return;
        }

        const existing = stickerRepoState.stickersByGroup.get(String(groupId)) || [];
        await wechatOps.stickers.bulkPut(validItems.map((item, index) => ({
            groupId,
            description: item.description,
            url: item.url,
            sortOrder: existing.length + index
        })));

        stickerRepoState.activeGroupId = groupId;
        closeStickerAddModal();
        await refreshStickerRepository();

        if (invalidLines.length) {
            alert(`Skipped invalid line${invalidLines.length > 1 ? 's' : ''}: ${invalidLines.join(', ')}`);
        }
    }

    async function deleteStickerItem(stickerId) {
        const wechatOps = getWechatOps();
        if (!wechatOps) return;
        cleanupStickerDrag(false);
        stickerRepoState.selectedStickerIds.delete(String(stickerId));
        await wechatOps.stickers.remove(stickerId);
        await refreshStickerRepository();
    }

    async function deleteSelectedStickerItems() {
        const wechatDb = getWechatDb();
        const targetIds = Array.from(stickerRepoState.selectedStickerIds).map((id) => Number(id)).filter((id) => Number.isFinite(id));
        if (!wechatDb || !targetIds.length) return;
        if (!window.confirm(`DELETE ${targetIds.length} SELECTED EMOTICON${targetIds.length > 1 ? 'S' : ''}?`)) return;
        cleanupStickerDrag(false);
        await wechatDb.transaction('rw', wechatDb.stickers, async () => {
            await wechatDb.stickers.bulkDelete(targetIds);
        });
        clearStickerSelection();
        await refreshStickerRepository();
    }

    async function deleteAllStickersInGroup() {
        const wechatDb = getWechatDb();
        const groupId = Number(stickerRepoState.activeGroupId);
        const count = getActiveStickerList().length;
        if (!wechatDb || !Number.isFinite(groupId) || count === 0) return;
        if (!window.confirm(`DELETE ALL ${count} EMOTICONS IN THIS GROUP?`)) return;
        cleanupStickerDrag(false);
        await wechatDb.transaction('rw', wechatDb.stickers, async () => {
            await wechatDb.stickers.where('groupId').equals(groupId).delete();
        });
        clearStickerSelection();
        await refreshStickerRepository();
    }

    function startStickerFabPress() {
        clearStickerFabPressTimer();
        stickerRepoState.fabLongPressTriggered = false;
        stickerRepoState.fabPressTimer = window.setTimeout(() => {
            stickerRepoState.fabLongPressTriggered = true;
            toggleStickerEditMode();
        }, 520);
    }

    function cancelStickerFabPress() {
        clearStickerFabPressTimer();
    }

    function handleStickerFabClick(event) {
        if (stickerRepoState.fabLongPressTriggered) {
            stickerRepoState.fabLongPressTriggered = false;
            event.preventDefault();
            return;
        }
        if (stickerRepoState.editMode) {
            setStickerEditMode(false);
            return;
        }
        openStickerAddModal();
    }

    function openStickerRepository() {
        const repoPage = document.getElementById('sticker-repo-page');
        if (!repoPage) return;
        repoPage.classList.add('active');
        void refreshStickerRepository();
    }

    function closeStickerRepository() {
        const repoPage = document.getElementById('sticker-repo-page');
        closeStickerAddModal();
        closeStickerGroupModal();
        setStickerEditMode(false);
        if (repoPage) repoPage.classList.remove('active');
    }

    window.openStickerRepository = openStickerRepository;
    window.closeStickerRepository = closeStickerRepository;

    // ================= DOM 绑定与初始化 =================
    document.addEventListener("DOMContentLoaded", async () => {
        updateDateTime();

        if (typeof Dexie !== 'undefined') {
            // --- WeChat Framework DB Init ---
            const wechatDb = window.MiniDB.databases.wechat;

            const editableTextIds = ['moments-name', 'moments-sign', 'profile-name', 'profile-id'];
            await Promise.all(editableTextIds.map(async (id) => {
                const value = await readWechatEditableText(id);
                if (value == null || value === '') return;
                const target = document.getElementById(id);
                if (target) target.textContent = value;
            }));

            const editableImageIds = ['moments-bg', 'moments-avatar', 'profile-avatar'];
            await Promise.all(editableImageIds.map(async (id) => {
                const dataUrl = await readWechatEditableImage(id);
                if (!dataUrl) return;
                const target = document.getElementById(id);
                if (target) target.style.backgroundImage = `url(${dataUrl})`;
            }));

            const imgModal = document.getElementById('ins-image-modal');
            const imgUrlInput = document.getElementById('ins-image-url');
            const imgFileInput = document.getElementById('ins-image-file');
            let currentImgTarget = null;
            let selectedFileBase64 = null;

            document.querySelectorAll('.edit-img').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    currentImgTarget = el.id;
                    imgModal.style.display = 'flex';
                    imgUrlInput.value = ''; 
                    imgFileInput.value = ''; 
                    selectedFileBase64 = null;
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
            document.getElementById('ins-image-save').addEventListener('click', async () => {
                if (!currentImgTarget) return;
                let finalUrl = selectedFileBase64 || imgUrlInput.value.trim();
                if (!finalUrl) { imgModal.style.display = 'none'; return; }
                const targetEl = document.getElementById(currentImgTarget);
                if (targetEl) {
                    targetEl.style.backgroundImage = `url(${finalUrl})`;
                    await writeWechatEditableImage(currentImgTarget, finalUrl);
                    imgModal.style.display = 'none';
                }
            });

            const textModal = document.getElementById('ins-text-modal');
            const textContentInput = document.getElementById('ins-text-content');
            let currentTextTarget = null;

            document.querySelectorAll('.edit-text').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    currentTextTarget = el.id;
                    textContentInput.value = el.textContent.trim();
                    textModal.style.display = 'flex';
                    textContentInput.focus();
                });
            });
            document.getElementById('ins-text-cancel').addEventListener('click', () => textModal.style.display = 'none');
            document.getElementById('ins-text-save').addEventListener('click', async () => {
                if (!currentTextTarget) return;
                const newContent = textContentInput.value.trim();
                if (!newContent) { textModal.style.display = 'none'; return; }
                const targetEl = document.getElementById(currentTextTarget);
                if (targetEl) {
                    targetEl.textContent = newContent;
                    await writeWechatEditableText(currentTextTarget, newContent);
                    textModal.style.display = 'none';
                }
            });

            document.querySelectorAll('.ins-modal-overlay').forEach(overlay => {
                overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.style.display = 'none'; });
            });

            const stickerRepoEntry = document.getElementById('sticker-repo-entry');
            const stickerFab = document.getElementById('sticker-add-fab');
            const stickerGroupCancel = document.getElementById('sticker-group-cancel');
            const stickerGroupSave = document.getElementById('sticker-group-save');
            const stickerAddCancel = document.getElementById('sticker-add-cancel');
            const stickerAddSave = document.getElementById('sticker-add-save');
            const stickerDeleteSelected = document.getElementById('sticker-delete-selected-btn');
            const stickerDeleteAll = document.getElementById('sticker-delete-all-btn');

            if (stickerRepoEntry) {
                stickerRepoEntry.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openStickerRepository();
                });
            }

            if (stickerFab) {
                stickerFab.addEventListener('pointerdown', startStickerFabPress);
                stickerFab.addEventListener('pointerup', cancelStickerFabPress);
                stickerFab.addEventListener('pointerleave', cancelStickerFabPress);
                stickerFab.addEventListener('pointercancel', cancelStickerFabPress);
                stickerFab.addEventListener('click', handleStickerFabClick);
            }

            if (stickerGroupCancel) stickerGroupCancel.addEventListener('click', closeStickerGroupModal);
            if (stickerGroupSave) stickerGroupSave.addEventListener('click', () => { void saveStickerGroup(); });
            if (stickerAddCancel) stickerAddCancel.addEventListener('click', closeStickerAddModal);
            if (stickerAddSave) stickerAddSave.addEventListener('click', () => { void saveStickerItems(); });
            if (stickerDeleteSelected) stickerDeleteSelected.addEventListener('click', () => { void deleteSelectedStickerItems(); });
            if (stickerDeleteAll) stickerDeleteAll.addEventListener('click', () => { void deleteAllStickersInGroup(); });

            await refreshStickerRepository();

            // Chat avatars now follow Contacts and Masks data via runtime.js.

            // 面板切换逻辑
            const extPanel = document.getElementById('ext-panel');
            const triggerExt = document.getElementById('trigger-ext');
            const pager = document.getElementById('ext-pager');
            const dots = document.querySelectorAll('.dot');

            if(triggerExt) {
                triggerExt.onclick = (e) => {
                    e.stopPropagation();
                    extPanel.style.display = extPanel.style.display === 'flex' ? 'none' : 'flex';
                };
            }

            if(pager) {
                pager.onscroll = () => {
                    const idx = Math.round(pager.scrollLeft / pager.offsetWidth);
                    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
                };
            }

            // 心声卡片触发
            const headerTitleBtn = document.getElementById('header-title-btn');
            const voiceOverlay = document.getElementById('voice-overlay');

            if(headerTitleBtn) {
                headerTitleBtn.onclick = (e) => {
                    e.stopPropagation();
                    voiceOverlay.classList.add('show');
                };
            }

            // 全局点击处理 (收起面板/弹窗)
            document.addEventListener('click', (e) => {
                if(extPanel && !extPanel.contains(e.target) && e.target !== triggerExt && !triggerExt.contains(e.target)) {
                    extPanel.style.display = 'none';
                }
                if(voiceOverlay && e.target === voiceOverlay) {
                    voiceOverlay.classList.remove('show');
                }
            });
        }
    });

(function () {
  const route = "wechat";
  const placeholderUrl = "../assets/初始占位图.png";
  const placeholderSelectors = [".chat-avatar","#moments-bg","#moments-avatar",".feed-avatar",".feed-image-box","#profile-avatar",".chat-avatar-target",".profile-avatar-big",".msg-avatar",".w-voice-photo"];
  const bindings = [{"selector":".feature-list .feature-item:nth-child(1)","action":"open","target":"wechat_assets"},{"selector":".feature-list .feature-item:nth-child(2)","action":"open","target":"wechat_masks"}];
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
