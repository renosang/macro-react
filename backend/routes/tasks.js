// backend/routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware'); // Dùng middleware
const User = require('../models/User'); // Cần để lấy danh sách user

// Lấy tất cả user (cho việc gán task)
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find().select('fullName username _id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Không thể tải danh sách người dùng.' });
  }
});

// Lấy task (việc của tôi VÀ việc tôi giao)
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ middleware 'protect'
    
    const tasks = await Task.find({
      $or: [
        { assignedTo: userId }, // Task gán cho tôi
        { assignedBy: userId }  // Task tôi gán cho người khác
      ]
    })
    .populate('assignedTo', 'fullName username') // Lấy thông tin người nhận
    .populate('assignedBy', 'fullName username') // Lấy thông tin người gán
    .sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu
    
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tạo và gán task mới (đã bao gồm description)
router.post('/', protect, async (req, res) => {
  const { title, description, assignedTo, deadline } = req.body;
  const assignedBy = req.user.id; // Người gán là người đang đăng nhập

  if (!title || !assignedTo) {
    return res.status(400).json({ message: 'Thiếu thông tin tiêu đề hoặc người nhận.' });
  }

  try {
    const task = new Task({
      title,
      description: description || '', // Lưu description
      assignedTo,
      assignedBy,
      deadline: deadline || null, // Deadline dạng ISO string hoặc null
      isComplete: false,
      isRead: false // Mặc định là chưa đọc
    });

    await task.save();
    // Populate dữ liệu trước khi gửi về client
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'fullName username')
      .populate('assignedBy', 'fullName username');
      
    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Đánh dấu task là Hoàn thành/Chưa hoàn thành (đã cập nhật logic thông báo)
router.put('/:id/toggle-complete', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task.' });
    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền.' });
    }

    const previousCompletionState = task.isComplete;
    task.isComplete = !task.isComplete;

    if (!previousCompletionState && task.isComplete) {
      task.completionNotified = false; 
    }
    if (previousCompletionState && !task.isComplete) {
       task.completionNotified = false; 
       task.deadlineReminderSent = false; 
    }

    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'fullName username')
      .populate('assignedBy', 'fullName username');
    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy các loại thông báo (đã cập nhật)
router.get('/notifications', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 1. Task mới được gán cho TÔI
    const newTasksForMe = await Task.find({ assignedTo: userId, isComplete: false, isRead: false })
      .select('_id title assignedBy createdAt')
      .populate('assignedBy', 'fullName').sort({ createdAt: -1 });

    // 2. Task TÔI GIAO đã được hoàn thành
    const completedTasksByMe = await Task.find({ assignedBy: userId, isComplete: true, completionNotified: false })
      .select('_id title assignedTo isComplete updatedAt')
      .populate('assignedTo', 'fullName').sort({ updatedAt: -1 });

    // 3. Task sắp đến hạn
    const upcomingDeadlines = await Task.find({
      $or: [{ assignedTo: userId }, { assignedBy: userId }], 
      isComplete: false, deadlineReminderSent: false, 
      deadline: { $ne: null, $lte: oneDayLater, $gte: now }
    })
    .select('_id title assignedTo assignedBy deadline') 
    .populate('assignedTo', 'fullName').populate('assignedBy', 'fullName')
    .sort({ deadline: 1 });

    // Gộp và định dạng
    const notifications = [];
    newTasksForMe.forEach(task => notifications.push({ _id: task._id, type: 'newTask', message: `${task.assignedBy.fullName} đã gán cho bạn task: ${task.title}`, relatedTask: task, timestamp: task.createdAt }));
    completedTasksByMe.forEach(task => notifications.push({ _id: task._id, type: 'taskCompleted', message: `${task.assignedTo.fullName} đã hoàn thành task: ${task.title}`, relatedTask: task, timestamp: task.updatedAt }));
    upcomingDeadlines.forEach(task => notifications.push({ _id: task._id, type: 'deadlineUpcoming', message: `Task "${task.title}"${task.assignedTo._id.toString() === userId ? '' : ` (giao cho ${task.assignedTo.fullName})`} sắp đến hạn!`, relatedTask: task, timestamp: task.deadline }));

    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(notifications);

  } catch (err) {
    console.error("Notification Error:", err);
    res.status(500).json({ message: "Lỗi khi lấy thông báo." });
  }
});

// Đánh dấu task mới là ĐÃ ĐỌC
router.put('/:id/mark-read', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task.' });
    if (task.assignedTo.toString() !== req.user.id) return res.status(403).json({ message: 'Không có quyền.' });
    task.isRead = true;
    await task.save();
    res.json({ message: 'Đã đánh dấu là đã đọc.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Đánh dấu ĐÃ XEM thông báo hoàn thành
router.put('/:id/mark-completion-notified', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task.' });
    if (task.assignedBy.toString() !== req.user.id) return res.status(403).json({ message: 'Không có quyền.' });
    task.completionNotified = true; 
    await task.save();
    res.json({ message: 'Đã xem thông báo hoàn thành.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Đánh dấu ĐÃ GỬI nhắc nhở deadline
router.put('/:id/mark-deadline-reminder-sent', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task.' });
    if (task.assignedBy.toString() !== req.user.id && task.assignedTo.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Không có quyền.' });
    }
    task.deadlineReminderSent = true; 
    await task.save();
    res.json({ message: 'Đã đánh dấu gửi nhắc nhở deadline.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;