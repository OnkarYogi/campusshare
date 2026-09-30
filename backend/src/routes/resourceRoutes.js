const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getMyListings,
} = require('../controllers/resourceController');
const { auth, requireVerified } = require('../middleware/auth');

router.get('/', getResources);
router.get('/my-listings', auth, getMyListings);
router.get('/:id', getResourceById);
router.post('/', auth, requireVerified, createResource);
router.put('/:id', auth, updateResource);
router.delete('/:id', auth, deleteResource);

module.exports = router;
