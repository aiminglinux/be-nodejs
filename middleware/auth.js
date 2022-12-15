const User = require('../models/User');

const isAuthorized = async (req, res, next) => {
  console.log(req.params.id);
  //   let user;
  //   try {
  //     user = await User.findById(req.id);
  //   } catch (error) {
  //     console.error(error.message);
  //     return res.status(500);
  //   }
  next();
};

module.exports = isAuthorized;
