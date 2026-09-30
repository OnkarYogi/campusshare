const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, getMyHistory } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.get('/me/history', auth, getMyHistory);
router.put('/profile', auth, updateProfile);
router.get('/:id', getUserProfile);

module.exports = router;
