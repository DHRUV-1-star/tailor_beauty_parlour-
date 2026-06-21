// ============================================
// controllers/customerController.js
// ============================================

const Customer = require('../models/Customer');

// ---- Get All Customers ----
exports.getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find({ isActive: true })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Customer.countDocuments({ isActive: true }),
    ]);

    res.json({
      success: true,
      count: customers.length,
      total,
      pages: Math.ceil(total / limit),
      data: customers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- Search Customers ----
exports.searchCustomers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Search query required' });

    const customers = await Customer.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q } },
        { email: { $regex: q, $options: 'i' } },
      ],
    }).select('-password').limit(10);

    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- Get Single Customer ----
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-password');
    if (!customer || !customer.isActive) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- Create Customer ----
exports.createCustomer = async (req, res) => {
  try {
    // Check if phone already exists
    const existing = await Customer.findOne({ phone: req.body.phone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A customer with this phone number already exists' });
    }

    const customer = await Customer.create(req.body);
    const { password: _, ...customerData } = customer.toObject();
    res.status(201).json({ success: true, data: customerData });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate phone or email' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- Update Customer ----
exports.updateCustomer = async (req, res) => {
  try {
    // Don't allow password update through this route
    delete req.body.password;
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- Update Measurements ----
exports.updateMeasurements = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { measurements: { ...req.body, takenAt: new Date() } },
      { new: true }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Measurements updated', data: customer.measurements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- Delete Customer (soft delete) ----
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer removed from active records' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
