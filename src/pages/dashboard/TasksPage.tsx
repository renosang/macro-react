import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Task } from '../../types';
import useAuthStore from '../../stores/useAuthStore';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './TasksPage.css';
// SỬA LỖI: Import icon từ 'react-icons/hi2' và cập nhật tên icon
import { 
    HiOutlineClipboardDocumentList, 
    HiOutlinePencil, 
    HiOutlineTrash, 
    HiOutlineCheck, 
    HiOutlineXMark 
} from 'react-icons/hi2';

ChartJS.register(ArcElement, Tooltip, Legend);

// SỬA LỖI: Cập nhật tên component icon
const IconTasks = HiOutlineClipboardDocumentList as React.ElementType;
const IconEdit = HiOutlinePencil as React.ElementType;
const IconDelete = HiOutlineTrash as React.ElementType;
const IconSave = HiOutlineCheck as React.ElementType;
const IconCancel = HiOutlineXMark as React.ElementType;

function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const { token } = useAuthStore();

    useEffect(() => {
        const fetchTasks = async () => {
            if (!token) return;
            try {
                const res = await fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } });
                if (!res.ok) throw new Error('Failed to fetch tasks.');
                const data = await res.json();
                setTasks(data);
            } catch (error: any) {
                toast.error(error.message);
            }
        };
        fetchTasks();
    }, [token]);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !token) return;

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title: newTaskTitle }),
            });
            if (!res.ok) throw new Error('Failed to add task.');
            const newTask = await res.json();
            setTasks([newTask, ...tasks]);
            setNewTaskTitle('');
            toast.success('Thêm công việc thành công!');
        } catch (error: any) {
            toast.error(error.message);
        }
    };
    
    const handleUpdateTask = async (task: Task) => {
        if (!token) return;
        try {
            const res = await fetch(`/api/tasks/${task._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title: task.title, status: task.status }),
            });
            if (!res.ok) throw new Error('Failed to update task.');
            const updatedTask = await res.json();
            setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
            setEditingTask(null);
            toast.success('Cập nhật thành công!');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!token || !window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) return;
        
        try {
            const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to delete task.');
            setTasks(tasks.filter(task => task._id !== id));
            toast.success('Đã xóa công việc.');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const taskStats = useMemo(() => {
        const completed = tasks.filter(t => t.status === 'completed').length;
        const pending = tasks.length - completed;
        return { completed, pending };
    }, [tasks]);

    const chartData = {
        labels: ['Hoàn thành', 'Chưa hoàn thành'],
        datasets: [
            {
                data: [taskStats.completed, taskStats.pending],
                backgroundColor: ['#28a745', '#ffc107'],
                borderColor: ['#ffffff', '#ffffff'],
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className="tasks-page-container">
            <h1><IconTasks /> Danh sách tác vụ</h1>
            <div className="tasks-grid">
                <div className="tasks-main-content">
                    <h2>Công việc của bạn</h2>
                    <form className="add-task-form" onSubmit={handleAddTask}>
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Thêm một công việc mới..."
                        />
                        <button type="submit">Thêm</button>
                    </form>
                    <div className="task-list">
                        {tasks.map(task => (
                            <div key={task._id} className={`task-item ${task.status}`}>
                                <div className="task-item-content">
                                    <input
                                        type="checkbox"
                                        id={`task-${task._id}`}
                                        checked={task.status === 'completed'}
                                        onChange={() => handleUpdateTask({...task, status: task.status === 'pending' ? 'completed' : 'pending'})}
                                    />
                                    {editingTask?._id === task._id ? (
                                        <input
                                            type="text"
                                            className="edit-input"
                                            value={editingTask.title}
                                            onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                                            autoFocus
                                        />
                                    ) : (
                                        <label htmlFor={`task-${task._id}`} className="task-title">{task.title}</label>
                                    )}
                                </div>
                                <div className="task-actions">
                                    {editingTask?._id === task._id ? (
                                        <>
                                            <button className="save-btn" onClick={() => handleUpdateTask(editingTask)}><IconSave /></button>
                                            <button className="cancel-btn" onClick={() => setEditingTask(null)}><IconCancel /></button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => setEditingTask(task)}><IconEdit /></button>
                                            <button className="delete-btn" onClick={() => handleDeleteTask(task._id)}><IconDelete /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <aside className="task-stats">
                    <h2>Thống kê</h2>
                    <div className="chart-container">
                        <Doughnut data={chartData} options={{ maintainAspectRatio: false }}/>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default TasksPage;