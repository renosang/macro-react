import React, { useState, useRef, useEffect } from 'react';
import useChatStore from '../../stores/useChatStore';
import './AiChatWidget.css';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AiChatWidget: React.FC = () => {
  const { isOpen, toggleChat } = useChatStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, newMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Dòng này đã được cập nhật để gọi đến backend API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) {
        // Lấy lỗi từ backend nếu có
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (error: any) {
      console.error('Error fetching AI response:', error);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: error.message || 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button className={`chat-fab ${isOpen ? 'hidden' : ''}`} onClick={toggleChat} title="Chat với AI">
        💬
      </button>
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h3>Trợ lý AI</h3>
          <button className="close-btn" onClick={toggleChat}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.sender}`}>
              <p>{msg.text}</p>
            </div>
          ))}
          {isLoading && (
            <div className="message-bubble ai loading">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Nhập câu hỏi của bạn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={!input.trim() || isLoading}>
            <svg className="send-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </form>
      </div>
    </>
  );
};

export default AiChatWidget;

