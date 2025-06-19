// const ajax = async (config) => {
//   const request = await fetch(config.url, {
//     method: config.method,
//     credentials: "include",
//     headers: {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(config.data),
//   });
//   const response = await request.json();
//   return response;
// };
let allProducts = [];

async function getAllProducts(){
  console.log("Fetching all products...");
  let config = {
    url: 'http://localhost:4000/api/products/get-all',
    method: 'GET'
  }
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

  if (!keyword){
    return allProducts;
  }

  return allProducts.filter(product =>
    product.name.toLowerCase().includes(keyword) ||
    product.description.toLowerCase().includes(keyword) || product.subject.includes(keyword)
  );
}

function showProducts(products) {

  const container = document.getElementById('productList'); 
  container.innerHTML = '';

  if (!products || products.length === 0) {
    container.innerHTML = '<p>No products found</p>';
    return;
  }
  
  products.forEach(p => {
    // *** ปรับแก้ URL รูปภาพตรงนี้: เพิ่ม 'http://localhost:4000' ถ้า p.image เป็น Path สัมพัทธ์ ***
    // const imageUrl = p.image.startsWith('/uploads/') ? `http://localhost:4000${p.image}` : p.image;

    container.innerHTML += `
      <div class="col-md-4">  <div class="card mb-4 box-shadow position-relative product-hover">
          <a href="product-detail.html?token=${p.token}" class="text-decoration-none text-dark">
              <div class="product-image">
                <img class="card-img-top" src="${p?.image}" alt="${p.name}">
                <button class="badge-button btn btn-danger btn-sm position-absolute top-0 start-0 m-2">${p.subject}</button>
              </div>
        
              <div class="card-body">
                <h5 class="card-title">${p.name}</h5>
                <p class="card-text">${p.description}</p>
                <p class="product-price text-danger fw-bold">฿${p.price}</p>
        
                <div class="d-flex justify-content-between align-items-center">
                  <div class="btn-group">
                    <button type="button" class="btn btn-sm btn-success" title="Buy">
                      <i class="bi bi-currency-dollar"></i>
                    </button>
        
                    <button type="button" class="btn btn-sm btn-outline-secondary add-to-cart" title="Add to cart">
                      <i class="bi bi-cart"></i>
                    </button>
                  </div>
                  <small class="text-muted">9 mins</small>
                </div>
              </div>
          </a>
          <button class="btn btn-primary btn-slide-up w-100 rounded-0 add-to-cart" data-product-token="${p.token}" title="Add to cart">
            Add to cart <i class="bi bi-cart"></i>
          </button>
        </div>
      </div> `;
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  allProducts = await getAllProducts();

  showProducts(allProducts);

  document.getElementById('searchInput').addEventListener('input', e => {
        const filtered = filterProducts(e.target.value);
        showProducts(filtered);
      });
});