const User = require('../models/User');
const bcrypt = require('bcrypt');
const { uploadToCloudinary } = require('../utils/cloudinary');

// @desc: Create new user
// @route: POST /register
// @access: Public

const register = async (req, res) => {
  const { name, email, username, password, picture } = req.body;

  let url, publicId;

  if (!picture) {
    url = process.env.CLOUDINARY_DEFAULT_URL;
    publicId = process.env.CLOUDINARY_DEFAULT_PUBLIC_ID;
  }

  try {
    const duplicateUser = await User.findOne({ username }).exec();
    if (duplicateUser)
      return res.status(409).json({ message: 'Username already taken' });
    const duplicateEmail = await User.findOne({ email }).exec();
    if (duplicateEmail)
      return res.status(409).json({ message: 'Email already taken' });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: 'Register failed, please try again' });
  }

  try {
    const hashedPwd = await bcrypt.hash(password, 10);

    if (picture) {
      const uploadedResponse = await uploadToCloudinary(picture, 'pictures');
      url = uploadedResponse.url;
      publicId = uploadedResponse.public_id;
    }

    await User.create({
      name,
      username,
      email,
      picture: {
        url,
        publicId,
      },
      password: hashedPwd,
    });

    res
      .status(201)
      .json({ success: `New user named ${username} was created!` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { register };
