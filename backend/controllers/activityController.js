const { validationResult } = require('express-validator');
const Activity = require('../models/Activity');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { recordAuditLog } = require('../services/auditService');

const getScope = async (user) => {
  if (user.role === 'Admin') return {};
  if (user.role === 'Manager') {
    const teamIds = await User.distinct('_id', { $or: [{ _id: user._id }, { managerId: user._id }] });
    return { assignedTo: { $in: teamIds } };
  }
  return { assignedTo: user._id };
};

const listActivities = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  const scope = await getScope(req.user);
  const filter = { ...scope };
  if (req.query.activityType) filter.activityType = req.query.activityType;
  if (req.query.status) filter.status = req.query.status;

  const result = await Activity.paginate(filter, { page: Number(req.query.page || 1), limit: Number(req.query.limit || 10), sort: req.query.sortBy || '-activityDate', populate: ['customerId', 'leadId', 'assignedTo'], lean: true });
  return res.json({ success: true, data: result.docs, meta: { totalDocs: result.totalDocs, totalPages: result.totalPages, page: result.page } });
});

const createActivity = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  const record = await Activity.create({ ...req.body, activityDate: new Date(req.body.activityDate), assignedTo: req.body.assignedTo || req.user._id, createdBy: req.user._id, updatedBy: req.user._id });
  await recordAuditLog({ userId: req.user._id, action: 'CREATE', entityName: 'Activity', recordId: record._id, newValue: record.toObject(), ipAddress: req.ip });
  return res.status(201).json({ success: true, message: 'Activity created successfully.', data: record });
});

module.exports = { listActivities, createActivity };
