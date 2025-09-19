import React, { useState } from 'react';
import { useUserStore, User, UserRole, UserUpdatePayload } from '../../stores/useUserStore';
import './EditUserModal.css'; // File CSS đi kèm

interface EditUserModalProps {
  user: User;
  onClose: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose }) => {
  const { editUser } = useUserStore();
  const [username, setUsername] = useState(user.username);
  const [role, setRole] = useState<UserRole>(user.role);
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UserUpdatePayload = { username, role };
    if (password) {
      payload.password = password;
    }
    editUser(user.id, payload);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h2>Chỉnh sửa: {user.username}</h2>
          <div className="input-group">
            <label>Tên đăng nhập</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Quyền hạn</label>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="input-group">
            <label>Đặt lại mật khẩu (để trống nếu không đổi)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Hủy</button>
            <button type="submit" className="btn-save">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;