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
  submittedBy: {
    type: String,
    required: false
  },
  useCount: { type: Number, default: 0 } // <-- BỔ SUNG DÒNG NÀY
}, { timestamps: true });

module.exports = mongoose.model('Macro', macroSchema);