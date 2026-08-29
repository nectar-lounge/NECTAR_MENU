(() => {
  'use strict';

  /* =====================================================
     DOM helpers
     ===================================================== */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /* =====================================================
     Single source of UI state
     ===================================================== */

  const state = {
    lang: 'RU',
    section: 'menu',
    type: 'kitchen',
    categoryId: null,
    query: '',

    sectionScroll: {
      menu: 0,
      info: 0
    },

    modal: {
      open: false,
      closing: false,
      scrollY: 0,
      previousFocus: null,
      closeTimer: 0
    },

    searchTimer: 0,
    revealPlayed: false,
    scrollRaf: 0,
    suppressCategorySpyUntil: 0,
    categoryObserver: null
  };

  const SEARCH_DEBOUNCE_MS = 180;
  const MODAL_ANIMATION_MS = 260;

  // Bar is intentionally limited to the non-alcoholic categories requested.
  const ALLOWED_BAR_CATEGORY_IDS = new Set(['lemonades', 'tea']);
  const ALLOWED_BAR_CATEGORY_NAMES = new Set([
    'лимонады', 'лимонадтар', 'lemonades',
    'чай', 'шай', 'tea'
  ]);

  /* =====================================================
     Data helpers
     ===================================================== */

  function getMenu() {
    return typeof MENU !== 'undefined' && Array.isArray(MENU) ? MENU : [];
  }

  function getTranslations() {
    return typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS ? TRANSLATIONS : {};
  }

  function t(key, fallback = '') {
    return getTranslations()?.[state.lang]?.[key] ?? fallback;
  }

  function langKey(prefix) {
    return `${prefix}_${state.lang.toLowerCase()}`;
  }

  function itemName(item) {
    return item?.[langKey('name')] || item?.name_ru || item?.name_en || '';
  }

  function itemCategory(item) {
    return item?.[langKey('category')] || item?.category_ru || item?.category_en || '';
  }

  function itemComposition(item) {
    return item?.[langKey('composition')] || item?.composition_ru || item?.composition_en || '';
  }

  function normalize(value, locale = 'ru') {
    return String(value ?? '')
      .toLocaleLowerCase(locale)
      .normalize('NFKC')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function currentLocale() {
    if (state.lang === 'KZ') return 'kk';
    if (state.lang === 'EN') return 'en';
    return 'ru';
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatPrice(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return escapeHtml(value);

    const locale = state.lang === 'KZ'
      ? 'kk-KZ'
      : state.lang === 'EN'
        ? 'en-US'
        : 'ru-RU';

    return new Intl.NumberFormat(locale).format(number);
  }

  function categoryIdOf(item) {
    const explicit = String(item?.category_id || '').trim();
    if (explicit) return explicit;

    // Stable fallback for legacy data without category_id.
    const seed = item?.category_ru || item?.category_en || itemCategory(item) || 'uncategorized';
    return `legacy-${normalize(seed, 'ru')
      .replace(/[^a-zа-яё0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')}`;
  }

  function isAllowedBarItem(item) {
    if (item?.type !== 'bar') return false;

    const explicitId = normalize(item.category_id, 'en');
    if (ALLOWED_BAR_CATEGORY_IDS.has(explicitId)) return true;

    const categoryNames = [item.category_ru, item.category_kz, item.category_en]
      .map(value => normalize(value, 'ru'))
      .filter(Boolean);

    return categoryNames.some(name => ALLOWED_BAR_CATEGORY_NAMES.has(name));
  }

  function visibleMenu() {
    return getMenu().filter(item => item?.type === 'kitchen' || isAllowedBarItem(item));
  }

  function itemsForType(type = state.type) {
    return visibleMenu().filter(item => item?.type === type);
  }

  function categoriesForType(type = state.type) {
    const seen = new Set();
    const categories = [];

    for (const item of itemsForType(type)) {
      const id = categoryIdOf(item);
      if (seen.has(id)) continue;
      seen.add(id);
      categories.push({ id, name: itemCategory(item) || id });
    }

    return categories;
  }

  function firstCategoryId(type = state.type) {
    return categoriesForType(type)[0]?.id || null;
  }

  function typeLabel(type) {
    return type === 'bar' ? t('nav_bar', 'БАР') : t('nav_kitchen', 'КУХНЯ');
  }

  /* =====================================================
     Translation + language UI
     ===================================================== */

  function applyTranslations() {
    document.documentElement.lang = state.lang === 'KZ' ? 'kk' : state.lang.toLowerCase();

    $$('[data-i18n]').forEach(element => {
      const value = t(element.dataset.i18n);
      if (value !== undefined && value !== '') element.textContent = value;
    });

    $$('[data-i18n-placeholder]').forEach(element => {
      const value = t(element.dataset.i18nPlaceholder);
      if (value) element.setAttribute('placeholder', value);
    });

    $$('.lang-btn').forEach(button => {
      const active = button.dataset.lang === state.lang;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function switchLang(lang) {
    if (!getTranslations()[lang] || lang === state.lang) return;

    state.lang = lang;
    state.query = '';
    state.categoryId = firstCategoryId(state.type);

    const input = $('#searchInput');
    if (input) input.value = '';

    clearTimeout(state.searchTimer);
    updateSearchClear();
    applyTranslations();
    updateMainTabs();
    renderCategories();
    renderMenu();

    requestAnimationFrame(() => {
      scrollToCategory(state.categoryId, 'auto');
    });
  }

  /* =====================================================
     Main Kitchen / Bar tabs
     ===================================================== */

  function updateMainTabs() {
    $$('.main-tab').forEach(button => {
      const active = button.dataset.type === state.type;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });

    const indicator = $('#mainTabsIndicator');
    if (indicator) {
      indicator.style.transform = state.type === 'bar' ? 'translateX(100%)' : 'translateX(0)';
    }
  }

  function setType(type) {
    if (!['kitchen', 'bar'].includes(type) || type === state.type) return;

    state.type = type;
    state.query = '';
    state.categoryId = firstCategoryId(type);

    const input = $('#searchInput');
    if (input) input.value = '';

    clearTimeout(state.searchTimer);
    updateSearchClear();
    updateMainTabs();
    renderCategories();
    renderMenu();

    requestAnimationFrame(() => {
      scrollToCategory(state.categoryId, 'smooth');
    });
  }

  /* =====================================================
     Category navigation
     ===================================================== */

  function renderCategories() {
    const strip = $('#categoryStrip');
    if (!strip) return;

    const categories = categoriesForType();

    if (!categories.some(category => category.id === state.categoryId)) {
      state.categoryId = categories[0]?.id || null;
    }

    const fragment = document.createDocumentFragment();

    for (const category of categories) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'category-tab';
      button.dataset.categoryId = category.id;
      button.textContent = category.name;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(category.id === state.categoryId));
      fragment.appendChild(button);
    }

    strip.replaceChildren(fragment);
    updateCategoryTabs(state.categoryId, false);
  }

  function centerCategoryTab(button, behavior = 'smooth') {
    const strip = $('#categoryStrip');
    if (!strip || !button) return;

    const maxLeft = Math.max(0, strip.scrollWidth - strip.clientWidth);
    const desiredLeft = button.offsetLeft - (strip.clientWidth - button.offsetWidth) / 2;
    const left = Math.max(0, Math.min(maxLeft, desiredLeft));

    // Horizontal-only scroll avoids scrollIntoView moving the whole page vertically.
    strip.scrollTo({ left, behavior });
  }

  function updateCategoryTabs(categoryId, center = true) {
    let activeButton = null;

    $$('.category-tab').forEach(button => {
      const active = button.dataset.categoryId === categoryId;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      if (active) activeButton = button;
    });

    if (center && activeButton) centerCategoryTab(activeButton, 'smooth');
  }

  function controlsOffset() {
    const headerHeight = $('#siteHeader')?.getBoundingClientRect().height || 0;
    const controlsHeight = $('#menuControls')?.getBoundingClientRect().height || 0;
    return headerHeight + controlsHeight + 14;
  }

  function scrollToCategory(categoryId, behavior = 'smooth') {
    if (!categoryId || normalize(state.query, currentLocale())) return;

    const target = $$('[data-category-section]', $('#menuContainer'))
      .find(section => section.dataset.categorySection === String(categoryId));

    if (!target) return;

    const top = Math.max(
      0,
      target.getBoundingClientRect().top + window.scrollY - controlsOffset()
    );

    state.suppressCategorySpyUntil = Date.now() + (behavior === 'smooth' ? 900 : 160);
    window.scrollTo({ top, behavior });
  }

  function selectCategory(categoryId) {
    if (!categoriesForType().some(category => category.id === categoryId)) return;

    state.categoryId = categoryId;
    updateCategoryTabs(categoryId, true);
    scrollToCategory(categoryId, 'smooth');
  }

  function disconnectCategoryObserver() {
    if (!state.categoryObserver) return;
    state.categoryObserver.disconnect();
    state.categoryObserver = null;
  }

  function setupCategoryObserver() {
    disconnectCategoryObserver();

    if (!('IntersectionObserver' in window) || normalize(state.query, currentLocale())) return;

    const sections = $$('[data-category-section]', $('#menuContainer'));
    if (!sections.length) return;

    // The observer is used as a lightweight signal. The final active section
    // is calculated by the deterministic marker-based function below.
    state.categoryObserver = new IntersectionObserver(
      () => scheduleCategorySpy(),
      {
        root: null,
        rootMargin: `-${Math.round(controlsOffset())}px 0px -55% 0px`,
        threshold: 0
      }
    );

    sections.forEach(section => state.categoryObserver.observe(section));
  }

  function updateActiveCategoryFromScroll() {
    if (
      state.section !== 'menu' ||
      normalize(state.query, currentLocale()) ||
      state.modal.open ||
      Date.now() < state.suppressCategorySpyUntil
    ) {
      return;
    }

    const container = $('#menuContainer');
    const sections = $$('[data-category-section]', container);
    if (!sections.length) return;

    const marker = controlsOffset() + 10;
    let activeId = sections[0].dataset.categorySection;

    // Pick the last section whose heading has crossed the marker.
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= marker) {
        activeId = section.dataset.categorySection;
      } else {
        break;
      }
    }

    if (activeId && activeId !== state.categoryId) {
      state.categoryId = activeId;
      updateCategoryTabs(activeId, true);
    }
  }

  function scheduleCategorySpy() {
    if (state.scrollRaf) return;

    state.scrollRaf = requestAnimationFrame(() => {
      state.scrollRaf = 0;
      updateActiveCategoryFromScroll();
    });
  }

  /* =====================================================
     Menu rendering
     ===================================================== */

  function makeMenuCard(item) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'menu-card';
    button.dataset.itemId = String(item?.id ?? '');
    button.setAttribute('aria-label', itemName(item) || 'Menu item');

    const spicy = normalize(item?.note, 'ru').includes('остр');

    button.innerHTML = `
      <span class="menu-card__title-wrap">
        <span class="menu-card__title">${escapeHtml(itemName(item) || '—')}</span>
        ${spicy ? '<span class="material-symbols-outlined menu-card__spicy" aria-label="spicy">local_fire_department</span>' : ''}
        <span class="material-symbols-outlined menu-card__info" aria-hidden="true">info</span>
      </span>
      <span class="menu-card__price">${formatPrice(item?.price)} <small>₸</small></span>
    `;

    return button;
  }

  function normalGroups(items) {
    const groups = [];
    const map = new Map();

    for (const item of items) {
      const id = categoryIdOf(item);

      if (!map.has(id)) {
        const group = {
          key: id,
          categoryId: id,
          type: item.type,
          title: itemCategory(item) || id,
          items: []
        };

        map.set(id, group);
        groups.push(group);
      }

      map.get(id).items.push(item);
    }

    return groups;
  }

  function searchGroups(items) {
    const groups = [];
    const map = new Map();

    for (const item of items) {
      const categoryId = categoryIdOf(item);
      const key = `${item.type}::${categoryId}`;

      if (!map.has(key)) {
        const group = {
          key,
          categoryId,
          type: item.type,
          title: `${typeLabel(item.type)} · ${itemCategory(item) || categoryId}`,
          items: []
        };

        map.set(key, group);
        groups.push(group);
      }

      map.get(key).items.push(item);
    }

    return groups;
  }

  function matchesSearch(item, query) {
    const fields = [
      itemName(item), itemComposition(item), itemCategory(item),
      item?.name_ru, item?.name_kz, item?.name_en,
      item?.composition_ru, item?.composition_kz, item?.composition_en,
      item?.category_ru, item?.category_kz, item?.category_en
    ];

    return fields.some(field => normalize(field, currentLocale()).includes(query));
  }

  function filteredItems() {
    const query = normalize(state.query, currentLocale());
    if (!query) return itemsForType();
    return visibleMenu().filter(item => matchesSearch(item, query));
  }

  function renderMenu({ reveal = false } = {}) {
    const container = $('#menuContainer');
    const categoryStrip = $('#categoryStrip');
    const searchNote = $('#searchModeNote');

    if (!container) return;

    disconnectCategoryObserver();

    const query = normalize(state.query, currentLocale());
    const items = filteredItems();

    if (categoryStrip) categoryStrip.hidden = Boolean(query);

    if (searchNote) {
      searchNote.hidden = !query;
      searchNote.textContent = query
        ? state.lang === 'EN'
          ? 'Search across Kitchen and Bar'
          : state.lang === 'KZ'
            ? 'Асхана мен Бар бойынша іздеу'
            : 'Поиск по Кухне и Бару'
        : '';
    }

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = `
        <strong>${escapeHtml(t('nothing_found', 'Ничего не найдено'))}</strong>
        <span>${escapeHtml(t('try_another_search', 'Попробуйте изменить запрос.'))}</span>
      `;
      container.replaceChildren(empty);
      updateCategoryTabs(null, false);
      return;
    }

    const groups = query ? searchGroups(items) : normalGroups(items);
    const fragment = document.createDocumentFragment();

    groups.forEach((group, groupIndex) => {
      const section = document.createElement('section');
      section.className = 'category-section';
      section.dataset.groupType = group.type;

      if (!query) {
        section.dataset.categorySection = group.categoryId;
      }

      if (reveal && !state.revealPlayed) {
        section.classList.add('reveal-once');
        section.style.setProperty('--reveal-delay', `${Math.min(groupIndex * 70, 350)}ms`);
      }

      const heading = document.createElement('div');
      heading.className = 'category-heading';
      heading.innerHTML = `<span></span><h2>${escapeHtml(group.title)}</h2><span></span>`;

      const list = document.createElement('div');
      list.className = 'menu-list';

      for (const item of group.items) {
        list.appendChild(makeMenuCard(item));
      }

      section.append(heading, list);
      fragment.appendChild(section);
    });

    container.replaceChildren(fragment);

    if (reveal && !state.revealPlayed) {
      requestAnimationFrame(() => {
        $$('.reveal-once', container).forEach(section => section.classList.add('is-revealed'));
        state.revealPlayed = true;
      });
    }

    if (!query) {
      requestAnimationFrame(() => {
        setupCategoryObserver();
        updateActiveCategoryFromScroll();
      });
    }
  }

  /* =====================================================
     Search
     ===================================================== */

  function updateSearchClear() {
    const button = $('#clearSearchBtn');
    if (!button) return;
    button.hidden = !normalize($('#searchInput')?.value, currentLocale());
  }

  function setSearch(value) {
    const wasSearching = Boolean(normalize(state.query, currentLocale()));
    state.query = value;
    const isSearching = Boolean(normalize(state.query, currentLocale()));

    renderMenu();

    // When a search starts, keep the controls stable and make sure result 1
    // is not hidden behind the sticky controls. This is an instant correction,
    // not a page reset.
    if (!wasSearching && isSearching) {
      requestAnimationFrame(() => {
        const menuTop = $('#menuContainer')?.getBoundingClientRect().top ?? 0;
        const marker = controlsOffset();
        if (menuTop < marker - 4) {
          window.scrollBy({ top: menuTop - marker + 4, behavior: 'auto' });
        }
      });
    }
  }

  function clearSearch({ focus = true } = {}) {
    const input = $('#searchInput');
    if (input) input.value = '';

    clearTimeout(state.searchTimer);
    state.query = '';
    state.categoryId = firstCategoryId(state.type);

    updateSearchClear();
    renderCategories();
    renderMenu();

    requestAnimationFrame(() => scrollToCategory(state.categoryId, 'smooth'));

    if (focus) input?.focus({ preventScroll: true });
  }

  /* =====================================================
     Menu / Info section switching
     ===================================================== */

  function rememberSectionScroll() {
    state.sectionScroll[state.section] = window.scrollY;
  }

  function switchSection(section) {
    if (!['menu', 'info'].includes(section) || section === state.section || state.modal.open) return;

    rememberSectionScroll();
    state.section = section;

    $('#menu-section')?.classList.toggle('is-active', section === 'menu');
    $('#info-section')?.classList.toggle('is-active', section === 'info');

    $$('.bottom-nav__button').forEach(button => {
      const active = button.dataset.path === section;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });

    const y = state.sectionScroll[section] || 0;

    requestAnimationFrame(() => {
      instantScrollTo(y);
      if (section === 'menu') scheduleCategorySpy();
    });
  }

  /* =====================================================
     Modal: reliable body lock + exact scroll restore
     ===================================================== */

  function instantScrollTo(y) {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, Math.max(0, y));

    requestAnimationFrame(() => {
      root.style.scrollBehavior = previous;
    });
  }

  function lockPageAtCurrentScroll() {
    const y = window.scrollY;
    state.modal.scrollY = y;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${y}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.classList.add('modal-open');
  }

  function unlockPageAndRestoreScroll() {
    const y = state.modal.scrollY;

    document.body.classList.remove('modal-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';

    // Restored before focus to prevent iOS/Chrome from deciding where to scroll.
    instantScrollTo(y);
    state.sectionScroll[state.section] = y;
  }

  function openModal(item) {
    if (state.modal.open || state.modal.closing || !item) return;

    const modal = $('#itemModal');
    if (!modal) return;

    state.modal.open = true;
    state.modal.previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    $('#modalTitle').textContent = itemName(item) || '—';
    $('#modalPrice').innerHTML = `${formatPrice(item?.price)} <small>₸</small>`;
    $('#modalWeight').textContent = item?.weight || '';

    const composition = itemComposition(item);
    const ingredients = $('#modalIngredientsContainer');
    const ingredientsText = $('#modalIngredients');

    if (ingredientsText) ingredientsText.textContent = composition;
    if (ingredients) ingredients.hidden = !composition;

    const imageWrap = $('#modalImageContainer');
    const image = $('#modalImage');

    if (item?.image && image && imageWrap) {
      image.src = item.image;
      image.alt = itemName(item);
      imageWrap.hidden = false;
    } else if (image && imageWrap) {
      image.removeAttribute('src');
      image.alt = '';
      imageWrap.hidden = true;
    }

    lockPageAtCurrentScroll();
    modal.hidden = false;

    requestAnimationFrame(() => {
      modal.classList.add('is-open');
      $('#modalCloseButton')?.focus({ preventScroll: true });
    });
  }

  function closeModal() {
    const modal = $('#itemModal');
    if (!modal || !state.modal.open || state.modal.closing) return;

    state.modal.closing = true;
    modal.classList.remove('is-open');

    clearTimeout(state.modal.closeTimer);
    state.modal.closeTimer = window.setTimeout(() => {
      modal.hidden = true;
      unlockPageAndRestoreScroll();

      const previousFocus = state.modal.previousFocus;
      state.modal.previousFocus = null;
      state.modal.open = false;
      state.modal.closing = false;

      requestAnimationFrame(() => {
        previousFocus?.focus?.({ preventScroll: true });
      });
    }, MODAL_ANIMATION_MS);
  }

  function trapModalFocus(event) {
    if (!state.modal.open || event.key !== 'Tab') return;

    const dialog = $('#modalDialog');
    if (!dialog) return;

    const focusables = $$(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      dialog
    ).filter(element => !element.hidden && element.offsetParent !== null);

    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* =====================================================
     Info accordion
     ===================================================== */

  function toggleAccordion(button) {
    const panel = button.nextElementSibling;
    if (!panel) return;

    const wasOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!wasOpen));
    button.classList.toggle('is-open', !wasOpen);
    panel.hidden = wasOpen;
  }

  /* =====================================================
     Event handling
     ===================================================== */

  function onWindowScroll() {
    if (state.modal.open) return;

    state.sectionScroll[state.section] = window.scrollY;
    scheduleCategorySpy();
  }

  function initEvents() {
    // Static controls
    $$('.lang-btn').forEach(button => {
      button.addEventListener('click', () => switchLang(button.dataset.lang));
    });

    $$('.main-tab').forEach(button => {
      button.addEventListener('click', () => setType(button.dataset.type));
    });

    $$('.bottom-nav__button').forEach(button => {
      button.addEventListener('click', () => switchSection(button.dataset.path));
    });

    $$('.accordion-trigger').forEach(button => {
      button.addEventListener('click', () => toggleAccordion(button));
    });

    $$('[data-modal-close]').forEach(element => {
      element.addEventListener('click', closeModal);
    });

    // Delegated category tabs — survives renderCategories().
    $('#categoryStrip')?.addEventListener('click', event => {
      const button = event.target.closest('.category-tab');
      if (button) selectCategory(button.dataset.categoryId);
    });

    // Delegated menu cards — survives renderMenu().
    $('#menuContainer')?.addEventListener('click', event => {
      const card = event.target.closest('.menu-card');
      if (!card) return;

      const item = visibleMenu().find(entry => String(entry?.id ?? '') === card.dataset.itemId);
      if (item) openModal(item);
    });

    $('#clearSearchBtn')?.addEventListener('click', () => clearSearch());

    $('#brandHome')?.addEventListener('click', event => {
      event.preventDefault();

      if (state.modal.open) return;

      if (state.section !== 'menu') {
        switchSection('menu');
      }

      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    });

    $('#searchInput')?.addEventListener('input', event => {
      updateSearchClear();
      clearTimeout(state.searchTimer);

      state.searchTimer = window.setTimeout(() => {
        setSearch(event.currentTarget.value);
      }, SEARCH_DEBOUNCE_MS);
    });

    $('#searchInput')?.addEventListener('keydown', event => {
      if (event.key === 'Escape' && event.currentTarget.value) {
        clearSearch({ focus: false });
      }
    });

    $('#modalImage')?.addEventListener('error', () => {
      const wrap = $('#modalImageContainer');
      if (wrap) wrap.hidden = true;
    });

    $('.hero__image')?.addEventListener('error', event => {
      event.currentTarget.classList.add('is-missing');
      $('.hero')?.classList.add('hero--fallback');
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && state.modal.open) closeModal();
      trapModalFocus(event);
    });

    window.addEventListener('scroll', onWindowScroll, { passive: true });

    window.addEventListener('resize', () => {
      requestAnimationFrame(() => {
        setupCategoryObserver();
        updateActiveCategoryFromScroll();
      });
    }, { passive: true });
  }

  /* =====================================================
     Initialization
     ===================================================== */

  function validateData() {
    const menu = getMenu();

    if (!menu.length) {
      console.error('NECTAR: MENU data is missing or empty.');
      return;
    }

    const duplicateIds = menu
      .map(item => String(item?.id ?? ''))
      .filter(Boolean)
      .filter((id, index, all) => all.indexOf(id) !== index);

    if (duplicateIds.length) {
      console.warn('NECTAR: duplicate menu item ids detected:', [...new Set(duplicateIds)]);
    }
  }

  function init() {
    validateData();

    state.categoryId = firstCategoryId('kitchen');
    state.sectionScroll.menu = window.scrollY;

    applyTranslations();
    updateMainTabs();
    renderCategories();
    renderMenu({ reveal: true });
    initEvents();

    requestAnimationFrame(() => {
      setupCategoryObserver();
      updateActiveCategoryFromScroll();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
