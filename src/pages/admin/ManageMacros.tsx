import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import './ManageMacros.css';
import RichTextEditor from '../components/RichTextEditor';
import HighlightText from '../components/HighlightText';
import { Category, Macro } from '../../types';
import { Descendant } from 'slate';

interface ManageMacrosProps {
  categories: Category[];
  macros: Macro[];
  setMacros: React.Dispatch<React.SetStateAction<Macro[]>>;
}

const emptyContent: Descendant[] = [{ type: 'paragraph', children: [{ text: '' }] }];

function ManageMacros({ categories, macros, setMacros }: ManageMacrosProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMacro, setCurrentMacro] = useState<Partial<Macro> | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryFilteredMacros = useMemo(() => {
    if (filterCategory === 'all') return macros;
    return macros.filter(macro => macro.category === filterCategory);
  }, [macros, filterCategory]);

  const finalFilteredMacros = useMemo(() => {
    if (!searchQuery) return categoryFilteredMacros;
    return categoryFilteredMacros.filter(macro =>
      macro.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categoryFilteredMacros, searchQuery]);

  const handleAddNew = () => {
    setCurrentMacro({ title: '', category: categories[0]?.name || '', content: emptyContent, status: 'approved' });
    setIsModalOpen(true);
  };

  const handleEdit = (macro: Macro) => {
    setCurrentMacro(macro);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMacro(null);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa macro này không?')) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`https://macro-react-xi.vercel.app/api/macros/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Xóa macro thất bại');
        }
        setMacros(macros.filter(m => m._id !== id));
        toast.success('Đã xóa macro thành công');
      } catch (error) {
        toast.error((error as Error).message);
      }
    }
  };
  
  // SỬA ĐỔI CHÍNH BẮT ĐẦU TỪ ĐÂY
  const handleSave = async () => {
    if (!currentMacro || !currentMacro.title?.trim()) {
      toast.error("Tiêu đề không được để trống!");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
      return;
    }

    const isUpdating = !!currentMacro._id;
    const url = isUpdating 
      ? `https://macro-react-xi.vercel.app/api/macros/${currentMacro._id}`
      : 'https://macro-react-xi.vercel.app/api/macros';
    
    const method = isUpdating ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentMacro),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (isUpdating ? 'Cập nhật macro thất bại.' : 'Thêm macro thất bại.'));
      }

      const savedMacro: Macro = await response.json();

      if (isUpdating) {
        setMacros(prev => prev.map(m => m._id === savedMacro._id ? savedMacro : m));
        toast.success("Cập nhật macro thành công!");
      } else {
        setMacros(prev => [...prev, savedMacro]);
        toast.success("Thêm macro thành công!");
      }

      handleCloseModal();
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
    <div className="manage-macros-container">
      <h2>Quản lý Macros</h2>
      <div className="controls">
        <button className="add-btn" onClick={handleAddNew}>Thêm Macro mới</button>
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
          </select>
        </div>
      </div>
      <div className="macros-table">
        <table>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {finalFilteredMacros.map(macro => (
              <tr key={macro._id}>
                <td><HighlightText text={macro.title} highlight={searchQuery} /></td>
                <td>{macro.category}</td>
                <td>
                  <button className="action-btn edit-btn" onClick={() => handleEdit(macro)}>Sửa</button>
                  <button className="action-btn delete-btn" onClick={() => handleDelete(macro._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && currentMacro && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{currentMacro._id ? 'Chỉnh sửa Macro' : 'Thêm Macro mới'}</h3>
            <div className="form-group">
              <label>Tiêu đề</label>
              <input 
                type="text" 
                value={currentMacro.title}
                onChange={e => setCurrentMacro({...currentMacro, title: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Danh mục</label>
              <select 
                value={currentMacro.category}
                onChange={e => setCurrentMacro({...currentMacro, category: e.target.value})}
              >
                {categories.map(cat => <option key={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Nội dung</label>
              <RichTextEditor 
                value={currentMacro.content || emptyContent}
                onChange={newContent => setCurrentMacro({...currentMacro, content: newContent})}
              />
            </div>
            <div className="modal-actions">
              <button className="action-btn cancel-btn" onClick={handleCloseModal}>Hủy</button>
              <button className="action-btn save-btn" onClick={handleSave}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageMacros;