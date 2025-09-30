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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Không thể tải danh sách người dùng.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() =>
    users.filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    ), [users, searchQuery]);

  const handleOpenModal = (user: User | null = null) => {
    setCurrentUser(user ? { ...user } : { username: '', fullName: '', email: '', role: 'user' });
    setNewPassword('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleSave = async () => {
    if (!currentUser) return;

    const isCreating = !currentUser._id;
    const url = isCreating ? '/api/users' : `/api/users/${currentUser._id}`;
    const method = isCreating ? 'POST' : 'PUT';
    
    const body: any = {
        username: currentUser.username,
        fullName: currentUser.fullName, // Gửi fullName đi
        email: currentUser.email,
        role: currentUser.role
    };

    if (newPassword) {
        body.password = newPassword;
    } else if (isCreating) {
        toast.error('Mật khẩu là bắt buộc khi tạo người dùng mới.');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Thao tác thất bại.');
        }

        toast.success(`Đã ${isCreating ? 'thêm' : 'cập nhật'} thành công!`);
        fetchUsers();
        handleCloseModal();

    } catch (error: any) {
        console.error('Lỗi khi lưu:', error);
        toast.error(error.message || 'Đã có lỗi xảy ra.');
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Xóa thất bại.');
        }

        toast.success('Đã xóa người dùng thành công!');
        fetchUsers();
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!currentUser) return;
    const { name, value } = e.target;
    setCurrentUser({
      ...currentUser,
      [name]: value
    });
  };

  return (
    <div className="manage-users-container">
      <h2>Quản lý người dùng</h2>
      <div className="controls">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button className="add-btn" onClick={() => handleOpenModal()}>
          + Thêm nhân viên
        </button>
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Tên đăng nhập</th>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Quyền</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              {/* Hiển thị fullName */}
              <td>{user.fullName}</td> 
              <td>{user.email}</td>
              <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
              <td>
                <button className="action-btn edit-btn" onClick={() => handleOpenModal(user)}>Sửa</button>
                <button className="action-btn delete-btn" onClick={() => handleDeleteUser(user._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && currentUser && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>{currentUser._id ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</h3>
            
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                name="username"
                value={currentUser.username}
                onChange={handleInputChange}
                disabled={!!currentUser._id}
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu {currentUser._id ? '(Để trống nếu không đổi)' : ''}</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu..."
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                name="fullName" // Đổi name thành "fullName"
                placeholder='Nhập họ và tên...'
                value={currentUser.fullName} // Gắn với state.fullName
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder='Nhập email...'
                value={currentUser.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Quyền</label>
              <select
                name="role"
                value={currentUser.role}
                onChange={handleInputChange}
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