(() => {
  'use strict';

  const I18N = {
    RU: { eyebrow:'PRIVATE DINING', title:'Банкетное меню', subtitle:'Для особых событий и больших компаний', nav:'БАНКЕТ', open:'Посмотреть', back:'Основное меню', price:'Цена уточняется', includes:'В составе', close:'ЗАКРЫТЬ' },
    KZ: { eyebrow:'PRIVATE DINING', title:'Банкет мәзірі', subtitle:'Ерекше іс-шаралар мен үлкен компанияларға арналған', nav:'БАНКЕТ', open:'Қарау', back:'Негізгі мәзір', price:'Бағасы нақтылануда', includes:'Құрамы', close:'ЖАБУ' },
    EN: { eyebrow:'PRIVATE DINING', title:'Banquet Menu', subtitle:'For special occasions and large groups', nav:'BANQUET', open:'View menu', back:'Main menu', price:'Price upon confirmation', includes:'Includes', close:'CLOSE' }
  };

  let activeCategory = null;
  let modalOpen = false;
  let modalReturnY = 0;
  let modalPreviousFocus = null;
  let scrollRaf = 0;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const data = () => (typeof BANQUET_MENU !== 'undefined' && Array.isArray(BANQUET_MENU) ? BANQUET_MENU : []);
  const lang = () => $('.lang-btn.is-active')?.dataset.lang || 'RU';
  const key = p => `${p}_${lang().toLowerCase()}`;
  const text = (item, p) => item?.[key(p)] || item?.[`${p}_ru`] || '';
  const esc = value => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  const isActive = () => document.documentElement.dataset.menuMode === 'banquet' && $('#menu-section')?.classList.contains('is-active') === true;

  function price(v) {
    if (v === null || v === undefined || v === '') return I18N[lang()].price;
    const n = Number(v);
    if (!Number.isFinite(n)) return I18N[lang()].price;
    const locale = lang() === 'KZ' ? 'kk-KZ' : lang() === 'EN' ? 'en-US' : 'ru-RU';
    return `${new Intl.NumberFormat(locale).format(n)} ₸`;
  }

  function categories() {
    const map = new Map();
    data().forEach(item => {
      if (!map.has(item.category_id)) map.set(item.category_id, text(item, 'category'));
    });
    return [...map].map(([id, name]) => ({ id, name }));
  }

  function centerActiveCategory(behavior = 'smooth') {
    const nav = $('#banquetCategories');
    const btn = nav?.querySelector('.banquet-category.is-active');
    if (!nav || !btn) return;
    const max = Math.max(0, nav.scrollWidth - nav.clientWidth);
    const desired = btn.offsetLeft - (nav.clientWidth - btn.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, Math.min(max, desired)), behavior });
  }

  function setActiveCategory(id, center = false) {
    if (!id) return;
    activeCategory = id;
    $$('.banquet-category').forEach(btn => {
      const active = btn.dataset.bcat === id;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    if (center) centerActiveCategory('smooth');
  }

  function menuControlsOffset() {
    const headerHeight = $('#siteHeader')?.getBoundingClientRect().height || $('.site-header')?.getBoundingClientRect().height || 0;
    const controlsHeight = $('#menuControls')?.getBoundingClientRect().height || 0;
    return headerHeight + controlsHeight + 14;
  }

  function scrollToBanquetCategory(id, behavior = 'smooth') {
    const target = document.getElementById(`banquet-${id}`);
    if (!target) return;
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - menuControlsOffset());
    window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : behavior });
  }

  function render() {
    const items = data();
    const cs = categories();
    activeCategory = activeCategory && cs.some(c => c.id === activeCategory) ? activeCategory : cs[0]?.id;
    const nav = $('#banquetCategories');
    const box = $('#banquetContainer');
    if (!nav || !box) return;

    nav.innerHTML = cs.map(c => `<button type="button" class="banquet-category ${c.id === activeCategory ? 'is-active' : ''}" data-bcat="${esc(c.id)}" aria-pressed="${c.id === activeCategory}">${esc(c.name)}</button>`).join('');
    box.innerHTML = cs.map(c => {
      const groupItems = items.filter(i => i.category_id === c.id);
      return `<section class="banquet-group" id="banquet-${esc(c.id)}" data-bgroup="${esc(c.id)}" data-banquet-category-section="${esc(c.id)}"><h2 class="banquet-group__title">${esc(c.name)}</h2><div class="banquet-list">${groupItems.map(i => `<button type="button" class="banquet-card" data-bitem="${esc(i.id)}" aria-label="${esc(text(i,'name'))}"><span><span class="banquet-card__name">${esc(text(i,'name'))}</span>${text(i,'summary') ? `<span class="banquet-card__summary">${esc(text(i,'summary'))}</span>` : ''}<span class="banquet-card__price">${esc(price(i.price))}</span></span><span class="material-symbols-outlined banquet-card__chevron" aria-hidden="true">chevron_right</span></button>`).join('')}</div></section>`;
    }).join('');
  }

  function apply() {
    $$('[data-banquet-i18n]').forEach(el => {
      const v = I18N[lang()][el.dataset.banquetI18n];
      if (v) el.textContent = v;
    });
    const close = $('#banquetModal .modal__close');
    if (close) close.setAttribute('aria-label', I18N[lang()].close);
    if (isActive()) {
      render();
      requestAnimationFrame(() => {
        updateActiveFromScroll();
        centerActiveCategory('auto');
      });
    }
  }

  function lockModalPage() {
    modalReturnY = Math.max(0, window.scrollY || 0);
    const scrollbar = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    if (scrollbar) document.body.style.paddingRight = `${scrollbar}px`;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${modalReturnY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.classList.add('banquet-modal-open');
  }

  function unlockModalPage() {
    document.body.classList.remove('banquet-modal-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.paddingRight = '';
    const old = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, modalReturnY);
    requestAnimationFrame(() => { document.documentElement.style.scrollBehavior = old; });
  }

  function fillModal(item) {
    $('#banquetModalTitle').textContent = text(item, 'name');
    $('#banquetModalPrice').textContent = price(item.price);
    const summary = text(item, 'summary');
    const summaryEl = $('#banquetModalSummary');
    summaryEl.textContent = summary;
    summaryEl.hidden = !summary;
    const components = item?.[key('components')] || item?.components_ru || [];
    const wrap = $('#banquetModalComponents');
    const list = $('#banquetModalComponentsList');
    list.replaceChildren(...components.map(value => {
      const li = document.createElement('li');
      li.textContent = value;
      return li;
    }));
    wrap.hidden = !components.length;
  }

  function openModal(item) {
    const modal = $('#banquetModal');
    if (!modal || modalOpen || !item) return;
    modalPreviousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    fillModal(item);
    lockModalPage();
    modal.hidden = false;
    modalOpen = true;
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
      modal.querySelector('.modal__close')?.focus({ preventScroll: true });
    });
  }

  function closeModal({ immediate = false } = {}) {
    const modal = $('#banquetModal');
    if (!modal || !modalOpen) return;
    modal.classList.remove('is-open');
    const finish = () => {
      modal.hidden = true;
      modalOpen = false;
      unlockModalPage();
      try { modalPreviousFocus?.focus({ preventScroll: true }); } catch {}
      modalPreviousFocus = null;
    };
    if (immediate) finish();
    else window.setTimeout(finish, 280);
  }

  function updateActiveFromScroll() {
    if (!isActive() || modalOpen) return;
    const groups = $$('.banquet-group');
    if (!groups.length) return;
    const marker = menuControlsOffset() + 10;
    let id = groups[0].dataset.bgroup;
    for (const group of groups) {
      if (group.getBoundingClientRect().top <= marker) id = group.dataset.bgroup;
      else break;
    }
    if (id && id !== activeCategory) setActiveCategory(id, true);
  }

  function scheduleScrollSpy() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      updateActiveFromScroll();
    });
  }

  document.addEventListener('click', event => {
    const cat = event.target.closest('[data-bcat]');
    if (cat) {
      const id = cat.dataset.bcat;
      setActiveCategory(id, true);
      scrollToBanquetCategory(id, 'smooth');
      return;
    }

    const card = event.target.closest('[data-bitem]');
    if (card) {
      const item = data().find(i => i.id === card.dataset.bitem);
      if (item) openModal(item);
      return;
    }

    if (event.target.closest('[data-banquet-modal-close]')) {
      closeModal();
      return;
    }

    // app.js updates .lang-btn synchronously in its click handler; run after that.
    if (event.target.closest('.lang-btn')) requestAnimationFrame(apply);
  });

  document.addEventListener('nectar:modechange', event => {
    if (event.detail?.mode !== 'banquet') return;
    const first = categories()[0]?.id || null;
    activeCategory = first;
    render();
    if (first) setActiveCategory(first, false);
    requestAnimationFrame(() => centerActiveCategory('auto'));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modalOpen) closeModal();
  });

  window.addEventListener('scroll', scheduleScrollSpy, { passive: true });
  window.addEventListener('resize', scheduleScrollSpy, { passive: true });
  window.addEventListener('DOMContentLoaded', () => { apply(); render(); }, { once: true });
})();
