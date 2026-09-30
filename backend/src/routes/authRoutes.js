const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyEmail } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/verify-email', verifyEmail);

module.exports = router;
