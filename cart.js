const CART_KEY = 'wildera_cart_v1';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function money(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function calcTotal(cart) {
  return cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty || 1)), 0);
}

function render() {
  const cart = loadCart();
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const emptyEl = document.getElementById('cart-empty');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (!itemsEl || !totalEl || !emptyEl) return;

  if (!cart.length) {
    emptyEl.style.display = 'block';
    itemsEl.innerHTML = '';
    totalEl.textContent = money(0);
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  emptyEl.style.display = 'none';
  if (checkoutBtn) checkoutBtn.disabled = false;

  itemsEl.innerHTML = cart.map((item, idx) => {
    const img = item.image || 'images/A49A7265.jpg';
    const name = item.name || 'Item';
    const price = Number(item.price || 0);
    const qty = Number(item.qty || 1);

    return `
      <div class="cart-item">
        <img src="${img}" alt="${name}">
        <div>
          <h3>${name}</h3>
          <div class="meta">${money(price)} each</div>
        </div>
        <div class="right">
          <div class="qty">
            <button type="button" data-action="dec" data-index="${idx}">−</button>
            <span>${qty}</span>
            <button type="button" data-action="inc" data-index="${idx}">+</button>
          </div>
          <div class="meta">${money(price * qty)}</div>
          <button type="button" class="remove" data-action="remove" data-index="${idx}">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  totalEl.textContent = money(calcTotal(cart));

  itemsEl.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      const i = Number(btn.getAttribute('data-index'));
      const cartNow = loadCart();

      if (!cartNow[i]) return;

      if (action === 'inc') {
        const maxStock = Number(cartNow[i].stock || Infinity);
        const nextQty = (cartNow[i].qty || 1) + 1;
        cartNow[i].qty = Math.min(nextQty, maxStock);
      }
      if (action === 'dec') cartNow[i].qty = Math.max(1, (cartNow[i].qty || 1) - 1);
      if (action === 'remove') cartNow.splice(i, 1);

      saveCart(cartNow);
      render();
    });
  });

  if (checkoutBtn) {
    checkoutBtn.onclick = () => {
      alert('Checkout is not connected yet. Next step is Stripe or Shopify checkout.');
    };
  }
}

render();