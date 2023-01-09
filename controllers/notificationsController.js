const { default: mongoose, Types } = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');

const getAllNotifications = async (req, res) => {
  let notifications;

  try {
    // await Notification.updateMany({ receiver: id }, { read: true });
    notifications = await Notification.find({ receiver: req.id })
      .sort({ createdAt: -1 })
      .populate('receiver', 'username')
      .populate('sender', 'username')
      .populate('post', 'title')
      .populate({ path: 'comment', populate: 'body' });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: 'Failed to get notifications, please try again' });
  }

  res.status(200).json({
    notifications: notifications.map((notification) =>
      notification.toObject({ getters: true })
    ),
  });
};

const getUnreadNotifications = async (req, res) => {
  let unreadNotifications;

  try {
    unreadNotifications = await Notification.find({
      receiver: req.id,
      read: false,
    })
      .sort({ createdAt: -1 })
      .populate('receiver', 'username')
      .populate('sender', 'username')
      .populate('post', 'title')
      .populate({ path: 'comment', populate: 'body' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Failed to fetch unread notifications' });
  }

  res.status(200).json({
    unreadNotifications: unreadNotifications.map((unreadNotification) =>
      unreadNotification.toObject({ getters: true })
    ),
  });
};

const likeNotification = async (senderId, postId, receiverId) => {
  try {
    if (senderId !== receiverId) {
      const createLikeNotification = new Notification({
        type: 'like',
        sender: senderId,
        receiver: receiverId,
        post: postId,
      });
      await createLikeNotification.save();
      return;
    }
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: 'Could not create like notification' });
  }
};

const removeLikeNotification = async (senderId, postId, receiverId) => {
  try {
    await Notification.findOneAndDelete({
      type: 'like',
      sender: senderId,
      receiver: receiverId,
      post: postId,
    });
    return;
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: 'Could not remove like notification' });
  }
};

const commentNotification = async (senderId, postId, commentId, receiverId) => {
  if (senderId !== receiverId)
    await Notification.create({
      type: 'comment',
      sender: senderId,
      receiver: receiverId,
      post: postId,
      comment: commentId,
    });
};

const removeCommentNotification = async (
  senderId,
  postId,
  commentId,
  receiverId
) => {
  console.log('Del: ', senderId);
  await Notification.findOneAndDelete({
    type: 'comment',
    sender: senderId,
    receiver: receiverId,
    post: postId,
    comment: commentId,
  });
};

const followNotification = async (senderId, receiverId) => {
  await Notification.create({
    type: 'follow',
    sender: senderId,
    receiver: receiverId,
  });
};

const removeFollowNotification = async (senderId, receiverId) => {
  await Notification.findOneAndDelete({
    type: 'follow',
    sender: senderId,
    receiver: receiverId,
  });
};
const postNotification = async (senderId, postId, receiverId) => {
  await Notification.create({
    type: 'post',
    sender: senderId,
    post: postId,
    receiver: receiverId,
  });
};

const removePostNotification = async (senderId, postId, receiverId) => {
  await Notification.findOneAndDelete({
    type: 'post',
    sender: senderId,
    post: postId,
    receiver: receiverId,
  });
};

const commentLikeNotification = async (senderId, commentId, receiverId) => {
  if (senderId !== receiverId) {
    await Notification.create({
      type: 'like',
      sender: senderId,
      receiver: receiverId,
      comment: commentId,
    });
  }
};

const removeCommentLikeNotification = async (
  senderId,
  commentId,
  receiverId
) => {
  await Notification.findOneAndDelete({
    type: 'like',
    sender: senderId,
    comment: commentId,
    receiver: receiverId,
  });
};

module.exports = {
  commentLikeNotification,
  removeCommentLikeNotification,
  getAllNotifications,
  getUnreadNotifications,
  likeNotification,
  removeLikeNotification,
  commentNotification,
  removeCommentNotification,
  followNotification,
  removeFollowNotification,
  postNotification,
  removePostNotification,
};
