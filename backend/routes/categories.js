// backend/routes/categories.js
const express = require('express');
const Category = require('../models/Category');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// LẤY TẤT CẢ DANH MỤC (CÓ PHÂN CẤP)
router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    // --- LOGIC TẠO CẤU TRÚC CÂY ---
    const categoryMap = {};
    const rootCategories = [];

    // Tạo map để dễ truy cập category bằng ID
    categories.forEach(category => {
      categoryMap[category._id] = { ...category.toObject(), children: [] };
    });

    // Xây dựng cây
    categories.forEach(category => {
      const categoryNode = categoryMap[category._id];
      if (category.parent && categoryMap[category.parent]) {
        // Nếu có cha và cha tồn tại trong map, thêm vào children của cha
        categoryMap[category.parent].children.push(categoryNode);
      } else {
        // Nếu không có cha (hoặc cha không tồn tại), nó là danh mục gốc
        rootCategories.push(categoryNode);
      }
    });
    // --- KẾT THÚC LOGIC CÂY ---

    res.json(rootCategories); // Trả về danh sách các danh mục gốc (đã chứa con cháu)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// TẠO MỚI MỘT DANH MỤC
router.post('/', protect, admin, async (req, res) => {
  // --- CẬP NHẬT: Thêm parent ---
  const { name, parent } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Tên danh mục là bắt buộc.' });
  }
  const newCategory = new Category({
    name,
    parent: parent || null // Gán parent nếu có, nếu không thì null
  });
  // --- KẾT THÚC CẬP NHẬT ---
  try {
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).json({ message: 'Tên danh mục có thể đã tồn tại.' });
  }
});

// CẬP NHẬT MỘT DANH MỤC
router.put('/:id', protect, admin, async (req, res) => {
    try {
        // --- CẬP NHẬT: Thêm parent ---
        const { name, parent } = req.body;
        if (!name) {
          return res.status(400).json({ message: 'Tên danh mục là bắt buộc.' });
        }
        // Ngăn chặn việc tự đặt mình làm cha
        if (req.params.id === parent) {
             return res.status(400).json({ message: 'Không thể đặt danh mục làm cha của chính nó.' });
        }
        // --- KẾT THÚC CẬP NHẬT ---

        const updatedCategory = await Category.findByIdAndUpdate(
          req.params.id,
          { name: name, parent: parent || null }, // Cập nhật cả name và parent
          { new: true }
        );
        if (!updatedCategory) return res.status(404).send('Không tìm thấy danh mục.');
        res.json(updatedCategory);
    } catch (err) {
        // Kiểm tra lỗi unique key (tên trùng)
        if (err.code === 11000) {
             res.status(400).json({ message: 'Tên danh mục đã tồn tại.' });
        } else {
             res.status(400).json({ message: 'Lỗi khi cập nhật danh mục.' });
        }
    }
});

// XÓA MỘT DANH MỤC (VÀ CẬP NHẬT CON NẾU CÓ)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const categoryIdToDelete = req.params.id;

    // --- CẬP NHẬT LOGIC XÓA ---
    // Tìm tất cả danh mục con trực tiếp của danh mục sắp xóa
    const childCategories = await Category.find({ parent: categoryIdToDelete });

    // Cập nhật parent của các danh mục con thành null (chuyển chúng thành danh mục gốc)
    // Hoặc bạn có thể chọn xóa luôn cả danh mục con nếu muốn: await Category.deleteMany({ parent: categoryIdToDelete });
    await Category.updateMany(
      { parent: categoryIdToDelete },
      { $set: { parent: null } }
    );

    // Xóa danh mục cha
    const deletedCategory = await Category.findByIdAndDelete(categoryIdToDelete);
    if (!deletedCategory) return res.status(404).send('Không tìm thấy danh mục.');
    // --- KẾT THÚC CẬP NHẬT ---

    res.send('Xóa danh mục thành công.');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;