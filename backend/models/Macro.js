const mongoose = require('mongoose');

const macroSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending'
  },

  platformTags: {
    shopee: { type: Boolean, default: false },
    lazada: { type: Boolean, default: false },
    tiktok: { type: Boolean, default: false },
    hasBrand: { type: Boolean, default: false },
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  useCount: { type: Number, default: 0 }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Macro', macroSchema);