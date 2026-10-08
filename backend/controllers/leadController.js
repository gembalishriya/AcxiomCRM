const { validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { recordAuditLog } = require('../services/auditService');

const getVisibleLeadQuery = async (user) => {
  if (user.role === 'Admin') {
    return {};
  }

  if (user.role === 'Manager') {
    const teamUserIds = await User.distinct('_id', { $or: [{ _id: user._id }, { managerId: user._id }] });
    return { assignedTo: { $in: teamUserIds } };
  }

  return { assignedTo: user._id };
};

const buildLeadFilter = (queryParams) => {
  const filter = {};

  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  if (queryParams.source) {
    filter.source = queryParams.source;
  }

  if (queryParams.search) {
    const search = String(queryParams.search).trim();
    filter.$or = [
      { leadName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { companyName: { $regex: search, $options: 'i' } },
      { leadCode: { $regex: search, $options: 'i' } }
    ];
  }

  return filter;
};

const listLeads = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  const scope = await getVisibleLeadQuery(req.user);
  const filter = { ...scope, ...buildLeadFilter(req.query) };
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const sort = req.query.sortBy || '-createdAt';

  const result = await Lead.paginate(filter, {
    page,
    limit,
    sort,
    populate: [
      { path: 'assignedTo', select: 'firstName lastName email role' },
      { path: 'createdBy', select: 'firstName lastName email role' },
      { path: 'updatedBy', select: 'firstName lastName email role' }
    ],
    lean: true
  });

  return res.json({ success: true, data: result.docs, meta: { totalDocs: result.totalDocs, totalPages: result.totalPages, page: result.page } });
});

const createLead = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  const { leadCode, leadName, email, phone, companyName = '', source = 'Unknown', status = 'New', expectedValue = 0, assignedTo = null } = req.body;
  const normalizedEmail = String(email).toLowerCase().trim();
  const normalizedPhone = String(phone).trim();

  const duplicateLead = await Lead.findOne({ $or: [{ email: normalizedEmail }, { phone: normalizedPhone }, { leadCode }] });
  if (duplicateLead) {
    return res.status(409).json({ success: false, message: 'Lead with same code, email, or phone already exists.' });
  }

  const lead = await Lead.create({
    leadCode,
    leadName,
    email: normalizedEmail,
    phone: normalizedPhone,
    companyName,
    source,
    status,
    expectedValue,
    assignedTo: assignedTo || req.user._id,
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  await recordAuditLog({ userId: req.user._id, action: 'CREATE', entityName: 'Lead', recordId: lead._id, newValue: lead.toObject(), ipAddress: req.ip });

  return res.status(201).json({ success: true, message: 'Lead created successfully.', data: lead });
});

const getLeadById = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  const scope = await getVisibleLeadQuery(req.user);
  const lead = await Lead.findOne({ _id: req.params.id, ...scope })
    .populate('assignedTo', 'firstName lastName email role')
    .populate('createdBy', 'firstName lastName email role')
    .populate('updatedBy', 'firstName lastName email role');

  if (!lead) {
    return res.status(404).json({ success: false, message: 'Lead not found.' });
  }

  return res.json({ success: true, data: lead });
});

const updateLead = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  const scope = await getVisibleLeadQuery(req.user);
  const lead = await Lead.findOne({ _id: req.params.id, ...scope });
  if (!lead) {
    return res.status(404).json({ success: false, message: 'Lead not found.' });
  }

  const oldValue = lead.toObject();
  const updateFields = ['leadCode', 'leadName', 'email', 'phone', 'companyName', 'source', 'status', 'expectedValue', 'assignedTo'];

  updateFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      lead[field] = field === 'email' ? String(req.body[field]).toLowerCase().trim() : req.body[field];
    }
  });

  const duplicateCode = await Lead.findOne({ _id: { $ne: lead._id }, leadCode: lead.leadCode });
  if (duplicateCode) {
    return res.status(409).json({ success: false, message: 'Lead Code must be unique.' });
  }

  lead.updatedBy = req.user._id;
  await lead.save();

  await recordAuditLog({ userId: req.user._id, action: 'UPDATE', entityName: 'Lead', recordId: lead._id, oldValue, newValue: lead.toObject(), ipAddress: req.ip });

  return res.json({ success: true, message: 'Lead updated successfully.', data: lead });
});

const deleteLead = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  const scope = await getVisibleLeadQuery(req.user);
  const lead = await Lead.findOne({ _id: req.params.id, ...scope });
  if (!lead) {
    return res.status(404).json({ success: false, message: 'Lead not found.' });
  }

  const oldValue = lead.toObject();
  lead.isActive = false;
  lead.status = 'Lost';
  lead.updatedBy = req.user._id;
  await lead.save();

  await recordAuditLog({ userId: req.user._id, action: 'DEACTIVATE', entityName: 'Lead', recordId: lead._id, oldValue, newValue: lead.toObject(), ipAddress: req.ip });

  return res.json({ success: true, message: 'Lead deactivated successfully.' });
});

const convertLead = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  const scope = await getVisibleLeadQuery(req.user);
  const lead = await Lead.findOne({ _id: req.params.id, ...scope });

  if (!lead) {
    return res.status(404).json({ success: false, message: 'Lead not found.' });
  }

  if (lead.status !== 'Qualified' && lead.status !== 'Converted') {
    return res.status(400).json({ success: false, message: 'Only qualified leads can be converted.' });
  }

  let customer = await Customer.findOne({ email: lead.email });
  if (!customer) {
    customer = await Customer.create({
      customerCode: `CUS-${Date.now()}`,
      customerName: lead.leadName,
      email: lead.email,
      phone: lead.phone,
      companyName: lead.companyName,
      status: 'Active',
      createdBy: req.user._id,
      updatedBy: req.user._id
    });
  }

  const opportunity = await Opportunity.create({
    opportunityName: `${lead.leadName} Opportunity`,
    customerId: customer._id,
    leadId: lead._id,
    amount: Number(lead.expectedValue || 0),
    stage: 'Qualification',
    probability: 0,
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'Active',
    assignedTo: lead.assignedTo || req.user._id,
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  lead.status = 'Converted';
  lead.convertedCustomerId = customer._id;
  lead.convertedOpportunityId = opportunity._id;
  lead.updatedBy = req.user._id;
  await lead.save();

  await recordAuditLog({
    userId: req.user._id,
    action: 'CONVERT',
    entityName: 'Lead',
    recordId: lead._id,
    newValue: { customerId: customer._id, opportunityId: opportunity._id },
    ipAddress: req.ip
  });

  return res.json({ success: true, message: 'Lead converted successfully.', data: { lead, customer, opportunity } });
});

module.exports = { listLeads, createLead, getLeadById, updateLead, deleteLead, convertLead };
