// backend/routes/macros.js
const express = require('express');
const router = express.Router();
const Macro = require('../models/Macro');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/macros - Lấy tất cả macro
router.get('/', protect, async (req, res) => {
  try {
    const macros = await Macro.find()
      .sort({ updatedAt: -1 })
      
      // ----- SỬA ĐỔI QUAN TRỌNG -----
      // Populate để lấy thông tin category (tên, _id, parent)
      // và thông tin người tạo/sửa
      .populate('category') 
      .populate('createdBy', 'fullName') 
      .populate('lastModifiedBy', 'fullName');
    // -----------------------------
      
    res.json(macros);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/macros - Tạo macro mới
router.post('/', protect, async (req, res) => {
  // `category` nhận từ body giờ sẽ là ID
  const { title, category, content, status, platformTags } = req.body;

  if (!title || !category || !content) {
    return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin.' });
  }

  const macro = new Macro({
    title,
    category, // Lưu ID trực tiếp
    content,
    status: (req.user && req.user.role === 'admin' && status) ? status : 'pending',
    platformTags,
    createdBy: req.user._id,
    lastModifiedBy: req.user._id
  });

  try {
    const newMacro = await macro.save();
    // Populate ngược lại để trả về data đầy đủ cho client
    const populatedMacro = await Macro.findById(newMacro._id)
        .populate('category')
        .populate('createdBy', 'fullName');
    res.status(201).json(populatedMacro);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/macros/:id - Cập nhật macro
router.put('/:id', protect, admin, async (req, res) => {
  // `category` nhận từ body giờ sẽ là ID
  const { title, category, content, status, platformTags } = req.body;

  try {
    const macro = await Macro.findById(req.params.id);
    if (!macro) return res.status(404).json({ message: 'Không tìm thấy macro.' });

    macro.title = title || macro.title;
    macro.category = category || macro.category; // Lưu ID
    macro.content = content || macro.content;
    macro.status = status || macro.status;
    macro.platformTags = platformTags !== undefined ? platformTags : macro.platformTags;
    macro.lastModifiedBy = req.user._id;

    const updatedMacro = await macro.save();
    const populatedMacro = await Macro.findById(updatedMacro._id)
        .populate('category')
        .populate('createdBy', 'fullName')
        .populate('lastModifiedBy', 'fullName');
        
    res.json(populatedMacro);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const macro = await Macro.findByIdAndDelete(req.params.id);
    if (!macro) return res.status(404).json({ message: 'Không tìm thấy macro.' });
    res.json({ message: 'Xóa macro thành công.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/increment-usage', protect, async (req, res) => {
    try {
        const macro = await Macro.findByIdAndUpdate(
            req.params.id,
            { $inc: { useCount: 1 } },
            { new: true }
        );
        if (!macro) return res.status(404).send('Không tìm thấy macro.');
        res.json(macro);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;