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
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) {
          setCategory(data[0].name);
        }
      });
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !category) {
      toast.error('Vui lòng điền tiêu đề và chọn danh mục!');
      return;
    }

    try {
      const res = await fetch('/api/macros/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          content,
          submittedBy: user?.username || 'Unknown',
        }),
      });

      if (!res.ok) throw new Error('Gửi đóng góp thất bại.');

      toast.success('Cảm ơn bạn đã đóng góp! Macro của bạn đang chờ duyệt.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="contribute-container page-container">
      <h1>Đóng góp Macro</h1>
      <p>Chia sẻ kiến thức của bạn với mọi người. Macro của bạn sẽ được quản trị viên xem xét trước khi hiển thị.</p>
      
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

      <div className="contribute-actions">
        <button className="cancel-btn" onClick={() => navigate('/dashboard')}>Hủy</button>
        <button className="submit-btn" onClick={handleSubmit}>Gửi đi</button>
      </div>
    </div>
  );
}

export default ContributePage;
