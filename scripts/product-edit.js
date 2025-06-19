// scripts/product-edit.js

// ฟังก์ชัน ajax utility
// const ajax = async (config) => {
//   const request = await fetch(config.url, {
//     method: config.method,
//     credentials: "include",
//     // สำหรับ FormData, Browser จะจัดการ Content-Type header ให้เอง
//     // ดังนั้นไม่ต้องกำหนด "Content-Type": "application/json" ที่นี่
//     headers: config.isFormData ? {} : {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//     },
//     body: config.data ? (config.isFormData ? config.data : JSON.stringify(config.data)) : undefined,
//   });
//   const response = await request.json();
//   return response;
// };


document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  if (!token) {
    alert("ไม่พบ token ของสินค้า");
    return;
  }

  // ดึงข้อมูลสินค้าของเรา
  const res = await fetch("http://localhost:4000/api/profile", {
    credentials: "include"
  });
  const data = await res.json();
  const product = data.myproduct.find(p => p.token === token);

  if (!product) {
    alert("ไม่พบสินค้านี้");
    return;
  }

  // ใส่ข้อมูลเดิมลง form
  const form = document.getElementById("editForm");
  form.title.value = product.name;
  form.description.value = product.description;
  form.price.value = product.price;
  form.subject.value = product.subject;

  const imageName = product.image.split('/').pop();
  const fileName = product.file.split('/').pop();

  document.getElementById('imageFilename').textContent = `${imageName}`;
  document.getElementById('pdfFilename').textContent = `${fileName}`;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.title.value.trim());
    formData.append("description", form.description.value.trim());
    formData.append("price", form.price.value.trim());
    formData.append("subject", form.subject.value);

    if (form.image.files[0]) {
      formData.append("image", form.image.files[0]);
    }
    if (form.file.files[0]) {
      formData.append("file", form.file.files[0]);
    }

    const res = await fetch(`http://localhost:4000/api/products/update/${token}`, {
      method: "PUT",
      body: formData,
      credentials: "include"
    });

    const result = await res.json();
    if (result.ok) {
      Swal.fire({
        icon: "success",
        title: "แก้ไขสำเร็จ",
        text: result.message,
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire("Error", result.error || "เกิดข้อผิดพลาด", "error");
    }
  });
});
