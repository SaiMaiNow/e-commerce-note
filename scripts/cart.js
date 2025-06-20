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
document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("http://localhost:4000/api/cart/get", {
    credentials: "include"
  });
  const data = await response.json();

  if (!data.ok) {
    console.error("ไม่สามารถดึงข้อมูลตะกร้าได้:", data.message);
    return;
  }

  const cartItems = data.cart; // array ของสินค้า
  console.log("Cart items:", cartItems);
  
  // แสดงรายการใน DOM
  const container = document.getElementById("cartContainer");
  cartItems.forEach(p => {
    container.innerHTML += `
      <div class="cart-item">
        <img src="${p.image}" width="100">
        <div>
          <h5>${p.name}</h5>
          <p>ราคา: ฿${p.price}</p>
        </div>
      </div>
    `;
  });
});


// async function addToCart(productToken, quantity = 1){
//   console.log("addToCart function called");
  
//   let config = {
//     url: 'http://localhost:4000/api/cart/add',
//     method: 'POST',
//     data: {
//       productToken: token
//     }
//   }
// }





