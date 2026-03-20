const BASE_URL = "https://digitalmenu-bo8l.onrender.com";

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  })
  .then(res => {
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  })
  .then(() => {
    localStorage.setItem("loggedIn", "true");
    window.location.href = "admin.html";
  })
  .catch(() => {
    alert("Wrong username or password");
  });
}