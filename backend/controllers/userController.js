const { validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { hashPassword } = require('../utils/password');
const { recordAuditLog } = require('../services/auditService');

const listUsers = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  const filter = {};
  if (req.query.search) {
    filter.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const result = await User.paginate(filter, {
    page: Number(req.query.page || 1),
    limit: Number(req.query.limit || 10),
    sort: req.query.sortBy || '-createdAt',
    select: '-passwordHash',
    lean: true
  });
  return res.json({ success: true, data: result.docs, meta: { totalDocs: result.totalDocs, totalPages: result.totalPages, page: result.page } });
});

const createUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  const existing = await User.findOne({ email: req.body.email.toLowerCase() });
  if (existing) return res.status(409).json({ success: false, message: 'Email already exists.' });
  const user = await User.create({ ...req.body, email: req.body.email.toLowerCase(), passwordHash: await hashPassword(req.body.password), createdBy: req.user._id });
  await recordAuditLog({ userId: req.user._id, action: 'CREATE', entityName: 'User', recordId: user._id, newValue: { email: user.email, role: user.role }, ipAddress: req.ip });
  return res.status(201).json({ success: true, message: 'User created successfully.', data: user });
});

const updateUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  const oldValue = user.toObject();
  ['firstName', 'lastName', 'email', 'role', 'managerId', 'isActive'].forEach((field) => { if (req.body[field] !== undefined) user[field] = field === 'email' ? req.body[field].toLowerCase() : req.body[field]; });
  await user.save();
  await recordAuditLog({ userId: req.user._id, action: 'UPDATE', entityName: 'User', recordId: user._id, oldValue, newValue: user.toObject(), ipAddress: req.ip });
  return res.json({ success: true, message: 'User updated successfully.', data: user });
});

const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('+passwordHash');
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (!req.body.password) return res.status(400).json({ success: false, message: 'Password is required.' });
  user.passwordHash = await hashPassword(req.body.password);
  user.passwordChangedAt = new Date();
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();
  await recordAuditLog({ userId: req.user._id, action: 'RESET_PASSWORD', entityName: 'User', recordId: user._id, newValue: { email: user.email }, ipAddress: req.ip });
  return res.json({ success: true, message: 'Password reset successfully.' });
});

module.exports = { listUsers, createUser, updateUser, resetPassword };
