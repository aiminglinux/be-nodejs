const express = require('express');
const router = express.Router();

const verifyJWT = require('../middleware/verifyJWT');

const {
  createComment,
  getCommentsByPost,
  deleteComment,
  updateComment,
  commentReaction,
  getCommentByCommentId,
} = require('../controllers/commentsController');

// router.route('/').post(verifyJWT, postComment);
router.route('/:postId').post(verifyJWT, createComment);

router
  .route('/:id')
  .get(getCommentByCommentId)
  .delete(verifyJWT, deleteComment)
  .patch(verifyJWT, updateComment);

router.route('/:commendId/:action').patch(verifyJWT, commentReaction);

module.exports = router;
