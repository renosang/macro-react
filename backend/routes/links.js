const express = require('express');
const Link = require('../models/Link');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// GET all links
router.get('/', protect, async (req, res) => {
  try {
    const links = await Link.find().sort({ team: 1, title: 1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new link (admin only)
router.post('/', protect, admin, async (req, res) => {
  const { team, title, url } = req.body;
  if (!team || !title || !url) {
    return res.status(400).json({ message: 'Team, title, and URL are required.' });
  }
  const newLink = new Link({ team, title, url });
  try {
    const savedLink = await newLink.save();
    res.status(201).json(savedLink);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT/UPDATE a link (admin only)
router.put('/:id', protect, admin, async (req, res) => {
    const { team, title, url } = req.body;
    try {
        const updatedLink = await Link.findByIdAndUpdate(req.params.id, { team, title, url }, { new: true });
        if (!updatedLink) return res.status(404).send('Link not found.');
        res.json(updatedLink);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// DELETE a link (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const link = await Link.findByIdAndDelete(req.params.id);
        if (!link) return res.status(404).send('Link not found.');
        res.status(200).send('Link has been deleted successfully.');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;