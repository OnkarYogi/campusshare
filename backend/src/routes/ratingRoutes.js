const express = require('express');
const router = express.Router();
const { submitRating, getUserRatings } = require('../controllers/ratingController');
const { auth } = require('../middleware/auth');

router.post('/', auth, submitRating);
router.get('/user/:id', getUserRatings);

module.exports = router;
