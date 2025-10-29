// src/pages/dashboard/AssignTaskModal.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/useAuthStore';
import { User } from '../../types';

interface AssignTaskModalProps {
  users: User[];
  onClose: () => void;
  onTaskAssigned: (newTask: any) => void;
}

function AssignTaskModal({ users, onClose, onTaskAssigned }: AssignTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token, user: currentUser } = useAuthStore();

  const assignableUsers = users.filter(u => u._id !== currentUser?.id);

  useEffect(() => {
    if (assignableUsers.length > 0 && !assignedTo) {
      setAssignedTo(assignableUsers[0]._id);
    }
  }, [assignableUsers, assignedTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedTo) {
      toast.error('Vui lòng nhập tiêu đề và chọn người nhận.', { id: 'task-validate' });
      return;
    }
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          assignedTo,
          deadline: deadline ? new Date(deadline).toISOString() : null
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gán task thất bại.');
      }

      toast.success('Gán task thành công!', { id: 'task-assign-success' });
      onTaskAssigned(data);
      onClose();

    } catch (error: any) {
      toast.error(error.message, { id: 'task-assign-error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalDateTimeString = (date: Date): string => {
    const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
  };
  const nowLocal = getLocalDateTimeString(new Date());


  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Giao Task mới</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="taskTitle">Tiêu đề Task</label>
            <input
              id="taskTitle" type="text" value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập nội dung task..." required
            />
          </div>
          <div className="form-group">
            <label htmlFor="taskDescription">Mô tả (Không bắt buộc)</label>
            <textarea
              id="taskDescription" value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả chi tiết cho task..." rows={3}
            />
          </div>
          <div className="form-group">
            <label htmlFor="assignedTo">Gán cho</label>
            <select id="assignedTo" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required >
              {assignableUsers.length === 0 && <option value="" disabled>Không có người dùng khác</option>}
              {assignableUsers.map(u => (
                <option key={u._id} value={u._id}>
                  {u.fullName} ({u.username})
                </option>
              ))}
            </select>
          </div>

<div className="form-group">
            <label htmlFor="deadline">Deadline (Không bắt buộc)</label>
            <input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={nowLocal}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="action-btn cancel-btn" onClick={onClose} disabled={isLoading}>
              Hủy
            </button>
            <button type="submit" className="action-btn save-btn" disabled={isLoading || assignableUsers.length === 0}>
              {isLoading ? 'Đang gán...' : 'Gán Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignTaskModal;