const express = require('express');
const router = express.Router();

const verifyJWT = require('../middleware/verifyJWT');
const {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  getUserDashboard,
  handleFollow,
} = require('../controllers/usersController');
const {
  getNotifications,
  getUnreadNotifications,
} = require('../controllers/notificationsController');

router.route('/').get(getUsers);

router.route('/:id').patch(verifyJWT, updateUser).delete(verifyJWT, deleteUser);

router.route('/:username').get(getUser);

router.route('/dashboard/:username').get(getUserDashboard);

router.route('/:previewedId/:action').patch(verifyJWT, handleFollow);

router.route('/:userId/notifications').get(getNotifications);

router.route('/:userId/notifications/unread').get(getUnreadNotifications);

module.exports = router;
