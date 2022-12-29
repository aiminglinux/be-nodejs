const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    body: { type: String, required: true },
    postId: { type: mongoose.Types.ObjectId, ref: 'Post', required: true },
    rootComment: {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    author: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    replies: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', CommentSchema);
