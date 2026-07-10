import express from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          otherUser: {
            $cond: [{ $eq: ['$sender', userId] }, '$receiver', '$sender'],
          },
        },
      },
      {
        $group: {
          _id: '$otherUser',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', userId] },
                    { $eq: ['$read', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          user: { _id: 1, username: 1, email: 1, avatar: 1, bio: 1 },
          lastMessage: {
            _id: 1,
            text: 1,
            image: 1,
            sender: 1,
            receiver: 1,
            read: 1,
            createdAt: 1,
          },
          unreadCount: 1,
        },
      },
    ]);

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      read: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    await Message.updateMany(
      { sender: userId, receiver: req.user.id, read: false },
      { read: true }
    );

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id },
      ],
    })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:userId/read', authMiddleware, async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, read: false },
      { read: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { receiver, text } = req.body;
    if (!receiver) return res.status(400).json({ error: 'Receiver required' });
    if (!text && !req.file) return res.status(400).json({ error: 'Message or image required' });

    const message = await Message.create({
      sender: req.user.id,
      receiver,
      text: text || '',
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
