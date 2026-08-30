NECTAR v1.9.4 — Typography + Init Fix

1. Цены карточек возвращены к фирменной Cormorant Garamond.
2. Цена основного modal также использует Cormorant Garamond; системный numeric font из v1.9.3 удалён.
3. Знак ₸ остаётся вторичным Manrope-элементом с постоянным CSS-отступом: .30em в карточке и .32em в modal.
4. Сохранённые lining/tabular numerals и единый baseline.
5. Persisted language определяется inline-bootstrap скриптом в <head> до первого paint; app.js стартует сразу с этим языком.
6. Визуал, данные меню, unavailable-state, Banquet и Info не менялись.
