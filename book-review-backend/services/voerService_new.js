const axios = require('axios');
const cheerio = require('cheerio');

async function crawlVoerBook(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://voer.edu.vn/'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // Ưu tiên tiêu đề chuẩn từ <title>
    let title = $('title').first().text().split('|')[0].trim();

    // Nếu title vẫn thiếu → fallback sang h1
    if (!title || title.length < 5) {
      title =
        $('h1.title, h1.article-title, .chapter__title, .main__title').first().text().trim() ||
        $('h2, h3').first().text().trim() ||
        'Không tiêu đề';
    }

    // Nội dung bài viết
    const content = $('.content-detail, .main__content, .chapter__content').first().html();

    if (!content) {
      throw new Error('Không tìm thấy nội dung bài viết phù hợp.');
    }

    return { title, content };
  } catch (err) {
    console.error('Lỗi crawl VOER:', err.message);
    throw new Error('Không thể lấy dữ liệu từ VOER');
  }
}

module.exports = { crawlVoerBook };
