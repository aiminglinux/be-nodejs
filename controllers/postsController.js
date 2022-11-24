const Post = require('../models/Post');
const User = require('../models/User');
const Tag = require('../models/Tag');
const Comment = require('../models/Comment');
const slugtify = require('slugify');

const cloudinary = require('../configs/cloudinary');
const { uploadToCloudinary } = require('../utils/cloudinary');

const { unCapitalizeFirstLetter, getPostParams } = require('../helpers/string');

const { createTags, updateTags, deleteTags } = require('./tagsController');
const {
  likeNotification,
  removeLikeNotification,
  postNotification,
  removePostNotification,
} = require('./notificationsController');

const createPost = async (req, res) => {
  const { title, file, body, tags, authorUsername } = req.body;

  const { url, public_id: publicId } = await uploadToCloudinary(file, 'posts');
  const author = await User.findOne({ username: authorUsername }).exec();

  const formattedTags = tags
    .trim()
    .split(',')
    .map((w) => w.trim().replace(/ /g, '-'));

  const createdPost = await Post.create({
    title,
    image: { url, publicId },
    body,
    author: author._id,
    // slug,
  });

  author.followers.map((followerId) => {
    (async () => {
      await postNotification(author._id, createdPost._id, followerId);
    })();
  });

  await createTags(formattedTags, createdPost);

  author.posts.push(createdPost._id);

  await author.save();

  res.status(200).json(createdPost.toObject({ getters: true }));
};

const getPost = async (req, res) => {
  const { username, postSlug } = req.params;

  const author = await User.findOne({ username }).exec();
  const authorId = await author?.toObject({ getters: true }).id;

  const foundPost = await Post.findOne({
    author: authorId,
    slug: postSlug,
  })
    .populate('author')
    .populate('comments')
    .populate('tags')
    .exec();

  if (!foundPost) return res.status(404).json({ message: 'No post found' });
  res.status(200).json(foundPost.toObject({ getters: true }));
};

const getPosts = async (req, res) => {
  const { userId } = req.params;
  // const { _id: id } = await User.findOne({ username: userId }).exec();

  const posts = await Post.find(userId ? { bookmarks: userId } : {})
    .sort({ createdAt: -1 })
    .populate('author')
    .populate('tags');
  // console.log(posts);
  if (!posts) res.status(204).json('No posts found');

  res.status(200).json(posts.map((post) => post.toObject({ getters: true })));
};

const updatePost = async (req, res) => {
  const { username, postSlug } = req.params;
  // console.log(req.body);

  const authorId = await User.findOne({ username }).exec();

  const post = await Post.findOne({
    author: authorId,
    slug: postSlug,
  })
    .populate('author')
    .populate('tags');

  if (!post) res.status(204).json({ message: 'Post not found on DB' });

  if (req.body.file) {
    const { url, public_id: publicId } = await uploadToCloudinary(
      req.body.file,
      'posts'
    );
    await cloudinary.uploader.destroy(req.body.image.publicId);
    req.body.image = { url, publicId };
  }

  const formattedTags = req.body.tags
    .trim()
    .split(',')
    .map((w) => w.trim().replace(/ /g, '-'));

  Object.keys(req.body).map((key) => {
    if (key !== 'tags') post[key] = req.body[key];
  });

  await updateTags(formattedTags, post);

  await post.save();

  res.status(200).json({ message: 'Post updated successful' });
};

const deletePostsByUserId = async (user) => {
  const { _id: userId } = user;

  user.comments.forEach((commentId) => {
    (async () => {
      await Post.updateMany(
        { comments: commentId },
        { $pull: { comments: commentId } }
      );
    })();
  });

  const posts = await Post.find({ author: userId }).populate('tags');

  ['likes', 'unicorns', 'bookmarks'].forEach((k) => {
    (async () => {
      await Post.updateMany({ [k]: userId }, { $pull: { [k]: userId } });
    })();
  });

  posts.forEach((post) => {
    (async () => {
      await deleteTags(
        post.tags.map(({ name }) => name),
        post,
        true
      );
      await cloudinary.uploader.destroy(post.image.publicId);
      await Post.deleteOne({ _id: post._id });
    })();
  });

  await Comment.deleteMany({ author: userId });
};

const deletePost = async (req, res) => {
  const { username, postSlug } = req.params;
  const author = await User.findOne({ username }).exec();
  // const { postTitle, postId } = getPostParams(req.params.postUrl);

  const foundPost = await Post.findOne({
    author: author._id,
    slug: postSlug,
  })
    .populate('tags')
    .exec();
  console.log(foundPost);

  if (!foundPost) return res.status(204).json({ message: 'Post not found' });
  await cloudinary.uploader.destroy(foundPost.image.publicId);

  // const comments = await Comment.find({ parentPost: postId }).populate({
  //   path: 'author',
  //   populate: 'followers',
  // });

  // comments.forEach(({ author }) =>
  //   (async () => {
  //     author.comments.forEach((comment) => author.comments.pull(comment));
  //   })()
  // );
  // author.posts.pull(postId);
  // await author.save();

  // await Comment.deleteMany({ parentPost: postId });

  // await deleteTags(
  //   foundPost.tags.map(({ name }) => name),
  //   foundPost,
  //   true
  // );

  // removePostNotification(author._id, foundPost._id, author.followers);

  await Post.deleteOne({ _id: foundPost._id });

  res.status(200).json({ message: 'Post deleted' });
};

const postReaction = async (req, res) => {
  const { userId } = req.body;
  const { action, postUrl } = req.params;
  const { postTitle, postId } = getPostParams(postUrl);
  const isUndoing = action.includes('remove');
  const actionKey = isUndoing
    ? unCapitalizeFirstLetter(action.replace('remove', '')) + 's'
    : action + 's';

  const author = await User.findOne({ username: req.params.username }).exec();
  const authorId = await author.toObject({ getters: true }).id;

  const updatedPost = await Post.findOneAndUpdate(
    { author: authorId, title: postTitle, _id: postId },
    isUndoing
      ? { $pull: { [actionKey]: userId } }
      : { $addToSet: { [actionKey]: userId } },
    { new: true, timestamps: false }
  );

  if (isUndoing)
    await removeLikeNotification(userId, updatedPost._id, authorId);
  else await likeNotification(userId, updatedPost._id, authorId);

  res.status(200).json(updatedPost.toObject({ getters: true }));
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  deletePostsByUserId,
  postReaction,
};
