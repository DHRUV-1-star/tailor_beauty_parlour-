// ============================================
// models/Customer.js - Customer Schema
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const measurementSchema = new mongoose.Schema({
  // Blouse / Upper body
  bust: Number,
  waist: Number,
  hip: Number,
  shoulderWidth: Number,
  sleeveLength: Number,
  blouseLength: Number,
  neckDepthFront: Number,
  neckDepthBack: Number,

  // Lower body / Salwar / Lehenga
  skirtLength: Number,
  kurtiLength: Number,
  inseam: Number,

  // Notes
  notes: { type: String, maxlength: 500 },
  takenAt: { type: Date, default: Date.now },
}, { _id: false });

const customerSchema = new mongoose.Schema({
  // Personal Info
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
  },
  email: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    sparse: true,
  },
  whatsapp: { type: String },
  address: { type: String, maxlength: 300 },
  city: { type: String, trim: true },
  dateOfBirth: { type: Date },

  // Portal access (optional - for customer login)
  password: {
    type: String,
    minlength: 6,
    select: false, // Don't return password in queries
  },
  isRegistered: {
    type: Boolean,
    default: false,
  },

  // Body Measurements (stored for future orders)
  measurements: measurementSchema,

  // Business Stats
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastVisit: { type: Date },
  loyaltyPoints: { type: Number, default: 0 },

  // Preferences
  preferredFabrics: [{ type: String }],
  preferredStyles: [{ type: String }],
  allergies: { type: String }, // for beauty services

  // Tags
  tags: [{ type: String }], // e.g., 'bridal', 'vip', 'regular'
  isActive: { type: Boolean, default: true },
  notes: { type: String, maxlength: 500 },

}, { timestamps: true });

// Hash password before saving
customerSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
customerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update stats when order is added
customerSchema.methods.addOrder = async function(amount) {
  this.totalOrders += 1;
  this.totalSpent += amount || 0;
  this.loyaltyPoints += Math.floor((amount || 0) / 100); // 1 point per ₹100
  this.lastVisit = new Date();
  await this.save();
};

// Indexes
customerSchema.index({ phone: 1 }, { unique: true });
customerSchema.index({ email: 1 }, { sparse: true });
customerSchema.index({ name: 'text' }); // text search

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
