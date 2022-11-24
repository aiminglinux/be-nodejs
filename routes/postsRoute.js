const express = require('express');
const router = express.Router();

const verifyJWT = require('../middleware/verifyJWT');

const {
  createPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
  postReaction,
} = require('../controllers/postsController');

router.route('/').get(getPosts).post(verifyJWT, createPost);

router.route('/bookmarked/:userId').get(getPosts);

router
  .route('/:username/:postSlug')
  .get(getPost)
  .patch(verifyJWT, updatePost)
  .delete(verifyJWT, deletePost);

router.route('./:username/:postURL/:action').patch(verifyJWT, postReaction);

module.exports = router;
