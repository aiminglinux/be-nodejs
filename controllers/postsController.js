const Post = require('../models/Post');
const User = require('../models/User');
const Tag = require('../models/Tag');
const Comment = require('../models/Comment');
const fs = require('fs');

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
      message: 'Could not fetch posts, please try again',
    });
  }
  if (!posts) return res.status(400).json({ message: 'Posts data is empty' });
  res.status(200).json(posts.map((post) => post.toObject({ getters: true })));
};

// @desc Get post commments by postId
// @route GET /posts/:postId/comments
// @access Public

const getAllCommentsByPostId = async (req, res) => {
  const { postId } = req.params;
  console.log(req.params);

  if (!postId || !mongoose.isValidObjectId(postId))
    return res.status(400).json({ message: 'Invalid provided post ID' });

  let comments;
  try {
    comments = await Comment.find({
      parentPost: req.params.postId,
    }).exec();
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: 'Could not fetch comments for post' });
  }

  if (!comments) return res.stutus(204).json();
  res
    .status(200)
    .json(comments.map((comment) => comment.toObject({ getters: true })));
};

// @desc Get single post by postId
// @route GET /posts/:postId
// @access Public

const getPostById = async (req, res) => {
  const { postId } = req.params;

  console.log(postId);

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

  res.status(200).json(post.toObject({ getters: true }));
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
  const { title, body, tags } = req.body;
  const author = req.id;

  if (req.file) {
    const { url, public_id: publicId } = await uploadToCloudinary(
      req.file.path,
      'posts'
    );
    fs.unlinkSync(req.file.path);
    req.body.image = { url, publicId };
  }

  const formattedTags = tags
    ?.trim()
    .split(',')
    .map((w) => w.trim().replace(/ /g, '-'));

  console.log(formattedTags);

  const createdPost = await Post.create({
    title,
    image: req.body.image,
    body,
    author: req.id,
  });

  await createTags(formattedTags, createdPost);

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
  const id = req.params.id;

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: 'Invalid post ID' });

  let post;

  try {
    post = await Post.findById(id).populate('author').populate('tags');
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: `Could not update post with ID: ${postId}` });
  }

  if (!post) res.status(204).json({ message: 'Post could not be found' });

  if (post.author.username !== req.username)
    return res
      .status(401)
      .json({ message: 'You do not have permission to perform this action' });

  if (req.body.file) {
    const { url, public_id: publicId } = await uploadToCloudinary(
      req.body.file,
      'posts'
    );
    await cloudinary.uploader.destroy(post.image.publicId);
    req.body.image = { url, publicId };
  }

  Object.keys(req.body).map((key) => {
    if (key !== 'tags') post[key] = req.body[key];
  });

  const formattedTags = req.body.tags
    ?.trim()
    .split(',')
    .map((w) => w.trim().replace(/ /g, '-'));

  console.log(formattedTags);

  try {
    await Promise.all([updateTags(formattedTags, post), post.save()]);
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
  const id = req.params.id;

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: `Invalid ID for ${id}` });

  let post;

  try {
    post = await Post.findById(id).populate('tags').populate('author').exec();
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: 'Could not delete requested post, please try again' });
  }

  if (!post) return res.status(204);

  if (post.author.username !== req.username)
    return res
      .status(401)
      .json({ message: 'You do not have permission to perform this action' });

  if (post.image) {
    await cloudinary.uploader.destroy(post.image.publicId);
  }

  const comments = await Comment.find({ parentPost: id }).populate({
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
    Comment.deleteMany({ parentPost: id }),
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

const toggleBookmarkLike = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: 'Invalid Post ID' });

  const post = await Post.findById(req.params.id);
  const user = await User.findById(req.id);

  const actions = {
    like: () => {
      const likeIndex = post.likes.findIndex((like) => like.equals(req.id));
      if (likeIndex === -1) {
        post.likes.push(user.id);
      } else {
        post.likes.splice(likeIndex, 1);
      }
    },
    bookmark: () => {
      const userBookmarkIndex = user.bookmarks.findIndex((userBookmark) =>
        userBookmark.equals(req.params.id)
      );
      const postBookmarkIndex = post.bookmarks.findIndex((postBookmark) =>
        postBookmark.equals(req.id)
      );
      if (userBookmarkIndex === -1 && postBookmarkIndex === -1) {
        user.bookmarks.push(post.id);
        post.bookmarks.push(post.id);
      } else {
        user.bookmarks.splice(userBookmarkIndex, 1);
        post.bookmarks.splice(postBookmarkIndex, 1);
      }
    },
  };

  if (!actions[req.params.type]) {
    return res.status(400).json({ error: 'Invalid request type' });
  }

  actions[req.params.type]();

  try {
    await Promise.all([post.save({ timestamps: false }), user.save()]);
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: `Could not update post ${req.params.type} reaction` });
  }

  res
    .status(200)
    .json({ message: `Post ${req.params.type} update successfully` });
};

module.exports = {
  createPost,
  getAllPosts,
  getAllCommentsByPostId,
  getPostById,
  getPostsByUserId,
  updatePost,
  deletePost,
  deleteUserData,
  toggleBookmarkLike,
};
