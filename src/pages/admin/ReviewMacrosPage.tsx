import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Macro } from '../../types';
import ContentViewer from '../components/ContentViewer';
import './ReviewMacrosPage.css';

function ReviewMacrosPage() {
  const [pendingMacros, setPendingMacros] = useState<Macro[]>([]);

  const fetchPendingMacros = () => {
    fetch('/api/macros/pending')
      .then(res => res.json())
      .then(data => setPendingMacros(data))
      .catch(err => console.error("Lỗi khi tải macro chờ duyệt:", err));
  };

  useEffect(() => {
    fetchPendingMacros();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/macros/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) throw new Error('Duyệt macro thất bại.');
      
      toast.success('Đã duyệt macro!');
      fetchPendingMacros(); // Tải lại danh sách
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReject = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối (xóa) macro này?')) {
        try {
            const res = await fetch(`/api/macros/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Xóa macro thất bại.');
            
            toast.success('Đã từ chối macro.');
            fetchPendingMacros(); // Tải lại danh sách
        } catch (error: any) {
            toast.error(error.message);
        }
    }
  };

  return (
    <div className="review-macros">
      <h2>Kiểm duyệt Macro đóng góp</h2>
      {pendingMacros.length === 0 ? (
        <p>Không có macro nào đang chờ duyệt.</p>
      ) : (
        <div className="pending-list">
          {pendingMacros.map(macro => (
            <div key={macro._id} className="pending-item">
              <div className="pending-item-header">
                <h3>{macro.title}</h3>
                <span>Người đóng góp: <strong>{macro.submittedBy || 'N/A'}</strong></span>
              </div>
              <div className="pending-item-content">
                <ContentViewer content={macro.content} />
              </div>
              <div className="pending-item-actions">
                <button className="reject-btn" onClick={() => handleReject(macro._id)}>Từ chối</button>
                <button className="approve-btn" onClick={() => handleApprove(macro._id)}>Duyệt</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewMacrosPage;
