// ============================================
// NECTAR MENU DATA
// ============================================

const MENU = [

    // =========================================
    // КУХНЯ
    // =========================================

    // Холодные закуски

    {
        id: "1-1",
        type: "kitchen",
        category_id: "cold-appetizers",
        category_ru: "Холодные закуски",
        category_kz: "Салқын тіскебасарлар",
        category_en: "Cold Appetizers",

        name_ru: "Мясное плато (казы, жая, жал)",
        name_kz: "Ет ассортиі (қазы, жая, жал)",
        name_en: "Meat platter (kazy, zhaya, zhal)",

        price: 4990,
        weight: "250g",

        composition_ru: "Традиционные мясные деликатесы",
        composition_kz: "Дәстүрлі ет деликатестері",
        composition_en: "Traditional meat delicacies",

        note: "",
        image: ""
    },

    {
        id: "1-2",
        type: "kitchen",
        category_id: "cold-appetizers",
        category_ru: "Холодные закуски",
        category_kz: "Салқын тіскебасарлар",
        category_en: "Cold Appetizers",

        name_ru: "Домашние соленья",
        name_kz: "Үй тұздықтары",
        name_en: "Homemade pickles",

        price: 2890,
        weight: "300g",

        composition_ru: "Ассорти из домашних солений",
        composition_kz: "Үй тұздықтарының ассортиі",
        composition_en: "Assorted homemade pickles",

        note: "",
        image: ""
    },

    {
        id: "1-3",
        type: "kitchen",
        category_id: "cold-appetizers",
        category_ru: "Холодные закуски",
        category_kz: "Салқын тіскебасарлар",
        category_en: "Cold Appetizers",

        name_ru: "Овощная нарезка",
        name_kz: "Көкөніс тілімі",
        name_en: "Vegetable platter",

        price: 2890,
        weight: "350g",

        composition_ru: "Свежие сезонные овощи",
        composition_kz: "Балғын маусымдық көкөністер",
        composition_en: "Fresh seasonal vegetables",

        note: "",
        image: ""
    },

    {
        id: "1-4",
        type: "kitchen",
        category_id: "cold-appetizers",
        category_ru: "Холодные закуски",
        category_kz: "Салқын тіскебасарлар",
        category_en: "Cold Appetizers",

        name_ru: "Рыбное ассорти",
        name_kz: "Балық ассортиі",
        name_en: "Fish platter",

        price: 5590,
        weight: "250g",

        composition_ru: "Ассорти из благородных видов рыб",
        composition_kz: "Асыл балық түрлерінің ассортиі",
        composition_en: "Assorted noble fish species",

        note: "",
        image: ""
    },

    {
        id: "1-5",
        type: "kitchen",
        category_id: "cold-appetizers",
        category_ru: "Холодные закуски",
        category_kz: "Салқын тіскебасарлар",
        category_en: "Cold Appetizers",

        name_ru: "Капрезе",
        name_kz: "Капрезе",
        name_en: "Caprese",

        price: 2790,
        weight: "220g",

        composition_ru: "Моцарелла, томаты, соус песто",
        composition_kz: "Моцарелла, қызанақ, песто соусы",
        composition_en: "Mozzarella, tomatoes, pesto sauce",

        note: "",
        image: ""
    },

    {
        id: "1-6",
        type: "kitchen",
        category_id: "cold-appetizers",
        category_ru: "Холодные закуски",
        category_kz: "Салқын тіскебасарлар",
        category_en: "Cold Appetizers",

        name_ru: "Сырное плато",
        name_kz: "Ірімшік ассортиі",
        name_en: "Cheese platter",

        price: 4990,
        weight: "250g",

        composition_ru: "Ассорти из изысканных сортов сыра",
        composition_kz: "Тіскебасар ірімшіктер ассортиі",
        composition_en: "Assorted exquisite cheeses",

        note: "",
        image: ""
    },


    // =========================================
    // САЛАТЫ
    // =========================================

    {
        id: "2-1",
        type: "kitchen",
        category_id: "salads",
        category_ru: "Салаты",
        category_kz: "Салаттар",
        category_en: "Salads",

        name_ru: "Свежий овощной салат",
        name_kz: "Балғын көкөніс салаты",
        name_en: "Fresh vegetable salad",

        price: 1990,
        weight: "250g",

        composition_ru: "Сезонные овощи с зеленью",
        composition_kz: "Маусымдық көкөністер мен көкшөп",
        composition_en: "Seasonal vegetables with herbs",

        note: "",
        image: ""
    },

    {
        id: "2-2",
        type: "kitchen",
        category_id: "salads",
        category_ru: "Салаты",
        category_kz: "Салаттар",
        category_en: "Salads",

        name_ru: "Аччик-чучук",
        name_kz: "Аччик-чучук",
        name_en: "Achichuk",

        price: 1790,
        weight: "200g",

        composition_ru: "Традиционный салат из томатов и лука",
        composition_kz: "Қызанақ пен пияздан жасалған дәстүрлі салат",
        composition_en: "Traditional tomato and onion salad",

        note: "",
        image: ""
    },

    {
        id: "2-3",
        type: "kitchen",
        category_id: "salads",
        category_ru: "Салаты",
        category_kz: "Салаттар",
        category_en: "Salads",

        name_ru: "Цезарь с курицей",
        name_kz: "Тауық еті қосылған Цезарь",
        name_en: "Chicken Caesar",

        price: 2590,
        weight: "280g",

        composition_ru: "Айсберг, куриное филе, соус цезарь, пармезан, гренки",
        composition_kz: "Айсберг, тауық филесі, цезарь соусы, пармезан, кептірілген нан",
        composition_en: "Iceberg, chicken fillet, Caesar sauce, parmesan, croutons",

        note: "",
        image: ""
    },

    {
        id: "2-4",
        type: "kitchen",
        category_id: "salads",
        category_ru: "Салаты",
        category_kz: "Салаттар",
        category_en: "Salads",

        name_ru: "Хрустящие баклажаны",
        name_kz: "Қытырлақ баклажандар",
        name_en: "Crispy Eggplant",

        price: 2790,
        weight: "250g",

        composition_ru: "Баклажаны, томаты, соус сладкий чили",
        composition_kz: "Баклажандар, қызанақтар, тәтті чили соусы",
        composition_en: "Eggplant, tomatoes, sweet chili sauce",

        note: "",
        image: ""
    },

    {
        id: "2-5",
        type: "kitchen",
        category_id: "salads",
        category_ru: "Салаты",
        category_kz: "Салаттар",
        category_en: "Salads",

        name_ru: "Греческий салат",
        name_kz: "Грек салаты",
        name_en: "Greek Salad",

        price: 2490,
        weight: "280g",

        composition_ru: "Овощи, фета, маслины, оливковое масло",
        composition_kz: "Көкөністер, фета, зәйтүн, зәйтүн майы",
        composition_en: "Vegetables, feta, olives, olive oil",

        note: "",
        image: ""
    },

    {
        id: "2-6",
        type: "kitchen",
        category_id: "salads",
        category_ru: "Салаты",
        category_kz: "Салаттар",
        category_en: "Salads",

        name_ru: "Теплый салат с кониной",
        name_kz: "Жылқы етінен жасалған жылы салат",
        name_en: "Warm horse meat salad",

        price: 2990,
        weight: "260g",

        composition_ru: "Конина, микс салата, фирменная заправка",
        composition_kz: "Жылқы еті, салат миксі, фирмалық тұздық",
        composition_en: "Horse meat, salad mix, signature dressing",

        note: "",
        image: ""
    },

    {
        id: "2-7",
        type: "kitchen",
        category_id: "salads",
        category_ru: "Салаты",
        category_kz: "Салаттар",
        category_en: "Salads",

        name_ru: "Салат с креветками и рукколой",
        name_kz: "Креветкалар мен руккола қосылған салат",
        name_en: "Shrimp and arugula salad",

        price: 3990,
        weight: "220g",

        composition_ru: "Креветки, руккола, черри, кедровые орехи, пармезан",
        composition_kz: "Креветкалар, руккола, черри, балқарағай жаңғақтары, пармезан",
        composition_en: "Shrimp, arugula, cherry tomatoes, pine nuts, parmesan",

        note: "",
        image: ""
    },


    // =========================================
    // ГОРЯЧИЕ ЗАКУСКИ
    // =========================================

    {
        id: "3-1",
        type: "kitchen",
        category_id: "hot-appetizers",
        category_ru: "Горячие закуски",
        category_kz: "Ыстық тіскебасарлар",
        category_en: "Hot Appetizers",

        name_ru: "Креветки темпура",
        name_kz: "Темпура креветкалары",
        name_en: "Shrimp Tempura",

        price: 3290,
        weight: "180g",

        composition_ru: "Тигровые креветки в хрустящем кляре",
        composition_kz: "Қытырлақ клярдағы тигр креветкалары",
        composition_en: "Tiger shrimp in crispy batter",

        note: "",
        image: ""
    },

    {
        id: "3-2",
        type: "kitchen",
        category_id: "hot-appetizers",
        category_ru: "Горячие закуски",
        category_kz: "Ыстық тіскебасарлар",
        category_en: "Hot Appetizers",

        name_ru: "Клаб-сэндвич с курицей (подается с картофелем фри)",
        name_kz: "Тауық еті қосылған клаб-сэндвич (фри картобымен)",
        name_en: "Chicken Club Sandwich (served with fries)",

        price: 3190,
        weight: "350g",

        composition_ru: "Курица, бекон, яйцо, салат, картофель фри",
        composition_kz: "Тауық еті, бекон, жұмыртқа, салат, фри картобы",
        composition_en: "Chicken, bacon, egg, salad, fries",

        note: "",
        image: ""
    },


    // =========================================
    // СУПЫ
    // =========================================

    {
        id: "5-4",
        type: "kitchen",
        category_id: "soups",
        category_ru: "Супы",
        category_kz: "Сорпалар",
        category_en: "Soups",

        name_ru: "Том Ям",
        name_kz: "Том Ям",
        name_en: "Tom Yum",

        price: 3590,
        weight: "350ml",

        composition_ru: "Креветки, кальмары, грибы, кокосовое молоко, рис",
        composition_kz: "Креветкалар, кальмарлар, саңырауқұлақтар, кокос сүті, күріш",
        composition_en: "Shrimp, squid, mushrooms, coconut milk, rice",

        note: "Острое блюдо",
        image: ""
    },


    // =========================================
    // ГОРЯЧИЕ БЛЮДА
    // =========================================

    {
        id: "8-2",
        type: "kitchen",
        category_id: "main-courses",
        category_ru: "Горячие блюда",
        category_kz: "Ыстық тағамдар",
        category_en: "Main Courses",

        name_ru: "Плов",
        name_kz: "Палау",
        name_en: "Plov",

        price: 3090,
        weight: "350g",

        composition_ru: "Традиционный плов с говядиной",
        composition_kz: "Сиыр етінен жасалған дәстүрлі палау",
        composition_en: "Traditional beef plov",

        note: "",
        image: ""
    },


    // =========================================
    // БАР — БЕЗАЛКОГОЛЬНЫЕ НАПИТКИ
    // =========================================

    {
        id: "13-1",
        type: "bar",
        category_id: "lemonades",

        category_ru: "Лимонады",
        category_kz: "Лимонадтар",
        category_en: "Lemonades",

        name_ru: "Фирменные лимонады",
        name_kz: "Фирменді лимонадтар",
        name_en: "Signature lemonades",

        price: 2990,
        weight: "1L",

        composition_ru: "Вишня-Виноград / Киви-Грейпфрут / Маракуйя-Ананас / Нектар",
        composition_kz: "Шие-Жүзім / Киви-Грейпфрут / Маракуйя-Ананас / Нектар",
        composition_en: "Cherry-Grape / Kiwi-Grapefruit / Passion fruit-Pineapple / Nectar",

        note: "",
        image: ""
    },


    // =========================================
    // ЧАЙ
    //
    // ВАЖНО:
    // Ниже примерные позиции.
    // Замени названия/цены на реальные,
    // когда определишь чайную карту.
    // =========================================

    {
        id: "14-1",
        type: "bar",
        category_id: "tea",

        category_ru: "Чай",
        category_kz: "Шай",
        category_en: "Tea",

        name_ru: "Ассам",
        name_kz: "Ассам",
        name_en: "Assam",

        price: 1490,
        weight: "700ml",

        composition_ru: "Черный чай",
        composition_kz: "Қара шай",
        composition_en: "Black tea",

        note: "",
        image: ""
    },

    {
        id: "14-2",
        type: "bar",
        category_id: "tea",

        category_ru: "Чай",
        category_kz: "Шай",
        category_en: "Tea",

        name_ru: "Эрл Грей",
        name_kz: "Эрл Грей",
        name_en: "Earl Grey",

        price: 1490,
        weight: "700ml",

        composition_ru: "Черный чай с бергамотом",
        composition_kz: "Бергамот қосылған қара шай",
        composition_en: "Black tea with bergamot",

        note: "",
        image: ""
    },

    {
        id: "14-3",
        type: "bar",
        category_id: "tea",

        category_ru: "Чай",
        category_kz: "Шай",
        category_en: "Tea",

        name_ru: "Травяной чай",
        name_kz: "Шөп шайы",
        name_en: "Herbal tea",

        price: 1690,
        weight: "700ml",

        composition_ru: "Ароматный травяной чай",
        composition_kz: "Хош иісті шөп шайы",
        composition_en: "Aromatic herbal tea",

        note: "",
        image: ""
    }

];


// ============================================
// TRANSLATIONS
// ============================================

const TRANSLATIONS = {

    RU: {
        header_subtitle: "Lounge · Bar · Kitchen",

        hero_title: "Меню",
        hero_subtitle: "LOUNGE · KITCHEN · BAR",
        hero_description: "Кухня, мангал и напитки",

        search_placeholder: "Поиск блюд, напитков...",

        nav_kitchen: "КУХНЯ",
        nav_bar: "БАР",

        modal_ingredients: "Ингредиенты",
        modal_close: "ЗАКРЫТЬ",

        tab_menu: "Меню",
        tab_info: "Инфо",

        info_title: "Информация",
        info_subtitle: "Свяжитесь с нами или найдите важные детали",

        info_address_label: "Адрес",
        info_address: "Проспект Дулати 1а, мкр. Архат, Алматы",
        info_open_map: "Открыть в 2GIS",

        info_phone_label: "Телефон",
        info_hours: "Ежедневно, 14:00 - 01:00",

        info_consumer: "Уголок потребителя",

        info_license: "Лицензия и регистрация",
        info_license_desc:
            "Информация о регистрации и разрешительных документах предоставляется гостям по запросу.",

        info_rules: "Правила обслуживания",
        info_rules_desc:
            "Мы заботимся о комфортной атмосфере и просим гостей соблюдать правила заведения.",

        info_feedback: "Книга отзывов",
        info_feedback_desc:
            "Книга отзывов и предложений предоставляется по запросу у менеджера.",

        nothing_found: "Ничего не найдено",
        try_another_search: "Попробуйте изменить запрос."
    },


    KZ: {
        header_subtitle: "Lounge · Bar · Kitchen",

        hero_title: "Мәзір",
        hero_subtitle: "LOUNGE · KITCHEN · BAR",
        hero_description: "Асхана, мангал және сусындар",

        search_placeholder: "Тағамдарды, сусындарды іздеу...",

        nav_kitchen: "АСХАНА",
        nav_bar: "БАР",

        modal_ingredients: "Құрамы",
        modal_close: "ЖАБУ",

        tab_menu: "Мәзір",
        tab_info: "Ақпарат",

        info_title: "Ақпарат",
        info_subtitle:
            "Бізбен хабарласыңыз немесе маңызды мәліметтерді табыңыз",

        info_address_label: "Мекен-жайы",
        info_address:
            "Дулати даңғылы 1а, Архат ықшамауданы, Алматы",
        info_open_map: "2GIS-те ашу",

        info_phone_label: "Телефон",
        info_hours: "Күн сайын, 14:00 - 01:00",

        info_consumer: "Тұтынушы бұрышы",

        info_license: "Лицензия және тіркеу",
        info_license_desc:
            "Тіркеу және рұқсат құжаттары туралы ақпарат қонақтарға сұраныс бойынша беріледі.",

        info_rules: "Қызмет көрсету ережелері",
        info_rules_desc:
            "Біз жайлы атмосфераны сақтауға тырысамыз және қонақтардан мекеме ережелерін сақтауды сұраймыз.",

        info_feedback: "Пікірлер кітабы",
        info_feedback_desc:
            "Пікірлер мен ұсыныстар кітабы менеджердің сұрауы бойынша беріледі.",

        nothing_found: "Ештеңе табылмады",
        try_another_search: "Іздеу сұрауын өзгертіп көріңіз."
    },


    EN: {
        header_subtitle: "Lounge · Bar · Kitchen",

        hero_title: "Menu",
        hero_subtitle: "LOUNGE · KITCHEN · BAR",
        hero_description: "Kitchen, grill and drinks",

        search_placeholder: "Search dishes, drinks...",

        nav_kitchen: "KITCHEN",
        nav_bar: "BAR",

        modal_ingredients: "Ingredients",
        modal_close: "CLOSE",

        tab_menu: "Menu",
        tab_info: "Info",

        info_title: "Information",
        info_subtitle:
            "Get in touch or find essential details",

        info_address_label: "Address",
        info_address:
            "Prospect Dulati, 1a, Arhat district, Almaty",
        info_open_map: "Open in 2GIS",

        info_phone_label: "Phone",
        info_hours: "Every day, 14:00 - 01:00",

        info_consumer: "Consumer Corner",

        info_license: "License & Registration",
        info_license_desc:
            "Registration and permit information is available to guests upon request.",

        info_rules: "Rules of Service",
        info_rules_desc:
            "We care about a comfortable atmosphere and ask guests to follow the venue rules.",

        info_feedback: "Feedback Book",
        info_feedback_desc:
            "The feedback and suggestions book is available upon request from the manager.",

        nothing_found: "Nothing found",
        try_another_search: "Try changing your search."
    }

};
