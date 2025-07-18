const axios = require('axios');
const fs = require('fs');
const path = require('path');

axios.defaults.timeout = 10000;

const API_ENDPOINT = 'http://localhost:4000/api/books/import-openlibrary';
const LOG_FILE = path.join(__dirname, 'error.txt');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const existingLinks = new Set();

// Tải danh sách sách đã có để tránh trùng lặp
const loadExistingBooks = async () => {
  try {
    const res = await axios.get('http://localhost:4000/api/books');
    res.data.forEach(book => {
      if (book.link) {
        existingLinks.add(book.link.trim());
      }
    });
    console.log(`🗂️ Đã tải ${existingLinks.size} sách từ database`);
  } catch (err) {
    console.error('❌ Không thể tải danh sách sách từ backend:', err.message);
  }
};

// Tìm sách từ từ khóa
const searchBooks = async (query) => {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=150`;
  try {
    const res = await axios.get(url);
    return res.data.docs || [];
  } catch (err) {
    console.error(`❌ Không thể tìm sách với từ khóa ${query}:`, err.message);
    return [];
  }
};

// Phân loại thể loại từ subjects
const extractGenreFromSubjects = (subjects = []) => {
  const text = subjects.join(' ').toLowerCase();

  if (text.includes('science fiction') || text.includes('sci-fi')) return 'science fiction';
  if (text.includes('romance') || text.includes('love')) return 'romance';
  if (text.includes('history') || text.includes('historical')) return 'history';
  if (text.includes('adventure')) return 'adventure';
  if (text.includes('technology') || text.includes('tech')) return 'technology';
  if (text.includes('economics') || text.includes('finance') || text.includes('business')) return 'economics';
  if (text.includes('thriller') || text.includes('crime') || text.includes('mystery')) return 'thriller';
  if (text.includes('education') || text.includes('academic') || text.includes('study')) return 'education';

  return 'unknown';
};

// Gửi OLID về backend
const importBookByOLID = async (olid, retry = 0) => {
  const link = `https://openlibrary.org/books/${olid}`;
  if (existingLinks.has(link)) {
    console.log(`⚠️ Bỏ qua ${olid} vì đã tồn tại`);
    return false;
  }

  try {
    const editionRes = await axios.get(`https://openlibrary.org/books/${olid}.json`);
    const edition = editionRes.data;
    const workKey = edition.works?.[0]?.key?.split('/').pop();

    let genre = 'unknown';
    if (workKey) {
      const workRes = await axios.get(`https://openlibrary.org/works/${workKey}.json`);
      const subjects = workRes.data.subjects || [];
      genre = extractGenreFromSubjects(subjects);
    }

    await axios.post(API_ENDPOINT, { olid, genre });
    console.log(`✅ Thêm thành công: ${olid} (${genre})`);
    existingLinks.add(link); // Thêm vào danh sách đã có
    return true;

  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message || err.message || 'Không rõ lỗi';

    if (status === 409) {
      console.log(`⚠️ Bỏ qua ${olid}: sách đã có (HTTP 409)`);
      return false;
    }

    console.log(`❌ Lỗi khi thêm ${olid}: ${msg} (HTTP ${status || '?'})`);
    fs.appendFileSync(LOG_FILE, `${olid} - ${msg} - status: ${status}\n`);

    if (retry < 1) {
      console.log(`🔁 Thử lại ${olid} (lần ${retry + 2}/2) sau 2s...`);
      await sleep(2000);
      return importBookByOLID(olid, retry + 1);
    }

    return false;
  }
};

// Nhập theo từ khóa (thể loại)
const importBooksByKeyword = async (keyword) => {
  console.log(`\n📚 Nhập sách thể loại: ${keyword}`);
  const books = await searchBooks(keyword);
  let success = 0;
  let fail = 0;

  for (const book of books) {
    const olid = book.cover_edition_key || book.edition_key?.[0];
    if (olid) {
      const result = await importBookByOLID(olid);
      result ? success++ : fail++;
      await sleep(1000);
    }
  }

  console.log(`📘 [${keyword}] ✅ ${success} thành công – ❌ ${fail} bị trùng/lỗi`);
};

// Hàm chính
const main = async () => {
  const genres = [
    'science fiction',
    'romance',
    'history',
    'adventure',
    'technology',
    'economics',
    'thriller',
    'education'
  ];

  if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);

  await loadExistingBooks();

  for (const genre of genres) {
    await importBooksByKeyword(genre);
  }

  console.log('\n✅ Đã nhập xong tất cả thể loại!');
};

main();
