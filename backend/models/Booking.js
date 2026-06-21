// ============================================
// models/Booking.js - Booking Schema
// ============================================

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Customer Info
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
  },
  whatsapp: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please enter a valid WhatsApp number'],
  },

  // Service Details
  service: {
    type: String,
    required: [true, 'Service selection is required'],
    enum: [
      // Stitching
      'covered_blouse', 'salwar_suit', 'lehenga', 'kurti',
      'saree_blouse', 'indo_western', 'alteration',
      // Beauty
      'bridal_makeup', 'party_makeup', 'facial', 'threading_waxing',
      'hair', 'mehendi', 'manicure',
    ],
  },
  serviceCategory: {
    type: String,
    enum: ['tailoring', 'beauty'],
  },

  // Appointment Details
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required'],
    enum: ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
  },

  // Additional Info
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },

  // Admin fields
  estimatedCost: {
    type: Number,
    min: 0,
  },
  finalCost: {
    type: Number,
    min: 0,
  },
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters'],
  },
  assignedTo: {
    type: String,
    trim: true,
  },
  deliveryDate: {
    type: Date,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'online', ''],
    default: '',
  },

  // Reference to customer
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },

}, { timestamps: true });

// Pre-save hook: automatically set service category
bookingSchema.pre('save', function(next) {
  const tailoringServices = ['covered_blouse', 'salwar_suit', 'lehenga', 'kurti', 'saree_blouse', 'indo_western', 'alteration'];
  this.serviceCategory = tailoringServices.includes(this.service) ? 'tailoring' : 'beauty';
  next();
});

// Virtual: formatted service name
bookingSchema.virtual('serviceName').get(function() {
  const names = {
    covered_blouse: 'Covered Blouse Stitching',
    salwar_suit: 'Salwar Suit Stitching',
    lehenga: 'Lehenga / Bridal Wear',
    kurti: 'Kurti / Tops',
    saree_blouse: 'Saree Blouse',
    indo_western: 'Indo-Western Outfit',
    alteration: 'Alteration / Repair',
    bridal_makeup: 'Bridal Makeup',
    party_makeup: 'Party Makeup',
    facial: 'Facial / Cleanup',
    threading_waxing: 'Threading / Waxing',
    hair: 'Hair Styling / Treatment',
    mehendi: 'Mehendi Design',
    manicure: 'Manicure / Pedicure',
  };
  return names[this.service] || this.service;
});

// Indexes for faster queries
bookingSchema.index({ phone: 1 });
bookingSchema.index({ appointmentDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
