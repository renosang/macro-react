import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    unique: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Please provide a password hash.'],
  },
  role: {
    type: String,
    required: [true, 'Please provide a role.'],
    enum: ['admin', 'user'],
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);