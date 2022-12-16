const express = require('express');
const router = express.Router();

const verifyJWT = require('../middleware/verifyJWT');
const { uploadMiddleware } = require('../middleware/file-upload');
const { postValidator } = require('../middleware/validators/formValidator');

const {
  createPost,
  getPostById,
  getAllPosts,
  updatePost,
  deletePost,
} = require('../controllers/postsController');

router
  .route('/')
  .get(getAllPosts)
  .post([verifyJWT, uploadMiddleware, postValidator], createPost);

router.route('/bookmarked/:userId').get(getAllPosts);

router
  .route('/:id')
  .get(getPostById)
  .delete(verifyJWT, deletePost)
  .patch(verifyJWT, updatePost);

module.exports = router;
