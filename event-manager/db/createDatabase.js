const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'events.db');
const schemaPath = path.join(__dirname, 'db_schema.sql');

// Remove the database if it already exists (optional, for testing purposes)
if (fs.existsSync(dbPath) && !process.argv.includes('--reset')) {
  console.error('Database exists. Use --reset only for a disposable demo.');
  process.exit(1);
}
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Existing database removed.');
}

// Create a new SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error creating database:', err.message);
    process.exit(1);
  }
  console.log('Database created successfully.');
});

// Load and execute the schema
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema, (err) => {
  if (err) {
    console.error('Error executing schema:', err.message);
    process.exit(1);
  }
  console.log('Schema applied successfully.');

  // Insert initial seed data (optional)
  const seedData = `
    INSERT INTO events (title, description, date, full_price_tickets, concession_tickets, created_at, published_at)
    VALUES
    ('Yoga Class', 'Morning yoga session', '2025-01-15', 20, 10, '2025-01-12', '2025-01-13'),
    ('Art Workshop', 'Beginner art workshop', '2025-02-01', 15, 5, '2025-01-20', '2025-01-22');
  `;
  db.exec(seedData, (err) => {
    if (err) {
      console.error('Error inserting seed data:', err.message);
      process.exit(1);
    }
    console.log('Seed data inserted successfully.');
    db.close();
  });
});
