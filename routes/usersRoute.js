const express = require('express');
const router = express.Router();

const verifyJWT = require('../middleware/verifyJWT');
const isAuthorized = require('../middleware/auth');
const {
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserDashboard,
  handleFollow,
} = require('../controllers/usersController');
const {
  getAllNotifications,
  getUnreadNotifications,
} = require('../controllers/notificationsController');

router.route('/').get(getAllUsers);

router.route('/:id').get(getUserById);

router.use(verifyJWT);
router.use(isAuthorized);

router.route('/dash/:id').get(getUserDashboard);

router.route('/:id').patch(updateUser).delete(deleteUser);

router.route('/:id/notifications').get(getAllNotifications);

router.route('/:id/notifications/unread').get(getUnreadNotifications);

router.route('/:action/:followId').patch(handleFollow);

module.exports = router;
