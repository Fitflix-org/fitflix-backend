const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById
} = require('./user.controller');

// POST /api/users - Create new user
router.post('/', createUser);

// GET /api/users - Get all users
router.get('/', getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

module.exports = router;
