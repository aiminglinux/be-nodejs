const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Populate = require('../utils/autopopulate');

const CommentSchema = new Schema(
  {
    body: { type: String, required: true },
    parentPost: { type: mongoose.Types.ObjectId, ref: 'Post', required: true },
    parentComment: {
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

CommentSchema.pre('find', Populate('replies'))
  .pre('findOne', Populate('replies'))
  .pre('findOne', Populate('author'))
  .pre('find', Populate('author'));

module.exports = mongoose.model('Comment', CommentSchema);
