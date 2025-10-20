import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import './ManageUsers.css';
import { User } from '../../types';
import useAuthStore from '../../stores/useAuthStore';

function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        return;
      }
      try {
        const res = await fetch('/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Không thể tải danh sách người dùng.');
        }
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast.error(`Lỗi: ${error.message}`);
        setUsers([]);
      }
    };
    fetchUsers();
  }, [token]);

  const formatDateTime = (isoString: string | null | undefined) => {
    if (!isoString) return 'Chưa có hoạt động';
    return new Date(isoString).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatus = (lastActivity: string | null | undefined) => {
    if (!lastActivity) {
      return { text: 'Ngoại tuyến', className: 'inactive' };
    }
    const lastActivityTime = new Date(lastActivity).getTime();
    const now = new Date().getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (now - lastActivityTime < fiveMinutes) {
      return { text: 'Đang hoạt động', className: 'active' };
    }
    return { text: 'Ngoại tuyến', className: 'inactive' };
  };

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    
    const query = searchQuery.toLowerCase();
    
    // --- BỔ SUNG TÌM KIẾM THEO TÊN ĐĂNG NHẬP (USERNAME) ---
    return users.filter(user =>
      (user.fullName && user.fullName.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.username && user.username.toLowerCase().includes(query)) || // Thêm điều kiện tìm kiếm theo username
      (user._id && user._id.toString().toLowerCase().includes(query))
    );
    // --- KẾT THÚC ---
    
  }, [users, searchQuery]);

  const handleOpenModal = (user: Partial<User> | null = null) => {
    setCurrentUser(user ? { ...user } : { fullName: '', username: '', email: '', role: 'user' });
    setNewPassword('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleSave = async () => {
    if (!currentUser || !token) return;
    const url = currentUser._id ? `/api/users/${currentUser._id}` : '/api/users';
    const method = currentUser._id ? 'PUT' : 'POST';
    const body: any = { ...currentUser };
    if (newPassword) body.password = newPassword;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Thao tác thất bại.');
      }
      const savedUser = await res.json();
      if (method === 'POST') {
        setUsers(prev => [...prev, savedUser]);
        toast.success('Tạo người dùng thành công!');
      } else {
        setUsers(prev => prev.map(u => u._id === savedUser._id ? savedUser : u));
        toast.success('Cập nhật thành công!');
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      if (!token) return;
      try {
        const res = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Xóa thất bại.');
        }
        setUsers(prev => prev.filter(u => u._id !== id));
        toast.success('Xóa người dùng thành công!');
      } catch (error: any) {
        toast.error(`Lỗi: ${error.message}`);
      }
    }
  };

  return (
    <div className="manage-users-container">
      <h2>Quản lý Người dùng</h2>
      <div className="user-controls">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email, tên đăng nhập hoặc ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button className="add-new-btn-user" onClick={() => handleOpenModal()}>
          Thêm Người dùng
        </button>
      </div>
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Tên đăng nhập</th>
              <th>Quyền</th>
              <th>Trạng thái</th>
              <th>Truy cập gần nhất</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const status = getStatus(user.lastActivity);
              return (
                <tr key={user._id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${status.className}`}>
                      {status.text}
                    </span>
                  </td>
                  <td>{formatDateTime(user.lastActivity)}</td>
                  <td className="action-cell">
                    <button className="action-btn edit-btn" onClick={() => handleOpenModal(user)}>Sửa</button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(user._id)}>Xóa</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>{currentUser?._id ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng mới'}</h3>
            <div className="form-group"><label>Họ và tên</label><input type="text" value={currentUser?.fullName || ''} onChange={e => setCurrentUser({ ...currentUser, fullName: e.target.value })}/></div>
            <div className="form-group"><label>Tên đăng nhập</label><input type="text" value={currentUser?.username || ''} disabled={!!currentUser?._id} onChange={e => setCurrentUser({ ...currentUser, username: e.target.value })}/></div>
            <div className="form-group"><label>Email</label><input type="email" value={currentUser?.email || ''} onChange={e => setCurrentUser({ ...currentUser, email: e.target.value })}/></div>
            <div className="form-group"><label>Mật khẩu {currentUser?._id ? '(Để trống nếu không đổi)' : ''}</label><input type="password" placeholder="Nhập mật khẩu..." value={newPassword} onChange={e => setNewPassword(e.target.value)}/></div>
            <div className="form-group"><label>Quyền</label><select value={currentUser?.role} onChange={e => setCurrentUser({ ...currentUser, role: e.target.value as 'user' | 'admin' })}><option value="user">User</option><option value="admin">Admin</option></select></div>
            <div className="modal-actions"><button className="action-btn cancel-btn" onClick={handleCloseModal}>Hủy</button><button className="action-btn save-btn" onClick={handleSave}>Lưu</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsersPage;