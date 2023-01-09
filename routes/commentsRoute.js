const express = require('express');
const router = express.Router();

const verifyJWT = require('../middleware/verifyJWT');

const {
  createComment,
  deleteComment,
  updateComment,
  commentReaction,
  getCommentByCommentId,
} = require('../controllers/commentsController');

// router.route('/').post(verifyJWT, postComment);
router.route('/:postId').post(verifyJWT, createComment);
router.route('/:postId/:commentId').post(verifyJWT, createComment);

router
  .route('/:id')
  .get(getCommentByCommentId)
  .delete(verifyJWT, deleteComment)
  .patch(verifyJWT, updateComment);

router.route('/:commentId/:action').patch(verifyJWT, commentReaction);

module.exports = router;
