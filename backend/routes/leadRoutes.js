const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { listLeads, createLead, getLeadById, updateLead, deleteLead, convertLead } = require('../controllers/leadController');
const { leadCreateValidator, leadUpdateValidator, leadIdValidator, leadListValidator } = require('../validators/leadValidators');

const router = express.Router();

router.use(protect);

router.get('/', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), leadListValidator, listLeads);
router.get('/:id', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), leadIdValidator, getLeadById);
router.post('/', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), leadCreateValidator, createLead);
router.put('/:id', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), leadUpdateValidator, updateLead);
router.delete('/:id', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), leadIdValidator, deleteLead);
router.post('/:id/convert', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), leadIdValidator, convertLead);

module.exports = router;
