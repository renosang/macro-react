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

// ---- BỔ SUNG: Type cho bộ lọc trạng thái ----
type StatusFilter = 'all' | 'pending' | 'approved';

function ManageMacros({ categories, macros, setMacros }: ManageMacrosProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMacro, setCurrentMacro] = useState<Partial<Macro> | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // ---- BỔ SUNG: State cho bộ lọc trạng thái ----
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // ---- CẬP NHẬT: Chuỗi logic lọc để thêm bộ lọc trạng thái ----
  const filteredMacros = useMemo(() => {
    let filtered = macros;

    // 1. Lọc theo danh mục
    if (filterCategory !== 'all') {
      filtered = filtered.filter(macro => macro.category === filterCategory);
    }

    // 2. Lọc theo trạng thái
    if (statusFilter !== 'all') {
      filtered = filtered.filter(macro => macro.status === statusFilter);
    }
    
    // 3. Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      filtered = filtered.filter(macro =>
        macro.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [macros, filterCategory, statusFilter, searchQuery]);


  const handleOpenModal = (macro: Partial<Macro> | null = null) => {
    if (macro) {
      setCurrentMacro({ ...macro });
    } else {
      setCurrentMacro({
        title: '',
        category: categories.length > 0 ? categories[0].name : '',
        content: emptyContent,
        status: 'pending',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMacro(null);
  };

  const handleSave = async () => {
    if (!currentMacro || !currentMacro.title || !currentMacro.category) {
      toast.error('Vui lòng điền đầy đủ tiêu đề và danh mục!');
      return;
    }

    const url = currentMacro._id ? `/api/macros/${currentMacro._id}` : '/api/macros';
    const method = currentMacro._id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentMacro),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra.');
      }
      
      const savedMacro = await res.json();
      
      if (method === 'POST') {
        setMacros(prev => [...prev, savedMacro]);
        toast.success('Tạo macro thành công!');
      } else {
        setMacros(prev => prev.map(m => m._id === savedMacro._id ? savedMacro : m));
        toast.success('Cập nhật macro thành công!');
      }
      handleCloseModal();

    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa macro này?')) {
      try {
        const res = await fetch(`/api/macros/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Xóa thất bại');
        setMacros(prev => prev.filter(m => m._id !== id));
        toast.success('Xóa macro thành công!');
      } catch (error: any) {
        toast.error(`Lỗi: ${error.message}`);
      }
    }
  };

  return (
    <div className="manage-macros-container">
      <h2>Quản lý Macro</h2>
      <div className="controls">
        {/* ---- CẬP NHẬT: Giao diện bộ lọc ---- */}
        <div className="filter-controls">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          {/* ---- BỔ SUNG: Bộ lọc trạng thái ---- */}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xét duyệt</option>
            <option value="approved">Đã xét duyệt</option>
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
          <button className="add-new-btn" onClick={() => handleOpenModal()}>
            Thêm Macro
          </button>
        </div>
      </div>

      <div className="macros-table-wrapper">
        <table className="macros-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {/* ---- CẬP NHẬT: Dùng mảng đã lọc cuối cùng ---- */}
            {filteredMacros.map(macro => (
              <tr key={macro._id}>
                <td><HighlightText text={macro.title} highlight={searchQuery} /></td>
                <td>{macro.category}</td>
                <td>
                  <span className={`status-badge status-${macro.status}`}>
                    {macro.status === 'approved' ? 'Đã xét duyệt' : 'Chờ xét duyệt'}
                  </span>
                </td>
                <td className="action-cell">
                  <button className="action-btn edit-btn" onClick={() => handleOpenModal(macro)}>Sửa</button>
                  <button className="action-btn delete-btn" onClick={() => handleDelete(macro._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && currentMacro && (
        <div className="modal-backdrop">
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
                  {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
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