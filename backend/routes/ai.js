const express = require('express');
const fetch = require('node-fetch'); // Đảm bảo bạn đã import fetch
const router = express.Router();

/**
 * Gửi tin nhắn đến Google Gemini API và trả về phản hồi. (Hàm này giữ nguyên)
 * @param {string} message Tin nhắn từ người dùng.
 * @returns {Promise<string>} Phản hồi từ AI.
 */
async function runChat(message) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  
    const modelName = "gemini-2.5-flash-lite"; // Đã cập nhật theo yêu cầu
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: message }] }],
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      const errorMessage = data?.error?.message || `Google AI API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "Xin lỗi, tôi không thể tạo ra phản hồi vào lúc này.";
    }
  } catch (error) {
    console.error('Lỗi khi gọi Gemini API:', error);
    throw new Error('Đã có lỗi xảy ra khi giao tiếp với Google AI.');
  }
}

// Route cho Chat AI (Giữ nguyên)
router.post('/chat', async (req, res) => {
  try {
    const message = req.body.message;
    if (!message) {
      return res.status(400).json({ message: 'Tin nhắn không được để trống.' });
    }
    const reply = await runChat(message);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// --- CẬP NHẬT LẠI HOÀN TOÀN ROUTE PHÂN TÍCH ---
router.post('/analyze-dashboard', async (req, res) => {
  try {
    const { topMacros, leastUsedMacros, categoryUsage, usageOverTime, userStats } = req.body;

    const prompt = `
      Là một chuyên gia phân tích dữ liệu, hãy phân tích các số liệu sau đây về việc sử dụng hệ thống và đưa ra nhận xét chi tiết cùng với một kế hoạch hành động cụ thể.

      **Dữ liệu cung cấp:**
      Top 10 macros được sử dụng nhiều nhất: ${JSON.stringify(topMacros, null, 2)}
      Các macro ít được sử dụng nhất: ${JSON.stringify(leastUsedMacros, null, 2)}
      Thống kê sử dụng theo danh mục: ${JSON.stringify(categoryUsage, null, 2)}
      Lượt sử dụng macro trong 30 ngày qua: (Dữ liệu này cho thấy xu hướng sử dụng hàng ngày)
      Thống kê thành viên mới trong tháng: ${JSON.stringify(userStats, null, 2)}

      **Yêu cầu:**
      Hãy trình bày kết quả phân tích theo cấu trúc sau, sử dụng Markdown:
      ### 📊 Tình hình chung
      - Đưa ra 3-4 nhận xét quan trọng nhất về các điểm nổi bật từ dữ liệu.
      ### 💡 Kế hoạch hành động đề xuất
      - Dựa trên những nhận xét trên, đề xuất 3-5 hành động cụ thể, khả thi.
      Hãy viết câu trả lời bằng tiếng Việt, với giọng văn chuyên nghiệp và súc tích.
    `;

    // Sử dụng lại hàm runChat đã hoạt động tốt
    const analysisResult = await runChat(prompt);

    res.json({ analysis: analysisResult });

  } catch (error) {
    console.error('Lỗi khi phân tích dashboard:', error);
    res.status(500).json({ message: 'Không thể phân tích dữ liệu bằng AI.' });
  }
});

module.exports = router;