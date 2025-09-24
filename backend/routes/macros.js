const express = require('express');
const Macro = require('../models/Macro');
const router = express.Router();

// GET: Lấy tất cả macros
router.get('/', async (req, res) => {
  try {
    const macros = await Macro.find().sort({ title: 1 });
    res.json(macros);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Tạo macro mới
router.post('/', async (req, res) => {
  const { title, category, content } = req.body;
  if (!title || !category || !content) {
    return res.status(400).json({ message: 'Tiêu đề, danh mục và nội dung là bắt buộc.' });
  }

  const newMacro = new Macro({ title, category, content });
  try {
    const savedMacro = await newMacro.save();
    res.status(201).json(savedMacro);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT: Cập nhật macro
router.put('/:id', async (req, res) => {
  try {
    const { title, category, content } = req.body;
    const updatedMacro = await Macro.findByIdAndUpdate(
      req.params.id, 
      { title, category, content }, 
      { new: true, runValidators: true }
    );
    if (!updatedMacro) return res.status(404).send('Không tìm thấy macro.');
    res.json(updatedMacro);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi khi cập nhật macro.' });
  }
});

// DELETE: Xóa macro
router.delete('/:id', async (req, res) => {
  try {
    const macro = await Macro.findByIdAndDelete(req.params.id);
    if (!macro) return res.status(404).send('Không tìm thấy macro.');
    res.status(200).send('Đã xóa macro thành công.');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
