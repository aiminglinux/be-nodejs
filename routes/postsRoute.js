const express = require('express');
const router = express.Router();

const verifyJWT = require('../middleware/verifyJWT');

const {
  createPost,
  getPostById,
  getAllPosts,
  updatePost,
  deletePost,
} = require('../controllers/postsController');

router.route('/').get(getAllPosts).post(verifyJWT, createPost);

router.route('/bookmarked/:userId').get(getAllPosts);

router
  .route('/:postId')
  .get(getPostById)
  .delete(verifyJWT, deletePost)
  .patch(verifyJWT, updatePost);

module.exports = router;
