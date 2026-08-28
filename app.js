// ============================================
// NECTAR MENU — APPLICATION
// ============================================

let currentLang = 'RU';
let currentTab = 'menu';
let currentType = 'kitchen';
let searchQuery = '';
let isModalOpen = false;
let searchTimer = null;
let isProgrammaticScroll = false;
let revealPlayed = false;

const categoryObserverMap = new Map();

// ============================================
// HELPERS
// ============================================

function getLangKey(prefix) {
    return `${prefix}_${currentLang.toLowerCase()}`;
}

function getItemName(item) {
    return item[getLangKey('name')] || item.name_ru || '';
}

function getItemCategory(item) {
    return item[getLangKey('category')] || item.category_ru || '';
}

function getItemComposition(item) {
    return item[getLangKey('composition')] || item.composition_ru || '';
}

function normalizeText(value = '') {
    return String(value)
        .toLowerCase()
        .normalize('NFKC')
        .replace(/\s+/g, ' ')
        .trim();
}

function getCategoriesForType(type) {
    const items = MENU.filter(item => item.type === type);
    const categoryKey = getLangKey('category');

    const seen = new Set();
    const result = [];

    items.forEach(item => {
        const id = item.category_id;
        const name = item[categoryKey] || item.category_ru;

        if (!seen.has(id)) {
            seen.add(id);
            result.push({
                id,
                name
            });
        }
    });

    return result;
}

function getFirstCategory(type = currentType) {
    return getCategoriesForType(type)[0] || null;
}

// ============================================
// LANGUAGE
// ============================================

function switchLang(lang) {
    if (!TRANSLATIONS[lang]) return;

    currentLang = lang;

    document.documentElement.lang =
        lang === 'RU' ? 'ru' :
        lang === 'KZ' ? 'kk' :
        'en';

    document.querySelectorAll('.lang-btn').forEach(btn => {
        const active = btn.dataset.lang === lang;

        btn.classList.toggle('lang-active', active);
        btn.classList.toggle('font-bold', active);
        btn.classList.toggle('opacity-60', !active);
    });

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;

        if (TRANSLATIONS[lang][key] !== undefined) {
            el.textContent = TRANSLATIONS[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;

        if (TRANSLATIONS[lang][key] !== undefined) {
            el.placeholder = TRANSLATIONS[lang][key];
        }
    });

    // После смены языка всегда начинаем с первой категории.
    window.scrollTo({
        top: 0,
        behavior: 'auto'
    });

    renderCategories();
    renderMenu(searchQuery);

    requestAnimationFrame(() => {
        updateActiveCategoryFromScroll();
    });
}

// ============================================
// MENU / INFO
// ============================================

function switchSection(sectionId) {
    if (currentTab === sectionId) return;

    currentTab = sectionId;

    document.querySelectorAll('.spa-section').forEach(section => {
        section.classList.remove('active');
    });

    const target = document.getElementById(`${sectionId}-section`);

    if (target) {
        target.classList.add('active');
    }

    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
        const active = btn.dataset.path === sectionId;

        btn.classList.toggle('text-forest-green', active);
        btn.classList.toggle('text-outline', !active);
    });

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    if (sectionId === 'menu') {
        renderCategories();
        renderMenu(searchQuery);

        requestAnimationFrame(() => {
            updateActiveCategoryFromScroll();
        });
    }
}

// ============================================
// KITCHEN / BAR
// ============================================

function switchMainTab(index, btn) {
    if (!btn) return;

    currentType = btn.dataset.type;

    const indicator = document.getElementById('nav-indicator');
    if (indicator) {
        indicator.style.transform = `translateX(${index * 100}%)`;
    }

    document.querySelectorAll('.nav-btn').forEach((button, i) => {
        const active = i === index;

        button.setAttribute('aria-selected', active ? 'true' : 'false');

        button.classList.toggle('text-cream', active);
        button.classList.toggle('text-on-surface-variant', !active);
    });

    // Переключение кухни/бара не должно ломать поиск.
    renderCategories();
    renderMenu(searchQuery);

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    requestAnimationFrame(() => {
        updateActiveCategoryFromScroll();
    });
}

// ============================================
// CATEGORIES
// ============================================

function renderCategories() {
    const container = document.getElementById('categoryContainer');

    if (!container) return;

    const categories = getCategoriesForType(currentType);

    container.innerHTML = categories.map(category => `
        <button
            class="category-btn snap-start shrink-0 px-5 py-2 rounded-xl text-[11px]
                   font-label-caps tracking-widest uppercase transition-all
                   border bg-white text-forest-green/70 border-forest-green/10
                   hover:border-forest-green/30 active:scale-95"
            data-category-id="${category.id}"
            onclick="selectCategory('${category.id}')"
        >
            ${escapeHtml(category.name)}
        </button>
    `).join('');

    updateActiveCategoryFromScroll();
}

function selectCategory(categoryId) {
    const target = document.querySelector(
        `[data-category-section="${CSS.escape(categoryId)}"]`
    );

    if (!target) return;

    isProgrammaticScroll = true;

    const offset = getStickyOffset();

    const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        offset;

    window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: 'smooth'
    });

    setActiveCategory(categoryId);

    setTimeout(() => {
        isProgrammaticScroll = false;
        updateActiveCategoryFromScroll();
    }, 700);
}

function getStickyOffset() {
    const header = document.querySelector('header');
    const sticky = document.querySelector('.menu-sticky');

    const headerHeight = header
        ? header.getBoundingClientRect().height
        : 0;

    const stickyHeight = sticky
        ? sticky.getBoundingClientRect().height
        : 0;

    return headerHeight + Math.min(stickyHeight, 170) + 12;
}

function setActiveCategory(categoryId) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        const active = btn.dataset.categoryId === categoryId;

        btn.classList.toggle('bg-forest-green', active);
        btn.classList.toggle('text-cream', active);
        btn.classList.toggle('border-forest-green', active);

        btn.classList.toggle('bg-white', !active);
        btn.classList.toggle('text-forest-green/70', !active);
        btn.classList.toggle('border-forest-green/10', !active);
    });

    const activeButton = document.querySelector(
        `.category-btn[data-category-id="${CSS.escape(categoryId)}"]`
    );

    if (activeButton && !isProgrammaticScroll) {
        activeButton.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }
}

function updateActiveCategoryFromScroll() {
    if (isProgrammaticScroll) return;

    const sections = [
        ...document.querySelectorAll('[data-category-section]')
    ];

    if (!sections.length) return;

    const marker = getStickyOffset() + 20;

    let active = sections[0].dataset.categorySection;

    for (const section of sections) {
        const rect = section.getBoundingClientRect();

        if (rect.top <= marker) {
            active = section.dataset.categorySection;
        }
    }

    setActiveCategory(active);
}

// ============================================
// MENU RENDER
// ============================================

function renderMenu(query = '') {
    const container = document.getElementById('menuContainer');

    if (!container) return;

    const normalizedQuery = normalizeText(query);

    let items;

    if (normalizedQuery) {
        // ГЛОБАЛЬНЫЙ ПОИСК:
        // Кухня + Бар + все категории.
        items = MENU.filter(item => {
            const searchable = [
                getItemName(item),
                getItemCategory(item),
                getItemComposition(item)
            ]
                .map(normalizeText)
                .join(' ');

            return searchable.includes(normalizedQuery);
        });
    } else {
        // Без поиска показываем только текущий тип.
        items = MENU.filter(item => item.type === currentType);
    }

    if (!items.length) {
        container.innerHTML = `
            <div class="text-center py-16 px-6">
                <div class="font-serif text-[26px] text-forest-green mb-2">
                    ${escapeHtml(TRANSLATIONS[currentLang].nothing_found)}
                </div>
                <p class="text-secondary font-body-md">
                    ${escapeHtml(TRANSLATIONS[currentLang].try_another_search)}
                </p>
            </div>
        `;
        return;
    }

    const categoryKey = getLangKey('category');

    // При поиске группируем результаты по категориям.
    const grouped = new Map();

    items.forEach(item => {
        const categoryId = item.category_id;
        const categoryName = item[categoryKey] || item.category_ru;

        if (!grouped.has(categoryId)) {
            grouped.set(categoryId, {
                id: categoryId,
                name: categoryName,
                items: []
            });
        }

        grouped.get(categoryId).items.push(item);
    });

    const fragment = document.createDocumentFragment();

    grouped.forEach(group => {
        const section = document.createElement('section');

        section.className =
            'category-section menu-reveal';

        section.dataset.categorySection = group.id;

        section.innerHTML = `
            <div class="flex items-center justify-center gap-4 mb-6 px-1">
                <div class="flex-1 h-px bg-gradient-to-r from-transparent via-warm-gold/30 to-warm-gold/30"></div>

                <h2 class="font-serif text-[26px] text-forest-green
                           tracking-tight text-center font-medium whitespace-nowrap">
                    ${escapeHtml(group.name)}
                </h2>

                <div class="flex-1 h-px bg-gradient-to-l from-transparent via-warm-gold/30 to-warm-gold/30"></div>
            </div>

            <div class="flex flex-col gap-3"></div>
        `;

        const cardsContainer = section.querySelector('.flex.flex-col.gap-3');

        group.items.forEach(item => {
            cardsContainer.appendChild(createMenuCard(item));
        });

        fragment.appendChild(section);
    });

    container.innerHTML = '';
    container.appendChild(fragment);

    if (!revealPlayed) {
        requestAnimationFrame(() => {
            document.querySelectorAll('.menu-reveal').forEach((el, index) => {
                el.style.animationDelay = `${Math.min(index * 60, 300)}ms`;
                el.classList.add('menu-reveal-active');
            });

            revealPlayed = true;
        });
    }

    updateActiveCategoryFromScroll();
}

function createMenuCard(item) {
    const card = document.createElement('article');

    card.className =
        'menu-card bg-white rounded-2xl overflow-hidden soft-shadow flex flex-col border border-forest-green/5';

    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const name = getItemName(item);
    const composition = getItemComposition(item);

    const isSpicy =
        item.note &&
        normalizeText(item.note).includes('остро');

    card.innerHTML = `
        <div class="px-5 py-5 relative">
            <div class="flex justify-between items-start gap-4">
                <h3 class="font-serif text-[22px] text-forest-green
                           max-w-[75%] leading-tight font-medium
                           flex items-center flex-wrap gap-2">

                    ${escapeHtml(name)}

                    ${
                        isSpicy
                            ? `
                                <span
                                    class="material-symbols-outlined text-red-500/80 text-[18px]"
                                    title="${escapeHtml(item.note)}"
                                >
                                    local_fire_department
                                </span>
                              `
                            : ''
                    }

                    <span
                        class="click-hint material-symbols-outlined text-[18px]"
                        aria-hidden="true"
                    >
                        info
                    </span>
                </h3>

                <p class="font-serif text-[20px] text-warm-gold
                          whitespace-nowrap mt-0.5 lining-nums">
                    ${formatPrice(item.price)}
                </p>
            </div>
        </div>
    `;

    card.addEventListener('click', () => openModal(item));

    card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openModal(item);
        }
    });

    return card;
}

function formatPrice(price) {
    return `${Number(price).toLocaleString('ru-RU')} ₸`;
}

// ============================================
// MODAL
// ============================================

function openModal(item) {
    const modal = document.getElementById('itemModal');

    if (!modal) return;

    const title = document.getElementById('modalTitle');
    const price = document.getElementById('modalPrice');
    const weight = document.getElementById('modalWeight');
    const ingredientsContainer =
        document.getElementById('modalIngredientsContainer');
    const ingredients =
        document.getElementById('modalIngredients');

    const imageContainer =
        document.getElementById('modalImageContainer');
    const image =
        document.getElementById('modalImage');

    title.textContent = getItemName(item);
    price.textContent = formatPrice(item.price);
    weight.textContent = item.weight || '';

    const composition = getItemComposition(item);

    if (composition) {
        ingredientsContainer.classList.remove('hidden');
        ingredientsContainer.classList.add('flex');
        ingredients.textContent = composition;
    } else {
        ingredientsContainer.classList.add('hidden');
        ingredientsContainer.classList.remove('flex');
        ingredients.textContent = '';
    }

    if (item.image) {
        imageContainer.style.display = 'block';
        image.src = item.image;
        image.alt = getItemName(item);
    } else {
        imageContainer.style.display = 'none';
        image.removeAttribute('src');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    requestAnimationFrame(() => {
        const modalContent = modal.querySelector('.modal-glass');

        if (modalContent) {
            modalContent.classList.remove('modal-enter');
            void modalContent.offsetWidth;
            modalContent.classList.add('modal-enter');
        }
    });

    isModalOpen = true;

    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    const closeButton = modal.querySelector('[data-modal-close]');
    if (closeButton) {
        setTimeout(() => closeButton.focus(), 50);
    }
}

function closeModal() {
    const modal = document.getElementById('itemModal');

    if (!modal || !isModalOpen) return;

    const modalContent = modal.querySelector('.modal-glass');

    if (modalContent) {
        modalContent.classList.remove('modal-enter');
    }

    modal.classList.add('modal-closing');

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        modal.classList.remove('modal-closing');

        isModalOpen = false;

        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
    }, 180);
}

// Escape
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isModalOpen) {
        closeModal();
    }
});

// Overlay
document.addEventListener('click', event => {
    const modal = document.getElementById('itemModal');

    if (modal && event.target === modal) {
        closeModal();
    }
});

// ============================================
// SEARCH
// ============================================

function initSearch() {
    const input = document.getElementById('searchInput');

    if (!input) return;

    input.addEventListener('input', event => {
        const value = event.target.value;

        searchQuery = value;

        updateSearchButton();

        clearTimeout(searchTimer);

        searchTimer = setTimeout(() => {
            renderMenu(searchQuery);
        }, 300);
    });
}

function updateSearchButton() {
    const input = document.getElementById('searchInput');
    const button = document.getElementById('clearSearchBtn');

    if (!input || !button) return;

    const hasValue = Boolean(input.value.trim());

    button.classList.toggle('hidden', !hasValue);
    button.classList.toggle('flex', hasValue);
}

function clearSearch() {
    const input = document.getElementById('searchInput');

    if (input) {
        input.value = '';
        input.focus();
    }

    searchQuery = '';

    updateSearchButton();
    renderMenu('');
}

// ============================================
// INFO ACCORDION
// ============================================

function toggleInfo(button) {
    if (!button) return;

    const content = button.nextElementSibling;
    const chevron = button.querySelector('.chevron');

    if (!content) return;

    const isOpen = !content.classList.contains('hidden');

    button.blur();

    content.classList.toggle('hidden', isOpen);
    content.classList.toggle('flex', !isOpen);

    button.setAttribute(
        'aria-expanded',
        isOpen ? 'false' : 'true'
    );

    if (chevron) {
        chevron.classList.toggle('rotated', !isOpen);
    }

    // Принудительно убираем touch/active визуальное состояние.
    requestAnimationFrame(() => {
        button.classList.remove('is-touch-active');
    });
}

// ============================================
// ESCAPE HTML
// ============================================

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

// ============================================
// CATEGORY OBSERVER
// ============================================

function initCategoryObserver() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
        entries => {
            if (isProgrammaticScroll) return;

            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort(
                    (a, b) =>
                        a.boundingClientRect.top -
                        b.boundingClientRect.top
                );

            if (visible.length) {
                setActiveCategory(
                    visible[0].target.dataset.categorySection
                );
            }
        },
        {
            root: null,
            rootMargin: '-190px 0px -55% 0px',
            threshold: 0
        }
    );

    const refresh = () => {
        observer.disconnect();

        document
            .querySelectorAll('[data-category-section]')
            .forEach(section => observer.observe(section));
    };

    const originalRenderMenu = renderMenu;

    // MutationObserver вместо ручного вызова после каждого рендера.
    const menuContainer =
        document.getElementById('menuContainer');

    if (menuContainer) {
        const mutationObserver = new MutationObserver(() => {
            refresh();
        });

        mutationObserver.observe(menuContainer, {
            childList: true
        });
    }

    refresh();
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Начальный язык
    switchLang('RU');

    // Начальное состояние
    currentType = 'kitchen';

    const kitchenButton =
        document.querySelector('.nav-btn[data-type="kitchen"]');

    if (kitchenButton) {
        switchMainTab(0, kitchenButton);
    }

    initSearch();
    initCategoryObserver();

    document.body.style.overflow = '';

    // Делает reveal только один раз за жизненный цикл страницы.
    setTimeout(() => {
        revealPlayed = false;
        renderMenu(searchQuery);
    }, 20);

    console.log('✅ NECTAR Menu initialized');
});
