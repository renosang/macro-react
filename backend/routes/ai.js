const express = require('express');
const fetch = require('node-fetch'); // <-- THÊM DÒNG NÀY ĐỂ TĂNG TÍNH ỔN ĐỊNH
const router = express.Router();

/**
 * Gửi tin nhắn đến Google Gemini API và trả về phản hồi.
 * @param {string} message Tin nhắn từ người dùng.
 * @returns {Promise<string>} Phản hồi từ AI.
 */
async function runChat(message) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: message }] }],
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Gemini API Error:", errorBody);
      throw new Error(`Google AI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "Xin lỗi, tôi không thể tạo ra câu trả lời vào lúc này.";
    }

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }
    const aiResponse = await runChat(message);
    res.json({ reply: aiResponse });
  } catch (error) {
    // Trả về lỗi rõ ràng hơn
    res.status(500).json({ error: error.message || 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.' });
  }
});

module.exports = router;

