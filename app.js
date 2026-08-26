let menuData = { categories: [], items: [] };
let currentLang = 'RU';
let currentTab = 'kitchen';
let currentCategory = null;
let currentSearchTerm = '';
let observer = null;

const translations = {
    'RU': {
        header_subtitle: 'Lounge · Bar · Kitchen',
        nav_kitchen: 'Кухня',
        nav_bar: 'Бар',
        search_placeholder: 'Поиск блюд, напитков...',
        tab_menu: 'Меню',
        tab_info: 'Инфо',
        modal_ingredients: 'Состав',
        modal_close: 'Закрыть',
        cat_all: 'Все',
        info_content: `
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-forest-green/5 mb-4 fade-in-up">
                <h3 class="font-serif-ru text-2xl text-forest-green mb-3">Добро пожаловать в NECTAR</h3>
                <p class="text-sm text-forest-green/70 leading-relaxed">Премиальное пространство, где авторская гастрономия встречается с атмосферой абсолютного расслабления. Изысканный бар, авторская кухня и безупречный сервис.</p>
            </div>
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-forest-green/5 mb-4 fade-in-up">
                <h3 class="font-serif-ru text-xl text-forest-green mb-3">Контакты и Режим работы</h3>
                <p class="text-sm text-forest-green/70 mb-2">📍 Адрес: ул. Примерная, 123</p>
                <p class="text-sm text-forest-green/70 mb-2">📞 Бронь столов: +7 (777) 123-45-67</p>
                <p class="text-sm text-forest-green/70">🕒 Ежедневно с 12:00 до 03:00</p>
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
        modal_ingredients: 'Ingredients',
        modal_close: 'Close',
        cat_all: 'All',
        info_content: `
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-forest-green/5 mb-4 fade-in-up">
                <h3 class="font-serif-ru text-2xl text-forest-green mb-3">Welcome to NECTAR</h3>
                <p class="text-sm text-forest-green/70 leading-relaxed">A premium space where signature gastronomy meets an atmosphere of absolute relaxation. Exquisite bar, author's cuisine, and impeccable service.</p>
            </div>
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-forest-green/5 mb-4 fade-in-up">
                <h3 class="font-serif-ru text-xl text-forest-green mb-3">Contacts & Hours</h3>
                <p class="text-sm text-forest-green/70 mb-2">📍 Address: 123 Sample St</p>
                <p class="text-sm text-forest-green/70 mb-2">📞 Reservations: +7 (777) 123-45-67</p>
                <p class="text-sm text-forest-green/70">🕒 Daily from 12:00 PM to 03:00 AM</p>
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
        modal_ingredients: 'Құрамы',
        modal_close: 'Жабу',
        info_content: `
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-forest-green/5 mb-4 fade-in-up">
                <h3 class="font-serif-ru text-2xl text-forest-green mb-3">NECTAR-ға қош келдіңіз</h3>
                <p class="text-sm text-forest-green/70 leading-relaxed">Авторлық гастрономия мен толық демалыс атмосферасы біріктірілген премиум кеңістік. Талғампаз бар, авторлық асхана және мінсіз сервис.</p>
            </div>
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-forest-green/5 mb-4 fade-in-up">
                <h3 class="font-serif-ru text-xl text-forest-green mb-3">Байланыс және жұмыс уақыты</h3>
                <p class="text-sm text-forest-green/70 mb-2">📍 Мекенжайы: Мысал к-сі, 123</p>
                <p class="text-sm text-forest-green/70 mb-2">📞 Үстел брондау: +7 (777) 123-45-67</p>
                <p class="text-sm text-forest-green/70">🕒 Күн сайын 12:00-ден 03:00-ге дейін</p>
            </div>
        `
    }
};

document.addEventListener('DOMContentLoaded', () => {
    fetch('menu.json')
        .then(response => {
            if (!response.ok) throw new Error("Сетевая ошибка");
            return response.json();
        })
        .then(data => {
            menuData = data;
            initApp();
        })
        .catch(error => {
            console.error("Ошибка загрузки меню:", error);
            document.getElementById('menuContainer').innerHTML = `<p class="text-center text-red-500 mt-10 text-sm">Ошибка загрузки меню. Проверьте файл menu.json</p>`;
        });
});

function initApp() {
    updateInterfaceTexts();
    renderCategories();
    
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.trim();
        const clearBtn = document.getElementById('clearSearchBtn');
        if(currentSearchTerm.length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
        renderMenu();
    });
}

function switchLang(lang) {
    currentLang = lang;
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('lang-active', btn.innerText === lang);
    });

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

function switchMainTab(index, btn) {
    btn.blur();
    currentTab = btn.getAttribute('data-type');
    
    const indicator = document.getElementById('nav-indicator');
    indicator.style.transform = `translateX(${index * 100}%)`;
    
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

    currentCategory = 'all'; // При переходе на вкладку по умолчанию выбираем "Все"
    currentSearchTerm = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearchBtn').classList.add('hidden');
    
    renderCategories();
    renderMenu();
}

function renderCategories() {
    const container = document.getElementById('categoryContainer');
    container.innerHTML = '';
    
    const tabs = menuData.categories.filter(c => c.tab === currentTab);
    
    if (!currentCategory) {
        currentCategory = 'all';
    }

    // Кнопка "ВСЕ"
    const allBtn = document.createElement('button');
    const isAllActive = currentCategory === 'all';
    allBtn.className = `whitespace-nowrap px-4 py-2 rounded-xl text-[13px] tracking-wide font-medium transition-all duration-300 snap-center ${
        isAllActive ? 'bg-forest-green text-cream shadow-md shadow-forest-green/10' : 'bg-white text-forest-green/60 border border-forest-green/5'
    }`;
    allBtn.innerText = translations[currentLang]['cat_all'];
    allBtn.onclick = () => {
        allBtn.blur();
        selectCategory('all');
    };
    container.appendChild(allBtn);

    tabs.forEach(cat => {
        const isActive = cat.id === currentCategory;
        const catName = cat.name[currentLang] || cat.name['RU'];
        
        const btn = document.createElement('button');
        btn.className = `whitespace-nowrap px-4 py-2 rounded-xl text-[13px] tracking-wide font-medium transition-all duration-300 snap-center ${
            isActive ? 'bg-forest-green text-cream shadow-md shadow-forest-green/10' : 'bg-white text-forest-green/60 border border-forest-green/5'
        }`;
        btn.innerText = catName;
        btn.onclick = () => {
            btn.blur();
            selectCategory(cat.id);
        };
        container.appendChild(btn);

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
    
    const menuSection = document.getElementById('menu-section');
    window.scrollTo({
        top: menuSection.offsetTop - 80,
        behavior: 'smooth'
    });
}

function renderMenu() {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '';
    
    let itemsToRender = menuData.items;

    // Глобальный поиск по всему меню (и кухня, и бар)
    if (currentSearchTerm) {
        const term = currentSearchTerm.toLowerCase();
        itemsToRender = itemsToRender.filter(item => {
            const name = (item.name[currentLang] || item.name['RU']).toLowerCase();
            const desc = item.description ? (item.description[currentLang] || item.description['RU']).toLowerCase() : '';
            return name.includes(term) || desc.includes(term);
        });
    } else {
        // Фильтрация по вкладке (кухня/бар)
        const validCategories = menuData.categories.filter(c => c.tab === currentTab).map(c => c.id);
        itemsToRender = itemsToRender.filter(item => validCategories.includes(item.categoryId));

        // Фильтрация по конкретной категории, если выбрана не "Все"
        if (currentCategory !== 'all') {
            itemsToRender = itemsToRender.filter(item => item.categoryId === currentCategory);
        }
    }

    if (itemsToRender.length === 0) {
        container.innerHTML = `<p class="text-center text-forest-green/40 mt-10 text-sm">Ничего не найдено</p>`;
        return;
    }

    itemsToRender.forEach(item => {
        const name = item.name[currentLang] || item.name['RU'];
        const description = item.description ? (item.description[currentLang] || item.description['RU']) : '';
        const hasImage = !!item.image;
        
        const el = document.createElement('div');
        el.className = 'menu-card fade-in-up bg-white rounded-3xl p-4 mb-3 border border-forest-green/5 flex items-center justify-between gap-4 cursor-pointer relative overflow-hidden active:scale-[0.98] transition-transform';
        
        const imageIndicator = hasImage ? `<div class="absolute left-0 top-0 bottom-0 w-1 bg-nectar-accent/80"></div>` : '';

        el.innerHTML = `
            ${imageIndicator}
            <div class="flex-1 min-w-0 py-1 pl-1">
                <h3 class="font-serif-ru text-[19px] text-forest-green font-semibold leading-snug truncate">${name}</h3>
                ${description ? `<p class="text-[11px] text-forest-green/50 mt-1 truncate tracking-wide">${description}</p>` : ''}
                <div class="flex items-center gap-2 mt-2">
                    <span class="font-serif-ru text-[16px] text-warm-gold font-medium">${item.price.toLocaleString()} ₸</span>
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

function switchSection(sectionId, btn) {
    btn.blur();
    
    document.querySelectorAll('.spa-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${sectionId}-section`).classList.add('active');

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
        initObserver();
    } else {
        // При возврате в меню сбрасываем поиск для чистоты интерфейса
        document.getElementById('searchInput').value = '';
        currentSearchTerm = '';
        document.getElementById('clearSearchBtn').classList.add('hidden');
        renderMenu();
    }
}

function openModal(item) {
    const modal = document.getElementById('itemModal');
    const name = item.name[currentLang] || item.name['RU'];
    const desc = item.description ? (item.description[currentLang] || item.description['RU']) : '';
    
    document.getElementById('modalTitle').innerText = name;
    document.getElementById('modalPrice').innerText = `${item.price.toLocaleString()} ₸`;

    // Граммаж (если есть в базе, можно выводить, если нет — скрываем)
    const weightEl = document.getElementById('modalWeight');
    if (item.weight) {
        weightEl.innerText = item.weight;
        weightEl.classList.remove('hidden');
    } else {
        weightEl.classList.add('hidden');
    }

    const imgContainer = document.getElementById('modalImageContainer');
    const imgEl = document.getElementById('modalImage');
    if (item.image) {
        imgEl.src = item.image;
        imgContainer.classList.remove('hidden');
    } else {
        imgContainer.classList.add('hidden');
        imgEl.src = '';
    }

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
    modal.querySelector('.relative.bg-cream').classList.add('modal-enter');
}

function closeModal() {
    const modal = document.getElementById('itemModal');
    const modalContent = modal.querySelector('.relative.bg-cream');
    
    modalContent.classList.remove('modal-enter');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}
