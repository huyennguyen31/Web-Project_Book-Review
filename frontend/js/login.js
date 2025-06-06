document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginMsg = document.getElementById("loginMsg");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    loginMsg.textContent = "";
    loginMsg.className = "message";

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!username || !password) {
      loginMsg.textContent = "Please enter all required fields.";
      loginMsg.className = "message error";
      return;
    }

    fetch("http://localhost:4000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.message || "Login failed.");
          });
        }
        return res.json();
      })
      .then((data) => {
        try {
          if (data.token) localStorage.setItem("token", data.token);
          if (data.username) localStorage.setItem("username", data.username);
          if (data.userId) localStorage.setItem("userId", data.userId);
          if (data.role) localStorage.setItem("role", data.role); // ✅ lưu role
        } catch (e) {
          console.warn("Failed to save data to localStorage:", e);
        }

        loginMsg.textContent = "Login successful!";
        loginMsg.className = "message success";

        // ✅ Điều hướng theo vai trò
        setTimeout(() => {
          if (data.role === "admin") {
            window.location.href = "admin.html";
          } else {
            window.location.href = "index.html";
          }
        }, 1000);
      })
      .catch((err) => {
        console.error("Login error:", err);
        loginMsg.textContent = err.message;
        loginMsg.className = "message error";
      });
  });
});
