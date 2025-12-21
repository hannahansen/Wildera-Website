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
  // Handle Stripe return flags (optional but nice)
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success');
  const canceled = params.get('canceled');

  if (success === '1') {
    saveCart([]);
    window.history.replaceState({}, document.title, window.location.pathname);
    alert('Payment successful! Thank you for your order.');
  } else if (canceled === '1') {
    window.history.replaceState({}, document.title, window.location.pathname);
    alert('Checkout canceled. Your cart is saved.');
  }

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
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Checkout';
    }
    return;
  }

  emptyEl.style.display = 'none';
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = 'Checkout';
  }

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
    checkoutBtn.onclick = async () => {
      const apiUrl = window.WILDERA_CHECKOUT_API_URL;

      if (!apiUrl || String(apiUrl).includes('YOUR-VERCEL-PROJECT')) {
        alert('Checkout API is not configured yet. Set WILDERA_CHECKOUT_API_URL in cart.html.');
        return;
      }

      const cartNow = loadCart();

      // Require Stripe price IDs on cart items
      const missing = cartNow.find(i => !i || !i.stripePriceId);
      if (missing) {
        alert(
          'One or more cart items are missing a Stripe price ID.\n\n' +
          'Fix: make sure each product has data-stripe-price-id, and your add-to-cart code saves it as stripePriceId in localStorage.'
        );
        return;
      }

      const items = cartNow.map(i => ({
        priceId: String(i.stripePriceId),
        quantity: Math.max(1, Math.min(99, Number(i.qty || 1)))
      }));

      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Redirecting to checkout…';

      try {
        const resp = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        });

        const data = await resp.json().catch(() => ({}));

        if (!resp.ok) {
          throw new Error(data?.error || `Checkout failed (${resp.status})`);
        }

        if (!data?.url) {
          throw new Error('Checkout failed: missing redirect URL.');
        }

        window.location.href = data.url;
      } catch (err) {
        alert('Checkout error: ' + (err?.message || err));
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Checkout';
      }
    };
  }
}

render();