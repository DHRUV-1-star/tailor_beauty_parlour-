// ============================================
// routes/serviceRoutes.js - Service Catalogue
// ============================================

const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { protect, adminOnly } = require('../middleware/auth');

// GET all services (public - for displaying on website)
router.get('/', async (req, res) => {
  try {
    const filter = { isAvailable: true };
    if (req.query.category) filter.category = req.query.category;
    const services = await Service.find(filter).sort({ sortOrder: 1, category: 1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET featured services (public)
router.get('/featured', async (req, res) => {
  try {
    const services = await Service.find({ isAvailable: true, isFeatured: true }).sort({ sortOrder: 1 });
    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create service (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update service (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE service (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
