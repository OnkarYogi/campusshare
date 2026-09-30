const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getMyNotifications);
router.patch('/read-all', auth, markAllAsRead);
router.patch('/:id/read', auth, markAsRead);

module.exports = router;
