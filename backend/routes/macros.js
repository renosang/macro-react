const MacroUsage = require('../models/MacroUsage');
const Category = require('../models/Category');
const express = require('express');
const Macro = require('../models/Macro');
const { last } = require('slate');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// LẤY TẤT CẢ MACRO
router.get('/', protect, async (req, res) => {
  try {
    // Thêm .populate() để lấy thông tin chi tiết của người tạo và người sửa
    const macros = await Macro.find({})
      .populate('createdBy', 'fullName')
      .populate('lastModifiedBy', 'fullName')
      .sort({ updatedAt: -1 });
    res.json(macros);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// TẠO MACRO MỚI
router.post('/', protect, async (req, res) => {
  try {
const { title, content, category, status, platformTags, subCategory } = req.body;

    const newMacro = new Macro({
      title,
      content,
      category,
      status: status || 'pending',
      platformTags,
      subCategory: (category === 'Macro chung' && subCategory) ? subCategory.trim() : null,
      createdBy: req.user._id,
    });

    const savedMacro = await newMacro.save();
    await savedMacro.populate('createdBy', 'fullName');
    res.status(201).json(savedMacro);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// CẬP NHẬT MACRO
router.put('/:id', protect, async (req, res) => {
  try {
const { title, category, content, status, platformTags, subCategory } = req.body;
    const updateData = {
      title,
      category,
      content,
      status,
      platformTags,
      subCategory: (category === 'Macro chung' && subCategory) ? subCategory.trim() : null,
      lastModifiedBy: req.user._id
    };

    const updatedMacro = await Macro.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedMacro) return res.status(404).send('Không tìm thấy macro.');
    res.json(updatedMacro);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// XÓA MACRO
router.delete('/:id', protect, async (req, res) => {
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

router.put('/:id/increment-usage', protect, async (req, res) => {
  try {
    const macro = await Macro.findByIdAndUpdate(
      req.params.id,
      { $inc: { useCount: 1 } },
      { new: true }
    );

    if (!macro) {
      return res.status(404).send('Không tìm thấy macro.');
    }

    // Tạo bản ghi lịch sử sử dụng
    const usage = new MacroUsage({
      macro: macro._id,
      category: macro.category
    });
    await usage.save();

    res.json(macro);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;