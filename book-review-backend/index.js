const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./config/db');

const PORT = 4000;

// ✅ Middleware toàn cục
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const commentRoutes = require('./routes/commentRoutes');
const cookieRoutes = require('./routes/cookieRoutes');
const adminRoutes = require('./routes/adminRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const viewRoutes = require('./routes/viewRoutes');

// ✅ Test
app.get('/', (req, res) => {
  res.send('🎉 API Book Review đang chạy!');
});

// ✅ Mount routes
app.use('/api', authRoutes);
app.use('/api', bookRoutes);
app.use('/api', commentRoutes);
app.use('/api', cookieRoutes);
app.use('/api/admin', adminRoutes); // 🔥 Chính xác
app.use('/api', feedbackRoutes);
app.use('/api', viewRoutes);

// ✅ Kết nối DB và chạy server
db.connect((err) => {
  if (err) {
    console.error('❌ Kết nối MySQL thất bại:', err.message);
    process.exit(1);
  }

  console.log('✅ Kết nối MySQL thành công!');
  app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
  });
});
