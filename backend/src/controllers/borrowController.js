const BorrowRequest = require('../models/BorrowRequest');
const Resource = require('../models/Resource');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// @desc    Submit a new borrow request
// @route   POST /api/borrow
// @access  Private (Verified users)
const createBorrowRequest = async (req, res, next) => {
  try {
    const { resourceId, startDate, endDate, purpose } = req.body;

    if (!resourceId || !startDate || !endDate || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID, start date, end date, and purpose are required.',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after the start date.',
      });
    }

    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const resource = await Resource.findById(resourceId);
    if (!resource || resource.status === 'archived' || resource.isModerated) {
      return res.status(404).json({
        success: false,
        message: 'Resource not available for borrowing.',
      });
    }

    // SRS Business Rule: Cannot submit a request for a resource that is already checked out
    if (resource.status === 'borrowed') {
      return res.status(400).json({
        success: false,
        message: 'This resource is currently checked out and unavailable for new requests.',
      });
    }

    // SRS Business Rule: Cannot borrow your own resource
    if (resource.steward.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Business Rule Violation: You cannot borrow your own resource.',
      });
    }

    // SRS Business Rule: Max 3 active borrowings per user
    const activeBorrowingsCount = await BorrowRequest.countDocuments({
      borrower: req.user._id,
      status: { $in: ['approved', 'borrowed'] },
    });

    if (activeBorrowingsCount >= 3) {
      return res.status(400).json({
        success: false,
        message:
          'Business Rule Violation: Maximum limit of 3 active borrowings reached. Return an item before borrowing more.',
      });
    }

    // Check duration against max loan allowed
    if (durationDays > resource.maxLoanDurationDays) {
      return res.status(400).json({
        success: false,
        message: `Requested loan duration of ${durationDays} days exceeds maximum allowed limit of ${resource.maxLoanDurationDays} days.`,
      });
    }

    const borrowRequest = await BorrowRequest.create({
      resource: resource._id,
      borrower: req.user._id,
      steward: resource.steward,
      startDate: start,
      endDate: end,
      durationDays,
      purpose,
      status: 'pending',
    });

    // Update resource state to requested if currently available
    if (resource.status === 'available') {
      resource.status = 'requested';
      await resource.save();
    }

    // In-app notification for the Steward
    await Notification.create({
      recipient: resource.steward,
      sender: req.user._id,
      type: 'request_received',
      title: 'New Borrow Request',
      message: `${req.user.name} submitted a request to borrow "${resource.title}" for ${durationDays} days.`,
      resource: resource._id,
      request: borrowRequest._id,
    });

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'BORROW_REQUESTED',
      targetType: 'BorrowRequest',
      targetId: borrowRequest._id.toString(),
      details: { resourceTitle: resource.title, durationDays },
      ip: req.ip || '',
    });

    const populated = await BorrowRequest.findById(borrowRequest._id)
      .populate('resource', 'title category identifiers images location')
      .populate('steward', 'name email department avatarUrl trustScore');

    res.status(201).json({
      success: true,
      message: 'Borrow request submitted successfully.',
      borrowRequest: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get borrow requests submitted by current user
// @route   GET /api/borrow/my-requests
// @access  Private
const getMyBorrowRequests = async (req, res, next) => {
  try {
    const requests = await BorrowRequest.find({ borrower: req.user._id })
      .populate('resource', 'title category identifiers images location status maxLoanDurationDays')
      .populate('steward', 'name email department avatarUrl trustScore')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get requests received for resources stewarded by current user
// @route   GET /api/borrow/incoming
// @access  Private
const getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await BorrowRequest.find({ steward: req.user._id })
      .populate('resource', 'title category identifiers images location status')
      .populate('borrower', 'name email department avatarUrl trustScore campusId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a borrow request
// @route   PATCH /api/borrow/:id/approve
// @access  Private (Resource Steward)
const approveRequest = async (req, res, next) => {
  try {
    const request = await BorrowRequest.findById(req.params.id)
      .populate('resource')
      .populate('borrower', 'name');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Borrow request not found.',
      });
    }

    if (request.steward.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the resource steward can approve this request.',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request with current status: ${request.status}`,
      });
    }

    // RACE-CONDITION GUARD: Atomically mark the resource as 'borrowed' ONLY IF it is not already
    // borrowed. This prevents two concurrent approvals from both succeeding.
    const updatedResource = await Resource.findOneAndUpdate(
      { _id: request.resource._id, status: { $ne: 'borrowed' } },
      { $set: { status: 'borrowed' } },
      { new: true }
    );

    if (!updatedResource) {
      return res.status(409).json({
        success: false,
        message: 'Resource was just approved for another borrower. Request cannot be approved.',
      });
    }

    // Approve this request
    request.status = 'approved';
    request.approvedAt = new Date();
    await request.save();

    // Auto-reject all OTHER pending requests for this resource to preserve history
    const otherPending = await BorrowRequest.find({
      resource: request.resource._id,
      status: 'pending',
      _id: { $ne: request._id },
    }).select('_id borrower');

    if (otherPending.length > 0) {
      const otherIds = otherPending.map((r) => r._id);
      await BorrowRequest.updateMany(
        { _id: { $in: otherIds } },
        {
          $set: {
            status: 'rejected',
            rejectionReason: 'Another request was approved for this resource.',
          },
        }
      );

      // Notify each rejected borrower
      const notifDocs = otherPending.map((r) => ({
        recipient: r.borrower,
        sender: req.user._id,
        type: 'request_rejected',
        title: 'Borrow Request Declined',
        message: `Your request for "${request.resource.title}" was declined: Another request was approved for this resource.`,
        resource: request.resource._id,
        request: r._id,
      }));
      await Notification.insertMany(notifDocs);
    }

    // Notify approved Borrower
    await Notification.create({
      recipient: request.borrower._id,
      sender: req.user._id,
      type: 'request_approved',
      title: 'Borrow Request Approved',
      message: `Your request for "${request.resource.title}" was approved by ${req.user.name}. Please coordinate pick-up at ${request.resource.location}.`,
      resource: request.resource._id,
      request: request._id,
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'BORROW_APPROVED',
      targetType: 'BorrowRequest',
      targetId: request._id.toString(),
      ip: req.ip || '',
    });

    res.status(200).json({
      success: true,
      message: 'Borrow request approved.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a borrow request
// @route   PATCH /api/borrow/:id/reject
// @access  Private (Resource Steward)
const rejectRequest = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const request = await BorrowRequest.findById(req.params.id).populate('resource');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Borrow request not found.',
      });
    }

    if (request.steward.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the resource steward can reject this request.',
      });
    }

    request.status = 'rejected';
    request.rejectionReason = rejectionReason || 'Unavailable for the requested schedule.';
    await request.save();

    // Check if any other pending requests remain for this resource
    const pendingOthers = await BorrowRequest.countDocuments({
      resource: request.resource._id,
      status: { $in: ['pending', 'approved', 'borrowed'] },
    });

    if (pendingOthers === 0) {
      const resource = await Resource.findById(request.resource._id);
      if (resource) {
        resource.status = 'available';
        await resource.save();
      }
    }

    // Notify Borrower
    await Notification.create({
      recipient: request.borrower,
      sender: req.user._id,
      type: 'request_rejected',
      title: 'Borrow Request Declined',
      message: `Your request for "${request.resource.title}" was declined: ${request.rejectionReason}`,
      resource: request.resource._id,
      request: request._id,
    });

    res.status(200).json({
      success: true,
      message: 'Borrow request rejected.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a pending borrow request
// @route   PATCH /api/borrow/:id/cancel
// @access  Private (Borrower)
const cancelRequest = async (req, res, next) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Borrow request not found.',
      });
    }

    if (request.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own pending requests.',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled.',
      });
    }

    request.status = 'cancelled';
    await request.save();

    // Revert resource to available if no other active requests
    const activeOthers = await BorrowRequest.countDocuments({
      resource: request.resource,
      status: { $in: ['pending', 'approved', 'borrowed'] },
    });

    if (activeOthers === 0) {
      await Resource.findByIdAndUpdate(request.resource, { status: 'available' });
    }

    res.status(200).json({
      success: true,
      message: 'Borrow request cancelled.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark item as collected / handed over
// @route   PATCH /api/borrow/:id/collect
// @access  Private (Resource Steward)
const collectResource = async (req, res, next) => {
  try {
    const { handoverNotes } = req.body;
    const request = await BorrowRequest.findById(req.params.id).populate('resource');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Borrow request not found.',
      });
    }

    if (request.steward.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the resource steward can confirm collection.',
      });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Item must be in "approved" state before marking collected.',
      });
    }

    request.status = 'borrowed';
    request.borrowedAt = new Date();
    if (handoverNotes) request.handoverNotes = handoverNotes;
    await request.save();

    // Resource is already 'borrowed' from approval step; ensure consistency
    await Resource.findByIdAndUpdate(request.resource._id, { status: 'borrowed' });

    // Notify Borrower
    await Notification.create({
      recipient: request.borrower,
      sender: req.user._id,
      type: 'borrowed',
      title: 'Resource Picked Up',
      message: `You have successfully checked out "${request.resource.title}". Expected return by ${request.endDate.toLocaleDateString()}.`,
      resource: request.resource._id,
      request: request._id,
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'BORROW_COLLECTED',
      targetType: 'BorrowRequest',
      targetId: request._id.toString(),
      ip: req.ip || '',
    });

    res.status(200).json({
      success: true,
      message: 'Item marked as borrowed and in borrower custody.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm item returned and complete transaction (SRS 4.4, 5.5)
// @route   PATCH /api/borrow/:id/return
// @access  Private (Resource Steward)
const confirmReturn = async (req, res, next) => {
  try {
    const { returnNotes } = req.body;
    const request = await BorrowRequest.findById(req.params.id).populate('resource');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Borrow request not found.',
      });
    }

    // SRS Business Rule: Only the owner may confirm a successful return
    if (request.steward.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'SRS Rule Violation: Only the resource steward may confirm a return.',
      });
    }

    if (request.status !== 'borrowed') {
      return res.status(400).json({
        success: false,
        message: 'Only items currently in "borrowed" state can be confirmed as returned.',
      });
    }

    request.status = 'returned';
    request.returnedAt = new Date();
    if (returnNotes) request.returnNotes = returnNotes;
    await request.save();

    // Revert resource status to available
    await Resource.findByIdAndUpdate(request.resource._id, { status: 'available' });

    // Increment completed loan tallies for both users
    await User.findByIdAndUpdate(request.borrower, { $inc: { totalCompletedLoans: 1 } });
    await User.findByIdAndUpdate(request.steward, { $inc: { totalCompletedLoans: 1 } });

    // Notify Borrower to leave a rating
    await Notification.create({
      recipient: request.borrower,
      sender: req.user._id,
      type: 'returned',
      title: 'Return Confirmed',
      message: `Return of "${request.resource.title}" confirmed by steward. Please leave a rating and review to support community trust.`,
      resource: request.resource._id,
      request: request._id,
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'BORROW_RETURNED',
      targetType: 'BorrowRequest',
      targetId: request._id.toString(),
      ip: req.ip || '',
    });

    res.status(200).json({
      success: true,
      message: 'Return confirmed. Resource is once again available.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBorrowRequest,
  getMyBorrowRequests,
  getIncomingRequests,
  approveRequest,
  rejectRequest,
  cancelRequest,
  collectResource,
  confirmReturn,
};
