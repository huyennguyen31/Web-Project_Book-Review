const axios = require('axios');
const mysql = require('mysql2/promise');

// 1. Hàm phân loại lại thể loại từ subjects
const extractGenreFromSubjects = (subjects) => {
  const text = subjects.map(s => s.toLowerCase()).join(' ');
  if (text.includes('romance') || text.includes('love')) return 'romance';
  if (text.includes('science')) return 'science';
  if (text.includes('history') || text.includes('historical')) return 'history';
  if (text.includes('horror')) return 'horror';
  if (text.includes('detective') || text.includes('crime') || text.includes('mystery')) return 'detective';
  if (text.includes('adventure')) return 'adventure';
  return null;
};

// 2. Kết nối DB
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // thay bằng mật khẩu thực tế
  database: 'bookdb',
  waitForConnections: true,
  connectionLimit: 10,
});

// 3. Hàm xử lý cập nhật
const updateUnknownGenres = async () => {
  const [books] = await db.query(`SELECT id, link FROM books WHERE genre IS NULL OR genre = 'unknown'`);

  console.log(`🔍 Đang xử lý ${books.length} sách có genre = unknown`);

  let updated = 0;

  for (const book of books) {
    const olid = book.link?.split('/').pop();
    if (!olid) continue;

    try {
      const editionRes = await axios.get(`https://openlibrary.org/books/${olid}.json`);
      const workKey = editionRes.data.works?.[0]?.key?.split('/').pop();
      if (!workKey) continue;

      const workRes = await axios.get(`https://openlibrary.org/works/${workKey}.json`);
      const subjects = workRes.data.subjects || [];
      const genre = extractGenreFromSubjects(subjects);

      if (genre) {
        await db.query(`UPDATE books SET genre = ? WHERE id = ?`, [genre, book.id]);
        console.log(`✅ Cập nhật: ${olid} → ${genre}`);
        updated++;
      } else {
        console.log(`⚠️ Không xác định được thể loại: ${olid}`);
      }
    } catch (err) {
      console.log(`❌ Lỗi xử lý ${olid}:`, err.message);
    }
  }

  console.log(`\n🎉 Đã cập nhật xong ${updated} sách.`);
};

updateUnknownGenres();
