(() => {
  'use strict';

  /* =====================================================
     HELPERS
     ===================================================== */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));


  /* =====================================================
     APPLICATION STATE
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
      closeTimer: 0,
      restoreToken: 0
    },

    searchTimer: 0,

    revealPlayed: false,

    scrollRaf: 0,

    suppressCategorySpyUntil: 0,

    categoryObserver: null,

    categoryRevealTimer: 0
  };


  /* =====================================================
     CONSTANTS
     ===================================================== */

  const SEARCH_DEBOUNCE_MS = 180;

  const MODAL_ANIMATION_MS = 280;

  const SCROLL_RESTORE_TOLERANCE = 3;

  const SCROLL_RESTORE_MAX_ATTEMPTS = 8;


  const ALLOWED_BAR_CATEGORY_IDS =
    new Set([
      'lemonades',
      'tea'
    ]);


  const ALLOWED_BAR_CATEGORY_NAMES =
    new Set([
      'лимонады',
      'лимонадтар',
      'lemonades',

      'чай',
      'шай',
      'tea'
    ]);


  /*
    DEMO IMAGES

    ВАЖНО:
    если в menu-data.js у блюда есть собственное:

    image: 'assets/menu/example.jpg'

    оно имеет приоритет.

    Эти две картинки нужны только
    для демонстрации Tom Yum и Lemonades.
  */

  const DEMO_IMAGE_MAP = {
    tomYum:
      'assets/menu/tom-yum-demo.jpg',

    lemonades:
      'assets/menu/lemonades-demo.jpg'
  };


  /* =====================================================
     MOTION
     ===================================================== */

  const prefersReducedMotion = () =>
    window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches === true;


  /* =====================================================
     DATA
     ===================================================== */

  function getMenu() {
    return (
      typeof MENU !== 'undefined' &&
      Array.isArray(MENU)
    )
      ? MENU
      : [];
  }


  function getTranslations() {
    return (
      typeof TRANSLATIONS !== 'undefined' &&
      TRANSLATIONS
    )
      ? TRANSLATIONS
      : {};
  }


  function t(key, fallback = '') {
    return (
      getTranslations()?.[state.lang]?.[key] ??
      fallback
    );
  }


  function langKey(prefix) {
    return `${prefix}_${state.lang.toLowerCase()}`;
  }


  function itemName(item) {
    return (
      item?.[langKey('name')] ||
      item?.name_ru ||
      item?.name_en ||
      ''
    );
  }


  function itemCategory(item) {
    return (
      item?.[langKey('category')] ||
      item?.category_ru ||
      item?.category_en ||
      ''
    );
  }


  function itemComposition(item) {
    return (
      item?.[langKey('composition')] ||
      item?.composition_ru ||
      item?.composition_en ||
      ''
    );
  }


  function itemDescription(item) {
    return (
      itemComposition(item) ||
      item?.description ||
      item?.note ||
      ''
    );
  }


  function currentLocale() {
    if (state.lang === 'KZ') {
      return 'kk';
    }

    if (state.lang === 'EN') {
      return 'en';
    }

    return 'ru';
  }


  function normalize(
    value,
    locale = 'ru'
  ) {
    return String(value ?? '')
      .toLocaleLowerCase(locale)
      .normalize('NFKC')
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
    const number =
      Number(value);

    if (
      !Number.isFinite(number)
    ) {
      return escapeHtml(value);
    }


    const locale =
      state.lang === 'KZ'
        ? 'kk-KZ'
        : state.lang === 'EN'
          ? 'en-US'
          : 'ru-RU';


    return new Intl.NumberFormat(
      locale
    ).format(number);
  }


  /* =====================================================
     STABLE IDS
     ===================================================== */

  function categoryIdOf(item) {
    const explicit =
      String(
        item?.category_id || ''
      ).trim();


    if (explicit) {
      return explicit;
    }


    const seed =
      item?.category_ru ||
      item?.category_en ||
      itemCategory(item) ||
      'uncategorized';


    return `legacy-${normalize(
      seed,
      'ru'
    )
      .replace(
        /[^a-zа-яё0-9]+/gi,
        '-'
      )
      .replace(
        /^-+|-+$/g,
        ''
      )}`;
  }


  function itemKey(item) {
    if (
      item?.id !== undefined &&
      item?.id !== null &&
      String(item.id) !== ''
    ) {
      return String(item.id);
    }


    return [
      item?.type,
      categoryIdOf(item),
      item?.name_ru ||
        item?.name_en ||
        '',
      item?.price || ''
    ].join('::');
  }


  /* =====================================================
     IMAGE RESOLUTION
     ===================================================== */

  function itemImage(item) {

    /*
      Реальная фотография из menu-data.js
      всегда имеет приоритет.
    */

    if (item?.image) {
      return item.image;
    }


    /*
      DEMO TOM YUM
    */

    const allNames = [
      item?.name_ru,
      item?.name_kz,
      item?.name_en
    ]
      .map(value =>
        normalize(
          value,
          'ru'
        )
      )
      .join(' ');


    if (
      allNames.includes('том ям') ||
      allNames.includes('tom yum')
    ) {
      return DEMO_IMAGE_MAP.tomYum;
    }


    /*
      DEMO LEMONADES
    */

    if (
      categoryIdOf(item) ===
      'lemonades'
    ) {
      return DEMO_IMAGE_MAP.lemonades;
    }


    /*
      Нет фото =
      показываем CSS-placeholder.
    */

    return '';
  }


  /* =====================================================
     MENU VISIBILITY
     ===================================================== */

  function isAllowedBarItem(item) {
    if (
      item?.type !== 'bar'
    ) {
      return false;
    }


    const explicitId =
      normalize(
        item.category_id,
        'en'
      );


    if (
      ALLOWED_BAR_CATEGORY_IDS
        .has(explicitId)
    ) {
      return true;
    }


    const categoryNames = [
      item.category_ru,
      item.category_kz,
      item.category_en
    ]
      .map(value =>
        normalize(
          value,
          'ru'
        )
      )
      .filter(Boolean);


    return categoryNames.some(
      name =>
        ALLOWED_BAR_CATEGORY_NAMES
          .has(name)
    );
  }


  function visibleMenu() {
    return getMenu()
      .filter(
        item =>
          item?.type === 'kitchen' ||
          isAllowedBarItem(item)
      );
  }


  function itemsForType(
    type = state.type
  ) {
    return visibleMenu()
      .filter(
        item =>
          item?.type === type
      );
  }


  function categoriesForType(
    type = state.type
  ) {
    const seen =
      new Set();

    const categories =
      [];


    for (
      const item of itemsForType(type)
    ) {
      const id =
        categoryIdOf(item);


      if (
        seen.has(id)
      ) {
        continue;
      }


      seen.add(id);


      categories.push({
        id,

        name:
          itemCategory(item) ||
          id
      });
    }


    return categories;
  }


  function firstCategoryId(
    type = state.type
  ) {
    return (
      categoriesForType(type)[0]?.id ||
      null
    );
  }


  function typeLabel(type) {
    return (
      type === 'bar'
        ? t('nav_bar', 'БАР')
        : t('nav_kitchen', 'КУХНЯ')
    );
  }


  /* =====================================================
     TRANSLATIONS
     ===================================================== */

  function applyTranslations() {
    document.documentElement.lang =
      state.lang === 'KZ'
        ? 'kk'
        : state.lang.toLowerCase();


    $$('[data-i18n]')
      .forEach(element => {
        const value =
          t(
            element.dataset.i18n
          );


        if (
          value !== undefined &&
          value !== ''
        ) {
          element.textContent =
            value;
        }
      });


    $$('[data-i18n-placeholder]')
      .forEach(element => {
        const value =
          t(
            element.dataset
              .i18nPlaceholder
          );


        if (value) {
          element.setAttribute(
            'placeholder',
            value
          );
        }
      });


    $$('.lang-btn')
      .forEach(button => {
        const active =
          button.dataset.lang ===
          state.lang;


        button.classList.toggle(
          'is-active',
          active
        );


        button.setAttribute(
          'aria-pressed',
          String(active)
        );
      });
  }


  /* =====================================================
     LANGUAGE SWITCH
     ===================================================== */

  /*
    Логика, которую мы выбрали:

    Kitchen -> EN
    = остаёмся Kitchen,
      но переходим к первой категории Kitchen.

    Bar -> EN
    = остаёмся Bar,
      но переходим к первой категории Bar.
  */

  function switchLang(lang) {
    if (
      !getTranslations()[lang] ||
      lang === state.lang ||
      state.modal.open ||
      state.modal.closing
    ) {
      return;
    }


    state.lang =
      lang;


    state.query =
      '';


    clearTimeout(
      state.searchTimer
    );


    const input =
      $('#searchInput');


    if (input) {
      input.value = '';
    }


    applyTranslations();

    updateSearchClear();

    updateMainTabs();


    state.categoryId =
      firstCategoryId(
        state.type
      );


    renderCategories();

    renderMenu({
      motion: 'language'
    });


    requestAnimationFrame(
      () => {
        scrollToCategory(
          state.categoryId,
          'auto'
        );
      }
    );
  }


  /* =====================================================
     KITCHEN / BAR
     ===================================================== */

  function updateMainTabs() {
    $$('.main-tab')
      .forEach(button => {
        const active =
          button.dataset.type ===
          state.type;


        button.classList.toggle(
          'is-active',
          active
        );


        button.setAttribute(
          'aria-selected',
          String(active)
        );
      });


    const indicator =
      $('#mainTabsIndicator');


    if (indicator) {
      indicator.style.transform =
        state.type === 'bar'
          ? 'translateX(100%)'
          : 'translateX(0)';
    }
  }


  function setType(type) {
    if (
      ![
        'kitchen',
        'bar'
      ].includes(type) ||

      type === state.type ||

      state.modal.open ||

      state.modal.closing
    ) {
      return;
    }


    state.type =
      type;


    state.query =
      '';


    state.categoryId =
      firstCategoryId(type);


    clearTimeout(
      state.searchTimer
    );


    const input =
      $('#searchInput');


    if (input) {
      input.value = '';
    }


    updateSearchClear();

    updateMainTabs();

    renderCategories();

    renderMenu({
      motion: 'type'
    });


    requestAnimationFrame(
      () => {
        scrollToCategory(
          state.categoryId,

          prefersReducedMotion()
            ? 'auto'
            : 'smooth'
        );
      }
    );
  }


  /* =====================================================
     CATEGORIES
     ===================================================== */

  function renderCategories() {
    const strip =
      $('#categoryStrip');


    if (!strip) {
      return;
    }


    const categories =
      categoriesForType();


    if (
      !categories.some(
        category =>
          category.id ===
          state.categoryId
      )
    ) {
      state.categoryId =
        categories[0]?.id ||
        null;
    }


    const fragment =
      document.createDocumentFragment();


    /*
      Один физический gold-indicator.
      Он двигается между категориями,
      а не создаётся отдельно
      под каждой кнопкой.
    */

    const indicator =
      document.createElement(
        'span'
      );


    indicator.className =
      'category-strip__indicator';


    indicator.id =
      'categoryIndicator';


    indicator.setAttribute(
      'aria-hidden',
      'true'
    );


    fragment.appendChild(
      indicator
    );


    for (
      const category of categories
    ) {
      const button =
        document.createElement(
          'button'
        );


      button.type =
        'button';


      button.className =
        'category-tab';


      button.dataset.categoryId =
        category.id;


      button.textContent =
        category.name;


      button.setAttribute(
        'role',
        'tab'
      );


      button.setAttribute(
        'aria-selected',
        String(
          category.id ===
          state.categoryId
        )
      );


      fragment.appendChild(
        button
      );
    }


    strip.replaceChildren(
      fragment
    );


    requestAnimationFrame(
      () => {
        updateCategoryTabs(
          state.categoryId,
          false
        );


        updateCategoryEdgeFades();
      }
    );
  }


  function activeCategoryButton(
    categoryId
  ) {
    return (
      $$(
        '.category-tab',
        $('#categoryStrip')
      )
        .find(
          button =>
            button.dataset
              .categoryId ===
            String(categoryId)
        ) ||
      null
    );
  }


  /* =====================================================
     GOLD CATEGORY INDICATOR
     ===================================================== */

  function moveCategoryIndicator(
    button
  ) {
    const indicator =
      $('#categoryIndicator');


    if (
      !indicator ||
      !button
    ) {
      return;
    }


    /*
      Не делаем линию на всю
      ширину длинного названия.

      Максимум 64px.
    */

    const width =
      Math.max(
        18,

        Math.min(
          button.offsetWidth,
          64
        )
      );


    const left =
      button.offsetLeft +
      (
        button.offsetWidth -
        width
      ) / 2;


    indicator.style.width =
      `${width}px`;


    indicator.style.transform =
      `translateX(${left}px)`;


    indicator.style.opacity =
      '1';
  }


  /* =====================================================
     CATEGORY HORIZONTAL SCROLL
     ===================================================== */

  /*
    ВАЖНО:

    здесь НЕТ scrollIntoView().

    scrollIntoView() на мобильном
    может прокрутить всю страницу
    вертикально.

    Мы двигаем только scrollLeft.
  */

  function centerCategoryTab(
    button,
    behavior = 'smooth'
  ) {
    const strip =
      $('#categoryStrip');


    if (
      !strip ||
      !button
    ) {
      return;
    }


    const maxLeft =
      Math.max(
        0,

        strip.scrollWidth -
        strip.clientWidth
      );


    const desiredLeft =
      button.offsetLeft -
      (
        strip.clientWidth -
        button.offsetWidth
      ) / 2;


    const left =
      Math.max(
        0,

        Math.min(
          maxLeft,
          desiredLeft
        )
      );


    strip.scrollTo({
      left,

      behavior:
        prefersReducedMotion()
          ? 'auto'
          : behavior
    });
  }


  function updateCategoryTabs(
    categoryId,
    center = true
  ) {
    let activeButton =
      null;


    $$(
      '.category-tab',
      $('#categoryStrip')
    )
      .forEach(button => {
        const active =
          button.dataset
            .categoryId ===
          String(categoryId);


        button.classList.toggle(
          'is-active',
          active
        );


        button.setAttribute(
          'aria-selected',
          String(active)
        );


        if (active) {
          activeButton =
            button;
        }
      });


    if (activeButton) {
      moveCategoryIndicator(
        activeButton
      );


      if (center) {
        centerCategoryTab(
          activeButton,
          'smooth'
        );
      }
    }
  }


  /* =====================================================
     CATEGORY EDGE FADES
     ===================================================== */

  function updateCategoryEdgeFades() {
    const strip =
      $('#categoryStrip');


    const nav =
      $('#categoryNav');


    if (
      !strip ||
      !nav
    ) {
      return;
    }


    const max =
      Math.max(
        0,

        strip.scrollWidth -
        strip.clientWidth
      );


    nav.classList.toggle(
      'has-left-fade',

      strip.scrollLeft > 5
    );


    nav.classList.toggle(
      'has-right-fade',

      strip.scrollLeft <
        max - 5
    );
  }


  /* =====================================================
     STICKY OFFSET
     ===================================================== */

  function controlsOffset() {
    const headerHeight =
      $('#siteHeader')
        ?.getBoundingClientRect()
        .height || 0;


    const controlsHeight =
      $('#menuControls')
        ?.getBoundingClientRect()
        .height || 0;


    return (
      headerHeight +
      controlsHeight +
      14
    );
  }


  function categorySection(
    categoryId
  ) {
    return (
      $$(
        '[data-category-section]',
        $('#menuContainer')
      )
        .find(
          section =>
            section.dataset
              .categorySection ===
            String(categoryId)
        ) ||
      null
    );
  }


  /* =====================================================
     SCROLL TO CATEGORY
     ===================================================== */

  function scrollToCategory(
    categoryId,
    behavior = 'smooth'
  ) {
    if (
      !categoryId ||
      normalize(
        state.query,
        currentLocale()
      )
    ) {
      return;
    }


    const target =
      categorySection(
        categoryId
      );


    if (!target) {
      return;
    }


    const top =
      Math.max(
        0,

        target
          .getBoundingClientRect()
          .top +

        window.scrollY -

        controlsOffset()
      );


    state.suppressCategorySpyUntil =
      Date.now() +
      (
        behavior === 'smooth'
          ? 900
          : 180
      );


    window.scrollTo({
      top,

      behavior:
        prefersReducedMotion()
          ? 'auto'
          : behavior
    });
  }


  /* =====================================================
     TAP CATEGORY REVEAL
     ===================================================== */

  function animateCategorySection(
    categoryId
  ) {
    if (
      prefersReducedMotion()
    ) {
      return;
    }


    const section =
      categorySection(
        categoryId
      );


    if (!section) {
      return;
    }


    /*
      Перезапускаем animation.
    */

    section.classList.remove(
      'category-tap-reveal'
    );


    void section.offsetWidth;


    $$(
      '.menu-card',
      section
    )
      .forEach(
        (
          card,
          index
        ) => {
          card.style.setProperty(
            '--card-delay',

            `${Math.min(
              index * 32,
              180
            )}ms`
          );
        }
      );


    section.classList.add(
      'category-tap-reveal'
    );


    window.setTimeout(
      () => {
        section.classList.remove(
          'category-tap-reveal'
        );


        $$(
          '.menu-card',
          section
        )
          .forEach(
            card =>
              card.style
                .removeProperty(
                  '--card-delay'
                )
          );
      },

      720
    );
  }


  function selectCategory(
    categoryId
  ) {
    if (
      state.modal.open ||
      state.modal.closing
    ) {
      return;
    }


    const valid =
      categoriesForType()
        .some(
          category =>
            category.id ===
            categoryId
        );


    if (!valid) {
      return;
    }


    state.categoryId =
      categoryId;


    updateCategoryTabs(
      categoryId,
      true
    );


    scrollToCategory(
      categoryId,
      'smooth'
    );


    /*
      Reveal запускается только
      при осознанном тапе пользователя.

      При обычном вертикальном scroll
      он НЕ запускается.
    */

    clearTimeout(
      state.categoryRevealTimer
    );


    state.categoryRevealTimer =
      window.setTimeout(
        () =>
          animateCategorySection(
            categoryId
          ),

        prefersReducedMotion()
          ? 0
          : 360
      );
  }


  /* =====================================================
     CATEGORY OBSERVER
     ===================================================== */

  function disconnectCategoryObserver() {
    state.categoryObserver
      ?.disconnect();


    state.categoryObserver =
      null;
  }


  function setupCategoryObserver() {
    disconnectCategoryObserver();


    if (
      !(
        'IntersectionObserver'
        in window
      ) ||

      normalize(
        state.query,
        currentLocale()
      )
    ) {
      return;
    }


    const sections =
      $$(
        '[data-category-section]',
        $('#menuContainer')
      );


    if (!sections.length) {
      return;
    }


    state.categoryObserver =
      new IntersectionObserver(
        () =>
          scheduleCategorySpy(),

        {
          root:
            null,

          rootMargin:
            `-${Math.round(
              controlsOffset()
            )}px 0px -55% 0px`,

          threshold:
            0
        }
      );


    sections.forEach(
      section =>
        state.categoryObserver
          .observe(section)
    );
  }


  /* =====================================================
     ACTIVE CATEGORY FROM PAGE SCROLL
     ===================================================== */

  function updateActiveCategoryFromScroll() {
    if (
      state.section !== 'menu' ||

      normalize(
        state.query,
        currentLocale()
      ) ||

      state.modal.open ||

      state.modal.closing ||

      Date.now() <
        state.suppressCategorySpyUntil
    ) {
      return;
    }


    const sections =
      $$(
        '[data-category-section]',
        $('#menuContainer')
      );


    if (!sections.length) {
      return;
    }


    const marker =
      controlsOffset() +
      10;


    let activeId =
      sections[0]
        .dataset
        .categorySection;


    for (
      const section of sections
    ) {
      if (
        section
          .getBoundingClientRect()
          .top <= marker
      ) {
        activeId =
          section.dataset
            .categorySection;
      } else {
        break;
      }
    }


    if (
      activeId &&
      activeId !==
        state.categoryId
    ) {
      state.categoryId =
        activeId;


      updateCategoryTabs(
        activeId,
        true
      );
    }
  }


  function scheduleCategorySpy() {
    if (
      state.scrollRaf
    ) {
      return;
    }


    state.scrollRaf =
      requestAnimationFrame(
        () => {
          state.scrollRaf =
            0;


          updateActiveCategoryFromScroll();
        }
      );
  }


  /* =====================================================
     PLACEHOLDER
     ===================================================== */

  function makePlaceholder() {
    return `
      <span
        class="menu-card__placeholder"
        aria-hidden="true"
      >
        <span class="menu-card__placeholder-inner">

          <span class="menu-card__monogram">
            N
          </span>

          <span class="menu-card__brand">
            NECTAR
          </span>

          <span class="menu-card__dot"></span>

        </span>
      </span>
    `;
  }


  /* =====================================================
     DISH CARD
     ===================================================== */

  function makeMenuCard(item) {
    const button =
      document.createElement(
        'button'
      );


    button.type =
      'button';


    button.className =
      'menu-card';


    button.dataset.itemKey =
      itemKey(item);


    button.setAttribute(
      'aria-label',
      itemName(item) ||
      'Menu item'
    );


    const image =
      itemImage(item);


    const description =
      itemDescription(item);


    const spicy =
      normalize(
        item?.note,
        'ru'
      ).includes('остр');


    button.innerHTML = `

      <span class="menu-card__media">

        ${makePlaceholder()}

        ${
          image
            ? `
              <img
                class="menu-card__image"
                src="${escapeHtml(image)}"
                alt=""
                loading="lazy"
                decoding="async"
              >
            `
            : ''
        }

      </span>


      <span class="menu-card__body">

        <span class="menu-card__title-row">

          <span class="menu-card__title">
            ${escapeHtml(
              itemName(item) ||
              '—'
            )}
          </span>

          ${
            spicy
              ? `
                <span
                  class="material-symbols-outlined menu-card__spicy"
                  aria-label="spicy"
                >
                  local_fire_department
                </span>
              `
              : ''
          }

        </span>


        ${
          description
            ? `
              <span class="menu-card__desc">
                ${escapeHtml(
                  description
                )}
              </span>
            `
            : ''
        }


        ${
          item?.weight
            ? `
              <span class="menu-card__weight">
                ${escapeHtml(
                  item.weight
                )}
              </span>
            `
            : ''
        }

      </span>


      <span class="menu-card__price">

        ${formatPrice(
          item?.price
        )}

        <small>₸</small>

      </span>

    `;


    /*
      Фото появляется мягко,
      когда реально загрузилось.
    */

    const img =
      $(
        '.menu-card__image',
        button
      );


    if (img) {
      const markLoaded =
        () =>
          img.classList.add(
            'is-loaded'
          );


      if (
        img.complete &&
        img.naturalWidth > 0
      ) {
        markLoaded();
      } else {
        img.addEventListener(
          'load',
          markLoaded,
          {
            once: true
          }
        );
      }


      /*
        Если изображение не найдено,
        оно удаляется.

        Под ним остаётся
        наш NECTAR placeholder.
      */

      img.addEventListener(
        'error',
        () =>
          img.remove(),

        {
          once: true
        }
      );
    }


    return button;
  }


  /* =====================================================
     GROUPING
     ===================================================== */

  function normalGroups(items) {
    const groups =
      [];


    const map =
      new Map();


    for (
      const item of items
    ) {
      const id =
        categoryIdOf(item);


      if (
        !map.has(id)
      ) {
        const group = {
          key:
            id,

          categoryId:
            id,

          type:
            item.type,

          title:
            itemCategory(item) ||
            id,

          items:
            []
        };


        map.set(
          id,
          group
        );


        groups.push(
          group
        );
      }


      map.get(id)
        .items
        .push(item);
    }


    return groups;
  }


  function searchGroups(items) {
    const groups =
      [];


    const map =
      new Map();


    for (
      const item of items
    ) {
      const categoryId =
        categoryIdOf(item);


      /*
        type входит в key,
        чтобы одинаковые category_id
        Kitchen и Bar не объединились.
      */

      const key =
        `${item.type}::${categoryId}`;


      if (
        !map.has(key)
      ) {
        const group = {
          key,

          categoryId,

          type:
            item.type,

          title:
            `${typeLabel(
              item.type
            )} · ${
              itemCategory(item) ||
              categoryId
            }`,

          items:
            []
        };


        map.set(
          key,
          group
        );


        groups.push(
          group
        );
      }


      map.get(key)
        .items
        .push(item);
    }


    return groups;
  }


  /* =====================================================
     SEARCH
     ===================================================== */

  function matchesSearch(
    item,
    query
  ) {
    const fields = [
      itemName(item),

      itemComposition(item),

      itemCategory(item),

      item?.name_ru,
      item?.name_kz,
      item?.name_en,

      item?.composition_ru,
      item?.composition_kz,
      item?.composition_en,

      item?.category_ru,
      item?.category_kz,
      item?.category_en
    ];


    return fields.some(
      field =>
        normalize(
          field,
          currentLocale()
        ).includes(query)
    );
  }


  function filteredItems() {
    const query =
      normalize(
        state.query,
        currentLocale()
      );


    /*
      Без search:
      только текущий Kitchen / Bar.
    */

    if (!query) {
      return itemsForType();
    }


    /*
      С search:
      поиск глобально
      Kitchen + Bar.
    */

    return visibleMenu()
      .filter(
        item =>
          matchesSearch(
            item,
            query
          )
      );
  }


  /* =====================================================
     MENU RENDER
     ===================================================== */

  function renderMenu(
    {
      reveal = false,
      motion = ''
    } = {}
  ) {
    const container =
      $('#menuContainer');


    const categoryNav =
      $('#categoryNav');


    const searchNote =
      $('#searchModeNote');


    if (!container) {
      return;
    }


    disconnectCategoryObserver();


    const query =
      normalize(
        state.query,
        currentLocale()
      );


    const items =
      filteredItems();


    /*
      Во время поиска категории
      скрываем.

      Search глобальный,
      поэтому category tabs
      больше не являются фильтром.
    */

    if (categoryNav) {
      categoryNav.hidden =
        Boolean(query);
    }


    if (searchNote) {
      searchNote.hidden =
        !query;


      searchNote.textContent =
        query
          ? (
              state.lang === 'EN'
                ? 'Search across Kitchen and Bar'

                : state.lang === 'KZ'
                  ? 'Асхана мен Бар бойынша іздеу'

                  : 'Поиск по Кухне и Бару'
            )
          : '';
    }


    /* =================================================
       EMPTY SEARCH
       ================================================= */

    if (!items.length) {
      const empty =
        document.createElement(
          'div'
        );


      empty.className =
        'empty-state';


      empty.innerHTML = `

        <strong>
          ${escapeHtml(
            t(
              'nothing_found',
              'Ничего не найдено'
            )
          )}
        </strong>

        <span>
          ${escapeHtml(
            t(
              'try_another_search',
              'Попробуйте изменить запрос.'
            )
          )}
        </span>

      `;


      container.replaceChildren(
        empty
      );


      updateCategoryTabs(
        null,
        false
      );


      return;
    }


    const groups =
      query
        ? searchGroups(items)
        : normalGroups(items);


    const fragment =
      document.createDocumentFragment();


    groups.forEach(
      (
        group,
        groupIndex
      ) => {
        const section =
          document.createElement(
            'section'
          );


        section.className =
          'category-section';


        section.dataset.groupType =
          group.type;


        if (!query) {
          section.dataset
            .categorySection =
              group.categoryId;
        }


        /*
          INTRO REVEAL

          Только один раз
          при первом входе.
        */

        if (
          reveal &&
          !state.revealPlayed
        ) {
          section.classList.add(
            'reveal-once'
          );


          section.style
            .setProperty(
              '--reveal-delay',

              `${Math.min(
                groupIndex * 65,
                280
              )}ms`
            );
        }


        const heading =
          document.createElement(
            'div'
          );


        heading.className =
          'category-heading';


        heading.innerHTML = `

          <span></span>

          <h2>
            ${escapeHtml(
              group.title
            )}
          </h2>

          <span></span>

        `;


        const list =
          document.createElement(
            'div'
          );


        list.className =
          'menu-list';


        for (
          const item of group.items
        ) {
          list.appendChild(
            makeMenuCard(item)
          );
        }


        section.append(
          heading,
          list
        );


        fragment.appendChild(
          section
        );
      }
    );


    container.replaceChildren(
      fragment
    );


    /* =================================================
       SEARCH MOTION
       ================================================= */

    if (query) {
      container.classList.remove(
        'search-results-enter'
      );


      void container.offsetWidth;


      container.classList.add(
        'search-results-enter'
      );
    }


    /* =================================================
       KITCHEN / BAR + LANGUAGE MOTION
       ================================================= */

    if (
      motion === 'type' ||
      motion === 'language'
    ) {
      container.classList.remove(
        'type-enter'
      );


      void container.offsetWidth;


      container.classList.add(
        'type-enter'
      );


      window.setTimeout(
        () =>
          container.classList.remove(
            'type-enter'
          ),

        480
      );
    }


    /* =================================================
       INITIAL REVEAL
       ================================================= */

    if (
      reveal &&
      !state.revealPlayed
    ) {
      requestAnimationFrame(
        () => {
          $$(
            '.reveal-once',
            container
          )
            .forEach(
              section =>
                section.classList.add(
                  'is-revealed'
                )
            );


          state.revealPlayed =
            true;
        }
      );
    }


    /* =================================================
       SCROLL SPY
       ================================================= */

    if (!query) {
      requestAnimationFrame(
        () => {
          setupCategoryObserver();

          updateActiveCategoryFromScroll();
        }
      );
    }
  }


  /* =====================================================
     SEARCH STATE
     ===================================================== */

  function updateSearchClear() {
    const button =
      $('#clearSearchBtn');


    if (!button) {
      return;
    }


    button.hidden =
      !normalize(
        $('#searchInput')?.value,
        currentLocale()
      );
  }


  function setSearch(value) {
    state.query =
      value;


    renderMenu();
  }


  function clearSearch(
    {
      focus = true
    } = {}
  ) {
    const input =
      $('#searchInput');


    if (input) {
      input.value = '';
    }


    clearTimeout(
      state.searchTimer
    );


    state.query =
      '';


    state.categoryId =
      firstCategoryId(
        state.type
      );


    updateSearchClear();

    renderCategories();

    renderMenu({
      motion: 'language'
    });


    requestAnimationFrame(
      () => {
        scrollToCategory(
          state.categoryId,

          prefersReducedMotion()
            ? 'auto'
            : 'smooth'
        );
      }
    );


    if (
      focus &&
      input
    ) {
      try {
        input.focus({
          preventScroll: true
        });
      } catch {
        /* noop */
      }
    }
  }


  /* =====================================================
     MENU / INFO SCROLL MEMORY
     ===================================================== */

  function rememberSectionScroll() {
    state.sectionScroll[
      state.section
    ] = window.scrollY;
  }


  function instantScrollTo(y) {
    const root =
      document.documentElement;


    const previous =
      root.style.scrollBehavior;


    root.style.scrollBehavior =
      'auto';


    window.scrollTo(
      0,
      Math.max(
        0,
        y
      )
    );


    requestAnimationFrame(
      () => {
        root.style.scrollBehavior =
          previous;
      }
    );
  }


  function switchSection(section) {
    if (
      ![
        'menu',
        'info'
      ].includes(section) ||

      section === state.section ||

      state.modal.open ||

      state.modal.closing
    ) {
      return;
    }


    rememberSectionScroll();


    state.section =
      section;


    $('#menu-section')
      ?.classList.toggle(
        'is-active',
        section === 'menu'
      );


    $('#info-section')
      ?.classList.toggle(
        'is-active',
        section === 'info'
      );


    $$('.bottom-nav__button')
      .forEach(button => {
        const active =
          button.dataset.path ===
          section;


        button.classList.toggle(
          'is-active',
          active
        );


        button.setAttribute(
          'aria-current',
          active
            ? 'page'
            : 'false'
        );
      });


    const y =
      state.sectionScroll[
        section
      ] || 0;


    requestAnimationFrame(
      () => {
        instantScrollTo(y);


        if (
          section === 'menu'
        ) {
          scheduleCategorySpy();
        }
      }
    );
  }


  /* =====================================================
     MODAL SCROLL LOCK

     ВАЖНО:
     Swipe-to-close отсутствует.
     ===================================================== */

  function lockPageAtCurrentScroll() {

    /*
      Сохраняем положение ДО
      изменения position у body.
    */

    const y =
      Math.max(
        0,

        window.scrollY ||
        window.pageYOffset ||
        0
      );


    state.modal.scrollY =
      y;


    state.sectionScroll[
      state.section
    ] = y;


    /*
      На desktop компенсируем
      исчезновение scrollbar.
    */

    const scrollbarWidth =
      Math.max(
        0,

        window.innerWidth -
        document.documentElement
          .clientWidth
      );


    if (scrollbarWidth) {
      document.body.style
        .paddingRight =
          `${scrollbarWidth}px`;
    }


    document.body.style.position =
      'fixed';


    document.body.style.top =
      `-${y}px`;


    document.body.style.left =
      '0';


    document.body.style.right =
      '0';


    document.body.style.width =
      '100%';


    document.body.classList.add(
      'modal-open'
    );


    /*
      ScrollSpy временно выключен.
    */

    state.suppressCategorySpyUntil =
      Number.MAX_SAFE_INTEGER;
  }


  function releasePageLock() {
    document.body.classList.remove(
      'modal-open'
    );


    document.body.style.position =
      '';


    document.body.style.top =
      '';


    document.body.style.left =
      '';


    document.body.style.right =
      '';


    document.body.style.width =
      '';


    document.body.style.paddingRight =
      '';
  }


  /* =====================================================
     ROBUST SCROLL RESTORE
     ===================================================== */

  function restoreScrollPosition(
    targetY,
    callback
  ) {
    const token =
      ++state.modal.restoreToken;


    const root =
      document.documentElement;


    const oldScrollBehavior =
      root.style.scrollBehavior;


    root.style.scrollBehavior =
      'auto';


    let attempt =
      0;


    const restore =
      () => {
        if (
          token !==
          state.modal.restoreToken
        ) {
          return;
        }


        attempt += 1;


        window.scrollTo(
          0,
          targetY
        );


        requestAnimationFrame(
          () => {
            if (
              token !==
              state.modal.restoreToken
            ) {
              return;
            }


            const actualY =
              window.scrollY ||
              window.pageYOffset ||
              0;


            const difference =
              Math.abs(
                actualY -
                targetY
              );


            const done =
              difference <=
                SCROLL_RESTORE_TOLERANCE ||

              attempt >=
                SCROLL_RESTORE_MAX_ATTEMPTS;


            /*
              Браузер ещё не успел
              вернуть layout.
            */

            if (!done) {
              restore();

              return;
            }


            root.style.scrollBehavior =
              oldScrollBehavior;


            state.sectionScroll[
              state.section
            ] = targetY;


            state.suppressCategorySpyUntil =
              Date.now() +
              250;


            if (
              typeof callback ===
              'function'
            ) {
              callback();
            }


            requestAnimationFrame(
              scheduleCategorySpy
            );
          }
        );
      };


    /*
      Первый restore только
      на следующем layout frame.
    */

    requestAnimationFrame(
      restore
    );
  }


  /* =====================================================
     SAFE FOCUS RESTORE
     ===================================================== */

  function safelyRestoreFocus(
    element,
    expectedScrollY
  ) {
    if (
      !(
        element instanceof
        HTMLElement
      ) ||

      !document.contains(element)
    ) {
      return;
    }


    try {
      element.focus({
        preventScroll: true
      });
    } catch {
      /*
        Не вызываем обычный focus(),
        потому что Safari может
        прокрутить страницу.
      */

      return;
    }


    /*
      Дополнительная защита:
      некоторые мобильные браузеры
      могут проигнорировать
      preventScroll.
    */

    requestAnimationFrame(
      () => {
        if (
          Math.abs(
            window.scrollY -
            expectedScrollY
          ) >
          SCROLL_RESTORE_TOLERANCE
        ) {
          instantScrollTo(
            expectedScrollY
          );
        }
      }
    );
  }


  /* =====================================================
     MODAL IMAGE
     ===================================================== */

  function setModalImage(item) {
    const wrap =
      $('#modalImageContainer');


    const image =
      $('#modalImage');


    const skeleton =
      wrap
        ? $(
            '.image-skeleton',
            wrap
          )
        : null;


    if (
      !wrap ||
      !image
    ) {
      return;
    }


    const src =
      itemImage(item);


    image.classList.remove(
      'is-loaded'
    );


    /*
      Нет фото:
      просто скрываем image area.

      Modal остаётся компактным.
    */

    if (!src) {
      image.removeAttribute(
        'src'
      );


      image.alt =
        '';


      wrap.hidden =
        true;


      return;
    }


    wrap.hidden =
      false;


    if (skeleton) {
      skeleton.hidden =
        false;
    }


    image.src =
      src;


    image.alt =
      itemName(item);


    const loaded =
      () => {
        image.classList.add(
          'is-loaded'
        );


        if (skeleton) {
          skeleton.hidden =
            true;
        }
      };


    if (
      image.complete &&
      image.naturalWidth > 0
    ) {
      loaded();
    } else {
      image.addEventListener(
        'load',
        loaded,
        {
          once: true
        }
      );
    }
  }


  /* =====================================================
     OPEN MODAL
     ===================================================== */

  function openModal(item) {
    if (
      state.modal.open ||

      state.modal.closing ||

      !item
    ) {
      return;
    }


    const modal =
      $('#itemModal');


    if (!modal) {
      return;
    }


    state.modal.previousFocus =
      document.activeElement
        instanceof HTMLElement
          ? document.activeElement
          : null;


    const title =
      $('#modalTitle');


    if (title) {
      title.textContent =
        itemName(item) ||
        '—';
    }


    const price =
      $('#modalPrice');


    if (price) {
      price.innerHTML =
        `${formatPrice(
          item?.price
        )} <small>₸</small>`;
    }


    const weight =
      $('#modalWeight');


    if (weight) {
      weight.textContent =
        item?.weight ||
        '';
    }


    const composition =
      itemComposition(item);


    const ingredients =
      $('#modalIngredientsContainer');


    const ingredientsText =
      $('#modalIngredients');


    if (ingredientsText) {
      ingredientsText.textContent =
        composition;
    }


    if (ingredients) {
      ingredients.hidden =
        !composition;
    }


    /*
      Фото устанавливаем
      ДО lock body.
    */

    setModalImage(item);


    /*
      Сохраняем scroll
      ДО показа modal.
    */

    lockPageAtCurrentScroll();


    state.modal.open =
      true;


    state.modal.closing =
      false;


    modal.hidden =
      false;


    requestAnimationFrame(
      () => {
        modal.classList.add(
          'is-open'
        );


        /*
          Focus с preventScroll.
        */

        try {
          $('#modalCloseButton')
            ?.focus({
              preventScroll: true
            });
        } catch {
          /* noop */
        }
      }
    );
  }


  /* =====================================================
     CLOSE MODAL
     ===================================================== */

  function closeModal() {
    const modal =
      $('#itemModal');


    if (
      !modal ||

      !state.modal.open ||

      state.modal.closing
    ) {
      return;
    }


    state.modal.closing =
      true;


    /*
      Эти значения фиксируем
      для конкретного close-cycle.
    */

    const restoreY =
      state.modal.scrollY;


    const previousFocus =
      state.modal.previousFocus;


    /*
      Запускаем premium
      close animation.
    */

    modal.classList.remove(
      'is-open'
    );


    clearTimeout(
      state.modal.closeTimer
    );


    state.modal.closeTimer =
      window.setTimeout(
        () => {

          /*
            1.
            Modal скрываем.
          */

          modal.hidden =
            true;


          /*
            2.
            Возвращаем нормальный
            document flow.
          */

          releasePageLock();


          /*
            3.
            Modal логически закрыт.
          */

          state.modal.open =
            false;


          state.modal.closing =
            false;


          state.modal.previousFocus =
            null;


          /*
            4.
            Возвращаем пользователя
            ровно туда, где он был.
          */

          restoreScrollPosition(
            restoreY,

            () => {

              /*
                5.
                Только после восстановления
                координаты возвращаем focus.
              */

              safelyRestoreFocus(
                previousFocus,
                restoreY
              );
            }
          );
        },

        MODAL_ANIMATION_MS
      );
  }


  /* =====================================================
     FOCUS TRAP
     ===================================================== */

  function trapModalFocus(event) {
    if (
      !state.modal.open ||

      event.key !== 'Tab'
    ) {
      return;
    }


    const dialog =
      $('#modalDialog');


    if (!dialog) {
      return;
    }


    const focusables =
      $$(
        `
          button:not([disabled]),
          [href],
          input:not([disabled]),
          [tabindex]:not([tabindex="-1"])
        `,

        dialog
      )
        .filter(
          element =>
            !element.hidden &&
            element.offsetParent !==
              null
        );


    if (!focusables.length) {
      return;
    }


    const first =
      focusables[0];


    const last =
      focusables[
        focusables.length - 1
      ];


    if (
      event.shiftKey &&
      document.activeElement ===
        first
    ) {
      event.preventDefault();

      last.focus();

      return;
    }


    if (
      !event.shiftKey &&
      document.activeElement ===
        last
    ) {
      event.preventDefault();

      first.focus();
    }
  }


  /* =====================================================
     INFO ACCORDION
     ===================================================== */

  function toggleAccordion(
    button
  ) {
    const panel =
      button?.nextElementSibling;


    if (!panel) {
      return;
    }


    const wasOpen =
      button.getAttribute(
        'aria-expanded'
      ) === 'true';


    button.setAttribute(
      'aria-expanded',
      String(!wasOpen)
    );


    button.classList.toggle(
      'is-open',
      !wasOpen
    );


    panel.hidden =
      wasOpen;
  }


  /* =====================================================
     WINDOW SCROLL
     ===================================================== */

  function onWindowScroll() {

    /*
      Никогда не записываем
      window.scrollY пока body fixed.

      Иначе могли бы сохранить 0
      вместо реальной позиции.
    */

    if (
      state.modal.open ||
      state.modal.closing
    ) {
      return;
    }


    state.sectionScroll[
      state.section
    ] = window.scrollY;


    scheduleCategorySpy();
  }


  /* =====================================================
     EVENTS
     ===================================================== */

  function initEvents() {

    /* LANGUAGE */

    $$('.lang-btn')
      .forEach(button => {
        button.addEventListener(
          'click',
          () =>
            switchLang(
              button.dataset.lang
            )
        );
      });


    /* KITCHEN / BAR */

    $$('.main-tab')
      .forEach(button => {
        button.addEventListener(
          'click',
          () =>
            setType(
              button.dataset.type
            )
        );
      });


    /* BOTTOM NAV */

    $$('.bottom-nav__button')
      .forEach(button => {
        button.addEventListener(
          'click',
          () =>
            switchSection(
              button.dataset.path
            )
        );
      });


    /* INFO */

    $$('.accordion-trigger')
      .forEach(button => {
        button.addEventListener(
          'click',
          () =>
            toggleAccordion(
              button
            )
        );
      });


    /* MODAL CLOSE */

    $$('[data-modal-close]')
      .forEach(element => {
        element.addEventListener(
          'click',
          closeModal
        );
      });


    /* CATEGORY CLICK */

    $('#categoryStrip')
      ?.addEventListener(
        'click',
        event => {
          const button =
            event.target.closest(
              '.category-tab'
            );


          if (!button) {
            return;
          }


          selectCategory(
            button.dataset
              .categoryId
          );
        }
      );


    /* CATEGORY HORIZONTAL SCROLL */

    $('#categoryStrip')
      ?.addEventListener(
        'scroll',
        updateCategoryEdgeFades,
        {
          passive: true
        }
      );


    /* MENU CARD CLICK */

    $('#menuContainer')
      ?.addEventListener(
        'click',
        event => {
          const card =
            event.target.closest(
              '.menu-card'
            );


          if (!card) {
            return;
          }


          const item =
            visibleMenu()
              .find(
                entry =>
                  itemKey(entry) ===
                  card.dataset.itemKey
              );


          if (item) {
            openModal(item);
          }
        }
      );


    /* CLEAR SEARCH */

    $('#clearSearchBtn')
      ?.addEventListener(
        'click',
        () =>
          clearSearch()
      );


    /* BRAND HOME */

    $('#brandHome')
      ?.addEventListener(
        'click',
        event => {
          event.preventDefault();


          if (
            state.modal.open ||
            state.modal.closing
          ) {
            return;
          }


          if (
            state.section !==
            'menu'
          ) {
            switchSection(
              'menu'
            );
          }


          requestAnimationFrame(
            () => {
              window.scrollTo({
                top: 0,

                behavior:
                  prefersReducedMotion()
                    ? 'auto'
                    : 'smooth'
              });
            }
          );
        }
      );


    /* SEARCH */

    $('#searchInput')
      ?.addEventListener(
        'input',
        event => {
          updateSearchClear();


          clearTimeout(
            state.searchTimer
          );


          const value =
            event.currentTarget
              .value;


          state.searchTimer =
            window.setTimeout(
              () =>
                setSearch(
                  value
                ),

              SEARCH_DEBOUNCE_MS
            );
        }
      );


    $('#searchInput')
      ?.addEventListener(
        'keydown',
        event => {
          if (
            event.key ===
              'Escape' &&

            event.currentTarget
              .value
          ) {
            clearSearch({
              focus: false
            });
          }
        }
      );


    /* MODAL IMAGE ERROR */

    $('#modalImage')
      ?.addEventListener(
        'error',
        () => {
          const wrap =
            $('#modalImageContainer');


          if (wrap) {
            wrap.hidden =
              true;
          }
        }
      );


    /* HERO FALLBACK */

    $('.hero__image')
      ?.addEventListener(
        'error',
        event => {
          event.currentTarget
            .classList.add(
              'is-missing'
            );


          $('.hero')
            ?.classList.add(
              'hero--fallback'
            );
        }
      );


    /* KEYBOARD */

    document.addEventListener(
      'keydown',
      event => {
        if (
          event.key ===
            'Escape' &&

          state.modal.open
        ) {
          closeModal();
        }


        trapModalFocus(
          event
        );
      }
    );


    /* VERTICAL SCROLL */

    window.addEventListener(
      'scroll',
      onWindowScroll,
      {
        passive: true
      }
    );


    /* RESIZE */

    window.addEventListener(
      'resize',
      () => {
        if (
          state.modal.open ||
          state.modal.closing
        ) {
          return;
        }


        requestAnimationFrame(
          () => {
            setupCategoryObserver();

            updateActiveCategoryFromScroll();

            updateCategoryTabs(
              state.categoryId,
              false
            );

            updateCategoryEdgeFades();
          }
        );
      },

      {
        passive: true
      }
    );


    /* SAFARI BFCache */

    window.addEventListener(
      'pageshow',
      event => {
        if (
          !event.persisted
        ) {
          return;
        }


        state.modal.open =
          false;


        state.modal.closing =
          false;


        releasePageLock();


        requestAnimationFrame(
          () => {
            setupCategoryObserver();

            scheduleCategorySpy();

            updateCategoryEdgeFades();
          }
        );
      }
    );
  }


  /* =====================================================
     DATA VALIDATION
     ===================================================== */

  function validateData() {
    const menu =
      getMenu();


    if (!menu.length) {
      console.error(
        'NECTAR: MENU data is missing or empty.'
      );

      return;
    }


    const keys =
      menu.map(
        itemKey
      );


    const duplicates =
      keys.filter(
        (
          key,
          index,
          all
        ) =>
          all.indexOf(key) !==
          index
      );


    if (
      duplicates.length
    ) {
      console.warn(
        'NECTAR: duplicate menu item keys detected:',

        [
          ...new Set(
            duplicates
          )
        ]
      );
    }
  }


  /* =====================================================
     INIT
     ===================================================== */

  function init() {
    validateData();


    /*
      Стартуем с Kitchen.
    */

    state.categoryId =
      firstCategoryId(
        'kitchen'
      );


    state.sectionScroll.menu =
      window.scrollY;


    applyTranslations();

    updateMainTabs();

    renderCategories();


    /*
      Первоначальный красивый
      reveal запускается один раз.
    */

    renderMenu({
      reveal: true
    });


    initEvents();


    requestAnimationFrame(
      () => {
        setupCategoryObserver();

        updateActiveCategoryFromScroll();

        updateCategoryEdgeFades();
      }
    );


    /*
      После загрузки web fonts
      геометрия текста может
      немного измениться.

      Поэтому пересчитываем
      indicator и observer,
      но НЕ трогаем scroll.
    */

    document.fonts?.ready
      ?.then(
        () => {
          if (
            !state.modal.open &&
            !state.modal.closing
          ) {
            setupCategoryObserver();

            updateActiveCategoryFromScroll();

            updateCategoryTabs(
              state.categoryId,
              false
            );

            updateCategoryEdgeFades();
          }
        }
      )
      .catch(
        () => {}
      );
  }


  /* =====================================================
     START
     ===================================================== */

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }

})();
