document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const registerMsg = document.getElementById("registerMsg");

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    registerMsg.textContent = "";
    registerMsg.className = "message";

    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const confirm = document.getElementById("registerConfirm").value.trim();

    if (!username || !email || !password || !confirm) {
      registerMsg.textContent = "Please fill in all the required fields.";
      registerMsg.className = "message error";
      return;
    }

    if (password !== confirm) {
      registerMsg.textContent = "Passwords do not match.";
      registerMsg.className = "message error";
      return;
    }

    fetch("http://localhost:4000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })
      .then((res) => {
        if (!res.ok)
          return res.json().then((data) => {
            throw new Error(data.message || "Registration failed.");
          });
        return res.json();
      })
      .then(() => {
        registerMsg.textContent = "Registration successful! You can now log in.";
        registerMsg.className = "message success";
        registerForm.reset();
      })
      .catch((err) => {
        registerMsg.textContent = err.message;
        registerMsg.className = "message error";
      });
  });
});
