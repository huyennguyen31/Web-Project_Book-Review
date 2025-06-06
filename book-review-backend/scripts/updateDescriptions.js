const mysql = require('mysql2/promise');
const fetch = require('node-fetch');

const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '310104',
  database: 'book_review'
});

// Hàm lấy workId từ link dạng /books/OLxxxM hoặc /works/OLxxxW
const extractWorkId = (link) => {
  let match = link.match(/books\/(OL[\dA-Z]+M)/);
  if (match) return match[1];

  match = link.match(/works\/(OL[\dA-Z]+W)/);
  if (match) return match[1];

  return null;
};

const getDescriptionFromWork = async (olid) => {
  try {
    // Nếu olid là sách edition thì lấy workId
    if (olid.endsWith('M')) {
      const editionRes = await fetch(`https://openlibrary.org/books/${olid}.json`);
      if (!editionRes.ok) throw new Error(`Không lấy được edition ${olid}`);
      const edition = await editionRes.json();
      const workKey = edition.works?.[0]?.key?.split("/").pop();
      if (!workKey) return null;
      olid = workKey;
    }

    const workRes = await fetch(`https://openlibrary.org/works/${olid}.json`);
    if (!workRes.ok) throw new Error(`Không lấy được work ${olid}`);
    const work = await workRes.json();

    let desc = null;

    if (typeof work.description === 'string') {
      desc = work.description;
    } else if (typeof work.description === 'object' && work.description?.value) {
      desc = work.description.value;
    }

    // Nếu mô tả là một URL thì cần fetch tiếp để lấy đoạn mô tả thật sự
    if (typeof desc === 'string' && desc.startsWith('http')) {
      const extraRes = await fetch(desc + '.json');  // Thêm .json để lấy dữ liệu json
      if (!extraRes.ok) throw new Error(`Không lấy được dữ liệu từ URL mô tả ${desc}`);
      const extraData = await extraRes.json();

      // Kiểm tra xem có trường excerpts không, thường là mảng
      if (Array.isArray(extraData.excerpts) && extraData.excerpts.length > 0) {
        // Lấy đoạn excerpt đầu tiên
        const firstExcerpt = extraData.excerpts[0];
        if (typeof firstExcerpt === 'string') {
          desc = firstExcerpt;
        } else if (typeof firstExcerpt === 'object' && firstExcerpt.excerpt) {
          desc = firstExcerpt.excerpt;
        } else {
          desc = null;
        }
      } else {
        desc = null;
      }
    }

    return desc || null;

  } catch (err) {
    console.error(`❌ Lỗi lấy mô tả cho ${olid}:`, err.message);
    return null;
  }
};


const updateDescriptions = async () => {
  try {
    const [books] = await db.query(`
      SELECT id, link, description FROM books 
      WHERE (description IS NULL OR description = '' OR description LIKE 'https://openlibrary.org/%')
      AND link LIKE '%openlibrary.org/%'
    `);

    for (const book of books) {
      const workId = extractWorkId(book.link);
      if (!workId) {
        console.log(`⚠️ Không lấy được workId từ link sách ID ${book.id}`);
        continue;
      }

      const description = await getDescriptionFromWork(workId);
      if (description) {
        // Kiểm tra nếu mô tả là URL (link đến trang OpenLibrary)
        if (description.includes('openlibrary.org')) {
          console.log(`⚠️ Mô tả của sách ID ${book.id} là URL, sẽ bỏ qua`);
          continue;
        }
        await db.query('UPDATE books SET description = ? WHERE id = ?', [description, book.id]);
        console.log(`✅ Đã cập nhật mô tả cho sách ID ${book.id}`);
      } else {
        console.log(`⚠️ Không có mô tả cho sách ID ${book.id}`);
      }
    }

    console.log('🎉 Đã hoàn tất cập nhật mô tả.');
  } catch (err) {
    console.error('❌ Lỗi trong quá trình cập nhật mô tả:', err.message);
  } finally {
    await db.end();
  }
};

updateDescriptions();
