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

    if (!response.ok) {
      Swal.fire({
        icon: "error",
        title: "Signin failed!",
        text: response.message || "Something went wrong!",
      });
      return;
    }

    // เก็บข้อมูล user ใน localStorage
    // const userToken = 'user_' + Date.now(); // สร้าง token เฉพาะ
    // const userData = {
    //   username: response.user?.username || email.split('@')[0], // ใช้ชื่อจาก response หรือจาก email
    //   email: email,
    //   cart: response.user?.cart || []
    // };
    
    // localStorage.setItem('userToken', userToken);
    // localStorage.setItem('userData', JSON.stringify(userData));

    // Swal.fire({
    //   icon: "success",
    //   title: "Signin success!",
    //   text: response.message,
    //   showConfirmButton: false,
    //   timer: 1000
    // }).then(() => {
    //   window.location.href = 'index.html';
    // });
   
});

async function test(){
  console.log("test function called");
  let config = {
    url: 'http://localhost:4000/api/signin/check',
    method: 'GET'
  }

  let response = await ajax(config);
  console.log(response);

}

test();