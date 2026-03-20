// Protect Admin
if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "login.html";
}

const BASE_URL = "https://digitalmenu-bo8l.onrender.com";

function updateStatus(id, status) {
  fetch(`${BASE_URL}/order/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  })
  .then(() => loadOrders());
}

function loadOrders() {
  fetch(`${BASE_URL}/order`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("orders");
      container.innerHTML = "";

      data.reverse().forEach(order => {
        const div = document.createElement("div");
        div.className = "item";

        div.innerHTML = `
          <div class="item-content">
            <h3>Table ${order.table}</h3>
            <p>${order.items.join(", ")}</p>
            <p>Status: <b>${order.status}</b></p>

            <button onclick="updateStatus(${order.id}, 'Preparing')">Preparing</button>
            <button onclick="updateStatus(${order.id}, 'Served')">Served</button>
          </div>
        `;

        container.appendChild(div);
      });
    });
}

// ========================
// FRONTEND: ADD MENU ITEM WITH IMAGE
// ========================
function addItem() {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;

  if (!name || !price) {
    alert("Enter name and price");
    return;
  }

  // Upload image first
  uploadImage()
    .then(data => {
      // After image uploaded, send full menu item to backend
      return fetch(`${BASE_URL}/menu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name,
          price: Number(price),
          image: data.imageUrl // URL from upload API
        })
      });
    })
    .then(res => res.json())
    .then(() => {
      // Reload menu list
      loadMenuAdmin();
      // Clear inputs
      document.getElementById("name").value = "";
      document.getElementById("price").value = "";
      document.getElementById("imageFile").value = "";
    })
    .catch(err => console.error(err));
}

// ========================
// FRONTEND: UPLOAD IMAGE FUNCTION
// ========================
function uploadImage() {
  const file = document.getElementById("imageFile").files[0]; // get file from input
  if (!file) {
    alert("Please select an image");
    return Promise.reject("No image selected");
  }

  const formData = new FormData();
  formData.append("image", file);

  // Call backend upload API
  return fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData
  })
  .then(res => res.json());
}

function loadMenuAdmin() {
  fetch(`${BASE_URL}/menu`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("menuList");
      container.innerHTML = "";

      data.forEach(item => {
        const div = document.createElement("div");
        div.className = "item";

        div.innerHTML = `
          <div class="item-content">
            <h3>${item.name}</h3>
            <p>৳${item.price}</p>

            <input placeholder="New price" id="price-${item._id}">
            <button onclick="updateItem('${item._id}')">Update</button>
            <button onclick="deleteItem('${item._id}')">Delete</button>
          </div>
        `;

        container.appendChild(div);
      });
    });
}


//Update item
function updateItem(id) {
  const newPrice = document.getElementById(`price-${id}`).value;

  if (!newPrice) {
    alert("Enter price first");
    return;
  }

  fetch(`${BASE_URL}/menu/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      price: Number(newPrice)
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log(data);
    loadMenuAdmin();
  })
  .catch(err => console.error(err));
}

//Add delete API
function deleteItem(id) {
  if (!confirm("Delete this item?")) return;

  fetch(`${BASE_URL}/menu/${id}`, {
    method: "DELETE"
  })
  .then(() => loadMenuAdmin());
}


//Add Edit API
function editItem(id, name, price) {
  const newName = prompt("New name:", name);
  const newPrice = prompt("New price:", price);

  fetch(`${BASE_URL}/menu/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: newName,
      price: newPrice
    })
  })
  .then(() => loadMenuAdmin());
}

// call it
loadMenuAdmin();

// Auto refresh
setInterval(loadOrders, 3000);
loadOrders();