import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './ManageCategories.css';
import { Category } from '../../App';

interface ManageCategoriesProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

function ManageCategories({ categories, setCategories }: ManageCategoriesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddNew = () => {
    if (newCategoryName.trim() === '') {
      toast.error('Tên danh mục không được để trống!');
      return;
    }
    const newCategory = { id: Date.now(), name: newCategoryName };
    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setIsAdding(false);
    toast.success('Thêm danh mục thành công!');
  };

  const handleDelete = (id: number) => {
    const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa danh mục này không?');
    if (isConfirmed) {
      setCategories(prev => prev.filter(category => category.id !== id));
      toast.success('Đã xóa danh mục thành công!');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setEditingName(category.name);
  };

  const handleSaveEdit = () => {
    if (!editingCategory || editingName.trim() === '') {
      toast.error('Tên danh mục không được để trống!');
      return;
    }
    setCategories(prev => 
      prev.map(cat => 
        cat.id === editingCategory.id ? { ...cat, name: editingName } : cat
      )
    );
    toast.success('Cập nhật danh mục thành công!');
    setEditingCategory(null);
  };
  
  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  return (
    <div className="manage-categories">
      <h2>Quản lý Danh mục</h2>
      <button onClick={() => setIsAdding(!isAdding)} className="add-new-btn">
        {isAdding ? 'Hủy' : 'Thêm mới danh mục'}
      </button>
      
      {isAdding && (
        <div className="add-new-form">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nhập tên danh mục mới..."
          />
          <button onClick={handleAddNew}>Lưu</button>
        </div>
      )}

      <table className="categories-table">
        <thead>
          <tr>
            <th>Tên danh mục</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>
                {editingCategory?.id === category.id ? (
                  <input 
                    type="text" 
                    value={editingName} 
                    onChange={(e) => setEditingName(e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  category.name
                )}
              </td>
              <td>
                {editingCategory?.id === category.id ? (
                  <>
                    <button className="action-btn save-btn" onClick={handleSaveEdit}>Lưu</button>
                    <button className="action-btn cancel-btn" onClick={handleCancelEdit}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button className="action-btn edit-btn" onClick={() => handleEdit(category)}>Sửa</button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(category.id)}>Xóa</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageCategories;