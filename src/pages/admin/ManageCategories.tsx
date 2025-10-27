import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import './ManageCategories.css';
import { Category } from '../../types'; // Đảm bảo type Category có parent và children
import useAuthStore from '../../stores/useAuthStore';

// Interface cho danh sách phẳng dùng trong dropdown
interface FlatCategoryOption {
  _id: string;
  name: string; // Tên đã có tiền tố thụt lề
}

function ManageCategories() {
  // State categories sẽ lưu cấu trúc cây từ API
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedParentAdd, setSelectedParentAdd] = useState<string>(''); // Lưu ID cha khi thêm
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingName, setEditingName] = useState('');
  const [selectedParentEdit, setSelectedParentEdit] = useState<string>(''); // Lưu ID cha khi sửa
  const { token } = useAuthStore();

  // Hàm tải dữ liệu danh mục (dạng cây)
  const fetchCategories = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/categories', { // API này trả về cấu trúc cây
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Không thể tải danh mục.');
      const data = await res.json();
      setCategories(data); // Lưu cấu trúc cây vào state
    } catch (error: any) {
      toast.error(error.message);
      setCategories([]); // Đặt lại thành mảng rỗng nếu lỗi
    }
  };

  // Tải dữ liệu khi component mount hoặc token thay đổi
  useEffect(() => {
    fetchCategories();
  }, [token]);

  // Hàm tạo danh sách phẳng có thụt lề cho dropdown
  const getFlatCategories = (cats: Category[], prefix = '', excludeId: string | null = null): FlatCategoryOption[] => {
    let flatList: FlatCategoryOption[] = [];
    cats.forEach(cat => {
      // Bỏ qua chính danh mục đang sửa và con cháu của nó (để tránh vòng lặp cha-con)
      if (cat._id === excludeId) {
        return;
      }
      flatList.push({ _id: cat._id, name: prefix + cat.name });
      if (cat.children && cat.children.length > 0) {
        flatList = flatList.concat(getFlatCategories(cat.children, prefix + '-- ', excludeId));
      }
    });
    return flatList;
  };

  // Tạo danh sách phẳng cho dropdown "Thêm mới"
  const flatCategoryOptionsAdd = useMemo(() => getFlatCategories(categories), [categories]);

  // Tạo danh sách phẳng cho dropdown "Sửa" (loại bỏ category đang sửa)
  const flatCategoryOptionsEdit = useMemo(() => {
    return editingCategory ? getFlatCategories(categories, '', editingCategory._id) : [];
  }, [categories, editingCategory]);


  // --- HÀM XỬ LÝ THÊM MỚI ---
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
          parent: selectedParentAdd || null // Gửi null nếu không chọn cha
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Thêm thất bại.');
      }
      // Tải lại danh sách sau khi thêm thành công
      await fetchCategories();

      toast.success('Thêm danh mục thành công!');
      setIsAdding(false);
      setNewCategoryName('');
      setSelectedParentAdd(''); // Reset dropdown
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  // --- HÀM MỞ FORM SỬA ---
  const handleEdit = (category: Category) => {
     setEditingCategory(category);
    setEditingName(category.name);
    setSelectedParentEdit(category.parent || ''); // Đặt giá trị parent hiện tại
    setIsAdding(false); // Đóng form thêm nếu đang mở
  };

  // --- HÀM HỦY SỬA ---
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditingName('');
    setSelectedParentEdit('');
  };

  // --- HÀM LƯU KHI SỬA ---
  const handleSaveEdit = async () => {
    if (!editingCategory || editingName.trim() === '') {
      toast.error('Tên danh mục không được để trống!');
      return;
    }
    // Ngăn chặn tự đặt mình làm cha (Backend cũng nên có kiểm tra này)
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
          parent: selectedParentEdit || null // Gửi parent mới
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Cập nhật thất bại.');
      }
      // Tải lại danh sách sau khi sửa thành công
      await fetchCategories();

      toast.success('Cập nhật thành công!');
      handleCancelEdit(); // Đóng form sửa
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  // --- HÀM XÓA ---
  const handleDelete = async (id: string) => {
     if (window.confirm('Xóa danh mục này sẽ chuyển các danh mục con (nếu có) thành danh mục gốc. Bạn có chắc chắn?')) {
      if (!token) return;
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Xóa thất bại.');
        
        // Tải lại danh sách sau khi xóa thành công
        await fetchCategories();

        toast.success('Xóa danh mục thành công!');
        // Nếu đang sửa danh mục vừa xóa thì hủy sửa
        if(editingCategory?._id === id) {
            handleCancelEdit();
        }
      } catch (error: any) {
        toast.error(`Lỗi: ${error.message}`);
      }
    }
  };

  // --- COMPONENT ĐỆ QUY ĐỂ RENDER CÂY DANH MỤC ---
  const renderCategoryRow = (category: Category, level = 0) => {
    const isEditingCurrent = editingCategory?._id === category._id;

    // Tìm tên của danh mục cha từ danh sách phẳng
    const parentName = flatCategoryOptionsAdd.find(opt => opt._id === category.parent)?.name.replace(/^-- /, '') || '---';

    return (
      <React.Fragment key={category._id}>
        <tr className={level > 0 ? 'child-category' : 'root-category'}>
          {/* Tên danh mục với thụt lề */}
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
          {/* Danh mục cha */}
          <td>
            {isEditingCurrent ? (
              <select value={selectedParentEdit} onChange={(e) => setSelectedParentEdit(e.target.value)} className="parent-select">
                <option value="">-- Là danh mục gốc --</option>
                {/* Lọc bỏ chính nó và con cháu khỏi danh sách cha */}
                {flatCategoryOptionsEdit.map((opt: FlatCategoryOption) => ( 
                    <option key={opt._id} value={opt._id}>{opt.name}</option>
                  ))
                }
              </select>
            ) : (
              parentName // Hiển thị tên cha đã tìm được
            )}
          </td>
          {/* Hành động */}
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
        {/* Gọi đệ quy để render các con */}
        {category.children && category.children.length > 0 && category.children.map(child => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    );
  };
  // --- KẾT THÚC COMPONENT ĐỆ QUY ---

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
            {/* Sử dụng danh sách phẳng cho dropdown */}
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
          {/* Render cây danh mục */}
          {categories.map(category => renderCategoryRow(category))} 
          {categories.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center' }}>Chưa có danh mục nào.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ManageCategories;