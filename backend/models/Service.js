// ============================================
// models/Service.js - Service/Price List Schema
// ============================================

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['tailoring', 'beauty', 'alteration'],
  },
  subCategory: {
    type: String,
    // e.g., "blouse", "suit", "makeup", "hair"
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
  },
  features: [{ type: String }],
  priceMin: {
    type: Number,
    required: true,
    min: 0,
  },
  priceMax: {
    type: Number,
    min: 0,
  },
  estimatedDays: {
    type: Number,
    min: 0,
    comment: 'Estimated days for delivery/completion',
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  imageUrl: { type: String },
  tags: [{ type: String }],
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-create slug from name
serviceSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '_');
  }
  next();
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
