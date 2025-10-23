const express = require('express');
const Feedback = require('../models/Feedback');
const Macro = require('../models/Macro'); // Cần Macro model để lấy title
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Submit new feedback for a macro
// @route   POST /api/feedback
// @access  Private (User)
router.post('/', protect, async (req, res) => {
  const { macroId, content } = req.body;
  if (!macroId || !content) {
    return res.status(400).json({ message: 'Macro ID and feedback content are required.' });
  }

  try {
    // Lấy tiêu đề macro để lưu cùng feedback
    const macro = await Macro.findById(macroId).select('title');
    if (!macro) {
        return res.status(404).json({ message: 'Macro not found.' });
    }

    const newFeedback = new Feedback({
      macro: macroId,
      macroTitle: macro.title, // Lưu tiêu đề
      content,
      submittedBy: req.user._id, // Lấy ID user từ middleware protect
      status: 'pending'
    });

    const savedFeedback = await newFeedback.save();
    res.status(201).json(savedFeedback);
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res.status(500).json({ message: 'Server Error when submitting feedback.' });
  }
});

// @desc    Get all feedback entries
// @route   GET /api/feedback
// @access  Private (Admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    // Populate để lấy thông tin người gửi
    const feedbackList = await Feedback.find()
      .populate('submittedBy', 'username fullName') // Lấy username và fullName
      .sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu
    res.json(feedbackList);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ message: 'Server Error when fetching feedback.' });
  }
});

// @desc    Update feedback status
// @route   PUT /api/feedback/:id
// @access  Private (Admin)
router.put('/:id', protect, admin, async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'addressed', 'rejected'];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status provided.' });
  }

  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found.' });
    }

    feedback.status = status;
    const updatedFeedback = await feedback.save();
    res.json(updatedFeedback);

  } catch (err) {
    console.error("Error updating feedback:", err);
    res.status(500).json({ message: 'Server Error when updating feedback.' });
  }
});

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found.' });
    }
    res.json({ message: 'Feedback removed successfully.' });
  } catch (err) {
    console.error("Error deleting feedback:", err);
    res.status(500).json({ message: 'Server Error when deleting feedback.' });
  }
});


module.exports = router;