const bycrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc Login to system
// @route POST /auth
// @access Private

const login = async (req, res) => {
  const { email, username, password } = req.body;

  const foundUser = await User.findOne({
    $or: [{ username }, { email }],
  })
    .select(['+email', '+password', '+refreshToken'])
    .exec();
  if (!foundUser) {
    return res.status(401).json({ message: 'Account does not existed' });
  }
  const match = await bycrypt.compare(password, foundUser.password);
  if (match) {
    const accessToken = jwt.sign(
      { username: foundUser.username, id: foundUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '1d',
      }
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESS_TOKEN_SECRET,
      { expiresIn: '1d' }
    );
    // Saving refresh token to current user
    foundUser.refreshToken = refreshToken;
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000,
    });
    await foundUser.save();
    res.json({ ...foundUser.toObject({ getter: true }), accessToken });
  } else {
    return res.status(401).json({ message: 'Email or password is invalid' });
  }
};

module.exports = { login };
