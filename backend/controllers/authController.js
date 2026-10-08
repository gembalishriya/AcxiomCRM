const { validationResult } = require('express-validator');
const User = require('../models/User');
const { hashPassword, comparePassword, isStrongPassword } = require('../utils/password');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../services/tokenService');
const { recordAuditLog } = require('../services/auditService');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const cleanAuthUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  failedLoginAttempts: user.failedLoginAttempts,
  lockUntil: user.lockUntil,
  lastLoginAt: user.lastLoginAt
});

const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  const { firstName, lastName, email, password, role } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
    });
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Email already exists.' });
  }

  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    role: role || 'SalesExecutive',
    createdBy: null
  });

  await recordAuditLog({
    userId: user._id,
    action: 'REGISTER',
    entityName: 'User',
    recordId: user._id,
    newValue: { email: user.email, role: user.role },
    ipAddress: req.ip
  });

  return res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    data: cleanAuthUser(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }

  const { email, password } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user) {
    await recordAuditLog({
      action: 'LOGIN_FAILED',
      entityName: 'Auth',
      newValue: { email: normalizedEmail },
      ipAddress: req.ip
    });
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account is inactive.' });
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    return res.status(423).json({ success: false, message: 'Account is locked. Try again later.' });
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      user.failedLoginAttempts = 0;
    }
    await user.save();

    await recordAuditLog({
      userId: user._id,
      action: 'LOGIN_FAILED',
      entityName: 'Auth',
      recordId: user._id,
      newValue: { email: user.email },
      ipAddress: req.ip
    });

    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user);

  await recordAuditLog({
    userId: user._id,
    action: 'LOGIN_SUCCESS',
    entityName: 'Auth',
    recordId: user._id,
    newValue: { email: user.email, role: user.role },
    ipAddress: req.ip
  });

  return res.json({
    success: true,
    message: 'Login successful.',
    token,
    data: cleanAuthUser(user)
  });
});

const logout = asyncHandler(async (req, res) => {
  await recordAuditLog({
    userId: req.user ? req.user._id : null,
    action: 'LOGOUT',
    entityName: 'Auth',
    recordId: req.user ? req.user._id : null,
    ipAddress: req.ip
  });

  return res.json({ success: true, message: 'Logout successful.' });
});

const me = asyncHandler(async (req, res) => {
  return res.json({ success: true, data: cleanAuthUser(req.user) });
});

module.exports = { register, login, logout, me };
