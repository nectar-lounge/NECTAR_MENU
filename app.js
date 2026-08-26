let menuData = { categories: [], items: [] };
let currentLang = 'RU';
let currentTab = 'kitchen';
let currentCategory = 'all';
let currentSearchTerm = '';

const translations = {
    'RU': {
        cat_all: 'Все',
        info_content: `
            <div class="bg-white rounded-[24px] p-6 shadow-sm border border-forest-green/5">
                <h3 class="font-serif-ru text-2xl text-forest-green mb-2">О пространстве</h3>
                <p class="text-sm text-forest-green/70 font-light leading-relaxed">NECTAR — премиальное пространство высокой кухни и миксологии.</p>
            </div>
            <div class="bg-white rounded-[24px] p-6 shadow-sm border border-forest-green/5">
                <h3 class="font-serif-ru text-2xl text-forest-green mb-2">Контакты & Режим работы</h3>
                <p class="text-sm text-forest-green/70 font-light leading-relaxed">г. Алматы<br>Ежедневно с 14:00 до 03:00</p>
            </div>
        `
    },
    'EN': {
        cat_all: 'All',
        info_content: `
            <div class="bg-white rounded-[24px] p-6 shadow-sm border border-forest-green/5">
                <h3 class="font-serif-ru text-2xl text-forest-green mb-2">About Us</h3>
                <p class="text-sm text-forest-green/70 font-light leading-relaxed">NECTAR is a premium space of haute cuisine and mixology.</p>
            </div>
            <div class="bg-white rounded-[24px] p-6 shadow-sm border border-forest-green/5">
                <h3 class="font-serif-ru text-2xl text-forest-green mb-2">Contacts & Hours</h3>
                <p class="text-sm text-forest-green/70 font-light leading-relaxed">Almaty city<br>Daily from 2:00 PM to 3:00 AM</p>
            </div>
        `
    },
    'KZ': {
        cat_all: 'Барлығы',
        info_content: `
            <div class="bg-white rounded-[24px] p-6 shadow-sm border border-forest-green/5">
                <h3 class="font-serif-ru text-2xl text-forest-green mb-2">Біз туралы</h3>
                <p class="text-sm text-forest-green/70 font-light leading-relaxed">NECTAR — авторлық асхана мен бар мәдениетінің премиум кеңістігі.</p>
            </div>
            <div class="bg-white rounded-[24px] p-6 shadow-sm border border-forest-green/5">
                <h3 class="font-serif-ru text-2xl text-forest-green mb-2">Байланыс және уақыты</h3>
                <p class="text-sm text-forest-green/70 font-light leading-relaxed">Алматы қ.<br>Күн сайын 14:00-ден 03:00-ге дейін</p>
            </div>
        `
    }
};

document.addEventListener('DOMContentLoaded', () => {
    fetch('menu.json')
        .then(res => res.json())
        .then(data => {
            menuData = data;
            initApp();
        })
        .catch(err => console.error("Ошибка загрузки menu.json:", err));

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.trim().toLowerCase();
            renderMenu();
        });
    }
});

function initApp() {
    renderCategories();
    renderMenu();
    updateInfo();
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.toggle('lang-active', b.innerText === lang);
    });
    renderCategories();
    renderMenu();
    updateInfo();
}

function updateInfo() {
    const infoContainer = document.getElementById('infoContainer');
    if (infoContainer && translations[currentLang]) {
        infoContainer.innerHTML = translations[currentLang].info_content;
    }
}

function switchMainTab(index, btn) {
    currentTab = btn.getAttribute('data-type');
    const indicator = document.getElementById('nav-indicator');
    if (indicator) {
        indicator.style.transform = `translateX(${index * 100}%)`;
    }
    
    document.querySelectorAll('.nav-btn').forEach((b, i) => {
        b.className = i === index 
            ? 'nav-btn flex-1 relative z-10 py-2.5 text-[11px] tracking-[0.2em] text-cream uppercase font-semibold' 
            : 'nav-btn flex-1 relative z-10 py-2.5 text-[11px] tracking-[0.2em] text-forest-green/60 uppercase font-semibold';
    });

    currentCategory = 'all';
    renderCategories();
    renderMenu();
}

function renderCategories() {
    const container = document.getElementById('categoryContainer');
    if (!container) return;
    container.innerHTML = '';
    
    const cats = menuData.categories.filter(c => c.tab === currentTab);
    
    const allBtn = document.createElement('button');
    const isAll = currentCategory === 'all';
    allBtn.className = `whitespace-nowrap px-4 py-2 rounded-xl text-[11px] tracking-[0.1em] uppercase font-medium transition-all ${isAll ? 'bg-forest-green text-cream shadow-sm' : 'bg-white text-forest-green/60 border border-forest-green/5'}`;
    allBtn.innerText = translations[currentLang].cat_all;
    allBtn.onclick = () => { 
        currentCategory = 'all'; 
        renderCategories(); 
        renderMenu(); 
    };
    container.appendChild(allBtn);

    cats.forEach(cat => {
        const isActive = cat.id === currentCategory;
        const btn = document.createElement('button');
        btn.className = `whitespace-nowrap px-4 py-2 rounded-xl text-[11px] tracking-[0.1em] uppercase font-medium transition-all ${isActive ? 'bg-forest-green text-cream shadow-sm' : 'bg-white text-forest-green/60 border border-forest-green/5'}`;
        btn.innerText = cat.name[currentLang] || cat.name['RU'];
        btn.onclick = () => { 
            currentCategory = cat.id; 
            renderCategories(); 
            renderMenu(); 
        };
        container.appendChild(btn);
    });
}

function renderMenu() {
    const container = document.getElementById('menuContainer');
    if (!container) return;
    container.innerHTML = '';
    
    let items = menuData.items;
    
    if (currentSearchTerm) {
        items = items.filter(i => {
            const name = (i.name[currentLang] || i.name['RU']).toLowerCase();
            const desc = i.description ? (i.description[currentLang] || i.description['RU']).toLowerCase() : '';
            return name.includes(currentSearchTerm) || desc.includes(currentSearchTerm);
        });
    } else {
        const validCats = menuData.categories.filter(c => c.tab === currentTab).map(c => c.id);
        items = items.filter(i => validCats.includes(i.categoryId));
        if (currentCategory !== 'all') {
            items = items.filter(i => i.categoryId === currentCategory);
        }
    }

    if (items.length === 0) {
        container.innerHTML = `<p class="text-center text-forest-green/40 mt-10 text-sm font-light">Ничего не найдено</p>`;
        return;
    }

    items.forEach(item => {
        const name = item.name[currentLang] || item.name['RU'];
        const desc = item.description ? (item.description[currentLang] || item.description['RU']) : '';
        const el = document.createElement('div');
        el.className = 'menu-card bg-white rounded-[22px] p-4 flex items-center justify-between gap-4 cursor-pointer active:scale-[0.98] transition-transform';
        el.innerHTML = `
            <div class="flex-1 min-w-0">
                <h3 class="font-serif-ru text-[19px] text-forest-green font-medium truncate">${name}</h3>
                ${desc ? `<p class="text-[12px] text-forest-green/50 mt-1 truncate font-light">${desc}</p>` : ''}
                <div class="mt-2"><span class="font-serif-ru text-[17px] text-warm-gold font-medium">${item.price.toLocaleString()} ₸</span></div>
            </div>
            ${item.image ? `<div class="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-forest-green/5"><img src="${item.image}" class="w-full h-full object-cover"></div>` : ''}
        `;
        el.onclick = () => openModal(item);
        container.appendChild(el);
    });
}

function switchSection(sectionId, btn) {
    document.querySelectorAll('.spa-section').forEach(s => s.classList.remove('active'));
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    document.querySelectorAll('nav button').forEach((b, i) => {
        b.className = (i === (sectionId === 'menu' ? 0 : 1)) 
            ? 'flex flex-col items-center text-forest-green transition-opacity' 
            : 'flex flex-col items-center text-forest-green/40 transition-opacity';
    });
}

function openModal(item) {
    const modalTitle = document.getElementById('modalTitle');
    const modalPrice = document.getElementById('modalPrice');
    const modalWeight = document.getElementById('modalWeight');
    const modalImage = document.getElementById('modalImage');
    const imgContainer = document.getElementById('modalImageContainer');
    const modalDescription = document.getElementById('modalDescription');
    const descContainer = document.getElementById('modalDescriptionContainer');
    const itemModal = document.getElementById('itemModal');

    if (modalTitle) modalTitle.innerText = item.name[currentLang] || item.name['RU'];
    if (modalPrice) modalPrice.innerText = `${item.price.toLocaleString()} ₸`;
    
    if (modalWeight) {
        if (item.weight) { 
            modalWeight.innerText = item.weight; 
            modalWeight.classList.remove('hidden'); 
        } else { 
            modalWeight.classList.add('hidden'); 
        }
    }
    
    if (imgContainer && modalImage) {
        if (item.image) { 
            modalImage.src = item.image; 
            imgContainer.classList.remove('hidden'); 
        } else { 
            imgContainer.classList.add('hidden'); 
        }
    }
    
    const desc = item.description ? (item.description[currentLang] || item.description['RU']) : '';
    if (descContainer && modalDescription) {
        if (desc) { 
            modalDescription.innerText = desc; 
            descContainer.classList.remove('hidden'); 
            descContainer.classList.add('flex'); 
        } else { 
            descContainer.classList.add('hidden'); 
            descContainer.classList.remove('flex'); 
        }
    }

    if (itemModal) {
        itemModal.classList.remove('hidden');
        itemModal.classList.add('flex');
    }
}

function closeModal() {
    const itemModal = document.getElementById('itemModal');
    if (itemModal) {
        itemModal.classList.add('hidden');
        itemModal.classList.remove('flex');
    }
}
