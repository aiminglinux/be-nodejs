const express = require('express');
const router = express.Router();
const {
  getTags,
  getFollowingTags,
  getNumTags,
  getTagByName,
  handleFollow,
} = require('../controllers/tagsController');
const verifyJWT = require('../middleware/verifyJWT');

router.route('/').get(getTags);

router.route('/limit').get(getNumTags);

router.route('/limit/:userId').get(getFollowingTags);

router.route('/:name').get(getTagByName);

router.route('/:name/:action').patch(verifyJWT, handleFollow);

module.exports = router;
