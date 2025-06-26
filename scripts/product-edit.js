document.addEventListener("DOMContentLoaded", async () => {
  const secretKey = "mySecret123";
  const params = new URLSearchParams(location.search);
  const encrypted = params.get("code");

  if (!encrypted) {
    alert("ไม่พบข้อมูลสินค้า");
    return;
  }

  let token;
  try {
    const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encrypted), secretKey);
    token = bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    alert("Token ถอดรหัสไม่ได้");
    return;
  }

  if (!token) {
    alert("Token ไม่ถูกต้อง");
    return;
  }
  const auth = await fetch("http://localhost:4000/api/signin/check", {
    credentials: "include"
  }).then(res => res.json());
  if (!auth.ok) {
    return window.location.href = "signin.html";
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
    console.log("🔁 FORM SUBMIT");

    const formData = new FormData();
    formData.append("name", form.title.value.trim());
    formData.append("description", form.description.value.trim());
    formData.append("price", form.price.value.trim());
    formData.append("subject", form.subject.value);

    if (form.image.files[0]) {
      console.log("📸 มีการอัปโหลดรูปใหม่");
      formData.append("image", form.image.files[0]);
    }
    if (form.file.files[0]) {
      console.log("📄 มีการอัปโหลดไฟล์ PDF ใหม่");
      formData.append("file", form.file.files[0]);
    }

    try {
      const res = await fetch(`http://localhost:4000/api/products/update/${token}`, {
        method: "PUT",
        body: formData,
        credentials: "include"
      });

  
      const result = await res.json();
      
      console.log("✅ RESULT FROM BACKEND:", result);
      if (!result.ok) {
        await Swal.fire("Error", result.error || "เกิดข้อผิดพลาด", "error");
        return;
      } 
      console.log("✅ UPDATE SUCCESS:", result);
      await Swal.fire({
        icon: "success",
        title: "แก้ไขสำเร็จ",
        text: result.message,
        timer: 2000,
        showConfirmButton: false
      }) .then(() => {
        window.location.href = "profile.html?updated=true";
      });
    
    } catch (err) {
      console.error("Error while updating:", err);
      await Swal.fire("Error", "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้", "error");
    } 
  });
});
