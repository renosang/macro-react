// backend/routes/categories.js
const express = require('express');
const Category = require('../models/Category');
const router = express.Router();

// LẤY TẤT CẢ DANH MỤC
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// TẠO MỚI MỘT DANH MỤC
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Tên danh mục là bắt buộc.' });
  }
  const newCategory = new Category({ name });
  try {
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).json({ message: 'Tên danh mục có thể đã tồn tại.' });
  }
});

// CẬP NHẬT MỘT DANH MỤC
router.put('/:id', async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
        if (!updatedCategory) return res.status(404).send('Không tìm thấy danh mục.');
        res.json(updatedCategory);
    } catch (err) {
        res.status(400).json({ message: 'Lỗi khi cập nhật danh mục.' });
    }
});

// XÓA MỘT DANH MỤC
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).send('Không tìm thấy danh mục.');
    res.status(200).send('Danh mục đã được xóa thành công.');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;