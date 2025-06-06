document.addEventListener("DOMContentLoaded", function () {
  // Load header
  fetch("components/header.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("header").innerHTML = data;
      initHeaderScripts(); // Khởi động chức năng sau khi header load
    })
    .catch(err => console.error("Error loading header:", err));

  // Load footer
  fetch("components/footer.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("footer").innerHTML = data;
    })
    .catch(err => console.error("Error loading footer:", err));

  // Cuộn thể loại
  const handleGenreScroll = () => {
    const leftBtn = document.querySelector('.scroll-btn.left');
    const rightBtn = document.querySelector('.scroll-btn.right');
    const genreList = document.querySelector('.genre-list');

    if (leftBtn && rightBtn && genreList) {
      leftBtn.addEventListener("click", () => genreList.scrollLeft -= 100);
      rightBtn.addEventListener("click", () => genreList.scrollLeft += 100);
    } else {
      console.warn("Scroll buttons or genre list not found.");
    }
  };

  setTimeout(handleGenreScroll, 100);
});

// ==== Các hàm khởi tạo sau khi header đã render ====
function initHeaderScripts() {
  // Dropdown "Thể loại"
  const dropdown = document.querySelector(".dropdown");
  const menu = dropdown?.querySelector(".dropdown-menu");

  if (dropdown && menu) {
    dropdown.addEventListener("mouseenter", () => menu.style.display = "flex");
    dropdown.addEventListener("mouseleave", () => menu.style.display = "none");

    // Xử lý click cho mobile (toggle menu)
    dropdown.addEventListener("click", () => {
      menu.style.display = menu.style.display === "flex" ? "none" : "flex";
    });
  }

  // Tìm kiếm sách từ input trên header
  const searchInput = document.getElementById("topSearchInput");
  if (searchInput) {
    let debounceTimer = null;
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const keyword = searchInput.value.toLowerCase();
        const cards = document.querySelectorAll(".book-card");
        cards.forEach(card => {
          const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
          card.style.display = title.includes(keyword) ? "block" : "none";
        });
      }, 150);
    });
  }

  // Tên người dùng + Đăng xuất (bỏ avatar)
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const authArea = document.getElementById("authArea");

  if (username && token && authArea) {
    authArea.innerHTML = `
      <div class="user-dropdown">
        <div class="user-info">
          <span>Hello</span>
          <strong>${username}</strong>
        </div>
        <ul class="logout-menu">
          <li><a href="#" id="logoutBtn">🔁 Logout</a></li>
        </ul>
      </div>
    `;

    document.getElementById("logoutBtn").addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "login.html";
    });
  }
}
