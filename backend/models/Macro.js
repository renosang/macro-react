const mongoose = require('mongoose');

const macroSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    // Sử dụng 'Mixed' để lưu trữ cấu trúc JSON phức tạp của SlateJS
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

module.exports = mongoose.model('Macro', macroSchema);
