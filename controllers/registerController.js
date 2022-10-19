const User = require('../models/User');
const bcrypt = require('bcrypt');
const { uploadToCloudinary } = require('../utils/cloudinary');

const handleNewUser = async (req, res) => {
  const { name, email, username, password, picture } = req.body;
  let url, publicId;

  if (!picture) {
    url = process.env.CLOUDINARY_DEFAULT_URL;
    publicId = process.env.CLOUDINARY_DEFAULT_PUBLIC_ID;
  }

  const duplicateUser = await User.findOne({ username: username }).exec();
  if (duplicateUser)
    return res.status(409).json({ message: 'Username already taken' });

  const duplicateEmail = await User.findOne({ email }).exec();
  if (duplicateEmail)
    return res.status(409).json({ message: 'Email already taken' }); // Conflict

  try {
    const hashedPwd = await bcrypt.hash(password, 10);

    if (picture) {
      const uploadedResponse = await uploadToCloudinary(picture, 'Profiles');
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };
