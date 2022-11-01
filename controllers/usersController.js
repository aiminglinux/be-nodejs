const User = require('../models/User');
const cloudiary = require('../configs/cloudinary');
const { uploadToCloudinary } = require('../utils/cloudinary');

const getUsers = async (req, res) => {
  const users = await User.find({});
};

const getUser = async (req, res) => {
  const username = req.body.username;

  if (!username) res.status(400).json({ message: 'Username is required' });

  const user = await User.findOne({ username }).exec();

  if (!user)
    return res.status(204).json({ message: `User ${username} not found` });

  res.json(user.toObject({ getters: true }));
};

const updateUser = async (req, res) => {
  const id = req.params.id;
  const user = await User.findOne({ _id: id }).exec();
  console.log(user);
  if (!user)
    return res
      .status(204)
      .json({ message: `User with ID ${id} was not found` });

  if (req.body.picture?.publicId !== process.env.CLOUDINARY_DEFAULT_PUBLIC_ID) {
    const { url, public_id: publicId } = await uploadToCloudinary(
      req.body.picture?.url,
      'Profiles'
    );
  }

  if (user.picture?.publicId !== process.env.CLOUDINARY_DEFAULT_PUBLIC_ID) {
    cloudiary.uploader.destroy(user.picture.publicId);
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: id },
    { ...req.body },
    { new: true }
  );
  res.json(updatedUser.toObject({ getters: true }));
};

module.exports = { getUser, getUsers, updateUser };
