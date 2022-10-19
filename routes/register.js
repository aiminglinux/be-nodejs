const express = require('express');
const { handleNewUser } = require('../controllers/registerController');
const router = express.Router();

// @desc Register account
// @route POST /register
// @access Private

const { registerValidator } = require('../middleware/validators/formValidator');

router.post('/', registerValidator, handleNewUser);

module.exports = router;
