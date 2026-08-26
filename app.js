document.addEventListener("DOMContentLoaded", () => {
  let menuData = { categories: [], items: [] };
  let currentTab = "kitchen";
  let currentSubCat = "all";
  let currentLang = "RU";

  const langSelect = document.getElementById("langSelect");
  const tabKitchen = document.getElementById("tabKitchen");
  const tabBar = document.getElementById("tabBar");
  const tabInfo = document.getElementById("tabInfo");
  const subContainer = document.getElementById("subcategoriesContainer");
  const menuContainer = document.getElementById("menuContainer");

  // Загружаем menu.json
  fetch("menu.json")
    .then(response => response.json())
    .then(data => {
      menuData = data;
      renderApp();
    })
    .catch(err => console.error("Ошибка загрузки меню:", err));

  // Переключение языка
  langSelect.addEventListener("change", (e) => {
    currentLang = e.target.value;
    renderApp();
  });

  // Переключение основных вкладок
  [tabKitchen, tabBar, tabInfo].forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      currentTab = e.target.dataset.tab;
      currentSubCat = "all"; // сбрасываем подкатегорию при смене вкладки
      renderApp();
    });
  });

  function renderApp() {
    if (currentTab === "info") {
      subContainer.style.display = "none";
      renderInfoSection();
    } else {
      subContainer.style.display = "flex";
      renderSubcategories();
      renderMenu();
    }
  }

  // Рендер горизонтальных подкатегорий
  function renderSubcategories() {
    const cats = menuData.categories.filter(c => c.tab === currentTab);
    
    let html = `<button class="sub-pill ${currentSubCat === 'all' ? 'active' : ''}" data-id="all">${getTranslation("Все", "All", "Барлығы")}</button>`;
    
    cats.forEach(cat => {
      const activeClass = currentSubCat === cat.id ? "active" : "";
      html += `<button class="sub-pill ${activeClass}" data-id="${cat.id}">${cat.name[currentLang] || cat.name.RU}</button>`;
    });

    subContainer.innerHTML = html;

    // Вешаем клики на пилюли подкатегорий
    document.querySelectorAll(".sub-pill").forEach(pill => {
      pill.addEventListener("click", (e) => {
        currentSubCat = e.target.dataset.id;
        renderSubcategories();
        renderMenu();

        // ИСПРАВЛЕНИЕ БАГА №2: Плавный скролл к началу выбранной категории
        if (currentSubCat !== "all") {
          const targetElement = document.getElementById(`cat-${currentSubCat}`);
          if (targetElement) {
            const headerOffset = 130; // Учитываем высоту липкой шапки
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            });
          }
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  }

  // Рендер карточек меню (статично, без дергающейся анимации скролла)
  function renderMenu() {
    const cats = menuData.categories.filter(c => c.tab === currentTab);
    const targetCats = currentSubCat === "all" ? cats : cats.filter(c => c.id === currentSubCat);

    let html = "";

    targetCats.forEach(cat => {
      const items = menuData.items.filter(i => i.categoryId === cat.id);
      if (items.length === 0) return;

      html += `
        <div class="category-section" id="cat-${cat.id}">
          <h2 class="category-title">${cat.name[currentLang] || cat.name.RU}</h2>
          <div class="menu-grid">
      `;

      items.forEach(item => {
        const name = item.name[currentLang] || item.name.RU;
        const desc = item.description ? (item.description[currentLang] || item.description.RU) : "";

        html += `
          <div class="menu-card">
            <div>
              <div class="card-header">
                <span class="card-title">${name}</span>
                <span class="card-price">${item.price} ₸</span>
              </div>
              ${desc ? `<div class="card-desc">${desc}</div>` : ""}
            </div>
            <div class="card-footer">${item.weight}</div>
          </div>
        `;
      });

      html += `</div></div>`;
    });

    menuContainer.innerHTML = html;
  }

  // Рендер Уголка потребителя с решением бага #1 (убираем серый фокус)
  function renderInfoSection() {
    const infoTexts = {
      RU: [
        { title: "Лицензия и регистрация", text: "ТОО 'NECTAR LOUNGE BAR'. Свидетельство о государственной регистрации № 000000000 от 2026 года. Лицензия на реализацию алкогольной продукции." },
        { title: "Правила обслуживания", text: "Мы ценим атмосферу нашего заведения. Администрация оставляет за собой право отказывать в доступе лицам в состоянии сильного алкогольного опьянения. Действует дресс-код." },
        { title: "Книга отзывов и предложений", text: "Ваше мнение важно для нас. Вы можете оставить свой отзыв управляющему заведением через QR-код на столе или направить на email: feedback@nectar-lounge.kz" }
      ],
      EN: [
        { title: "License & Registration", text: "LLC 'NECTAR LOUNGE BAR'. State registration certificate No. 000000000. Alcohol sales license issued in accordance with legislation." },
        { title: "Service Rules", text: "We value our lounge atmosphere. The management reserves the right to refuse service to intoxicated individuals. Dress code applies." },
        { title: "Feedback Book", text: "Your feedback matters. You can share your thoughts with the manager via the table QR-code or send an email to feedback@nectar-lounge.kz" }
      ],
      KZ: [
        { title: "Лицензия және тіркеу", text: "«NECTAR LOUNGE BAR» ЖШС. Мемлекеттік тіркеу куәлігі № 000000000. Алкоголь өнімін өткізу лицензиясы." },
        { title: "Қызмет көрсету ережелері", text: "Біз өз атмосферамызды бағалаймыз. Әкімшілік мас күйіндегі тұлғаларға қызмет көрсетуден бас тартуға құқылы." },
        { title: "Пікірлер кітабы", text: "Сіздің пікіріңіз біз үшін маңызды. Барлық ұсыныстар мен шағымдарды менеджерге жолдай аласыз." }
      ]
    };

    const currentList = infoTexts[currentLang] || infoTexts.RU;

    let html = `<div class="category-section"><h2 class="category-title">${getTranslation("Уголок потребителя", "Consumer Corner", "Тұтынушы бұрышы")}</h2>`;
    
    currentList.forEach((item, index) => {
      html += `
        <div class="accordion-item">
          <button class="accordion-header" data-index="${index}">
            <span>${item.title}</span>
            <span>+</span>
          </button>
          <div class="accordion-content" id="acc-${index}">
            <p>${item.text}</p>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    menuContainer.innerHTML = html;

    // Логика аккордеона с ИСПРАВЛЕНИЕМ БАГА №1 (.blur() сбрасывает серый цвет)
    document.querySelectorAll(".accordion-header").forEach(btn => {
      btn.addEventListener("click", function() {
        const idx = this.dataset.index;
        const content = document.getElementById(`acc-${idx}`);
        const isOpen = content.classList.contains("open");

        // Закрываем все
        document.querySelectorAll(".accordion-content").forEach(c => c.classList.remove("open"));
        document.querySelectorAll(".accordion-header span:last-child").forEach(s => s.textContent = "+");

        if (!isOpen) {
          content.classList.add("open");
          this.querySelector("span:last-child").textContent = "−";
        }

        // КРИТИЧЕСКИ ВАЖНО: сбрасываем фокус, чтобы кнопка не оставалась серой
        this.blur();
      });
    });
  }

  function getTranslation(ru, en, kz) {
    if (currentLang === "EN") return en;
    if (currentLang === "KZ") return kz;
    return ru;
  }
});
