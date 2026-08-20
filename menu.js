// ============================================================
//  MENU DATA — NECTAR
//  Полная мультиязычная версия (RU / KZ / EN)
// ============================================================

const MENU_DATA = {

    "Холодные закуски": {
        ru: "Холодные закуски",
        kz: "Суық тағамдар",
        en: "Cold Appetizers",
        items: [
            { id: 1, name: { ru: "Мясное плато (казы, жая, жал)", kz: "Ет табағы (қазы, жая, жал)", en: "Meat Platter (Kazy, Zhaya, Zhal)" }, price: 4990, output: "350 г", composition: "Казы, жая, жал, отварной язык, подается с хреном и горчицей." },
            { id: 2, name: { ru: "Домашние соленья", kz: "Үйде тұздалған көкөністер", en: "Homemade Pickles" }, price: 2890, output: "400 г", composition: "Огурцы соленые, помидоры черри, капуста квашеная, чеснок маринованный, перец острый." },
            { id: 3, name: { ru: "Овощная нарезка", kz: "Көкөніс табағы", en: "Fresh Vegetable Platter" }, price: 2890, output: "400 г", composition: "Томаты свежие, огурцы, болгарский перец, редис, зелень, микс салата." },
            { id: 4, name: { ru: "Рыбное ассорти", kz: "Балық ассортиі", en: "Fish Assortment" }, price: 5590, output: "300 г", composition: "Семга слабосоленая, масляная рыба, балык из судака, лимон, маслины." },
            { id: 5, name: { ru: "Капрезе", kz: "Капрезе", en: "Caprese" }, price: 2790, output: "250 г", composition: "Свежие томаты, сыр моцарелла, соус песто, бальзамический крем, базилик." },
            { id: 6, name: { ru: "Сырное плато", kz: "Ірімшік табағы", en: "Cheese Platter" }, price: 4990, output: "320 г", composition: "Пармезан, дор блю, камамбер, маасдам, мед, грецкие орехи, виноград." },
        ]
    },

    "Салаты": {
        ru: "Салаты",
        kz: "Салаттар",
        en: "Salads",
        items: [
            { id: 10, name: { ru: "Свежий овощной салат", kz: "Жаңа піскен көкөніс салаты", en: "Fresh Vegetable Salad" }, price: 1990, output: "250 г", composition: "Огурцы, помидоры, болгарский перец, красный лук, заправка на выбор (масло / сметана)." },
            { id: 11, name: { ru: "Аччик-чучук", kz: "Аччик-чучук", en: "Achchik-Chuchuk (Spicy Tomato Salad)" }, price: 1790, output: "200 г", composition: "Спелые томаты, тонко нарезанный репчатый лук, острый перец." },
            { id: 12, name: { ru: "Цезарь с курицей", kz: "Тауық етімен Цезарь", en: "Caesar with Chicken" }, price: 2590, output: "280 г", composition: "Куриное филе гриль, листья салата романо, томаты черри, сыр пармезан, гренки, соус цезарь." },
            { id: 13, name: { ru: "Хрустящие баклажаны", kz: "Қытырлақ баклажан", en: "Crispy Eggplant Salad" }, price: 2790, output: "260 г", composition: "Баклажаны в крахмале во фритюре, томаты свежие, кинза, кунжут, кисло-сладкий соус." },
            { id: 14, name: { ru: "Греческий салат", kz: "Грек салаты", en: "Greek Salad" }, price: 2490, output: "300 г", composition: "Томаты, огурцы, перец болгарский, маслины каламата, сыр фета, оливковое масло, орегано." },
            { id: 15, name: { ru: "Теплый салат с кониной", kz: "Жылы жылқы еті салаты", en: "Warm Horse Meat Salad" }, price: 2990, output: "270 г", composition: "Отварная конина, микс салатов, вяленые томаты, кедровые орехи, фирменная заправка." },
            { id: 16, name: { ru: "Салат с креветками и рукколой", kz: "Асшаян және руккола салаты", en: "Shrimp & Rocket Salad" }, price: 3990, output: "240 г", composition: "Тигровые креветки, руккола, томаты черри, сыр пармезан, бальзамик." },
        ]
    },

    "Горячие закуски": {
        ru: "Горячие закуски",
        kz: "Ыстық тағамдар",
        en: "Hot Appetizers",
        items: [
            { id: 20, name: { ru: "Креветки темпура", kz: "Темпура асшаяндары", en: "Tempura Shrimp" }, price: 3290, output: "220 г", composition: "Тигровые креветки в хрустящем кляре темпура, кисло-сладкий соус." },
            { id: 21, name: { ru: "Клаб-сэндвич с курицей", kz: "Тауық етімен клаб-сэндвич", en: "Chicken Club Sandwich" }, price: 3190, output: "350 г", composition: "Тостовый хлеб, куриное филе, бекон, сыр чеддер, томаты, айсберг, картофель фри." },
            { id: 22, name: { ru: "Кесадилья с курицей", kz: "Тауық етімен кесадилья", en: "Chicken Quesadilla" }, price: 2990, output: "300 г", composition: "Пшеничная тортилья, куриное филе, болгарский перец, сыр моцарелла, халапеньо, соус сальса." },
            { id: 23, name: { ru: "Чебуреки", kz: "Шебуректер", en: "Chebureki (Fried Meat Pastries)" }, price: 2590, output: "280 г", composition: "Тонкое хрустящее тесто, сочный фарш из говядины и лука, специи." },
            { id: 24, name: { ru: "Наггетсы куриные", kz: "Тауық наггетстері", en: "Chicken Nuggets" }, price: 1690, output: "200 г", composition: "Куриное филе в панировочных сухарях, подается с соусом." },
        ]
    },

    "Снэки": {
        ru: "Снэки",
        kz: "Снэкілер",
        en: "Snacks",
        items: [
            { id: 30, name: { ru: "Большой сет закусок", kz: "Үлкен тағамдар жиынтығы", en: "Large Snack Platter" }, sub: { ru: "креветки, гренки, чечил, фри, сосиски, луковые кольца", kz: "асшаяндар, гренкілер, чечил, фри, шұжықтар, пияз сақиналары", en: "Shrimp, Croutons, Chechil, Fries, Sausages, Onion Rings" }, price: 6990, output: "900 г", composition: "Ассорти популярных пивных закусок с соусами тартар и кетчуп." },
            { id: 31, name: { ru: "Креветки пивные", kz: "Сыраға арналған асшаяндар", en: "Beer Shrimp" }, price: 3990, output: "250 г", composition: "Креветки в панцире, обжаренные с чесноком, соевым соусом и перцем чили." },
            { id: 32, name: { ru: "Фисташки", kz: "Писте", en: "Pistachios" }, price: 1590, output: "100 г", composition: "Жареные соленые фисташки." },
            { id: 33, name: { ru: "Чесночные гренки", kz: "Сарымсақты гренкілер", en: "Garlic Croutons" }, price: 1590, output: "200 г", composition: "Ржаной хлеб, обжаренный в масле с чесночным соусом и зеленью." },
            { id: 34, name: { ru: "Чечил копченый", kz: "Ысталған чечил", en: "Smoked Chechil Cheese" }, price: 1390, output: "120 г", composition: "Традиционный копченый сыр-соломка." },
            { id: 35, name: { ru: "Арахис", kz: "Жер жаңғақ", en: "Peanuts" }, price: 1390, output: "120 г", composition: "Арахис соленый жареный." },
        ]
    },

    "Супы": {
        ru: "Супы",
        kz: "Сорпалар",
        en: "Soups",
        items: [
            { id: 40, name: { ru: "Окрошка с мясом (сезонная)", kz: "Ет қосылған окрошка (маусымдық)", en: "Okroshka with Meat (Seasonal)" }, price: 2390, output: "350 г", composition: "Говядина отварная, огурцы, редис, яйцо, зелень, квас / кефир." },
            { id: 41, name: { ru: "Куриный суп с лапшой", kz: "Тауық еті қосылған кеспе сорпа", en: "Chicken Noodle Soup" }, price: 1590, output: "350 г", composition: "Ароматный куриный бульон, домашняя лапша, куриное филе, морковь, зелень." },
            { id: 42, name: { ru: "Солянка мясная", kz: "Ет солянкасы", en: "Meat Solyanka" }, price: 3590, output: "350 г", composition: "Ассорти мясных деликатесов, соленые огурцы, маслины, лимон, сметана." },
            { id: 43, name: { ru: "Том Ям", kz: "Том Ям", en: "Tom Yum" }, price: 3590, output: "400 г", composition: "Пряный тайский суп, креветки, кальмары, шампиньоны, кокосовое молоко, рис." },
            { id: 44, name: { ru: "Рамен с говядиной", kz: "Сиыр етімен рамен", en: "Beef Ramen" }, price: 3590, output: "450 г", composition: "Наваристый бульон, лапша рамен, говядина слайсы, яйцо маринованное, нори, лук-порей." },
            { id: 45, name: { ru: "Рамен с курицей", kz: "Тауық етімен рамен", en: "Chicken Ramen" }, price: 3290, output: "450 г", composition: "Бульон, лапша рамен, куриное филе су-вид, яйцо, нори, зелень." },
            { id: 46, name: { ru: "Чечевичный крем-суп", kz: "Жасымық крем-сорпасы", en: "Creamy Lentil Soup" }, price: 1990, output: "300 г", composition: "Красная чечевица, лук, морковь, подается с сухариками и лимоном." },
            { id: 47, name: { ru: "Шорпа", kz: "Шорпа", en: "Shorpa (Traditional Meat Broth)" }, price: 3290, output: "400 г", composition: "Традиционный мясной бульон из баранины, крупный картофель, морковь, лук." },
            { id: 48, name: { ru: "Пельмени (с бульоном / без)", kz: "Пельмендер (сорпамен / сорпасыз)", en: "Pelmeni (with / without Broth)" }, price: 1990, output: "300 г", composition: "Домашние пельмени из говядины, подаются со сметаной или в бульоне." },
        ]
    },

    "Пицца и выпечка": {
        ru: "Пицца и выпечка",
        kz: "Пицца және нан-тоқаш",
        en: "Pizza & Bakery",
        items: [
            { id: 50, name: { ru: "Пицца Пепперони", kz: "Пепперони пиццасы", en: "Pepperoni Pizza" }, price: 3090, output: "500 г", composition: "Томатный соус, моцарелла, колбаски пепперони, орегано." },
            { id: 51, name: { ru: "Пицца Маргарита", kz: "Маргарита пиццасы", en: "Margherita Pizza" }, price: 2590, output: "450 г", composition: "Томатный соус, сыр моцарелла, свежие томаты, базилик." },
            { id: 52, name: { ru: "Пицца с курицей и грибами", kz: "Тауық еті және саңырауқұлақ қосылған пицца", en: "Chicken & Mushroom Pizza" }, price: 3090, output: "520 г", composition: "Сливочный соус, моцарелла, куриное филе, шампиньоны." },
            { id: 53, name: { ru: "Пицца Болоньезе", kz: "Болоньезе пиццасы", en: "Bolognese Pizza" }, price: 2990, output: "530 г", composition: "Соус болоньезе (фарш из говядины), томатный соус, моцарелла, лук." },
            { id: 54, name: { ru: "Мексиканская пицца с халапеньо", kz: "Халапеньо қосылған мексикалық пицца", en: "Mexican Pizza with Jalapeño" }, price: 3590, output: "540 г", composition: "Острый соус, моцарелла, говядина, болгарский перец, перец халапеньо, кукуруза." },
            { id: 55, name: { ru: "Хачапури по-мегрельски", kz: "Мегрельше хачапури", en: "Megrelian Khachapuri" }, price: 2790, output: "450 г", composition: "Дрожжевое тесто, обильная начинка из сыра сулугуни внутри и сверху." },
            { id: 56, name: { ru: "Хлебная корзина", kz: "Нан себеті", en: "Bread Basket" }, price: 890, output: "200 г", composition: "Ассорти фирменного хлеба собственного приготовления." },
            { id: 57, name: { ru: "Лепешка", kz: "Жайма нан", en: "Flatbread" }, price: 590, output: "150 г", composition: "Традиционная узбекская лепешка из тандыра." },
        ]
    },

    "Паста": {
        ru: "Паста",
        kz: "Паста",
        en: "Pasta",
        items: [
            { id: 60, name: { ru: "Фарфалле с морепродуктами", kz: "Теңіз өнімдерімен фарфалле", en: "Farfalle with Seafood" }, sub: { ru: "креветки, мидии, кальмары", kz: "асшаяндар, мидиялар, кальмарлар", en: "Shrimp, Mussels, Squid" }, price: 4990, output: "350 г", composition: "Паста фарфалле, морепродукты, сливки, чеснок, сыр пармезан." },
            { id: 61, name: { ru: "Карбонара", kz: "Карбонара", en: "Carbonara" }, price: 3590, output: "330 г", composition: "Спагетти, бекон, яичный желток, сыр пармезан, черный перец, сливки." },
            { id: 62, name: { ru: "Болоньезе", kz: "Болоньезе", en: "Bolognese" }, price: 3290, output: "350 г", composition: "Спагетти, классический мясной соус из говядины с томатами и зеленью." },
            { id: 63, name: { ru: "Фетучини с курицей и грибами", kz: "Тауық еті және саңырауқұлақ қосылған фетучини", en: "Fettuccine with Chicken & Mushrooms" }, price: 2990, output: "350 г", composition: "Паста фетучини, куриное филе, шампиньоны, сливочный соус, пармезан." },
        ]
    },

    "Горячие блюда": {
        ru: "Горячие блюда",
        kz: "Ыстық тағамдар",
        en: "Main Courses",
        items: [
            { id: 70, name: { ru: "Куырдак", kz: "Қуырдақ", en: "Kuyrdak (Traditional Meat Stew)" }, price: 4090, output: "300 г", composition: "Традиционное жаркое из мяса и субпродуктов (печень, почки) с луком и картофелем." },
            { id: 71, name: { ru: "Плов", kz: "Палау", en: "Plov (Uzbek-style Pilaf)" }, price: 3090, output: "400 г", composition: "Рис лазер, баранина / говядина, желтая морковь, нут, специи, зира." },
            { id: 72, name: { ru: "Бургер с курицей", kz: "Тауық етімен бургер", en: "Chicken Burger" }, price: 3290, output: "380 г", composition: "Булочка бриошь, куриная котлета в панировке, салат айсберг, томаты, соус." },
            { id: 73, name: { ru: "Бургер с говядиной", kz: "Сиыр етімен бургер", en: "Beef Burger" }, price: 3590, output: "400 г", composition: "Булочка бриошь, мраморная говяжья котлета, сыр чеддер, соленый огурец, соус." },
            { id: 74, name: { ru: "Бургер, грибной стаут", kz: "Саңырауқұлақ стаутымен бургер", en: "Mushroom Stout Burger" }, price: 4390, output: "420 г", composition: "Говяжья котлета, карамелизированные грибы в соусе стаут, сыр, трюфельный соус." },
            { id: 75, name: { ru: "Колбаски говяжьи / бараньи", kz: "Сиыр / қой шұжықтары", en: "Beef / Lamb Sausages" }, price: 3390, output: "300 г", composition: "Домашние колбаски на гриле, подаются с тушеной капустой и горчицей." },
            { id: 76, name: { ru: "Колбаски куриные", kz: "Тауық шұжықтары", en: "Chicken Sausages" }, price: 2990, output: "300 г", composition: "Нежные куриные колбаски с зеленью и специями." },
            { id: 77, name: { ru: "Говядина по-тайски с рисом", kz: "Тайша сиыр еті (күрішпен)", en: "Thai-style Beef with Rice" }, price: 3290, output: "380 г", composition: "Ломтики говядины, овощи вок, соево-кунжутный соус, отварной рис." },
            { id: 78, name: { ru: "Бефстроганов с пюре", kz: "Бефстроганов (пюремен)", en: "Beef Stroganoff with Mashed Potatoes" }, price: 3290, output: "380 г", composition: "Нежная говядина в сливочно-грибном соусе с картофельным пюре." },
            { id: 79, name: { ru: "Куриная грудка в сырно-сливочном соусе", kz: "Ірімшік-қаймақ соусындағы тауық төс еті", en: "Chicken Breast in Creamy Cheese Sauce" }, price: 3290, output: "340 г", composition: "Куриное филе тушеное в густом сырном соусе." },
            { id: 80, name: { ru: "Картофель по-домашнему с мясом", kz: "Үйдегідей картоп (етпен)", en: "Homestyle Potatoes with Meat" }, price: 3990, output: "400 г", composition: "Жареный картофель дольками с кусочками мяса, луком и чесноком." },
        ]
    },

    "Шашлык на мангале": {
        ru: "Шашлык на мангале",
        kz: "Мангалдағы шашлык",
        en: "BBQ & Grill",
        items: [
            { id: 90, name: { ru: "Антрекот", kz: "Антрекот", en: "Entrecôte" }, price: 3990, output: "250 г", composition: "Сочный говяжий антрекот на кости, маринованный по фирменному рецепту." },
            { id: 91, name: { ru: "Баранина", kz: "Қой еті", en: "Lamb" }, price: 3190, output: "220 г", composition: "Мякоть молодой баранины на углях, лук маринованный." },
            { id: 92, name: { ru: "Люля-кебаб", kz: "Люля-кебаб", en: "Lula Kebab" }, price: 3190, output: "220 г", composition: "Рубленый фарш из баранины / говядины со специями и зеленью." },
            { id: 93, name: { ru: "Куриное филе", kz: "Тауық филесі", en: "Chicken Fillet" }, price: 2990, output: "220 г", composition: "Нежное куриное филе на шпажке, мангал-маринад." },
            { id: 94, name: { ru: "Куриные крылышки", kz: "Тауық қанаттары", en: "Chicken Wings" }, price: 2890, output: "250 г", composition: "Куриные крылья в пикантном соусе барбекю." },
            { id: 95, name: { ru: "Утка", kz: "Үйрек еті", en: "Duck" }, price: 2790, output: "220 г", composition: "Ароматные кусочки утиного мяса на мангале." },
            { id: 96, name: { ru: "Куриные окорочка", kz: "Тауық бауыры", en: "Chicken Thighs" }, price: 2590, output: "230 г", composition: "Сочное мясо куриного бедра без кости." },
            { id: 97, name: { ru: "Овощи гриль на шпажке", kz: "Шпажкадағы көкөніс гриль", en: "Grilled Vegetable Skewers" }, price: 1990, output: "200 г", composition: "Баклажан, кабачок, томаты, болгарский перец на углях." },
            { id: 98, name: { ru: "Шампиньоны на мангале", kz: "Мангалдағы шампиньондар", en: "Grilled Champignons" }, price: 1790, output: "180 г", composition: "Шампиньоны в чесночном маринаде на углях." },
        ]
    },

    "Гарниры": {
        ru: "Гарниры",
        kz: "Гарнирлер",
        en: "Sides",
        items: [
            { id: 100, name: { ru: "Овощи гриль", kz: "Көкөніс гриль", en: "Grilled Vegetables" }, price: 1990, output: "200 г", composition: "Микс сезонных овощей, приготовленных на гриле." },
            { id: 101, name: { ru: "Брокколи", kz: "Брокколи", en: "Broccoli" }, price: 1790, output: "180 г", composition: "Соцветия брокколи на пару." },
            { id: 102, name: { ru: "Картофельные дольки", kz: "Картоп тілімдері", en: "Potato Wedges" }, price: 1390, output: "200 г", composition: "Запеченный картофель с кожурой и специями." },
            { id: 103, name: { ru: "Картофель фри", kz: "Картоп фри", en: "French Fries" }, price: 1190, output: "150 г", composition: "Классический картофель фри с солью." },
            { id: 104, name: { ru: "Рис", kz: "Күріш", en: "Rice" }, price: 790, output: "180 г", composition: "Отварной рассыпчатый рис." },
        ]
    },

    "Соусы": {
        ru: "Соусы",
        kz: "Соустар",
        en: "Sauces",
        items: [
            { id: 110, name: { ru: "Сырный", kz: "Ірімшік соусы", en: "Cheese Sauce" }, price: 590, output: "50 г", composition: "Фирменный сырный соус." },
            { id: 111, name: { ru: "Красный", kz: "Қызыл соус", en: "Red Sauce" }, price: 590, output: "50 г", composition: "Острый томатный соус с зеленью." },
            { id: 112, name: { ru: "Белый", kz: "Ақ соус", en: "White Sauce" }, price: 590, output: "50 г", composition: "Чесночно-сметанный соус." },
            { id: 113, name: { ru: "Кетчуп", kz: "Кетчуп", en: "Ketchup" }, price: 590, output: "50 г", composition: "Классический томатный кетчуп." },
            { id: 114, name: { ru: "Тартар", kz: "Тартар соусы", en: "Tartar Sauce" }, price: 590, output: "50 г", composition: "Соус на основе майонеза с солеными огурцами и зеленью." },
        ]
    },

    "Десерты": {
        ru: "Десерты",
        kz: "Десерттер",
        en: "Desserts",
        items: [
            { id: 120, name: { ru: "Восточные сладости", kz: "Шығыс тәттілері", en: "Oriental Sweets" }, price: 5490, output: "350 г", composition: "Ассорти восточных десертов, пахлава, орехи." },
            { id: 121, name: { ru: "Пирожное в ассортименте", kz: "Торттар ассортименті", en: "Assorted Pastries" }, price: 2590, output: "150 г", composition: "Спросите официанта о доступных десертах дня." },
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
            { id: 300, name: { ru: "Фирменные лимонады", kz: "Фирмалық лимонадтар", en: "Signature Lemonades" }, sub: { ru: "Вишня-Виноград, Киви-Грейпфрут, Жасмин, Маракуйя-Ананас, Нектар", kz: "Шие-Жүзім, Киви-Грейпфрут, Жасмин, Маракуйя-Ананас, Нектар", en: "Cherry-Grape, Kiwi-Grapefruit, Jasmine, Passion Fruit-Pineapple, Nectar" }, price: 2990, output: "400 мл", composition: "Освежающий авторский напиток на основе свежих фруктовых пюре и газированной воды." },
            { id: 301, name: { ru: "Авторский чай", kz: "Авторлық шай", en: "Signature Tea" }, sub: { ru: "Алматинский, Ташкентский, Малина-Лайм, Персик-жасмин", kz: "Алматы, Ташкент, Таңқурай-Лайм, Шабдалы-жасмин", en: "Almaty, Tashkent, Raspberry-Lime, Peach-Jasmine" }, price: 2590, output: "600 мл", composition: "Фирменный чайный микс с добавлением свежих фруктов, ягод и трав." },
            { id: 302, name: { ru: "Пепси", kz: "Пепси", en: "Pepsi" }, sub: { ru: "", kz: "", en: "" }, price: 1790, output: "330 мл", composition: "Газированный безалкогольный напиток." },
            { id: 303, name: { ru: "Листовой чай", kz: "Жапырақты шай", en: "Loose Leaf Tea" }, sub: { ru: "Ассам, Сенча, Жасмин, Эрл Грей, Ройбуш, Султан", kz: "Ассам, Сенча, Жасмин, Эрл Грей, Ройбуш, Сұлтан", en: "Assam, Sencha, Jasmine, Earl Grey, Rooibos, Sultan" }, price: 1590, output: "600 мл", composition: "Элитный листовой чай на выбор." },
        ]
    },

    "Вино": {
        ru: "Вино",
        kz: "Шарап",
        en: "Wine",
        items: [
            { id: 310, name: { ru: "Blanc de Blancs Tete de Cheval", kz: "Blanc de Blancs Tete de Cheval", en: "Blanc de Blancs Tete de Cheval" }, sub: { ru: "Игристое белое, бутылка", kz: "Ақ жарқыраған шарап, бөтелке", en: "Sparkling White, Bottle" }, price: 14990, output: "750 мл", composition: "Игристое вино, легкий утонченный вкус." },
        ]
    },

    "Водка": {
        ru: "Водка",
        kz: "Арақ",
        en: "Vodka",
        items: [
            { id: 320, name: { ru: "Koskenkorva", kz: "Koskenkorva", en: "Koskenkorva" }, sub: { ru: "50 г", kz: "50 г", en: "50 g" }, price: 2090, output: "50 мл", composition: "Финская водка премиум-класса." },
            { id: 321, name: { ru: "Mont Blanc", kz: "Mont Blanc", en: "Mont Blanc" }, sub: { ru: "50 г", kz: "50 г", en: "50 g" }, price: 2690, output: "50 мл", composition: "Французская водка из пшеницы." },
            { id: 322, name: { ru: "Архангельская Северная", kz: "Архангельская Северная", en: "Arkhangelskaya Severnaya" }, sub: { ru: "50 г", kz: "50 г", en: "50 g" }, price: 1790, output: "50 мл", composition: "Классическая мягкая водка." },
            { id: 323, name: { ru: "Белуга Нобл", kz: "Белуга Нобл", en: "Beluga Noble" }, sub: { ru: "50 г", kz: "50 г", en: "50 g" }, price: 2690, output: "50 мл", composition: "Российская премиальная водка." },
        ]
    },

    "Пиво бутылочное": {
        ru: "Пиво бутылочное",
        kz: "Бөтелкедегі сыра",
        en: "Bottled Beer",
        items: [
            { id: 330, name: { ru: "Ayinger, Brauweisse", kz: "Ayinger, Brauweisse", en: "Ayinger, Brauweisse" }, sub: { ru: "Нефильтрованное", kz: "Сүзгіден өтпеген", en: "Unfiltered" }, price: 2990, output: "500 мл", composition: "Немецкое пшеничное нефильтрованное пиво." },
            { id: 331, name: { ru: "Ayinger, Lager", kz: "Ayinger, Lager", en: "Ayinger, Lager" }, sub: { ru: "Фильтрованное", kz: "Сүзгіден өткен", en: "Filtered" }, price: 2990, output: "500 мл", composition: "Традиционный немецкий лагер." },
            { id: 332, name: { ru: "Gubernija Brown Ale", kz: "Gubernija Brown Ale", en: "Gubernija Brown Ale" }, sub: { ru: "Тёмное", kz: "Қара", en: "Dark" }, price: 1990, output: "500 мл", composition: "Тёмный эль с карамельными нотками." },
            { id: 333, name: { ru: "Gubernija Ekstra Lager", kz: "Gubernija Ekstra Lager", en: "Gubernija Ekstra Lager" }, sub: { ru: "Фильтрованное", kz: "Сүзгіден өткен", en: "Filtered" }, price: 1990, output: "500 мл", composition: "Светлое пиво классической варки." },
        ]
    },

    "Пиво разливное": {
        ru: "Пиво разливное",
        kz: "Құйма сыра",
        en: "Draft Beer",
        items: [
            { id: 340, name: { ru: "Holsten Pilsener", kz: "Holsten Pilsener", en: "Holsten Pilsener" }, sub: { ru: "Светлое фильтрованное", kz: "Ақ сүзгіден өткен", en: "Light Filtered" }, price: 1890, output: "500 мл", composition: "Светлое разливное пиво." },
            { id: 341, name: { ru: "Kronenbourg Blanc", kz: "Kronenbourg Blanc", en: "Kronenbourg Blanc" }, sub: { ru: "Нефильтрованное", kz: "Сүзгіден өтпеген", en: "Unfiltered" }, price: 2290, output: "500 мл", composition: "Французское пшеничное пиво с фруктовыми нотками." },
        ]
    },

};

// Тексты интерфейса
const I18N = {
    tabs: {
        food: { ru: "Кухня", kz: "Асхана", en: "Kitchen" },
        bar: { ru: "Бар", kz: "Бар", en: "Bar" },
        info: { ru: "Информация", kz: "Ақпарат", en: "Info" },
        contacts: { ru: "Контакты", kz: "Байланыс", en: "Contacts" }
    },
    searchPlaceholder: {
        ru: "Поиск блюд и напитков...",
        kz: "Тағамдар мен сусындарды іздеу...",
        en: "Search food and drinks..."
    },
    allergy: {
        ru: "Пожалуйста, предупреждайте официанта об имеющихся аллергиях.",
        kz: "Аллергияңыз бар болса, даяшыға алдын ала ескертуіңізді сұраймыз.",
        en: "Please inform your waiter about any food allergies."
    },
    modalLabels: {
        composition: { ru: "Состав:", kz: "Құрамы:", en: "Ingredients:" },
        output: { ru: "Выход:", kz: "Шығуы:", en: "Output:" }
    },
    infoContent: {
        ru: "Nectar Lounge & Bar — это место, где атмосферный дизайн встречается с безупречным вкусом. Мы рады предложить вам изысканные блюда европейской, азиатской и национальной кухни, а также большую коллекцию авторских напитков.",
        kz: "Nectar Lounge & Bar — бұл атмосфералық дизайн мінсіз дәммен үйлесетін орын. Біз сізге еуропалық, азиялық және ұлттық асхананың талғампаз тағамдарын, сондай-ақ авторлық сусындардың үлкен топтамасын ұсынуға қуаныштымыз.",
        en: "Nectar Lounge & Bar is a place where atmospheric design meets impeccable taste. We are pleased to offer you exquisite dishes of European, Asian and national cuisine, as well as a large collection of signature drinks."
    }
};

const SECTIONS = {
    food: [
        "Холодные закуски", "Салаты", "Горячие закуски", "Снэки", 
        "Супы", "Пицца и выпечка", "Паста", "Горячие блюда", 
        "Шашлык на мангале", "Гарниры", "Соусы", "Десерты"
    ],
    bar: [
        "Безалкогольные напитки", "Вино", "Водка", 
        "Пиво бутылочное", "Пиво разливное"
    ]
};
