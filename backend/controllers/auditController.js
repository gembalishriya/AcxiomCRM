const asyncHandler = require('../utils/asyncHandler');
const AuditLog = require('../models/AuditLog');

const listAuditLogs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.action) filter.action = req.query.action;
  if (req.query.entityName) filter.entityName = req.query.entityName;
  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
  }
  const rows = await AuditLog.find(filter).populate('userId', 'firstName lastName email role').sort('-createdAt').lean();
  return res.json({ success: true, data: rows });
});

module.exports = { listAuditLogs };
