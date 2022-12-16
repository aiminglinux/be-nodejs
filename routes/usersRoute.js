const express = require('express');
const router = express.Router();

const verifyJWT = require('../middleware/verifyJWT');
const verifyOwner = require('../middleware/verifyOwner');

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

router.route('/dash/:id').get(verifyOwner, getUserDashboard);

router
  .route('/:id')
  .patch(verifyOwner, updateUser)
  .delete(verifyOwner, deleteUser);

router.route('/:id/notifications').get(verifyOwner, getAllNotifications);

router
  .route('/:id/notifications/unread')
  .get(verifyOwner, getUnreadNotifications);

router.route('/:action/:followId').patch(verifyOwner, handleFollow);

module.exports = router;
