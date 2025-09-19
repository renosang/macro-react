import dbConnect from './_lib/db';
import Category from './_models/Category';
import { withAdmin } from './_lib/auth'; // Giả sử bạn có middleware xác thực admin

const handler = async (req, res) => {
  await dbConnect();
  
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const categories = await Category.find({}).sort({ name: 'asc' });
        res.status(200).json(categories);
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case 'POST':
      try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    // Thêm các case cho PUT và DELETE tương tự
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default handler; // Tạm thời bỏ withAdmin để dễ test