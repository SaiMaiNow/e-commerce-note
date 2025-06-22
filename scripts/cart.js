const ajax = async (config) => {
  const request = await fetch(config.url, {
    method: config.method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config.data),
  });
  const response = await request.json();
  return response;
};

// cart.js หรือ cart.html
// scripts/cart.js

document.addEventListener("DOMContentLoaded", async () => {
  async function updateCartCount() {
    const cartCountSpan = document.getElementById("cart-count");
    if (!cartCountSpan) return;
  
    try {
      const res = await fetch("http://localhost:4000/api/cart/get", {
        credentials: "include",
      });
      const data = await res.json();
  
      if (data.ok && Array.isArray(data.cart)) {
        const totalItems = data.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems > 0 ? totalItems : '';
      } else {
        cartCountSpan.textContent = '';
      }
    } catch (err) {
      console.error("ไม่สามารถโหลดจำนวนตะกร้า:", err);
    }
  }
  await updateCartCount();  
  const response = await fetch("http://localhost:4000/api/cart/get", {
    credentials: "include"
  });
  const data = await response.json();

  if (!data.ok) {
    console.error("ไม่สามารถดึงข้อมูลตะกร้าได้:", data.message);
    return;
  }

  const cartItems = data.cart || [];
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const summaryItems = document.getElementById("summary-items");
  const summarySubtotal = document.getElementById("summary-subtotal");
  const summaryTotal = document.getElementById("summary-total");

  if (!cartItems.length) {
    document.getElementById("cartContainer").classList.add("d-none");
    document.getElementById("empty-cart").classList.remove("d-none");
    return;
  }

  // แสดงข้อมูล
  cartItems.forEach(item => {
    const itemTotal = item.price * item.quantity;

    cartItemsContainer.innerHTML += `
      <tr class="cart-row" data-token="${item.token}" data-price="${item.price}">
        <td class="d-flex align-items-center">
          <img src="${item.image}" width="60" class="me-3 rounded shadow-sm">
          <span class="fw-bold fs-5">${item.name}</span>
        </td>
        <td>
          <div class="input-group input-group-sm">
            <button class="btn btn-outline-secondary btn-decrease">-</button>
            <input type="number" class="form-control text-center qty-input" value="${item.quantity}" min="1">
            <button class="btn btn-outline-secondary btn-increase">+</button>
          </div>
        </td>
        <td class="fw-bold text-end">฿${itemTotal.toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-danger remove-item-btn">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });

  calculateAndUpdateSummary();

  // ฟังก์ชันคำนวณสรุปยอด
  function calculateAndUpdateSummary() {
    let subtotal = 0;
    let totalItems = 0;

    document.querySelectorAll(".cart-row").forEach(row => {
      const qty = parseInt(row.querySelector(".qty-input").value);
      const price = parseFloat(row.dataset.price);
      const itemTotal = qty * price;

      row.querySelector("td:nth-child(3)").textContent = `฿${itemTotal.toFixed(2)}`;

      subtotal += itemTotal;
      totalItems += qty;
    });

    if (cartTotal) cartTotal.textContent = `฿${subtotal.toFixed(2)}`;
    if (summarySubtotal) summarySubtotal.textContent = `฿${subtotal.toFixed(2)}`;
    if (summaryTotal) summaryTotal.textContent = `฿${subtotal.toFixed(2)}`;
    if (summaryItems) summaryItems.textContent = `฿${subtotal.toFixed(2)}`;

    const orderItemsCount = document.getElementById("order-items-count");
    if (orderItemsCount) orderItemsCount.textContent = `Items (${totalItems}):`;
  }

  // ปุ่มเพิ่มลดจำนวน (แบบ realtime)
  document.querySelectorAll(".btn-increase").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector(".qty-input");
      input.value = parseInt(input.value) + 1;
      updateCartCount();
      // calculateAndUpdateSummary();
    });
  });

  document.querySelectorAll(".btn-decrease").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector(".qty-input");
      if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
        updateCartCount();
        // calculateAndUpdateSummary();
      }
    });
  });

  // เมื่อ user พิมพ์ใน input โดยตรง
  document.querySelectorAll(".qty-input").forEach(input => {
    input.addEventListener("change", () => {
      if (parseInt(input.value) < 1) input.value = 1;
      updateCartCount();
      // calculateAndUpdateSummary();
    });
  });

  // ปุ่ม Remove
  document.querySelectorAll(".remove-item-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const row = e.target.closest(".cart-row");
      row.remove();
      updateCartCount();
      calculateAndUpdateSummary();
    });
  });

  // ปุ่ม Update
  document.getElementById("update-cart-btn").addEventListener("click", async () => {
    updateCartCount();
    calculateAndUpdateSummary();
    const newCart = [];
    document.querySelectorAll(".cart-row").forEach(row => {
      const token = row.dataset.token;
      const qty = parseInt(row.querySelector(".qty-input").value);
      newCart.push({ token, quantity: qty });
    });

    const res = await fetch("http://localhost:4000/api/cart/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: newCart }),
      credentials: "include"
    });
    const result = await res.json();

    if (result.ok) {
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: result.message,
        timer: 1500,
        showConfirmButton: false
      });
      const ajax = async (config) => {
  const request = await fetch(config.url, {
    method: config.method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config.data),
  });
  const response = await request.json();
  return response;
};

// cart.js หรือ cart.html
// scripts/cart.js

document.addEventListener("DOMContentLoaded", async () => {
  async function updateCartCount() {
    const cartCountSpan = document.getElementById("cart-count");
    if (!cartCountSpan) return;
  
    try {
      const res = await fetch("http://localhost:4000/api/cart/get", {
        credentials: "include",
      });
      const data = await res.json();
  
      if (data.ok && Array.isArray(data.cart)) {
        const totalItems = data.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems > 0 ? totalItems : '';
      } else {
        cartCountSpan.textContent = '';
      }
    } catch (err) {
      console.error("ไม่สามารถโหลดจำนวนตะกร้า:", err);
    }
  }
  await updateCartCount();  
  const response = await fetch("http://localhost:4000/api/cart/get", {
    credentials: "include"
  });
  const data = await response.json();

  if (!data.ok) {
    console.error("ไม่สามารถดึงข้อมูลตะกร้าได้:", data.message);
    return;
  }

  const cartItems = data.cart || [];
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const summaryItems = document.getElementById("summary-items");
  const summarySubtotal = document.getElementById("summary-subtotal");
  const summaryTotal = document.getElementById("summary-total");

  if (!cartItems.length) {
    document.getElementById("cartContainer").classList.add("d-none");
    document.getElementById("empty-cart").classList.remove("d-none");
    return;
  }

  // แสดงข้อมูล
  cartItems.forEach(item => {
    const itemTotal = item.price * item.quantity;

    cartItemsContainer.innerHTML += `
      <tr class="cart-row" data-token="${item.token}" data-price="${item.price}">
        <td class="d-flex align-items-center">
          <img src="${item.image}" width="60" class="me-3 rounded shadow-sm">
          <span class="fw-bold fs-5">${item.name}</span>
        </td>
        <td>
          <div class="input-group input-group-sm">
            <button class="btn btn-outline-secondary btn-decrease">-</button>
            <input type="number" class="form-control text-center qty-input" value="${item.quantity}" min="1">
            <button class="btn btn-outline-secondary btn-increase">+</button>
          </div>
        </td>
        <td class="fw-bold text-end">฿${itemTotal.toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-danger remove-item-btn">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });

  calculateAndUpdateSummary();

  // ฟังก์ชันคำนวณสรุปยอด
  function calculateAndUpdateSummary() {
    let subtotal = 0;
    let totalItems = 0;

    document.querySelectorAll(".cart-row").forEach(row => {
      const qty = parseInt(row.querySelector(".qty-input").value);
      const price = parseFloat(row.dataset.price);
      const itemTotal = qty * price;

      row.querySelector("td:nth-child(3)").textContent = `฿${itemTotal.toFixed(2)}`;

      subtotal += itemTotal;
      totalItems += qty;
    });

    if (cartTotal) cartTotal.textContent = `฿${subtotal.toFixed(2)}`;
    if (summarySubtotal) summarySubtotal.textContent = `฿${subtotal.toFixed(2)}`;
    if (summaryTotal) summaryTotal.textContent = `฿${subtotal.toFixed(2)}`;
    if (summaryItems) summaryItems.textContent = `฿${subtotal.toFixed(2)}`;

    const orderItemsCount = document.getElementById("order-items-count");
    if (orderItemsCount) orderItemsCount.textContent = `Items (${totalItems}):`;
  }

  // ปุ่มเพิ่มลดจำนวน (แบบ realtime)
  document.querySelectorAll(".btn-increase").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector(".qty-input");
      input.value = parseInt(input.value) + 1;
      // updateCartCount();
      // calculateAndUpdateSummary();
    });
  });

  document.querySelectorAll(".btn-decrease").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector(".qty-input");
      if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
        // updateCartCount();
        // calculateAndUpdateSummary();
      }
    });
  });

  // เมื่อ user พิมพ์ใน input โดยตรง
  document.querySelectorAll(".qty-input").forEach(input => {
    input.addEventListener("change", () => {
      if (parseInt(input.value) < 1) input.value = 1;
      // updateCartCount();
      // calculateAndUpdateSummary();
    });
  });

  // ปุ่ม Remove
  document.querySelectorAll(".remove-item-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const row = e.target.closest(".cart-row");
      row.remove();
      // updateCartCount();
      calculateAndUpdateSummary();
    });
  });

  // ปุ่ม Update
  document.getElementById("update-cart-btn").addEventListener("click", async () => {
    updateCartCount();
    calculateAndUpdateSummary();
    const newCart = [];
    document.querySelectorAll(".cart-row").forEach(row => {
      const token = row.dataset.token;
      const qty = parseInt(row.querySelector(".qty-input").value);
      newCart.push({ token, quantity: qty });
    });

    const res = await fetch("http://localhost:4000/api/cart/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: newCart }),
      credentials: "include"
    });
    const result = await res.json();

    if (result.ok) {
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: result.message,
        timer: 1500,
        showConfirmButton: false
      });
      updateCartCount();
    } else {
      Swal.fire("Error", result.message, "error");
    }
  });

  // ปุ่ม Checkout
  document.querySelector(".btn-primary").addEventListener("click", async () => {
    window.location.href = "payment.html";
  });
  
});

    } else {
      Swal.fire("Error", result.message, "error");
    }
  });

  // ปุ่ม Checkout
  document.querySelector(".btn-primary").addEventListener("click", async () => {
    window.location.href = "payment.html";
  });
  
});
