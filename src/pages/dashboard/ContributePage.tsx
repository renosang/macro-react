import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Descendant } from 'slate';
import RichTextEditor from '../components/RichTextEditor';
import { Category } from '../../types';
import useAuthStore from '../../stores/useAuthStore';
import './ContributePage.css';

const emptyContent: Descendant[] = [{ type: 'paragraph', children: [{ text: '' }] }];

function ContributePage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState<Descendant[]>(emptyContent);
  const [categories, setCategories] = useState<Category[]>([]);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    // Sử dụng URL đầy đủ để fetch categories
    fetch('https://macro-react-xi.vercel.app/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) {
          setCategory(data[0].name);
        }
      });
  }, []);
  
  // SỬA ĐỔI CHÍNH BẮT ĐẦU TỪ ĐÂY
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!user) {
        toast.error('Bạn cần đăng nhập để thực hiện chức năng này.');
        navigate('/login');
        return;
    }

    if (!title.trim() || !category) {
      toast.error('Vui lòng nhập tiêu đề và chọn danh mục.');
      return;
    }

    try {
      const response = await fetch('https://macro-react-xi.vercel.app/api/macros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, category }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gửi đóng góp thất bại.');
      }

      toast.success('Cảm ơn bạn đã đóng góp! Macro của bạn đã được gửi để xét duyệt.');
      // Reset lại form sau khi gửi thành công
      setTitle('');
      setContent(emptyContent);
      if (categories.length > 0) {
        setCategory(categories[0].name);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Đã xảy ra lỗi không xác định.");
      }
    }
  };
  // KẾT THÚC SỬA ĐỔI

  return (
    <div className="contribute-container page-container">
      <h2>Đóng góp Macro</h2>
      <p>Chia sẻ kiến thức của bạn với cộng đồng!</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tiêu đề</label>
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Danh mục</label>
          <select 
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="" disabled>-- Chọn danh mục --</option>
            {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
          </select>
        </div>
        
        <div className="form-group">
          <label>Nội dung</label>
          <RichTextEditor 
            value={content}
            onChange={setContent}
          />
        </div>

        <button type="submit" className="submit-btn">Gửi đóng góp</button>
      </form>
    </div>
  );
}

export default ContributePage;