// backend/routes/users.js
const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Lấy tất cả người dùng
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tạo người dùng mới
router.post('/', async (req, res) => {
  // ---- CẬP NHẬT ----
  const { username, password, role, fullName, email } = req.body;
  try {
    const newUser = new User({ username, password, role, fullName, email });
    await newUser.save();
    // Trả về đối tượng người dùng không bao gồm mật khẩu
    const userResponse = newUser.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  // ---- KẾT THÚC CẬP NHẬT ----
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật thông tin người dùng
router.put('/:id', async (req, res) => {
  // ---- CẬP NHẬT ----
  try {
    // Lấy các trường cần cập nhật từ body
    const { role, fullName, email } = req.body;
    const updateData = { role, fullName, email };

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).send('Không tìm thấy người dùng.');
    res.json(user);
  // ---- KẾT THÚC CẬP NHẬT ----
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Đặt lại mật khẩu (Không thay đổi)
router.post('/:id/reset-password', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('Không tìm thấy người dùng.');
        user.password = req.body.password;
        await user.save();
        res.send('Mật khẩu đã được đặt lại thành công.');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Xóa người dùng (Không thay đổi)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send('Không tìm thấy người dùng.');
    res.send('Người dùng đã được xóa.');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;