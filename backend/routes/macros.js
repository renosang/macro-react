const express = require('express');
const Macro = require('../models/Macro');

const router = express.Router();

// LẤY TẤT CẢ MACRO
router.get('/', async (req, res) => {
  try {
    const macros = await Macro.find({}); // Lấy tất cả macro, không phân biệt trạng thái
    res.json(macros);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// TẠO MACRO MỚI
router.post('/', async (req, res) => {
  try {
    // --- SỬA LỖI TẠI ĐÂY ---
    // Lấy thêm trường 'status' từ request body
    const { title, content, category, keywords, status } = req.body;

    const newMacro = new Macro({
      title,
      content,
      category,
      keywords,
      // Sử dụng trạng thái được gửi từ frontend,
      // nếu không có thì mặc định là 'pending'
      status: status || 'pending',
    });
    // -------------------------

    const savedMacro = await newMacro.save();
    res.status(201).json(savedMacro);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// CẬP NHẬT MACRO
router.put('/:id', async (req, res) => {
  try {
    const { title, category, content, status } = req.body;
    const updateData = {
      title,
      category,
      content,
      status
    };

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
        const deletedMacro = await Macro.findByIdAndDelete(req.params.id);
        if (!deletedMacro) {
            return res.status(404).json({ message: "Không tìm thấy macro" });
        }
        res.json({ message: "Đã xóa macro thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// TĂNG SỐ LƯỢT SỬ DỤNG MACRO
router.put('/:id/increment-usage', async (req, res) => {
  try {
    const updatedMacro = await Macro.findByIdAndUpdate(
      req.params.id,
      { $inc: { useCount: 1 } }, // Tăng useCount lên 1
      { new: true }
    );
    if (!updatedMacro) {
      return res.status(404).send('Không tìm thấy macro.');
    }
    res.json(updatedMacro);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;