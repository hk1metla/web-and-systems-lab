const Event = require('../models/Event');

exports.getAttendeeHomePage = async (req, res) => {
  try {
    // For simulation, all events are available.
    const events = await Event.getPublishedEvents();
    const availableEvents = events; // all events are available
    const bookedEvents = [];         // no events booked yet
    res.render('attendee/index', { availableEvents, bookedEvents });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).send('Internal Server Error');
  }
};

exports.getEventDetails = async (req, res) => {
  try {
    const event = await Event.getEventById(req.params.id);
    if (!event) return res.status(404).send("Event not found");
    res.render('attendee/event', { event });
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).send('Internal Server Error');
  }
};

// New controller function for booking an event
exports.bookEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Here, implement your booking logic.
    // For simulation purposes, we'll simply return the event as "booked".
    const event = await Event.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Optionally, mark the event as booked for the current attendee.
    // For now, we simulate by returning the event data.
    // In a real application, you might update a booking table in your database.

    res.status(200).json({ message: "Booking preview only. No reservation has been saved.", event });
  } catch (err) {
    console.error('Error booking event:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
