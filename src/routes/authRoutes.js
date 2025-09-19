// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import User model

// === ĐĂNG KÝ TÀI KHOẢN MỚI ===
// @route   POST /api/auth/register
// @desc    Tạo một user mới
// @access  Public
router.post('/register', async (req, res) => {
  // 1. Lấy username, password, role từ request body
  const { username, password, role } = req.body;

  // 2. Kiểm tra dữ liệu đầu vào đơn giản
  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng cung cấp tên đăng nhập và mật khẩu.' });
  }

  try {
    // 3. Kiểm tra xem username đã tồn tại chưa
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(409).json({ message: 'Tên đăng nhập này đã tồn tại.' });
    }

    // 4. Tạo một user mới
    const newUser = new User({
      username,
      password, // Mongoose middleware sẽ tự động hash mật khẩu này
      role,     // Nếu không cung cấp, role sẽ mặc định là 'user'
    });

    // 5. Lưu user vào database
    const savedUser = await newUser.save();

    // 6. Trả về thông báo thành công
    // Không bao giờ trả về mật khẩu trong response!
    res.status(201).json({
      message: 'Tạo tài khoản thành công!',
      user: {
        id: savedUser._id,
        username: savedUser.username,
        role: savedUser.role,
      }
    });

  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
});

module.exports = router;