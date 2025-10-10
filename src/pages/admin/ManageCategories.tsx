import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './ManageCategories.css';
import { Category } from '../../types';

interface ManageCategoriesProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

function ManageCategories({ categories, setCategories }: ManageCategoriesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingName, setEditingName] = useState('');

  // HÀM TẠO MỚI (ĐÃ CẬP NHẬT XỬ LÝ LỖI)
  const handleAddNew = async () => {
    if (newCategoryName.trim() === '') {
      toast.error('Tên danh mục không được để trống!');
      return;
    }
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      });

      // Xử lý lỗi tốt hơn
      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Lỗi từ server');
        } else {
          throw new Error(`Lỗi server: ${res.status} ${res.statusText}. Phản hồi không phải là JSON.`);
        }
      }
      
      const newCategory = await res.json();
      setCategories([...categories, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName('');
      setIsAdding(false);
      toast.success('Thêm danh mục thành công!');
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  // HÀM XÓA
  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
      try {
        await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        setCategories(prev => prev.filter(category => category._id !== id));
        toast.success('Đã xóa danh mục thành công!');
      } catch (error: any) {
        toast.error(`Lỗi: ${error.message}`);
      }
    }
  };
  
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setEditingName(category.name);
  };

  // HÀM LƯU SAU KHI SỬA
  const handleSaveEdit = async () => {
    if (!editingCategory || editingName.trim() === '') {
      toast.error('Tên danh mục không được để trống!');
      return;
    }
    try {
      const res = await fetch(`/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName }),
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      
      const updatedCategory = await res.json();
      setCategories(prev => 
        prev.map(cat => 
          cat._id === editingCategory._id ? updatedCategory : cat
        )
      );
      toast.success('Cập nhật danh mục thành công!');
      setEditingCategory(null);
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  return (
    <div className="manage-categories">
      <h2>Quản lý Danh mục</h2>
      <button onClick={() => setIsAdding(!isAdding)} className="add-new-btn-category">
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
            <tr key={category._id}>
              <td>
                {editingCategory?._id === category._id ? (
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
                {editingCategory?._id === category._id ? (
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageCategories;
