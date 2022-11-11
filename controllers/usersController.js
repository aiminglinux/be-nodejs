const User = require('../models/User');
const cloudinary = require('../configs/cloudinary');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Get All Users
const getUserList = async (req, res) => {
  const userList = await User.find({})
    .populate({
      path: 'posts',
      populate: ['author', 'tags'],
    })
    .sort({ followers: -1 });
  res.json(userList.map((user) => user.toObject({ getters: true })));
};

// Get Specific User
const getUser = async (req, res) => {
  const username = req.body.username;

  if (!username) res.status(400).json({ message: 'Username is required' });

  const user = await User.findOne({ username })
    .populate({
      path: 'posts',
      populate: ['author', 'tags'],
    })
    .exec();

  if (!user)
    return res.status(204).json({ message: `User ${username} not found` });

  res.json(user.toObject({ getters: true }));
};

const getUserDashboard = async (req, res) => {
  const username = req.params.username;
  if (!username)
    return res.status(400).json({ message: 'Username is required' });

  const user = await User.findOne({ username })
    .populate({ path: 'posts', options: { sort: { createAt: -1 } } })
    .populate('followings')
    .populate('followers')
    .populate({ path: 'followedTags', options: { sort: { posts: -1 } } })
    .exec();

  if (!user)
    return res.status(204).json({ message: `User ${username} not found` });

  res.json(user.toObject({ getters: true }));
};

const updateUser = async (req, res) => {
  const id = req.params.id;
  const user = await User.findOne({ _id: id }).exec();

  if (!user)
    return res
      .status(204)
      .json({ message: `User with ID ${id} was not found` });

  // Upload new avatar
  if (req.body.picture?.publicId !== process.env.CLOUDINARY_DEFAULT_PUBLIC_ID) {
    const uploadResponse = await uploadToCloudinary(
      req.body.picture?.url,
      'pictures'
    );
    const { url, public_id: publicId } = uploadResponse;
    req.body.picture = { url, publicId };
    await cloudinary.uploader.destroy(user.picture.publicId);
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: id },
    { ...req.body },
    { new: true }
  );
  res.json(updatedUser.toObject({ getters: true }));
};

const deleteUser = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ message: 'User ID required' });

  const user = await User.findOne({ _id: id }).exec();
  if (!user) res.status(204).json({ message: `User ID ${id} not found` });

  if (user.picture?.publicId) {
    if (user.picture.publicId !== process.env.CLOUDINARY_DEFAULT_PUBLIC_ID)
      cloudinary.uploader.destroy(user.picture.publicId);
  }

  ['followers', 'following'].forEach((r) => {
    (async () => {
      await User.updateMany({ [r]: id }, { $pull: { [r]: id } });
    })();
  });
  // TODO: Delete user posts

  const deleteUser = await User.deleteOne({ _id: id });
  res.json(deleteUser);
};

const handleFollow = async (req, res) => {
  const { previewedId, action } = req.params;
  const { currentId } = req.body;
  const isUndoing = action.includes('un');

  await User.findOneAndUpdate(
    { _id: currentId },
    { [isUndoing ? '$pull' : '$addToSet']: { following: previewedId } },
    { timestamps: false }
  );

  const followedUser = await User.findOneAndUpdate(
    { _id: previewedId },
    { [isUndoing ? '$pull' : '$addToSet']: { followers: currentId } },
    { new: true, timestamps: false }
  );

  if (isUndoing) await removeFollowNotification(currentId, previewedId);
  else await followNotification(currentId, previewedId);

  res.json(followedUser.toObject({ getters: true }));
};

module.exports = {
  getUser,
  getUserDashboard,
  getUserList,
  updateUser,
  deleteUser,
  handleFollow,
};
