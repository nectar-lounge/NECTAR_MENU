// Функция с вау-эффектом смены контента и идеальным скроллом
function switchSubcategory(callbackToFilter) {
    const menuGrid = document.getElementById('menu-grid');
    
    // 1. Запускаем эффект исчезновения (fade-out)
    menuGrid.classList.add('fade-out');

    setTimeout(() => {
        // 2. Выполняем саму фильтрацию / смену данных меню внутри таймаута
        callbackToFilter();

        // 3. Плавно возвращаем контент обратно (fade-in)
        menuGrid.classList.remove('fade-out');

        // 4. Жесткий и плавный скролл к началу меню (решает баг с "Домашними соленьями")
        const navElement = document.getElementById('categories-nav');
        const offsetPosition = navElement.getBoundingClientRect().top + window.pageYOffset - 80;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }, 250); // Время анимации совпадает с CSS
}

// Защита от залипания серого цвета на всех элементах интерфейса
document.addEventListener('DOMContentLoaded', () => {
    const interactiveElements = document.querySelectorAll('summary, button, .info-dropdown');
    
    interactiveElements.forEach(el => {
        el.addEventListener('click', (e) => {
            setTimeout(() => {
                e.target.blur();
            }, 50);
        });
    });
});
