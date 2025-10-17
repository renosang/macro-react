// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Lấy token từ header (loại bỏ chữ "Bearer")
      token = req.headers.authorization.split(' ')[1];

      // Giải mã token để lấy ID người dùng
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm người dùng trong database bằng ID và gán vào req.user
      // `-password` để không lấy trường mật khẩu
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Không tìm thấy người dùng, token không hợp lệ' });
      }

      User.updateOne({ _id: req.user._id }, { lastActivity: new Date() }).exec();
      next(); // Chuyển sang middleware hoặc route handler tiếp theo
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Xác thực thất bại, token không hợp lệ' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Xác thực thất bại, không tìm thấy token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Không có quyền truy cập' });
  }
};

module.exports = { protect, admin };