const User = require('../models/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (cookies?.jwt) return res.sendStatus(401); // Unauthorized

  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken }).exec();

  if (!foundUser) return res.sendStatus(403); // Forbidden

  jwt.verify(refreshToken, process.env.REFRESS_TOKEN_SECRET, (err, decode) => {
    if (err || foundUser?.username !== decode.username)
      return res.sendStatus(403);
    const accessToken = jwt.sign(
      { username: foundUser?.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1m' }
    );
    res.json(accessToken);
  });
};

module.exports = { handleRefreshToken };
