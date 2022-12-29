const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { unCapitalizeFirstLetter } = require('../helpers/string');
const {
  commentNotification,
  removeCommentNotification,
} = require('./notificationsController');
const { default: mongoose } = require('mongoose');

// @desc: Get Comment by ID
// @route: GET /comments/:id
// @access: public

const getCommentByCommentId = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: 'A valid Comment ID required' });

  let comment;

  try {
    comment = await Comment.findById(id).exec();
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Could not fetch post' });
  }

  if (!comment) return res.status(204).json();

  res.status(200).json({ comment: comment.toObject({ getters: true }) });
};

// @desc: create Comment by ID
// @route: POST /comments/:postId
// @access: private

const createComment = async (req, res) => {
  const { postId, commentId } = req.params;

  console.log(req.params);

  if (
    !mongoose.isValidObjectId(postId) ||
    (commentId && !mongoose.isValidObjectId(commentId))
  )
    return res.status(400).json({ message: 'Invalid provided ID' });

  let post, user, existedComment;

  let data = {
    postId,
    body: req.body.text,
    author: req.id,
  };

  if (commentId) {
    data.rootComment = commentId;
    existedComment = await Comment.findById(commentId);
  }

  // return console.log('Data: ', data);

  try {
    [post, user] = await Promise.all([
      Post.findById(postId),
      User.findById(req.id),
    ]);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Failed to create comment' });
  }

  if (!post || !user) return res.status(204).json();

  let newComment = new Comment(data);

  post.comments.push(newComment._id);
  user.comments.push(newComment._id);

  if (existedComment?.rootComment) {
    existedComment.replies.push(newComment);
  }

  try {
    await Promise.all([
      user.save(),
      post.save({ timestamps: false }),
      existedComment?.save(),
      newComment.save(),
    ]);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Could not create comment' });
  }

  commentNotification(req.id, postId, newComment._id, post.author.toString());

  res.status(200).json(newComment.toObject({ getters: true }));
};

// @desc: Modify Comment by ID
// @route: PATCH /comments/:id
// @access: private

const updateComment = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: 'A valid Comment ID required' });

  const { body } = req.body;

  let comment;

  try {
    comment = await Comment.findById(id).exec();
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Could not update comment' });
  }

  if (!comment)
    res.stutus(404).json({ message: 'Comment either deleted or not found' });

  if (comment.author.toString() !== req.id)
    return res
      .status(401)
      .json({ message: 'You do not have permission to modify this comment' });

  comment.body = body;

  try {
    await comment.save();
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Failed to update comment' });
  }

  res.status(200).json({ message: 'Comment updated' });
};

// @desc: Delete Comment by ID
// @route: DELETE /comments/:id
// @access: private

const deleteComment = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: 'An valid Comment ID is required' });

  let comment;

  try {
    comment = await Comment.findById(id)
      .populate('author')
      .populate('postId')
      .exec();
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Could not delete comment' });
  }

  if (!comment) return res.status(204).json();

  if (comment.author.id !== req.id)
    return res
      .status(401)
      .json({ message: 'You are not authorized to delete this comment' });

  // comment.postId.comments.pull(comment.id);
  // comment.author.comments.pull(comment.id);

  let replies;

  try {
    replies = await Comment.find({ rootComment: comment.id }).exec();
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: 'Failed to delete replies on this comment' });
  }

  if (replies) {
    return console.log(replies);
    // replies.forEach((reply) => {
    //   console.log(reply.id);
    //   comment.parentPost.comments.pull(reply.id);
    //   comment.author.comments.pull(reply.id);
    //   async () => await Comment.deleteMany({ parentComment: comment.id });
    // });
  }
  return;
  try {
    await Promise.all([
      comment.postId.save(),
      comment.author.save(),
      Comment.deleteOne({ id: comment.id }),
    ]);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Failed to delete comment' });
  }

  res.status(200).json({ message: 'Comment deleted' });
  // const comment = await Comment.findByIdAndDelete(commentIdToDelete);

  // const post = await Post.findById(comment.parentPost).exec();
  // post.comments.pull(commentIdToDelete);

  // const user = await User.findById(comment.author).exec();
  // user.comments.pull(commentIdToDelete);

  // const replies = await Comment.find({ parentComment: comment._id });

  // if (replies) {
  //   replies.forEach((reply) => {
  //     (async () => {
  //       post.comments.pull(reply._id);

  //       const user = await User.findById(reply.author).exec();
  //       user.comments.pull(reply._id);
  //     })();
  //   });
  //   await Comment.deleteMany({ parentComment: comment._id });
  // }

  // await post.save({ timestamps: false });
  // await user.save();

  // await removeCommentNotification(
  //   comment.author,
  //   comment.parentPost,
  //   comment._id,
  //   post.author
  // );

  // res.status(200).json(comment.toObject({ getters: true }));
};

const commentReaction = async (req, res) => {
  const { userId } = req.body;
  const { commentId, action } = req.params;
  const isUndoing = action.includes('remove');
  const actionKey = isUndoing
    ? unCapitalizeFirstLetter(action.replace('remove', '')) + 's'
    : action + 's';

  const updatedComment = await Comment.findOneAndUpdate(
    { _id: commentId },
    isUndoing
      ? { $pull: { [actionKey]: userId } }
      : { $addToSet: { [actionKey]: userId } },
    { new: true }
  );

  res.status(200).json(updatedComment?.toObject({ getters: true }));
};

module.exports = {
  getCommentByCommentId,
  createComment,
  updateComment,
  deleteComment,
  commentReaction,
};
