const { validationResult } = require('express-validator');
const Opportunity = require('../models/Opportunity');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { recordAuditLog } = require('../services/auditService');

const getOpportunityScope = async (user) => {
  if (user.role === 'Admin') return {};
  if (user.role === 'Manager') {
    const teamIds = await User.distinct('_id', { $or: [{ _id: user._id }, { managerId: user._id }] });
    return { assignedTo: { $in: teamIds } };
  }
  return { assignedTo: user._id };
};

const listOpportunities = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });

  const scope = await getOpportunityScope(req.user);
  const filter = { ...scope };

  if (req.query.stage) filter.stage = req.query.stage;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    filter.$or = [
      { opportunityName: { $regex: req.query.search, $options: 'i' } },
      { opportunityId: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const result = await Opportunity.paginate(filter, {
    page: Number(req.query.page || 1),
    limit: Number(req.query.limit || 10),
    sort: req.query.sortBy || '-createdAt',
    populate: [
      { path: 'customerId', select: 'customerName customerCode email phone status' },
      { path: 'leadId', select: 'leadName leadCode email phone status' },
      { path: 'assignedTo', select: 'firstName lastName email role' }
    ],
    lean: true
  });

  return res.json({ success: true, data: result.docs, meta: { totalDocs: result.totalDocs, totalPages: result.totalPages, page: result.page } });
});

const getOpportunityById = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id).populate('customerId leadId assignedTo', 'customerName customerCode leadName leadCode firstName lastName email role');
  if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found.' });
  const scope = await getOpportunityScope(req.user);
  const visible = await Opportunity.findOne({ _id: req.params.id, ...scope });
  if (!visible && req.user.role !== 'Admin') return res.status(403).json({ success: false, message: 'Forbidden.' });
  return res.json({ success: true, data: opportunity });
});

const createOpportunity = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });

  const expectedCloseDate = new Date(req.body.expectedCloseDate);
  const activeOpportunity = (req.body.status || 'Active') === 'Active' || !req.body.status;
  if (activeOpportunity) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expectedCloseDate < today) {
      return res.status(400).json({ success: false, message: 'Expected Close Date cannot be in the past.' });
    }
    if (Number(req.body.amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Opportunity Amount must be greater than 0.' });
    }
  }

  if (req.body.customerId) {
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).json({ success: false, message: 'Customer not found.' });
  }
  if (req.body.leadId) {
    const lead = await Lead.findById(req.body.leadId);
    if (!lead) return res.status(400).json({ success: false, message: 'Lead not found.' });
  }

  const opportunity = await Opportunity.create({ ...req.body, expectedCloseDate, createdBy: req.user._id, updatedBy: req.user._id });
  await recordAuditLog({ userId: req.user._id, action: 'CREATE', entityName: 'Opportunity', recordId: opportunity._id, newValue: opportunity.toObject(), ipAddress: req.ip });
  return res.status(201).json({ success: true, message: 'Opportunity created successfully.', data: opportunity });
});

const updateOpportunity = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });

  const scope = await getOpportunityScope(req.user);
  const opportunity = await Opportunity.findOne({ _id: req.params.id, ...scope });
  if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found.' });

  const oldValue = opportunity.toObject();
  if (req.body.amount !== undefined && Number(req.body.amount) < 0) return res.status(400).json({ success: false, message: 'Opportunity Amount must be greater than 0.' });
  if (req.body.probability !== undefined && (Number(req.body.probability) < 0 || Number(req.body.probability) > 100)) return res.status(400).json({ success: false, message: 'Probability must be between 0 and 100.' });
  if (req.body.expectedCloseDate !== undefined) {
    const expectedCloseDate = new Date(req.body.expectedCloseDate);
    if ((req.body.status || opportunity.status) === 'Active') {
      const today = new Date(); today.setHours(0,0,0,0);
      if (expectedCloseDate < today) return res.status(400).json({ success: false, message: 'Expected Close Date cannot be in the past.' });
    }
    opportunity.expectedCloseDate = expectedCloseDate;
  }

  Object.entries(req.body).forEach(([key, value]) => {
    if (['opportunityName', 'customerId', 'leadId', 'amount', 'stage', 'probability', 'status', 'assignedTo'].includes(key)) {
      opportunity[key] = value;
    }
  });
  opportunity.updatedBy = req.user._id;
  await opportunity.save();

  await recordAuditLog({ userId: req.user._id, action: 'UPDATE', entityName: 'Opportunity', recordId: opportunity._id, oldValue, newValue: opportunity.toObject(), ipAddress: req.ip });
  return res.json({ success: true, message: 'Opportunity updated successfully.', data: opportunity });
});

const deleteOpportunity = asyncHandler(async (req, res) => {
  const scope = await getOpportunityScope(req.user);
  const opportunity = await Opportunity.findOne({ _id: req.params.id, ...scope });
  if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found.' });

  const oldValue = opportunity.toObject();
  opportunity.isActive = false;
  opportunity.status = 'Inactive';
  opportunity.updatedBy = req.user._id;
  await opportunity.save();
  await recordAuditLog({ userId: req.user._id, action: 'DEACTIVATE', entityName: 'Opportunity', recordId: opportunity._id, oldValue, newValue: opportunity.toObject(), ipAddress: req.ip });
  return res.json({ success: true, message: 'Opportunity deactivated successfully.' });
});

module.exports = { listOpportunities, getOpportunityById, createOpportunity, updateOpportunity, deleteOpportunity };
