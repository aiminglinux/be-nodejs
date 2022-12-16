const { default: mongoose } = require('mongoose');

const verifyOwner = async (req, res, next) => {
  const id = req.params.id;
  if (id && !mongoose.isValidObjectId(id))
    return res.status(400).json({ message: 'Requested User ID is invalid' });
  if (id && mongoose.isValidObjectId(id)) {
    if (req.id !== req.params.id)
      return res
        .status(403)
        .json({ message: 'You are not authorized to access this resource' });
  }
  next();
};

module.exports = verifyOwner;
