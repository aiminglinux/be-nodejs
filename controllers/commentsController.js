const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { unCapitalizeFirstLetter } = require('../helpers/string');
const {
  commentNotification,
  removeCommentNotification,
  commentLikeNotification,
  removeCommentLikeNotification,
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
    parentPost: postId,
    body: req.body.text,
    author: req.id,
  };

  if (commentId) {
    data.parentComment = commentId;
  }

  // return console.log('Data: ', data);

  try {
    [post, user, existedComment] = await Promise.all([
      Post.findById(postId).populate('author'),
      User.findById(req.id),
      Comment.findById(commentId),
    ]);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Failed to create comment' });
  }

  if (!post || !user) return res.status(204).json();

  if (existedComment?.parentComment) {
    data.parents = [...existedComment.parents, commentId];
  }

  let newComment = new Comment(data);

  post.comments.push(newComment._id);
  user.comments.push(newComment._id);

  try {
    await Promise.all([
      user.save(),
      post.save({ timestamps: false }),
      newComment.save(),
    ]);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Could not create comment' });
  }

  commentNotification(req.id, postId, newComment.id, post.author.id);

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
      .populate('parentPost')
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

  // console.log('Before del comment: ', comment.postId.comments);

  comment.parentPost.comments.pull(comment.id);
  comment.author.comments.pull(comment.id);

  // console.log('After del comment: ', comment.postId.comments);

  let replies;

  try {
    replies = await Comment.find({ parents: comment.id })
      .populate('author')
      .exec();
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ message: 'Failed to delete replies on this comment' });
  }

  if (replies) {
    replies.forEach((reply) => {
      reply.author.comments.pull(reply.id);
      comment.parentPost.comments.pull(reply.id);
      async () =>
        Promise.all([
          reply.author.save(),
          removeCommentNotification(
            reply.author.id,
            comment.parentPost.id,
            reply.id,
            comment.parentPost.author.toString()
          ),
        ]);
    });
    await Comment.deleteMany({ parents: comment.id });
  }
  try {
    await Promise.all([
      comment.parentPost.save(),
      comment.author.save(),
      Comment.deleteOne({ _id: comment.id }),
      removeCommentNotification(
        comment.author.id,
        comment.parentPost.id,
        comment.id,
        comment.parentPost.author.toString()
      ),
    ]);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Failed to delete comment' });
  }

  res.status(200).json({ message: 'Comment deleted' });
};

const commentReaction = async (req, res) => {
  const id = req.id;
  const { commentId } = req.params;

  if (!mongoose.isValidObjectId(commentId))
    return res.status(400).json({ message: 'A valid comment ID is required' });

  let comment;

  try {
    comment = await Comment.findById(commentId).populate('author');
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: 'Could not update comment reaction' });
  }

  if (!comment) return res.status(204).json();

  const isLiked = comment.likes.includes(id);

  const updatedComment = await Comment.findOneAndUpdate(
    { _id: commentId },
    isLiked ? { $pull: { likes: id } } : { $addToSet: { likes: id } },
    { new: true }
  );
  isLiked
    ? await removeCommentLikeNotification(id, commentId, comment.author.id)
    : await commentLikeNotification(id, commentId, comment.author.id);
  res.status(200).json(updatedComment?.toObject({ getters: true }));
};

module.exports = {
  getCommentByCommentId,
  createComment,
  updateComment,
  deleteComment,
  commentReaction,
};
