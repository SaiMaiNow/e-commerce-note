async function getMyProducts() {
  console.log("Fetching my products...");
  let config = {
    url: "http://localhost:4000/api/profile",
    method: "GET",
  };
  let response = await ajax(config);

  console.log("API response:", response);

  if (!response.ok) {
    console.error("Failed to fetch products:", response);
    return [];
  }
  return response.myproduct;
}

async function showMyOrders() {
  document.getElementById("section-title").textContent = "My Orders";

  const response = await ajax({
    url: "http://localhost:4000/api/profile",
    method: "GET",
  });

  console.log("My Orders Response:", response);

  const orders = response.myorder;
  const container = document.getElementById("myProductsContainer");
  container.innerHTML = "";
  document.getElementById("no-products-message-order").classList.add("d-none");

  if (!orders || orders.length === 0) {
    document.getElementById("no-products-message").classList.add("d-none"); // ซ่อนอันเก่า
  document.getElementById("no-products-message-order").classList.remove("d-none");
  container.classList.add("d-none");
  return;
  }

  orders.forEach((p) => {
    container.innerHTML += `
<div class="col-sm-6 col-md-4 col-lg-3 mb-4">
  <div class="card h-100 position-relative product-hover">

    
      <!-- Block รูปภาพ -->
      <div class="product-image position-relative overflow-hidden w-100" style="aspect-ratio: 1 / 1;">
        <img src="${p?.image || ''}" alt="${p?.name || ''}" class="card-img-top w-100 h-100" style="object-fit: cover;">
        <button class="badge-button btn btn-danger btn-sm position-absolute top-0 start-0 m-2" style="min-height: 30px; text-transform: capitalize;">
          ${p?.subject || ''}
        </button>
      </div>

      <!-- Block รายละเอียด -->
      <div class="card-body d-flex flex-column justify-content-between">

        <!-- Block ชื่อ + รายบะเอียด -->
        <div style="margin-bottom: 0.5rem; font-family: 'Noto Sans Thai', sans-serif;">
          <h5 class="card-title text-truncate mb-0" style="height: 32px; line-height: 1.3;" title="${p?.name || ''}">
            ${p?.name || ''}
          </h5>
        <p class="card-text text-muted text-truncate-2 mb-0" style="font-size: 0.85rem; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p?.description || ''}">
          ${p?.description || ''}
        </p>
        </div>


        <!-- Block ราคา -->
        <p class="product-price text-dark fw-bold mt-auto mb-2" style="height: 30px;">
          ฿${p?.price || ''}
        </p>

      </div>


      <div class="d-flex justify-content-center mt-auto px-3 pb-3 ">
        <a href="${p.file}" download 
          class="btn btn-success w-100 py-2 rounded-3 shadow-sm transition-all"
          style="font-family: 'Noto Sans Thai', sans-serif; font-size: 0.95rem;">
          <i class="bi bi-download me-1"></i> ดาวน์โหลดชีท
        </a>
      </div>


      `;
  });
  
  document.getElementById("no-products-message").classList.add("d-none");
  document.getElementById("no-products-message-order").classList.add("d-none");
  container.classList.remove("d-none");
}


const showMyProducts = async function () {
  document.getElementById("section-title").textContent = "My Products";
  const products = await getMyProducts();
  const container = document.getElementById("myProductsContainer");
  container.innerHTML = "";
  document.getElementById("no-products-message").classList.add("d-none");

  if (!products || products.length === 0) {
    document.getElementById("no-products-message-order").classList.add("d-none"); 
    document.getElementById("no-products-message").classList.remove("d-none");
    document.getElementById("myProductsContainer").classList.add("d-none");
    return;
  }
  console.log(products);

  const secretKey = "mySecret123";

    function encryptToken(token) {
      return CryptoJS.AES.encrypt(token, secretKey).toString();
    }

  products.forEach((p) => {
    const encrypted = encryptToken(p.token);

    container.innerHTML += `

<div class="col-sm-6 col-md-4 col-lg-3 mb-4">
  <div class="card h-100 position-relative product-hover">

    
      <!-- Block รูปภาพ -->
      <div class="product-image position-relative overflow-hidden w-100 border rounded" style="aspect-ratio: 1 / 1;">
        <img src="${p?.image || ''}" alt="${p?.name || ''}" class="card-img-top w-100 h-100" style="object-fit: cover;">
        <button class="badge-button btn btn-danger btn-sm position-absolute top-0 start-0 m-2" style="min-height: 30px; text-transform: capitalize;">
          ${p?.subject || ''}
        </button>
      </div>

      <!-- Block รายละเอียด -->
      <div class="card-body d-flex flex-column justify-content-between">

        <!-- Block ชื่อ + รายบะเอียด -->
        <div style="margin-bottom: 0.5rem; font-family: 'Noto Sans Thai', sans-serif;">
          <h5 class="card-title text-truncate mb-0" style="height: 32px; line-height: 1.3;" title="${p?.name || ''}">
            ${p?.name || ''}
          </h5>
        <p class="card-text text-muted text-truncate-2 mb-0" style="font-size: 0.85rem; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p?.description || ''}">
          ${p?.description || ''}
        </p>
        </div>


        <!-- Block ราคา -->
        <p class="product-price text-dark fw-bold mt-auto mb-2" style="height: 30px;">
          ฿${p?.price || ''}
        </p>

      </div>


        <!-- ปุ่ม Edit/Delete -->
        <div class="d-flex mt-auto mb-3 justify-content-center">
          <a href="product-edit.html?code=${encodeURIComponent(encrypted)}" class="btn btn-sm btn-outline-primary flex-fill px-4 mx-2">
            <i class="bi bi-pencil"></i> Edit
          </a>
          <button type="button" class="btn btn-sm btn-outline-danger flex-fill px-4 mx-2 delete-product-btn" data-token="${p.token}" data-name="${p.name}">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>


      `;
  });

  document.getElementById("no-products-message").classList.add("d-none"); // ซ่อนอันนี้ด้วย ถ้ามี product แล้ว
  document.getElementById("no-products-message-order").classList.add("d-none");
  container.classList.remove("d-none");

  

  document.querySelectorAll(".delete-product-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const tokenToDelete = e.currentTarget.dataset.token;
      const productName = e.currentTarget.dataset.name;

      Swal.fire({
        title: `Are you sure you want to delete "${productName}"?`,
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const deleteConfig = {
              url: `http://localhost:4000/api/products/delete/${tokenToDelete}`,
              method: "DELETE",
            };
            const deleteResponse = await ajax(deleteConfig);

            if (deleteResponse.ok) {
              Swal.fire(
                "Deleted!",
                "Your product has been deleted.",
                "success"
              ).then(() => {
                showMyProducts();
              });
            } else {
              Swal.fire(
                "Failed!",
                deleteResponse.message || "Failed to delete product.",
                "error"
              );
            }
          } catch (error) {
            console.error("Error deleting product:", error);
            Swal.fire(
              "Error!",
              "An error occurred while deleting the product.",
              "error"
            );
          }
        }
      });
    });
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("loading-message").classList.add("d-none");
  document.getElementById("error-message").classList.add("d-none");
  document.getElementById("myProductsContainer").classList.add("d-none");
  document.getElementById("no-products-message").classList.add("d-none");

  try {
    const authResponse = await ajax({
      url: "http://localhost:4000/api/signin/check",
      method: "GET",
    });

    if (!authResponse.ok) {
      document.getElementById("error-message").classList.remove("d-none");
      document.getElementById("error-message").textContent =
        "Please sign in to view your profile and products.";
      return;
    }

    const user = authResponse.user;
    document.getElementById("user-username").textContent = user.username;
    document.getElementById("user-email").textContent = user.email;

    console.log("Frontend (profile.js): Authenticated user email:", user.email);

    document
      .getElementById("showMyProductsBtn")
      .addEventListener("click", showMyProducts);

    document.getElementById("showMyOrderBtn").addEventListener("click", showMyOrders);
 

    const params = new URLSearchParams(window.location.search);
    if (params.get("updated") === "true") {
      await showMyProducts();
    } else if (params.get("orders") === "true") {
      await showMyOrders();
    }
  } catch (error) {
    console.error("Error in profile.js (DOMContentLoaded):", error);
    document.getElementById("error-message").classList.remove("d-none");
    document.getElementById("error-message").textContent =
      "An unexpected error occurred. Please try again later.";
    window.location.href = "signin.html";
  }
});
