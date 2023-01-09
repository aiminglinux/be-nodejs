const User = require('../models/User');
const cloudinary = require('../configs/cloudinary');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { default: mongoose, Mongoose } = require('mongoose');

const {
  followNotification,
  removeFollowNotification,
} = require('./notificationsController');

// @desc Get all users
// @route GET /users
// @access Public

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate({
        path: 'posts',
        populate: ['author', 'tags'],
      })
      .sort({ followers: -1 });

    res.json({ users: users.map((user) => user.toObject({ getters: true })) });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: 'Failed to fetch users, please try again' });
  }
};

// @desc Get user by id
// @route GET /users/:id
// @access Public

const getUserById = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: 'Requested User ID is invalid' });

  let user;

  try {
    user = await User.findById(id)
      .populate({
        path: 'posts',
        populate: ['author', 'tags'],
      })
      .exec();
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: 'Internal server error: Failed to fetch user' });
  }
  if (!user)
    return res.status(404).json({ message: `User ID ${id} not found` });

  res.json({ user: user.toObject({ getters: true }) });
};

// @desc Get all users
// @route GET /users/dash/:id
// @access Private

const getUserDashboard = async (req, res) => {
  let user;

  try {
    user = await User.findById(req.id)
      .populate({ path: 'posts', options: { sort: { createAt: -1 } } })
      .populate('followings')
      .populate('followers')
      .populate({ path: 'followedTags', options: { sort: { posts: -1 } } })
      .exec();
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: 'Internal server error: Failed to fetch user dashboard',
    });
  }

  if (!user)
    return res.status(404).json({ message: `User ID ${req.id} not found` });

  res.status(200).json(user.toObject({ getters: true }));
};

// @desc Update user
// @route PATCH /users/:userId
// @access Private

const updateUser = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: 'Invalid user ID' });

  let user;

  try {
    user = await User.findById(id).exec();
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: `User ID ${id} either deleted or could not be found` });
  }

  if (!user)
    return res
      .status(404)
      .json({ message: `User ID ${id} either deleted or could not be found` });

  if (req.username !== user.username)
    return res.status(403).json({ message: 'Invalid credentials' });

  // Upload new avatar
  if (req.body.picture?.publicId !== process.env.CLOUDINARY_DEFAULT_PUBLIC_ID) {
    const uploadResponse = await uploadToCloudinary(
      req.body.picture?.url,
      'pictures'
    );

    const { url, public_id: publicId } = uploadResponse;
    req.body.picture = { url, publicId };
  }
  // Remove the old avatar
  if (req.body.picture?.publicId !== process.env.CLOUDINARY_DEFAULT_PUBLIC_ID) {
    await cloudinary.uploader.destroy(user.picture.publicId);
  }

  try {
    const upded = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Failed to update user profile' });
  }

  res.json({ message: `Update user profile ${id} successfully` });
};

// @desc Delete user
// @route DELETE /users/:userId
// @access Private

const deleteUser = async (req, res) => {
  let user;

  try {
    user = await User.findById(req.id).exec();
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Failed to delete user' });
  }
  if (!user)
    return res.status(404).json({ message: `User ID ${req.id} not found` });

  if (user.picture?.publicId) {
    if (user.picture.publicId !== process.env.CLOUDINARY_DEFAULT_PUBLIC_ID)
      cloudinary.uploader.destroy(user.picture.publicId);
  }

  ['followers', 'followings'].forEach((r) => {
    (async () => {
      await User.updateMany({ [r]: req.id }, { $pull: { [r]: req.id } });
    })();
  });
  // TODO: Delete user posts and comments
  try {
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Failed to delete user' });
  }
  const deletedUser = await User.findByIdAndDelete(req.id);
  res
    .status(200)
    .json({ message: `User ${deletedUser.username} deleted successfully` });
};

// @desc Handle follow user
// @route PATCH /users/:action/:followId
// @access Private

const handleFollow = async (req, res) => {
  const { action, followId } = req.params;

  if (!mongoose.isValidObjectId(followId))
    return res.status(400).json({ message: 'Invalid follower ID' });

  if (followId === req.id)
    return res
      .status(400)
      .json({ message: 'You cannot follow or unfollow yourself' });

  const isFollowed = await User.find({
    _id: followId,
    followers: req.id,
  }).countDocuments();

  // return console.log(isFollowed);

  try {
    await Promise.all([
      User.findByIdAndUpdate(
        req.id,
        {
          [isFollowed > 0 ? '$pull' : '$addToSet']: { followings: followId },
        },
        { timestamps: false }
      ),
      User.findByIdAndUpdate(
        followId,
        { [isFollowed > 0 ? '$pull' : '$addToSet']: { followers: req.id } },
        { new: true, timestamps: false }
      ),
    ]);
    isFollowed > 0
      ? await removeFollowNotification(req.id, followId)
      : await followNotification(req.id, followId);
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: 'Failed to perform action, please try again' });
  }

  console.log(isFollowed > 0);

  res.status(200).json({
    message:
      [isFollowed > 0 ? 'Unfollow' : 'Follow'] +
      ` user ID ${followId} successfully`,
  });
};

module.exports = {
  getUserById,
  getUserDashboard,
  getAllUsers,
  updateUser,
  deleteUser,
  handleFollow,
};
