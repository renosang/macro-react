// backend/routes/users.js
const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// Lấy tất cả người dùng
router.get('/', protect, admin, async (req, res) => { 
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tạo người dùng mới
router.post('/', protect, admin, async (req, res) => {
  const { username, password, role, fullName, email } = req.body;
  try {
    const newUser = new User({ username, password, role, fullName, email }); // Gửi password (thô)
    await newUser.save(); // Model's pre-save hook sẽ chạy ở đây
    const userResponse = newUser.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật thông tin người dùng
router.put('/:id', protect, admin, async (req, res) => { 
  try {
    const { role, fullName, email, password } = req.body; // Thêm 'password'

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('Không tìm thấy người dùng.');

    user.role = role || user.role;
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;

    // Nếu admin gửi mật khẩu mới, gán nó (hook sẽ hash)
    if (password) {
      user.password = password; // Gửi password (thô)
    }

    const updatedUser = await user.save(); // Model's pre-save hook sẽ chạy
    
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    res.json(userResponse);
    
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// -----------------------------------------------------------------

// Đặt lại mật khẩu
router.post('/:id/reset-password', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('Không tìm thấy người dùng.');
        user.password = req.body.password; // Gửi password (thô)
        await user.save();
        res.send('Mật khẩu đã được đặt lại thành công.');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Xóa người dùng
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send('Không tìm thấy người dùng.');
    res.send('Người dùng đã được xóa.');
  } catch (err) { 
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;