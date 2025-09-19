// src/api/auth/register.js
import dbConnect from '../_lib/db';
import User from '../_models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await dbConnect();

  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại.' });
    }
    
    // Tạo user mới với mật khẩu dạng text
    // Middleware pre('save') trong User model sẽ tự động hash nó
    const newUser = new User({ username, password, role });
    await newUser.save();

    res.status(201).json({ message: 'Tạo tài khoản thành công!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}