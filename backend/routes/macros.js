const express = require('express');
const Macro = require('../models/Macro');
const router = express.Router();

// LẤY TẤT CẢ MACRO ĐÃ ĐƯỢC DUYỆT (CHO USER THÔNG THƯỜNG)
router.get('/', async (req, res) => {
  try {
    const macros = await Macro.find({ status: 'approved' });
    res.json(macros);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LẤY TẤT CẢ MACRO (CHO ADMIN QUẢN LÝ)
router.get('/all', async (req, res) => {
    try {
      const macros = await Macro.find();
      res.json(macros);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

// LẤY CÁC MACRO ĐANG CHỜ DUYỆT (CHO ADMIN KIỂM DUYỆT)
router.get('/pending', async (req, res) => {
    try {
        const pendingMacros = await Macro.find({ status: 'pending' });
        res.json(pendingMacros);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// USER ĐÓNG GÓP MACRO MỚI (ENDPOINT CÒN THIẾU)
router.post('/contribute', async (req, res) => {
    const { title, category, content, submittedBy } = req.body;
    try {
        const newMacro = new Macro({
            title,
            category,
            content,
            submittedBy,
            status: 'pending' // Mặc định là chờ duyệt
        });
        const savedMacro = await newMacro.save();
        res.status(201).json(savedMacro);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ADMIN TẠO MACRO MỚI (MẶC ĐỊNH LÀ ĐÃ DUYỆT)
router.post('/', async (req, res) => {
  try {
    const { title, content, category, keywords } = req.body;
    const createdBy = req.user._id; // Lấy user ID từ middleware xác thực
    const lastModifiedBy = req.user._id; // Lấy user ID từ middleware xác thực

    const newMacro = new Macro({
      title,
      content,
      category,
      keywords,
      createdBy,
      lastModifiedBy,
      status: 'pending', // Mặc định là pending khi tạo mới
    });

    const savedMacro = await newMacro.save();
    res.status(201).json(savedMacro);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ADMIN CẬP NHẬT MACRO (BAO GỒM CẢ VIỆC DUYỆT)
router.put('/:id', async (req, res) => {
  try {
    // Chỉ lấy các trường cần thiết để tránh lỗi bảo mật
    const { title, category, content, status } = req.body;
    const updateData = { title, category, content, status };
    
    const updatedMacro = await Macro.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedMacro) return res.status(404).send('Không tìm thấy macro.');
    res.json(updatedMacro);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// XÓA MACRO
router.delete('/:id', async (req, res) => {
  try {
    const macro = await Macro.findByIdAndDelete(req.params.id);
    if (!macro) return res.status(404).send('Không tìm thấy macro.');
    res.status(200).send('Macro đã được xóa thành công.');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

