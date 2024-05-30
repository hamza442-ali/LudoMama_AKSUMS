const express = require('express');
const router = express.Router();

const userController = require('../../controllers/admin/userController');

// Create a new user
router.post('/createUser', userController.createUser);
// Get all users
router.get('/getAllUsers', userController.getAllUsers);
// Delete user by ID
router.delete('/deleteUserById/:id', userController.deleteUserById);

module.exports = router;
