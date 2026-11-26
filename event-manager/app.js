const express = require('express');
const path = require('path');
const session = require('express-session');
const config = require('./config/config');
const attendeeRoutes = require('./routes/attendeeRoutes');
const organiserRoutes = require('./routes/organiserRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || require('crypto').randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
  })
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Root Route
app.get('/', (req, res) => {
  res.render('main', { title: 'Event Manager' });
});

// Routes
app.use('/attendee', attendeeRoutes);
app.use('/organiser', organiserRoutes);

// Start Server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
