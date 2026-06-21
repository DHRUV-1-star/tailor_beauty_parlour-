// ============================================
// routes/contactRoutes.js - Contact Form
// ============================================

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

// Simple rate limit for contact form
const contactLimiter = require('express-rate-limit')({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many messages sent. Please try again in an hour.' },
});

// POST /api/contact
router.post(
  '/',
  contactLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),
    body('email').optional().isEmail().withMessage('Invalid email'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, message } = req.body;

    // Log the message (always works without email config)
    console.log('\n📩 New Contact Message:');
    console.log(`   Name: ${name}`);
    console.log(`   Email: ${email || 'Not provided'}`);
    console.log(`   Phone: ${phone || 'Not provided'}`);
    console.log(`   Message: ${message}`);
    console.log('');

    // Send email (only if email config is provided)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Shringar Website" <${process.env.EMAIL_USER}>`,
          to: process.env.BUSINESS_EMAIL || process.env.EMAIL_USER,
          subject: `New Contact from ${name} - Shringar Website`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h2 style="color: #b5427a;">New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email || 'Not provided'}</p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <hr/>
              <p><strong>Message:</strong></p>
              <p style="background: #f5f5f5; padding: 15px; border-radius: 8px;">${message}</p>
              <hr/>
              <p style="color: #999; font-size: 12px;">Sent from Shringar website contact form</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Email send failed (message still logged):', emailErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Thank you for your message! We will get back to you shortly.',
    });
  }
);

module.exports = router;
