const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  team: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('Link', linkSchema);