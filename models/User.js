const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, select: false, required: true },
    password: { type: String, select: false, required: true },
    picture: {
      url: String,
      publicId: String,
    },
    website: { type: String, default: '' },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
    learning: { type: String, default: '' },
    skills: { type: String, default: '' },
    workingOn: { type: String, default: '' },
    availableFor: { type: String, default: '' },
    workingAt: { type: String, default: '' },
    education: { type: String, default: '' },
    posts: [{ type: mongoose.Types.ObjectId, ref: 'Post' }],
    comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
    followedTags: [{ type: mongoose.Types.ObjectId, ref: 'Tag' }],
    followers: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Types.ObjectId, ref: 'Post' }],
    refreshToken: { type: String, select: false, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('User', UserSchema);
