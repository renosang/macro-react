import dbConnect from './_lib/db';
import Macro from './_models/Macro';

export default async function handler(req, res) {
  await dbConnect();
  
  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case 'GET':
      try {
        const macros = await Macro.find({});
        res.status(200).json(macros);
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const macro = await Macro.create(req.body);
        res.status(201).json(macro);
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'PUT':
      try {
        const macro = await Macro.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!macro) {
          return res.status(404).json({ success: false, message: 'Macro not found' });
        }
        res.status(200).json(macro);
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const deletedMacro = await Macro.deleteOne({ _id: id });
        if (!deletedMacro.deletedCount) {
          return res.status(404).json({ success: false, message: 'Macro not found' });
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