// Utility ajax function
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
  return await request.json();
};

// Update cart count in header
async function updateCartCount() {
  const cartCountSpan = document.getElementById("cart-count");
  if (!cartCountSpan) return;

  try {
    const res = await fetch("http://localhost:4000/api/cart/get", {
      credentials: "include",
    });
    const data = await res.json();
    cartCountSpan.textContent = data.ok && Array.isArray(data.cart) && data.cart.length > 0
      ? data.cart.length
      : '';
  } catch (err) {
    console.error("Failed to load cart count:", err);
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
  await updateCartCount();

  const params = new URLSearchParams(window.location.search);
  const productToken = params.get("token");

  if (!productToken) {
    Swal.fire("Error", "ไม่พบสินค้า", "error").then(() => {
      window.location.href = "index.html";
    });
    return;
  }

  try {
    const productRes = await fetch("http://localhost:4000/api/products/get-all", {
      credentials: "include",
    });
    const productData = await productRes.json();

    if (!productData.ok || !Array.isArray(productData.products)) {
      Swal.fire("Error", productData.message || "โหลดข้อมูลสินค้าไม่สำเร็จ", "error").then(() => {
        window.location.href = "index.html";
      });
      return;
    }

    const product = productData.products.find(p => p.token === productToken);

    if (!product) {
      Swal.fire("Error", "ไม่พบสินค้า", "error").then(() => {
        window.location.href = "index.html";
      });
      return;
    }

    // 🎯 แสดงข้อมูลสินค้า
    document.querySelector(".img-fluid").src = product.image || "https://placehold.co/350x225";
    document.querySelector(".img-fluid").alt = product.name;
    document.querySelector("h4.fw-bold").textContent = product.name;
    document.querySelector(".text-dark").textContent = product.description;
    document.querySelector(".col-md-7 h4.fw-bold").textContent = product.name;

    document.querySelector('.writer').textContent = product.username || "ผู้ขายไม่ระบุ";

    // ราคาสินค้า
    document.querySelector(".price-value").textContent = product.price;

    // หมวดวิชา
    const subjectEl = document.querySelector(".mb-1 strong");
    if (subjectEl) subjectEl.textContent = `หมวดวิชา: ${product.subject}`;

    
    
    const addToCartBtn = document.querySelector(".js-add-to-cart");
    addToCartBtn.dataset.productToken = product.token;

    addToCartBtn.addEventListener("click", async (e) => {
      const token = e.currentTarget.dataset.productToken;
      if (!token) return;

      const checkRes = await fetch("http://localhost:4000/api/cart/get", {
        credentials: "include"
      });
      const checkData = await checkRes.json();

      if (checkData.ok && checkData.cart.some(p => p.token === token)) {
        Swal.fire("สินค้าอยู่ในตะกร้าแล้ว", "", "info");
        return;
      }

      const config = {
        url: "http://localhost:4000/api/cart/add",
        method: "POST",
        data: {
          productToken: token,
          quantity: 1
        }
      };

      const res = await ajax(config);
      if (!res.ok) {
        Swal.fire("ผิดพลาด", res.message || "เพิ่มลงตะกร้าไม่สำเร็จ", "error");
        return;
      }

      Swal.fire({
        icon: "success",
        title: "เพิ่มลงตะกร้าแล้ว!",
        text: res.message,
        showConfirmButton: false,
        timer: 1000
      });

      updateCartCount();
    });

  } catch (error) {
    console.error("Error fetching product details:", error);
    Swal.fire("Error", "เกิดข้อผิดพลาดในการโหลดสินค้า", "error").then(() => {
      window.location.href = "index.html";
    });
  }
});
