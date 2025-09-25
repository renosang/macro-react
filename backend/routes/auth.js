const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware để xác thực token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Lấy token từ header 'Bearer YOUR_TOKEN'

  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }
    req.user = decoded; // Gắn thông tin user đã giải mã vào request
    next();
  });
};


// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role: role || 'user' });
    await newUser.save();
    res.status(201).send({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({ message: 'Invalid password.' });
    }

    const token = jwt.sign(
    { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
    { expiresIn: '1h' }
    );

    res.status(200).send({
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      token: token,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Export router và cả middleware verifyToken
module.exports = { router, verifyToken };