(function() {
    'use strict';

    // ===== STATE =====
    const state = {
        lang: localStorage.getItem('nectar_lang') || 'ru',
        currentPage: 'page-home',
        menuCategory: null,
        drinkCategory: null,
        detailMode: false,
    };

    // ===== DOM REFS =====
    const $ = (sel, ctx) => (ctx || document).querySelector(sel);
    const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

    const pages = $$('.page');
    const navItems = $$('.nav-item');
    const langBtns = $$('.lang-btn');
    const menuCategories = $('#menuCategories');
    const menuItems = $('#menuItems');
    const menuDetail = $('#menuDetail');
    const detailContent = $('#detailContent');
    const drinkCategories = $('#drinkCategories');
    const drinkItems = $('#drinkItems');
    const drinkDetail = $('#drinkDetail');
    const drinkDetailContent = $('#drinkDetailContent');
    const menuSearch = $('#menuSearch');
    const drinkSearch = $('#drinkSearch');

    // ===== I18N =====
    const i18n = {
        ru: {
            home_welcome: 'Добро пожаловать в NECTAR — место для встреч, уюта и хорошего вечера в Алматы.',
            nav_home: 'Главная',
            nav_menu: 'Меню',
            nav_drinks: 'Напитки',
            nav_about: 'О NECTAR',
            nav_info: 'Информация',
            nav_contacts: 'Контакты',
            search_placeholder: 'Поиск...',
            contact_call: 'Позвонить',
            contact_2gis: 'Открыть в 2GIS',
            about_soon: 'Скоро здесь появится информация о заведении, нашей истории и концепции.',
            info_soon: 'Информация для гостей будет добавлена позже.',
            detail_output: 'Выход',
            detail_composition: 'Состав',
            detail_empty: '—',
        },
        kz: {
            home_welcome: 'NECTAR-ға қош келдіңіз — Алматыдағы кездесулер, жайлылық пен кеш үшін орын.',
            nav_home: 'Басты',
            nav_menu: 'Мәзір',
            nav_drinks: 'Сусындар',
            nav_about: 'NECTAR туралы',
            nav_info: 'Қонақтарға арналған',
            nav_contacts: 'Байланыс',
            search_placeholder: 'Іздеу...',
            contact_call: 'Қоңырау шалу',
            contact_2gis: '2GIS-те ашу',
            about_soon: 'Жақында мекеме, тарих және тұжырымдама туралы ақпарат пайда болады.',
            info_soon: 'Қонақтарға арналған ақпарат кейін қосылады.',
            detail_output: 'Шығым',
            detail_composition: 'Құрамы',
            detail_empty: '—',
        },
        en: {
            home_welcome: 'Welcome to NECTAR — a place for gatherings, comfort, and a good evening in Almaty.',
            nav_home: 'Home',
            nav_menu: 'Menu',
            nav_drinks: 'Drinks',
            nav_about: 'About NECTAR',
            nav_info: 'Guest Info',
            nav_contacts: 'Contacts',
            search_placeholder: 'Search...',
            contact_call: 'Call',
            contact_2gis: 'Open in 2GIS',
            about_soon: 'Information about the venue, our story, and concept will appear here soon.',
            info_soon: 'Guest information will be added later.',
            detail_output: 'Yield',
            detail_composition: 'Composition',
            detail_empty: '—',
        }
    };

    function t(key) {
        const langData = i18n[state.lang] || i18n.ru;
        return langData[key] || key;
    }

    function applyI18n() {
        $$('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });
        $$('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = t(key);
        });
        langBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === state.lang);
        });
    }

    // ===== NAVIGATION =====
    function showPage(pageId) {
        pages.forEach(p => p.classList.remove('active'));
        const target = document.getElementById(pageId);
        if (target) target.classList.add('active');
        state.currentPage = pageId;

        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageId);
        });

        closeDetails();

        if (pageId === 'page-menu') renderMenu();
        if (pageId === 'page-drinks') renderDrinks();
    }

    function closeDetails() {
        menuDetail.style.display = 'none';
        menuItems.style.display = 'flex';
        drinkDetail.style.display = 'none';
        drinkItems.style.display = 'flex';
        state.detailMode = false;
    }

    // ===== RENDER MENU =====
    function renderMenu(category) {
        if (!category) {
            const cats = getMenuCategories();
            if (cats.length) {
                category = state.menuCategory || cats[0];
                state.menuCategory = category;
            }
        } else {
            state.menuCategory = category;
        }
        renderMenuCategories(category);
        renderMenuItems(category);
    }

    function getMenuCategories() {
        if (typeof MENU_DATA === 'undefined') return [];
        return Object.keys(MENU_DATA);
    }

    function renderMenuCategories(activeCat) {
        const cats = getMenuCategories();
        const lang = state.lang;
        menuCategories.innerHTML = cats.map(cat => {
            const label = MENU_DATA[cat][lang] || MENU_DATA[cat]['ru'];
            return `<button class="cat-btn ${cat === activeCat ? 'active' : ''}" data-cat="${cat}">${label}</button>`;
        }).join('');
        menuCategories.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                renderMenu(btn.dataset.cat);
                menuSearch.value = '';
            });
        });
    }

    function renderMenuItems(category) {
        const lang = state.lang;
        const categoryData = MENU_DATA[category];
        if (!categoryData) return;
        
        const items = categoryData.items || [];
        const q = menuSearch.value.toLowerCase().trim();

        let filtered = items;
        if (q) {
            filtered = items.filter(item => {
                const name = item.name[lang] || item.name['ru'];
                const comp = item.composition || '';
                return name.toLowerCase().includes(q) || comp.toLowerCase().includes(q);
            });
        }

        if (!filtered.length) {
            menuItems.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-light);">${q ? 'Ничего не найдено' : 'Нет блюд в этой категории'}</div>`;
            return;
        }

        menuItems.innerHTML = filtered.map(item => {
            const name = item.name[lang] || item.name['ru'];
            return `
                <div class="menu-item" data-item-id="${item.id}">
                    <div>
                        <div class="menu-item-name">${name}</div>
                        ${item.sub ? `<div class="menu-item-sub">${item.sub[lang] || item.sub['ru'] || ''}</div>` : ''}
                    </div>
                    <div class="menu-item-price">${item.price} ₸</div>
                </div>
            `;
        }).join('');

        menuItems.querySelectorAll('.menu-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = parseInt(el.dataset.itemId);
                showMenuDetail(id);
            });
        });
    }

    function showMenuDetail(id) {
        const allItems = [];
        if (typeof MENU_DATA !== 'undefined') {
            Object.values(MENU_DATA).forEach(cat => {
                if (cat.items) allItems.push(...cat.items);
            });
        }
        const item = allItems.find(i => i.id === id);
        if (!item) return;

        menuItems.style.display = 'none';
        menuDetail.style.display = 'block';
        state.detailMode = true;

        const lang = state.lang;
        const name = item.name[lang] || item.name['ru'];
        const price = item.price;
        const output = item.output || '—';
        const composition = item.composition || '—';

        detailContent.innerHTML = `
            <div class="detail-title">${name}</div>
            <div class="detail-price">${price} ₸</div>
            <div class="detail-label">${t('detail_output')}</div>
            <div class="detail-value">${output}</div>
            <div class="detail-label">${t('detail_composition')}</div>
            <div class="detail-value">${composition}</div>
        `;
    }

    // ===== RENDER DRINKS =====
    function renderDrinks(category) {
        if (!category) {
            const cats = getDrinkCategories();
            if (cats.length) {
                category = state.drinkCategory || cats[0];
                state.drinkCategory = category;
            }
        } else {
            state.drinkCategory = category;
        }
        renderDrinkCategories(category);
        renderDrinkItems(category);
    }

    function getDrinkCategories() {
        if (typeof DRINKS_DATA === 'undefined') return [];
        return Object.keys(DRINKS_DATA);
    }

    function renderDrinkCategories(activeCat) {
        const cats = getDrinkCategories();
        const lang = state.lang;
        drinkCategories.innerHTML = cats.map(cat => {
            const label = DRINKS_DATA[cat][lang] || DRINKS_DATA[cat]['ru'];
            return `<button class="cat-btn ${cat === activeCat ? 'active' : ''}" data-cat="${cat}">${label}</button>`;
        }).join('');
        drinkCategories.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                renderDrinks(btn.dataset.cat);
                drinkSearch.value = '';
            });
        });
    }

    function renderDrinkItems(category) {
        const lang = state.lang;
        const categoryData = DRINKS_DATA[category];
        if (!categoryData) return;
        
        const items = categoryData.items || [];
        const q = drinkSearch.value.toLowerCase().trim();

        let filtered = items;
        if (q) {
            filtered = items.filter(item => {
                const name = item.name[lang] || item.name['ru'];
                const sub = item.sub ? (item.sub[lang] || item.sub['ru'] || '') : '';
                return name.toLowerCase().includes(q) || sub.toLowerCase().includes(q);
            });
        }

        if (!filtered.length) {
            drinkItems.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-light);">${q ? 'Ничего не найдено' : 'Нет напитков в этой категории'}</div>`;
            return;
        }

        drinkItems.innerHTML = filtered.map(item => {
            const name = item.name[lang] || item.name['ru'];
            const sub = item.sub ? (item.sub[lang] || item.sub['ru'] || '') : '';
            return `
                <div class="menu-item" data-drink-id="${item.id}">
                    <div>
                        <div class="menu-item-name">${name}</div>
                        ${sub ? `<div class="menu-item-sub">${sub}</div>` : ''}
                    </div>
                    <div class="menu-item-price">${item.price} ₸</div>
                </div>
            `;
        }).join('');

        drinkItems.querySelectorAll('.menu-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = parseInt(el.dataset.drinkId);
                showDrinkDetail(id);
            });
        });
    }

    function showDrinkDetail(id) {
        const allItems = [];
        if (typeof DRINKS_DATA !== 'undefined') {
            Object.values(DRINKS_DATA).forEach(cat => {
                if (cat.items) allItems.push(...cat.items);
            });
        }
        const item = allItems.find(i => i.id === id);
        if (!item) return;

        drinkItems.style.display = 'none';
        drinkDetail.style.display = 'block';
        state.detailMode = true;

        const lang = state.lang;
        const name = item.name[lang] || item.name['ru'];
        const price = item.price;
        const sub = item.sub ? (item.sub[lang] || item.sub['ru'] || '') : '';

        drinkDetailContent.innerHTML = `
            <div class="detail-title">${name}</div>
            ${sub ? `<div style="color:var(--text-light);font-size:0.9rem;margin-bottom:6px;">${sub}</div>` : ''}
            <div class="detail-price">${price} ₸</div>
        `;
    }

    // ===== EVENTS =====

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            state.lang = lang;
            localStorage.setItem('nectar_lang', lang);
            applyI18n();
            if (state.currentPage === 'page-menu') renderMenu(state.menuCategory);
            if (state.currentPage === 'page-drinks') renderDrinks(state.drinkCategory);
            if (state.currentPage === 'page-home') showPage('page-home');
            if (state.currentPage === 'page-about') showPage('page-about');
            if (state.currentPage === 'page-info') showPage('page-info');
            if (state.currentPage === 'page-contacts') showPage('page-contacts');
        });
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.dataset.page;
            if (pageId !== state.currentPage) {
                showPage(pageId);
            }
        });
    });

    document.addEventListener('click', (e) => {
        const backBtn = e.target.closest('[data-back]');
        if (backBtn) {
            if (state.currentPage === 'page-menu' || state.currentPage === 'page-drinks') {
                if (state.detailMode) {
                    closeDetails();
                } else {
                    showPage('page-home');
                }
            } else {
                showPage('page-home');
            }
        }

        const backDetail = e.target.closest('[data-back-detail]');
        if (backDetail) {
            closeDetails();
        }
    });

    document.querySelector('[data-action="menu"]')?.addEventListener('click', () => {
        showPage('page-menu');
    });

    menuSearch.addEventListener('input', () => {
        if (state.currentPage === 'page-menu') {
            if (state.detailMode) closeDetails();
            renderMenu(state.menuCategory);
        }
    });

    drinkSearch.addEventListener('input', () => {
        if (state.currentPage === 'page-drinks') {
            if (state.detailMode) closeDetails();
            renderDrinks(state.drinkCategory);
        }
    });

    // ===== INIT =====
    applyI18n();
    showPage('page-home');

    if (typeof MENU_DATA === 'undefined' || !Object.keys(MENU_DATA).length) {
        menuCategories.innerHTML = '<div style="padding:12px 0;color:var(--text-light);">Меню загружается...</div>';
    }

    if (typeof DRINKS_DATA === 'undefined' || !Object.keys(DRINKS_DATA).length) {
        drinkCategories.innerHTML = '<div style="padding:12px 0;color:var(--text-light);">Напитки загружаются...</div>';
    }

})();