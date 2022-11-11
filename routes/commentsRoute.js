const express = require('express');
const router = express.Router();

const verifyJWT = require('../middleware/verifyJWT');

const {
  postComment,
  getCommentsByPost,
  deleteComment,
  updateComment,
  commentReaction,
} = require('../controllers/commentsController');

router.route('/').post(verifyJWT, postComment);
router.route('/:postId').get(getCommentsByPost);

router
  .route('/:commentId')
  .delete(verifyJWT, deleteComment)
  .patch(verifyJWT, updateComment);

router.route('/:commendId/:action').patch(verifyJWT, commentReaction);

module.exports = router;
