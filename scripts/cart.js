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





