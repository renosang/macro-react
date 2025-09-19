import mongoose from 'mongoose';

const MacroSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title.'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category.'],
  },
  content: {
    type: Array, // Dữ liệu từ Slate là một mảng các object
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.Macro || mongoose.model('Macro', MacroSchema);