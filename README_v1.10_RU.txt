NECTAR v1.10 — STABILIZATION

База: v1.9.5 (визуальный golden master).
Цель: техническая стабилизация без намеренных визуальных изменений.

Что сделано:
- сохранён menuIndex/search cache и batching из Core Refactor;
- усилена runtime-проверка menu-data: обязательные поля, уникальность ключей, валидность цен;
- добавлен tools/qa-check.mjs для проверки данных перед публикацией;
- CSS-связь цены карточки с modal разорвана: правило <small> теперь относится только к карточке;
- фирменная цена главного меню Cormorant Garamond из v1.8.1 не изменялась;
- modal, unavailable, Banquet, Info, motion и размеры карточек визуально не менялись.

Команда QA (при наличии Node.js):
node tools/qa-check.mjs
