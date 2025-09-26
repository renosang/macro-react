const mongoose = require('mongoose');

const macroSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: Array, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending' // <-- THAY ĐỔI Ở ĐÂY
  },
  submittedBy: {
    type: String,
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Macro', macroSchema);