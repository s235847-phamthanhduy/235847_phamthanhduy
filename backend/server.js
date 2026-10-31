require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const origins = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: origins === '*' ? '*' : origins.split(',').map((s) => s.trim()) }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

app.use('/api/devices', require('./routes/devices'));

app.use((req, res) => res.status(404).json({ message: 'Không tìm thấy đường dẫn' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server chạy ở cổng ${PORT}`));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối MongoDB Atlas'))
  .catch((err) => console.error('Lỗi kết nối MongoDB:', err.message));