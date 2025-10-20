import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link as LinkType } from '../../types';
import useAuthStore from '../../stores/useAuthStore';
import './ManageLinksPage.css';

function ManageLinksPage() {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [team, setTeam] = useState('A');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchLinks = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/links', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setLinks(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLinks();
  }, [token]);

  const handleAddLink = async () => {
    if (!team || !title || !url) {
      toast.error('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ team, title, url }),
      });
      if (!res.ok) throw new Error('Thêm liên kết thất bại.');
      const newLink = await res.json();
      setLinks([...links, newLink]);
      setTitle('');
      setUrl('');
      toast.success('Thêm liên kết thành công!');
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    }
  };
  
  const handleUpdateLink = async (id: string, updatedData: Partial<LinkType>) => {
    if (!token) return;
    try {
        const res = await fetch(`/api/links/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData),
        });
        if (!res.ok) throw new Error('Cập nhật thất bại.');
        const updatedLink = await res.json();
        setLinks(links.map(l => l._id === id ? updatedLink : l));
        setEditingLink(null); // Exit editing mode
        toast.success('Cập nhật thành công!');
    } catch (error: any) {
        toast.error(`Lỗi: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa liên kết này không?')) {
        if (!token) return;
        try {
            const res = await fetch(`/api/links/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Xóa thất bại.');
            setLinks(prev => prev.filter(l => l._id !== id));
            toast.success('Xóa liên kết thành công!');
        } catch (error: any) {
            toast.error(`Lỗi: ${error.message}`);
        }
    }
  };

  return (
    <div className="manage-links-container">
      <h2>Quản lý Liên kết</h2>
      <div className="add-link-form">
        <div className="form-group">
          <label>Team</label>
          <select value={team} onChange={e => setTeam(e.target.value)}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>
        <div className="form-group">
          <label>Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nhập tiêu đề..." />
        </div>
        <div className="form-group">
          <label>URL</label>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="Nhập đường dẫn..." />
        </div>
        <button className="add-link-btn" onClick={handleAddLink}>Thêm</button>
      </div>
      <table className="links-table">
        <thead>
          <tr>
            <th>Team</th>
            <th>Title</th>
            <th>URL</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {links.map(link => (
            <tr key={link._id}>
              <td>
                {editingLink?._id === link._id ? (
                  <select defaultValue={link.team} onChange={e => setEditingLink({...editingLink, team: e.target.value})}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                ) : (
                  link.team
                )}
              </td>
              <td>
                {editingLink?._id === link._id ? (
                  <input type="text" defaultValue={link.title} onChange={e => setEditingLink({...editingLink, title: e.target.value})} />
                ) : (
                  link.title
                )}
              </td>
              <td>
                {editingLink?._id === link._id ? (
                  <input type="text" defaultValue={link.url} onChange={e => setEditingLink({...editingLink, url: e.target.value})} />
                ) : (
                  <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                )}
              </td>
              <td>
                {editingLink?._id === link._id ? (
                  <>
                    <button className="action-btn save-btn" onClick={() => handleUpdateLink(link._id, editingLink)}>Lưu</button>
                    <button className="action-btn cancel-btn" onClick={() => setEditingLink(null)}>Hủy</button>
                  </>
                ) : (
                  <>
                    <button className="action-btn edit-btn" onClick={() => setEditingLink(link)}>Sửa</button>
                    <button className="action-btn delete-btn" onClick={() => handleDelete(link._id)}>Xóa</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageLinksPage;