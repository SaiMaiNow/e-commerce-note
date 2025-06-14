const ajax = async (config) => {
  const request = await fetch(config.url, {
    method: config.method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config.data),
  });
  const response = await request.json();
  console.log(response.status);
  console.log(response.message);
  return response;

};

document
  .getElementById("register-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = e.target.username.value;
    const email = e.target.email.value;
    const birthday = e.target.birthday.value;
    const pwd = e.target.password.value;
    const confirm = e.target.confirm_password.value;

    if (pwd !== confirm) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Passwords do not match!",
        confirmButtonColor: "#3085d6" //change button color
      });
      return;
    }

    let config = {
      url: 'http://localhost:4000/api/register',
      method: 'POST',
      data: {
        username: username,
        email: email,
        password: pwd,
        birthday: birthday
      }
    }
    let response = await ajax(config);
    // console.log(request.status);
    // console.log(response.status);

    if (!response.ok) {
      Swal.fire({
        icon: "error",
        title: "Register failed!",
        text: response.message || "Something went wrong!",
      });
      return;
    }
    Swal.fire({
      icon: "success",
      title: "Register success!",
      text: response.message,
      showConfirmButton: false,
      timer: 1500
    })
   
    
  });
