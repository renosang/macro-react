const mongoose = require('mongoose');

const macroUsageSchema = new mongoose.Schema({
  macro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Macro',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MacroUsage', macroUsageSchema);