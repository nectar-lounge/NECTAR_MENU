// ============================================
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ============================================

let currentLang = 'RU';
let currentTab = 'menu';
let currentType = 'kitchen';
let currentCategory = 'All';
let searchQuery = '';
let isModalOpen = false;

// ============================================
// ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА
// ============================================

function switchLang(lang) {
    currentLang = lang;

    // Обновляем кнопки языка
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const btnLang = btn.textContent.trim();
        if (btnLang === lang) {
            btn.classList.add('text-forest-green', 'lang-active', 'font-bold');
            btn.classList.remove('text-on-secondary-fixed-variant', 'opacity-60');
        } else {
            btn.classList.remove('text-forest-green', 'lang-active', 'font-bold');
            btn.classList.add('text-on-secondary-fixed-variant', 'opacity-60');
        }
    });

    // Обновляем тексты
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.textContent = TRANSLATIONS[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            el.placeholder = TRANSLATIONS[lang][key];
        }
    });

    // Сохраняем текущий поиск
    const searchVal = document.getElementById('searchInput').value;
    
    // Перерисовываем категории и меню
    renderCategories();
    renderMenu(searchVal);
}

// ============================================
// ПЕРЕКЛЮЧЕНИЕ СЕКЦИЙ (Меню / Инфо)
// ============================================

function switchSection(sectionId, btn) {
    if (currentTab === sectionId) return;
    currentTab = sectionId;

    // Скрываем все секции
    document.querySelectorAll('.spa-section').forEach(sec => {
        sec.style.opacity = '0';
        setTimeout(() => {
            sec.classList.remove('active');
        }, 400);
    });

    // Показываем нужную секцию
    setTimeout(() => {
        const targetSec = document.getElementById(`${sectionId}-section`);
        targetSec.classList.add('active');
        targetSec.style.opacity = '1';
        
        // Если переключились на Меню - обновляем его
        if (sectionId === 'menu') {
            const searchVal = document.getElementById('searchInput').value;
            renderCategories();
            renderMenu(searchVal);
        }
    }, 400);

    // Обновляем нижнюю навигацию
    document.querySelectorAll('.bottom-nav-btn').forEach(b => {
        if (b.dataset.path === sectionId) {
            b.classList.remove('text-outline');
            b.classList.add('text-forest-green');
        } else {
            b.classList.add('text-outline');
            b.classList.remove('text-forest-green');
        }
    });

    // Скролл к началу
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК (Кухня / Бар)
// ============================================

function switchMainTab(index, btn) {
    const indicator = document.getElementById('nav-indicator');
    const buttons = document.querySelectorAll('.nav-btn');

    // Двигаем индикатор
    indicator.style.transform = `translateX(${index * 100}%)`;

    // Обновляем кнопки
    buttons.forEach((b, i) => {
        if (i === index) {
            b.classList.replace('text-on-surface-variant', 'text-cream');
            b.setAttribute('aria-selected', 'true');
        } else {
            b.classList.replace('text-cream', 'text-on-surface-variant');
            b.setAttribute('aria-selected', 'false');
        }
    });

    currentType = btn.dataset.type;
    currentCategory = 'All';
    
    // Сбрасываем поиск при переключении вкладок
    clearSearch();
    
    renderCategories();
    renderMenu('');
}

// ============================================
// РЕНДЕРИНГ КАТЕГОРИЙ
// ============================================

function renderCategories() {
    const container = document.getElementById('categoryContainer');
    if (!container) return;
    
    const items = MENU.filter(item => item.type === currentType);

    // Получаем уникальные категории на текущем языке
    const catKey = `category_${currentLang.toLowerCase()}`;
    const uniqueCategories = [...new Set(items.map(item => item[catKey]))];

    const allText = TRANSLATIONS[currentLang]['cat_all'] || 'Все';
    const categories = [{ id: 'All', name: allText }, ...uniqueCategories.map(c => ({ id: c, name: c }))];

    container.innerHTML = categories.map(cat => `
        <button class="snap-start shrink-0 px-6 py-1.5 ${currentCategory === cat.id ? 'bg-forest-green text-cream border-forest-green' : 'bg-white text-forest-green/70 border-forest-green/10 hover:border-forest-green/30'} rounded-xl text-[11px] font-label-caps tracking-widest uppercase transition-all active:scale-95 border shadow-sm" onclick="selectCategory('${cat.id}')">
            ${cat.name}
        </button>
    `).join('');
}

// ============================================
// ВЫБОР КАТЕГОРИИ
// ============================================

function selectCategory(category) {
    currentCategory = category;
    renderCategories();
    
    // Получаем текущий поиск и рендерим меню
    const searchVal = document.getElementById('searchInput').value;
    renderMenu(searchVal);

    // Плавный скролл к началу меню с учетом sticky шапки
    setTimeout(() => {
        const menuContainer = document.getElementById('menuContainer');
        if (menuContainer) {
            const headerOffset = 160;
            const elementPosition = menuContainer.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }, 100);
}

// ============================================
// РЕНДЕРИНГ МЕНЮ
// ============================================

function renderMenu(searchQuery = '') {
    const container = document.getElementById('menuContainer');
    if (!container) return;
    
    const nameKey = `name_${currentLang.toLowerCase()}`;
    const catKey = `category_${currentLang.toLowerCase()}`;
    const compKey = `composition_${currentLang.toLowerCase()}`;

    let items = MENU;

    // Если есть поиск - ищем по всему меню (кухня + бар)
    if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        items = items.filter(item =>
            item[nameKey].toLowerCase().includes(q) ||
            item[catKey].toLowerCase().includes(q) ||
            (item[compKey] && item[compKey].toLowerCase().includes(q))
        );
    } else {
        // Если поиск пустой - фильтруем по текущему типу
        items = items.filter(item => item.type === currentType);
    }

    // Группируем по категориям
    let categoriesToRender = [];
    if (currentCategory === 'All' || (searchQuery && searchQuery.trim() !== '')) {
        categoriesToRender = [...new Set(items.map(i => i[catKey]))];
    } else {
        categoriesToRender = [currentCategory];
    }

    let html = '';

    categoriesToRender.forEach((cat) => {
        const catItems = items.filter(i => i[catKey] === cat);
        if (catItems.length === 0) return;

        html += `
            <div class="mt-8 mb-4 scroll-mt-[120px] category-section">
                <div class="flex items-center justify-center gap-4 mb-6 px-4">
                    <div class="flex-1 h-[1px] bg-gradient-to-r from-transparent via-warm-gold/30 to-warm-gold/30"></div>
                    <h2 class="font-serif text-[26px] text-forest-green tracking-tight text-center font-medium">${cat}</h2>
                    <div class="flex-1 h-[1px] bg-gradient-to-l from-transparent via-warm-gold/30 to-warm-gold/30"></div>
                </div>
                <div class="flex flex-col gap-3">
        `;

        catItems.forEach((item) => {
            const itemData = JSON.stringify(item).replace(/"/g, '&quot;');
            
            // Иконка "острое"
            let noteIcon = '';
            if (item.note && item.note.toLowerCase().includes('острое')) {
                noteIcon = `<span class="material-symbols-outlined text-red-500/80 text-[18px] ml-2" title="${item.note}">local_fire_department</span>`;
            }

            html += `
                <div class="menu-card bg-white rounded-2xl overflow-hidden soft-shadow flex flex-col border border-forest-green/5 hover:border-forest-green/20" onclick='openModal(${itemData})' role="button" tabindex="0">
                    <div class="px-5 py-5 relative">
                        <div class="flex justify-between items-start gap-4">
                            <h3 class="font-serif text-[22px] text-forest-green max-w-[75%] leading-tight font-medium flex items-center flex-wrap gap-2">
                                ${item[nameKey]}
                                ${noteIcon}
                                <span class="click-hint material-symbols-outlined text-[18px] text-outline/30" aria-hidden="true">info</span>
                            </h3>
                            <p class="font-serif text-[20px] text-warm-gold whitespace-nowrap mt-0.5 lining-nums">${item.price} ₸</p>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
    });

    if (html === '') {
        html = `<div class="text-center py-12 text-outline text-body-md font-serif italic text-lg">Ничего не найдено.</div>`;
    }

    container.innerHTML = html;
}

// ============================================
// МОДАЛЬНОЕ ОКНО
// ============================================

function openModal(item) {
    const modal = document.getElementById('itemModal');
    if (!modal) return;
    
    const nameKey = `name_${currentLang.toLowerCase()}`;
    const compKey = `composition_${currentLang.toLowerCase()}`;

    document.getElementById('modalTitle').textContent = item[nameKey];
    document.getElementById('modalPrice').textContent = `${item.price} ₸`;
    document.getElementById('modalWeight').textContent = item.weight || '';

    // Ингредиенты
    const ingredientsContainer = document.getElementById('modalIngredientsContainer');
    const ingredientsList = document.getElementById('modalIngredients');
    
    if (item[compKey]) {
        ingredientsContainer.classList.remove('hidden');
        ingredientsContainer.classList.add('flex');
        ingredientsList.textContent = item[compKey];
    } else {
        ingredientsContainer.classList.add('hidden');
        ingredientsContainer.classList.remove('flex');
    }

    // Фото (если есть)
    const imageContainer = document.getElementById('modalImageContainer');
    const imageEl = document.getElementById('modalImage');
    if (item.image) {
        imageContainer.style.display = 'block';
        imageEl.src = item.image;
        imageEl.alt = item[nameKey];
    } else {
        imageContainer.style.display = 'none';
    }

    // Показываем модалку
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    const modalContent = modal.querySelector('.relative');
    if (modalContent) {
        modalContent.classList.add('modal-enter');
    }
    
    // Блокируем скролл только на время открытия модалки
    isModalOpen = true;
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('itemModal');
    if (!modal) return;
    
    const modalContent = modal.querySelector('.relative');
    if (modalContent) {
        modalContent.classList.remove('modal-enter');
    }
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        
        // Восстанавливаем скролл
        isModalOpen = false;
        document.body.style.overflow = '';
    }, 300);
}

// Закрытие по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Закрытие по клику на фон
document.addEventListener('click', (e) => {
    const modal = document.getElementById('itemModal');
    if (e.target === modal) closeModal();
});

// ============================================
// ПОИСК
// ============================================

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    // Удаляем старые обработчики
    const newInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newInput, searchInput);
    
    newInput.addEventListener('input', (e) => {
        const val = e.target.value;
        const btn = document.getElementById('clearSearchBtn');
        
        if (val.trim()) {
            btn.classList.remove('hidden');
            btn.classList.add('flex');
        } else {
            btn.classList.add('hidden');
            btn.classList.remove('flex');
        }
        
        renderMenu(val);
    });
}

function clearSearch() {
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('clearSearchBtn');
    if (input) {
        input.value = '';
    }
    if (btn) {
        btn.classList.add('hidden');
        btn.classList.remove('flex');
    }
    renderMenu('');
}

// ============================================
// ИНФО-СЕКЦИЯ (раскрывающиеся блоки)
// ============================================

function toggleInfo(btn) {
    if (!btn) return;
    
    const content = btn.nextElementSibling;
    const chevron = btn.querySelector('.chevron');
    const isHidden = content.classList.contains('hidden');

    // Снимаем выделение (убираем :hover состояние)
    btn.blur();

    if (isHidden) {
        content.classList.remove('hidden');
        if (chevron) chevron.classList.add('rotated');
        btn.setAttribute('aria-expanded', 'true');
    } else {
        content.classList.add('hidden');
        if (chevron) chevron.classList.remove('rotated');
        btn.setAttribute('aria-expanded', 'false');
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Ставим начальный язык
    switchLang('RU');
    
    // Загружаем меню
    renderCategories();
    renderMenu('');
    
    // Инициализируем поиск
    initSearch();
    
    // Восстанавливаем скролл на случай, если модалка была открыта
    document.body.style.overflow = '';
    
    console.log('✅ NECTAR Menu initialized successfully!');
    console.log(`📋 Current language: ${currentLang}`);
    console.log(`🍽️ Current tab: ${currentType}`);
    console.log(`📂 Current category: ${currentCategory}`);
});

// Обработчик для восстановления скролла при ошибках
window.addEventListener('error', function() {
    document.body.style.overflow = '';
});
