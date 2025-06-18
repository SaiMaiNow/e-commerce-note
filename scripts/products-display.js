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

let allProducts = [];

async function getAllProducts(){
  console.log("Fetching all products...");
  let config = {
    url: 'http://localhost:4000/api/products/get-all',
    method: 'GET'
  }
  let response = await ajax(config);
  console.log(response);
  return response;
}
// console.log(getAllProducts());


function filterProducts(keyword) {
  keyword = keyword.trim().toLowerCase();

  if (!keyword){
    return allProducts;
  }

  return allProducts.filter(product =>
    product.name.toLowerCase().includes(keyword) ||
    product.description.toLowerCase().includes(keyword)
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
    container.innerHTML += `
      <div class="card mb-4 box-shadow">
        <div class="product-image position-relative">
          <img class="card-img-top" src="${p.image}" alt="${p.name}">
          <button class="badge-button btn btn-danger btn-sm position-absolute top-0 start-0 m-2">Subject</button>
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
      </div>
    `;
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