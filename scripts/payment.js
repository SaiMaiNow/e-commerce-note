document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  if (!token) {
    alert("ไม่พบ token สินค้า");
    return;
  }

  // โหลด QR Code
  const res = await fetch(`http://localhost:4000/api/payment/get-payment?token=${token}`);
  const data = await res.json();
  if (data.ok) {
    document.getElementById("qrcode").src = data.qrcode;
  } else {
    Swal.fire("ผิดพลาด", data.message, "error");
  }

  // เมื่อส่งฟอร์ม
  const form = document.getElementById("paymentForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const slipFile = document.getElementById("slip").files[0];
    formData.append("token", token);
    formData.append("slip", slipFile);

    const res = await fetch("http://localhost:4000/api/payment/check-payment", {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    const result = await res.json();
    if (result.ok) {
      Swal.fire("สำเร็จ", "ยืนยันการชำระเงินเรียบร้อย", "success").then(() => {
        window.location.href = "profile.html";
      });
    } else {
      Swal.fire("ผิดพลาด", result.message, "error");
    }
  });
});
