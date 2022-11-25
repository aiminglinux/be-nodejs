const User = require('../models/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken })
    .select('+refreshToken')
    .exec();

  if (!foundUser) return res.status(403).json({ message: 'Forbidden' });

  jwt.verify(refreshToken, process.env.REFRESS_TOKEN_SECRET, (err, decode) => {
    if (err || foundUser?.username !== decode.username)
      return res.status(403).json({ message: 'Forbidden' });
    const accessToken = jwt.sign(
      { username: foundUser?.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1m' }
    );
    res.json(accessToken);
  });
};

module.exports = { handleRefreshToken };
