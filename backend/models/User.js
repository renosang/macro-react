// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // ---- BỔ SUNG ----
  fullName: { type: String, required: [true, 'Họ và tên là bắt buộc'] },
  email: { 
    type: String, 
    required: [true, 'Email là bắt buộc'], 
    unique: true,
    match: [/.+\@.+\..+/, 'Vui lòng nhập một địa chỉ email hợp lệ']
  },
  // ---- KẾT THÚC BỔ SUNG ----
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

// Băm mật khẩu trước khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);