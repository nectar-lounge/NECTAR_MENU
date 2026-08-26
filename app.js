let menuData = { categories: [], items: [] };
let currentLang = 'RU';
let currentTab = 'kitchen'; // 'kitchen' или 'bar'
let currentCategory = null;
let currentSearchTerm = '';

// Словари для интерфейса
const translations = {
    'RU': {
        header_subtitle: 'Lounge · Bar · Kitchen',
        nav_kitchen: 'Кухня',
        nav_bar: 'Бар',
        search_placeholder: 'Поиск блюд, напитков...',
        tab_menu: 'Меню',
        tab_info: 'Инфо',
        modal_ingredients: 'Описание',
        modal_close: 'Закрыть',
        info_content: `
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-forest-green/5 mb-4 fade-in-up">
                <h3 class="font-serif-ru text-xl text-forest-green mb-2">О нас</h3>
                <p class="text-sm text-forest-green/70">NECTAR — это премиальное пространство для отдыха в Алматы. Мы объединили авторскую кухню, расслабляющую атмосферу лаунжа и высокий сервис.</p>
            </div>
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-forest-green/5 mb-4 fade-in-up">
                <h3 class="font-serif-ru text-xl text-forest-green mb-2">Контакты</h3>
                <p class="text-sm text-forest-green/70 mb-2">📍 г. Алматы</p>
                <p class="text-sm text-forest-green/70">📞 Бронь столов: +7 (XXX) XXX-XX-XX</p>
            </div>
        `
    },
    'EN': {
        header_subtitle: 'Lounge · Bar · Kitchen',
        nav_kitchen: 'Kitchen',
        nav_bar: 'Bar',
        search_placeholder: 'Search for dishes, drinks...',
        tab_menu: 'Menu',
        tab_info: 'Info',
        modal_ingredients: 'Description',
        modal_close: 'Close',
        info_content: `
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-forest-green/5 mb-4 fade-in-up">
                <h3 class="font-serif-en text-xl text-forest-green mb-2">About Us</h3>
                <p class="text-sm text-forest-green/70">NECTAR is a premium leisure space in Almaty combining signature cuisine, a relaxing lounge atmosphere, and top-tier service.</p>
            </div>
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-forest-green/5 mb-4 fade-in-up">
                <h3 class="font-serif-en text-xl text-forest-green mb-2">Contacts</h3>
                <p class="text-sm text-forest-green/70 mb-2">📍 Almaty</p>
                <p class="text-sm text-forest-green/70">📞 Reservations: +7 (XXX) XXX-XX-XX</p>
            </div>
        `
    },
    'KZ': {
        header_subtitle: 'Lounge · Bar · Kitchen',
        nav_kitchen: 'Асхана',
        nav_bar: 'Бар',
        search_placeholder: 'Тағамдар, сусындар іздеу...',
        tab_menu: 'Мәзір',
        tab_info: 'Ақпарат',
        modal_ingredients: 'Сипаттамасы',
        modal_close: 'Жабу',
        info_content: `
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-forest-green/5 mb-4 fade-in-up">
                <h3 class="font-serif-ru text-xl text-forest-green mb-2">Біз туралы</h3>
                <p class="text-sm text-forest-green/70">NECTAR — Алматыдағы премиум демалыс орны. Біз авторлық асхананы, лаунж атмосферасын және жоғары сервисті біріктірдік.</p>
            </div>
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-forest-green/5 mb-4 fade-in-up">
                <h3 class="font-serif-ru text-xl text-forest-green mb-2">Байланыс</h3>
                <p class="text-sm text-forest-green/70 mb-2">📍 Алматы қ.</p>
                <p class="text-sm text-forest-green/70">📞 Үстелге тапсырыс: +7 (XXX) XXX-XX-XX</p>
            </div>
        `
    }
};

// 1. ЗАГРУЗКА ДАННЫХ
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    updateInterfaceTexts();
    renderCategories();
    
    // Инициализация поиска
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        const clearBtn = document.getElementById('clearSearchBtn');
        if(currentSearchTerm.length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
        renderMenu();
    });
}

// 2. ПЕРЕКЛЮЧЕНИЕ ЯЗЫКОВ И ШРИФТОВ
function switchLang(lang) {
    currentLang = lang;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('lang-active', btn.innerText === lang);
    });

    // Смена шрифтов для Английского
    const root = document.documentElement;
    if (lang === 'EN') {
        document.body.classList.replace('font-serif-ru', 'font-serif-en');
    } else {
        document.body.classList.replace('font-serif-en', 'font-serif-ru');
    }

    updateInterfaceTexts();
    renderCategories();
    renderMenu();
}

function updateInterfaceTexts() {
    const dict = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerText = dict[key];
    });
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = dict['search_placeholder'];

    const infoContainer = document.getElementById('infoContainer');
    if (infoContainer) infoContainer.innerHTML = dict['info_content'];
}

// 3. ПЕРЕКЛЮЧЕНИЕ КУХНЯ / БАР
function switchMainTab(index, btn) {
    btn.blur(); // Сбрасываем фокус, чтобы не залипало
    currentTab = btn.getAttribute('data-type');
    
    // Двигаем зеленый индикатор
    const indicator = document.getElementById('nav-indicator');
    indicator.style.transform = `translateX(${index * 100}%)`;
    
    // Меняем цвета текста кнопок
    const btns = document.querySelectorAll('.nav-btn');
    btns.forEach((b, i) => {
        if(i === index) {
            b.classList.remove('text-forest-green/60');
            b.classList.add('text-cream');
        } else {
            b.classList.remove('text-cream');
            b.classList.add('text-forest-green/60');
        }
    });

    currentCategory = null;
    currentSearchTerm = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearchBtn').classList.add('hidden');
    
    renderCategories();
    renderMenu();
}

// 4. РЕНДЕР КАТЕГОРИЙ (Горизонтальный скролл)
function renderCategories() {
    const container = document.getElementById('categoryContainer');
    container.innerHTML = '';
    
    // Фильтруем категории по текущему табу (Кухня или Бар)
    const tabs = menuData.categories.filter(c => c.tab === currentTab);
    
    if (tabs.length > 0 && !currentCategory) {
        currentCategory = tabs[0].id;
    }

    tabs.forEach(cat => {
        const isActive = cat.id === currentCategory;
        const catName = cat.name[currentLang] || cat.name['RU'];
        
        const btn = document.createElement('button');
        btn.className = `whitespace-nowrap px-4 py-2 rounded-xl text-[13px] tracking-wide font-medium transition-all duration-300 snap-center ${
            isActive ? 'bg-forest-green text-cream shadow-md shadow-forest-green/10' : 'bg-white text-forest-green/60 border border-forest-green/5'
        }`;
        btn.innerText = catName;
        btn.onclick = () => {
            btn.blur(); // Избегаем залипания
            selectCategory(cat.id);
        };
        container.appendChild(btn);

        // Центрируем активную категорию
        if (isActive) {
            setTimeout(() => {
                btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }, 50);
        }
    });
}

function selectCategory(id) {
    currentCategory = id;
    renderCategories();
    renderMenu();
    
    // Плавный скролл к началу списка блюд
    const menuSection = document.getElementById('menu-section');
    window.scrollTo({
        top: menuSection.offsetTop - 80,
        behavior: 'smooth'
    });
}

// 5. РЕНДЕР БЛЮД С ИНТЕРСЕКШН ОБЗЕРВЕРОМ
function renderMenu() {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '';
    
    let itemsToRender = menuData.items;

    // Фильтрация по поиску или категории
    if (currentSearchTerm) {
        const term = currentSearchTerm.toLowerCase();
        itemsToRender = itemsToRender.filter(item => {
            const name = (item.name[currentLang] || item.name['RU']).toLowerCase();
            return name.includes(term) && menuData.categories.find(c => c.id === item.categoryId).tab === currentTab;
        });
    } else {
        itemsToRender = itemsToRender.filter(item => item.categoryId === currentCategory);
    }

    if (itemsToRender.length === 0) {
        container.innerHTML = `<p class="text-center text-forest-green/40 mt-10 text-sm">Ничего не найдено</p>`;
        return;
    }

    const serifClass = currentLang === 'EN' ? 'font-serif-en' : 'font-serif-ru';

    itemsToRender.forEach(item => {
        const name = item.name[currentLang] || item.name['RU'];
        const description = item.description ? (item.description[currentLang] || item.description['RU']) : '';
        const hasImage = !!item.image;
        
        // Создаем HTML карточки
        const el = document.createElement('div');
        el.className = 'menu-card fade-in-up bg-white rounded-3xl p-4 mb-3 border border-forest-green/5 flex items-center justify-between gap-4 cursor-pointer relative overflow-hidden';
        
        // Если есть картинка, добавляем красивый мини-маркер слева
        const imageIndicator = hasImage ? `<div class="absolute left-0 top-0 bottom-0 w-1 bg-nectar-accent/80"></div>` : '';

        el.innerHTML = `
            ${imageIndicator}
            <div class="flex-1 min-w-0 py-1 pl-1">
                <h3 class="${serifClass} text-[19px] text-forest-green font-semibold leading-snug truncate">${name}</h3>
                ${description ? `<p class="text-[11px] text-forest-green/50 mt-1 truncate tracking-wide">${description}</p>` : ''}
                <div class="flex items-center gap-2 mt-2">
                    <span class="${serifClass} text-[16px] text-warm-gold font-medium">${item.price.toLocaleString()} ₸</span>
                </div>
            </div>
            ${hasImage ? `
                <div class="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                    <img src="${item.image}" class="w-full h-full object-cover" alt="${name}">
                </div>
            ` : `
                <div class="w-8 h-8 rounded-full bg-forest-green/5 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-[16px] text-forest-green/40">chevron_right</span>
                </div>
            `}
        `;
        
        el.onclick = () => {
            el.blur();
            openModal(item);
        };
        container.appendChild(el);
    });

    // Запускаем Intersection Observer без задержек (исправление твоей проблемы)
    initObserver();
}

function initObserver() {
    if (observer) observer.disconnect();
    
    observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: "50px 0px 0px 0px"
    });

    document.querySelectorAll('.fade-in-up').forEach(el => {
        observer.observe(el);
    });
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    currentSearchTerm = '';
    document.getElementById('clearSearchBtn').classList.add('hidden');
    renderMenu();
}

// 6. ПЕРЕКЛЮЧЕНИЕ СЕКЦИЙ SPA (Меню / Инфо)
function switchSection(sectionId, btn) {
    btn.blur();
    
    document.querySelectorAll('.spa-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${sectionId}-section`).classList.add('active');

    // Обновляем цвета иконок в нижнем меню
    document.querySelectorAll('.bottom-nav-btn').forEach(b => {
        if(b.getAttribute('data-path') === sectionId) {
            b.classList.remove('text-forest-green/40');
            b.classList.add('text-forest-green');
        } else {
            b.classList.remove('text-forest-green');
            b.classList.add('text-forest-green/40');
        }
    });

    if(sectionId === 'info') {
        initObserver(); // Анимируем появление блоков в Инфо
    }
}

// 7. ЛОГИКА МОДАЛЬНОГО ОКНА БЛЮДА
function openModal(item) {
    const modal = document.getElementById('itemModal');
    const name = item.name[currentLang] || item.name['RU'];
    const desc = item.description ? (item.description[currentLang] || item.description['RU']) : '';
    const serifClass = currentLang === 'EN' ? 'font-serif-en' : 'font-serif-ru';
    
    // Настраиваем шрифты
    const titleEl = document.getElementById('modalTitle');
    titleEl.className = `${serifClass} text-[26px] text-forest-green font-semibold leading-tight`;
    titleEl.innerText = name;
    
    document.getElementById('modalPrice').innerText = `${item.price.toLocaleString()} ₸`;

    // Работаем с картинкой
    const imgContainer = document.getElementById('modalImageContainer');
    const imgEl = document.getElementById('modalImage');
    if (item.image) {
        imgEl.src = item.image;
        imgContainer.classList.remove('hidden');
    } else {
        imgContainer.classList.add('hidden');
        imgEl.src = '';
    }

    // Описание
    const ingrContainer = document.getElementById('modalIngredientsContainer');
    if (desc) {
        document.getElementById('modalIngredients').innerText = desc;
        ingrContainer.classList.remove('hidden');
        ingrContainer.classList.add('flex');
    } else {
        ingrContainer.classList.add('hidden');
        ingrContainer.classList.remove('flex');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Анимация появления
    modal.querySelector('.relative.bg-cream').classList.add('modal-enter');
}

function closeModal() {
    const modal = document.getElementById('itemModal');
    const modalContent = modal.querySelector('.relative.bg-cream');
    
    modalContent.classList.remove('modal-enter');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}
