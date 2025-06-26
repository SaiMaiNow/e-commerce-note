const amountDisplay = document.getElementById("amount");
const amountBottom = document.getElementById("amountBottom"); // เพิ่มตัวแปรสำหรับแสดงจำนวนเงินด้านล่าง
const qrcodeImg = document.getElementById("qrcode"); // เพิ่มตัวแปรสำหรับ img tag
const qtyCart = document.getElementById("qty-cart");
const downloadBtn = document.getElementById("downloadQrcode");
const downloadBtnMobile = document.getElementById("downloadQrcodeM");

async function initializePaymentPage() {
  try {
    const auth = await fetch("http://localhost:4000/api/signin/check", {
      credentials: "include",
    });

    if (!auth.ok) {
      return (window.location.href = "signin.html");
    }

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

    if (cartData.cart.length <= 0) {
      window.location.href = "profile.html";
      return;
    }

    qtyCart.innerHTML = cartData.cart.length;

    const amountText = `฿${amount.toFixed(2)}`;
    amountDisplay.textContent = amountText;
    amountBottom.textContent = amountText;

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

document.getElementById("submitPaymentDesktop").addEventListener("click", handlePayment);
document.getElementById("submitPaymentMobile").addEventListener("click", handlePayment);

async function handlePayment(e) {
  e.preventDefault();
  const slipFile = document.getElementById("slip").files[0];

  if (!slipFile) {
    return Swal.fire("กรุณาแนบสลิป", "", "warning");
  }

  const cartRes = await fetch("http://localhost:4000/api/cart/get", {
    credentials: "include",
  });

  const cartData = await cartRes.json();

  if (!cartData.ok || !cartData.cart || !cartData.cart.length) {
    return Swal.fire("ไม่มีสินค้าในตะกร้า", "ไม่สามารถชำระเงินได้", "error");
  }

  const formData = new FormData();
  formData.append("slip", slipFile);
  
  const orderRes = await fetch("http://localhost:4000/api/payment/order", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const result = await orderRes.json();
  if (!result.ok) {
    return Swal.fire("ผิดพลาด", result.message, "error");
  }

  await Swal.fire({
    icon: "success",
    title: "ชำระเงินสำเร็จ!",
    text: "รอการตรวจสอบจากแอดมิน",
    showConfirmButton: false, // ไม่ต้องมีปุ่มยืนยัน
    timer: 2000, // ซ่อนเองใน 2 วินาที
  });

  window.location.href = "profile.html";
}

downloadBtnMobile.addEventListener("click", handleDownloadQR);

downloadBtn.addEventListener("click", handleDownloadQR);

function handleDownloadQR(e) {
  if (!qrcodeImg.src) {
    Swal.fire("แจ้งเตือน", "ยังไม่มี QR Code ให้ดาวน์โหลด", "warning");
    e.preventDefault();
    return;
  }

  const link = document.createElement('a');
  link.href = qrcodeImg.src;
  link.download = 'qrcode.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}