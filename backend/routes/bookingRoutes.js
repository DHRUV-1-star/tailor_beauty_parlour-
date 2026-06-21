// ============================================
// routes/bookingRoutes.js - Booking API Routes
// ============================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getBookingsByDate,
  getTodaysBookings,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

// Validation rules for new booking
const bookingValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name too long'),
  body('phone')
    .matches(/^[0-9]{10}$/).withMessage('Enter a valid 10-digit phone number'),
  body('service')
    .notEmpty().withMessage('Please select a service')
    .isIn([
      'covered_blouse', 'salwar_suit', 'lehenga', 'kurti',
      'saree_blouse', 'indo_western', 'alteration',
      'bridal_makeup', 'party_makeup', 'facial', 'threading_waxing',
      'hair', 'mehendi', 'manicure',
    ]).withMessage('Invalid service selected'),
  body('date').notEmpty().withMessage('Appointment date is required').isISO8601().withMessage('Invalid date format'),
  body('time').notEmpty().withMessage('Appointment time is required'),
];

// Public Routes
router.post('/', bookingValidation, createBooking);            // Create booking (frontend form)

// Admin Routes (require login)
router.get('/', protect, adminOnly, getAllBookings);            // Get all bookings
router.get('/today', protect, adminOnly, getTodaysBookings);   // Today's appointments
router.get('/date/:date', protect, adminOnly, getBookingsByDate); // Bookings by date
router.get('/:id', protect, adminOnly, getBookingById);        // Get single booking
router.put('/:id/status', protect, adminOnly, updateBookingStatus); // Update status
router.delete('/:id', protect, adminOnly, deleteBooking);      // Delete booking

module.exports = router;
