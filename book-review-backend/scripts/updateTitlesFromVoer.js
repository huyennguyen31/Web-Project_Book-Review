const db = require('../config/db');
const { crawlVoerBook } = require('../services/voerService_new');

async function updateMissingTitles() {
  const sql = `
    SELECT id, link FROM books 
    WHERE (title IS NULL OR title = '' OR title = 'Không tiêu đề')
    AND link LIKE '%voer.edu.vn%'
  `;

  db.query(sql, async (err, books) => {
    if (err) {
      console.error('❌ Lỗi truy vấn DB:', err.message);
      return;
    }

    console.log(`🔍 Đang kiểm tra ${books.length} sách cần cập nhật tiêu đề...`);

    for (const book of books) {
      try {
        const { title } = await crawlVoerBook(book.link);

        if (title && title.trim() !== '' && title !== 'Không tiêu đề') {
          db.query(`UPDATE books SET title = ? WHERE id = ?`, [title.trim(), book.id], (err) => {
            if (err) {
              console.error(`❌ Lỗi cập nhật ID ${book.id}:`, err.message);
            } else {
              console.log(`✅ Đã cập nhật title cho ID ${book.id}: ${title}`);
            }
          });
        } else {
          console.log(`⚠️ Không tìm được tiêu đề hợp lệ cho ID ${book.id}`);
        }
      } catch (err) {
        console.error(`⚠️ Lỗi crawl sách ID ${book.id}:`, err.message);
      }
    }
  });
}

updateMissingTitles();
