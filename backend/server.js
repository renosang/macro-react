require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const analyticsRoutes = require('./routes/analytics');
const linkRoutes = require('./routes/links');
const taskRoutes = require('./routes/tasks');

const app = express();
app.use(cors());
app.use(express.json());

// --- Routes ---
const { router: authRoutes } = require('./routes/auth');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const macroRoutes = require('./routes/macros');
const announcementRoutes = require('./routes/announcements');
const aiRoutes = require('./routes/ai');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/macros', macroRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/tasks', taskRoutes);

// --- MongoDB Connection ---
// The MONGODB_URI should be in your .env file or Vercel environment variables
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Start Server for Local Development ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// --- Vercel Deployment Export ---
module.exports = app;

