(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const state = {
    lang: 'RU',
    section: 'menu',
    type: 'kitchen',
    categoryId: null,
    query: '',
    sectionScroll: { menu: 0, banquet: 0, info: 0 },
    modal: {
      open: false,
      closing: false,
      scrollY: 0,
      previousFocus: null,
      closeTimer: 0,
      restoreToken: 0
    },
    searchTimer: 0,
    revealPlayed: false,
    scrollRaf: 0,
    suppressCategorySpyUntil: 0,
    categoryObserver: null,
    categoryRevealTimer: 0,
    interactionLockedUntil: 0,
    languageSwitchToken: 0
  };

  const MODAL_ANIMATION_MS = 280;
  const SCROLL_RESTORE_TOLERANCE = 3;
  const SCROLL_RESTORE_MAX_ATTEMPTS = 8;

  const ALLOWED_BAR_CATEGORY_IDS = new Set(['lemonades', 'tea', 'soft-drinks']);
  const ALLOWED_BAR_CATEGORY_NAMES = new Set([
    'лимонады', 'лимонадтар', 'lemonades',
    'чай', 'шай', 'tea',
    'безалкогольные напитки', 'алкогольсіз сусындар', 'soft drinks'
  ]);

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

    const explicitId = normalize(item.category_id, 'en');
    if (ALLOWED_BAR_CATEGORY_IDS.has(explicitId)) return true;

    const categoryNames = [item.category_ru, item.category_kz, item.category_en]
      .map(value => normalize(value, 'ru'))
      .filter(Boolean);

    return categoryNames.some(name => ALLOWED_BAR_CATEGORY_NAMES.has(name));
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

    const token = ++state.languageSwitchToken;

    state.lang = lang;
    state.query = '';
    clearTimeout(state.searchTimer);
    state.suppressCategorySpyUntil = Date.now() + 450;

    const input = $('#searchInput');
    if (input) input.value = '';

    // Stable category IDs do not depend on language. Resolve destination before render.
    const targetCategoryId = firstCategoryId(state.type);
    state.categoryId = targetCategoryId;

    applyTranslations();
    updateSearchClear();
    updateMainTabs();
    renderCategories();

    // Do not animate/reflow the entire 81-item menu for a language-only text change.
    const container = $('#menuContainer');
    container?.classList.remove('type-enter', 'search-results-enter');
    renderMenu();

    // renderMenu() is synchronous, so the destination section already exists.
    scrollToCategory(targetCategoryId, 'auto');
    updateCategoryTabs(targetCategoryId, true);

    requestAnimationFrame(() => {
      if (token !== state.languageSwitchToken) return;
      setupCategoryObserver();
      updateCategoryEdgeFades();
    });
  }

  function updateMainTabs() {
    const banquetActive = state.section === 'banquet';
    $$('.main-tab').forEach(button => {
      const active = button.dataset.sectionTarget === 'banquet'
        ? banquetActive
        : !banquetActive && button.dataset.type === state.type;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const indicator = $('#mainTabsIndicator');
    if (indicator) {
      const index = banquetActive ? 2 : (state.type === 'bar' ? 1 : 0);
      indicator.style.transform = `translateX(${index * 100}%)`;
    }
  }

  function setType(type) {
    if (
      !['kitchen', 'bar'].includes(type) ||
      type === state.type ||
      state.modal.open ||
      state.modal.closing
    ) return;

    state.type = type;
    state.query = '';
    clearTimeout(state.searchTimer);

    const input = $('#searchInput');
    if (input) input.value = '';

    // Lock the intended destination before the DOM is replaced.
    // Without this, the scroll spy can read the old deep scroll position against
    // the newly rendered short Bar menu and change Lemonades -> Tea before our RAF.
    const targetCategoryId = firstCategoryId(type);
    state.categoryId = targetCategoryId;
    state.suppressCategorySpyUntil = Date.now() + 500;

    updateSearchClear();
    updateMainTabs();
    renderCategories();
    renderMenu({ motion: 'type' });

    // The new sections already exist synchronously after renderMenu().
    // Jump immediately to the first category; a smooth programmatic scroll here
    // only makes the switch feel slower and gives observers time to compete.
    scrollToCategory(targetCategoryId, 'auto');
    updateCategoryTabs(targetCategoryId, true);

    requestAnimationFrame(() => {
      setupCategoryObserver();
      updateCategoryEdgeFades();
    });
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
    if (!categoryId || normalize(state.query, currentLocale())) return;

    const target = categorySection(categoryId);
    if (!target) return;

    const top = Math.max(
      0,
      target.getBoundingClientRect().top + window.scrollY - controlsOffset()
    );

    state.suppressCategorySpyUntil = Date.now() + (behavior === 'smooth' ? 900 : 180);
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : behavior });
  }

  function animateCategorySection(categoryId) {
    if (prefersReducedMotion()) return;

    const section = categorySection(categoryId);
    if (!section) return;

    section.classList.remove('category-tap-reveal');
    void section.offsetWidth;

    $$('.menu-card', section).forEach((card, index) => {
      card.style.setProperty('--card-delay', `${Math.min(index * 32, 180)}ms`);
    });

    section.classList.add('category-tap-reveal');

    window.setTimeout(() => {
      section.classList.remove('category-tap-reveal');
      $$('.menu-card', section).forEach(card => card.style.removeProperty('--card-delay'));
    }, 720);
  }

  function selectCategory(categoryId) {
    if (state.modal.open || state.modal.closing) return;

    const valid = categoriesForType().some(category => category.id === categoryId);
    if (!valid) return;

    state.categoryId = categoryId;
    updateCategoryTabs(categoryId, true);
    scrollToCategory(categoryId, 'smooth');

    clearTimeout(state.categoryRevealTimer);
    state.categoryRevealTimer = window.setTimeout(
      () => animateCategorySection(categoryId),
      prefersReducedMotion() ? 0 : 360
    );
  }

  function disconnectCategoryObserver() {
    state.categoryObserver?.disconnect();
    state.categoryObserver = null;
  }

  function setupCategoryObserver() {
    disconnectCategoryObserver();

    if (
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
    button.setAttribute('aria-label', itemName(item) || 'Menu item');

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

  function renderMenu({ reveal = false, motion = '' } = {}) {
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

    const groups = query ? searchGroups(items) : normalGroups(items);
    const fragment = document.createDocumentFragment();

    groups.forEach((group, groupIndex) => {
      const section = document.createElement('section');
      section.className = 'category-section';
      section.dataset.groupType = group.type;

      if (!query) section.dataset.categorySection = group.categoryId;

      if (reveal && !state.revealPlayed) {
        section.classList.add('reveal-once');
        section.style.setProperty('--reveal-delay', `${Math.min(groupIndex * 65, 280)}ms`);
      }

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

    if (query) {
      container.classList.remove('search-results-enter');
      requestAnimationFrame(() => container.classList.add('search-results-enter'));
    }

    if (motion === 'type') {
      container.classList.remove('type-enter');

      // Restart the lightweight transition on the next frame without forcing
      // a synchronous layout via offsetWidth.
      requestAnimationFrame(() => {
        container.classList.add('type-enter');
        window.setTimeout(() => container.classList.remove('type-enter'), 360);
      });
    }

    if (reveal && !state.revealPlayed) {
      requestAnimationFrame(() => {
        $$('.reveal-once', container).forEach(section => section.classList.add('is-revealed'));
        state.revealPlayed = true;
      });
    }

    if (!query) {
      requestAnimationFrame(() => {
        setupCategoryObserver();
        if (Date.now() >= state.suppressCategorySpyUntil) {
          updateActiveCategoryFromScroll();
        }
      });
    }
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
    const controls = $('#menuControls');
    const input = $('#searchInput');
    if (!controls || !input || !normalizeSearch(input.value)) return;

    requestAnimationFrame(() => {
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

  function setSearch(value) {
    const wasSearching = Boolean(normalizeSearch(state.query));
    state.query = value;
    state.suppressCategorySpyUntil = Date.now() + 350;

    // v1.9: coalesce rapid keystrokes. 72 ms is below perceptible typing latency but
    // avoids rebuilding the complete result DOM for every intermediate character.
    clearTimeout(state.searchTimer);
    state.searchTimer = setTimeout(() => {
      renderMenu();
      keepSearchVisible({ force: !wasSearching && Boolean(normalizeSearch(state.query)) });
    }, 72);
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

    requestAnimationFrame(() => {
      scrollToCategory(state.categoryId, 'auto');
    });

    if (focus && input) {
      try { input.focus({ preventScroll: true }); } catch {}
    }
  }

  function rememberSectionScroll() {
    state.sectionScroll[state.section] = window.scrollY;
  }

  function instantScrollTo(y) {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, Math.max(0, y));
    requestAnimationFrame(() => { root.style.scrollBehavior = previous; });
  }

  function switchSection(section) {
    if (
      !['menu', 'banquet', 'info'].includes(section) ||
      section === state.section ||
      state.modal.open ||
      state.modal.closing
    ) return;

    rememberSectionScroll();
    state.section = section;

    const sectionNodes = {
      menu: $('#menu-section'),
      banquet: $('#banquet-section'),
      info: $('#info-section')
    };
    Object.entries(sectionNodes).forEach(([key, node]) => {
      if (!node) return;
      node.classList.toggle('is-active', key === section);
      node.classList.remove('nectar-section-enter');
    });

    // Animate only the incoming content. The fixed bottom navigation never moves,
    // so switching destinations feels app-like without adding artificial delay.
    const incomingSection = sectionNodes[section];
    if (incomingSection && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void incomingSection.offsetWidth;
      incomingSection.classList.add('nectar-section-enter');
      window.setTimeout(() => incomingSection.classList.remove('nectar-section-enter'), 260);
    }

    updateMainTabs();

    $$('.bottom-nav__button').forEach(button => {
      const active = button.dataset.path === section;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });

    const y = state.sectionScroll[section] || 0;
    requestAnimationFrame(() => {
      instantScrollTo(y);
      if (section === 'menu') scheduleCategorySpy();
      document.dispatchEvent(new CustomEvent('nectar:sectionchange', { detail: { section } }));
    });
  }

  /* MODAL: надёжный lock + restore scroll, без swipe */
  function lockPageAtCurrentScroll() {
    const y = Math.max(0, window.scrollY || window.pageYOffset || 0);
    state.modal.scrollY = y;
    state.sectionScroll[state.section] = y;

    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    if (scrollbarWidth) document.body.style.paddingRight = `${scrollbarWidth}px`;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${y}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.classList.add('modal-open');

    state.suppressCategorySpyUntil = Number.MAX_SAFE_INTEGER;
  }

  function releasePageLock() {
    document.body.classList.remove('modal-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.paddingRight = '';
  }

  function restoreScrollPosition(targetY, callback) {
    const token = ++state.modal.restoreToken;
    const root = document.documentElement;
    const oldScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';

    let attempt = 0;

    const restore = () => {
      if (token !== state.modal.restoreToken) return;
      attempt += 1;
      window.scrollTo(0, targetY);

      requestAnimationFrame(() => {
        if (token !== state.modal.restoreToken) return;

        const actualY = window.scrollY || window.pageYOffset || 0;
        const difference = Math.abs(actualY - targetY);
        const done = difference <= SCROLL_RESTORE_TOLERANCE || attempt >= SCROLL_RESTORE_MAX_ATTEMPTS;

        if (!done) {
          restore();
          return;
        }

        root.style.scrollBehavior = oldScrollBehavior;
        state.sectionScroll[state.section] = targetY;
        state.suppressCategorySpyUntil = Date.now() + 250;
        callback?.();
        requestAnimationFrame(scheduleCategorySpy);
      });
    };

    requestAnimationFrame(restore);
  }

  function safelyRestoreFocus(element, expectedScrollY) {
    if (!(element instanceof HTMLElement) || !document.contains(element)) return;

    try {
      element.focus({ preventScroll: true });
    } catch {
      return;
    }

    requestAnimationFrame(() => {
      if (Math.abs(window.scrollY - expectedScrollY) > SCROLL_RESTORE_TOLERANCE) {
        instantScrollTo(expectedScrollY);
      }
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

  function openModal(item) {
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

    state.modal.previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

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

    // Mark as open before body lock so an intermediate scroll event
    // cannot overwrite section scroll memory with 0.
    state.modal.open = true;
    state.modal.closing = false;

    lockPageAtCurrentScroll();
    modal.hidden = false;

    requestAnimationFrame(() => {
      modal.classList.add('is-open');
      try { $('#modalCloseButton')?.focus({ preventScroll: true }); } catch {}
    });
  }

  function closeModal() {
    const modal = $('#itemModal');
    if (!modal || !state.modal.open || state.modal.closing) return;

    state.modal.closing = true;
    const restoreY = state.modal.scrollY;
    const previousFocus = state.modal.previousFocus;

    modal.classList.remove('is-open');
    clearTimeout(state.modal.closeTimer);

    state.modal.closeTimer = window.setTimeout(() => {
      modal.hidden = true;
      releasePageLock();

      state.modal.open = false;
      state.modal.closing = false;
      state.modal.previousFocus = null;

      restoreScrollPosition(restoreY, () => {
        safelyRestoreFocus(previousFocus, restoreY);
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
    if (state.section === 'menu') scheduleCategorySpy();
  }

  function initEvents() {
    $$('.lang-btn').forEach(button => {
      button.addEventListener('click', () => switchLang(button.dataset.lang));
    });

    $$('.main-tab').forEach(button => {
      button.addEventListener('click', () => {
        if (button.dataset.sectionTarget === 'banquet') {
          switchSection('banquet');
          return;
        }
        if (state.section !== 'menu') switchSection('menu');
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
      if (item) openModal(item);
    });

    $('#clearSearchBtn')?.addEventListener('click', () => clearSearch());

    $('#brandHome')?.addEventListener('click', event => {
      event.preventDefault();
      if (state.modal.open || state.modal.closing) return;

      if (state.section !== 'menu') switchSection('menu');
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


    $('.hero__image')?.addEventListener('error', event => {
      event.currentTarget.classList.add('is-missing');
      $('.hero')?.classList.add('hero--fallback');
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && state.modal.open) closeModal();
      trapModalFocus(event);
    });

    window.addEventListener('scroll', onWindowScroll, { passive: true });

    window.visualViewport?.addEventListener('resize', () => {
      if (normalizeSearch($('#searchInput')?.value)) keepSearchVisible();
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (state.modal.open || state.modal.closing) return;

      requestAnimationFrame(() => {
        setupCategoryObserver();
        updateActiveCategoryFromScroll();
        updateCategoryTabs(state.categoryId, false);
        updateCategoryEdgeFades();
      });
    }, { passive: true });

    window.addEventListener('pageshow', event => {
      if (!event.persisted) return;

      clearTimeout(state.modal.closeTimer);
      state.modal.closeTimer = 0;
      state.modal.open = false;
      state.modal.closing = false;
      state.modal.previousFocus = null;
      state.modal.restoreToken += 1;
      state.suppressCategorySpyUntil = 0;
      state.interactionLockedUntil = 0;
      state.languageSwitchToken += 1;

      const modal = $('#itemModal');
      if (modal) {
        modal.classList.remove('is-open');
        modal.hidden = true;
      }

      releasePageLock();

      requestAnimationFrame(() => {
        setupCategoryObserver();
        scheduleCategorySpy();
      });
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

    const invalidPrices = menu.filter(item => item?.price != null && (!Number.isFinite(Number(item.price)) || Number(item.price) < 0));
    if (invalidPrices.length) {
      console.warn('NECTAR: menu items with invalid prices:', invalidPrices.map(itemKey));
    }
  }

  function init() {
    validateData();

    state.categoryId = firstCategoryId('kitchen');
    state.sectionScroll.menu = window.scrollY;

    restoreLanguage();
    applyTranslations();
    updateMainTabs();
    renderCategories();
    renderMenu({ reveal: true });
    initEvents();

    requestAnimationFrame(() => {
      setupCategoryObserver();
      updateActiveCategoryFromScroll();
      updateCategoryEdgeFades();
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
