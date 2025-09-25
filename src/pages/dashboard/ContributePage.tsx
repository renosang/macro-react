import React, { useState, useEffect } from 'react';
import { Descendant, Element as SlateElement, Text } from 'slate'; 
import useAuthStore from '../../stores/useAuthStore';
import useDataStore from '../../stores/useDataStore';
import RichTextEditor from '../components/RichTextEditor';
import './ContributePage.css';

const initialEditorValue: Descendant[] = [
  { type: 'paragraph', children: [{ text: '' }] }
];

const ContributePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState<Descendant[]>(initialEditorValue);
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const token = useAuthStore((state) => state.token);
  const { categories, fetchCategories } = useDataStore((state) => ({
    categories: state.categories,
    fetchCategories: state.fetchCategories,
  }));

  useEffect(() => {
    if (fetchCategories) {
      fetchCategories();
    }
  }, [fetchCategories]);

  const isEditorEmpty = (value: Descendant[]) => {
    const firstNode = value[0];
    if (
      value.length === 1 &&
      SlateElement.isElement(firstNode) &&
      firstNode.children.length === 1
    ) {
      const firstChild = firstNode.children[0];
      return Text.isText(firstChild) && firstChild.text === '';
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title || !description || isEditorEmpty(content) || !category) {
      setError('Vui lòng điền đầy đủ các trường.');
      return;
    }

    try {
      const response = await fetch('/api/macros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          content: JSON.stringify(content),
          category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }

      setSuccess('Đóng góp của bạn đã được gửi để xét duyệt. Cảm ơn bạn!');
      setTitle('');
      setDescription('');
      setContent(initialEditorValue);
      setCategory('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="contribute-page">
      <h2>Đóng góp Macro</h2>
      <p>Chia sẻ kiến thức của bạn với cộng đồng. Macro của bạn sẽ được quản trị viên xem xét trước khi được duyệt.</p>
      <form onSubmit={handleSubmit} className="contribute-form">
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <div className="form-group">
          <label htmlFor="title">Tiêu đề Macro</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Cách tạo chữ ký email chuyên nghiệp"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Mô tả ngắn</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn gọn nội dung của macro"
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Chuyên mục</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">-- Chọn chuyên mục --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Nội dung chi tiết</label>
          <RichTextEditor value={content} onChange={setContent} />
        </div>
        <button type="submit" className="submit-button">Gửi đi</button>
      </form>
    </div>
  );
};

export default ContributePage;