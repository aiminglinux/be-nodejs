const express = require('express');
const router = express.Router();

const verifyJWT = require('../middleware/verifyJWT');
const verifyOwner = require('../middleware/verifyOwner');
const { uploadMiddleware } = require('../middleware/file-upload');
const { postValidator } = require('../middleware/validators/formValidator');

const {
  createPost,
  getPostById,
  getAllPosts,
  getAllCommentsByPostId,
  updatePost,
  deletePost,
  postActions,
} = require('../controllers/postsController');

router.route('/').get(getAllPosts);
// .post([verifyJWT, uploadMiddleware], createPost);

router.route('/bookmarked/:userId').get(getAllPosts);

router
  .route('/:postId')
  .get(getPostById)
  .delete(verifyJWT, deletePost)
  .patch(verifyJWT, updatePost);

router.route('/:id/:action').patch(verifyJWT, postActions);
router.route('/:postId/comments').get(getAllCommentsByPostId);

module.exports = router;
