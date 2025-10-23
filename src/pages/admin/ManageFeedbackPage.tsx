import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Feedback } from '../../types';
import useAuthStore from '../../stores/useAuthStore';
import './ManageFeedbackPage.css';
import { Link } from 'react-router-dom'; // Import Link

// Hàm định dạng ngày giờ (có thể tạo thành util function dùng chung)
const formatDateTime = (isoString: string | null | undefined) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
};

function ManageFeedbackPage() {
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [filterStatus, setFilterStatus] = useState('all'); // State for filtering
    const { token } = useAuthStore();

    useEffect(() => {
        const fetchFeedback = async () => {
            if (!token) return;
            try {
                const res = await fetch('/api/feedback', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch feedback.');
                const data = await res.json();
                setFeedbackList(data);
            } catch (error: any) {
                toast.error(error.message);
            }
        };
        fetchFeedback();
    }, [token]);

    const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'addressed' | 'rejected') => {
        if (!token) return;
        try {
            const res = await fetch(`/api/feedback/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update status.');
            const updatedFeedback = await res.json(); 
            
            setFeedbackList(prevList =>
                prevList.map(item => 
                    (item._id === id 
                        ? { ...item, status: updatedFeedback.status, updatedAt: updatedFeedback.updatedAt } 
                        : item
                    )
                )
            );
            toast.success('Cập nhật trạng thái thành công!');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDeleteFeedback = async (id: string) => {
        if (!token || !window.confirm('Bạn có chắc chắn muốn xóa góp ý này?')) return;
        try {
            const res = await fetch(`/api/feedback/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete feedback.');
            setFeedbackList(prevList => prevList.filter(item => item._id !== id));
            toast.success('Đã xóa góp ý.');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Lọc danh sách feedback dựa trên trạng thái đã chọn
    const filteredFeedback = feedbackList.filter(item =>
        filterStatus === 'all' || item.status === filterStatus
    );

    return (
        <div className="manage-feedback-container">
            <h2>Quản lý Góp ý Macro</h2>

            <div className="feedback-filters">
                <label htmlFor="statusFilter">Lọc theo trạng thái:</label>
                <select
                    id="statusFilter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">Tất cả</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="addressed">Đã xử lý</option>
                    <option value="rejected">Đã từ chối</option>
                </select>
            </div>


            <table className="feedback-table">
                <thead>
                    <tr>
                        <th>Tiêu đề Macro</th>
                        <th>Nội dung Góp ý</th>
                        <th>Người gửi</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredFeedback.map(feedback => (
                        <tr key={feedback._id}>
                            <td>
                                <Link
                                    to={`/admin/macros`}
                                    state={{ macroIdToEdit: feedback.macro }}
                                    className="macro-link"
                                    title="Chỉnh sửa macro này"
                                >
                                    {feedback.macroTitle}
                                </Link>
                            </td>
                            <td className="feedback-content">{feedback.content}</td>
                            <td>
                                {feedback.submittedBy?.fullName || feedback.submittedBy?.username || 'N/A'}
                                <br/>
                                <small>Lúc: {formatDateTime(feedback.createdAt)}</small>
                            </td>
                            <td>
                                <span className={`status-badge-feedback status-${feedback.status}`}>
                                    {feedback.status === 'pending' ? 'Chờ xử lý' : feedback.status === 'addressed' ? 'Đã xử lý' : 'Đã từ chối'}
                                </span>
                            </td>
                            <td className="feedback-actions">
                                {feedback.status === 'pending' && (
                                    <>
                                        <button className="action-btn save-btn" onClick={() => handleUpdateStatus(feedback._id, 'addressed')}>Đã xử lý</button>
                                        <button className="action-btn cancel-btn" onClick={() => handleUpdateStatus(feedback._id, 'rejected')}>Từ chối</button>
                                    </>
                                )}
                                {feedback.status !== 'pending' && (
                                     <button className="action-btn edit-btn" onClick={() => handleUpdateStatus(feedback._id, 'pending')}>Đặt lại</button>
                                )}
                                <button className="action-btn delete-btn" onClick={() => handleDeleteFeedback(feedback._id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                    {filteredFeedback.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center' }}>Không có góp ý nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ManageFeedbackPage;