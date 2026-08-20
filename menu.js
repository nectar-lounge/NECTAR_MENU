// ============================================================
//  MENU DATA — NECTAR
//  Полная мультиязычная версия (RU / KZ / EN)
//  Основано на файле «Меню Нектар_1.docx»
// ============================================================

const MENU_DATA = {

    "Холодные закуски": {
        ru: "Холодные закуски",
        kz: "Суық тағамдар",
        en: "Cold Appetizers",
        items: [
            { id: 1, name: { ru: "Мясное плато (казы, жая, жал)", kz: "Ет табағы (қазы, жая, жал)", en: "Meat Platter (Kazy, Zhaya, Zhal)" }, price: 4990, output: "", composition: "" },
            { id: 2, name: { ru: "Домашние соленья", kz: "Үйде тұздалған көкөністер", en: "Homemade Pickles" }, price: 2890, output: "", composition: "" },
            { id: 3, name: { ru: "Овощная нарезка", kz: "Көкөніс табағы", en: "Fresh Vegetable Platter" }, price: 2890, output: "", composition: "" },
            { id: 4, name: { ru: "Рыбное ассорти", kz: "Балық ассортиі", en: "Fish Assortment" }, price: 5590, output: "", composition: "" },
            { id: 5, name: { ru: "Капрезе", kz: "Капрезе", en: "Caprese" }, price: 2790, output: "", composition: "" },
            { id: 6, name: { ru: "Сырное плато", kz: "Ірімшік табағы", en: "Cheese Platter" }, price: 4990, output: "", composition: "" },
        ]
    },

    "Салаты": {
        ru: "Салаты",
        kz: "Салаттар",
        en: "Salads",
        items: [
            { id: 10, name: { ru: "Свежий овощной салат", kz: "Жаңа піскен көкөніс салаты", en: "Fresh Vegetable Salad" }, price: 1990, output: "", composition: "" },
            { id: 11, name: { ru: "Аччик-чучук", kz: "Аччик-чучук", en: "Achchik-Chuchuk (Spicy Tomato Salad)" }, price: 1790, output: "", composition: "" },
            { id: 12, name: { ru: "Цезарь с курицей", kz: "Тауық етімен Цезарь", en: "Caesar with Chicken" }, price: 2590, output: "", composition: "" },
            { id: 13, name: { ru: "Хрустящие баклажаны", kz: "Қытырлақ баклажан", en: "Crispy Eggplant Salad" }, price: 2790, output: "", composition: "" },
            { id: 14, name: { ru: "Греческий салат", kz: "Грек салаты", en: "Greek Salad" }, price: 2490, output: "", composition: "" },
            { id: 15, name: { ru: "Теплый салат с кониной", kz: "Жылы жылқы еті салаты", en: "Warm Horse Meat Salad" }, price: 2990, output: "", composition: "" },
            { id: 16, name: { ru: "Салат с креветками и рукколой", kz: "Асшаян және руккола салаты", en: "Shrimp & Rocket Salad" }, price: 3990, output: "", composition: "" },
        ]
    },

    "Горячие закуски": {
        ru: "Горячие закуски",
        kz: "Ыстық тағамдар",
        en: "Hot Appetizers",
        items: [
            { id: 20, name: { ru: "Креветки темпура", kz: "Темпура асшаяндары", en: "Tempura Shrimp" }, price: 3290, output: "", composition: "" },
            { id: 21, name: { ru: "Клаб-сэндвич с курицей", kz: "Тауық етімен клаб-сэндвич", en: "Chicken Club Sandwich" }, price: 3190, output: "", composition: "" },
            { id: 22, name: { ru: "Кесадилья с курицей", kz: "Тауық етімен кесадилья", en: "Chicken Quesadilla" }, price: 2990, output: "", composition: "" },
            { id: 23, name: { ru: "Чебуреки", kz: "Шебуректер", en: "Chebureki (Fried Meat Pastries)" }, price: 2590, output: "", composition: "" },
            { id: 24, name: { ru: "Наггетсы куриные", kz: "Тауық наггетстері", en: "Chicken Nuggets" }, price: 1690, output: "", composition: "" },
        ]
    },

    "Снэки": {
        ru: "Снэки",
        kz: "Снэкілер",
        en: "Snacks",
        items: [
            { id: 30, name: { ru: "Большой сет закусок (креветки, гренки, чечил, фри, сосиски, луковые кольца)", kz: "Үлкен тағамдар жиынтығы (асшаяндар, гренкілер, чечил, фри, шұжықтар, пияз сақиналары)", en: "Large Snack Platter (Shrimp, Croutons, Chechil, Fries, Sausages, Onion Rings)" }, price: 6990, output: "", composition: "" },
            { id: 31, name: { ru: "Креветки пивные", kz: "Сыраға арналған асшаяндар", en: "Beer Shrimp" }, price: 3990, output: "", composition: "" },
            { id: 32, name: { ru: "Фисташки", kz: "Писте", en: "Pistachios" }, price: 1590, output: "", composition: "" },
            { id: 33, name: { ru: "Чесночные гренки", kz: "Сарымсақты гренкілер", en: "Garlic Croutons" }, price: 1590, output: "", composition: "" },
            { id: 34, name: { ru: "Чечил копченый", kz: "Ысталған чечил", en: "Smoked Chechil Cheese" }, price: 1390, output: "", composition: "" },
            { id: 35, name: { ru: "Арахис", kz: "Жер жаңғақ", en: "Peanuts" }, price: 1390, output: "", composition: "" },
        ]
    },

    "Супы": {
        ru: "Супы",
        kz: "Сорпалар",
        en: "Soups",
        items: [
            { id: 40, name: { ru: "Окрошка с мясом (сезонная)", kz: "Ет қосылған окрошка (маусымдық)", en: "Okroshka with Meat (Seasonal)" }, price: 2390, output: "", composition: "" },
            { id: 41, name: { ru: "Куриный суп с лапшой", kz: "Тауық еті қосылған кеспе сорпа", en: "Chicken Noodle Soup" }, price: 1590, output: "", composition: "" },
            { id: 42, name: { ru: "Солянка мясная", kz: "Ет солянкасы", en: "Meat Solyanka" }, price: 3590, output: "", composition: "" },
            { id: 43, name: { ru: "Том Ям", kz: "Том Ям", en: "Tom Yum" }, price: 3590, output: "", composition: "" },
            { id: 44, name: { ru: "Рамен с говядиной", kz: "Сиыр етімен рамен", en: "Beef Ramen" }, price: 3590, output: "", composition: "" },
            { id: 45, name: { ru: "Рамен с курицей", kz: "Тауық етімен рамен", en: "Chicken Ramen" }, price: 3290, output: "", composition: "" },
            { id: 46, name: { ru: "Чечевичный крем-суп", kz: "Жасымық крем-сорпасы", en: "Creamy Lentil Soup" }, price: 1990, output: "", composition: "" },
            { id: 47, name: { ru: "Шорпа", kz: "Шорпа", en: "Shorpa (Traditional Meat Broth)" }, price: 3290, output: "", composition: "" },
            { id: 48, name: { ru: "Пельмени (с бульоном / без)", kz: "Пельмендер (сорпамен / сорпасыз)", en: "Pelmeni (with / without Broth)" }, price: 1990, output: "", composition: "" },
        ]
    },

    "Пицца и выпечка": {
        ru: "Пицца и выпечка",
        kz: "Пицца және нан-тоқаш",
        en: "Pizza & Bakery",
        items: [
            { id: 50, name: { ru: "Пицца Пепперони", kz: "Пепперони пиццасы", en: "Pepperoni Pizza" }, price: 3090, output: "", composition: "" },
            { id: 51, name: { ru: "Пицца Маргарита", kz: "Маргарита пиццасы", en: "Margherita Pizza" }, price: 2590, output: "", composition: "" },
            { id: 52, name: { ru: "Пицца с курицей и грибами", kz: "Тауық еті және саңырауқұлақ қосылған пицца", en: "Chicken & Mushroom Pizza" }, price: 3090, output: "", composition: "" },
            { id: 53, name: { ru: "Пицца Болоньезе", kz: "Болоньезе пиццасы", en: "Bolognese Pizza" }, price: 2990, output: "", composition: "" },
            { id: 54, name: { ru: "Мексиканская пицца с халапеньо", kz: "Халапеньо қосылған мексикалық пицца", en: "Mexican Pizza with Jalapeño" }, price: 3590, output: "", composition: "" },
            { id: 55, name: { ru: "Хачапури по-мегрельски", kz: "Мегрельше хачапури", en: "Megrelian Khachapuri" }, price: 2790, output: "", composition: "" },
            { id: 56, name: { ru: "Хлебная корзина", kz: "Нан себеті", en: "Bread Basket" }, price: 890, output: "", composition: "" },
            { id: 57, name: { ru: "Лепешка", kz: "Жайма нан", en: "Flatbread" }, price: 590, output: "", composition: "" },
        ]
    },

    "Паста": {
        ru: "Паста",
        kz: "Паста",
        en: "Pasta",
        items: [
            { id: 60, name: { ru: "Фарфалле с морепродуктами (креветки, мидии, кальмары)", kz: "Теңіз өнімдерімен фарфалле (асшаяндар, мидиялар, кальмарлар)", en: "Farfalle with Seafood (Shrimp, Mussels, Squid)" }, price: 4990, output: "", composition: "" },
            { id: 61, name: { ru: "Карбонара", kz: "Карбонара", en: "Carbonara" }, price: 3590, output: "", composition: "" },
            { id: 62, name: { ru: "Болоньезе", kz: "Болоньезе", en: "Bolognese" }, price: 3290, output: "", composition: "" },
            { id: 63, name: { ru: "Фетучини с курицей и грибами", kz: "Тауық еті және саңырауқұлақ қосылған фетучини", en: "Fettuccine with Chicken & Mushrooms" }, price: 2990, output: "", composition: "" },
        ]
    },

    "Горячие блюда": {
        ru: "Горячие блюда",
        kz: "Ыстық тағамдар",
        en: "Main Courses",
        items: [
            { id: 70, name: { ru: "Куырдак", kz: "Қуырдақ", en: "Kuyrdak (Traditional Meat Stew)" }, price: 4090, output: "", composition: "" },
            { id: 71, name: { ru: "Плов", kz: "Палау", en: "Plov (Uzbek-style Pilaf)" }, price: 3090, output: "", composition: "" },
            { id: 72, name: { ru: "Бургер с курицей", kz: "Тауық етімен бургер", en: "Chicken Burger" }, price: 3290, output: "", composition: "" },
            { id: 73, name: { ru: "Бургер с говядиной", kz: "Сиыр етімен бургер", en: "Beef Burger" }, price: 3590, output: "", composition: "" },
            { id: 74, name: { ru: "Бургер, грибной стаут", kz: "Саңырауқұлақ стаутымен бургер", en: "Mushroom Stout Burger" }, price: 4390, output: "", composition: "" },
            { id: 75, name: { ru: "Колбаски говяжьи / бараньи", kz: "Сиыр / қой шұжықтары", en: "Beef / Lamb Sausages" }, price: 3390, output: "", composition: "" },
            { id: 76, name: { ru: "Колбаски куриные", kz: "Тауық шұжықтары", en: "Chicken Sausages" }, price: 2990, output: "", composition: "" },
            { id: 77, name: { ru: "Говядина по-тайски с рисом", kz: "Тайша сиыр еті (күрішпен)", en: "Thai-style Beef with Rice" }, price: 3290, output: "", composition: "" },
            { id: 78, name: { ru: "Бефстроганов с пюре", kz: "Бефстроганов (пюремен)", en: "Beef Stroganoff with Mashed Potatoes" }, price: 3290, output: "", composition: "" },
            { id: 79, name: { ru: "Куриная грудка в сырно-сливочном соусе", kz: "Ірімшік-қаймақ соусындағы тауық төс еті", en: "Chicken Breast in Creamy Cheese Sauce" }, price: 3290, output: "", composition: "" },
            { id: 80, name: { ru: "Картофель по-домашнему с мясом", kz: "Үйдегідей картоп (етпен)", en: "Homestyle Potatoes with Meat" }, price: 3990, output: "", composition: "" },
        ]
    },

    "Шашлык на мангале": {
        ru: "Шашлык на мангале",
        kz: "Мангалдағы шашлык",
        en: "BBQ & Grill",
        items: [
            { id: 90, name: { ru: "Антрекот", kz: "Антрекот", en: "Entrecôte" }, price: 3990, output: "", composition: "" },
            { id: 91, name: { ru: "Баранина", kz: "Қой еті", en: "Lamb" }, price: 3190, output: "", composition: "" },
            { id: 92, name: { ru: "Люля-кебаб", kz: "Люля-кебаб", en: "Lula Kebab" }, price: 3190, output: "", composition: "" },
            { id: 93, name: { ru: "Куриное филе", kz: "Тауық филесі", en: "Chicken Fillet" }, price: 2990, output: "", composition: "" },
            { id: 94, name: { ru: "Куриные крылышки", kz: "Тауық қанаттары", en: "Chicken Wings" }, price: 2890, output: "", composition: "" },
            { id: 95, name: { ru: "Утка", kz: "Үйрек еті", en: "Duck" }, price: 2790, output: "", composition: "" },
            { id: 96, name: { ru: "Куриные окорочка", kz: "Тауық бауыры", en: "Chicken Thighs" }, price: 2590, output: "", composition: "" },
            { id: 97, name: { ru: "Овощи гриль на шпажке", kz: "Шпажкадағы көкөніс гриль", en: "Grilled Vegetable Skewers" }, price: 1990, output: "", composition: "" },
            { id: 98, name: { ru: "Шампиньоны на мангале", kz: "Мангалдағы шампиньондар", en: "Grilled Champignons" }, price: 1790, output: "", composition: "" },
        ]
    },

    "Гарниры": {
        ru: "Гарниры",
        kz: "Гарнирлер",
        en: "Sides",
        items: [
            { id: 100, name: { ru: "Овощи гриль", kz: "Көкөніс гриль", en: "Grilled Vegetables" }, price: 1990, output: "", composition: "" },
            { id: 101, name: { ru: "Брокколи", kz: "Брокколи", en: "Broccoli" }, price: 1790, output: "", composition: "" },
            { id: 102, name: { ru: "Картофельные дольки", kz: "Картоп тілімдері", en: "Potato Wedges" }, price: 1390, output: "", composition: "" },
            { id: 103, name: { ru: "Картофель фри", kz: "Картоп фри", en: "French Fries" }, price: 1190, output: "", composition: "" },
            { id: 104, name: { ru: "Рис", kz: "Күріш", en: "Rice" }, price: 790, output: "", composition: "" },
        ]
    },

    "Соусы": {
        ru: "Соусы",
        kz: "Соустар",
        en: "Sauces",
        items: [
            { id: 110, name: { ru: "Сырный", kz: "Ірімшік соусы", en: "Cheese Sauce" }, price: 590, output: "", composition: "" },
            { id: 111, name: { ru: "Красный", kz: "Қызыл соус", en: "Red Sauce" }, price: 590, output: "", composition: "" },
            { id: 112, name: { ru: "Белый", kz: "Ақ соус", en: "White Sauce" }, price: 590, output: "", composition: "" },
            { id: 113, name: { ru: "Кетчуп", kz: "Кетчуп", en: "Ketchup" }, price: 590, output: "", composition: "" },
            { id: 114, name: { ru: "Тартар", kz: "Тартар соусы", en: "Tartar Sauce" }, price: 590, output: "", composition: "" },
        ]
    },

    "Десерты": {
        ru: "Десерты",
        kz: "Десерттер",
        en: "Desserts",
        items: [
            { id: 120, name: { ru: "Восточные сладости", kz: "Шығыс тәттілері", en: "Oriental Sweets" }, price: 5490, output: "", composition: "" },
            { id: 121, name: { ru: "Пирожное в ассортименте", kz: "Торттар ассортименті", en: "Assorted Pastries" }, price: 2590, output: "", composition: "" },
        ]
    },

};

// ============================================================
//  DRINKS DATA (мультиязычный)
// ============================================================

const DRINKS_DATA = {

    "Безалкогольные напитки": {
        ru: "Безалкогольные напитки",
        kz: "Алкогольсіз сусындар",
        en: "Soft Drinks",
        items: [
            { id: 300, name: { ru: "Фирменные лимонады", kz: "Фирмалық лимонадтар", en: "Signature Lemonades" }, sub: { ru: "Вишня-Виноград, Киви-Грейпфрут, Жасмин, Маракуйя-Ананас, Нектар", kz: "Шие-Жүзім, Киви-Грейпфрут, Жасмин, Маракуйя-Ананас, Нектар", en: "Cherry-Grape, Kiwi-Grapefruit, Jasmine, Passion Fruit-Pineapple, Nectar" }, price: 2990 },
            { id: 301, name: { ru: "Авторский чай", kz: "Авторлық шай", en: "Signature Tea" }, sub: { ru: "Алматинский, Ташкентский, Малина-Лайм, Персик-жасмин", kz: "Алматы, Ташкент, Таңқурай-Лайм, Шабдалы-жасмин", en: "Almaty, Tashkent, Raspberry-Lime, Peach-Jasmine" }, price: 2590 },
            { id: 302, name: { ru: "Пепси", kz: "Пепси", en: "Pepsi" }, sub: { ru: "", kz: "", en: "" }, price: 1790 },
            { id: 303, name: { ru: "Листовой чай", kz: "Жапырақты шай", en: "Loose Leaf Tea" }, sub: { ru: "Ассам, Сенча, Жасмин, Эрл Грей, Ройбуш, Султан", kz: "Ассам, Сенча, Жасмин, Эрл Грей, Ройбуш, Сұлтан", en: "Assam, Sencha, Jasmine, Earl Grey, Rooibos, Sultan" }, price: 1590 },
        ]
    },

    "Вино": {
        ru: "Вино",
        kz: "Шарап",
        en: "Wine",
        items: [
            { id: 310, name: { ru: "Blanc de Blancs Tete de Cheval", kz: "Blanc de Blancs Tete de Cheval", en: "Blanc de Blancs Tete de Cheval" }, sub: { ru: "Игристое белое, бутылка", kz: "Ақ жарқыраған шарап, бөтелке", en: "Sparkling White, Bottle" }, price: 14990 },
        ]
    },

    "Водка": {
        ru: "Водка",
        kz: "Арақ",
        en: "Vodka",
        items: [
            { id: 320, name: { ru: "Koskenkorva", kz: "Koskenkorva", en: "Koskenkorva" }, sub: { ru: "50 г", kz: "50 г", en: "50 g" }, price: 2090 },
            { id: 321, name: { ru: "Mont Blanc", kz: "Mont Blanc", en: "Mont Blanc" }, sub: { ru: "50 г", kz: "50 г", en: "50 g" }, price: 2690 },
            { id: 322, name: { ru: "Архангельская Северная", kz: "Архангельская Северная", en: "Arkhangelskaya Severnaya" }, sub: { ru: "50 г", kz: "50 г", en: "50 g" }, price: 1790 },
            { id: 323, name: { ru: "Белуга Нобл", kz: "Белуга Нобл", en: "Beluga Noble" }, sub: { ru: "50 г", kz: "50 г", en: "50 g" }, price: 2690 },
        ]
    },

    "Пиво бутылочное": {
        ru: "Пиво бутылочное",
        kz: "Бөтелкедегі сыра",
        en: "Bottled Beer",
        items: [
            { id: 330, name: { ru: "Ayinger, Brauweisse", kz: "Ayinger, Brauweisse", en: "Ayinger, Brauweisse" }, sub: { ru: "Нефильтрованное", kz: "Сүзгіден өтпеген", en: "Unfiltered" }, price: 2990 },
            { id: 331, name: { ru: "Ayinger, Lager", kz: "Ayinger, Lager", en: "Ayinger, Lager" }, sub: { ru: "Фильтрованное", kz: "Сүзгіден өткен", en: "Filtered" }, price: 2990 },
            { id: 332, name: { ru: "Gubernija Brown Ale", kz: "Gubernija Brown Ale", en: "Gubernija Brown Ale" }, sub: { ru: "Тёмное", kz: "Қара", en: "Dark" }, price: 1990 },
            { id: 333, name: { ru: "Gubernija Ekstra Lager", kz: "Gubernija Ekstra Lager", en: "Gubernija Ekstra Lager" }, sub: { ru: "Фильтрованное", kz: "Сүзгіден өткен", en: "Filtered" }, price: 1990 },
        ]
    },

    "Пиво разливное": {
        ru: "Пиво разливное",
        kz: "Құйма сыра",
        en: "Draft Beer",
        items: [
            { id: 340, name: { ru: "Holsten Pilsener", kz: "Holsten Pilsener", en: "Holsten Pilsener" }, sub: { ru: "Светлое фильтрованное", kz: "Ақ сүзгіден өткен", en: "Light Filtered" }, price: 1890 },
            { id: 341, name: { ru: "Kronenbourg Blanc", kz: "Kronenbourg Blanc", en: "Kronenbourg Blanc" }, sub: { ru: "Нефильтрованное", kz: "Сүзгіден өтпеген", en: "Unfiltered" }, price: 2290 },
        ]
    },

}
