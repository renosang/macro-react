import React, { useState, useMemo, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import './ManageMacros.css';
import RichTextEditor from '../components/RichTextEditor';
import HighlightText from '../components/HighlightText';
import { Category, Macro } from '../../types';
import { Descendant } from 'slate';
import useAuthStore from '../../stores/useAuthStore';
import { useLocation, useNavigate } from 'react-router-dom'; 

interface ManageMacrosProps {
  categories: Category[];
  macros: Macro[];
  setMacros: React.Dispatch<React.SetStateAction<Macro[]>>;
}

const emptyContent: Descendant[] = [{ type: 'paragraph', children: [{ text: '' }] }];

type StatusFilter = 'all' | 'pending' | 'approved';
type SortOrder = 'asc' | 'desc' | 'none';

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

const buildOptionsRecursive = (cats: Category[], prefix = ''): CategoryOption[] => {
  let flatList: CategoryOption[] = [];
  cats.forEach(cat => {
    flatList.push({ _id: cat._id, name: prefix + cat.name });
    if (cat.children && cat.children.length > 0) {
      flatList = flatList.concat(buildOptionsRecursive(cat.children, prefix + '-- '));
    }
  });
  return flatList;
};

function ManageMacros({ categories, macros = [], setMacros }: ManageMacrosProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMacro, setCurrentMacro] = useState<Partial<Macro> | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const { token } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const buildOptionsCallback = useCallback((cats: Category[], prefix = ''): CategoryOption[] => {
    let flatList: CategoryOption[] = [];
    cats.forEach(cat => {
      flatList.push({ _id: cat._id, name: prefix + cat.name });
      if (cat.children && cat.children.length > 0) {
        flatList = flatList.concat(buildOptionsCallback(cat.children, prefix + '-- '));
      }
    });
    return flatList;
  }, []);

  const categoryOptions = useMemo(() => {
    const categoryTree = buildCategoryTree(categories, null); 
    return buildOptionsCallback(categoryTree);
  }, [categories, buildOptionsCallback]);


  const handleOpenModal = useCallback((macro: Partial<Macro> | null = null) => {
    if (macro) {
      setCurrentMacro({ ...macro,
      platformTags: macro.platformTags || { shopee: false, lazada: false, tiktok: false, hasBrand: false }
      });
    } else {
      const defaultCategoryName = categoryOptions.length > 0 ? categoryOptions[0].name : '';
      setCurrentMacro({
        title: '',
        category: defaultCategoryName, 
        content: emptyContent,
        status: 'pending',
        platformTags: { shopee: false, lazada: false, tiktok: false, hasBrand: false }
      });
    }
    setIsModalOpen(true);
  }, [categoryOptions]);

  const handlePlatformTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      if (currentMacro) {
          setCurrentMacro({
              ...currentMacro,
              platformTags: {
                  ...currentMacro.platformTags,
                  [name]: checked,
              }
          });
      }
  };

  useEffect(() => {
    const macroIdToEdit = location.state?.macroIdToEdit;

    if (macroIdToEdit && macros.length > 0) {
      const macroToEdit = macros.find(m => m._id === macroIdToEdit);
      if (macroToEdit) {
        handleOpenModal(macroToEdit);
        navigate(location.pathname, { replace: true, state: {} });
      } else {
        toast.error('Không tìm thấy macro để chỉnh sửa.');
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, macros, navigate, handleOpenModal, location.pathname]);


  const filteredAndSortedMacros = useMemo(() => {
       let filtered = [...macros];

        if (filterCategory !== 'all') {
        filtered = filtered.filter(macro => macro.category === filterCategory);
        }
        if (statusFilter !== 'all') {
        filtered = filtered.filter(macro => macro.status === statusFilter);
        }
        if (searchQuery) {
        filtered = filtered.filter(macro =>
            macro.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        }
        if (sortOrder !== 'none') {
        filtered.sort((a, b) => {
            const countA = a.useCount || 0;
            const countB = b.useCount || 0;
            return sortOrder === 'asc' ? countA - countB : countB - countA;
        });
        }

        return filtered;
  }, [macros, filterCategory, statusFilter, searchQuery, sortOrder]);

  const handleSortByUseCount = () => {
       if (sortOrder === 'none') {
        setSortOrder('desc');
        } else if (sortOrder === 'desc') {
        setSortOrder('asc');
        } else {
        setSortOrder('none');
        }
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

    if (!token) {
      toast.error('Bạn cần đăng nhập để thực hiện hành động này!');
      return;
    }

    const url = currentMacro._id ? `/api/macros/${currentMacro._id}` : '/api/macros';
    const method = currentMacro._id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentMacro),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra.');
      }

      const savedMacro = await res.json();

      if (method === 'POST') {
        setMacros(prev => [savedMacro, ...prev]);
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
      if (!token) {
        toast.error('Bạn cần đăng nhập để thực hiện hành động này!');
        return;
      }
      try {
        const res = await fetch(`/api/macros/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
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
        <div className="filter-controls">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">Tất cả danh mục</option>
            {categoryOptions.map(cat => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xét duyệt</option>
            <option value="approved">Đã duyệt</option>
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
          <button className="add-new-btn-user" onClick={() => handleOpenModal()}>
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
              <th>Người tạo</th>
              <th>Người sửa đổi</th>
              <th>Ngày sửa đổi</th>
              <th>Trạng thái</th>
              <th onClick={handleSortByUseCount} style={{ cursor: 'pointer', userSelect: 'none' }}>
                Lượt sử dụng {sortOrder === 'desc' ? '▼' : sortOrder === 'asc' ? '▲' : '⇅'}
              </th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedMacros.map(macro => (
              <tr key={macro._id}>
                <td className="cell-left"><HighlightText text={macro.title} highlight={searchQuery} /></td>
                <td className="cell-center">{macro.category}</td>
                <td className="cell-center">{macro.createdBy?.fullName ?? 'Không xác định'}</td>
                <td className="cell-center">
                  {macro.lastModifiedBy?.fullName ?? macro.createdBy?.fullName ?? 'Không xác định'}
                </td>
                <td className="cell-center">
                  {new Date(macro.updatedAt).toLocaleString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </td>
                <td className="cell-center">
                  <span className={`status-badge status-${macro.status}`}>
                    {macro.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                  </span>
                </td>
                <td className="cell-center">{macro.useCount || 0}</td>
                <td className="action-cell">
                  <button className="action-btn edit-btn" onClick={() => handleOpenModal(macro)}>Sửa</button>
                  <button className="action-btn delete-btn" onClick={() => handleDelete(macro._id!)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && currentMacro && (
        <div className="modal-backdrop">
          <div className="macro-modal-content">
            <h3>{currentMacro._id ? 'Chỉnh sửa Macro' : 'Thêm Macro mới'}</h3>

            <div className="modal-body">
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
                    {categoryOptions.length === 0 && <option value="">Không có danh mục</option>}
                    {categoryOptions.map(cat => (
                      <option key={cat._id} value={cat.name}> 
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                 <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    value={currentMacro.status}
                    onChange={e => setCurrentMacro({...currentMacro, status: e.target.value as 'pending' | 'approved'})}
                  >
                    <option value="pending">Chờ xét duyệt</option>
                    <option value="approved">Đã duyệt</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Gắn thẻ (Không bắt buộc)</label>
                <div className="platform-tags-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="shopee"
                      checked={!!currentMacro!.platformTags?.shopee}
                      onChange={handlePlatformTagChange}
                    />
                    Shopee
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="lazada"
                      checked={!!currentMacro!.platformTags?.lazada}
                      onChange={handlePlatformTagChange}
                    />
                    Lazada
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="tiktok"
                      checked={!!currentMacro!.platformTags?.tiktok}
                      onChange={handlePlatformTagChange}
                    />
                    Tiktok
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="hasBrand"
                      checked={!!currentMacro!.platformTags?.hasBrand}
                      onChange={handlePlatformTagChange}
                    />
                    Chứa tên Brand
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Nội dung</label>
                <RichTextEditor
                  value={currentMacro.content || emptyContent}
                  onChange={newContent => setCurrentMacro({...currentMacro, content: newContent})}
                />
              </div>
            </div>

            <div className="macro-modal-actions">
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