const db = require('../config/db');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// === Hàm phụ: Xác định thể loại từ subjects ===
const extractGenre = (subjects = []) => {
  const text = subjects.map(s => s.toLowerCase()).join(' ');

  const genreKeywords = {
    "science fiction": ['science fiction', 'sci-fi', 'speculative', 'fantasy', 'dystopia'],
    "romance": ['romance', 'love', 'affair'],
    "history": ['history', 'historical', 'biography'],
    "adventure": ['adventure', 'exploration'],
    "technology": ['technology', 'tech', 'computers', 'programming', 'engineering'],
    "economics": ['economics', 'finance', 'business', 'money'],
    "thriller": ['thriller', 'crime', 'mystery', 'suspense'],
    "education": ['education', 'academic', 'learning', 'pedagogy', 'study']
  };

  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (keywords.some(k => text.includes(k))) {
      return genre;
    }
  }

  return 'unknown';
};

// === GET: Danh sách sách ===
exports.getBooks = (req, res) => {
  const sql = 'SELECT id, title, author, rating, cover_url, genre FROM books ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to retrieve book list', error: err });
    res.json(results);
  });
};

// === GET: Chi tiết sách theo ID ===
exports.getBookDetail = async (req, res) => {
  const bookId = req.params.id;

  db.query('SELECT * FROM books WHERE id = ?', [bookId], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Book not found' });

    const book = results[0];
    const link = book.link;

    let description = book.description;
    let subjects = [];
    let cover_url = book.cover_url;

    if (link && link.includes('openlibrary.org')) {
      try {
        const id = link.split('/').pop();
        const apiUrl = `https://openlibrary.org/works/${id}.json`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!description) {
          description = typeof data.description === 'string'
            ? data.description
            : (data.description?.value || '');
        }

        subjects = data.subjects || [];

        if (!cover_url && data.covers?.[0]) {
          cover_url = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`;
        }
      } catch (err) {
        return res.status(500).json({ message: 'Failed to fetch data from Open Library', error: err.message });
      }
    }

    res.json({ ...book, description, subjects, cover_url });
  });
};

// === POST: Thêm sách nội bộ ===
exports.addBook = (req, res) => {
  const { title, author, description, rating, link, genre } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Missing title or author' });
  }

  const finalGenre = genre || extractGenre([title, description]);

  const sql = `
    INSERT INTO books 
    (title, author, description, rating, link, source, external_html, rating_count, rating_sum, genre)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    title,
    author,
    description || '',
    rating || 0,
    link || '',
    'local',
    null,
    0,
    0,
    finalGenre
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to add book', error: err });
    res.status(201).json({ message: 'Book added successfully', id: result.insertId });
  });
};

// === GET: Tìm kiếm sách ===
exports.searchBooks = (req, res) => {
  const keyword = req.query.q?.toLowerCase() || '';
  const sql = `
    SELECT id, title, author, rating, cover_url 
    FROM books 
    WHERE LOWER(title) LIKE ?
    ORDER BY id DESC
  `;
  db.query(sql, [`%${keyword}%`], (err, results) => {
    if (err) return res.status(500).json({ message: 'Search error', error: err });
    res.json(results);
  });
};

// === POST: Đánh giá sách & cập nhật rating ===
exports.rateBook = (req, res) => {
  const { bookId, rating, userId, content } = req.body;
  if (!bookId || typeof rating !== 'number' || !userId || !content) {
    return res.status(400).json({ message: 'Invalid rating data' });
  }

  const insertSql = 'INSERT INTO comments (book_id, user_id, content, rating) VALUES (?, ?, ?, ?)';
  db.query(insertSql, [bookId, userId, content, rating], (err) => {
    if (err) return res.status(500).json({ message: 'Error adding comment', error: err });

    const calcSql = `
      SELECT COUNT(rating) AS rating_count, SUM(rating) AS rating_sum, ROUND(AVG(rating), 2) AS rating
      FROM comments
      WHERE rating IS NOT NULL AND book_id = ?
    `;

    db.query(calcSql, [bookId], (calcErr, stats) => {
      if (calcErr) return res.status(500).json({ message: 'Error calculating rating', error: calcErr });

      const { rating_count, rating_sum, rating } = stats[0];
      const updateSql = `
        UPDATE books SET rating = ?, rating_count = ?, rating_sum = ?
        WHERE id = ?
      `;

      db.query(updateSql, [rating, rating_count, rating_sum, bookId], (err2) => {
        if (err2) return res.status(500).json({ message: 'Error updating book rating', error: err2 });
        res.json({ message: 'Rating submitted successfully', rating, rating_count, rating_sum });
      });
    });
  });
};

// === POST: Nhập sách từ OpenLibrary ===
exports.importFromOpenLibrary = async (req, res) => {
  const { olid, genre } = req.body;
  if (!olid) return res.status(400).json({ message: 'Missing OLID' });

  try {
    const editionRes = await fetch(`https://openlibrary.org/books/${olid}.json`);
    if (!editionRes.ok) return res.status(404).json({ message: `Edition ${olid} not found` });
    const edition = await editionRes.json();

    const workKey = edition.works?.[0]?.key?.split('/').pop();
    if (!workKey) return res.status(400).json({ message: `Work not found for ${olid}` });

    const workRes = await fetch(`https://openlibrary.org/works/${workKey}.json`);
    if (!workRes.ok) return res.status(404).json({ message: `Work ${workKey} not found` });
    const work = await workRes.json();

    let author = 'Unknown author';
    const authorKey = edition.authors?.[0]?.key;
    if (authorKey) {
      try {
        const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`);
        if (authorRes.ok) {
          const authorData = await authorRes.json();
          author = authorData.name || author;
        }
      } catch (_) {}
    }

    const description = typeof work.description === 'object'
      ? work.description?.value
      : work.description || '';

    const coverUrl = work.covers?.length > 0
      ? `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg`
      : '';

    const subjects = work.subjects || [];
    const genreFinal = genre || extractGenre(subjects);
    const rating = work.ratings_average || 0;
    const ratingCount = work.ratings_count || 0;
    const ratingSum = work.ratings_sum || 0;
    const link = `https://openlibrary.org/books/${olid}`;
    const title = edition.title || 'Untitled';

    const checkSql = 'SELECT id FROM books WHERE link = ?';
    db.query(checkSql, [link], (err, found) => {
      if (err) return res.status(500).json({ message: 'Error checking for duplicate book', error: err });
      if (found.length > 0) return res.status(409).json({ message: 'Book already exists in the system' });

      const insertSql = `
        INSERT INTO books (title, author, description, link, source, cover_url, subjects, rating, rating_count, rating_sum, genre)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [title, author, description, link, 'openlib', coverUrl, JSON.stringify(subjects), rating, ratingCount, ratingSum, genreFinal];

      db.query(insertSql, values, (err2, result) => {
        if (err2) return res.status(500).json({ message: 'Failed to save Open Library book', error: err2 });
        res.status(201).json({ message: 'Book imported successfully', id: result.insertId });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching from Open Library', error: error.message });
  }
};

// === GET: Thống kê đánh giá theo mức rating
exports.getBookRatings = (req, res) => {
  const bookId = req.params.bookId;
  const sql = `
    SELECT rating, COUNT(*) as count
    FROM comments
    WHERE book_id = ?
    GROUP BY rating
    ORDER BY rating DESC
  `;
  db.query(sql, [bookId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error retrieving rating statistics', error: err });
    res.json(results);
  });
};

// === GET: Lọc sách theo thể loại
exports.getBooksByGenre = (req, res) => {
  const raw = req.params.type.toLowerCase();
  const genreMap = {
    "science-fiction": "science fiction",
    "romance": "romance",
    "history": "history",
    "adventure": "adventure",
    "technology": "technology",
    "economics": "economics",
    "thriller": "thriller",
    "education": "education"
  };

  const genre = genreMap[raw] || raw;
  const sql = `
    SELECT id, title, author, cover_url, rating, subjects, genre
    FROM books
    WHERE LOWER(genre) = ?
    ORDER BY id DESC
  `;
  db.query(sql, [genre], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error filtering books by genre', error: err });
    res.json(results);
  });
};

// === PUT: Cập nhật sách
exports.updateBook = (req, res) => {
  const bookId = req.params.id;
  const { title, author, description, cover_url, genre } = req.body;

  if (!title || !author) {
    return res.status(400).json({ message: 'Missing title or author' });
  }

  const sql = `
    UPDATE books 
    SET title = ?, author = ?, description = ?, cover_url = ?, genre = ?
    WHERE id = ?
  `;
  db.query(sql, [title, author, description, cover_url, genre, bookId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to update book', error: err });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found to update' });
    }

    res.json({ message: 'Book updated successfully' });
  });
};

// === DELETE: Xóa sách
exports.deleteBook = (req, res) => {
  const bookId = req.params.id;
  db.query('DELETE FROM books WHERE id = ?', [bookId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to delete book', error: err });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found to delete' });
    }

    res.json({ message: 'Book deleted successfully' });
  });
};
