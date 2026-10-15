const express = require('express');
const router = express.Router();
const {
  createBorrowRequest,
  getMyBorrowRequests,
  getIncomingRequests,
  approveRequest,
  rejectRequest,
  cancelRequest,
  collectResource,
  requestReturn,
  confirmReturn,
} = require('../controllers/borrowController');
const { auth, requireVerified } = require('../middleware/auth');

router.post('/', auth, requireVerified, createBorrowRequest);
router.get('/my-requests', auth, getMyBorrowRequests);
router.get('/incoming', auth, getIncomingRequests);
router.patch('/:id/approve', auth, approveRequest);
router.patch('/:id/reject', auth, rejectRequest);
router.patch('/:id/cancel', auth, cancelRequest);
router.patch('/:id/collect', auth, collectResource);
router.patch('/:id/request-return', auth, requestReturn);
router.patch('/:id/return', auth, confirmReturn);

module.exports = router;
