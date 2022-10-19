const express = require('express');
const { handleLogin } = require('../controllers/authController');
const router = express.Router();

// @desc Register account
// @route POST /auth
// @access Private

const { authValidator } = require('../middleware/validators/formValidator');

router.post('/', authValidator, handleLogin);

module.exports = router;
