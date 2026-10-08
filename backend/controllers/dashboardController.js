const asyncHandler = require('../utils/asyncHandler');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Opportunity = require('../models/Opportunity');
const FollowUp = require('../models/FollowUp');
const User = require('../models/User');

const dashboardSummary = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const baseCustomerFilter = role === 'SalesExecutive' ? { createdBy: req.user._id } : {};
  const baseLeadFilter = role === 'SalesExecutive' ? { assignedTo: req.user._id } : role === 'Manager' ? { assignedTo: { $in: await User.distinct('_id', { $or: [{ _id: req.user._id }, { managerId: req.user._id }] }) } } : {};
  const baseOppFilter = role === 'SalesExecutive' ? { assignedTo: req.user._id } : role === 'Manager' ? { assignedTo: { $in: await User.distinct('_id', { $or: [{ _id: req.user._id }, { managerId: req.user._id }] }) } } : {};
  const baseFollowFilter = role === 'SalesExecutive' ? { assignedTo: req.user._id } : role === 'Manager' ? { assignedTo: { $in: await User.distinct('_id', { $or: [{ _id: req.user._id }, { managerId: req.user._id }] }) } } : {};

  const [totalCustomers, totalLeads, openLeads, totalOpps, openOpps, wonOpps, lostOpps, pendingFollowUps, pipelineAgg] = await Promise.all([
    Customer.countDocuments(baseCustomerFilter),
    Lead.countDocuments(baseLeadFilter),
    Lead.countDocuments({ ...baseLeadFilter, status: { $nin: ['Lost', 'Converted'] } }),
    Opportunity.countDocuments(baseOppFilter),
    Opportunity.countDocuments({ ...baseOppFilter, status: 'Active' }),
    Opportunity.countDocuments({ ...baseOppFilter, status: 'Won' }),
    Opportunity.countDocuments({ ...baseOppFilter, status: 'Lost' }),
    FollowUp.countDocuments({ ...baseFollowFilter, status: 'Planned' }),
    Opportunity.aggregate([
      { $match: { ...baseOppFilter, status: { $in: ['Active', 'Won'] } } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$amount', { $divide: ['$probability', 100] }] } } } }
    ])
  ]);

  return res.json({
    success: true,
    data: {
      totalCustomers,
      totalLeads,
      openLeads,
      totalOpps,
      openOpps,
      wonOpps,
      lostOpps,
      pendingFollowUps,
      totalPipelineValue: pipelineAgg[0]?.total || 0
    }
  });
});

module.exports = { dashboardSummary };
