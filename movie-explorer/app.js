const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 3002);

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- ADD THIS LINE ---
console.log('Views directory set to:', path.join(__dirname, 'views'));
// ---------------------

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
// Database connection configuration
// IMPORTANT: Replace with your actual MySQL credentials
const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'movies', // Your MySQL user
    password: process.env.DB_PASSWORD || '', // Your MySQL password
    database: process.env.DB_NAME || 'movie_data' // The database you created
};

// Create a connection pool (recommended for web applications)
let pool;

async function initializeDatabase() {
    try {
        pool = await mysql.createPool(dbConfig);
        console.log('Connected to MySQL database!');
    } catch (err) {
        console.error('Failed to connect to MySQL:', err.stack);
        process.exit(1);
    }
}

// Call to initialize database connection when the app starts
initializeDatabase();

// --- Routes ---

// 1. Homepage
app.get('/', (req, res) => {
    // You can add a brief introduction or links to other sections here.
    res.render('index', { pageTitle: 'Movie Database Home' });
});

// 2. List Movies
// This route can be enhanced to include search functionality later if desired
app.get('/movies', async (req, res) => {
    try {
        // Fetching some movies to display. Adjust LIMIT as needed.
        // If your 'Movies' table has 'title', select that. For now, using movie_id.
        const [movies] = await pool.query('SELECT movie_id FROM Movies LIMIT 50');
        res.render('movies', { pageTitle: 'All Movies', movies: movies });
    } catch (err) {
        console.error('Error fetching movies:', err.stack);
        res.status(500).send('Error loading movies. Please check server logs.');
    }
});

// 3. Movie Details Page (including cast and crew)
app.get('/movie/:id', async (req, res) => {
    const movieId = req.params.id;

    try {
        // Check if movie exists (assuming 'Movies' table has just movie_id for now)
        const [movieRows] = await pool.query('SELECT movie_id FROM Movies WHERE movie_id = ?', [movieId]);
        if (movieRows.length === 0) {
            return res.status(404).render('movie_details', {
                pageTitle: 'Movie Not Found',
                movie: null,
                error: `Movie with ID ${movieId} not found.`
            });
        }
        const movie = movieRows[0]; // Get the movie object (currently just movie_id)

        // Fetch Cast
        const [cast] = await pool.query(`
            SELECT p.name AS actor_name, mc.character_name, mc.cast_order, p.profile_path, p.gender
            FROM Movie_Cast mc
            JOIN People p ON mc.person_id = p.person_id
            WHERE mc.movie_id = ?
            ORDER BY mc.cast_order ASC
        `, [movieId]);

        // Fetch Crew
        const [crew] = await pool.query(`
            SELECT p.name AS crew_name, mc.department, mc.job, p.profile_path, p.gender
            FROM Movie_Crew mc
            JOIN People p ON mc.person_id = p.person_id
            WHERE mc.movie_id = ?
            ORDER BY mc.department ASC, mc.job ASC
        `, [movieId]);

        res.render('movie_details', {
            pageTitle: `Details for Movie ID: ${movieId}`,
            movie: movie,
            cast: cast,
            crew: crew,
            error: null // No error
        });

    } catch (err) {
        console.error(`Error fetching details for movie ID ${movieId}:`, err.stack);
        res.status(500).render('movie_details', {
            pageTitle: 'Error',
            movie: null,
            error: `Could not retrieve details for movie ID ${movieId}.`
        });
    }
});

// --- Start the server ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`View all movies at http://localhost:${port}/movies`);
    console.log(`Example movie details: http://localhost:${port}/movie/862`);
});