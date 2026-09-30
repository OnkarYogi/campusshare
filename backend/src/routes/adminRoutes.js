const express = require('express');
const router = express.Router();
const {
  getMetrics,
  getUsers,
  toggleUserVerification,
  toggleUserSuspension,
  getAllResources,
  moderateResource,
  getAuditLogs,
} = require('../controllers/adminController');
const { auth, requireRole } = require('../middleware/auth');

// All admin routes require authenticated Admin role
router.use(auth);
router.use(requireRole('admin'));

router.get('/metrics', getMetrics);
router.get('/users', getUsers);
router.patch('/users/:id/verify', toggleUserVerification);
router.patch('/users/:id/suspend', toggleUserSuspension);
router.get('/resources', getAllResources);
router.patch('/resources/:id/moderate', moderateResource);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
