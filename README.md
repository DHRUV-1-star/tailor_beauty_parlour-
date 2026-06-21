# 💎 Shringar - Ladies Tailoring & Beauty Parlour

A full-stack website for a ladies tailoring and beauty parlour business.

## Project Structure
```
tailor_beauty_parlour-/
├── frontend/
│   ├── index.html          # Home page
│   ├── services.html       # Services page
│   ├── gallery.html        # Gallery page
│   ├── booking.html        # Appointment booking
│   ├── contact.html        # Contact page
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   └── js/
│       └── main.js         # Frontend JavaScript
├── backend/
│   ├── server.js           # Express server entry point
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── models/
│   │   ├── Booking.js      # Booking schema
│   │   ├── Customer.js     # Customer schema
│   │   └── Service.js      # Service schema
│   ├── routes/
│   │   ├── bookingRoutes.js
│   │   ├── customerRoutes.js
│   │   └── serviceRoutes.js
│   ├── controllers/
│   │   ├── bookingController.js
│   │   └── customerController.js
│   ├── middleware/
│   │   └── auth.js
│   └── package.json
└── README.md
```

## Database: MongoDB (Recommended)
- **Why MongoDB?** Flexible schema, easy to store service options, customer profiles, bookings.
- Use **MongoDB Atlas** (cloud) for free hosting.

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT Tokens

## Setup Instructions
1. `cd backend && npm install`
2. Create `.env` file with MONGO_URI and JWT_SECRET
3. `npm start` - starts backend on port 5000
4. Open `frontend/index.html` in browser
