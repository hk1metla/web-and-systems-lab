const sqlite3 = require('sqlite3').verbose();
const { dbPath } = require('../config/config');

const db = new sqlite3.Database(dbPath);

// Retrieve a user by ID
exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};

// Create a new user
exports.createUser = (user) => {
  return new Promise((resolve, reject) => {
    const { username, password } = user;
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password],
      function (err) {
        if (err) reject(err);
        resolve(this.lastID);
      }
    );
  });
};

// Authenticate a user
exports.authenticateUser = (username, password) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      (err, row) => {
        if (err) reject(err);
        resolve(row);
      }
    );
  });
};
