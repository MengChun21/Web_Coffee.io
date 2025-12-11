/* Extracted from Index.Html - custom JS */
(function () {
  // Mobile search button: expand the collapsed navbar and focus the search input
  var mobileSearchBtn = document.getElementById("mobileSearchBtn");
  if (!mobileSearchBtn) return;
  mobileSearchBtn.addEventListener("click", function () {
    var collapseEl = document.getElementById("navbarNavDropdown");
    if (!collapseEl) return;
    var bsCollapse =
      bootstrap.Collapse.getInstance(collapseEl) ||
      new bootstrap.Collapse(collapseEl, { toggle: false });
    if (!collapseEl.classList.contains("show")) bsCollapse.show();
    // Focus search input if present
    var input = collapseEl.querySelector("#mainSearchInput");
    if (input)
      setTimeout(function () {
        input.focus();
      }, 200);
  });
})();

(function () {
  // Initialize carousel with interval and pause on hover
  var hero = document.getElementById("heroCarousel");
  if (!hero) return;
  var carInstance =
    bootstrap.Carousel.getInstance(hero) ||
    new bootstrap.Carousel(hero, {
      interval: 5000,
      pause: "hover",
      ride: "carousel",
    });
})();

(function () {
  // Close collapsed navbar on nav link anchor click (mobile UX improvement)
  var navbarCollapse = document.getElementById("navbarNavDropdown");
  if (!navbarCollapse) return;
  var navLinks = navbarCollapse.querySelectorAll('a.nav-link[href^="#"]');
  navLinks.forEach(function (a) {
    a.addEventListener("click", function () {
      // If collapsed navbar is open, hide it
      var bsCollapse =
        bootstrap.Collapse.getInstance(navbarCollapse) ||
        new bootstrap.Collapse(navbarCollapse, { toggle: false });
      if (navbarCollapse.classList.contains("show")) bsCollapse.hide();
    });
  });
})();

(function () {
  // Make the input icon submit the form when clicked and handle keyboard interaction (Enter/Space)
  var icon = document.querySelector(".input-icon");
  if (!icon) return;
  icon.addEventListener("click", function () {
    var form = document.getElementById("headerSearchForm");
    if (form) form.submit();
  });
  icon.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      var form = document.getElementById("headerSearchForm");
      if (form) form.submit();
    }
  });
})();

/* Back to top logic was removed: footer element is not present */

(function () {
  // Simple client-side cart using localStorage (key: gb_cart)
  var CART_KEY = "gb_cart";

  function getCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function formatPrice(n) {
    return "$" + Number(n).toFixed(2);
  }

  function updateCartCount() {
    var cart = getCart();
    var count = Object.values(cart).reduce(function (sum, it) {
      return sum + it.qty;
    }, 0);
    var badge = document.getElementById("cartCount");
    var mobileCount = document.getElementById("mobileCartCount");
    if (badge) {
      if (count > 0) {
        badge.style.display = "inline-block";
        badge.textContent = count;
      } else {
        badge.style.display = "none";
      }
    }
    if (mobileCount) {
      mobileCount.textContent = count > 0 ? "(" + count + ")" : "";
    }
  }

  function addToCart(item) {
    var cart = getCart();
    if (!cart[item.id])
      cart[item.id] = {
        id: item.id,
        name: item.name,
        price: Number(item.price),
        qty: 0,
      };
    cart[item.id].qty += item.qty || 1;
    saveCart(cart);
    updateCartCount();
  }

  function renderCartItems() {
    var cart = getCart();
    var tbody = document.getElementById("cartItems");
    var totalEl = document.getElementById("cartTotal");
    if (!tbody) return;
    tbody.innerHTML = "";
    var total = 0;
    Object.keys(cart).forEach(function (id) {
      var it = cart[id];
      var subtotal = it.price * it.qty;
      total += subtotal;
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" +
        '<div class="d-flex align-items-center"><div class="me-3"><strong>' +
        it.name +
        "</strong></div></div></td>" +
        '<td class="text-end">' +
        formatPrice(it.price) +
        "</td>" +
        '<td class="text-center">' +
        '<div class="input-group input-group-sm d-inline-flex">' +
        '<button class="btn btn-outline-secondary btn-decrease" data-id="' +
        id +
        '">-</button>' +
        '<input type="text" readonly class="form-control text-center cart-qty" value="' +
        it.qty +
        '" style="width:48px;">' +
        '<button class="btn btn-outline-secondary btn-increase" data-id="' +
        id +
        '">+</button>' +
        "</div></td>" +
        '<td class="text-end">' +
        formatPrice(subtotal) +
        "</td>" +
        '<td class="text-end"><button class="btn btn-sm btn-link text-danger btn-remove" data-id="' +
        id +
        '">Remove</button></td>';
      tbody.appendChild(tr);
    });
    if (totalEl) totalEl.textContent = formatPrice(total);

    // attach handlers
    tbody.querySelectorAll(".btn-increase").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        var cart = getCart();
        cart[id].qty += 1;
        saveCart(cart);
        renderCartItems();
        updateCartCount();
      });
    });
    tbody.querySelectorAll(".btn-decrease").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        var cart = getCart();
        if (cart[id].qty > 1) cart[id].qty -= 1;
        else delete cart[id];
        saveCart(cart);
        renderCartItems();
        updateCartCount();
      });
    });
    tbody.querySelectorAll(".btn-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        var cart = getCart();
        delete cart[id];
        saveCart(cart);
        renderCartItems();
        updateCartCount();
      });
    });
  }

  // Bind add-to-cart buttons
  document.querySelectorAll(".add-to-cart").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      var id = btn.getAttribute("data-id");
      var name =
        btn.getAttribute("data-name") ||
        btn
          .closest(".product-card")
          ?.querySelector(".product-title")
          ?.textContent.trim();
      var price =
        btn.getAttribute("data-price") ||
        btn
          .closest(".product-card")
          ?.querySelector("strong")
          ?.textContent.replace(/[^0-9.-]+/g, "");
      addToCart({ id: id, name: name, price: price, qty: 1 });
      // show small feedback
      btn.textContent = "Added";
      setTimeout(function () {
        btn.textContent = "Buy";
      }, 900);
    });
  });

  var cartModalEl = document.getElementById("cartModal");
  var cartModal = cartModalEl
    ? new bootstrap.Modal(cartModalEl, { keyboard: true })
    : null;
  var cartBtn = document.getElementById("cartBtn");
  if (cartBtn) {
    cartBtn.addEventListener("click", function () {
      renderCartItems();
      if (cartModal) cartModal.show();
    });
  }
  var mobileCartLink = document.getElementById("mobileCartLink");
  if (mobileCartLink) {
    mobileCartLink.addEventListener("click", function (e) {
      e.preventDefault();
      renderCartItems();
      if (cartModal) cartModal.show();
    });
  }

  var checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      // Placeholder: real site would call backend API
      alert("Checkout is a demo here. Implement backend to process orders.");
      localStorage.removeItem(CART_KEY);
      updateCartCount();
      renderCartItems();
      if (cartModal) cartModal.hide();
    });
  }

  // Init
  updateCartCount();
})();
