async function getMyProducts(){
  console.log("Fetching my products...");
  let config = {
    url: 'http://localhost:4000/api/profile',
    method: 'GET'
  }
  let response = await ajax(config);

  console.log("API response:", response);
  
  if (!response.ok) {
    console.error("Failed to fetch products:", response); 
    return []; 
  }
  return response.myproduct; 
}

const showMyProducts = async function() {
  const products = await getMyProducts();
  const container = document.getElementById('myProductsContainer');
  container.innerHTML = ''; 

  if (!products || products.length === 0) {
      document.getElementById('no-products-message').classList.remove('d-none');
      document.getElementById('myProductsContainer').classList.add('d-none'); 
      return;
  }
  console.log(products);

  products.forEach(p => {
      container.innerHTML += `
          <div class="col">
              <div class="card shadow-sm product-card-manage">
                  <img src="${p?.image}" class="card-img-top" alt="${p.name}">
                  <div class="card-body">
                      <span class="badge bg-primary mb-2">${p.subject}</span>
                      <h5 class="card-title">${p.name}</h5>
                      <p class="card-text text-muted">${p.description.substring(0, 70)}${p.description.length > 70 ? '...' : ''}</p>
                      <p class="product-price text-danger fw-bold">฿${p.price}</p>
                      <div class="d-flex justify-content-between align-items-center">
                          <div class="btn-group">
                              <a href="product-edit.html?token=${p.token}" class="btn btn-sm btn-outline-primary">
                                  <i class="bi bi-pencil"></i> Edit
                              </a>
                              <button type="button" class="btn btn-sm btn-outline-danger delete-product-btn" data-token="${p.token}" data-name="${p.name}">
                                  <i class="bi bi-trash"></i> Delete
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      `;
  });

  container.classList.remove('d-none');
  document.getElementById('no-products-message').classList.add('d-none');

  document.querySelectorAll('.delete-product-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
          const tokenToDelete = e.currentTarget.dataset.token;
          const productName = e.currentTarget.dataset.name;
          
          Swal.fire({
              title: `Are you sure you want to delete "${productName}"?`,
              text: "You won't be able to revert this!",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#d33',
              cancelButtonColor: '#3085d6',
              confirmButtonText: 'Yes, delete it!'
          }).then(async (result) => {
              if (result.isConfirmed) {
                  try {
                      const deleteConfig = {
                          url: `http://localhost:4000/api/products/delete/${tokenToDelete}`,
                          method: 'DELETE'
                      };
                      const deleteResponse = await ajax(deleteConfig);

                      if (deleteResponse.ok) {
                          Swal.fire(
                              'Deleted!',
                              'Your product has been deleted.',
                              'success'
                          ).then(() => {
                            showMyProducts();
                          });
                      } else {
                          Swal.fire(
                              'Failed!',
                              deleteResponse.message || 'Failed to delete product.',
                              'error'
                          );
                      }
                  } catch (error) {
                      console.error('Error deleting product:', error);
                      Swal.fire(
                          'Error!',
                          'An error occurred while deleting the product.',
                          'error'
                      );
                  }
              }
          });
      });
  });
}


document.addEventListener('DOMContentLoaded', async () => {

  document.getElementById('loading-message').classList.add('d-none');
  document.getElementById('error-message').classList.add('d-none');
  document.getElementById('myProductsContainer').classList.add('d-none');
  document.getElementById('no-products-message').classList.add('d-none');

  try {
      const authResponse = await ajax({
          url: 'http://localhost:4000/api/signin/check',
          method: 'GET'
      });

      if (!authResponse.ok) {
          document.getElementById('error-message').classList.remove('d-none');
          document.getElementById('error-message').textContent = 'Please sign in to view your profile and products.';
          return;
      }

      const user = authResponse.user; 
      document.getElementById('user-username').textContent = user.username;
      document.getElementById('user-email').textContent = user.email;

      console.log("Frontend (profile.js): Authenticated user email:", user.email); 
      
      document.getElementById('showMyProductsBtn').addEventListener('click', showMyProducts);

  } catch (error) {
      console.error('Error in profile.js (DOMContentLoaded):', error);
      document.getElementById('error-message').classList.remove('d-none');
      document.getElementById('error-message').textContent = 'An unexpected error occurred. Please try again later.';
      window.location.href = "signin.html"; 
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get('updated') === 'true') {
    await showMyProducts();
  }
});
