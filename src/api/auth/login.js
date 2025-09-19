import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dbConnect from '../_lib/db';
import User from '../_models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  
  await dbConnect();

  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'YOUR_DEFAULT_SECRET_KEY', { expiresIn: '8h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}