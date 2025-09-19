import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Cần bcrypt để băm và so sánh

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    unique: true,
  },
  passwordHash: { // Tên trường nhất quán
    type: String,
    required: [true, 'Please provide a password hash.'],
  },
  role: {
    type: String,
    required: [true, 'Please provide a role.'],
    enum: ['admin', 'user'],
  },
}, { timestamps: true });


// Middleware: Tự động băm mật khẩu trước khi lưu
// Quan trọng: Phải dùng 'function' để 'this' trỏ về document
UserSchema.pre('save', async function(next) {
  // 'password' là một trường ảo không được lưu, chỉ dùng để nhận dữ liệu
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    // Băm mật khẩu và gán vào trường passwordHash
    this.passwordHash = await bcrypt.hash(this.password, salt);
    // Xóa trường ảo 'password' đi để nó không bị lưu
    this.password = undefined; 
    next();
  } catch (error) {
    next(error);
  }
});

// Thêm phương thức để so sánh mật khẩu cho tiện lợi
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};


export default mongoose.models.User || mongoose.model('User', UserSchema);