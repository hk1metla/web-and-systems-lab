const express = require('express');
const { getAttendeeHomePage, getEventDetails,bookEvent } = require('../controllers/attendeeController');
const router = express.Router();

router.get('/', getAttendeeHomePage);
router.get('/event/:id', getEventDetails);
router.post('/book/:id', bookEvent);

module.exports = router;
