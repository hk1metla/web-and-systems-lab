const express = require('express');
const {
  getOrganizerHomePage,
  editEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/organizerController');
const { validateEvent } = require('../utils/validators/inputValidator'); // Import the validator

const router = express.Router();

// Routes for CRUD operations
router.get('/', getOrganizerHomePage); // Organizer homepage
router.get('/edit/:id', editEvent); // Edit event page
router.post('/create', validateEvent, createEvent); // Create new event
router.post('/edit/:id', validateEvent, updateEvent); // Update existing event
router.delete('/delete/:id', deleteEvent); // Delete an event

module.exports = router;