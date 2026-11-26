const Event = require('../models/Event');

// Get all events for organizer homepage
exports.getOrganizerHomePage = async (req, res) => {
  try {
    const events = await Event.getAllEvents();
    res.render('organizer/index', { events });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Render edit event page
exports.editEvent = async (req, res) => {
  try {
    const event = await Event.getEventById(req.params.id);
    res.render('organizer/editEvent', { event });
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  console.log("createEvent - req.body:", req.body); // Log incoming data
  try {
    const { title, description, date, full_price_tickets, concession_tickets } = req.body;

    // Validate required fields
    if (!title || !description || !date || full_price_tickets == null || concession_tickets == null) {
      console.error("createEvent - Missing required fields!");
      return res.status(400).json({ error: "All fields are required." });
    }

    await Event.createEvent({
      title,
      description,
      date,
      full_price_tickets,
      concession_tickets,
    });

    res.status(201).json({ message: "Event created successfully." });
  } catch (err) {
    console.error('createEvent - Error creating event:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, description, date, full_price_tickets, concession_tickets } = req.body;
    await Event.updateEvent(eventId, {
      title,
      description,
      date,
      full_price_tickets,
      concession_tickets,
    });
    res.redirect('/organiser');
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    await Event.deleteEvent(eventId);
    res.redirect('/organiser');
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).send('Internal Server Error');
  }
};

// File: models/Event.js
const sqlite3 = require('sqlite3').verbose();
const { dbPath } = require('../config/config');

const db = new sqlite3.Database(dbPath);

exports.getAllEvents = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM events', (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

exports.getEventById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM events WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};


// Create a new event
exports.createEvent = async (req, res) => {
  // Log the incoming request body
  console.log("createEvent - req.body:", req.body);

  try {
    // Destructure properties from req.body
    const { title, description, date, full_price_tickets, concession_tickets } = req.body;
    
    // Validate required fields (you could use express-validator as well)
    if (!title || !description || !date || full_price_tickets == null || concession_tickets == null) {
      console.error("createEvent - Missing required fields!");
      return res.status(400).json({ error: "All fields are required." });
    }
    
    // Pass the object to the model function
    const eventId = await Event.createEvent({
      title,
      description,
      date,
      full_price_tickets,
      concession_tickets,
    });
    
    // Optionally, you can fetch the newly created event and send it back
    const newEvent = await Event.getEventById(eventId);
    
    res.status(201).json({ message: "Event created successfully.", event: newEvent });
  } catch (err) {
    console.error("createEvent - Error creating event:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, description, date, full_price_tickets, concession_tickets } = req.body;
    
    if (!title || !description || !date || full_price_tickets == null || concession_tickets == null) {
      return res.status(400).json({ error: "All fields are required." });
    }
    
    await Event.updateEvent(eventId, {
      title,
      description,
      date,
      full_price_tickets,
      concession_tickets,
    });
    
    // Optionally, fetch the updated event to return
    const updatedEvent = await Event.getEventById(eventId);
    
    res.status(200).json({ message: "Event updated successfully.", event: updatedEvent });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    await Event.deleteEvent(eventId);
    res.status(200).json({ message: "Event deleted successfully." });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
