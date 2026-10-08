const { validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { recordAuditLog } = require('../services/auditService');

const getVisibleCustomerQuery = async (user) => {
  if (user.role === 'Admin') {
    return {};
  }

  if (user.role === 'Manager') {
    const teamUserIds = await User.distinct('_id', { $or: [{ _id: user._id }, { managerId: user._id }] });
    return { createdBy: { $in: teamUserIds } };
  }

  return { createdBy: user._id };
};

const buildCustomerFilter = (queryParams) => {
  const filter = {};

  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  if (queryParams.search) {
    const search = String(queryParams.search).trim();
    filter.$or = [
      { customerName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { companyName: { $regex: search, $options: 'i' } },
      { customerCode: { $regex: search, $options: 'i' } }
    ];
  }

  return filter;
};

const listCustomers = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  const accessFilter = await getVisibleCustomerQuery(req.user);
  const queryFilter = buildCustomerFilter(req.query);
  const filter = { ...accessFilter, ...queryFilter };

  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const sort = req.query.sortBy || '-createdAt';

  const result = await Customer.paginate(filter, {
    page,
    limit,
    sort,
    populate: [
      { path: 'createdBy', select: 'firstName lastName email role' },
      { path: 'updatedBy', select: 'firstName lastName email role' }
    ],
    lean: true
  });

  return res.json({
    success: true,
    data: result.docs,
    meta: {
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      page: result.page,
      pagingCounter: result.pagingCounter,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage
    }
  });
});

const getCustomerById = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  const accessFilter = await getVisibleCustomerQuery(req.user);
  const customer = await Customer.findOne({ _id: req.params.id, ...accessFilter })
    .populate('createdBy', 'firstName lastName email role')
    .populate('updatedBy', 'firstName lastName email role');

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found.' });
  }

  return res.json({ success: true, data: customer });
});

const createCustomer = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  const { customerCode, customerName, email, phone, companyName = '', address = '', city = '', state = '', status = 'Active' } = req.body;
  const normalizedEmail = String(email).toLowerCase().trim();
  const normalizedPhone = String(phone).trim();

  const duplicateCustomer = await Customer.findOne({
    $or: [{ email: normalizedEmail }, { phone: normalizedPhone }, { customerCode }]
  });

  if (duplicateCustomer) {
    return res.status(409).json({ success: false, message: 'Customer with same code, email, or phone already exists.' });
  }

  const customer = await Customer.create({
    customerCode,
    customerName,
    email: normalizedEmail,
    phone: normalizedPhone,
    companyName,
    address,
    city,
    state,
    status,
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  await recordAuditLog({
    userId: req.user._id,
    action: 'CREATE',
    entityName: 'Customer',
    recordId: customer._id,
    newValue: customer.toObject(),
    ipAddress: req.ip
  });

  return res.status(201).json({ success: true, message: 'Customer created successfully.', data: customer });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  const accessFilter = await getVisibleCustomerQuery(req.user);
  const customer = await Customer.findOne({ _id: req.params.id, ...accessFilter });

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found.' });
  }

  const oldValue = customer.toObject();
  const updateFields = ['customerCode', 'customerName', 'email', 'phone', 'companyName', 'address', 'city', 'state', 'status'];

  updateFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      customer[field] = field === 'email' ? String(req.body[field]).toLowerCase().trim() : req.body[field];
    }
  });

  if (customer.email) {
    const duplicateEmail = await Customer.findOne({ _id: { $ne: customer._id }, email: customer.email });
    if (duplicateEmail) {
      return res.status(409).json({ success: false, message: 'Email must be unique.' });
    }
  }

  if (customer.phone) {
    const duplicatePhone = await Customer.findOne({ _id: { $ne: customer._id }, phone: customer.phone });
    if (duplicatePhone) {
      return res.status(409).json({ success: false, message: 'Phone must be unique.' });
    }
  }

  const duplicateCode = await Customer.findOne({ _id: { $ne: customer._id }, customerCode: customer.customerCode });
  if (duplicateCode) {
    return res.status(409).json({ success: false, message: 'Customer Code must be unique.' });
  }

  customer.updatedBy = req.user._id;
  await customer.save();

  await recordAuditLog({
    userId: req.user._id,
    action: 'UPDATE',
    entityName: 'Customer',
    recordId: customer._id,
    oldValue,
    newValue: customer.toObject(),
    ipAddress: req.ip
  });

  return res.json({ success: true, message: 'Customer updated successfully.', data: customer });
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  const accessFilter = await getVisibleCustomerQuery(req.user);
  const customer = await Customer.findOne({ _id: req.params.id, ...accessFilter });

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found.' });
  }

  const oldValue = customer.toObject();
  customer.isActive = false;
  customer.status = 'Deactivated';
  customer.updatedBy = req.user._id;
  await customer.save();

  await recordAuditLog({
    userId: req.user._id,
    action: 'DEACTIVATE',
    entityName: 'Customer',
    recordId: customer._id,
    oldValue,
    newValue: customer.toObject(),
    ipAddress: req.ip
  });

  return res.json({ success: true, message: 'Customer deactivated successfully.' });
});

module.exports = {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
