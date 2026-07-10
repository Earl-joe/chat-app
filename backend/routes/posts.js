import express from 'express';
import Post from '../models/Post.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username avatar bio')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'username avatar bio')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim() && !req.file) {
      return res.status(400).json({ error: 'Text or image required' });
    }

    const post = await Post.create({
      author: req.user.id,
      text: text?.trim() || '',
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });

    const populated = await Post.findById(post._id).populate(
      'author',
      'username avatar bio'
    );
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
