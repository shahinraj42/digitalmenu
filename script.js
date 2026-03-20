const BASE_URL = "https://digitalmenu-bo8l.onrender.com";

const params = new URLSearchParams(window.location.search);
const tableNumber = params.get("table") || 1;

function loadMenu() {
  fetch(`${BASE_URL}/menu`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("menu");
      container.innerHTML = "";

      data.forEach(item => {
        const div = document.createElement("div");
        div.className = "item";

       div.innerHTML = `
  <img src="${item.image}" />
  <div class="item-content">
    <h3>${item.name}</h3>
    <p>৳${item.price}</p>
    <button onclick="addToCart('${item.name}')">Add</button>
  </div>
`;

        container.appendChild(div);
      });
    });
}

loadMenu();


let cart = [];

function addToCart(item) {
  cart.push(item);
  document.getElementById("cartItems").innerText = "Cart: " + cart.join(", ");
}

function confirmOrder() {
  fetch(`${BASE_URL}/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: cart,
      table: tableNumber
    })
  })
  .then(res => res.json())
  .then(() => {
    alert("Order placed successfully!");
    cart = [];
    document.getElementById("cartItems").innerText = "Cart: Empty";
  });
}