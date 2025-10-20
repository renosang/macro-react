const express = require('express');
const Announcement = require('../models/Announcement');
const router = express.Router();

// GET: Lấy tất cả thông báo, sắp xếp mới nhất lên đầu
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ timestamp: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Tạo thông báo mới
router.post('/', async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ message: 'Nội dung thông báo là bắt buộc.' });
  }

  const newAnnouncement = new Announcement({ content });
  try {
    const savedAnnouncement = await newAnnouncement.save();
    res.status(201).json(savedAnnouncement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE: Xóa một thông báo
router.delete('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).send('Không tìm thấy thông báo.');
    res.status(200).send('Đã xóa thông báo thành công.');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
