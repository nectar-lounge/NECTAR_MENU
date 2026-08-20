const categories = [...new Set(MENU.map(x => x.category))];
const root = document.getElementById('menuRoot');
const bar = document.getElementById('categoryBar');
const search = document.getElementById('searchInput');
const modal = document.getElementById('modal');

const slug = s => s.toLowerCase().replace(/[^а-яa-z0-9]+/gi,'-').replace(/^-|-$/g,'');

bar.innerHTML = categories.map((c,i)=>`<a href="#${slug(c)}" data-cat="${i===0?'active':''}">${c}</a>`).join('');

function money(n){ return new Intl.NumberFormat('ru-RU').format(n).replace(/\u00a0/g,' ') + ' ₸'; }

function render(query=''){
  const q = query.trim().toLowerCase();
  let visible = 0;
  root.innerHTML = categories.map((cat, ci)=>{
    const items = MENU.filter(x=>x.category===cat && (!q || (x.name+' '+x.category+' '+x.composition).toLowerCase().includes(q)));
    if(!items.length) return '';
    visible += items.length;
    return `<section class="menu-section" id="${slug(cat)}">
      <h2 class="section-title"><span class="diamond"></span>${cat}</h2>
      <div class="grid">${items.map(item=>{
        const info = item.weight || item.composition || item.note;
        return `<article class="item ${info?'has-info':''}" data-id="${item.id}">
          <div class="item-top"><div class="item-name">${item.name}</div><div class="price">${money(item.price)}</div></div>
          ${item.weight?`<div class="meta"><span>Выход ${item.weight}</span></div>`:''}
        </article>`
      }).join('')}</div>
    </section>`
  }).join('') || `<div class="empty">Ничего не найдено</div>`;

  root.querySelectorAll('.item').forEach(el=>el.addEventListener('click',()=>openItem(el.dataset.id)));
  document.querySelectorAll('.category-bar a').forEach(a=>a.style.display = q ? 'none' : '');
}

function openItem(id){
  const x = MENU.find(i=>i.id===id); if(!x) return;
  document.getElementById('modalCategory').textContent=x.category;
  document.getElementById('modalTitle').textContent=x.name;
  document.getElementById('modalPrice').textContent=money(x.price);
  document.getElementById('modalWeight').textContent=x.weight || 'Уточняется';
  document.getElementById('modalComposition').textContent=x.composition || 'Состав уточняется';
  const note=document.getElementById('modalNote');
  note.textContent=x.note || '';
  note.style.display=x.note?'block':'none';
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';}
modal.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click',closeModal));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
search.addEventListener('input',e=>render(e.target.value));
document.getElementById('allBtn').addEventListener('click',()=>{search.value='';render();window.scrollTo({top:0,behavior:'smooth'})});

// Эти ссылки можно заменить позже — сам сайт и QR при этом менять не придётся.
const LINKS = {
  telegram: '#',
  map: '#',
  phone: '#'
};
document.getElementById('telegramLink').href=LINKS.telegram;
document.getElementById('mapLink').href=LINKS.map;
document.getElementById('phoneLink').href=LINKS.phone;

render();
