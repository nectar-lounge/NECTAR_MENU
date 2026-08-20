const MENU_DATA = {
    "Холодные закуски": {
        ru: "Холодные закуски", kz: "Суық тағамдар", en: "Cold Appetizers",
        items: [
            { id: 1, name: { ru: "Мясное плато (казы, жая, жал)", kz: "Ет табағы (қазы, жая, жал)", en: "Meat Platter (Kazy, Zhaya, Zhal)" }, price: 4990 },
            { id: 2, name: { ru: "Домашние соленья", kz: "Үйде тұздалған көкөністер", en: "Homemade Pickles" }, price: 2890 },
            { id: 3, name: { ru: "Овощная нарезка", kz: "Көкөніс табағы", en: "Fresh Vegetable Platter" }, price: 2890 },
            { id: 4, name: { ru: "Рыбное ассорти", kz: "Балық ассортиі", en: "Fish Assortment" }, price: 5590 },
            { id: 5, name: { ru: "Капрезе", kz: "Капрезе", en: "Caprese" }, price: 2790 },
            { id: 6, name: { ru: "Сырное плато", kz: "Ірімшік табағы", en: "Cheese Platter" }, price: 4990 },
        ]
    },
    "Салаты": {
        ru: "Салаты", kz: "Салаттар", en: "Salads",
        items: [
            { id: 10, name: { ru: "Свежий овощной салат", kz: "Жаңа піскен көкөніс салаты", en: "Fresh Vegetable Salad" }, price: 1990 },
            { id: 11, name: { ru: "Аччик-чучук", kz: "Аччик-чучук", en: "Achchik-Chuchuk (Spicy Tomato Salad)" }, price: 1790 },
            { id: 12, name: { ru: "Цезарь с курицей", kz: "Тауық етімен Цезарь", en: "Caesar with Chicken" }, price: 2590 },
            { id: 13, name: { ru: "Хрустящие баклажаны", kz: "Қытырлақ баклажан", en: "Crispy Eggplant Salad" }, price: 2790 },
            { id: 14, name: { ru: "Греческий салат", kz: "Грек салаты", en: "Greek Salad" }, price: 2490 },
            { id: 15, name: { ru: "Теплый салат с кониной", kz: "Жылы жылқы еті салаты", en: "Warm Horse Meat Salad" }, price: 2990 },
            { id: 16, name: { ru: "Салат с креветками и рукколой", kz: "Асшаян және руккола салаты", en: "Shrimp & Rocket Salad" }, price: 3990 },
        ]
    },
    "Горячие закуски": {
        ru: "Горячие закуски", kz: "Ыстық тағамдар", en: "Hot Appetizers",
        items: [
            { id: 20, name: { ru: "Креветки темпура", kz: "Темпура асшаяндары", en: "Tempura Shrimp" }, price: 3290 },
            { id: 21, name: { ru: "Клаб-сэндвич с курицей", kz: "Тауық етімен клаб-сэндвич", en: "Chicken Club Sandwich" }, price: 3190 },
            { id: 22, name: { ru: "Кесадилья с курицей", kz: "Тауық етімен кесадилья", en: "Chicken Quesadilla" }, price: 2990 },
            { id: 23, name: { ru: "Чебуреки", kz: "Шебуректер", en: "Chebureki (Fried Meat Pastries)" }, price: 2590 },
            { id: 24, name: { ru: "Наггетсы куриные", kz: "Тауық наггетстері", en: "Chicken Nuggets" }, price: 1690 },
        ]
    },
    "Снэки": {
        ru: "Снэки", kz: "Снэкілер", en: "Snacks",
        items: [
            { id: 30, name: { ru: "Большой сет закусок", kz: "Үлкен тағамдар жиынтығы", en: "Large Snack Platter" }, sub: { ru: "креветки, гренки, чечил, фри, сосиски, луковые кольца", kz: "асшаяндар, гренкілер, чечил, фри, шұжықтар, пияз сақиналары", en: "Shrimp, Croutons, Chechil, Fries, Sausages, Onion Rings" }, price: 6990 },
            { id: 31, name: { ru: "Креветки пивные", kz: "Сыраға арналған асшаяндар", en: "Beer Shrimp" }, price: 3990 },
            { id: 32, name: { ru: "Фисташки", kz: "Писте", en: "Pistachios" }, price: 1590 },
            { id: 33, name: { ru: "Чесночные гренки", kz: "Сарымсақты гренкілер", en: "Garlic Croutons" }, price: 1590 },
            { id: 34, name: { ru: "Чечил копченый", kz: "Ысталған чечил", en: "Smoked Chechil Cheese" }, price: 1390 },
            { id: 35, name: { ru: "Арахис", kz: "Жер жаңғақ", en: "Peanuts" }, price: 1390 },
        ]
    },
    "Супы": {
        ru: "Супы", kz: "Сорпалар", en: "Soups",
        items: [
            { id: 40, name: { ru: "Окрошка с мясом (сезонная)", kz: "Ет қосылған окрошка (маусымдық)", en: "Okroshka with Meat (Seasonal)" }, price: 2390 },
            { id: 41, name: { ru: "Куриный суп с лапшой", kz: "Тауық еті қосылған кеспе сорпа", en: "Chicken Noodle Soup" }, price: 1590 },
            { id: 42, name: { ru: "Солянка мясная", kz: "Ет солянкасы", en: "Meat Solyanka" }, price: 3590 },
            { id: 43, name: { ru: "Том Ям", kz: "Том Ям", en: "Tom Yum" }, price: 3590 },
            { id: 44, name: { ru: "Рамен с говядиной", kz: "Сиыр етімен рамен", en: "Beef Ramen" }, price: 3590 },
            { id: 45, name: { ru: "Рамен с курицей", kz: "Тауық етімен рамен", en: "Chicken Ramen" }, price: 3290 },
            { id: 46, name: { ru: "Чечевичный крем-суп", kz: "Жасымық крем-сорпасы", en: "Creamy Lentil Soup" }, price: 1990 },
            { id: 47, name: { ru: "Шорпа", kz: "Шорпа", en: "Shorpa (Traditional Meat Broth)" }, price: 3290 },
            { id: 48, name: { ru: "Пельмени (с бульоном / без)", kz: "Пельмендер (сорпамен / сорпасыз)", en: "Pelmeni (with / without Broth)" }, price: 1990 },
        ]
    },
    "Пицца и выпечка": {
        ru: "Пицца и выпечка", kz: "Пицца және нан-тоқаш", en: "Pizza & Bakery",
        items: [
            { id: 50, name: { ru: "Пицца Пепперони", kz: "Пепперони пиццасы", en: "Pepperoni Pizza" }, price: 3090 },
            { id: 51, name: { ru: "Пицца Маргарита", kz: "Маргарита пиццасы", en: "Margherita Pizza" }, price: 2590 },
            { id: 52, name: { ru: "Пицца с курицей и грибами", kz: "Тауық еті және саңырауқұлақ қосылған пицца", en: "Chicken & Mushroom Pizza" }, price: 3090 },
            { id: 53, name: { ru: "Пицца Болоньезе", kz: "Болоньезе пиццасы", en: "Bolognese Pizza" }, price: 2990 },
            { id: 54, name: { ru: "Мексиканская пицца с халапеньо", kz: "Халапеньо қосылған мексикалық пицца", en: "Mexican Pizza with Jalapeño" }, price: 3590 },
            { id: 55, name: { ru: "Хачапури по-мегрельски", kz: "Мегрельше хачапури", en: "Megrelian Khachapuri" }, price: 2790 },
            { id: 56, name: { ru: "Хлебная корзина", kz: "Нан себеті", en: "Bread Basket" }, price: 890 },
            { id: 57, name: { ru: "Лепешка", kz: "Жайма нан", en: "Flatbread" }, price: 590 },
        ]
    },
    "Паста": {
        ru: "Паста", kz: "Паста", en: "Pasta",
        items: [
            { id: 60, name: { ru: "Фарфалле с морепродуктами", kz: "Теңіз өнімдерімен фарфалле", en: "Farfalle with Seafood" }, sub: { ru: "креветки, мидии, кальмары", kz: "асшаяндар, мидиялар, кальмарлар", en: "Shrimp, Mussels, Squid" }, price: 4990 },
            { id: 61, name: { ru: "Карбонара", kz: "Карбонара", en: "Carbonara" }, price: 3590 },
            { id: 62, name: { ru: "Болоньезе", kz: "Болоньезе", en: "Bolognese" }, price: 3290 },
            { id: 63, name: { ru: "Фетучини с курицей и грибами", kz: "Тауық еті және саңырауқұлақ қосылған фетучини", en: "Fettuccine with Chicken & Mushrooms" }, price: 2990 },
        ]
    },
    "Горячие блюда": {
        ru: "Горячие блюда", kz: "Ыстық тағамдар", en: "Main Courses",
        items: [
            { id: 70, name: { ru: "Куырдак", kz: "Қуырдақ", en: "Kuyrdak" }, price: 4090 },
            { id: 71, name: { ru: "Плов", kz: "Палау", en: "Plov" }, price: 3090 },
            { id: 72, name: { ru: "Бургер с курицей", kz: "Тауық етімен бургер", en: "Chicken Burger" }, price: 3290 },
            { id: 73, name: { ru: "Бургер с говядиной", kz: "Сиыр етімен бургер", en: "Beef Burger" }, price: 3590 },
            { id: 74, name: { ru: "Бургер, грибной стаут", kz: "Саңырауқұлақ стаутымен бургер", en: "Mushroom Stout Burger" }, price: 4390 },
            { id: 75, name: { ru: "Колбаски говяжьи / бараньи", kz: "Сиыр / қой шұжықтары", en: "Beef / Lamb Sausages" }, price: 3390 },
            { id: 76, name: { ru: "Колбаски куриные", kz: "Тауық шұжықтары", en: "Chicken Sausages" }, price: 2990 },
            { id: 77, name: { ru: "Говядина по-тайски с рисом", kz: "Тайша сиыр еті (күрішпен)", en: "Thai-style Beef with Rice" }, price: 3290 },
            { id: 78, name: { ru: "Бефстроганов с пюре", kz: "Бефстроганов (пюремен)", en: "Beef Stroganoff with Mashed Potatoes" }, price: 3290 },
            { id: 79, name: { ru: "Куриная грудка в сырно-сливочном соусе", kz: "Ірімшік-қаймақ соусындағы тауық төс еті", en: "Chicken Breast in Creamy Cheese Sauce" }, price: 3290 },
            { id: 80, name: { ru: "Картофель по-домашнему с мясом", kz: "Үйдегідей картоп (етпен)", en: "Homestyle Potatoes with Meat" }, price: 3990 },
        ]
    },
    "Шашлык на мангале": {
        ru: "Шашлык на мангале", kz: "Мангалдағы шашлык", en: "BBQ & Grill",
        items: [
            { id: 90, name: { ru: "Антрекот", kz: "Антрекот", en: "Entrecôte" }, price: 3990 },
            { id: 91, name: { ru: "Баранина", kz: "Қой еті", en: "Lamb" }, price: 3190 },
            { id: 92, name: { ru: "Люля-кебаб", kz: "Люля-кебаб", en: "Lula Kebab" }, price: 3190 },
            { id: 93, name: { ru: "Куриное филе", kz: "Тауық филесі", en: "Chicken Fillet" }, price: 2990 },
            { id: 94, name: { ru: "Куриные крылышки", kz: "Тауық қанаттары", en: "Chicken Wings" }, price: 2890 },
            { id: 95, name: { ru: "Утка", kz: "Үйрек еті", en: "Duck" }, price: 2790 },
            { id: 96, name: { ru: "Куриные окорочка", kz: "Тауық бауыры", en: "Chicken Thighs" }, price: 2590 },
            { id: 97, name: { ru: "Овощи гриль на шпажке", kz: "Шпажкадағы көкөніс гриль", en: "Grilled Vegetable Skewers" }, price: 1990 },
            { id: 98, name: { ru: "Шампиньоны на мангале", kz: "Мангалдағы шампиньондар", en: "Grilled Champignons" }, price: 1790 },
        ]
    },
    "Гарниры": {
        ru: "Гарниры", kz: "Гарнирлер", en: "Sides",
        items: [
            { id: 100, name: { ru: "Овощи гриль", kz: "Көкөніс гриль", en: "Grilled Vegetables" }, price: 1990 },
            { id: 101, name: { ru: "Брокколи", kz: "Брокколи", en: "Broccoli" }, price: 1790 },
            { id: 102, name: { ru: "Картофельные дольки", kz: "Картоп тілімдері", en: "Potato Wedges" }, price: 1390 },
            { id: 103, name: { ru: "Картофель фри", kz: "Картоп фри", en: "French Fries" }, price: 1190 },
            { id: 104, name: { ru: "Рис", kz: "Күріш", en: "Rice" }, price: 790 },
        ]
    },
    "Соусы": {
        ru: "Соусы", kz: "Соустар", en: "Sauces",
        items: [
            { id: 110, name: { ru: "Сырный", kz: "Ірімшік соусы", en: "Cheese Sauce" }, price: 590 },
            { id: 111, name: { ru: "Красный", kz: "Қызыл соус", en: "Red Sauce" }, price: 590 },
            { id: 112, name: { ru: "Белый", kz: "Ақ соус", en: "White Sauce" }, price: 590 },
            { id: 113, name: { ru: "Кетчуп", kz: "Кетчуп", en: "Ketchup" }, price: 590 },
            { id: 114, name: { ru: "Тартар", kz: "Тартар соусы", en: "Tartar Sauce" }, price: 590 },
        ]
    },
    "Десерты": {
        ru: "Десерты", kz: "Десерттер", en: "Desserts",
        items: [
            { id: 120, name: { ru: "Восточные сладости", kz: "Шығыс тәттілері", en: "Oriental Sweets" }, price: 5490 },
            { id: 121, name: { ru: "Пирожное в ассортименте", kz: "Торттар ассортименті", en: "Assorted Pastries" }, price: 2590 },
        ]
    },
};

const DRINKS_DATA = {
    "Безалкогольные напитки": {
        ru: "Безалкогольные напитки", kz: "Алкогольсіз сусындар", en: "Soft Drinks",
        items: [
            { id: 300, name: { ru: "Фирменные лимонады", kz: "Фирмалық лимонадтар", en: "Signature Lemonades" }, sub: { ru: "Вишня-Виноград, Киви-Грейпфрут, Жасмин, Маракуйя-Ананас, Нектар", kz: "Шие-Жүзім, Киви-Грейпфрут, Жасмин, Маракуйя-Ананас, Нектар", en: "Cherry-Grape, Kiwi-Grapefruit, Jasmine, Passion Fruit-Pineapple, Nectar" }, price: 2990 },
            { id: 301, name: { ru: "Авторский чай", kz: "Авторлық шай", en: "Signature Tea" }, sub: { ru: "Алматинский, Ташкентский, Малина-Лайм, Персик-жасмин", kz: "Алматы, Ташкент, Таңқурай-Лайм, Шабдалы-жасмин", en: "Almaty, Tashkent, Raspberry-Lime, Peach-Jasmine" }, price: 2590 },
            { id: 302, name: { ru: "Пепси", kz: "Пепси", en: "Pepsi" }, price: 1790 },
            { id: 303, name: { ru: "Листовой чай", kz: "Жапырақты шай", en: "Loose Leaf Tea" }, sub: { ru: "Ассам, Сенча, Жасмин, Эрл Грей, Ройбуш, Султан", kz: "Ассам, Сенча, Жасмин, Эрл Грей, Ройбуш, Сұлтан", en: "Assam, Sencha, Jasmine, Earl Grey, Rooibos, Sultan" }, price: 1590 },
        ]
    },
    "Вино": {
        ru: "Вино", kz: "Шарап", en: "Wine",
        items: [
            { id: 310, name: { ru: "Blanc de Blancs Tete de Cheval", kz: "Blanc de Blancs Tete de Cheval", en: "Blanc de Blancs Tete de Cheval" }, sub: { ru: "Игристое белое, бутылка", kz: "Ақ жарқыраған шарап, бөтелке", en: "Sparkling White, Bottle" }, price: 14990 },
        ]
    },
    "Водка": {
        ru: "Водка", kz: "Арақ", en: "Vodka",
        items: [
            { id: 320, name: { ru: "Koskenkorva", kz: "Koskenkorva", en: "Koskenkorva" }, sub: { ru: "50 г", kz: "50 г", en: "50 g" }, price: 2090 },
            { id: 321, name: { ru: "Mont Blanc", kz: "Mont Blanc", en: "Mont Blanc" }, sub: { ru: "50 г", kz: "50 г", en: "50 g" }, price: 2690 },
            { id: 322, name: { ru: "Архангельская Северная", kz: "Архангельская Северная", en: "Arkhangelskaya Severnaya" }, sub: { ru: "50 г", kz: "50 г", en: "50 g" }, price: 1790 },
            { id: 323, name: { ru: "Белуга Нобл", kz: "Белуга Нобл", en: "Beluga Noble" }, sub: { ru: "50 г", kz: "50 г", en: "50 g" }, price: 2690 },
        ]
    },
    "Пиво бутылочное": {
        ru: "Пиво бутылочное", kz: "Бөтелкедегі сыра", en: "Bottled Beer",
        items: [
            { id: 330, name: { ru: "Ayinger, Brauweisse", kz: "Ayinger, Brauweisse", en: "Ayinger, Brauweisse" }, sub: { ru: "Нефильтрованное", kz: "Сүзгіден өтпеген", en: "Unfiltered" }, price: 2990 },
            { id: 331, name: { ru: "Ayinger, Lager", kz: "Ayinger, Lager", en: "Ayinger, Lager" }, sub: { ru: "Фильтрованное", kz: "Сүзгіден өткен", en: "Filtered" }, price: 2990 },
            { id: 332, name: { ru: "Gubernija Brown Ale", kz: "Gubernija Brown Ale", en: "Gubernija Brown Ale" }, sub: { ru: "Тёмное", kz: "Қара", en: "Dark" }, price: 1990 },
            { id: 333, name: { ru: "Gubernija Ekstra Lager", kz: "Gubernija Ekstra Lager", en: "Gubernija Ekstra Lager" }, sub: { ru: "Фильтрованное", kz: "Сүзгіден өткен", en: "Filtered" }, price: 1990 },
        ]
    },
    "Пиво разливное": {
        ru: "Пиво разливное", kz: "Құйма сыра", en: "Draft Beer",
        items: [
            { id: 340, name: { ru: "Holsten Pilsener", kz: "Holsten Pilsener", en: "Holsten Pilsener" }, sub: { ru: "Светлое фильтрованное", kz: "Ақ сүзгіден өткен", en: "Light Filtered" }, price: 1890 },
            { id: 341, name: { ru: "Kronenbourg Blanc", kz: "Kronenbourg Blanc", en: "Kronenbourg Blanc" }, sub: { ru: "Нефильтрованное", kz: "Сүзгіден өтпеген", en: "Unfiltered" }, price: 2290 },
        ]
    },
};

const SECTIONS = {
    food: Object.keys(MENU_DATA),
    soft: ["Безалкогольные напитки"],
    bar: ["Вино", "Водка", "Пиво бутылочное", "Пиво разливное"]
};

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
        ru: "Уголок потребителя: ИП NECTAR, Алматы<br>Вся продукция сертифицирована.",
        kz: "Тұтынушы бұрышы: ЖК NECTAR, Алматы<br>Барлық өнімдер сертификатталған.",
        en: "Consumer corner: IE NECTAR, Almaty<br>All products are certified."
    }
};

let currentLang = 'ru';
let currentTab = 'food';
const appContent = document.getElementById('app-content');
const searchInput = document.getElementById('searchInput');

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
                    <p style="margin-top: 15px;"><a href="#" target="_blank">📍 Мы в 2GIS</a></p>
                </div>`;
    } else {
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

function updateStaticTexts() {
    document.querySelector('[data-i18n="allergy"]').innerText = I18N.allergy[currentLang];
    document.querySelector('[data-i18n="currency"]').innerText = I18N.currency[currentLang];
    searchInput.placeholder = currentLang === 'ru' ? "Поиск по меню..." : currentLang === 'kz' ? "Мәзір бойынша іздеу..." : "Search menu...";
}

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentLang = e.target.dataset.lang;
        renderMenu(searchInput.value);
    });
});

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentTab = e.target.dataset.target;
        searchInput.value = ""; 
        searchInput.parentElement.style.display = (currentTab === 'info' || currentTab === 'contacts') ? 'none' : 'block';
        renderMenu();
    });
});

searchInput.addEventListener('input', (e) => {
    renderMenu(e.target.value);
});

// Логика темной темы
function applyThemeBasedOnTime() {
    const hour = new Date().getHours();
    // Темная тема с 19:00 до 07:00
    if (hour >= 19 || hour < 7) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Запуск при загрузке
applyThemeBasedOnTime();
renderMenu();
setInterval(applyThemeBasedOnTime, 60000);
