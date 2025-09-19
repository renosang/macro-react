import React, { useState, useEffect, useMemo } from 'react';
import { useUserStore, User, UserRole } from '../../stores/useUserStore';
import EditUserModal from './EditUserModal'; // Import modal
import './ManageUsers.css';

const ManageUsers: React.FC = () => {
  const { users, fetchUsers, addUser, removeUser } = useUserStore();
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => 
    users.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim() && newPassword.trim()) {
      addUser(newUsername.trim(), newPassword.trim(), newRole);
      setNewUsername('');
      setNewPassword('');
    } else {
      alert('Vui lòng nhập đủ tên và mật khẩu!');
    }
  };

  return (
    <div className="manage-users">
      {/* Render modal nếu có user đang được sửa */}
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />}

      <h2>Quản lý Thành viên</h2>
      
      <form onSubmit={handleAddUser} className="add-user-form">
        <h3>Thêm thành viên mới</h3>
        <input type="text" placeholder="Tên đăng nhập" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required />
        <input type="password" placeholder="Mật khẩu" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value as UserRole)}>
          <option value="user">User (Quyền xem)</option>
          <option value="admin">Admin (Toàn quyền)</option>
        </select>
        <button type="submit">Thêm</button>
      </form>

      <div className="users-toolbar">
        <input 
          type="text" 
          placeholder="Tìm kiếm người dùng..." 
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Tên đăng nhập</th>
              <th>Quyền hạn</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
                <td className="actions-cell">
                  <button onClick={() => setEditingUser(user)} className="edit-btn">Sửa</button>
                  <button onClick={() => removeUser(user.id)} className="delete-btn">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;