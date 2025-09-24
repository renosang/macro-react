import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import './ManageMacros.css';
import RichTextEditor from '../components/RichTextEditor';
import HighlightText from '../components/HighlightText';
import { Category, Macro } from '../../types'; // <-- Sửa đường dẫn import
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

  const handleOpenAddModal = () => {
    setCurrentMacro({ title: '', category: categories[0]?.name || '', content: emptyContent });
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (macro: Macro) => {
    setCurrentMacro(macro);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMacro(null);
  };

  const handleSave = () => {
    if (!currentMacro || !currentMacro.title?.trim()) {
      toast.error("Tiêu đề không được để trống!");
      return;
    }
    if (currentMacro._id) { // <-- Sửa thành _id
      setMacros(prev => prev.map(m => m._id === currentMacro._id ? (currentMacro as Macro) : m)); // <-- Sửa thành _id
      toast.success("Cập nhật macro thành công!");
    } else {
      const newMacro: Macro = { ...currentMacro, _id: String(Date.now()) } as Macro; // <-- Sửa thành _id
      setMacros(prev => [...prev, newMacro]);
      toast.success("Thêm macro thành công!");
    }
    handleCloseModal();
  };
  
  const handleDelete = (id: string) => { // <-- Sửa thành string
    const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa macro này không?');
    if (isConfirmed) {
      setMacros(prev => prev.filter(macro => macro._id !== id)); // <-- Sửa thành _id
      toast.success('Đã xóa macro thành công!');
    }
  };

  return (
    <div className="manage-macros">
      <h2>Quản lý Macro Tư vấn</h2>
      <div className="controls">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">Tất cả danh mục</option>
          {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
        </select>
        <input 
          type="text" 
          placeholder="Tìm kiếm nhanh macro..." 
          className="search-input"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button className="add-new-btn" onClick={handleOpenAddModal}>Thêm mới Macro</button>
      </div>
      <table className="macros-table">
        <thead>
          <tr>
            <th>Tiêu đề Macro</th>
            <th>Thuộc danh mục</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {finalFilteredMacros.map((macro) => (
            <tr key={macro._id}> {/* <-- Sửa thành _id */}
              <td><HighlightText text={macro.title} highlight={searchQuery} /></td>
              <td>{macro.category}</td>
              <td>
                <button className="action-btn edit-btn" onClick={() => handleOpenEditModal(macro)}>Sửa</button>
                <button className="action-btn delete-btn" onClick={() => handleDelete(macro._id)}>Xóa</button> {/* <-- Sửa thành _id */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && currentMacro && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>{currentMacro._id ? 'Chỉnh sửa Macro' : 'Thêm Macro mới'}</h3> {/* <-- Sửa thành _id */}
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
