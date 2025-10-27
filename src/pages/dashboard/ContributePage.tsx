import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import { Category } from '../../types';
import { Descendant } from 'slate';
import './ContributePage.css';
import useAuthStore from '../../stores/useAuthStore';

const emptyContent: Descendant[] = [{ type: 'paragraph', children: [{ text: '' }] }];

interface ContributePageProps {
  flatCategories: Category[];
}

interface CategoryOption {
  _id: string;
  name: string;
}
const buildCategoryTree = (categories: Category[], parentId: string | null = null): Category[] => {
  return categories
    .filter(category => (category.parent || null) === (parentId ? parentId.toString() : null))
    .map(category => ({
      ...category,
      children: buildCategoryTree(categories, category._id)
    }));
};
const buildCategoryDropdownOptions = (cats: Category[], prefix = ''): CategoryOption[] => {
  let flatList: CategoryOption[] = [];
  cats.forEach(cat => {
    flatList.push({ _id: cat._id, name: prefix + cat.name });
    if (cat.children && cat.children.length > 0) {
      flatList = flatList.concat(buildCategoryDropdownOptions(cat.children, prefix + '-- '));
    }
  });
  return flatList;
};

function ContributePage({ flatCategories }: ContributePageProps) {
  const [title, setTitle] = useState('');
    
  const [selectedCategory, setSelectedCategory] = useState('');
  const [content, setContent] = useState<Descendant[]>(emptyContent);
  const navigate = useNavigate();
  const { token } = useAuthStore(); 

  const categoryOptions = useMemo(() => {
    const categoryTree = buildCategoryTree(flatCategories, null);
    return buildCategoryDropdownOptions(categoryTree);
  }, [flatCategories]);
  
  useEffect(() => {
    if (categoryOptions.length > 0) {
      setSelectedCategory(categoryOptions[0].name);
    }
  }, [categoryOptions]);

  const handleContribute = async () => {
    if (!title.trim() || !selectedCategory) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và danh mục.');
      return;
    }
    if (!token) {
      toast.error('Bạn cần đăng nhập để thực hiện hành động này.');
      return;
    }
    try {
      const res = await fetch('/api/macros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          category: selectedCategory,
          content,
          status: 'pending', 
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gửi đóng góp thất bại.');
      }
      toast.success('Cảm ơn bạn đã đóng góp! Macro của bạn đã được gửi để xét duyệt.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
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
            {categoryOptions.map(cat => (
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
          <button className="submit-btn" onClick={handleContribute}>Gửi đóng góp</button>
        </div>
      </div>
    </div>
  );
}

export default ContributePage;