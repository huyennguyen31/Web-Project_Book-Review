const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '310104', 
  database: 'book_review'
});

connection.connect((err) => {
  if (err) {
    console.error('Kết nối MySQL thất bại:', err.message);
    return;
  }
  console.log('Kết nối MySQL thành công!');
});

module.exports = connection;
