const mongoose = require('mongoose');

const macroSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },

  content: { 
    type: Array,
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved'], 
    default: 'approved' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  lastModifiedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  useCount: { 
    type: Number, 
    default: 0 
  },
  platformTags: {
    shopee: { type: Boolean, default: false },
    lazada: { type: Boolean, default: false },
    tiktok: { type: Boolean, default: false },
    hasBrand: { type: Boolean, default: false },
  }
}, { timestamps: true });

module.exports = mongoose.model('Macro', macroSchema);