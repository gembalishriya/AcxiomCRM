const { validationResult } = require('express-validator');
const FollowUp = require('../models/FollowUp');
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

const listFollowUps = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  const scope = await getScope(req.user);
  const filter = { ...scope };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
  if (req.query.search) filter.followUpType = { $regex: req.query.search, $options: 'i' };

  const result = await FollowUp.paginate(filter, { page: Number(req.query.page || 1), limit: Number(req.query.limit || 10), sort: req.query.sortBy || '-followUpDate', populate: ['customerId', 'leadId', 'assignedTo'], lean: true });
  return res.json({ success: true, data: result.docs, meta: { totalDocs: result.totalDocs, totalPages: result.totalPages, page: result.page } });
});

const createFollowUp = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });

  const followUpDate = new Date(req.body.followUpDate);
  const today = new Date(); today.setHours(0,0,0,0);
  if ((req.body.status || 'Planned') === 'Planned' && followUpDate < today) {
    return res.status(400).json({ success: false, message: 'Follow-up date cannot be earlier than today.' });
  }

  const record = await FollowUp.create({ ...req.body, followUpDate, assignedTo: req.body.assignedTo || req.user._id, createdBy: req.user._id, updatedBy: req.user._id });
  await recordAuditLog({ userId: req.user._id, action: 'CREATE', entityName: 'FollowUp', recordId: record._id, newValue: record.toObject(), ipAddress: req.ip });
  return res.status(201).json({ success: true, message: 'Follow-up created successfully.', data: record });
});

const updateFollowUp = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });

  const scope = await getScope(req.user);
  const record = await FollowUp.findOne({ _id: req.params.id, ...scope });
  if (!record) return res.status(404).json({ success: false, message: 'Follow-up not found.' });
  const oldValue = record.toObject();

  if (req.body.followUpDate) {
    const newDate = new Date(req.body.followUpDate);
    const today = new Date(); today.setHours(0,0,0,0);
    if ((req.body.status || record.status) === 'Planned' && newDate < today) return res.status(400).json({ success: false, message: 'Follow-up date cannot be earlier than today.' });
    record.followUpDate = newDate;
  }
  ['customerId', 'leadId', 'followUpType', 'remarks', 'status', 'assignedTo'].forEach((field) => {
    if (req.body[field] !== undefined) record[field] = req.body[field];
  });
  record.updatedBy = req.user._id;
  await record.save();
  await recordAuditLog({ userId: req.user._id, action: 'UPDATE', entityName: 'FollowUp', recordId: record._id, oldValue, newValue: record.toObject(), ipAddress: req.ip });
  return res.json({ success: true, message: 'Follow-up updated successfully.', data: record });
});

const deleteFollowUp = asyncHandler(async (req, res) => {
  const scope = await getScope(req.user);
  const record = await FollowUp.findOne({ _id: req.params.id, ...scope });
  if (!record) return res.status(404).json({ success: false, message: 'Follow-up not found.' });
  const oldValue = record.toObject();
  record.isActive = false;
  record.status = 'Cancelled';
  record.updatedBy = req.user._id;
  await record.save();
  await recordAuditLog({ userId: req.user._id, action: 'DEACTIVATE', entityName: 'FollowUp', recordId: record._id, oldValue, newValue: record.toObject(), ipAddress: req.ip });
  return res.json({ success: true, message: 'Follow-up cancelled successfully.' });
});

module.exports = { listFollowUps, createFollowUp, updateFollowUp, deleteFollowUp };
