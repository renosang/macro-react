import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Descendant } from 'slate';
import { Announcement } from '../../types';
import RichTextEditor from '../components/RichTextEditor';
import ContentViewer from '../components/ContentViewer';
import './ManageAnnouncements.css';

interface Props {
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
}

const emptyContent: Descendant[] = [{ type: 'paragraph', children: [{ text: '' }] }];

function ManageAnnouncements({ announcements, setAnnouncements }: Props) {
  const [content, setContent] = useState<Descendant[]>(emptyContent);

  const handlePublish = async () => {
    const isEditorEmpty = content.length === 1 && 
      (content[0] as any).children.length === 1 && 
      (content[0] as any).children[0].text === '';
      
    if (isEditorEmpty) {
      toast.error('Nội dung thông báo không được để trống!');
      return;
    }

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Đăng thông báo thất bại');

      const newAnnouncement = await res.json();
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      setContent(emptyContent);
      toast.success('Đã đăng thông báo!');
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
        try {
            await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
            setAnnouncements(prev => prev.filter(ann => ann._id !== id));
            toast.success('Đã xóa thông báo.');
        } catch (error: any) {
            toast.error(`Lỗi: ${error.message}`);
        }
    }
  };

  return (
    <div className="manage-announcements">
      <h2>Tạo Thông báo Mới</h2>
      <div className="editor-wrapper">
        <RichTextEditor value={content} onChange={setContent} />
      </div>
      <button className="publish-btn" onClick={handlePublish}>Đăng Thông Báo</button>

      <h2 className="history-title">Lịch sử Thông báo</h2>
      <div className="history-list">
        {announcements.length > 0 ? (
          announcements.map(ann => (
            <div key={ann._id} className="history-item">
              <div className="history-item-content">
                <ContentViewer content={ann.content} />
              </div>
              <div className="history-item-meta">
                <span>Đã đăng: {new Date(ann.timestamp).toLocaleString('vi-VN')}</span>
                <button className="delete-btn" onClick={() => handleDelete(ann._id)}>Xóa</button>
              </div>
            </div>
          ))
        ) : (
          <p>Chưa có thông báo nào.</p>
        )}
      </div>
    </div>
  );
}

export default ManageAnnouncements;

