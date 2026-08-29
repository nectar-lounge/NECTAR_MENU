(() => {
  'use strict';

  const state = {
    lang: 'RU',
    section: 'menu',
    type: 'kitchen',
    categoryId: null,
    query: '',
    modalItemId: null,
    searchTimer: null,
    scrollLockY: 0,
    previousFocus: null
  };


  /* =====================================================
     HELPERS
     ===================================================== */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));


  const getKey = (prefix) =>
    `${prefix}_${state.lang.toLowerCase()}`;


  /*
    В BAR сознательно показываем только две категории:
    lemonades + tea.
  */

  const SAFE_BAR_CATEGORIES = new Set([
    'lemonades',
    'tea'
  ]);


  function getMenuSource() {

    /*
      menu-data.js использует:

      const MENU = [...]

      а не window.MENU.

      Поэтому обращаемся к глобальному lexical scope.
    */

    return (
      typeof MENU !== 'undefined' &&
      Array.isArray(MENU)
    )
      ? MENU
      : [];
  }


  function getVisibleMenu() {

    return getMenuSource().filter(item => {

      if (item.type === 'kitchen') {
        return true;
      }

      if (item.type !== 'bar') {
        return false;
      }

      return SAFE_BAR_CATEGORIES.has(
        String(item.category_id || '').toLowerCase()
      );
    });
  }


  function getItemsForType(type = state.type) {

    return getVisibleMenu().filter(
      item => item.type === type
    );
  }


  function getCategoryKey() {
    return getKey('category');
  }


  function getNameKey() {
    return getKey('name');
  }


  function getCompositionKey() {
    return getKey('composition');
  }


  function getCategoryList(type = state.type) {

    const categoryKey = getCategoryKey();

    const seen = new Set();
    const categories = [];

    getItemsForType(type).forEach(item => {

      const id =
        item.category_id ||
        item[categoryKey] ||
        'uncategorized';

      if (seen.has(id)) {
        return;
      }

      seen.add(id);

      categories.push({
        id,
        name:
          item[categoryKey] ||
          item.category_ru ||
          '—'
      });

    });

    return categories;
  }


  function firstCategoryId(type = state.type) {

    return getCategoryList(type)[0]?.id || null;
  }


  function categoryName(
    categoryId,
    type = state.type
  ) {

    const categoryKey = getCategoryKey();

    const item =
      getItemsForType(type)
        .find(
          entry =>
            entry.category_id === categoryId
        );

    return (
      item?.[categoryKey] ||
      item?.category_ru ||
      categoryId
    );
  }


  function normalizeText(value) {

    return String(value ?? '')
      .toLocaleLowerCase(
        state.lang === 'KZ'
          ? 'kk'
          : state.lang === 'RU'
            ? 'ru'
            : 'en'
      )
      .normalize('NFKC')
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

    if (!Number.isFinite(number)) {
      return escapeHtml(value);
    }

    return new Intl.NumberFormat(
      state.lang === 'KZ'
        ? 'kk-KZ'
        : state.lang === 'EN'
          ? 'en-US'
          : 'ru-RU'
    ).format(number);
  }


  function translate(key, fallback = '') {

    const dictionary =
      typeof TRANSLATIONS !== 'undefined'
        ? TRANSLATIONS
        : {};

    return (
      dictionary?.[state.lang]?.[key] ??
      fallback
    );
  }


  /* =====================================================
     LANGUAGE
     ===================================================== */

  function setLanguageUI() {

    document.documentElement.lang =
      state.lang === 'KZ'
        ? 'kk'
        : state.lang.toLowerCase();


    $$('[data-i18n]').forEach(element => {

      const key = element.dataset.i18n;

      const value = translate(key);

      if (value) {
        element.textContent = value;
      }

    });


    $$('[data-i18n-placeholder]')
      .forEach(element => {

        const value =
          translate(
            element.dataset.i18nPlaceholder
          );

        if (value) {
          element.setAttribute(
            'placeholder',
            value
          );
        }

      });


    $$('.lang-btn').forEach(button => {

      const active =
        button.dataset.lang === state.lang;

      button.classList.toggle(
        'is-active',
        active
      );

      button.setAttribute(
        'aria-pressed',
        String(active)
      );

    });


    $$('.bottom-nav-btn')
      .forEach(button => {

        const active =
          button.dataset.path === state.section;

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

  }


  function switchLang(lang) {

    const dictionary =
      typeof TRANSLATIONS !== 'undefined'
        ? TRANSLATIONS
        : {};

    if (!dictionary[lang]) {
      return;
    }


    state.lang = lang;

    /*
      Поиск сбрасываем.
      Иначе клиент мог искать старый запрос,
      а визуально уже видеть другой язык.
    */

    state.query = '';


    /*
      ВАЖНО:

      После смены языка всегда открываем
      первую категорию текущего типа.

      Кухня → Холодные закуски
      Бар → первая категория бара.
    */

    state.categoryId =
      firstCategoryId(
        state.type
      );


    const input =
      $('#searchInput');

    if (input) {
      input.value = '';
    }


    updateSearchClearButton();

    setLanguageUI();

    renderCategories();

    renderMenu();


    observerSuppressedUntil =
      Date.now() + 700;


    requestAnimationFrame(() => {

      scrollToCategory(
        state.categoryId,
        'auto'
      );

    });

  }


  /* =====================================================
     MENU / INFO
     ===================================================== */

  function switchSection(sectionId) {

    if (
      !['menu', 'info']
        .includes(sectionId)
    ) {
      return;
    }


    state.section = sectionId;


    $('#menu-section')
      ?.classList.toggle(
        'is-active',
        sectionId === 'menu'
      );


    $('#info-section')
      ?.classList.toggle(
        'is-active',
        sectionId === 'info'
      );


    setLanguageUI();


    window.scrollTo({
      top: 0,
      behavior: 'auto'
    });


    if (sectionId === 'menu') {

      requestAnimationFrame(() => {
        renderMenu();
      });

    }

  }


  /* =====================================================
     KITCHEN / BAR
     ===================================================== */

  function setMainType(type) {

    if (
      !['kitchen', 'bar']
        .includes(type)
    ) {
      return;
    }


    if (state.type === type) {
      return;
    }


    state.type = type;

    state.query = '';

    state.categoryId =
      firstCategoryId(type);


    const input =
      $('#searchInput');

    if (input) {
      input.value = '';
    }


    updateSearchClearButton();

    updateMainTypeUI();

    renderCategories();

    renderMenu();


    observerSuppressedUntil =
      Date.now() + 900;


    requestAnimationFrame(() => {

      scrollToCategory(
        state.categoryId,
        'smooth'
      );

    });

  }


  function updateMainTypeUI() {

    const indicator =
      $('#nav-indicator');


    if (indicator) {

      indicator.style.transform =
        state.type === 'bar'
          ? 'translateX(100%)'
          : 'translateX(0)';

    }


    $$('.nav-btn').forEach(button => {

      const active =
        button.dataset.type === state.type;


      button.classList.toggle(
        'is-active',
        active
      );


      button.setAttribute(
        'aria-selected',
        String(active)
      );

    });

  }


  /* =====================================================
     CATEGORY NAVIGATION
     ===================================================== */

  function renderCategories() {

    const container =
      $('#categoryContainer');

    if (!container) {
      return;
    }


    const categories =
      getCategoryList(
        state.type
      );


    if (
      !state.categoryId ||
      !categories.some(
        category =>
          category.id === state.categoryId
      )
    ) {

      state.categoryId =
        categories[0]?.id || null;

    }


    container.innerHTML = '';


    const fragment =
      document.createDocumentFragment();


    categories.forEach(category => {

      const button =
        document.createElement('button');


      button.type = 'button';

      button.className =
        'category-btn';


      button.dataset.category =
        category.id;


      button.textContent =
        category.name;


      button.setAttribute(
        'aria-label',
        category.name
      );


      button.setAttribute(
        'aria-selected',
        String(
          category.id === state.categoryId
        )
      );


      button.addEventListener(
        'click',
        () =>
          selectCategory(
            category.id
          )
      );


      fragment.appendChild(button);

    });


    container.appendChild(
      fragment
    );


    updateCategoryButtons();

  }


  function updateCategoryButtons(
    activeId = state.categoryId
  ) {

    $$('.category-btn')
      .forEach(button => {

        const active =
          button.dataset.category === activeId;


        button.classList.toggle(
          'is-active',
          active
        );


        button.setAttribute(
          'aria-selected',
          String(active)
        );

      });

  }


  function selectCategory(categoryId) {

    const valid =
      getCategoryList(
        state.type
      ).some(
        category =>
          category.id === categoryId
      );


    if (!valid) {
      return;
    }


    state.categoryId =
      categoryId;


    /*
      Не позволяем IntersectionObserver
      перехватывать состояние во время
      smooth scroll.
    */

    observerSuppressedUntil =
      Date.now() + 800;


    updateCategoryButtons(
      categoryId
    );


    scrollToCategory(
      categoryId,
      'smooth'
    );

  }


  function scrollToCategory(
    categoryId,
    behavior = 'smooth'
  ) {

    if (
      !categoryId ||
      state.query
    ) {
      return;
    }


    const section =
      document.querySelector(
        `[data-category-section="${CSS.escape(
          String(categoryId)
        )}"]`
      );


    if (!section) {
      return;
    }


    const header =
      $('.site-header');

    const sticky =
      $('.menu-sticky');


    const offset =
      (
        header?.getBoundingClientRect()
          .height || 0
      ) +
      (
        sticky?.getBoundingClientRect()
          .height || 0
      ) +
      18;


    const top =
      Math.max(
        0,
        section.getBoundingClientRect()
          .top +
          window.scrollY -
          offset
      );


    if (
      behavior === 'smooth'
    ) {

      observerSuppressedUntil =
        Math.max(
          observerSuppressedUntil,
          Date.now() + 800
        );

    }


    window.scrollTo({
      top,
      behavior
    });

  }


  /* =====================================================
     SEARCH
     ===================================================== */

  function searchMatches(
    item,
    query
  ) {

    if (!query) {
      return true;
    }


    const nameKey =
      getNameKey();

    const compositionKey =
      getCompositionKey();

    const categoryKey =
      getCategoryKey();


    const fields = [

      item[nameKey],

      item[compositionKey],

      item[categoryKey],

      /*
        Ищем также по всем языкам.

        Это важно:

        клиент на RU может ввести
        английское название,
        а клиент на EN —
        русское.
      */

      item.name_ru,
      item.name_kz,
      item.name_en,

      item.composition_ru,
      item.composition_kz,
      item.composition_en,

      item.category_ru,
      item.category_kz,
      item.category_en

    ];


    return fields.some(
      field =>
        normalizeText(field)
          .includes(query)
    );

  }


  function getFilteredItems() {

    const query =
      normalizeText(
        state.query
      );


    /*
      Обычный режим:

      только текущая секция
      Kitchen / Bar.
    */

    let items =
      getItemsForType(
        state.type
      );


    /*
      Поиск:

      ГЛОБАЛЬНЫЙ.

      Kitchen + safe Bar.
    */

    if (query) {

      items =
        getVisibleMenu()
          .filter(
            item =>
              searchMatches(
                item,
                query
              )
          );

    }


    return items;

  }


  /* =====================================================
     MENU RENDER
     ===================================================== */

  function renderMenu() {

    const container =
      $('#menuContainer');

    if (!container) {
      return;
    }


    const items =
      getFilteredItems();


    const categoryKey =
      getCategoryKey();

    const nameKey =
      getNameKey();

    const compositionKey =
      getCompositionKey();

    const query =
      normalizeText(
        state.query
      );


    container.innerHTML = '';


    const fragment =
      document.createDocumentFragment();


    /* EMPTY */

    if (!items.length) {

      const empty =
        document.createElement('div');


      empty.className =
        'empty-state';


      empty.innerHTML = `

        <strong>
          ${escapeHtml(
            translate(
              'nothing_found',
              'Ничего не найдено'
            )
          )}
        </strong>

        <span>
          ${escapeHtml(
            translate(
              'try_another_search',
              'Попробуйте изменить запрос.'
            )
          )}
        </span>

      `;


      fragment.appendChild(
        empty
      );


      container.appendChild(
        fragment
      );


      updateCategoryButtons(null);

      return;

    }


    /*
      Получаем категории в порядке
      появления в MENU.
    */

    const categoryIds = [];

    const seen =
      new Set();


    items.forEach(item => {

      const id =
        item.category_id ||
        item[categoryKey] ||
        'uncategorized';


      if (!seen.has(id)) {

        seen.add(id);

        categoryIds.push(id);

      }

    });


    categoryIds.forEach(
      categoryId => {

        const categoryItems =
          items.filter(
            item =>
              (
                item.category_id ||
                item[categoryKey] ||
                'uncategorized'
              ) === categoryId
          );


        if (!categoryItems.length) {
          return;
        }


        const section =
          document.createElement(
            'section'
          );


        section.className =
          'category-section';


        section.dataset.categorySection =
          categoryId;


        section.dataset.type =
          state.type;


        /*
          CATEGORY TITLE
        */

        const title =
          document.createElement(
            'div'
          );


        title.className =
          'category-heading';


        title.innerHTML = `

          <span></span>

          <h2>
            ${escapeHtml(
              categoryName(
                categoryId,
                state.type
              )
            )}
          </h2>

          <span></span>

        `;


        section.appendChild(
          title
        );


        /*
          ITEMS
        */

        const list =
          document.createElement(
            'div'
          );


        list.className =
          'menu-list';


        categoryItems.forEach(
          item => {

            const card =
              document.createElement(
                'button'
              );


            card.type = 'button';

            card.className =
              'menu-card';


            card.dataset.itemId =
              item.id;


            card.setAttribute(
              'aria-label',
              item[nameKey] ||
              item.name_ru ||
              'Menu item'
            );


            const spicy =
              item.note &&
              normalizeText(
                item.note
              ).includes('остр');


            const composition =
              item[compositionKey] ||
              '';


            card.innerHTML = `

              <span class="menu-card-main">

                <span class="menu-card-title">
                  ${escapeHtml(
                    item[nameKey] ||
                    item.name_ru ||
                    '—'
                  )}
                </span>

                ${
                  spicy
                    ? `
                      <span
                        class="spicy-mark"
                        aria-label="spicy"
                      >
                        ●
                      </span>
                    `
                    : ''
                }

                <span
                  class="menu-card-hint"
                  aria-hidden="true"
                >
                  info
                </span>

              </span>


              <span class="menu-card-meta">

                <span class="menu-card-price">

                  ${formatPrice(
                    item.price
                  )}

                  <small>₸</small>

                </span>

              </span>


              <span class="sr-only">

                ${escapeHtml(
                  composition
                )}

              </span>

            `;


            card.addEventListener(
              'click',
              () =>
                openModal(item)
            );


            list.appendChild(
              card
            );

          }
        );


        section.appendChild(
          list
        );


        fragment.appendChild(
          section
        );

      }
    );


    container.appendChild(
      fragment
    );


    /*
      При поиске IntersectionObserver
      не нужен.
    */

    if (query) {

      updateCategoryButtons(
        null
      );

    } else {

      updateCategoryButtons(
        state.categoryId
      );

      setupCategoryObserver();

    }

  }


  /* =====================================================
     INTERSECTION OBSERVER
     ===================================================== */

  let categoryObserver = null;

  let observerSuppressedUntil = 0;


  function setupCategoryObserver() {

    if (categoryObserver) {

      categoryObserver.disconnect();

      categoryObserver = null;

    }


    if (
      !('IntersectionObserver' in window) ||
      state.query
    ) {
      return;
    }


    const sections =
      $$('.category-section', $('#menuContainer'));


    if (!sections.length) {
      return;
    }


    categoryObserver =
      new IntersectionObserver(
        entries => {

          if (
            Date.now() <
            observerSuppressedUntil
          ) {
            return;
          }


          const visible =
            entries

              .filter(
                entry =>
                  entry.isIntersecting
              )

              .sort(
                (a, b) =>
                  a.boundingClientRect.top -
                  b.boundingClientRect.top
              );


          const first =
            visible[0];


          if (!first) {
            return;
          }


          const id =
            first.target
              .dataset
              .categorySection;


          if (
            id &&
            id !== state.categoryId
          ) {

            state.categoryId =
              id;


            updateCategoryButtons(
              id
            );


            centerCategoryButton(
              id
            );

          }

        },
        {

          root: null,

          /*
            Активной становится категория,
            когда она находится примерно
            в верхней центральной зоне.
          */

          rootMargin:
            '-30% 0px -55% 0px',

          threshold: 0

        }
      );


    sections.forEach(
      section =>
        categoryObserver.observe(
          section
        )
    );

  }


  function centerCategoryButton(
    categoryId
  ) {

    const button =
      document.querySelector(
        `.category-btn[data-category="${CSS.escape(
          String(categoryId)
        )}"]`
      );


    if (!button) {
      return;
    }


    button.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });

  }


  /* =====================================================
     SEARCH STATE
     ===================================================== */

  function setSearch(query) {

    state.query = query;

    renderMenu();

  }


  function updateSearchClearButton() {

    const button =
      $('#clearSearchBtn');


    if (!button) {
      return;
    }


    const hasValue =
      Boolean(
        normalizeText(
          $('#searchInput')?.value
        )
      );


    button.hidden =
      !hasValue;

  }


  function clearSearch() {

    const input =
      $('#searchInput');


    if (input) {
      input.value = '';
    }


    state.query = '';


    updateSearchClearButton();


    state.categoryId =
      firstCategoryId(
        state.type
      );


    renderMenu();


    observerSuppressedUntil =
      Date.now() + 900;


    requestAnimationFrame(() => {

      scrollToCategory(
        state.categoryId,
        'smooth'
      );

    });

  }


  /* =====================================================
     MODAL
     ===================================================== */

  function openModal(item) {

    const modal =
      $('#itemModal');


    if (!modal || !item) {
      return;
    }


    state.modalItemId =
      item.id;


    state.previousFocus =
      document.activeElement
        instanceof HTMLElement
          ? document.activeElement
          : null;


    const nameKey =
      getNameKey();


    const compositionKey =
      getCompositionKey();


    $('#modalTitle').textContent =
      item[nameKey] ||
      item.name_ru ||
      '—';


    $('#modalPrice').innerHTML = `

      ${escapeHtml(
        formatPrice(
          item.price
        )
      )}

      <small>₸</small>

    `;


    $('#modalWeight').textContent =
      item.weight || '';


    $('#modalIngredients').textContent =
      item[compositionKey] || '';


    const ingredients =
      $('#modalIngredientsContainer');


    ingredients.hidden =
      !item[compositionKey];


    const imageContainer =
      $('#modalImageContainer');


    const image =
      $('#modalImage');


    if (item.image) {

      image.src =
        item.image;

      image.alt =
        item[nameKey] || '';

      imageContainer.hidden =
        false;

    } else {

      image.removeAttribute(
        'src'
      );

      image.alt = '';

      imageContainer.hidden =
        true;

    }


    modal.hidden =
      false;


    document.body.classList.add(
      'modal-open'
    );


    state.scrollLockY =
      window.scrollY;


    document.body.style.top =
      `-${state.scrollLockY}px`;


    requestAnimationFrame(() => {

      modal.classList.add(
        'is-open'
      );

    });


    $('#modalCloseButton')
      ?.focus({
        preventScroll: true
      });

  }


  function closeModal() {

    const modal =
      $('#itemModal');


    if (
      !modal ||
      modal.hidden
    ) {
      return;
    }


    modal.classList.remove(
      'is-open'
    );


    window.setTimeout(
      () => {

        modal.hidden =
          true;


        document.body.classList.remove(
          'modal-open'
        );


        document.body.style.top =
          '';


        window.scrollTo(
          0,
          state.scrollLockY
        );


        state.modalItemId =
          null;


        state.previousFocus
          ?.focus?.({
            preventScroll: true
          });


        state.previousFocus =
          null;

      },
      220
    );

  }


  /* =====================================================
     INFO ACCORDION
     ===================================================== */

  function toggleInfo(button) {

    if (!button) {
      return;
    }


    const content =
      button.nextElementSibling;


    if (!content) {
      return;
    }


    const expanded =
      button.getAttribute(
        'aria-expanded'
      ) === 'true';


    button.setAttribute(
      'aria-expanded',
      String(!expanded)
    );


    content.hidden =
      expanded;


    button.classList.toggle(
      'is-open',
      !expanded
    );

  }


  /* =====================================================
     INITIALIZATION
     ===================================================== */

  function initSearch() {

    const input =
      $('#searchInput');


    if (!input) {
      return;
    }


    input.addEventListener(
      'input',
      event => {

        const value =
          event.target.value;


        updateSearchClearButton();


        window.clearTimeout(
          state.searchTimer
        );


        state.searchTimer =
          window.setTimeout(
            () =>
              setSearch(value),
            180
          );

      }
    );


    input.addEventListener(
      'keydown',
      event => {

        if (
          event.key === 'Escape' &&
          input.value
        ) {

          clearSearch();

        }

      }
    );

  }


  function initModal() {

    const modal =
      $('#itemModal');


    if (!modal) {
      return;
    }


    $('.modal-backdrop', modal)
      ?.addEventListener(
        'click',
        closeModal
      );


    $$('[data-modal-close]', modal)
      .forEach(button => {

        button.addEventListener(
          'click',
          closeModal
        );

      });


    $('#modalImage')
      ?.addEventListener(
        'error',
        event => {

          event.currentTarget
            .removeAttribute(
              'src'
            );


          $('#modalImageContainer')
            .hidden = true;

        }
      );

  }


  function initInfo() {

    $$('.info-btn')
      .forEach(button => {

        button.addEventListener(
          'click',
          () =>
            toggleInfo(
              button
            )
        );

      });

  }


  function initNavigation() {

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


    $$('.nav-btn')
      .forEach(button => {

        button.addEventListener(
          'click',
          () =>
            setMainType(
              button.dataset.type
            )
        );

      });


    $$('.bottom-nav-btn')
      .forEach(button => {

        button.addEventListener(
          'click',
          () =>
            switchSection(
              button.dataset.path
            )
        );

      });


    $('#clearSearchBtn')
      ?.addEventListener(
        'click',
        clearSearch
      );

  }


  function initKeyboard() {

    document.addEventListener(
      'keydown',
      event => {

        if (
          event.key === 'Escape'
        ) {

          closeModal();

        }

      }
    );

  }


  function init() {

    if (
      !(
        typeof MENU !== 'undefined' &&
        Array.isArray(MENU)
      )
    ) {

      console.error(
        'NECTAR: MENU data is missing or invalid.'
      );

    }


    state.categoryId =
      firstCategoryId(
        'kitchen'
      );


    setLanguageUI();

    updateMainTypeUI();

    renderCategories();

    renderMenu();

    initSearch();

    initModal();

    initInfo();

    initNavigation();

    initKeyboard();


    /*
      После загрузки шрифтов
      пересобираем observer,
      потому что высота элементов
      могла измениться.
    */

    if (
      document.fonts?.ready
    ) {

      document.fonts.ready
        .then(
          () =>
            setupCategoryObserver()
        );

    }


    /*
      Hero fallback.
    */

    $('.hero-image')
      ?.addEventListener(
        'error',
        event => {

          event.currentTarget
            .style.display =
              'none';

        }
      );

  }


  /* =====================================================
     PUBLIC COMPATIBILITY API
     ===================================================== */

  /*
    Оставляем эти функции глобально доступными,
    чтобы старые ссылки/вызовы не ломали страницу.
  */

  Object.assign(
    window,
    {

      switchLang,

      switchSection,

      switchMainTab:
        (index, button) =>
          setMainType(
            button?.dataset?.type ||
            (
              index === 1
                ? 'bar'
                : 'kitchen'
            )
          ),

      selectCategory,

      clearSearch,

      openModal,

      closeModal,

      toggleInfo

    }
  );


  document.addEventListener(
    'DOMContentLoaded',
    init
  );

})();
