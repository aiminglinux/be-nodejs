const { default: mongoose } = require('mongoose');
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
  if (senderId !== receiverId)
    await Notification.create({
      type: 'like',
      sender: senderId,
      receiver: receiverId,
      post: postId,
    });
};

const removeLikeNotification = async (senderId, postId, receiverId) => {
  await Notification.findOneAndDelete({
    type: 'like',
    sender: senderId,
    receiver: receiverId,
    post: postId,
  });
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

module.exports = {
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
