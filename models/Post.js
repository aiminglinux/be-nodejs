const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    body: { type: String, required: true },
    slug: { type: String, slug: 'title', unique: true },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    unicorns: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    tags: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Tag' }],
    comments: [
      { type: mongoose.Types.ObjectId, required: true, ref: 'Comment' },
    ],
    author: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Post', PostSchema);
