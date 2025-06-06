document.addEventListener("DOMContentLoaded", () => {
  const bookId = new URLSearchParams(window.location.search).get("id");
  const container = document.getElementById("bookDetail");

  const genreViMap = {
    "science fiction": "Science Fiction",
    "romance": "Romance",
    "history": "History",
    "adventure": "Adventure",
    "technology": "Technology",
    "economics": "Economics",
    "thriller": "Thriller",
    "education": "Education"
  };

  // ==== 1. Load chi tiết sách ====
 function loadBookDetail() {
  fetch(`http://localhost:4000/api/books/${bookId}`)
    .then(res => {
      if (!res.ok) throw new Error("Book not found");
      return res.json();
    })
    .then(book => {
      container.innerHTML = `
        <img src="${book.cover_url || 'images/default.jpg'}"
             alt="Cover of ${book.title}"
             onerror="this.onerror=null; this.src='images/default.jpg';">
        <div>
          <h1>${book.title}</h1>
          <h3>Author: ${book.author}</h3>
          <p><strong>Genre:</strong> ${genreViMap[book.genre] || 'Unknown'}</p>
          <p>${book.description?.trim() || 'No description available'}</p>
          <div class="tags">${(book.subjects || []).map(t => `<span>${t}</span>`).join("")}</div>
          <p>⭐ ${parseFloat(book.rating || 0).toFixed(1)}</p>
        </div>
      `;
    })
    .catch(err => {
      container.innerHTML = `<p>Failed to load book information: ${err.message}</p>`;
    });
}


  // ==== 2. Xử lý bình luận ====
  const commentForm = document.getElementById("commentForm");
  const commentList = document.getElementById("commentList");
  const commentMsg = document.getElementById("commentMsg");
  const contentInput = document.getElementById("commentContent");
  const ratingInput = document.getElementById("commentRating");

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  function loadComments() {
    fetch(`http://localhost:4000/api/comments/${bookId}`)
      .then(res => res.json())
      .then(comments => {
        if (!Array.isArray(comments) || comments.length === 0) {
          commentList.innerHTML = "<p>No comments yet.</p>";
          return;
        }
        commentList.innerHTML = comments.map(c => `
          <div class="comment">
            <strong>${c.username}</strong> (${new Date(c.created_at).toLocaleString()})
            <p>⭐ ${c.rating || 'Not rated'}</p>
            <p>${c.content}</p>
          </div>
        `).join("");
      })
      .catch(() => {
        commentList.innerHTML = "<p>Error loading comments.</p>";
      });
  }

  loadBookDetail();
  loadComments();

  // ==== 3. Gửi bình luận mới + cập nhật rate tự động ====
  commentForm.addEventListener("submit", e => {
    e.preventDefault();

    if (!token || !username || !userId) {
      commentMsg.style.color = "red";
      commentMsg.textContent = "You need to log in to comment.";
      return;
    }

    const content = contentInput.value.trim();
    const rating = parseInt(ratingInput.value);

    if (!content || isNaN(rating)) {
      commentMsg.style.color = "red";
      commentMsg.textContent = "Please enter a comment and select a rating.";
      return;
    }

    fetch(`http://localhost:4000/api/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ bookId: parseInt(bookId), userId: parseInt(userId), content, rating })
    })
      .then(res => {
        if (!res.ok) throw new Error("Error submitting comment");
        return res.json();
      })
      .then(() => {
        commentMsg.style.color = "green";
        commentMsg.textContent = "Comment submitted successfully!";
        commentForm.reset();
        loadComments();
        loadBookDetail(); 
      })
      .catch(err => {
        commentMsg.style.color = "red";
        commentMsg.textContent = err.message || "Failed to submit comment.";
      });
  });
});
