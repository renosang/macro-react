const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Không tìm thấy người dùng, token không hợp lệ' });
      }

      // --- SỬA LỖI: Cập nhật lastActivity một cách đáng tin cậy ---
      // Sử dụng await để đảm bảo hoạt động hoàn tất và bắt lỗi nếu có.
      try {
        await User.updateOne({ _id: req.user._id }, { $set: { lastActivity: new Date() } });
      } catch (updateError) {
        console.error('Lỗi khi cập nhật lastActivity:', updateError);
        // Không chặn request chính, chỉ ghi lại lỗi
      }
      // --- KẾT THÚC SỬA LỖI ---

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Xác thực thất bại, token không hợp lệ' });
    }
  } else {
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