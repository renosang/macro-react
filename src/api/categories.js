import dbConnect from './_lib/db';
import Category from './_models/Category';

export default async function handler(req, res) {
  await dbConnect();
  
  const { method } = req;
  const { id } = req.query; // Lấy id từ URL, ví dụ: /api/categories?id=...

  switch (method) {
    case 'GET':
      try {
        const categories = await Category.find({}).sort({ name: 'asc' });
        res.status(200).json(categories);
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const category = await Category.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!category) {
          return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json(category);
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const deletedCategory = await Category.deleteOne({ _id: id });
        if (!deletedCategory.deletedCount) {
          return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
};