document.addEventListener("DOMContentLoaded", async () => {

  const amountDisplay = document.getElementById("amount");

  const cartRes = await fetch("http://localhost:4000/api/cart/get", {
    credentials: "include",
  });
  const cartData = await cartRes.json();

  let amount = 0;
  if (cartData.ok && Array.isArray(cartData.cart)) {
    cartData.cart.forEach(item => {
      amount += item.price * item.quantity;
    });
  }
  amountDisplay.textContent = `฿${amount.toFixed(2)}`;


  // โหลด QR Code สำหรับยอดรวม
  const res = await fetch("http://localhost:4000/api/payment/get", {
    credentials: "include",
  });
  const data = await res.json();

  if (data.ok) {
    document.getElementById("qrcode").src = data.qrcode;
    
  } else {
    Swal.fire("ผิดพลาด", data.message, "error");
    return;
  }

  // เมื่อส่งฟอร์มชำระเงิน
  const form = document.getElementById("paymentForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const slipFile = document.getElementById("slip").files[0];
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
          quantity: item.quantity,
        }))
      )
    );

    const orderRes = await fetch("http://localhost:4000/api/payment/order", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const result = await orderRes.json();

    if (result.ok) {
      Swal.fire("สำเร็จ", "ยืนยันการชำระเงินเรียบร้อย", "success").then(() => {
        window.location.href = "profile.html";
      });
    } else {
      // Swal.fire("ผิดพลาด", result.message, "error"),
      // timer: 2000
      // ;
      alert("ผิดพลาด: " + result.message);
    }
  });
});
