const jwt = require('jsonwebtoken');

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  console.log('authHeader: ', authHeader);

  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Unauthorized' });

  const accessToken = authHeader.split(' ')[1];

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    next();
  });
};

module.exports = verifyJWT;
