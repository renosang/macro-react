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
  // Thêm 'fullName'
  const { username, fullName, email, password, role } = req.body;
  try {
    const newUser = new User({ username, fullName, email, password, role });
    await newUser.save();
    res.status(201).json({_id: newUser._id, username: newUser.username, fullName: newUser.fullName, email: newUser.email, role: newUser.role});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật thông tin người dùng
router.put('/:id', async (req, res) => {
  try {
    // Thêm 'fullName'
    const { fullName, email, role, password } = req.body;
    const userToUpdate = await User.findById(req.params.id);

    if (!userToUpdate) {
      return res.status(404).send('Không tìm thấy người dùng.');
    }

    if (fullName) userToUpdate.fullName = fullName;
    if (email) userToUpdate.email = email;
    if (role) userToUpdate.role = role;
    if (password) {
      userToUpdate.password = password;
    }

    const updatedUser = await userToUpdate.save();
    
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role
    });

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