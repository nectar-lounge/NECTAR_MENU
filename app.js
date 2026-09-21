(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const state = {
    lang: 'RU',
    section: 'menu',
    type: 'kitchen',
    mode: 'kitchen',
    categoryId: null,
    query: '',
    sectionScroll: { menu: 0, info: 0 },
    modal: window.NectarUI.modal,
    navigationToken: 0,
    renderRaf: 0,
    searchTimer: 0,
    scrollRaf: 0,
    suppressCategorySpyUntil: 0,
    categoryObserver: null,
    categoryRevealTimer: 0,
    interactionLockedUntil: 0,
    loaderTimer: 0,
  };

  const UI = window.NectarUI;
  const menuCache = new Map();
  let banquetLoadPromise = null;

  const BLOCKED_BAR_CATEGORY_IDS = new Set(['hookah']);

  /*
    Демонстрационные изображения.
    Если у позиции есть item.image — всегда используется оно.
    Эти 2 fallback нужны только для красивого примера до фотосессии.
    Позже можно удалить DEMO_IMAGE_MAP целиком.
  */
  const DEMO_IMAGE_MAP = {
    tomYum: 'assets/menu/tom-yum-demo.jpg',
    lemonades: 'assets/menu/lemonades-demo.jpg'
  };

  const prefersReducedMotion = () =>
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

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

  function itemDescription(item) {
    return itemComposition(item) || item?.description || item?.note || '';
  }

  function currentLocale() {
    if (state.lang === 'KZ') return 'kk';
    if (state.lang === 'EN') return 'en';
    return 'ru';
  }

  function normalize(value, locale = 'ru') {
    return String(value ?? '')
      .toLocaleLowerCase(locale)
      .normalize('NFKC')
      .replace(/ё/g, 'е')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeSearch(value) {
    return String(value ?? '')
      .toLocaleLowerCase('ru')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ё/g, 'е')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const priceFormatters = Object.fromEntries(['RU', 'KZ', 'EN'].map(lang => [lang, new Intl.NumberFormat({ RU: 'ru-RU', KZ: 'kk-KZ', EN: 'en-US' }[lang])]));

  function formatPrice(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return escapeHtml(value);

    const locale = state.lang === 'KZ'
      ? 'kk-KZ'
      : state.lang === 'EN'
        ? 'en-US'
        : 'ru-RU';

    return priceFormatters[state.lang].format(number);
  }

  function formatWeight(value) {
    const raw = String(value ?? '').trim();
    if (!raw) return '';

    if (state.lang === 'EN') {
      return raw
        .replace(/\s*ml$/i, ' ml')
        .replace(/\s*g$/i, ' g')
        .replace(/\s*l$/i, ' L');
    }

    return raw
      .replace(/\s*ml$/i, ' мл')
      .replace(/\s*g$/i, ' г')
      .replace(/\s*l$/i, ' л');
  }

  function categoryIdOf(item) {
    const explicit = String(item?.category_id || '').trim();
    if (explicit) return explicit;

    const seed = item?.category_ru || item?.category_en || itemCategory(item) || 'uncategorized';
    return `legacy-${normalize(seed, 'ru')
      .replace(/[^a-zа-яё0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')}`;
  }

  function itemKey(item) {
    if (item?.id !== undefined && item?.id !== null && String(item.id) !== '') {
      return String(item.id);
    }

    return [
      item?.type,
      categoryIdOf(item),
      item?.name_ru || item?.name_en || '',
      item?.price || ''
    ].join('::');
  }

  function itemImageCandidates(item, variant = 'card') {
    const candidates = [];

    // Production photo pipeline:
    // - thumb_image: lightweight image for the list card
    // - full_image: larger image loaded only when the modal opens
    // - image: universal fallback/source used by both contexts
    if (variant === 'modal' && item?.full_image) candidates.push(item.full_image);
    if (variant === 'card' && item?.thumb_image) candidates.push(item.thumb_image);
    if (item?.image) candidates.push(item.image);

    // Optional beginner-friendly auto mode. It is OFF by default so dishes without
    // photos do not generate dozens of useless 404 requests. To enable for one item,
    // add image_auto: true and upload files with the item's ID.
    const id = String(item?.id ?? '').trim();
    if (id && item?.image_auto === true) {
      if (variant === 'modal') candidates.push(`assets/menu/full/${id}.webp`);
      if (variant === 'card') candidates.push(`assets/menu/thumbs/${id}.webp`);
      candidates.push(`assets/menu/items/${id}.webp`);
    }

    const allNames = [item?.name_ru, item?.name_kz, item?.name_en]
      .map(value => normalize(value, 'ru'))
      .join(' ');

    if (allNames.includes('том ям') || allNames.includes('tom yum')) {
      candidates.push(DEMO_IMAGE_MAP.tomYum);
    }

    if (categoryIdOf(item) === 'lemonades') {
      candidates.push(DEMO_IMAGE_MAP.lemonades);
    }

    return [...new Set(candidates.filter(Boolean))];
  }

  function itemImage(item, variant = 'card') {
    return itemImageCandidates(item, variant)[0] || '';
  }

  function isAllowedBarItem(item) {
    if (item?.type !== 'bar') return false;
    if (BLOCKED_BAR_CATEGORY_IDS.has(normalize(item.category_id, 'en'))) return false;
    return ![item.category_ru, item.category_kz, item.category_en, item.name_ru, item.name_kz, item.name_en]
      .some(value => /кальян|hookah|shisha/i.test(String(value || '')));
  }

  // v1.9: build immutable indexes once. The menu data is static during a page session,
  // so repeated filter/find passes only create avoidable work on low-end phones.
  const menuIndex = (() => {
    const visible = getMenu().filter(item => item?.type === 'kitchen' || isAllowedBarItem(item));
    const byType = { kitchen: [], bar: [] };
    const byKey = new Map();
    for (const item of visible) {
      if (byType[item.type]) byType[item.type].push(item);
      byKey.set(itemKey(item), item);
    }
    return { visible, byType, byKey, search: new Map() };
  })();

  function visibleMenu() {
    return menuIndex.visible;
  }

  function itemsForType(type = state.type) {
    return menuIndex.byType[type] || [];
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

  const LANGUAGE_STORAGE_KEY = 'nectar.lang';

  function rememberLanguage(lang) {
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, lang); } catch (_) {}
  }

  function restoreLanguage() {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (['RU', 'KZ', 'EN'].includes(saved)) state.lang = saved;
    } catch (_) {}
  }

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

    $$('[data-i18n-aria-label]').forEach(element => {
      const value = t(element.dataset.i18nAriaLabel);
      if (value) element.setAttribute('aria-label', value);
    });

    $$('.lang-btn').forEach(button => {
      const active = button.dataset.lang === state.lang;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  /* LANGUAGE: сохраняем Kitchen/Bar и детерминированно открываем первую категорию.
     Без анимации всего списка: при быстрых RU/KZ/EN она создавала конкурирующие RAF/timers
     и визуальное подёргивание карточек. */
  function switchLang(lang) {
    if (
      !getTranslations()[lang] ||
      lang === state.lang ||
      state.modal.open ||
      state.modal.closing
    ) return;

    const token = ++state.navigationToken;

    state.lang = lang;
    state.query = '';
    clearTimeout(state.searchTimer);
    state.suppressCategorySpyUntil = Date.now() + 500;

    const input = $('#searchInput');
    if (input) input.value = '';

    applyTranslations();
    updateSearchClear();
    updateMainTabs();
    applyMenuModeVisibility();

    /*
      v1.12: language has ONE owner — app.js.
      Banquet no longer listens to raw .lang-btn clicks. We publish one semantic
      event after state + static translations are committed, so every secondary
      renderer updates exactly once and in a deterministic order.
    */
    document.dispatchEvent(new CustomEvent('nectar:languagechange', {
      detail: { lang: state.lang, mode: state.mode }
    }));

    if (state.mode === 'banquet') {
      // Banquet renderer handles its own first-category reset + alignment from
      // the semantic languagechange event. Never render hidden Kitchen/Bar DOM.
      rememberLanguage(state.lang);
      return;
    }

    // Kitchen / Bar: deterministic first category, same established behavior.
    const targetCategoryId = firstCategoryId(state.type);
    state.categoryId = targetCategoryId;

    renderCategories();

    const container = $('#menuContainer');
    container?.classList.remove('type-enter', 'search-results-enter');
    renderMenu();

    scrollToCategory(targetCategoryId, 'auto');
    updateCategoryTabs(targetCategoryId, true);

    rememberLanguage(state.lang);

    requestAnimationFrame(() => {
      if (token !== state.navigationToken) return;
      setupCategoryObserver();
      updateCategoryEdgeFades();
      });
  }

  function updateMainTabs() {
    $$('.main-tab').forEach(button => {
      const targetMode = button.dataset.sectionTarget === 'banquet' ? 'banquet' : button.dataset.type;
      const active = targetMode === state.mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const index = state.mode === 'banquet' ? 2 : (state.mode === 'bar' ? 1 : 0);
    $$('.main-tabs__indicator').forEach(indicator => {
      indicator.style.transform = `translateX(${index * 100}%)`;
    });
  }

  function applyMenuModeVisibility() {
    const banquet = state.mode === 'banquet';
    const searching = !banquet && Boolean(normalizeSearch(state.query));
    $('.search-box').hidden = banquet;
    $('#categoryNav').hidden = banquet || searching;
    $('#banquetCategories').hidden = !banquet;
    $('#menuContainer').hidden = banquet;
    $('#banquetMode').hidden = !banquet;
    $('#searchModeNote').hidden = !searching;
    $('.menu-shell').classList.toggle('is-searching', searching);
    $('#menuControls').classList.toggle('is-searching', searching);
    document.documentElement.dataset.menuMode = state.mode;
  }

  function scrollBanquetModeToFirstCategory() {
    const target = $('#banquetContainer .banquet-group');
    if (!target) return;
    const top = UI.categoryTop(target, controlsOffset());
    state.suppressCategorySpyUntil = Date.now() + 180;
    instantScrollTo(top);
  }

  function setMode(mode) {
    if (!['kitchen', 'bar', 'banquet'].includes(mode) || mode === state.mode || state.modal.open) return;
    state.navigationToken++;
    clearTimeout(state.searchTimer);
    clearTimeout(state.categoryRevealTimer);
    disconnectCategoryObserver();
    state.mode = mode;
    state.query = '';
    $('#searchInput').value = '';
    $('#searchInput').blur();
    if (mode !== 'banquet') state.type = mode;
    state.categoryId = firstCategoryId(state.type);
    updateSearchClear();
    updateMainTabs();
    applyMenuModeVisibility();
    if (mode !== 'banquet') { renderCategories(); renderMenu(); }
    document.dispatchEvent(new CustomEvent('nectar:modechange', { detail: { mode } }));
    if (mode === 'banquet') scrollBanquetModeToFirstCategory();
    else { scrollToCategory(state.categoryId, 'auto'); updateCategoryTabs(state.categoryId, false); }
  }

  const setBanquetMode = () => setMode('banquet');
  const setType = type => setMode(type);

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`NECTAR: ${src} failed to load.`));
      document.head.appendChild(script);
    });
  }

  function loadBanquet() {
    if (banquetLoadPromise) return banquetLoadPromise;

    banquetLoadPromise = (async () => {
      if (typeof BANQUET_MENU === 'undefined') await loadScript('banquet-data.js');
      await loadScript('banquet.js');
    })().catch(error => {
      banquetLoadPromise = null;
      throw error;
    });
    return banquetLoadPromise;
  }

  function renderCategories() {
    const strip = $('#categoryStrip');
    if (!strip) return;

    const categories = categoriesForType();

    if (!categories.some(category => category.id === state.categoryId)) {
      state.categoryId = categories[0]?.id || null;
    }

    const fragment = document.createDocumentFragment();

    const indicator = document.createElement('span');
    indicator.className = 'category-strip__indicator';
    indicator.id = 'categoryIndicator';
    indicator.setAttribute('aria-hidden', 'true');
    fragment.appendChild(indicator);

    for (const category of categories) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'category-tab';
      button.dataset.categoryId = category.id;
      button.textContent = category.name;
      button.setAttribute('aria-pressed', String(category.id === state.categoryId));
      fragment.appendChild(button);
    }

    strip.replaceChildren(fragment);

    requestAnimationFrame(() => {
      updateCategoryTabs(state.categoryId, false);
      updateCategoryEdgeFades();
    });
  }

  function activeCategoryButton(categoryId) {
    return $$('.category-tab', $('#categoryStrip')).find(
      button => button.dataset.categoryId === String(categoryId)
    ) || null;
  }

  function moveCategoryIndicator(button) {
    const indicator = $('#categoryIndicator');
    if (!indicator || !button) return;

    const width = Math.max(18, Math.min(button.offsetWidth, 64));
    const left = button.offsetLeft + (button.offsetWidth - width) / 2;

    indicator.style.width = `${width}px`;
    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.opacity = '1';
  }

  function centerCategoryTab(button, behavior = 'smooth') {
    const strip = $('#categoryStrip');
    if (!strip || !button) return;

    const maxLeft = Math.max(0, strip.scrollWidth - strip.clientWidth);
    const desiredLeft = button.offsetLeft - (strip.clientWidth - button.offsetWidth) / 2;
    const left = Math.max(0, Math.min(maxLeft, desiredLeft));

    strip.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : behavior });
  }

  function updateCategoryTabs(categoryId, center = true) {
    let activeButton = null;

    $$('.category-tab', $('#categoryStrip')).forEach(button => {
      const active = button.dataset.categoryId === String(categoryId);
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      if (active) activeButton = button;
    });

    if (activeButton) {
      moveCategoryIndicator(activeButton);
      if (center) centerCategoryTab(activeButton, 'smooth');
    }
  }

  function updateCategoryEdgeFades() {
    const strip = $('#categoryStrip');
    const nav = $('#categoryNav');
    if (!strip || !nav) return;

    const max = Math.max(0, strip.scrollWidth - strip.clientWidth);
    nav.classList.toggle('has-left-fade', strip.scrollLeft > 5);
    nav.classList.toggle('has-right-fade', strip.scrollLeft < max - 5);
  }

  function controlsOffset() {
    const headerHeight = $('#siteHeader')?.getBoundingClientRect().height || 0;
    const controlsHeight = $('#menuControls')?.getBoundingClientRect().height || 0;
    return headerHeight + controlsHeight + 14;
  }

  function categorySection(categoryId) {
    return $$('[data-category-section]', $('#menuContainer')).find(
      section => section.dataset.categorySection === String(categoryId)
    ) || null;
  }

  function scrollToCategory(categoryId, behavior = 'smooth') {
    if (state.mode === 'banquet' || state.section !== 'menu' || !categoryId || normalizeSearch(state.query)) return;

    const target = categorySection(categoryId);
    if (!target) return;

    const top = UI.categoryTop(target, controlsOffset());

    state.suppressCategorySpyUntil = Date.now() + (behavior === 'smooth' ? 900 : 180);
    UI.scrollTo(top, behavior);
  }

  function selectCategory(categoryId) {
    if (state.modal.open || state.modal.closing) return;

    const valid = categoriesForType().some(category => category.id === categoryId);
    if (!valid) return;

    state.categoryId = categoryId;
    updateCategoryTabs(categoryId, true);
    scrollToCategory(categoryId, 'smooth');
    revealSelectedCategory(categoryId);
  }

  function revealSelectedCategory(categoryId) {
    if (prefersReducedMotion()) return;
    const section = categorySection(categoryId);
    if (!section) return;
    clearTimeout(state.categoryRevealTimer);
    $$('.category-tap-reveal', $('#menuContainer')).forEach(node => node.classList.remove('category-tap-reveal'));
    $$('.menu-card', section).slice(0, 6).forEach((card, index) => {
      card.style.setProperty('--card-delay', `${Math.min(index * 22, 110)}ms`);
    });
    // Restarting the class is intentional when the same chapter is tapped twice.
    void section.offsetWidth;
    section.classList.add('category-tap-reveal');
    state.categoryRevealTimer = setTimeout(() => section.classList.remove('category-tap-reveal'), 520);
  }

  function disconnectCategoryObserver() {
    state.categoryObserver?.disconnect();
    state.categoryObserver = null;
  }

  function setupCategoryObserver() {
    disconnectCategoryObserver();

    if (
      state.mode === 'banquet' || state.section !== 'menu' ||
      !('IntersectionObserver' in window) ||
      normalize(state.query, currentLocale())
    ) return;

    const sections = $$('[data-category-section]', $('#menuContainer'));
    if (!sections.length) return;

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
      state.mode === 'banquet' || UI.scrolling ||
      state.section !== 'menu' ||
      normalize(state.query, currentLocale()) ||
      state.modal.open ||
      state.modal.closing ||
      Date.now() < state.suppressCategorySpyUntil
    ) return;

    const sections = $$('[data-category-section]', $('#menuContainer'));
    if (!sections.length) return;

    const marker = controlsOffset() + 10;
    let activeId = sections[0].dataset.categorySection;

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

  function makePlaceholder() {
    return `
      <span class="menu-card__placeholder" aria-hidden="true">
        <span class="menu-card__placeholder-inner">
          <span class="menu-card__monogram">N</span>
          <span class="menu-card__brand">NECTAR</span>
          <span class="menu-card__dot"></span>
        </span>
      </span>
    `;
  }

  function itemTags(item) {
    return Array.isArray(item?.tags) ? item.tags.filter(tag => ['spicy', 'vegetarian'].includes(tag)) : [];
  }

  function tagLabel(tag) {
    return tag === 'spicy' ? t('tag_spicy', 'Острое') : t('tag_vegetarian', 'Вегетарианское');
  }

  function tagIcon(tag) {
    if (tag === 'spicy') {
      return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.2 5.2c.8-1.7 2.2-2.5 3.3-2.7-.2 1.7-1.2 3.1-2.8 3.8M18.4 6.4c-1.5 6.2-5.5 10.9-12.8 12.9-1.9.5-3.3-1.8-1.9-3.2 2.6-2.6 4.5-5.4 5.8-8.6 1.4-3.4 5.2-4.3 8-2.1.4.3.7.6.9 1z"/></svg>`;
    }
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5C12.8 3.8 6.4 6.4 4.1 11c-1.5 3-.7 6 1.2 7.7 2.1-4.3 5.6-7.6 10.6-10-4.3 3.1-7.2 6.5-8.8 10.5 2.2.8 4.9.2 6.9-1.7 3.8-3.7 5.3-9 6.5-14z"/></svg>`;
  }

  function compactTagIcons(item) {
    const tags = itemTags(item);
    if (!tags.length) return '';
    return `<span class="menu-card__tags">${tags.map(tag => `<span class="dish-tag-icon dish-tag-icon--${tag}" role="img" aria-label="${escapeHtml(tagLabel(tag))}" title="${escapeHtml(tagLabel(tag))}">${tagIcon(tag)}</span>`).join('')}</span>`;
  }

  function modalTags(item) {
    const tags = itemTags(item);
    if (!tags.length) return '';
    return tags.map(tag => `<span class="modal-tag modal-tag--${tag}">${tagIcon(tag)}<span>${escapeHtml(tagLabel(tag))}</span></span>`).join('');
  }

  function makeMenuCard(item) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'menu-card';
    if (item?.available === false) button.classList.add('is-unavailable');
    button.dataset.itemKey = itemKey(item);
    const image = itemImage(item);
    const description = itemDescription(item);
    const available = item?.available !== false;

    button.innerHTML = `
      <span class="menu-card__media">
        ${makePlaceholder()}
        ${image ? `<img class="menu-card__image" src="${escapeHtml(image)}" alt="" width="168" height="168" loading="lazy" decoding="async">` : ''}
      </span>

      <span class="menu-card__body">
        <span class="menu-card__title-row">
          <span class="menu-card__title">${escapeHtml(itemName(item) || '—')}</span>
        </span>

        ${description ? `<span class="menu-card__desc">${escapeHtml(description)}</span>` : ''}
        <span class="menu-card__meta">
          ${item?.weight ? `<span class="menu-card__weight">${escapeHtml(formatWeight(item.weight))}</span>` : '<span class="menu-card__weight menu-card__weight--empty" aria-hidden="true"></span>'}
          ${compactTagIcons(item)}
        </span>
        ${!available ? `<span class="menu-card__unavailable">${escapeHtml(t('unavailable', 'Временно недоступно'))}</span>` : ''}
      </span>
      <span class="menu-card__price">
        ${formatPrice(item?.price)} <small>₸</small>
      </span>
      <span class="menu-card__chevron" aria-hidden="true">›</span>
    `;

    const img = $('.menu-card__image', button);
    if (img) {
      const candidates = itemImageCandidates(item, 'card');
      let candidateIndex = 0;

      const markLoaded = () => img.classList.add('is-loaded');
      if (img.complete && img.naturalWidth > 0) markLoaded();
      else img.addEventListener('load', markLoaded);

      img.addEventListener('error', () => {
        candidateIndex += 1;

        if (candidateIndex < candidates.length) {
          img.classList.remove('is-loaded');
          img.src = candidates[candidateIndex];
          return;
        }

        img.remove();
      });
    }

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

  function searchableText(item) {
    const key = itemKey(item);
    const cached = menuIndex.search.get(key);
    if (cached) return cached;

    // Include all locales so global search remains language-tolerant without rebuilding
    // normalized strings on every keystroke.
    const value = normalizeSearch([
      item?.name_ru, item?.name_kz, item?.name_en,
      item?.composition_ru, item?.composition_kz, item?.composition_en,
      item?.category_ru, item?.category_kz, item?.category_en,
      item?.note_ru, item?.note_kz, item?.note_en, item?.note,
      item?.weight
    ].filter(Boolean).join(' '));
    menuIndex.search.set(key, value);
    return value;
  }

  function matchesSearch(item, query) {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return true;

    const haystack = searchableText(item);
    const tokens = normalizedQuery.split(' ').filter(Boolean);

    // Every typed token may be only a fragment: "лим", "том я", "крев рук" etc.
    return tokens.every(token => haystack.includes(token));
  }

  function filteredItems() {
    const query = normalizeSearch(state.query);
    if (!query) return itemsForType();

    // Search is intentionally GLOBAL across Kitchen + Bar.
    return visibleMenu().filter(item => matchesSearch(item, query));
  }

  function renderMenu() {
    const container = $('#menuContainer');
    const categoryNav = $('#categoryNav');
    const searchNote = $('#searchModeNote');
    if (!container) return;

    disconnectCategoryObserver();

    const query = normalizeSearch(state.query);
    const items = filteredItems();
    const menuShell = $('.menu-shell');
    const menuControls = $('#menuControls');

    if (categoryNav) categoryNav.hidden = Boolean(query);
    menuShell?.classList.toggle('is-searching', Boolean(query));
    menuControls?.classList.toggle('is-searching', Boolean(query));

    if (searchNote) {
      searchNote.hidden = !query;

      if (!query) {
        searchNote.textContent = '';
      } else {
        const count = items.length;
        searchNote.textContent = state.lang === 'EN'
          ? `Search across Kitchen and Bar · ${count} found`
          : state.lang === 'KZ'
            ? `Асхана мен бар бойынша іздеу · ${count} нәтиже`
            : `Поиск по Кухне и Бару · найдено: ${count}`;
      }
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

    const cacheKey = `${state.lang}:${state.type}`;
    if (!query && menuCache.has(cacheKey)) {
      container.replaceChildren(...menuCache.get(cacheKey));
      scheduleMenuLayout();
      return;
    }
    const groups = query ? searchGroups(items) : normalGroups(items);
    const fragment = document.createDocumentFragment();

    groups.forEach((group, groupIndex) => {
      const section = document.createElement('section');
      section.className = 'category-section';
      section.dataset.groupType = group.type;

      if (!query) section.dataset.categorySection = group.categoryId;



      const heading = document.createElement('div');
      heading.className = 'category-heading';
      heading.innerHTML = `<span></span><h2>${escapeHtml(group.title)}</h2><span></span>`;

      const list = document.createElement('div');
      list.className = 'menu-list';
      for (const item of group.items) list.appendChild(makeMenuCard(item));

      section.append(heading, list);
      fragment.appendChild(section);
    });

    container.replaceChildren(fragment);

    if (!query) menuCache.set(cacheKey, [...container.children]);
    scheduleMenuLayout();
  }

  function scheduleMenuLayout() {
    cancelAnimationFrame(state.renderRaf);
    const token = state.navigationToken;
    state.renderRaf = requestAnimationFrame(() => {
      if (token !== state.navigationToken || state.mode === 'banquet') return;
      setupCategoryObserver();
      updateCategoryEdgeFades();
    });
  }

  function updateSearchClear() {
    const button = $('#clearSearchBtn');
    if (!button) return;
    button.hidden = !normalize($('#searchInput')?.value, currentLocale());
  }

  function searchStickyTop() {
    const header = $('.site-header');
    return Math.max(0, Math.round(header?.getBoundingClientRect().bottom || 0));
  }

  function keepSearchVisible({ force = false } = {}) {
    const token = state.navigationToken;
    const controls = $('#menuControls');
    const input = $('#searchInput');
    if (!controls || !input || !normalizeSearch(input.value)) return;

    requestAnimationFrame(() => {
      if (token !== state.navigationToken || state.section !== 'menu' || state.mode === 'banquet' || !normalizeSearch(input.value)) return;
      const rect = controls.getBoundingClientRect();
      const desiredTop = searchStickyTop();
      const inputRect = input.getBoundingClientRect();

      const inputVisible =
        inputRect.top >= desiredTop - 2 &&
        inputRect.bottom <= window.innerHeight - 8;

      if (force || !inputVisible || rect.top > desiredTop + 6) {
        const delta = rect.top - desiredTop;
        if (Math.abs(delta) > 2) {
          window.scrollBy({ top: delta, left: 0, behavior: 'auto' });
        }
      }
    });
  }

  function resolveLandscapeFixedLayerOverlap() {
    if (
      state.section !== 'menu' ||
      !window.matchMedia?.('(orientation: landscape) and (max-height: 500px)').matches
    ) return;

    const controls = $('#menuControls');
    const header = $('#siteHeader');
    const bottomNav = $('.bottom-nav');
    if (!controls || !header || !bottomNav) return;

    const controlsRect = controls.getBoundingClientRect();
    const headerBottom = header.getBoundingClientRect().bottom;
    const bottomNavTop = bottomNav.getBoundingClientRect().top;
    const availableHeight = bottomNavTop - headerBottom;

    // The controls fit between both fixed layers, but after a portrait-to-landscape
    // rotation the retained scroll offset may leave them halfway through the lower
    // layer. Align the existing sticky panel to the header in one instant scroll.
    if (
      controlsRect.height <= availableHeight &&
      controlsRect.bottom > bottomNavTop &&
      controlsRect.top > headerBottom + 1
    ) {
      state.suppressCategorySpyUntil = Date.now() + 250;
      instantScrollTo(window.scrollY + controlsRect.top - headerBottom);
    }
  }

  function setSearch(value) {
    const wasSearching = Boolean(normalizeSearch(state.query));
    state.query = value;
    state.suppressCategorySpyUntil = Date.now() + 350;

    // v1.9: coalesce rapid keystrokes. 72 ms is below perceptible typing latency but
    // avoids rebuilding the complete result DOM for every intermediate character.
    clearTimeout(state.searchTimer);
    const token = state.navigationToken;
    state.searchTimer = setTimeout(() => {
      if (token !== state.navigationToken || state.mode === 'banquet') return;
      renderMenu();
      keepSearchVisible({ force: !wasSearching && Boolean(normalizeSearch(state.query)) });
    }, 72);
  }

  function clearSearch({ focus = true } = {}) {
    const token = ++state.navigationToken;
    const input = $('#searchInput');
    if (input) input.value = '';

    clearTimeout(state.searchTimer);
    state.query = '';
    state.categoryId = firstCategoryId(state.type);

    updateSearchClear();
    renderCategories();
    renderMenu();

    requestAnimationFrame(() => {
      if (token !== state.navigationToken) return;
      scrollToCategory(state.categoryId, 'auto');
    });

    if (focus && input) {
      try { input.focus({ preventScroll: true }); } catch {}
    }
  }

  function rememberSectionScroll() {
    state.sectionScroll[state.section] = window.scrollY;
  }

  const instantScrollTo = y => UI.scrollTo(y);

  function switchSection(section) {
    if (
      !['menu', 'info'].includes(section) ||
      section === state.section ||
      state.modal.open ||
      state.modal.closing
    ) return;

    const token = ++state.navigationToken;
    rememberSectionScroll();
    state.section = section;

    const sectionNodes = {
      menu: $('#menu-section'),
      info: $('#info-section')
    };
    Object.entries(sectionNodes).forEach(([key, node]) => {
      if (!node) return;
      node.classList.toggle('is-active', key === section);
      node.classList.remove('nectar-section-enter');
    });

    updateMainTabs();
    applyMenuModeVisibility();

    $$('.bottom-nav__button').forEach(button => {
      const active = button.dataset.path === section;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });

    const y = state.sectionScroll[section] || 0;
    requestAnimationFrame(() => {
      if (token !== state.navigationToken) return;
      instantScrollTo(y);
      if (section === 'menu' && state.mode !== 'banquet') scheduleCategorySpy();
      document.dispatchEvent(new CustomEvent('nectar:sectionchange', { detail: { section } }));
    });
  }

  function setModalImage(item) {
    const wrap = $('#modalImageContainer');
    const image = $('#modalImage');
    const skeleton = $('.image-skeleton', wrap);
    if (!wrap || !image) return;

    const candidates = itemImageCandidates(item, 'modal');
    let candidateIndex = 0;
    image.classList.remove('is-loaded');

    if (!candidates.length) {
      image.removeAttribute('src');
      image.alt = '';
      wrap.hidden = true;
      return;
    }

    wrap.hidden = false;
    if (skeleton) skeleton.hidden = false;
    image.alt = itemName(item);

    const loaded = () => {
      image.classList.add('is-loaded');
      if (skeleton) skeleton.hidden = true;
    };

    const tryCandidate = () => {
      if (candidateIndex >= candidates.length) {
        image.removeAttribute('src');
        image.alt = '';
        wrap.hidden = true;
        if (skeleton) skeleton.hidden = true;
        return;
      }
      image.classList.remove('is-loaded');
      image.src = candidates[candidateIndex];
    };

    image.onload = loaded;
    image.onerror = () => {
      candidateIndex += 1;
      tryCandidate();
    };
    tryCandidate();
  }

  function openModal(item, sourceCard = null) {
    const now = performance.now();

    if (
      state.modal.open ||
      state.modal.closing ||
      !item ||
      now < state.interactionLockedUntil
    ) return;

    const modal = $('#itemModal');
    if (!modal) return;

    // Short interaction guard against rapid double taps / duplicate click dispatch.
    state.interactionLockedUntil = now + 300;

    $('#modalTitle').textContent = itemName(item) || '—';
    $('#modalPrice').innerHTML = `<span class="price__amount">${formatPrice(item?.price)}</span><span class="price__currency">₸</span>`;
    $('#modalWeight').textContent = formatWeight(item?.weight);

    const composition = itemComposition(item);
    const ingredients = $('#modalIngredientsContainer');
    const ingredientsText = $('#modalIngredients');

    if (ingredientsText) ingredientsText.textContent = composition;
    if (ingredients) ingredients.hidden = !composition;

    const tagsContainer = $('#modalTags');
    if (tagsContainer) {
      const tagsHtml = modalTags(item);
      tagsContainer.innerHTML = tagsHtml;
      tagsContainer.hidden = !tagsHtml;
    }
    const unavailable = $('#modalUnavailable');
    if (unavailable) {
      unavailable.textContent = t('unavailable', 'Временно недоступно');
      unavailable.hidden = item?.available !== false;
    }

    setModalImage(item);

    UI.open(modal, { origin: sourceCard });
  }

  const closeModal = () => UI.close();

  function toggleAccordion(button) {
    const panel = button?.nextElementSibling;
    if (!panel) return;

    const wasOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!wasOpen));
    button.classList.toggle('is-open', !wasOpen);
    panel.hidden = wasOpen;
  }

  function onWindowScroll() {
    if (state.modal.open || state.modal.closing) return;
    state.sectionScroll[state.section] = window.scrollY;
    if (state.section === 'menu' && state.mode !== 'banquet') scheduleCategorySpy();
  }

  function initEvents() {
    $$('.lang-btn').forEach(button => {
      button.addEventListener('click', () => switchLang(button.dataset.lang));
    });

    $$('.main-tab').forEach(button => {
      button.addEventListener('click', async () => {
        if (state.section !== 'menu') switchSection('menu');
        if (button.dataset.sectionTarget === 'banquet') {
          const token = ++state.navigationToken;
          try {
            await loadBanquet();
            if (token !== state.navigationToken) return;
            setBanquetMode();
          } catch (error) {
            console.error(error);
          }
          return;
        }
        setType(button.dataset.type);
      });
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

    $('#categoryStrip')?.addEventListener('click', event => {
      const button = event.target.closest('.category-tab');
      if (button) selectCategory(button.dataset.categoryId);
    });

    $('#categoryStrip')?.addEventListener('scroll', updateCategoryEdgeFades, { passive: true });

    $('#menuContainer')?.addEventListener('click', event => {
      const card = event.target.closest('.menu-card');
      if (!card) return;

      const item = menuIndex.byKey.get(card.dataset.itemKey);
      if (item) openModal(item, card);
    });

    $('#clearSearchBtn')?.addEventListener('click', () => clearSearch());

    $('#brandHome')?.addEventListener('click', event => {
      event.preventDefault();
      if (state.modal.open || state.modal.closing) return;

      if (state.section !== 'menu') switchSection('menu');
      state.navigationToken++;
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }));
    });

    $('#searchInput')?.addEventListener('input', event => {
      const value = event.currentTarget.value;
      updateSearchClear();

      // Search remains visually instant while rapid input is batched into one render.
      setSearch(value);
    });

    $('#searchInput')?.addEventListener('keydown', event => {
      if (event.key === 'Escape' && event.currentTarget.value) {
        clearSearch({ focus: false });
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        event.currentTarget.blur();
      }
    });


    $$('.hero__image').forEach(image => image.addEventListener('error', event => {
      event.currentTarget.classList.add('is-missing');
      event.currentTarget.closest('.hero')?.classList.add('hero--fallback');
    }));



    window.addEventListener('scroll', onWindowScroll, { passive: true });

    window.visualViewport?.addEventListener('resize', () => {
      if (normalizeSearch($('#searchInput')?.value)) keepSearchVisible();
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (state.modal.open || state.modal.closing) return;

      requestAnimationFrame(() => {
        resolveLandscapeFixedLayerOverlap();
        setupCategoryObserver();
        updateActiveCategoryFromScroll();
        updateCategoryTabs(state.categoryId, false);
        updateCategoryEdgeFades();
      });
    }, { passive: true });

    window.addEventListener('pageshow', event => {
      if (event.persisted) { state.navigationToken++; scheduleMenuLayout(); }
    });
  }

  function validateData() {
    const menu = getMenu();
    if (!menu.length) {
      console.error('NECTAR: MENU data is missing or empty.');
      return;
    }

    const keys = menu.map(itemKey);
    const duplicates = keys.filter((key, index, all) => all.indexOf(key) !== index);
    if (duplicates.length) {
      console.warn('NECTAR: duplicate menu item keys detected:', [...new Set(duplicates)]);
    }

    const required = ['id', 'type', 'category_id', 'category_ru', 'category_kz', 'category_en', 'name_ru', 'name_kz', 'name_en'];
    const invalid = menu.filter(item => required.some(field => !String(item?.[field] ?? '').trim()));
    if (invalid.length) {
      console.warn('NECTAR: menu items with missing required fields:', invalid.map(itemKey));
    }

    const validPrice = value => {
      if (Number.isFinite(Number(value))) return Number(value) >= 0;
      return String(value).split('/').every(part => Number.isFinite(Number(part.trim())) && Number(part.trim()) >= 0);
    };
    const invalidPrices = menu.filter(item => item?.price != null && !validPrice(item.price));
    if (invalidPrices.length) {
      console.warn('NECTAR: menu items with invalid prices:', invalidPrices.map(itemKey));
    }
  }

  function hideAppLoader() {
    const loader = $('#appLoader');
    if (!loader || loader.hidden) return;
    loader.classList.add('is-ready');
    clearTimeout(state.loaderTimer);
    state.loaderTimer = setTimeout(() => { loader.hidden = true; }, prefersReducedMotion() ? 0 : 320);
  }

  function offlineTimestamp() {
    try {
      const saved = Number(localStorage.getItem('nectar:last-online'));
      if (!Number.isFinite(saved) || saved <= 0) return '';
      return new Intl.DateTimeFormat(currentLocale(), { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(saved);
    } catch { return ''; }
  }

  function updateConnectivity(forcedOffline = null) {
    const banner = $('#connectivityBanner');
    const time = $('#offlineUpdatedAt');
    if (!banner) return;
    const offline = forcedOffline === null ? navigator.onLine === false : forcedOffline;
    banner.hidden = !offline;
    document.documentElement.classList.toggle('is-offline', offline);
    if (time) {
      const value = offlineTimestamp();
      time.textContent = value ? `· ${value}` : '';
      if (value) {
        try { time.dateTime = new Date(Number(localStorage.getItem('nectar:last-online'))).toISOString(); }
        catch { time.removeAttribute('datetime'); }
      }
      else time.removeAttribute('datetime');
    }
    if (!offline) {
      try { localStorage.setItem('nectar:last-online', String(Date.now())); } catch {}
    }
  }

  async function probeConnectivity() {
    if (navigator.onLine === false) {
      updateConnectivity(true);
      return;
    }
    try {
      const response = await fetch(location.href, { method: 'HEAD', cache: 'no-store' });
      updateConnectivity(!response.ok);
    } catch {
      updateConnectivity(true);
    }
  }

  function enableOfflineMenu() {
    updateConnectivity();
    probeConnectivity();
    window.addEventListener('online', probeConnectivity);
    window.addEventListener('offline', () => updateConnectivity(true));
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('./service-worker.js').catch(error => {
        console.warn('NECTAR: offline menu registration failed.', error);
      });
    }
  }

  function init() {
    validateData();

    state.categoryId = firstCategoryId('kitchen');
    state.sectionScroll.menu = window.scrollY;

    restoreLanguage();
    applyTranslations();
    updateMainTabs();
    applyMenuModeVisibility();
    renderCategories();
    renderMenu();
    initEvents();
    enableOfflineMenu();

    requestAnimationFrame(() => {
      setupCategoryObserver();
      updateActiveCategoryFromScroll();
      updateCategoryEdgeFades();
      hideAppLoader();
    });

    document.fonts?.ready
      ?.then(() => {
        if (!state.modal.open && !state.modal.closing) {
          setupCategoryObserver();
          updateActiveCategoryFromScroll();
          updateCategoryTabs(state.categoryId, false);
        }
      })
      .catch(() => {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
