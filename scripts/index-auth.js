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


async function test(){
  console.log("test function called");
  let config = {
    url: 'http://localhost:4000/api/signin/check',
    method: 'GET',
    
  }

  let response = await ajax(config);
  console.log(response);

}

test();