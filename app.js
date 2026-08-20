(function() {
    'use strict';

    const container = document.getElementById('menuContent');
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modalClose');
    const modalTitle = document.getElementById('modalTitle');
    const modalPrice = document.getElementById('modalPrice');
    const modalOutput = document.getElementById('modalOutput');
    const modalComposition = document.getElementById('modalComposition');

    // Рендеринг меню
    function renderMenu() {
        let html = '';
        MENU_DATA.forEach(cat => {
            html += `<div class="category">`;
            html += `<div class="category-title">${cat.category}</div>`;
            cat.items.forEach(item => {
                html += `
                    <div class="item" data-name="${item.name}" data-price="${item.price}" data-output="${item.output || ''}" data-composition="${item.composition || ''}">
                        <span class="item-name">${item.name}</span>
                        <span class="item-price">${item.price} ₸</span>
                    </div>
                `;
            });
            html += `</div>`;
        });
        container.innerHTML = html;

        // Клик по блюду → открыть модалку
        document.querySelectorAll('.item').forEach(el => {
            el.addEventListener('click', function() {
                const name = this.dataset.name;
                const price = this.dataset.price;
                const output = this.dataset.output || '—';
                const composition = this.dataset.composition || '—';

                modalTitle.textContent = name;
                modalPrice.textContent = price + ' ₸';
                modalOutput.textContent = output;
                modalComposition.textContent = composition;
                modal.classList.add('active');
            });
        });
    }

    // Закрытие модалки
    function closeModal() {
        modal.classList.remove('active');
    }

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });

    // Запуск
    renderMenu();
})();
