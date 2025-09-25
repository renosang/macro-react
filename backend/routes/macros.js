const express = require('express');
const Macro = require('../models/Macro');
const { verifyToken } = require('./auth'); // <-- Import middleware

const router = express.Router();

// LẤY TẤT CẢ MACRO ĐÃ ĐƯỢC DUYỆT (CHO USER THÔNG THƯỜNG) - Không cần xác thực
router.get('/', async (req, res) => {
  try {
    const macros = await Macro.find({ status: 'approved' });
    res.json(macros);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LẤY TẤT CẢ MACRO (CHO ADMIN QUẢN LÝ) - Cần xác thực
router.get('/all', verifyToken, async (req, res) => {
    try {
      const macros = await Macro.find();
      res.json(macros);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

// LẤY CÁC MACRO ĐANG CHỜ DUYỆT (CHO ADMIN KIỂM DUYỆT) - Cần xác thực
router.get('/pending', verifyToken, async (req, res) => {
    try {
        const pendingMacros = await Macro.find({ status: 'pending' });
        res.json(pendingMacros);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// USER/ADMIN TẠO MACRO MỚI - Cần xác thực
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content, category, keywords } = req.body;
    
    // Bây giờ req.user đã được đảm bảo tồn tại nhờ verifyToken
    const newMacro = new Macro({
      title,
      content,
      category,
      keywords,
      createdBy: req.user.id, // Sử dụng req.user.id
      lastModifiedBy: req.user.id, // Sử dụng req.user.id
      status: 'pending',
    });

    const savedMacro = await newMacro.save();
    res.status(201).json(savedMacro);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ADMIN CẬP NHẬT MACRO (BAO GỒM CẢ VIỆC DUYỆT) - Cần xác thực
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, category, content, status } = req.body;
    const updateData = { 
      title, 
      category, 
      content, 
      status,
      lastModifiedBy: req.user.id // Cập nhật người sửa cuối cùng
    };
    
    const updatedMacro = await Macro.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedMacro) return res.status(404).send('Không tìm thấy macro.');
    res.json(updatedMacro);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ADMIN XÓA MACRO - Cần xác thực
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const deletedMacro = await Macro.findByIdAndDelete(req.params.id);
        if (!deletedMacro) {
            return res.status(404).json({ message: "Không tìm thấy macro" });
        }
        res.json({ message: "Đã xóa macro thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;