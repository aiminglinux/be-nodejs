const Post = require('../models/Post');
const User = require('../models/User');
const Tag = require('../models/Tag');
const Comment = require('../models/Comment');

const cloudinary = require('../configs/cloudinary');
const { uploadToCloudinary } = require('../utils/cloudinary');

const { createTags, updateTags, deleteTags } = require('./tagsController');
const {
  likeNotification,
  removeLikeNotification,
  postNotification,
  removePostNotification,
} = require('./notificationsController');
const { default: mongoose, Mongoose } = require('mongoose');

// @desc Get all posts
// @route GET /posts
// @access Public

const getAllPosts = async (req, res) => {
  let posts;
  try {
    posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author')
      .populate('tags');
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message:
        'Internal server error - Could not fetch posts, please try again',
    });
  }
  if (!posts?.length === 0)
    return res.status(400).json({ message: 'Posts data is empty' });
  res
    .status(200)
    .json({ posts: posts.map((post) => post.toObject({ getters: true })) });
};

// @desc Get single post by postId
// @route GET /posts/:postId
// @access Public

const getPostById = async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId))
    return res.status(400).json({ message: 'Invalid post ID' });

  let post;

  try {
    post = await Post.findById(postId)
      .populate('author')
      .populate('comments')
      .populate('tags');
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: 'Internal server error - Could not fetch post, please try again',
    });
  }

  if (!post) return res.status(204);

  res.status(200).json({ post: post.toObject({ getters: true }) });
};

// @desc Get all posts by user ID
// @route /user/:userId
// @access Public

const getPostsByUserId = async (req, res) => {
  const { userId } = req.params;
  let posts;

  try {
    posts = await Post.find({ author: userId }).populate('author').exec();
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Fetch posts failed, please try again' });
  }

  if (!posts || posts.length === 0) return res.status(204);

  res
    .status(200)
    .json({ posts: posts.map((post) => post.toObject({ getters: true })) });
};

// @desc Create post
// @route POST /posts
// @access Private

const createPost = async (req, res) => {
  const { title, file, body, tags, author } = req.body;

  if (!Mongoose.Types.ObjectId(author))
    return res.status(400).json({ message: `Invalid ID for author ${author}` });

  const { url, public_id: publicId } = await uploadToCloudinary(file, 'posts');

  const createdPost = await Post.create({
    title,
    image: { url, publicId },
    body,
    author: author._id,
  });

  await createTags(JSON.parse(tags), createdPost);

  let user;

  try {
    user = await User.findById(author).exec();
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: 'Internal server error: Could not create new post' });
  }

  if (!user)
    return res
      .status(404)
      .json({ message: 'Could not found user for requested author' });

  if (user.followers.length > 0) {
    user.followers.map((follower) => {
      async () => {
        await postNotification(user._id, createdPost._id, follower);
      };
    });
  }

  user.posts.push(createdPost);

  try {
    await Promise.all([createdPost.save(), user.save()]);
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: 'Failed to save new post, please try again' });
  }
  res.status(201).json(createdPost.toObject({ getters: true }));
};

// @desc Update post
// @route PATCH /posts/:postId
// @access Private

const updatePost = async (req, res) => {
  const { postId } = req.params;

  if (!Mongoose.Types.ObjectId(postId))
    return res.status(400).json({ message: 'Invalid post ID' });

  let post;

  try {
    post = await Post.findById(postId).populate('author').populate('tags');
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: `Could not update post with ID: ${postId}` });
  }

  if (!post) res.status(204).json({ message: 'Post could not be found' });

  if (post.author.toString() !== req.body.author)
    return res
      .status(401)
      .json({ message: 'You do not have permission to perform this action' });

  if (req.body.file) {
    const { url, public_id: publicId } = await uploadToCloudinary(
      req.body.file,
      'posts'
    );
    await cloudinary.uploader.destroy(req.body.image.publicId);
    req.body.image = { url, publicId };
  }

  Object.keys(req.body).map((key) => {
    if (key !== 'tags') post[key] = req.body[key];
  });

  try {
    await Promise.all([
      updateTags(JSON.parse(req.body.tags), post),
      post.save(),
    ]);
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: 'Failed to update post, please try again' });
  }

  res.status(200).json({
    post: post.toObject({ getters: true }),
  });
};

// @desc Delete user data
// @route DELETE /users/:userId
// @access Private

const deleteUserData = async (user) => {
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

// @desc Delete post
// @route DELETE /posts/:postId
// @access Private

const deletePost = async (req, res) => {
  const { postId } = req.params;

  if (!Mongoose.Types.ObjectId(postId))
    return res.status(400).json({ message: `Invalid ID for ${postId}` });

  let post;

  try {
    post = await Post.findById(postId)
      .populate('tags')
      .populate('author')
      .exec();
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: 'Could not delete requested post, please try again' });
  }

  if (!post) return res.status(204);

  if (post.author.id !== req.body.author)
    return res
      .status(401)
      .json({ message: 'You do not have permission to perform this action' });

  await cloudinary.uploader.destroy(post.image.publicId);

  const comments = await Comment.find({ parentPost: postId }).populate({
    path: 'author',
    populate: 'followers',
  });

  comments.forEach(({ author }) =>
    (async () => {
      author.comments.forEach((comment) => author.comments.pull(comment));
    })()
  );

  post.author.posts.pull(post);

  await Promise.all([
    post.author.save(),
    Comment.deleteMany({ parentPost: postId }),
    deleteTags(
      post.tags.map(({ name }) => name),
      post,
      true
    ),
  ]);

  removePostNotification(post.author, post, post.author.followers);

  await Post.deleteOne(post);

  res.status(200).json({ message: 'Post deleted' });
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByUserId,
  updatePost,
  deletePost,
  deleteUserData,
};
