// ============================================
// controllers/bookingController.js
// ============================================

const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

// ---- Create Booking (Public) ----
exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone, whatsapp, service, date, time, notes } = req.body;

    const booking = await Booking.create({
      name,
      phone,
      whatsapp: whatsapp || phone,
      service,
      appointmentDate: new Date(date),
      appointmentTime: time,
      notes,
    });

    console.log(`📅 New Booking: ${name} - ${booking.serviceName} on ${date} at ${time}`);

    res.status(201).json({
      success: true,
      message: `Booking confirmed! We'll call ${phone} to confirm.`,
      bookingId: booking._id,
      data: {
        name: booking.name,
        service: booking.serviceName,
        date: booking.appointmentDate,
        time: booking.appointmentTime,
        status: booking.status,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- Get All Bookings (Admin) ----
exports.getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.service) filter.service = req.query.service;
    if (req.query.category) filter.serviceCategory = req.query.category;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ appointmentDate: 1, appointmentTime: 1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: bookings.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: bookings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- Get Today's Bookings (Admin) ----
exports.getTodaysBookings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await Booking.find({
      appointmentDate: { $gte: today, $lt: tomorrow },
    }).sort({ appointmentTime: 1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- Get Bookings by Date (Admin) ----
exports.getBookingsByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const bookings = await Booking.find({
      appointmentDate: { $gte: date, $lt: nextDay },
    }).sort({ appointmentTime: 1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- Get Single Booking (Admin) ----
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- Update Booking Status (Admin) ----
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, estimatedCost, finalCost, adminNotes, assignedTo, deliveryDate, isPaid, paymentMethod } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, estimatedCost, finalCost, adminNotes, assignedTo, deliveryDate, isPaid, paymentMethod },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---- Delete Booking (Admin) ----
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
