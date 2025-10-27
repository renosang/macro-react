// backend/models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId, // Lưu ID của danh mục cha
    ref: 'Category', // Tham chiếu đến chính model Category
    default: null // Mặc định là null (tức là danh mục gốc/cha)
  }
});

module.exports = mongoose.model('Category', categorySchema);