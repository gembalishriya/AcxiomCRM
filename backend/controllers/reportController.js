const asyncHandler = require('../utils/asyncHandler');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Opportunity = require('../models/Opportunity');
const FollowUp = require('../models/FollowUp');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

const customerReport = asyncHandler(async (req, res) => {
  const rows = await Customer.find({}, 'customerName status createdAt createdBy')
    .populate('createdBy', 'firstName lastName')
    .lean();
  return res.json({ success: true, data: rows });
});

const leadReport = asyncHandler(async (req, res) => {
  const rows = await Lead.find({}, 'leadName source status createdAt assignedTo convertedCustomerId convertedOpportunityId')
    .populate('assignedTo', 'firstName lastName')
    .lean();
  return res.json({ success: true, data: rows });
});

const followUpReport = asyncHandler(async (req, res) => {
  const rows = await Customer.find({}, 'customerCode customerName companyName address city state status createdAt createdBy')
    .populate('createdBy', 'firstName lastName email role')
    .lean();
  return res.json({ success: true, data: rows });
});

const opportunityReport = asyncHandler(async (req, res) => {
  const rows = await Opportunity.find({}, 'opportunityName stage amount probability expectedCloseDate status assignedTo createdAt')
    .populate('assignedTo', 'firstName lastName email role')
    .lean();
  return res.json({ success: true, data: rows });
});

const pipelineReport = asyncHandler(async (req, res) => {
  const rows = await FollowUp.find({}, 'followUpDate status followUpType assignedTo customerId leadId remarks createdAt')
    .populate('assignedTo', 'firstName lastName email role')
    .lean();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const data = rows.map((row) => ({
    ...row,
    overdue: row.status === 'Planned' && new Date(row.followUpDate) < today
  }));

  return res.json({ success: true, data });
});

const conversionReport = asyncHandler(async (req, res) => {
  const [converted, notConverted, byStatus] = await Promise.all([
    Lead.countDocuments({ status: 'Converted' }),
    Lead.countDocuments({ status: { $nin: ['Converted'] } }),
    Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
  ]);

  return res.json({
    success: true,
    data: {
      converted,
      notConverted,
      byStatus
    }
  });
});

const auditReport = asyncHandler(async (req, res) => {
  const rows = await AuditLog.find({}).populate('userId', 'firstName lastName email role').sort('-createdAt').lean();
  return res.json({ success: true, data: rows });
});

const userActivityReport = asyncHandler(async (req, res) => {
  const rows = await AuditLog.aggregate([{ $group: { _id: '$userId', actionCount: { $sum: 1 } } }]);
  return res.json({ success: true, data: rows });
});

module.exports = {
  customerReport,
  leadReport,
  followUpReport,
  conversionReport,
  opportunityReport,
  pipelineReport,
  auditReport,
  userActivityReport
};
