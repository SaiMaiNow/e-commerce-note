function removeItem(button) {
  const row = button.closest("tr");
  row.remove();
  updateCart();
}

function updateCart() {
  const items = document.querySelectorAll("#cart-items tr");
  let total = 0;

  items.forEach((row) => {
    const priceText = row.cells[1].textContent;
    const price = parseFloat(priceText.replace("$", ""));
    total += price;
  });

  document.getElementById("cart-total").textContent = `$${total.toFixed(2)}`;

  if (items.length === 0) {
    document.getElementById("cart-content").classList.add("d-none");
    document.getElementById("empty-cart").classList.remove("d-none");
  }
}