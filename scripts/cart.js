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

async function check(){
  console.log("check function called");
  let config = {
    url: 'http://localhost:4000/api/signin/check',
    method: 'GET',
  }

  let response = await ajax(config);
  console.log(response);
  // console.log(response.user);

  if (!response.ok) {
    Swal.fire({
      icon: "error",
      title: "Please Signin",
      text: response.message,
      showConfirmButton: true
    }).then(() => {
      window.location.href = '/signin.html'; 
    });
    return;
  } 
    
}

document.querySelectorAll('.logout-link').forEach(link => {
  link.addEventListener('click', async function (e) {
    e.preventDefault();

    console.log("logout function called");
    let config = {
      url: 'http://localhost:4000/api/signin/logout',
      method: 'POST',
    }

    let response = await ajax(config);

    if (!response.ok) {
      Swal.fire({
        icon: "error",
        title: "Logout failed!",
        text: response.message || "Something went wrong!",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Logout success!",
      text: response.message,
      showConfirmButton: false,
      timer: 1000
    }).then(() => {
      window.location.href = 'index.html'; 
    });
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  check();
  async function updateCartCount() {
    const cartCountSpan = document.getElementById("cart-count");
    if (!cartCountSpan) return;

    try {
      const res = await fetch("http://localhost:4000/api/cart/get", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.cart)) {
        const totalItems = data.cart.length;
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

  if (!cartItems.length) {
    document.getElementById("cartContainer").classList.add("d-none");
    document.getElementById("empty-cart").classList.remove("d-none");
    return;
  }

  // แสดงข้อมูล
  cartItems.forEach(item => {
    cartItemsContainer.innerHTML += `
      <tr class="cart-row" data-token="${item.token}" data-price="${item.price}">
        <td class="d-flex align-items-center">
          <img src="${item.image}" width="60" class="me-3 rounded shadow-sm">
          <span class="fw-bold fs-5">${item.name}</span>
        </td>
        <td class="text-center">1</td> <!-- Fixed Quantity -->
        <td class="fw-bold text-end">฿${item.price.toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-danger remove-item-btn">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  updateSummary();
  
  function updateSummary() {
    const summarySubtotal = document.getElementById("summary-subtotal");
    const summaryTotal = document.getElementById("summary-total");
    const orderItemsCount = document.getElementById("order-items-count");
  
    let subtotal = 0;
    let totalItems = 0;
  
    document.querySelectorAll(".cart-row").forEach(row => {
      subtotal += parseFloat(row.dataset.price);
      totalItems += 1;
    });
  
    const formatted = `฿${subtotal.toFixed(2)}`;
    if (summarySubtotal) summarySubtotal.textContent = formatted;
    if (summaryTotal) summaryTotal.textContent = formatted;
    if (orderItemsCount) orderItemsCount.textContent = `Items (${totalItems}):`;
  }
  
  

  document.querySelectorAll(".remove-item-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const row = e.target.closest(".cart-row");
      row.remove();
      updateCartCount();
      updateSummary();
    });
  });

  document.getElementById("update-cart-btn").addEventListener("click", async () => {
    const newCart = [];
    document.querySelectorAll(".cart-row").forEach(row => {
      const token = row.dataset.token;
      newCart.push({ token });
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

  document.querySelector(".btn-primary").addEventListener("click", async () => {
    window.location.href = "payment.html";
  });
});

