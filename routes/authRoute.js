const express = require('express');
const { login } = require('../controllers/authController');
const router = express.Router();

const { authValidator } = require('../middleware/validators/formValidator');

router.post('/', authValidator, login);

module.exports = router;
