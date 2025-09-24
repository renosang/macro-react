require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- Routes ---
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const macroRoutes = require('./routes/macros');
const announcementRoutes = require('./routes/announcements'); // Đảm bảo dòng này tồn tại

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/macros', macroRoutes);
app.use('/api/announcements', announcementRoutes); // Và dòng này cũng tồn tại

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Vercel Deployment Export ---
// Dòng app.listen chỉ cần thiết cho local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;

