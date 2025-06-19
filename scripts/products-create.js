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

document.addEventListener("DOMContentLoaded", async () => {

  const auth = await ajax({
    url: "http://localhost:4000/api/signin/check",
    method: "GET",
  });

  if (!auth.ok) {
    window.location.href = "signin.html";
    return;
  }

  console.log("User authenticated:", auth.user);


  const form = document.querySelector(".product-form");
  form.classList.remove("d-none");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = e.target.title.value.trim();
    const description = e.target.description.value.trim();
    const price = e.target.price.value.trim();
    const subject = e.target.subject.value;
    const file = e.target.file.files[0];
    const image = e.target.image.files[0];

    const formData = new FormData();
    formData.append("name", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("subject", subject);
    formData.append("file", file); 
    formData.append("image", image); 
    
    console.log(e.target.file.files[0]);
    console.log(e.target.image.files[0]);
    console.log({
      title,
      description,
      price,
      subject,
      fileName: file.name,
      imageName: image.name
    });
    try {
      const res = await fetch("http://localhost:4000/api/products/create", {
        method: "POST",
        credentials: "include",
        body: formData
      });

      const result = await res.json();

      if(!result.ok) {
        Swal.fire({
          icon: "error",
          title: "Upload failed!",
          text: result.message || "Something went wrong!",
          showConfirmButton: true
        });
        // alert(result.message || "Something went wrong!");
        return;
      }
      // Swal.fire({
      //   icon: "success",
      //   title: "Upload success!",
      //   text: result.message,
      //   showConfirmButton: false,
      //   timer: 60000000
      // })
      alert("Product uploaded successfully!");

    } catch (err) {
      console.error("Upload error:", err);
      alert("An error occurred while uploading the product. Please try again.");
    }
  });
});


