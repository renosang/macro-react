// backend/models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  
  // ----- THÊM MỚI -----
  description: {
    type: String,
    default: '' // Thêm mô tả, mặc định là rỗng
  },
  // -------------------

  // Người được gán task
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Người đã gán task (Đã có)
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Deadline (Đã có)
  deadline: {
    type: Date,
    default: null
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  completionNotified: { 
    type: Boolean,
    default: false 
  },
  deadlineReminderSent: { 
    type: Boolean,
    default: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);