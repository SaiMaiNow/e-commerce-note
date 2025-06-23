let allProducts = [];

async function getAllProducts() {
  console.log("Fetching all products...");
  let config = {
    url: "http://localhost:4000/api/products/get-all",
    method: "GET",
    credentials: "include",
  };
  let response = await ajax(config);

  console.log("API response:", response);

  if (!response.ok) {
    console.error("Failed to fetch products:", response);
    return [];
  }
  console.log(response.products);
  return response.products;
}

function filterProducts(keyword) {
  keyword = keyword.trim().toLowerCase();

  if (!keyword) {
    return allProducts;
  }

  return allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(keyword) ||
      product.description.toLowerCase().includes(keyword) ||
      product.subject.toLowerCase().includes(keyword)
  );
}

function filterByCategory(category) {
  if (!category) {
    showProducts(allProducts);
  } else {
    const filtered = allProducts.filter(
      (p) => p.subject.toLowerCase() === category.toLowerCase()
    );
    showProducts(filtered);
  }
}

function showProducts(products) {
  const container = document.getElementById("productList");
  container.innerHTML = "";

  if (!products || products.length === 0) {
    container.innerHTML = "<p>No products found</p>";
    return;
  }

  products.forEach((p) => {
    container.innerHTML += `
      <div class="col-md-4">  <div class="card mb-4 box-shadow position-relative product-hover">
          <a href="products-detail.html?token=${p.token}" class="text-decoration-none text-dark">
              <div class="product-image">
                <img class="card-img-top" src="${p?.image}" alt="${p.name}">
                <button class="badge-button btn btn-danger btn-sm position-absolute top-0 start-0 m-2">${p.subject}</button>
              </div>
        
              <div class="card-body">
                <h5 class="card-title">${p.name}</h5>
                <p class="product-price text-danger fw-bold">฿${p.price}</p>
              </div>
          </a>
          <button class="btn btn-primary btn-slide-up w-100 rounded-0 add-to-cart js-add-to-cart" data-product-token="${p.token}" title="Add to cart">
            Add to cart <i class="bi bi-cart"></i>
          </button>
        </div>
      </div> `;
  });

  document.querySelectorAll(".js-add-to-cart").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const productToken = e.currentTarget.getAttribute("data-product-token");
      if (!productToken) {
        console.error("No product token found");
        return;
      }
      // 🔍 ตรวจสอบก่อนว่าอยู่ในตะกร้าอยู่แล้วไหม
      let checkRes = await fetch("http://localhost:4000/api/cart/get", {
        credentials: "include",
      });
      let checkData = await checkRes.json();
      if (
        checkData.ok &&
        checkData.cart.some((p) => p.token === productToken)
      ) {
        Swal.fire("สินค้าอยู่ในตะกร้าแล้ว", "", "info");
        return;
      }

      let config = {
        url: "http://localhost:4000/api/cart/add",
        method: "POST",
        credentials: "include",
        data: {
          productToken: productToken,
          quantity: 1,
        },
      };

      let response = await ajax(config);
      console.log("Add to cart request data:", config.data);

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Add to cart failed!",
          text: response.message || "Something went wrong!",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Added to cart!",
        text: response.message,
        showConfirmButton: false,
        timer: 1000,
      });
      updateCartCount();
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  allProducts = await getAllProducts();

  showProducts(allProducts);

  console.log("search input:", document.getElementById("searchInput"));

  document
    .getElementById("searchInput")
    .addEventListener("input", (e) => {
      const filtered = filterProducts(e.target.value);
      console.log(filtered);
      showProducts(filtered);
    });
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.getAttribute("data-category");
      filterByCategory(category);

      document.querySelectorAll(".category-btn").forEach((b) => {
        b.classList.remove("active");
      });

      // ✅ ใส่ active ให้ปุ่มที่กด
      btn.classList.add("active");
    });
  });
});
