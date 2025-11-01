const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

const getIO = (req) => {
  return req.app.get('io');
};

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username displayName avatar')
      .populate('following', 'username displayName avatar');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's posts
router.get('/:id/posts', async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.id })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow user
router.post('/:id/follow', protect, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const alreadyFollowing = req.user.following.some(
      id => id.toString() === req.params.id
    );

    if (alreadyFollowing) {
      req.user.following = req.user.following.filter(
        id => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== req.user._id.toString()
      );
      await req.user.save();
      await userToFollow.save();

      // Delete notification
      await Notification.deleteOne({
        user: req.params.id,
        type: 'follow',
        fromUser: req.user._id
      });

      return res.json({ message: 'Unfollowed successfully' });
    }

    req.user.following.push(req.params.id);
    userToFollow.followers.push(req.user._id);
    await req.user.save();
    await userToFollow.save();

    // Create notification
    const notification = await Notification.create({
      user: req.params.id,
      type: 'follow',
      fromUser: req.user._id
    });

    // Emit socket notification
    const populatedNotification = await Notification.findById(notification._id)
      .populate('fromUser', 'username displayName avatar');
    
    const io = getIO(req);
    io.to(req.params.id).emit('notification', populatedNotification);

    res.json({ message: 'Followed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

