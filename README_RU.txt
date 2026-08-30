NECTAR MENU — FULL v1.6.1 QA

Это полная сборка проекта, а не патч.

СТРУКТУРА
- index.html — разметка
- styles.css — дизайн и responsive
- app.js — Kitchen / Bar / поиск / основная modal
- menu-data.js — основное меню и переводы RU/KZ/EN
- banquet-data.js — отдельное банкетное меню
- banquet.js — логика банкетного режима
- assets/nectar-hero.jpg — hero
- assets/menu/items/ — универсальные фото
- assets/menu/thumbs/ — облегчённые фото карточек
- assets/menu/full/ — крупные фото для modal

ФОТОГРАФИИ
Для Tom Yum (id 5-4) и фирменных лимонадов (id 13-1) в сборке уже есть реальные тестовые файлы в thumbs/full/items.
Карточка загружает thumb, modal — full. Если full не загрузился, используется image/fallback.

Для нового блюда самый простой вариант:
1. Узнай id блюда в menu-data.js, например 1-1.
2. Положи одно фото в assets/menu/items/1-1.webp.
3. В объект блюда добавь:
   image: "assets/menu/items/1-1.webp"

Оптимальный вариант для скорости:
   thumb_image: "assets/menu/thumbs/1-1.webp",
   full_image: "assets/menu/full/1-1.webp",
   image: "assets/menu/items/1-1.webp"

Если хочешь использовать только имена по ID, можно добавить image_auto: true и загрузить соответствующие файлы. По умолчанию auto выключен: так блюда без фото не создают десятки 404-запросов.

ВЫБОР NECTAR
featured: true  — показывать блюдо дополнительно в «Выбор NECTAR».
featured: false — убрать из «Выбор NECTAR».
Блюдо при этом НЕ исчезает из своей обычной категории.

ДОСТУПНОСТЬ
available: false — временно недоступно.
available: true  — доступно.
Если поля available нет, блюдо считается доступным.
Торт Сникерс оставлен примером available: false.

ТЕГИ
tags: ["spicy"] — острое.
tags: ["vegetarian"] — вегетарианское.
tags: ["spicy", "vegetarian"] — оба тега.
Подписи RU/KZ/EN приложение подставляет само.

БАНКЕТНОЕ МЕНЮ
Хранится отдельно в banquet-data.js и НЕ входит в поиск Kitchen / Bar.
Пока цена неизвестна: price: null -> «Цена уточняется» / «Бағасы нақтылануда» / «Price upon confirmation».
Когда цена появится, замени, например:
price: null
на
price: 12990

ВАЖНО
Не придумывай граммовку/цену, если ресторан её не подтвердил.
После изменения GitHub Pages сделай hard refresh.
