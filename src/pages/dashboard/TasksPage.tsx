// src/pages/dashboard/TasksPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/useAuthStore';
import { User, Task } from '../../types';
import AssignTaskModal from './AssignTaskModal';
import './TasksPage.css';
import { useLocation } from 'react-router-dom';

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Không có';
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const getTaskStatus = (task: Task) => {
  if (task.isComplete) {
    return { text: 'Hoàn thành', className: 'status-completed' };
  }
  if (task.deadline) {
    const deadlineDate = new Date(task.deadline);
    const today = new Date();
    deadlineDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (deadlineDate.getTime() < today.getTime()) {
      return { text: 'Trễ Deadline', className: 'status-overdue' };
    }
    if (deadlineDate.getTime() === today.getTime()) {
      return { text: 'Sắp đến hạn', className: 'status-warning' };
    }
  }
  return { text: 'Đang chờ', className: 'status-pending' };
};

function TasksPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token, user: currentUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/tasks/users', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if(isMounted) {
            if (res.ok) setAllUsers(Array.isArray(data) ? data : []);
            else throw new Error(data.message);
        }
      } catch (error: any) {
        if(isMounted) toast.error(`Không thể tải danh sách user: ${error.message}`);
      }
    };
    fetchUsers();
    return () => { isMounted = false };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    const fetchTasks = async () => {
      if (isMounted) setIsLoading(true);
      try {
        const res = await fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (isMounted) {
          if (res.ok) {
            setAllTasks(Array.isArray(data) ? data : []);
          } else {
            throw new Error(data.message || 'Lỗi không xác định');
          }
        }
      } catch (error: any) {
        if (isMounted) {
            toast.error(`Không thể tải danh sách task: ${error.message}`);
            setAllTasks([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchTasks();
    return () => { isMounted = false; };
    // Thêm location.key vào dependencies
  }, [token, location.key]);

  const { myTasks, assignedTasks } = useMemo(() => {
    const myTasks = allTasks.filter(t => t.assignedTo?._id === currentUser?.id);
    const assignedTasks = allTasks.filter(t => t.assignedBy?._id === currentUser?.id);
    return { myTasks, assignedTasks };
  }, [allTasks, currentUser]);

  const handleToggleComplete = async (task: Task) => {
    const originalTasks = [...allTasks];
    setAllTasks(prev => prev.map(t => t._id === task._id ? { ...t, isComplete: !t.isComplete } : t));
    try {
      const res = await fetch(`/api/tasks/${task._id}/toggle-complete`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAllTasks(prev => prev.map(t => t._id === data._id ? data : t));
      toast.success('Cập nhật trạng thái thành công!', { id: `task-toggle-${task._id}` }); // ID động hơn
    } catch (error: any) {
      toast.error(`Lỗi cập nhật: ${error.message}`, { id: `task-toggle-err-${task._id}` });
      setAllTasks(originalTasks);
    }
  };

  const handleTaskAssigned = (newTask: Task) => {
    setAllTasks(prev => [newTask, ...prev]);
  };

  const renderTaskItem = (task: Task, isMyTask: boolean) => {
    const status = getTaskStatus(task);
    return (
      <li key={task._id} className={`task-item ${task.isComplete ? 'completed' : ''}`}>
        <div className="task-item-left">
          {isMyTask && ( <input type="checkbox" checked={task.isComplete} onChange={() => handleToggleComplete(task)} className="task-checkbox" /> )}
          {!isMyTask && ( <span className={`task-checkbox-display ${task.isComplete ? 'checked' : ''}`}>{task.isComplete ? '✔' : '☐'}</span> )}
          <div className="task-details">
            <span className="task-title">{task.title}</span>
            {task.description && (<p className="task-description">{task.description}</p>)}
            <span className="task-meta">
              {isMyTask ? `Giao bởi: ${task.assignedBy?.fullName || 'N/A'}` : `Gán cho: ${task.assignedTo?.fullName || 'N/A'}`}
              {' | '} Deadline: {formatDate(task.deadline)}
            </span>
          </div>
        </div>
        <div className="task-item-right">
          <span className={`task-status ${status.className}`}>{status.text}</span>
        </div>
      </li>
    );
  };

  return (
    <div className="tasks-page-container">
       <div className="tasks-header">
        <h1>Danh sách Tác vụ</h1>
        <button className="add-new-btn-user" onClick={() => setIsModalOpen(true)} disabled={allUsers.filter(u => u._id !== currentUser?.id).length === 0}>
          + Giao Task mới
        </button>
      </div>
      {isLoading && <p>Đang tải danh sách...</p>}
      {!isLoading && (
        <div className="tasks-lists">
          <div className="task-list-section">
            <h2>Việc của tôi ({myTasks.length})</h2>
            <ul className="task-list">
              {myTasks.length === 0 ? (<li className="task-item-empty">Bạn không có task nào.</li>)
               : (myTasks.map(task => renderTaskItem(task, true)))}
            </ul>
          </div>
          <div className="task-list-section">
            <h2>Việc tôi đã giao ({assignedTasks.length})</h2>
            <ul className="task-list">
              {assignedTasks.length === 0 ? (<li className="task-item-empty">Bạn chưa gán task nào.</li>)
               : (assignedTasks.map(task => renderTaskItem(task, false)))}
            </ul>
          </div>
        </div>
      )}
      {isModalOpen && (
        <AssignTaskModal
          users={allUsers}
          onClose={() => setIsModalOpen(false)}
          onTaskAssigned={handleTaskAssigned}
        />
      )}
    </div>
  );
}

export default TasksPage;