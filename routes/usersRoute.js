const express = require('express');
const route = express.Router();

const verifyJWT = require('../middleware/verifyJWT');

const {
  getUser,
  getUsers,
  updateUser,
} = require('../controllers/usersController');

route.get('/', getUser);
route.get('/:username', getUser);
route.patch('/:id', verifyJWT, updateUser);

module.exports = route;
