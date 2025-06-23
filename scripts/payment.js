const amountDisplay = document.getElementById("amount");
const qrcodeImg = document.getElementById("qrcode"); // เพิ่มตัวแปรสำหรับ img tag

async function initializePaymentPage() {
  try {
    const cartRes = await fetch("http://localhost:4000/api/cart/get", {
      credentials: "include",
    });
    const cartData = await cartRes.json();

    let amount = 0;
    if (cartData.ok && Array.isArray(cartData.cart)) {
      cartData.cart.forEach((item) => {
        amount += item.price;
      });
    }
    amountDisplay.textContent = `฿${amount.toFixed(2)}`;

    const res = await fetch("http://localhost:4000/api/payment/get", {
      credentials: "include",
    });
    const data = await res.json();

    if (!data.ok) {
      Swal.fire("ผิดพลาด", data.message, "error");
      return; 
    }
    qrcodeImg.src = data.qrcode; // กำหนด src ของรูปภาพ QR Code
  } catch (error) {
    console.error("Error initializing payment page:", error);
    Swal.fire("ผิดพลาด", "ไม่สามารถโหลดข้อมูลการชำระเงินได้", "error");
  }
}

initializePaymentPage();

const form = document.getElementById("paymentForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // const slipFile = document.getElementById("slip").files[0];
  const slipFile = e.target.slip.files[0];
  if (!slipFile) {
    return Swal.fire("กรุณาแนบสลิป", "", "warning");
  }

  // ดึง cart จาก backend เพื่อส่งแนบมาด้วย
  const cartRes = await fetch("http://localhost:4000/api/cart/get", {
    credentials: "include",
  });
  const cartData = await cartRes.json();

  if (!cartData.ok || !cartData.cart || !cartData.cart.length) {
    return Swal.fire("ไม่มีสินค้าในตะกร้า", "ไม่สามารถชำระเงินได้", "error");
  }

  const formData = new FormData();
  formData.append("slip", slipFile);
  formData.append(
    "cart",
    JSON.stringify(
      cartData.cart.map((item) => ({
        token: item.token,
      }))
    )
  );

  const orderRes = await fetch("http://localhost:4000/api/payment/order", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const result = await orderRes.json();

  Swal.close(); // ปิด Loading SweetAlert2

  console.log(result);
  if (!result.ok) {
    return Swal.fire("ผิดพลาด", result.message, "error");
  }

  // ใช้ SweetAlert2 สำหรับแจ้งเตือนสำเร็จ
  await Swal.fire({
    icon: "success",
    title: "ชำระเงินสำเร็จ!",
    text: "รอการตรวจสอบจากแอดมิน",
    showConfirmButton: false, // ไม่ต้องมีปุ่มยืนยัน
    timer: 2000, // ซ่อนเองใน 2 วินาที
  }).then(() => {
    location.href = "/profile.html";
  });
  // window.location.href = "/profile.html";
});
