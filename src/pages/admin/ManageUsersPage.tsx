// src/pages/admin/ManageUsersPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import './ManageUsers.css';
import { User } from '../../types';

function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);
  
  // ---- BỔ SUNG HÀM FORMAT DATE ----
  const formatDateTime = (isoString: string | null | undefined) => {
    if (!isoString) return 'Chưa đăng nhập';
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  // ---- KẾT THÚC BỔ SUNG ----

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return users.filter(user =>
      (user.username?.toLowerCase() || '').includes(query) ||
      (user.fullName?.toLowerCase() || '').includes(query) ||
      (user.email?.toLowerCase() || '').includes(query)
    );
  }, [users, searchQuery]);

  const handleOpenModal = (user: Partial<User> | null = null) => {
    setCurrentUser(user ? { ...user } : { username: '', role: 'user', fullName: '', email: '' });
    setNewPassword('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };
  
  // Các hàm handleSave và handleDelete giữ nguyên, không cần thay đổi

  const handleSave = async () => {
    if (!currentUser) return;
    const url = currentUser._id ? `/api/users/${currentUser._id}` : '/api/users';
    const method = currentUser._id ? 'PUT' : 'POST';
    const body: any = {
      username: currentUser.username,
      fullName: currentUser.fullName,
      email: currentUser.email,
      role: currentUser.role,
    };
    if (method === 'POST') body.password = newPassword;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra');
      }
      if (currentUser._id && newPassword) {
        const resetRes = await fetch(`/api/users/${currentUser._id}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword }),
        });
        if (!resetRes.ok) {
           const errorData = await resetRes.json();
           throw new Error(errorData.message || 'Lỗi reset mật khẩu');
        }
      }
      const updatedUsers = await fetch('/api/users').then(res => res.json());
      setUsers(updatedUsers);
      toast.success(currentUser._id ? 'Cập nhật thành công!' : 'Tạo thành viên thành công!');
      handleCloseModal();
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      try {
        await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        setUsers(users.filter(user => user._id !== userId));
        toast.success('Xóa thành viên thành công!');
      } catch (error: any) {
        toast.error(`Lỗi: ${error.message}`);
      }
    }
  };
  
  return (
    <div className="manage-users">
      <h2>Quản lý Thành viên</h2>
      <div className="controls">
        <input
          type="text"
          placeholder="Tìm theo tên, email..."
          className="search-input"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button className="add-new-btn-user" onClick={() => handleOpenModal()}>
          Thêm thành viên
        </button>
      </div>

      <table className="users-table">
        <thead>
          {/* ---- CẬP NHẬT BẢNG ---- */}
          <tr>
            <th>Tên đăng nhập</th>
            <th>Họ và Tên</th>
            <th>Email</th>
            <th>Quyền</th>
            <th>Truy cập gần nhất</th>
            <th>Hành động</th>
          </tr>
          {/* ---- KẾT THÚC CẬP NHẬT ---- */}
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>
                <span className={`role-badge role-${user.role}`}>
                  {user.role}
                </span>
              </td>
              {/* ---- CẬP NHẬT BẢNG ---- */}
              <td>{formatDateTime(user.lastLogin)}</td>
              {/* ---- KẾT THÚC CẬP NHẬT ---- */}
              <td className="action-cell">
                <button className="action-btn edit-btn" onClick={() => handleOpenModal(user)}>Sửa</button>
                <button className="action-btn delete-btn" onClick={() => handleDelete(user._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Modal không thay đổi */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>{currentUser?._id ? 'Chỉnh sửa' : 'Thêm mới'} thành viên</h3>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                value={currentUser?.username || ''}
                onChange={e => setCurrentUser({ ...currentUser, username: e.target.value })}
                disabled={!!currentUser?._id}
              />
            </div>
             <div className="form-group">
              <label>Họ và Tên</label>
              <input
                type="text"
                value={currentUser?.fullName || ''}
                onChange={e => setCurrentUser({ ...currentUser, fullName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={currentUser?.email || ''}
                onChange={e => setCurrentUser({ ...currentUser, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu {currentUser?._id ? '(Để trống nếu không đổi)' : ''}</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu..."
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Quyền</label>
              <select
                value={currentUser?.role}
                onChange={e => setCurrentUser({ ...currentUser, role: e.target.value as 'user' | 'admin' })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
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

export default ManageUsersPage;