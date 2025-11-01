const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

const getIO = (req) => {
  return req.app.get('io');
};

// Get newsfeed (posts from followed users)
router.get('/feed', protect, async (req, res) => {
  try {
    const posts = await Post.find({
      author: { $in: req.user.following }
    })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create post
router.post('/', protect, async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content && !image) {
      return res.status(400).json({ error: 'Post must have content or image' });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content || '',
      image: image || ''
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username displayName avatar');

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like post
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const alreadyLiked = post.likes.some(
      like => like.user.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
      await post.save();

      // Delete notification
      await Notification.deleteOne({
        user: post.author,
        type: 'like',
        fromUser: req.user._id,
        post: post._id
      });

      return res.json({ message: 'Post unliked', post });
    }

    post.likes.push({ user: req.user._id });
    await post.save();

    // Create notification (if not own post)
    if (post.author.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        user: post.author,
        type: 'like',
        fromUser: req.user._id,
        post: post._id
      });

      // Emit socket notification
      const populatedNotification = await Notification.findById(notification._id)
        .populate('fromUser', 'username displayName avatar');
      
      const io = getIO(req);
      io.to(post.author.toString()).emit('notification', populatedNotification);
    }

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username displayName avatar');

    res.json({ message: 'Post liked', post: populatedPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comment on post
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      content
    });
    await post.save();

    // Create notification (if not own post)
    if (post.author.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        user: post.author,
        type: 'comment',
        fromUser: req.user._id,
        post: post._id
      });

      // Emit socket notification
      const populatedNotification = await Notification.findById(notification._id)
        .populate('fromUser', 'username displayName avatar');
      
      const io = getIO(req);
      io.to(post.author.toString()).emit('notification', populatedNotification);
    }

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username displayName avatar')
      .populate('comments.user', 'username displayName avatar');

    res.json(populatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

