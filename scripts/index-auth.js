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

// async function logout(){
//   console.log("logout function called");
//   let config = {
//     url: 'http://localhost:4000/api/signin/logout',
//     method: 'POST',
//   }

//   let response = await ajax(config);
//   console.log(response);

// }
// // logout();
// document.getElementById('logout-link').addEventListener('click', async (e) => {
//   e.preventDefault();  
//   await logout();
//   // หลัง logout สำเร็จ อาจจะเรียก check() อีกครั้งเพื่ออัพเดตเมนู
//   await check();
// });

document.getElementById('logout-link').addEventListener('click', async function (e) {
  e.preventDefault(); 

  console.log("logout function called");
  let config = {
    url: 'http://localhost:4000/api/signin/logout',
    method: 'POST',
  }

  let response = await ajax(config);

  if (!response.ok) {
    Swal.fire({
      icon: "error",
      title: "Logout failed!",
      text: response.message || "Something went wrong!",
    });
    return;
  }

  Swal.fire({
    icon: "success",
    title: "Logout success!",
    text: response.message,
    showConfirmButton: false,
    timer: 1000
  }).then(() => {
    window.location.reload();
  });

});


async function check(){
  console.log("check function called");
  let config = {
    url: 'http://localhost:4000/api/signin/check',
    method: 'GET',
    
  }

  let response = await ajax(config);
  console.log(response);
  // console.log(response.user);

  if (!response.ok) {
    GuestMenu();
    return;
  } 
    
  memberMenu(response.user);
}

// check();

function memberMenu(user) {
  document.getElementById('signin-link').classList.add('d-none');
  document.getElementById('register-link').classList.add('d-none');

  document.getElementById('profile-link').classList.remove('d-none');
  document.getElementById('logout-link').classList.remove('d-none');

  //option
  const userMenu = document.getElementById('userMenu');
  if (userMenu && user.username) {
    userMenu.title = `Welcome, ${user.username}`;
  }
}

function GuestMenu() {
  document.getElementById('signin-link').classList.remove('d-none');
  document.getElementById('register-link').classList.remove('d-none');

  document.getElementById('profile-link').classList.add('d-none');
  document.getElementById('logout-link').classList.add('d-none');

  //option
  const userMenu = document.getElementById('userMenu');
  if (userMenu) {
    userMenu.title = '';
  }
}


check();



