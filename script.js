// ===== STATE =====
let allMenuItems = [];
let cart = [];
let currentFilter = 'all';
let _qtyTimers = {};

// ===== MATH HELPERS =====
function roundPrice(n) {
  return Math.round(n * 100) / 100;
}

function getCartTotal() {
  return roundPrice(cart.reduce((sum, item) => sum + item.price * item.qty, 0));
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

// ===== CART FUNCTIONS =====
function bumpCartIcon() {
  const toggle = document.querySelector('.cart-toggle');
  if (!toggle) return;
  toggle.classList.remove('bump');
  void toggle.offsetWidth;
  toggle.classList.add('bump');
}

async function addToCart(itemId) {
  const existing = cart.find(c => c.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    const menu = allMenuItems.find(m => m.id === itemId);
    if (menu) cart.push({ id: menu.id, name: menu.name, price: menu.price, image: menu.image, qty: 1 });
  }
  renderCart();
  renderMenu(currentFilter);
  bumpCartIcon();
  openCart();

  requestAnimationFrame(() => {
    const btn = document.querySelector(`[onclick="addToCart(${itemId})"]`);
    if (btn) {
      btn.textContent = 'Added!';
      btn.classList.add('in-cart');
      setTimeout(() => {
        btn.textContent = `In Cart (${cart.find(c => c.id === itemId)?.qty || 1})`;
      }, 600);
    }
  });

  try {
    cart = await CartService.addItem(itemId, 1);
    renderCart();
    renderMenu(currentFilter);
  } catch (err) {
    handleApiError(err);
  }
}

async function removeFromCart(itemId) {
  cart = cart.filter(c => c.id !== itemId);
  renderCart();
  renderMenu(currentFilter);

  try {
    cart = await CartService.removeItem(itemId);
    renderCart();
    renderMenu(currentFilter);
  } catch (err) {
    handleApiError(err);
  }
}

async function updateQty(itemId, delta) {
  const item = cart.find(c => c.id === itemId);
  if (!item) return;
  const newQty = Math.max(1, item.qty + delta);
  if (newQty === item.qty) return;
  item.qty = newQty;
  renderCart();
  renderMenu(currentFilter);

  clearTimeout(_qtyTimers[itemId]);
  _qtyTimers[itemId] = setTimeout(async () => {
    try {
      cart = await CartService.updateQty(itemId, newQty);
      renderCart();
      renderMenu(currentFilter);
    } catch (err) {
      handleApiError(err);
    }
  }, 300);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  if (sidebar.classList.contains('open')) {
    closeCart();
  } else {
    openCart();
  }
}

function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('show');
  document.body.style.overflow = '';
}

async function checkout() {
  if (cart.length === 0) return;
  const user = JSON.parse(localStorage.getItem('cafe_session') || 'null');
  if (!user) {
    closeCart();
    alert('Please login to place an order.');
    window.location.href = 'login.html';
    return;
  }
  localStorage.setItem('cafe_cart', JSON.stringify(cart));
  closeCart();
  window.location.href = 'checkout.html';
}

function renderCart() {
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
    totalEl.textContent = '$0.00';
    updateCartBadge();
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}" />
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        <div class="cart-item-qty">
          <button onclick="updateQty(${item.id}, -1)">-</button>
          <span>${item.qty}</span>
          <button onclick="updateQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">&times;</button>
    </div>
  `).join('');

  totalEl.textContent = `$${getCartTotal().toFixed(2)}`;
  updateCartBadge();
}

// ===== MENU RENDERING =====
function renderMenu(filter) {
  const grid = document.getElementById('menu-grid');
  const items = filter === 'all'
    ? allMenuItems
    : allMenuItems.filter(item => item.categoryId === filter);

  grid.innerHTML = items.map(item => {
    const inCart = cart.find(c => c.id === item.id);
    return `
    <div class="menu-item">
      <img class="menu-item-img" src="${item.image}" alt="${item.name}" loading="lazy" />
      <div class="menu-item-body">
        <div class="menu-item-info">
          ${item.badge ? `<span class="menu-item-badge">${item.badge}</span>` : ''}
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </div>
        <div class="menu-item-price">$${item.price.toFixed(2)}</div>
      </div>
      <div class="menu-item-footer">
        ${inCart
          ? `<button class="add-to-cart-btn in-cart" onclick="addToCart(${item.id})">In Cart (${inCart.qty})</button>`
          : `<button class="add-to-cart-btn" onclick="addToCart(${item.id})">Add to Cart</button>`
        }
      </div>
    </div>`;
  }).join('');
}

async function filterMenu(category) {
  currentFilter = category;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === category || (category === 'all' && btn.textContent === 'All'));
  });
  renderMenu(category);
}

// ===== INIT =====
async function init() {
  try {
    const data = await MenuService.getAll();
    allMenuItems = data.items || data;
  } catch {
    allMenuItems = [];
  }
  try {
    cart = await CartService.get();
  } catch {
    cart = [];
  }
  renderMenu('all');
  renderCart();
  updateCartBadge();
}

init();
