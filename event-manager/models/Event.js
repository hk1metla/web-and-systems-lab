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

exports.createEvent = (event) => {
  return new Promise((resolve, reject) => {
    const { title, description, date, full_price_tickets, concession_tickets } = event;
    console.log("Model - createEvent received event:", event);
    db.run(
      `INSERT INTO events (title, description, date, full_price_tickets, concession_tickets, created_at) 
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [title, description, date, full_price_tickets, concession_tickets],
      function (err) {
        if (err) {
          console.error("DB Insert Error:", err);
          return reject(err);
        }
        resolve(this.lastID);
      }
    );
  });
};


exports.updateEvent = (id, updatedEvent) => {
  return new Promise((resolve, reject) => {
    const { title, description, date, full_price_tickets, concession_tickets } = updatedEvent;
    db.run(
      `UPDATE events SET 
         title = ?, 
         description = ?, 
         date = ?, 
         full_price_tickets = ?, 
         concession_tickets = ?, 
         created_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, description, date, full_price_tickets, concession_tickets, id],
      function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this.changes);
      }
    );
  });
};

exports.deleteEvent = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM events WHERE id = ?', [id], function (err) {
      if (err) reject(err);
      resolve(this.changes);
    });
  });
};

exports.getPublishedEvents = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM events', (err, rows) => {
      if (err) {
        return reject(err);
      }
      // For demonstration, if you need to simulate a 'booked' flag, you may add it here.
      // For example, mark events with even IDs as booked:
      const events = rows.map(row => ({ ...row, booked: row.id % 2 === 0 }));
      resolve(events);
    });
  });
};