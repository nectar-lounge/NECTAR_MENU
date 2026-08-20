// Вставь сюда свои const MENU_DATA = {...} и const DRINKS_DATA = {...}

// Группировка для навигации
const SECTIONS = {
    food: Object.keys(MENU_DATA),
    soft: ["Безалкогольные напитки"],
    bar: ["Вино", "Водка", "Пиво бутылочное", "Пиво разливное"]
};

// Переводы системных текстов
const I18N = {
    allergy: {
        ru: "ПРОСИМ СООБЩИТЬ ОФИЦИАНТУ ОБ ИМЕЮЩИХСЯ АЛЛЕРГИЯХ",
        kz: "ДАЯШЫҒА АЛЛЕРГИЯҢЫЗ ТУРАЛЫ ЕСКЕРТУІҢІЗДІ СҰРАЙМЫЗ",
        en: "PLEASE INFORM THE WAITER ABOUT ANY ALLERGIES"
    },
    currency: {
        ru: "ВСЕ ЦЕНЫ УКАЗАНЫ В ТЕНГЕ",
        kz: "БАРЛЫҚ БАҒАЛАР ТЕҢГЕМЕН КӨРСЕТІЛГЕН",
        en: "ALL PRICES ARE IN KZT"
    },
    infoText: {
        ru: "Уголок потребителя: ИП NECTAR, БИН...<br>Вся продукция сертифицирована.",
        kz: "Тұтынушы бұрышы: ЖК NECTAR...",
        en: "Consumer corner: IE NECTAR..."
    }
};

let currentLang = 'ru';
let currentTab = 'food';
const appContent = document.getElementById('app-content');
const searchInput = document.getElementById('searchInput');

// Функция рендера меню
function renderMenu(query = "") {
    let html = '';
    
    if (currentTab === 'info') {
        html = `<div class="info-block">
                    <h3>Информация для гостей</h3>
                    <p>${I18N.infoText[currentLang]}</p>
                </div>`;
    } else if (currentTab === 'contacts') {
        html = `<div class="info-block">
                    <h3>Контакты</h3>
                    <p>Телефон: <a href="tel:+77000000000">+7 (700) 000-00-00</a></p>
                    <p style="margin-top: 15px;"><a href="ССЫЛКА_НА_2GIS" target="_blank">📍 Мы в 2GIS</a></p>
                </div>`;
    } else {
        // Рендер еды и напитков
        const categories = SECTIONS[currentTab];
        const sourceData = currentTab === 'food' ? MENU_DATA : DRINKS_DATA;

        categories.forEach(catKey => {
            const category = sourceData[catKey];
            const filteredItems = category.items.filter(item => {
                const name = item.name[currentLang].toLowerCase();
                return name.includes(query.toLowerCase());
            });

            if (filteredItems.length > 0) {
                html += `<h2 class="section-title">${category[currentLang]}</h2>`;
                filteredItems.forEach(item => {
                    // Поддержка подписей (как у пива/чая)
                    const subText = item.sub && item.sub[currentLang] ? `<span class="item-sub">${item.sub[currentLang]}</span>` : '';
                    
                    html += `
                        <div class="menu-item">
                            <div class="item-name">
                                ${item.name[currentLang]}
                                ${subText}
                            </div>
                            <div class="item-price">${item.price}</div>
                        </div>
                    `;
                });
            }
        });
        
        if (html === '') html = '<p style="text-align:center; margin-top:20px;">Ничего не найдено</p>';
    }

    appContent.innerHTML = html;
    updateStaticTexts();
}

// Обновление статических текстов (футер)
function updateStaticTexts() {
    document.querySelector('[data-i18n="allergy"]').innerText = I18N.allergy[currentLang];
    document.querySelector('[data-i18n="currency"]').innerText = I18N.currency[currentLang];
    searchInput.placeholder = currentLang === 'ru' ? "Поиск по меню..." : currentLang === 'kz' ? "Мәзір бойынша іздеу..." : "Search menu...";
}

// Слушатели переключения языков
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentLang = e.target.dataset.lang;
        renderMenu(searchInput.value);
    });
});

// Слушатели переключения вкладок
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentTab = e.target.dataset.target;
        searchInput.value = ""; // очищаем поиск при смене вкладки
        // Скрываем поиск на вкладках инфо и контакты
        searchInput.style.display = (currentTab === 'info' || currentTab === 'contacts') ? 'none' : 'block';
        renderMenu();
    });
});

// Слушатель поиска
searchInput.addEventListener('input', (e) => {
    renderMenu(e.target.value);
});

// Инициализация
renderMenu();
