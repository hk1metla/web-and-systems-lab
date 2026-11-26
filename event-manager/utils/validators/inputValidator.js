const { body, validationResult } = require('express-validator');

// Middleware to validate and sanitize event creation/edit inputs
exports.validateEvent = [
  // Validate and sanitize fields
  body('title').trim().notEmpty().withMessage('Title is required').escape(),
  body('description').trim().notEmpty().withMessage('Description is required').escape(),
  body('date').isISO8601().withMessage('Invalid date format').toDate(),
  body('full_price_tickets')
    .isInt({ min: 0 })
    .withMessage('Full-price tickets must be a positive integer'),
  body('concession_tickets')
    .isInt({ min: 0 })
    .withMessage('Concession tickets must be a positive integer'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  // Middleware to handle validation errors
  (req, res, next) => {
    console.log("request body:::",req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
