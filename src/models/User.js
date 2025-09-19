// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Định nghĩa Schema cho User
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Tên đăng nhập không được trùng
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Chỉ cho phép một trong hai giá trị này
    default: 'user',
  }
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

// 2. Tự động HASH mật khẩu trước khi LƯU (Middleware)
// Dùng 'function' thay vì arrow function để 'this' trỏ về document
userSchema.pre('save', async function(next) {
  // Chỉ hash mật khẩu nếu nó được thay đổi (hoặc là user mới)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // "Salt" là một chuỗi ngẫu nhiên giúp tăng cường bảo mật
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

// 3. Thêm một phương thức để SO SÁNH mật khẩu khi đăng nhập
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


// 4. Tạo và export Model
const User = mongoose.model('User', userSchema);
module.exports = User;