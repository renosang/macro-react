const express = require('express');
const Category = require('../models/Category');
const Macro = require('../models/Macro');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean(); 
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  const { name, parent } = req.body; 
  if (!name) {
    return res.status(400).json({ message: 'Tên danh mục là bắt buộc.' });
  }
  
  const newCategory = new Category({ 
    name, 
    parent: parent || null 
  });

  try {
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).json({ message: 'Tên danh mục có thể đã tồn tại.' });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, parent } = req.body; 
        
        const updatedCategory = await Category.findByIdAndUpdate(
          req.params.id, 
          { name: name, parent: parent || null }, 
          { new: true }
        );
        
        if (!updatedCategory) return res.status(404).send('Không tìm thấy danh mục.');
        res.json(updatedCategory);
    } catch (err) {
        res.status(400).json({ message: 'Lỗi khi cập nhật danh mục.' });
    }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) return res.status(404).send('Không tìm thấy danh mục.');

    await Category.updateMany(
      { parent: categoryId }, 
      { $set: { parent: null } }
    );
    
    await Macro.updateMany(
        { category: category.name },
        { $set: { category: 'Chưa phân loại' } }
    );

    res.status(200).send('Danh mục đã được xóa thành công. Các danh mục con đã được chuyển thành danh mục gốc.');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;