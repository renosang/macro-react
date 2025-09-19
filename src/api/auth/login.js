import jwt from 'jsonwebtoken';
import dbConnect from '../_lib/db';
import User from '../_models/User';

export default async function handler(req, res) {
  // --- SỬA LỖI Ở ĐÂY ---
  // Chuyển req.method về chữ hoa để đảm bảo so sánh luôn đúng
  if (req.method.toUpperCase() !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
  
  await dbConnect();

  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Sử dụng phương thức comparePassword chúng ta đã tạo trong Model
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const payload = { id: user._id, role: user.role, username: user.username };
    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET || 'YOUR_DEFAULT_SECRET_KEY', 
      { expiresIn: '8h' }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}