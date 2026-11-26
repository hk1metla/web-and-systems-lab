// import_data.js

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const mysql = require('mysql2/promise');

// Database connection configuration (use the same as in app.js)
const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'movies', // Your MySQL user
    password: process.env.DB_PASSWORD || '', // Your MySQL password
    database: process.env.DB_NAME || 'movie_data', // The database you created
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool; // Declare pool globally or pass it around

async function connectDb() {
    try {
        pool = await mysql.createPool(dbConfig);
        console.log('Database pool created for data import.');
    } catch (err) {
        console.error('Failed to create database pool:', err.stack);
        process.exit(1);
    }
}

// Function to process Movies.csv (assuming you have one)
// If you don't have a separate movies.csv with detailed movie info,
// you might populate 'Movies' table just from movie_ids in credits.csv
async function importMovies(csvFilePath) {
    console.log(`Importing movies from ${csvFilePath}...`);
    const records = [];
    let processedCount = 0;

    await new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(parse({
                columns: true, // Treat first row as column headers
                skip_empty_lines: true
            }))
            .on('data', (record) => {
                // Adjust column names based on your actual movies.csv
                // Common fields: id, title, original_title, overview, budget, revenue, release_date, runtime, vote_average, vote_count, popularity
                records.push([
                    parseInt(record.id),
                    record.title || '', // Provide default empty string if title is missing
                    record.original_title || '',
                    record.overview || '',
                    record.tagline || null,
                    parseInt(record.budget) || 0,
                    parseInt(record.revenue) || 0,
                    record.release_date || null, // Ensure date format is 'YYYY-MM-DD'
                    parseInt(record.runtime) || null,
                    parseFloat(record.vote_average) || 0.0,
                    parseInt(record.vote_count) || 0,
                    parseFloat(record.popularity) || 0.0,
                    record.status || 'Released',
                    record.homepage || null,
                    record.imdb_id || null
                ]);
            })
            .on('end', async () => {
                try {
                    // Start a transaction for bulk insert
                    const connection = await pool.getConnection();
                    await connection.beginTransaction();

                    // Insert in batches for performance
                    const batchSize = 1000;
                    for (let i = 0; i < records.length; i += batchSize) {
                        const batch = records.slice(i, i + batchSize);
                        const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(','); // 15 columns
                        const query = `INSERT INTO Movies (movie_id, title, original_title, overview, tagline, budget, revenue, release_date, runtime, vote_average, vote_count, popularity, status, homepage, imdb_id) VALUES ${placeholders} ON DUPLICATE KEY UPDATE title=VALUES(title), original_title=VALUES(original_title), overview=VALUES(overview), tagline=VALUES(tagline), budget=VALUES(budget), revenue=VALUES(revenue), release_date=VALUES(release_date), runtime=VALUES(runtime), vote_average=VALUES(vote_average), vote_count=VALUES(vote_count), popularity=VALUES(popularity), status=VALUES(status), homepage=VALUES(homepage), imdb_id=VALUES(imdb_id)`;
                        
                        await connection.query(query, batch.flat());
                        processedCount += batch.length;
                        console.log(`  Processed ${processedCount}/${records.length} movie records.`);
                    }

                    await connection.commit();
                    connection.release();
                    console.log(`Successfully imported ${processedCount} movie records.`);
                    resolve();
                } catch (err) {
                    console.error('Error importing movies:', err);
                    reject(err);
                }
            })
            .on('error', (err) => {
                console.error('Error reading movies CSV:', err);
                reject(err);
            });
    });
}


// Function to process Credits.csv
async function importCredits(csvFilePath) {
    console.log(`Importing credits from ${csvFilePath}...`);
    const moviesSet = new Set(); // To store unique movie_ids to insert into Movies table if not present
    const peopleMap = new Map(); // To store unique person_ids and their details
    const castRecords = [];
    const crewRecords = [];

    let processedLines = 0;

    await new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(parse({
                columns: true,
                skip_empty_lines: true
            }))
            .on('data', (record) => {
                processedLines++;
                const movieId = parseInt(record.movie_id);
                moviesSet.add(movieId); // Add movie_id to the set

                try {
                    const castData = JSON.parse(record.cast);
                    for (const member of castData) {
                        const personId = parseInt(member.id);
                        if (!peopleMap.has(personId)) {
                            peopleMap.set(personId, {
                                gender: member.gender,
                                name: member.name,
                                profile_path: member.profile_path
                            });
                        }
                        castRecords.push([
                            movieId,
                            personId,
                            member.character,
                            member.credit_id,
                            parseInt(member.order)
                        ]);
                    }

                    const crewData = JSON.parse(record.crew);
                    for (const member of crewData) {
                        const personId = parseInt(member.id);
                        if (!peopleMap.has(personId)) {
                            peopleMap.set(personId, {
                                gender: member.gender,
                                name: member.name,
                                profile_path: member.profile_path
                            });
                        }
                        crewRecords.push([
                            movieId,
                            personId,
                            member.department,
                            member.job,
                            member.credit_id
                        ]);
                    }
                } catch (jsonErr) {
                    console.error(`Skipping record for movie_id ${movieId} due to JSON parsing error: ${jsonErr.message}`);
                }

                if (processedLines % 1000 === 0) {
                    console.log(`  Parsed ${processedLines} lines from credits CSV...`);
                }
            })
            .on('end', async () => {
                console.log(`Finished parsing credits CSV. Total lines: ${processedLines}`);
                try {
                    const connection = await pool.getConnection();
                    await connection.beginTransaction();

                    // Insert unique movie_ids (if not already from movies.csv)
                    console.log('Inserting unique movie_ids into Movies table...');
                    const movieIdsToInsert = Array.from(moviesSet).map(id => [id]);
                    const movieBatchSize = 1000;
                    for (let i = 0; i < movieIdsToInsert.length; i += movieBatchSize) {
                        const batch = movieIdsToInsert.slice(i, i + movieBatchSize);
                        const placeholders = batch.map(() => '(?)').join(',');
                        // Using INSERT IGNORE here so it doesn't fail if movie_id already exists from movies.csv
                        await connection.query(`INSERT IGNORE INTO Movies (movie_id) VALUES ${placeholders}`, batch.flat());
                    }
                    console.log(`  Inserted/ignored ${movieIdsToInsert.length} movie_ids.`);


                    // Insert unique people
                    console.log('Inserting unique people into People table...');
                    const peopleRecords = Array.from(peopleMap.values()).map((p, index) => {
                        const personId = Array.from(peopleMap.keys())[index]; // Get the original person_id
                        return [personId, p.gender, p.name, p.profile_path];
                    });
                    const peopleBatchSize = 1000;
                    for (let i = 0; i < peopleRecords.length; i += peopleBatchSize) {
                        const batch = peopleRecords.slice(i, i + peopleBatchSize);
                        const placeholders = batch.map(() => '(?, ?, ?, ?)').join(',');
                        // Use ON DUPLICATE KEY UPDATE for People in case a person appears with slightly different info
                        await connection.query(
                            `INSERT INTO People (person_id, gender, name, profile_path) VALUES ${placeholders}
                             ON DUPLICATE KEY UPDATE gender=VALUES(gender), name=VALUES(name), profile_path=VALUES(profile_path)`,
                            batch.flat()
                        );
                    }
                    console.log(`  Inserted/updated ${peopleRecords.length} people records.`);


                    // Insert Movie_Cast
                    console.log('Inserting movie cast records...');
                    const castBatchSize = 1000;
                    for (let i = 0; i < castRecords.length; i += castBatchSize) {
                        const batch = castRecords.slice(i, i + castBatchSize);
                        const placeholders = batch.map(() => '(?, ?, ?, ?, ?)').join(',');
                        await connection.query(
                            `INSERT INTO Movie_Cast (movie_id, person_id, character_name, credit_id, cast_order) VALUES ${placeholders}
                             ON DUPLICATE KEY UPDATE character_name=VALUES(character_name), cast_order=VALUES(cast_order)`,
                            batch.flat()
                        );
                    }
                    console.log(`  Inserted ${castRecords.length} cast records.`);


                    // Insert Movie_Crew
                    console.log('Inserting movie crew records...');
                    const crewBatchSize = 1000;
                    for (let i = 0; i < crewRecords.length; i += crewBatchSize) {
                        const batch = crewRecords.slice(i, i + crewBatchSize);
                        const placeholders = batch.map(() => '(?, ?, ?, ?, ?)').join(',');
                        await connection.query(
                            `INSERT INTO Movie_Crew (movie_id, person_id, department, job, credit_id) VALUES ${placeholders}
                             ON DUPLICATE KEY UPDATE department=VALUES(department), job=VALUES(job)`,
                            batch.flat()
                        );
                    }
                    console.log(`  Inserted ${crewRecords.length} crew records.`);

                    await connection.commit();
                    connection.release();
                    console.log('Finished importing credits data.');
                    resolve();
                } catch (err) {
                    await connection.rollback(); // Rollback on error
                    connection.release();
                    console.error('Error during database insertion of credits:', err);
                    reject(err);
                }
            })
            .on('error', (err) => {
                console.error('Error reading credits CSV:', err);
                reject(err);
            });
    });
}

// Main execution function
async function main() {
    await connectDb();

    // IMPORTANT: Replace these with the actual paths to your CSV files.
    // Make sure these CSV files are in the same directory as this script,
    // or provide the full path to them.
    const moviesCsvPath = path.join(__dirname, 'movies.csv'); // e.g., tmdb_5000_movies.csv
    const creditsCsvPath = path.join(__dirname, 'credits.csv'); // e.g., tmdb_5000_credits.csv

    // Step 1: Import main movie data (if you have a movies.csv)
    // If you only have credits.csv, the movie_ids will be added by the credits import
    if (fs.existsSync(moviesCsvPath)) {
        await importMovies(moviesCsvPath);
    } else {
        console.warn(`'${moviesCsvPath}' not found. Only importing movie_ids from credits.csv.`);
    }

    // Step 2: Import credits data (cast and crew)
    if (fs.existsSync(creditsCsvPath)) {
        await importCredits(creditsCsvPath);
    } else {
        console.error(`CRITICAL: '${creditsCsvPath}' not found. Cannot import credits data.`);
        process.exit(1);
    }

    // Close the connection pool when done
    if (pool) {
        await pool.end();
        console.log('Database connection pool closed.');
    }
    console.log('Data import process completed.');
}

main().catch(console.error);