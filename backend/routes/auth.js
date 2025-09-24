const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Endpoint đăng nhập
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).send('Tên đăng nhập hoặc mật khẩu không đúng.');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(400).send('Tên đăng nhập hoặc mật khẩu không đúng.');
  }

  const token = jwt.sign(
    { id: user._id, role: user.role, username: user.username }, 
    process.env.JWT_SECRET || 'your_jwt_secret', 
    { expiresIn: '1h' }
  );
  
  // Trả về cả token và thông tin user
  res.json({ token, user: { username: user.username, role: user.role } });
});

module.exports = router;
