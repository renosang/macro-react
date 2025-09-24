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
  const { username, password, role } = req.body;
  try {
    const newUser = new User({ username, password, role });
    await newUser.save();
    res.status(201).json({_id: newUser._id, username: newUser.username, role: newUser.role});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật thông tin người dùng (phân quyền)
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
    if (!user) return res.status(404).send('Không tìm thấy người dùng.');
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Đặt lại mật khẩu
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


// Xóa người dùng
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