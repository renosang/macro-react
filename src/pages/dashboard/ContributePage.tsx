import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import { Category } from '../../types';
import { Descendant } from 'slate';
import './ContributePage.css';

const emptyContent: Descendant[] = [{ type: 'paragraph', children: [{ text: '' }] }];

function ContributePage() {
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [content, setContent] = useState<Descendant[]>(emptyContent);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy danh sách danh mục khi component được tải
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0].name); // Đặt danh mục mặc định là TÊN
        }
      } catch (error) {
        toast.error('Không thể tải danh mục.');
      }
    };
    fetchCategories();
  }, []);

  const handleContribute = async () => {
    if (!title.trim() || !selectedCategory) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và chọn danh mục.');
      return;
    }

    const newMacro = {
      title,
      category: selectedCategory, // Gửi đi TÊN danh mục
      content,
      status: 'pending',
    };

    try {
      const response = await fetch('/api/macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMacro),
      });

      if (!response.ok) {
        throw new Error('Gửi đóng góp thất bại. Vui lòng thử lại.');
      }

      toast.success('Cảm ơn bạn đã đóng góp! Macro của bạn đang chờ xét duyệt.');
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Đã có lỗi xảy ra.');
      }
    }
  };

  return (
    <div className="contribute-container">
      <h2>Đóng góp Macro</h2>
      <p>
        Cảm ơn bạn đã dành thời gian đóng góp kiến thức cho cộng đồng. Vui lòng điền đầy đủ thông tin dưới đây.
        Macro của bạn sẽ được quản trị viên xem xét trước khi hiển thị.
      </p>
      <div className="contribute-form">
        <div className="form-group">
          <label>Tiêu đề</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề cho macro..."
          />
        </div>
        <div className="form-group">
          <label>Danh mục</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {/* Đảm bảo value của option là cat.name */}
            {categories.map(cat => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Nội dung</label>
          <RichTextEditor value={content} onChange={setContent} />
        </div>
        <div className="form-actions">
          <button className="cancel-btn" onClick={() => navigate('/dashboard')}>Hủy</button>
          <button className="submit-btn" onClick={handleContribute}>Gửi đi</button>
        </div>
      </div>
    </div>
  );
}

export default ContributePage;