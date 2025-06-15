const ajax = async (config) => {
  const request = await fetch(config.url, {
    method: config.method,
    credentials: 'include',
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config.data),
  });
  const response = await request.json();
  // console.log(response.status);
  // console.log(response.message);
  return response;

};

document.getElementById("signin-form").addEventListener("submit", async function (e) {

    e.preventDefault();
    const email = e.target.email.value;
    const pwd = e.target.password.value;

    let config = {
      url: 'http://localhost:4000/api/signin',
      method: 'POST',
      data: {
        email: email,
        password: pwd
      }
    }

    let response = await ajax(config);
    
    // console.log(request.status);
    // console.log(response.status);

    if (!response.ok) {
      Swal.fire({
        icon: "error",
        title: "Signin failed!",
        text: response.message || "Something went wrong!",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Signin success!",
      text: response.message,
      showConfirmButton: false,
      timer: 1000
    }).then(() => {
      window.location.href = 'index.html';
    });

   
});
