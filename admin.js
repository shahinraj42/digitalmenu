/*TEMPORARILY COMMENT THIS OUT TO TEST ON PHONE
// Protect Admin
if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "login.html";
}
  */

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
// 🟢 ADD MENU WITH restaurantId
// FILE: admin.js
// ========================

function addItem() {   // function when user clicks "Add Item"

  const name = document.getElementById("name").value; 
  // get item name from input

  const price = document.getElementById("price").value; 
  // get price from input

  if (!name || !price) {
    alert("Enter name and price");
    return;
  }

  const image = document.getElementById("imageUrl").value; 
  // get image URL (or uploaded image URL)

  const restaurantId = localStorage.getItem("restaurantId"); 
  // 🔥 get restaurantId from browser storage

  fetch(`${BASE_URL}/menu`, {
    method: "POST", // sending data
    headers: {
      "Content-Type": "application/json" // JSON format
    },
    body: JSON.stringify({
      name: name,            // item name
      price: price,          // item price
      image: image,          // item image
      restaurantId: restaurantId // 🔥 attach restaurantId
    })
  })
  .then(res => res.json())
  .then(() => {
    alert("Item added");
    loadMenuAdmin(); // reload menu list
  });

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


  // ========================
// 🟡 FETCH MENU WITH restaurantId
// FILE: admin.js
// ========================

function loadMenuAdmin() {

 const restaurantId = localStorage.getItem("restaurantId"); // get restaurantId

 fetch(`${BASE_URL}/menu?restaurantId=${restaurantId}`)     // send restaurantId to backend

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