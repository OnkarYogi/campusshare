const Resource = require('../models/Resource');
const BorrowRequest = require('../models/BorrowRequest');
const AuditLog = require('../models/AuditLog');

// @desc    Get all resources with search, filter, and pagination
// @route   GET /api/resources
// @access  Public
const getResources = async (req, res, next) => {
  try {
    const {
      search,
      category,
      department,
      condition,
      availableNow,
      steward,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      status: { $ne: 'archived' },
      isModerated: false,
    };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { identifiers: searchRegex },
        { department: searchRegex },
        { location: searchRegex },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (department && department !== 'all') {
      query.department = new RegExp(`^${department.trim()}`, 'i');
    }

    if (condition && condition !== 'all') {
      query.condition = condition;
    }

    if (availableNow === 'true' || availableNow === true) {
      query.status = 'available';
    }

    if (steward) {
      query.steward = steward;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .populate('steward', 'name role department avatarUrl trustScore isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: resources.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      resources,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource by ID
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      'steward',
      'name email role department avatarUrl trustScore isVerified totalCompletedLoans totalReviews averageRating'
    );

    if (!resource || resource.status === 'archived' || resource.isModerated) {
      return res.status(404).json({
        success: false,
        message: 'Resource listing not found or is unavailable.',
      });
    }

    res.status(200).json({
      success: true,
      resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new academic resource listing
// @route   POST /api/resources
// @access  Private (Verified users)
const createResource = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      identifiers,
      condition,
      department,
      location,
      maxLoanDurationDays,
      images,
      specifications,
    } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and pickup location are required.',
      });
    }

    const resource = await Resource.create({
      title,
      description,
      category: category || 'other',
      identifiers: identifiers || '',
      condition: condition || 'good',
      department: department || req.user.department || 'General',
      location,
      maxLoanDurationDays: maxLoanDurationDays || 14,
      images: Array.isArray(images) ? images : images ? [images] : [],
      specifications: specifications || [],
      steward: req.user._id,
      status: 'available',
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'RESOURCE_CREATED',
      targetType: 'Resource',
      targetId: resource._id.toString(),
      details: { title: resource.title, category: resource.category },
      ip: req.ip || '',
    });

    const populated = await Resource.findById(resource._id).populate(
      'steward',
      'name role department avatarUrl trustScore isVerified'
    );

    res.status(201).json({
      success: true,
      message: 'Resource listed successfully.',
      resource: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource details
// @route   PUT /api/resources/:id
// @access  Private (Owner or Admin)
const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource || resource.status === 'archived') {
      return res.status(404).json({
        success: false,
        message: 'Resource not found.',
      });
    }

    // Must be steward or admin
    if (
      resource.steward.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing.',
      });
    }

    const {
      title,
      description,
      category,
      identifiers,
      condition,
      department,
      location,
      maxLoanDurationDays,
      images,
      specifications,
      status,
    } = req.body;

    if (title !== undefined) resource.title = title;
    if (description !== undefined) resource.description = description;
    if (category !== undefined) resource.category = category;
    if (identifiers !== undefined) resource.identifiers = identifiers;
    if (condition !== undefined) resource.condition = condition;
    if (department !== undefined) resource.department = department;
    if (location !== undefined) resource.location = location;
    if (maxLoanDurationDays !== undefined) resource.maxLoanDurationDays = maxLoanDurationDays;
    if (images !== undefined) resource.images = images;
    if (specifications !== undefined) resource.specifications = specifications;
    if (status && ['available', 'maintenance'].includes(status)) {
      resource.status = status;
    }

    await resource.save();

    res.status(200).json({
      success: true,
      message: 'Resource listing updated successfully.',
      resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Archive a resource (guarded by SRS active borrowing rule)
// @route   DELETE /api/resources/:id
// @access  Private (Owner or Admin)
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource || resource.status === 'archived') {
      return res.status(404).json({
        success: false,
        message: 'Resource not found.',
      });
    }

    if (
      resource.steward.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource listing.',
      });
    }

    // SRS Business Rule: Resources with active requests cannot be deleted
    const activeRequests = await BorrowRequest.countDocuments({
      resource: resource._id,
      status: { $in: ['pending', 'approved', 'borrowed'] },
    });

    if (activeRequests > 0) {
      return res.status(400).json({
        success: false,
        message:
          'Cannot delete or archive resource while there are pending, approved, or active borrow requests.',
      });
    }

    resource.status = 'archived';
    await resource.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'RESOURCE_ARCHIVED',
      targetType: 'Resource',
      targetId: resource._id.toString(),
      details: { title: resource.title },
      ip: req.ip || '',
    });

    res.status(200).json({
      success: true,
      message: 'Resource listing has been safely archived.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resources listed by current authenticated user
// @route   GET /api/resources/my-listings
// @access  Private
const getMyListings = async (req, res, next) => {
  try {
    const resources = await Resource.find({
      steward: req.user._id,
      status: { $ne: 'archived' },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getMyListings,
};
