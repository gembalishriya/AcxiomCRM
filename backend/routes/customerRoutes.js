const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  listCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const {
  customerCreateValidator,
  customerUpdateValidator,
  customerIdValidator,
  customerListValidator
} = require('../validators/customerValidators');

const router = express.Router();

router.use(protect);

router.get('/', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), customerListValidator, listCustomers);
router.get('/:id', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), customerIdValidator, getCustomerById);
router.post('/', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), customerCreateValidator, createCustomer);
router.put('/:id', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), customerUpdateValidator, updateCustomer);
router.delete('/:id', authorizeRoles('Admin', 'Manager', 'SalesExecutive'), customerIdValidator, deleteCustomer);

module.exports = router;
