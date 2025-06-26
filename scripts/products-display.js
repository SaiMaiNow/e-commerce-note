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
  <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
  <div class="card h-100 position-relative product-hover">

  <a href="#" class="text-decoration-none text-dark d-flex flex-column h-100 view-detail-btn product-card" data-token="${p.token}">


      <!-- Block รูปภาพ -->
      <div class="product-image position-relative overflow-hidden w-100  border rounded" style="aspect-ratio: 1 / 1;">
        <img src="${p?.image || ''}" alt="${p?.name || ''}" class="card-img-top w-100 h-100" style="object-fit: cover;">
        <button class="badge-button btn btn-danger btn-sm position-absolute top-0 start-0 m-2" style="min-height: 30px; text-transform: capitalize;">
          ${p?.subject || ''}
        </button>
      </div>

      <!-- Block รายละเอียด -->
      <div class="card-body d-flex flex-column justify-content-between">

        <!-- Block ชื่อ + รายบะเอียด -->
        <div style="margin-bottom: 0.5rem; font-family: 'Noto Sans Thai', sans-serif;">
          <h5 class="card-title text-truncate mb-0" style="height: 32px; line-height: 1.3; " title="${p?.name || ''}">
            ${p?.name || ''}
          </h5>
        <p class="card-text text-muted text-truncate-2 mb-0" style="font-size: 0.85rem; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p?.description || ''}">
          ${p?.description || ''}
        </p>
        </div>

      <!-- Block ราคา -->
      <p class="product-price text-dark fw-bold mt-auto" style="height: 30px;">
        ฿${p?.price || ''}
      </p>

      </div>
    </a>

    <!-- ปุ่ม Add to Cart -->
    <button class="btn btn-dark btn-slide-up w-100 rounded-0 add-to-cart js-add-to-cart mt-2"
            data-product-token="${p?.token}" title="Add to cart">
      Add to cart <i class="bi bi-cart"></i>
    </button>
  </div>
</div>


`;
  });

  document.querySelectorAll(".js-add-to-cart").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const productToken = e.currentTarget.getAttribute("data-product-token");
      if (!productToken) {
        console.error("No product token found");
        return;
      }
     
      let checkRes = await fetch("http://localhost:4000/api/cart/get", {
        method: "GET",
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
      }).then(() => {
        updateCartCount();
      });
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
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      const token = card.dataset.token;
      if (!token) return;
  
      sessionStorage.setItem("productToken", token);
      window.location.href = "products-detail.html";
    });
  });
  
});
