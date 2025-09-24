const mongoose = require('mongoose');

const macroSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: Array, required: true },
  // Thêm các trường mới
  status: { 
    type: String, 
    enum: ['pending', 'approved'], 
    default: 'approved' 
  },
  submittedBy: { 
    type: String, 
    required: false 
  }
});

module.exports = mongoose.model('Macro', macroSchema);

