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

document.querySelectorAll('.logout-link').forEach(link => {
  link.addEventListener('click', async function (e) {
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
    guestMenu();
    return;
  } 
    
  memberMenu(response.user);
}

function memberMenu(user) {
  document.querySelectorAll('.signin-link').forEach(el => el.classList.add('d-none'));
  document.querySelectorAll('.register-link').forEach(el => el.classList.add('d-none'));

  document.querySelectorAll('.profile-link').forEach(el => el.classList.remove('d-none'));
  document.querySelectorAll('.logout-link').forEach(el => el.classList.remove('d-none'));
  document.querySelectorAll('.products-link').forEach(el => el.classList.remove('d-none'));

  const userMenu = document.getElementById('userMenu');
  if (userMenu && user.username) {
    userMenu.title = `Welcome, ${user.username}`;
  }
}

function guestMenu() {
  document.querySelectorAll('.signin-link').forEach(el => el.classList.remove('d-none'));
  document.querySelectorAll('.register-link').forEach(el => el.classList.remove('d-none'));

  document.querySelectorAll('.products-link').forEach(el => el.classList.add('d-none'));
  document.querySelectorAll('.profile-link').forEach(el => el.classList.add('d-none'));
  document.querySelectorAll('.logout-link').forEach(el => el.classList.add('d-none'));

  const userMenu = document.getElementById('userMenu');
  if (userMenu) {
    userMenu.title = '';
  }
}



check();



