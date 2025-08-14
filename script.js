// aR's cookies — interaktivitas situs
// Tema, slider, produk, keranjang, checkout, animasi reveal, audio FAB

// Utils
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const rupiah = (n) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

// Theme toggle (persist to localStorage)
const root = document.documentElement;
const themeToggle = $('#themeToggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') root.classList.add('dark');
themeToggle.addEventListener('click', () => {
  root.classList.toggle('dark');
  localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
});

// Year
$('#year').textContent = new Date().getFullYear();

// Intersection Observer for reveal animations
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('active');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
$$('.reveal').forEach(el => io.observe(el));

// Slider
const sliderEl = $('[data-slider]');
const slides = $$('.slide', sliderEl);
const dotsWrap = $('.dots', sliderEl);
let current = 0; let timer;
function go(i) {
  slides[current].classList.remove('is-active');
  dotsWrap.children[current].classList.remove('active');
  current = (i + slides.length) % slides.length;
  slides[current].classList.add('is-active');
  dotsWrap.children[current].classList.add('active');
}
slides.forEach((_, i) => {
  const b = document.createElement('button');
  if (i === 0) b.classList.add('active');
  b.addEventListener('click', () => { go(i); resetAuto(); });
  dotsWrap.appendChild(b);
});
$('.prev', sliderEl).addEventListener('click', () => { go(current - 1); resetAuto(); });
$('.next', sliderEl).addEventListener('click', () => { go(current + 1); resetAuto(); });
function auto() { timer = setInterval(() => go(current + 1), 4000); }
function resetAuto() { clearInterval(timer); auto(); }
auto();

// Products (sample catalog)
const products = [
  { id: 'choco', title: 'Chocolate Chip Classic', price: 28000, img: 'https://images.unsplash.com/photo-1568051243858-89791d75b30f?q=80&w=1200&auto=format&fit=crop' },
  { id: 'double', title: 'Double Choco Fudge', price: 32000, img: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=1200&auto=format&fit=crop' },
  { id: 'almond', title: 'Almond Crunch', price: 30000, img: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?q=80&w=1200&auto=format&fit=crop' },
  { id: 'redvelvet', title: 'Red Velvet Cream', price: 34000, img: 'https://images.unsplash.com/photo-1607932915550-d8780a235c5b?q=80&w=1200&auto=format&fit=crop' },
  { id: 'matcha', title: 'Matcha White Choco', price: 33000, img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop' },
  { id: 'oat', title: 'Oatmeal Raisins', price: 26000, img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1200&auto=format&fit=crop' },
];

const productGrid = $('#productGrid');
products.forEach(p => {
  const card = document.createElement('div');
  card.className = 'product card reveal';
  card.innerHTML = `
    <div class="product__img"><img src="${p.img}" alt="${p.title}"></div>
    <div class="product__meta">
      <h5 class="product__title">${p.title}</h5>
      <div class="product__price">${rupiah(p.price)}</div>
      <div class="product__actions">
        <div class="qty" data-id="${p.id}">
          <button class="decr" aria-label="Kurangi">−</button>
          <span class="val">1</span>
          <button class="incr" aria-label="Tambah">+</button>
        </div>
        <button class="btn btn--primary add" data-id="${p.id}">Tambah</button>
      </div>
    </div>
  `;
  productGrid.appendChild(card);
  io.observe(card);
});

// Quantity handlers
productGrid.addEventListener('click', (e) => {
  const q = e.target.closest('.qty'); if (!q) return;
  const val = $('.val', q); let v = parseInt(val.textContent,10);
  if (e.target.classList.contains('incr')) v++;
  if (e.target.classList.contains('decr')) v = Math.max(1, v-1);
  val.textContent = v;
});
productGrid.addEventListener('click', (e) => {
  if (!e.target.classList.contains('add')) return;
  const id = e.target.dataset.id;
  const qty = parseInt($('.val', e.target.closest('.product__meta')).textContent, 10);
  addToCart(id, qty);
  $('#cartButton').click();
});

// Cart state
const CART_KEY = 'ars-cart';
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartUI(); }
function addToCart(id, qty=1) {
  const prod = products.find(p => p.id === id);
  const item = cart.find(i => i.id === id);
  if (item) item.qty += qty;
  else cart.push({ id, qty, price: prod.price, title: prod.title, img: prod.img });
  saveCart();
}
function removeFromCart(id) { cart = cart.filter(i => i.id !== id); saveCart(); }
function setQty(id, qty) { const it = cart.find(i => i.id === id); if (it) { it.qty = Math.max(1, qty); saveCart(); } }
function subtotal() { return cart.reduce((s,i)=>s+i.qty*i.price,0); }

// Cart drawer UI
const cartBtn = $('#cartButton');
const cartDrawer = $('#cartDrawer');
const closeCart = $('#closeCart');
const cartItems = $('#cartItems');
const cartSubtotal = $('#cartSubtotal');
const cartCount = $('#cartCount');
const checkoutBtn = $('#checkoutBtn');

function updateCartUI() {
  cartItems.innerHTML = '';
  cart.forEach(i => {
    const div = document.createElement('div');
    div.className = 'cart__item';
    div.innerHTML = `
      <img src="${i.img}" alt="${i.title}">
      <div>
        <div class="title">${i.title}</div>
        <div class="price">${rupiah(i.price)} × 
          <button class="btn--ghost" data-act="decr" data-id="${i.id}">−</button>
          <strong>${i.qty}</strong>
          <button class="btn--ghost" data-act="incr" data-id="${i.id}">+</button>
        </div>
      </div>
      <div>
        <div><strong>${rupiah(i.qty*i.price)}</strong></div>
        <button class="btn btn--ghost" data-act="remove" data-id="${i.id}">Hapus</button>
      </div>
    `;
    cartItems.appendChild(div);
  });
  cartSubtotal.textContent = rupiah(subtotal());
  cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);
}
updateCartUI();

cartItems.addEventListener('click', (e)=>{
  const act = e.target.dataset.act; if (!act) return;
  const id = e.target.dataset.id;
  const it = cart.find(i=>i.id===id);
  if (!it) return;
  if (act === 'incr') it.qty++;
  if (act === 'decr') it.qty = Math.max(1, it.qty-1);
  if (act === 'remove') removeFromCart(id);
  saveCart();
});

cartBtn.addEventListener('click', () => { cartDrawer.classList.add('open'); });
closeCart.addEventListener('click', () => { cartDrawer.classList.remove('open'); });
checkoutBtn.addEventListener('click', () => { cartDrawer.classList.remove('open'); });

// Checkout (simulation)
$('#checkoutForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (cart.length === 0) {
    alert('Keranjangmu masih kosong. Tambah produk dulu ya!');
    return;
  }
  const form = new FormData(e.currentTarget);
  const payload = {
    orderId: 'INV-' + Math.random().toString(36).slice(2,8).toUpperCase(),
    items: cart,
    subtotal: subtotal(),
    customer: {
      name: form.get('name'), email: form.get('email'),
      address: form.get('address'), payment: form.get('payment'), note: form.get('note')
    },
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('ars-last-order', JSON.stringify(payload));
  cart = []; saveCart();
  e.currentTarget.reset();
  alert('Terima kasih! Pesanan kamu tercatat.
ID Pesanan: ' + payload.orderId);
});

// Audio background controller (user gesture to play)
const audio = $('#bg-audio');
const audioFab = $('#audioFab');
let isPlaying = false;
audioFab.addEventListener('click', async () => {
  try {
    if (!isPlaying) { await audio.play(); isPlaying = true; audioFab.textContent = '⏸'; }
    else { audio.pause(); isPlaying = false; audioFab.textContent = '♫'; }
  } catch (err) {
    console.warn('Audio cannot be played automatically:', err);
  }
});

// Accessibility: close cart on Escape
addEventListener('keydown', (e)=>{ if (e.key === 'Escape') cartDrawer.classList.remove('open'); });
