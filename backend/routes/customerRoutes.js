// ============================================
// routes/customerRoutes.js - Customer Routes
// ============================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateMeasurements,
  searchCustomers,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect, adminOnly } = require('../middleware/auth');

// Validation
const customerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone required'),
  body('email').optional().isEmail().withMessage('Invalid email address'),
];

// All customer routes are admin-protected
router.use(protect, adminOnly);

router.get('/', getAllCustomers);                              // Get all customers
router.get('/search', searchCustomers);                        // Search customers
router.post('/', customerValidation, createCustomer);          // Create customer
router.get('/:id', getCustomerById);                          // Get single customer
router.put('/:id', updateCustomer);                           // Update customer
router.put('/:id/measurements', updateMeasurements);          // Update measurements
router.delete('/:id', deleteCustomer);                        // Delete customer

module.exports = router;
