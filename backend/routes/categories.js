// backend/routes/categories.js
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
  // Lấy thêm 'parent' từ body
  const { name, parent } = req.body; 
  if (!name) {
    return res.status(400).json({ message: 'Tên danh mục là bắt buộc.' });
  }
  
  // Tạo category mới với 'name' và 'parent'
  const newCategory = new Category({ 
    name, 
    parent: parent || null // Nếu parent là "" hoặc undefined, gán là null
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
        const { name, parent } = req.body; // Lấy thêm 'parent'
        
        const updatedCategory = await Category.findByIdAndUpdate(
          req.params.id, 
          { name: name, parent: parent || null }, // Cập nhật cả 'name' và 'parent'
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

    // 1. Tìm và xóa danh mục
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) return res.status(404).send('Không tìm thấy danh mục.');

    // 2. Cập nhật các danh mục con, set 'parent' của chúng về null (thành danh mục gốc)
    await Category.updateMany(
      { parent: categoryId }, 
      { $set: { parent: null } }
    );
    
    // 3. (Tùy chọn) Cập nhật các macro đang dùng danh mục này
    // Gán chúng về 'Chưa phân loại'
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
