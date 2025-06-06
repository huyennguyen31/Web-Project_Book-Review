const axios = require('axios');
const cheerio = require('cheerio');

async function crawlVoerBook(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://voer.edu.vn/'
      },
      timeout: 10000 // 10 giây
    });

    const $ = cheerio.load(response.data);
    const title = $('h1.title').text().trim();
    const content = $('.content-detail').html();

    return { title, content };
  } catch (err) {
    console.error('Lỗi crawl VOER:', err.message);
    throw new Error('Không thể lấy dữ liệu từ VOER');
  }
}

module.exports = { crawlVoerBook };
