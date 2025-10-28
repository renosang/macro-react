// src/pages/admin/ManageCategories.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import './ManageCategories.css';
import { Category } from '../../types'; 
import useAuthStore from '../../stores/useAuthStore';

interface FlatCategoryOption {
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

interface ManageCategoriesProps {
  initialCategories: Category[];
}

function ManageCategories({ initialCategories }: ManageCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [categoriesTree, setCategoriesTree] = useState<Category[]>([]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedParentAdd, setSelectedParentAdd] = useState<string>(''); 
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingName, setEditingName] = useState('');
  const [selectedParentEdit, setSelectedParentEdit] = useState<string>(''); 
  const { token } = useAuthStore();

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Không thể tải danh mục.');
      const data = await res.json();
      setCategories(data);
      setCategoriesTree(buildCategoryTree(data, null));
    } catch (error: any) {
      toast.error(error.message);
      setCategories([]); 
      setCategoriesTree([]);
    }
  }, [token]); 

  useEffect(() => {
    setCategories(initialCategories);
    setCategoriesTree(buildCategoryTree(initialCategories, null));
  }, [initialCategories]);

  const getFlatCategories = useCallback((cats: Category[], prefix = '', excludeId: string | null = null): FlatCategoryOption[] => {
    let flatList: FlatCategoryOption[] = [];
    cats.forEach(cat => {
      if (cat._id === excludeId) {
        return;
      }
      flatList.push({ _id: cat._id, name: prefix + cat.name });
      if (cat.children && cat.children.length > 0) {
        flatList = flatList.concat(getFlatCategories(cat.children, prefix + '-- ', excludeId));
      }
    });
    return flatList;
  }, []); 

  const flatCategoryOptionsAdd = useMemo(() => getFlatCategories(categoriesTree), [categoriesTree, getFlatCategories]);

  const flatCategoryOptionsEdit = useMemo(() => {
    return editingCategory ? getFlatCategories(categoriesTree, '', editingCategory._id) : [];
  }, [categoriesTree, editingCategory, getFlatCategories]);


  const handleAddNew = async () => {
    if (newCategoryName.trim() === '') {
      toast.error('Tên danh mục không được để trống!');
      return;
    }
    if (!token) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: newCategoryName,
          parent: selectedParentAdd || null // Gửi ID
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Thêm thất bại.');
      }
      await fetchCategories();
      toast.success('Thêm danh mục thành công!');
      setIsAdding(false);
      setNewCategoryName('');
      setSelectedParentAdd(''); 
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  const handleEdit = (category: Category) => {
     setEditingCategory(category);
    setEditingName(category.name);
    setSelectedParentEdit(category.parent || ''); // parent đã là ID
    setIsAdding(false); 
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditingName('');
    setSelectedParentEdit('');
  };

  const handleSaveEdit = async () => {
    if (!editingCategory || editingName.trim() === '') {
      toast.error('Tên danh mục không được để trống!');
      return;
    }
    if (editingCategory._id === selectedParentEdit) {
         toast.error('Không thể đặt danh mục làm cha của chính nó.');
         return;
    }
    if (!token) return;

    try {
      const res = await fetch(`/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: editingName,
          parent: selectedParentEdit || null // Gửi ID
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Cập nhật thất bại.');
      }
      await fetchCategories();
      toast.success('Cập nhật thành công!');
      handleCancelEdit(); 
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
     if (window.confirm('Xóa danh mục này sẽ chuyển các danh mục con (nếu có) thành danh mục gốc. Bạn có chắc chắn?')) {
      if (!token) return;
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Xóa thất bại.');
        
        await fetchCategories();
        toast.success('Xóa danh mục thành công!');
        if(editingCategory?._id === id) {
            handleCancelEdit();
        }
      } catch (error: any) {
        toast.error(`Lỗi: ${error.message}`);
      }
    }
  };

  const renderCategoryRow = (category: Category, level = 0) => {
    const isEditingCurrent = editingCategory?._id === category._id;

    const parentName = categories.find(opt => opt._id === category.parent)?.name || '---';

    return (
      <React.Fragment key={category._id}>
        <tr className={level > 0 ? 'child-category' : 'root-category'}>
          <td style={{ paddingLeft: `${level * 25 + 12}px` }}>
            {isEditingCurrent ? (
              <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} className="edit-input" />
            ) : ( 
              <>
                {level > 0 && <span className="hierarchy-indicator">└─ </span>}
                {category.name}
              </>
            )}
          </td>
          <td>
            {isEditingCurrent ? (
              <select value={selectedParentEdit} onChange={(e) => setSelectedParentEdit(e.target.value)} className="parent-select">
                <option value="">-- Là danh mục gốc --</option>
                {flatCategoryOptionsEdit.map((opt: FlatCategoryOption) => ( 
                    <option key={opt._id} value={opt._id}>{opt.name}</option>
                  ))
                }
              </select>
            ) : (
              parentName 
            )}
          </td>
          <td className="action-cell">
            {isEditingCurrent ? (
              <>
                <button className="action-btn save-btn" onClick={handleSaveEdit}>Lưu</button>
                <button className="action-btn cancel-btn" onClick={handleCancelEdit}>Hủy</button>
              </>
            ) : (
              <>
                <button className="action-btn edit-btn" onClick={() => handleEdit(category)}>Sửa</button>
                <button className="action-btn delete-btn" onClick={() => handleDelete(category._id)}>Xóa</button>
              </>
            )}
          </td>
        </tr>
        {category.children && category.children.length > 0 && category.children.map(child => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="manage-categories">
      <h2>Quản lý Danh mục</h2>
      <button className="add-new-btn-category" onClick={() => { setIsAdding(!isAdding); setEditingCategory(null); }}>
        {isAdding ? 'Hủy Thêm mới' : 'Thêm Danh mục mới'}
      </button>

      {isAdding && (
        <div className="add-new-form">
          <input type="text" placeholder="Nhập tên danh mục mới..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
          <select value={selectedParentAdd} onChange={(e) => setSelectedParentAdd(e.target.value)} className="parent-select">
            <option value="">-- Là danh mục gốc --</option>
            {flatCategoryOptionsAdd.map((opt: FlatCategoryOption) => ( 
              <option key={opt._id} value={opt._id}>{opt.name}</option>
            ))}
          </select>
          <button onClick={handleAddNew}>Lưu</button>
        </div>
      )}

      <table className="categories-table">
        <thead>
          <tr>
            <th>Tên danh mục</th>
            <th>Danh mục cha</th> 
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categoriesTree.map(category => renderCategoryRow(category))} 
          {categoriesTree.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center' }}>Chưa có danh mục nào.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ManageCategories;