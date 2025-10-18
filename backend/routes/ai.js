const express = require('express');
const fetch = require('node-fetch'); // Đảm bảo bạn đã import fetch
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Bảo vệ route

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

// ----- CÁC HÀM HELPER CHO VIỆC DỊCH THUẬT GIỮ NGUYÊN ĐỊNH DẠNG -----

/**
 * Bóc tách tất cả các chuỗi văn bản từ cấu trúc Slate.
 * @param {Array<object>} nodes - Mảng các node từ Slate.
 * @returns {Array<string>} - Mảng các chuỗi văn bản.
 */
function extractTextsFromSlate(nodes) {
  let texts = [];
  for (const node of nodes) {
    if (node.hasOwnProperty('text')) {
      texts.push(node.text);
    }
    if (node.children) {
      texts = texts.concat(extractTextsFromSlate(node.children));
    }
  }
  return texts;
}

/**
 * Ghép các chuỗi văn bản đã dịch trở lại vào cấu trúc Slate ban đầu.
 * @param {Array<object>} originalNodes - Cấu trúc Slate gốc.
 * @param {Array<string>} translatedTexts - Mảng văn bản đã dịch.
 * @returns {Array<object>} - Cấu trúc Slate mới với nội dung đã dịch.
 */
function reconstructSlateWithTranslations(originalNodes, translatedTexts) {
  let translationIndex = 0;
  
  const traverseAndReplace = (nodes) => {
    return nodes.map(node => {
      if (node.hasOwnProperty('text')) {
        const translatedText = translatedTexts[translationIndex];
        const newText = translatedText !== undefined ? translatedText : node.text;
        translationIndex++;
        return { ...node, text: newText };
      }
      
      if (node.children) {
        return { ...node, children: traverseAndReplace(node.children) };
      }
      
      return node;
    });
  };

  const nodesCopy = JSON.parse(JSON.stringify(originalNodes));
  return traverseAndReplace(nodesCopy);
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

// --- CẬP NHẬT ROUTE DỊCH THUẬT ---
router.post('/translate', protect, async (req, res) => {
  const { content, targetLang = 'en' } = req.body;

  if (!content || !Array.isArray(content)) {
    return res.status(400).json({ message: 'Vui lòng cung cấp nội dung hợp lệ.' });
  }

  try {
    const textsToTranslate = extractTextsFromSlate(content);

    if (textsToTranslate.length === 0) {
      return res.json({ translation: content });
    }

    const separator = '|||';
    const batchText = textsToTranslate.join(separator);
    
    const translationPrompt = `You are an expert translator for e-commerce customer support.
Translate the following batch of Vietnamese text segments, separated by "${separator}", into English.
**Crucial Instructions:**
1.  Maintain the original order of the segments.
2.  Return ONLY the translated segments, also separated by "${separator}".
3.  **Preserve all leading and trailing whitespace for each segment exactly.** Do not add or remove any spaces.
4.  Do not add " before and after the translation

**Input Batch:**
"${batchText}"

**Translated Batch:**`;

    const batchTranslation = await runChat(translationPrompt);

    // Sửa lỗi: Chỉ xóa dấu ", không xóa khoảng trắng
    const translatedTexts = batchTranslation
      .split(separator)
      .map(text => text.replace(/^"|"$/g, ''));

    if (translatedTexts.length !== textsToTranslate.length) {
      console.warn('Batch translation mismatch, falling back to individual translation.');
      const fallbackTexts = await Promise.all(
        textsToTranslate.map(async (text) => {
          if (text.trim() === '') return text;
          const singlePrompt = `Translate this Vietnamese text to English for an e-commerce context. Return ONLY the translation, keeping original whitespace.\nVietnamese: "${text}"\nEnglish:`;
          
          let singleTranslation = await runChat(singlePrompt);
          // Sửa lỗi: Chỉ xóa dấu ", không xóa khoảng trắng
          return singleTranslation.replace(/^"|"$/g, '');
        })
      );
       const newContent = reconstructSlateWithTranslations(content, fallbackTexts);
       return res.json({ translation: newContent });
    }

    const newContent = reconstructSlateWithTranslations(content, translatedTexts);
    res.json({ translation: newContent });

  } catch (error) {
    console.error('Translation Error:', error);
    res.status(500).json({ message: 'Dịch thuật thất bại, vui lòng thử lại.' });
  }
});
module.exports = router;