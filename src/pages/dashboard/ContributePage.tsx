import React, { useState, useEffect } from 'react';
import { Descendant, Element as SlateElement, Text } from 'slate';
import useAuthStore from '../../stores/useAuthStore';
import useDataStore from '../../stores/useDataStore';
import RichTextEditor from '../components/RichTextEditor';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './ContributePage.css';

const initialEditorValue: Descendant[] = [
    { type: 'paragraph', children: [{ text: '' }] }
];

const ContributePage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState<Descendant[]>(initialEditorValue);
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);

    const token = useAuthStore((state) => state.token);
    const { categories, fetchCategories } = useDataStore((state) => ({
        categories: state.categories,
        fetchCategories: state.fetchCategories,
    }));
    const navigate = useNavigate();

    useEffect(() => {
        if (fetchCategories) {
            fetchCategories();
        }
    }, [fetchCategories]);

    const isEditorEmpty = (value: Descendant[]) => {
        const firstNode = value[0];
        if (
            value.length === 1 &&
            SlateElement.isElement(firstNode) &&
            firstNode.children.length === 1
        ) {
            const firstChild = firstNode.children[0];
            return Text.isText(firstChild) && firstChild.text.trim() === '';
        }
        return false;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!token) {
            toast.error("Bạn chưa đăng nhập. Vui lòng đăng nhập để đóng góp.");
            setLoading(false);
            navigate('/login');
            return;
        }

        if (!title.trim() || isEditorEmpty(content) || !category) {
            toast.error('Vui lòng điền đầy đủ các trường.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('https://macro-react-xi.vercel.app/api/macros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    content: JSON.stringify(content),
                    category,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                 if (response.status === 401) {
                    toast.error(data.message || 'Xác thực thất bại. Vui lòng đăng nhập lại.');
                    navigate('/login');
                } else {
                    throw new Error(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
                }
            } else {
                toast.success('Đóng góp của bạn đã được gửi để xét duyệt. Cảm ơn bạn!');
                setTitle('');
                setContent(initialEditorValue);
                setCategory('');
            }

        } catch (err: any) {
            console.error("Error submitting macro:", err);
            toast.error(err.message || 'Đã xảy ra lỗi không mong muốn.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contribute-page">
            <div className="contribute-container">
                <header className="contribute-header">
                    <h2>Đóng góp Macro</h2>
                    <p>Chia sẻ kiến thức của bạn với cộng đồng. Macro của bạn sẽ được quản trị viên xem xét trước khi được duyệt.</p>
                </header>
                <form onSubmit={handleSubmit} className="contribute-form">
                    <div className="form-group">
                        <label htmlFor="title">Tiêu đề Macro</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ví dụ: Cách tạo chữ ký email chuyên nghiệp"
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">Chuyên mục</label>
                        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} disabled={loading}>
                            <option value="">-- Chọn chuyên mục --</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Nội dung chi tiết</label>
                        <div className="editor-wrapper">
                            <RichTextEditor
                                value={content}
                                onChange={setContent}
                            />
                        </div>
                    </div>
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Đang gửi...' : 'Gửi đi'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContributePage;