const express = require('express');
const router = express.Router();
const Macro = require('../models/Macro');
const MacroUsage = require('../models/MacroUsage');

// Helper function to get date range
const getDateRange = (period) => {
  const end = new Date();
  const start = new Date();
  if (period === 'week') {
    start.setDate(end.getDate() - 7);
  } else if (period === 'month') {
    start.setMonth(end.getMonth() - 1);
  } else {
    // Default to last 30 days if period is invalid
    start.setDate(end.getDate() - 30);
  }
  return { start, end };
};

// 1. TOP 10 MACROS ĐƯỢC SỬ DỤNG NHIỀU NHẤT
router.get('/top-macros', async (req, res) => {
  try {
    const { period = 'month' } = req.query; // 'week' or 'month'
    const { start, end } = getDateRange(period);

    const topMacros = await MacroUsage.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: '$macro', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'macros',
          localField: '_id',
          foreignField: '_id',
          as: 'macroDetails'
        }
      },
      { $unwind: '$macroDetails' },
      {
        $project: {
          _id: 1,
          title: '$macroDetails.title',
          count: 1
        }
      }
    ]);
    res.json(topMacros);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. NHỮNG MACRO ÍT ĐƯỢC SỬ DỤNG NHẤT
router.get('/least-used-macros', async (req, res) => {
  try {
    const leastUsed = await Macro.find({ useCount: { $gt: 0 } }) // Chỉ lấy những macro đã được dùng ít nhất 1 lần
      .sort({ useCount: 1 })
      .limit(10)
      .select('title useCount');
    res.json(leastUsed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. DANH MỤC ĐƯỢC SỬ DỤNG NHIỀU NHẤT
router.get('/category-usage', async (req, res) => {
  try {
    const categoryUsage = await MacroUsage.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);
    res.json(categoryUsage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. BIỂU ĐỒ SỐ LƯỢT SỬ DỤNG THEO THỜI GIAN (30 ngày gần nhất)
router.get('/usage-over-time', async (req, res) => {
    try {
        const { start, end } = getDateRange('month');

        const usage = await MacroUsage.aggregate([
            { $match: { timestamp: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { date: '$_id', count: 1, _id: 0 } }
        ]);
        res.json(usage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;