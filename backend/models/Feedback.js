const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  macro: { // ID của Macro được góp ý
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Macro'
  },
  macroTitle: { // Lưu lại tiêu đề Macro để admin dễ xem
    type: String,
    required: true,
  },
  content: { // Nội dung góp ý
    type: String,
    required: true,
    trim: true
  },
  status: { // Trạng thái của góp ý
    type: String,
    enum: ['pending', 'addressed', 'rejected'],
    default: 'pending'
  },
  submittedBy: { // ID của người gửi góp ý
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Feedback', feedbackSchema);