const mongoose = require('mongoose');

const macroSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: mongoose.Schema.Types.Mixed, required: true }, // <-- THAY ĐỔI QUAN TRỌNG Ở ĐÂY
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending'
  },
  submittedBy: {
    type: String,
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Macro', macroSchema);