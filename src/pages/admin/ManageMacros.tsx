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
    setCurrentMacro({ title: '', category: categories[0]?.name || '', content: emptyContent, status: 'pending' });
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
      try {
        const response = await fetch(`/api/macros/${id}`, {
          method: 'DELETE'
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

  const handleSave = async () => {
    if (!currentMacro || !currentMacro.title?.trim()) {
      toast.error("Tiêu đề không được để trống!");
      return;
    }

    const isUpdating = !!currentMacro._id;
    const url = isUpdating
      ? `/api/macros/${currentMacro._id}`
      : '/api/macros';

    const method = isUpdating ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
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
  
  const getStatusComponent = (status: 'approved' | 'pending' | undefined) => {
    if (status === 'approved') {
      return <span className="status-badge status-approved">Đã xét duyệt</span>;
    }
    return <span className="status-badge status-pending">Chờ xét duyệt</span>;
  };

  return (
    <div className="manage-macros-container">
      <h2>Quản lý Macros</h2>
       <div className="controls">
        <div className="filter-controls">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
          </select>
        </div>
        <div className="search-controls">
           <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="add-controls">
           <button className="add-btn" onClick={handleAddNew}>Thêm Macro mới</button>
        </div>
      </div>
      <div className="macros-table-wrapper">
        <table className="macros-table">
          <thead>
            <tr>
              <th className="th-title">Tiêu đề</th>
              <th className="th-category">Danh mục</th>
              <th className="th-status">Trạng thái</th>
              <th className="th-actions">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {finalFilteredMacros.map(macro => (
              <tr key={macro._id}>
                <td className="td-title"><HighlightText text={macro.title} highlight={searchQuery} /></td>
                <td className="td-category">{macro.category}</td>
                <td className="td-status">{getStatusComponent(macro.status)}</td>
                <td className="td-actions">
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
             <div className="form-group-row">
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
                <label>Trạng thái</label>
                <select
                  value={currentMacro.status}
                  onChange={e => setCurrentMacro({...currentMacro, status: e.target.value as 'pending' | 'approved'})}
                >
                  <option value="pending">Chờ xét duyệt</option>
                  <option value="approved">Đã xét duyệt</option>
                </select>
              </div>
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