import React, { useState, useEffect } from 'react';
import { Descendant, Element as SlateElement, Text } from 'slate';
import useAuthStore from '../../stores/useAuthStore';
import useDataStore from '../../stores/useDataStore';
import RichTextEditor from '../components/RichTextEditor';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './ContributePage.css';

const initialEditorValue: Descendant[] = [
    { type: 'paragraph', children: [{ text: '' }] }
];

const ContributePage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState<Descendant[]>(initialEditorValue);
    const [category, setCategory] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false); // Thêm state loading

    const token = useAuthStore((state) => state.token);
    const { categories, fetchCategories } = useDataStore((state) => ({
        categories: state.categories,
        fetchCategories: state.fetchCategories,
    }));
    const navigate = useNavigate(); // Khởi tạo useNavigate

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
            return Text.isText(firstChild) && firstChild.text.trim() === ''; // Thêm .trim()
        }
        return false;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true); // Bắt đầu loading

        // Kiểm tra token trước khi gửi request
        if (!token) {
            setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để đóng góp.");
            setLoading(false);
            navigate('/login'); // Chuyển hướng người dùng đến trang đăng nhập
            return;
        }

        if (!title.trim() || !description.trim() || isEditorEmpty(content) || !category) { // Thêm .trim()
            setError('Vui lòng điền đầy đủ các trường.');
            setLoading(false);
            return;
        }

        try {
            // Sử dụng biến môi trường cho URL API để dễ quản lý giữa các môi trường dev/prod
            // Ví dụ: const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
            // Dòng này cần được định nghĩa ở đâu đó trong config của ứng dụng
            // Hiện tại, tôi sẽ giữ nguyên URL bạn đã cung cấp cho backend Vercel.
            const response = await fetch('https://macro-react-xi.vercel.app/api/macros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    // Giữ nguyên JSON.stringify(content) nếu backend của bạn mong đợi string JSON
                    // Nếu backend mong đợi object, hãy gửi thẳng content
                    content: JSON.stringify(content),
                    category,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Xử lý lỗi 401 cụ thể hơn
                if (response.status === 401) {
                    setError(data.message || 'Xác thực thất bại. Vui lòng đăng nhập lại.');
                    // Tùy chọn: Xóa token cũ và chuyển hướng về trang đăng nhập
                    // useAuthStore.getState().logout(); // Nếu bạn có hàm logout
                    navigate('/login');
                } else {
                    throw new Error(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
                }
            } else {
                setSuccess('Đóng góp của bạn đã được gửi để xét duyệt. Cảm ơn bạn!');
                setTitle('');
                setDescription('');
                setContent(initialEditorValue);
                setCategory('');
                // Tùy chọn: Sau khi thành công, có thể chuyển hướng người dùng
                // navigate('/dashboard');
            }

        } catch (err: any) {
            console.error("Error submitting macro:", err); // Log lỗi chi tiết hơn
            setError(err.message || 'Đã xảy ra lỗi không mong muốn.');
        } finally {
            setLoading(false); // Kết thúc loading
        }
    };

    return (
        <div className="contribute-page">
            <h2>Đóng góp Macro</h2>
            <p>Chia sẻ kiến thức của bạn với cộng đồng. Macro của bạn sẽ được quản trị viên xem xét trước khi được duyệt.</p>
            <form onSubmit={handleSubmit} className="contribute-form">
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <div className="form-group">
                    <label htmlFor="title">Tiêu đề Macro</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ví dụ: Cách tạo chữ ký email chuyên nghiệp"
                        disabled={loading} // Vô hiệu hóa input khi đang gửi
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
                    <RichTextEditor value={content} onChange={setContent} /> {/* readOnly khi loading */}
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Đang gửi...' : 'Gửi đi'}
                </button>
            </form>
        </div>
    );
};

export default ContributePage;