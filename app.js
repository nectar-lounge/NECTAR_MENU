let currentLang = 'ru';
let currentTab = 'food';
let searchQuery = '';

const appContent = document.getElementById('app-content');
const categoryNav = document.getElementById('categoryNav');
const searchInput = document.getElementById('searchInput');

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initThemeTimeBased();
    renderNav();
    renderMenu();
});

// Автоматическая смена темы (Вечер/День: с 18:00 до 6:00 — темная)
function initThemeTimeBased() {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Переключение языка
function changeLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    searchInput.placeholder = I18N.searchPlaceholder[lang];
    document.getElementById('footerAllergy').innerText = I18N.allergy[lang];
    
    // Перевод ярлыков модального окна
    document.getElementById('labelComposition').innerText = I18N.modalLabels.composition[lang];
    document.getElementById('labelOutput').innerText = I18N.modalLabels.output[lang];

    renderNav();
    renderMenu();
}

// Отрисовка навигации по основным вкладкам
function renderNav() {
    const tabs = ['food', 'bar', 'info', 'contacts'];
    let html = '';
    tabs.forEach(tab => {
        const activeClass = currentTab === tab ? 'active' : '';
        html += `<button class="nav-btn ${activeClass}" onclick="switchTab('${tab}')">${I18N.tabs[tab][currentLang]}</button>`;
    });
    categoryNav.innerHTML = html;
}

// Переключение вкладки
function switchTab(tab) {
    currentTab = tab;
    searchQuery = '';
    searchInput.value = '';
    renderNav();
    renderMenu();
}

// Обработка ввода в поиск
function handleSearch(event) {
    searchQuery = event.target.value.toLowerCase().trim();
    renderMenu();
}

// Рендеринг основного контента меню
function renderMenu() {
    let html = '';

    if (currentTab === 'info') {
        html = `
            <div class="info-block">
                <h3>Nectar Lounge & Bar</h3>
                <p>${I18N.infoContent[currentLang]}</p>
            </div>
        `;
    } else if (currentTab === 'contacts') {
        html = `
            <div class="info-block">
                <h3>Nectar</h3>
                <div class="contact-links">
                    <a href="tel:+77064273269" class="contact-item">📞 +7 (706) 427-32-69</a>
                    <a href="https://go.2gis.com/CEheE" target="_blank" class="contact-item">📍 Открыть в 2GIS</a>
                </div>
            </div>
        `;
    } else {
        const categoryKeys = SECTIONS[currentTab];
        const sourceData = currentTab === 'food' ? MENU_DATA : DRINKS_DATA;
        let totalItemsFound = 0;

        categoryKeys.forEach(catKey => {
            const category = sourceData[catKey];
            if (!category) return;

            // Фильтрация по поиску
            const filteredItems = category.items.filter(item => {
                const nameMatch = item.name[currentLang].toLowerCase().includes(searchQuery);
                const subMatch = item.sub && item.sub[currentLang] && item.sub[currentLang].toLowerCase().includes(searchQuery);
                return nameMatch || subMatch;
            });

            if (filteredItems.length > 0) {
                totalItemsFound += filteredItems.length;
                html += `<h2 class="section-title">${category[currentLang]}</h2>`;
                
                filteredItems.forEach(item => {
                    const subText = item.sub && item.sub[currentLang] ? `<span class="item-sub">${item.sub[currentLang]}</span>` : '';
                    // Экранируем данные для передачи в функцию клика
                    const compSafe = encodeURIComponent(item.composition || 'Фирменный рецепт заведения');
                    const outSafe = encodeURIComponent(item.output || '—');
                    const nameSafe = encodeURIComponent(item.name[currentLang]);

                    html += `
                        <div class="menu-item" onclick="openModal('${nameSafe}', '${compSafe}', '${outSafe}', '${item.price}')">
                            <div class="item-name">
                                ${item.name[currentLang]}
                                ${subText}
                            </div>
                            <div class="item-price">${item.price} ₸</div>
                        </div>
                    `;
                });
            }
        });

        if (totalItemsFound === 0) {
            html = `<div class="info-block"><p>Ничего не найдено по вашему запросу</p></div>`;
        }
    }

    appContent.innerHTML = html;
}

// Логика модального окна HORECA
function openModal(name, composition, output, price) {
    document.getElementById('modalTitle').innerText = decodeURIComponent(name);
    document.getElementById('modalComposition').innerText = decodeURIComponent(composition);
    document.getElementById('modalOutput').innerText = decodeURIComponent(output);
    document.getElementById('modalPrice').innerText = price + ' ₸';
    
    document.getElementById('itemModal').classList.add('active');
    document.body.style.overflow = 'hidden'; // блокировка скролла страницы под модалкой
}

function closeModal() {
    document.getElementById('itemModal').classList.remove('active');
    document.body.style.overflow = '';
}

function closeModalOnOutside(event) {
    if (event.target.id === 'itemModal') {
        closeModal();
    }
}
