
const ajax = async (config) => {
  const request = await fetch(config.url, {
    method: config.method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: config.method !== 'GET' ? JSON.stringify(config.data) : undefined
  });
  return await request.json();
};


async function loadCart() {
  let config = {
    url: 'http://localhost:4000/api/signin/check',  
    method: 'GET'  
  }
  let response = await ajax(config);
  console.log(response);
  
  if (!response.ok) {
    console.error('User not authenticated');
    window.location.href = 'signin.html';
    return;
  }
  console.log('User authenticated:', response.user);

  const userCart = response.user.cart || [];
  const productRes = await ajax({ url: 'http://localhost:4000/api/products/get-all', method: 'GET' });
  const allProducts = productRes.products || [];

  const mergedCart = userCart.map(item => {
    const product = allProducts.find(p => p.token === item.token);
    return {
      ...product,
      quantity: item.quantity
    };
  });

  renderCart(mergedCart);
}

function renderCart(cartItems) {
  const cartBody = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const emptyCart = document.getElementById('empty-cart');
  const cartContent = document.getElementById('cart-content');

  cartBody.innerHTML = '';
  let total = 0;

  if (cartItems.length === 0) {
    cartContent.classList.add('d-none');
    emptyCart.classList.remove('d-none');
    return;
  }

  cartContent.classList.remove('d-none');
  emptyCart.classList.add('d-none');

  cartItems.forEach(item => {
    total += item.price * item.quantity;
    cartBody.innerHTML += `
      <tr data-token="${item.token}">
        <td>
          <div class="d-flex align-items-center">
            <img src="${item.image}" class="product-img me-3 rounded">
            <div>
              <h6 class="mb-1">${item.name}</h6>
              <small class="text-muted">${item.description || 'No description'}</small>
            </div>
          </div>
        </td>
        <td>$${(item.price * item.quantity).toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger" onclick="removeItem('${item.token}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });

  cartTotal.textContent = `$${total.toFixed(2)}`;
}

async function removeItem(token) {
  const row = document.querySelector(`tr[data-token="${token}"]`);
  if (row) row.remove();

  const remainingItems = Array.from(document.querySelectorAll('#cart-items tr')).map(row => {
    return {
      token: row.getAttribute('data-token'),
      quantity: 1
    };
  });

  await ajax({
    url: 'http://localhost:4000/api/cart/update',
    method: 'PUT',
    data: { cart: remainingItems }
  });

  loadCart();
}

// document.getElementById("add-to-cart").addEventListener('click', async function (e) { 

// });
// async function addItem(){
//   console.log("addItem function called");
//   let config = {
//     url: 'http://localhost:4000/api/cart/add',
//     method: 'POST',
//     data: {
//       token: , 
//       quantity: 
//     }
    
//   }


// }

document.addEventListener('DOMContentLoaded', loadCart);
