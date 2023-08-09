require('dotenv').config(); // Load environment variables from .env file

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: 'localhost',
  password: process.env.DB_PASSWORD,
  port: 5432,
});


async function createDatabaseAndTables() {
  try {
    const res = await pool.query("SELECT datname FROM pg_catalog.pg_database WHERE datname = 'stage'");

    if (res.rows.length === 0) {
      await pool.query(`CREATE DATABASE stage`);
    }

    const client = new Pool({
      user: process.env.DB_USER,
      host: 'localhost',
      database: 'stage',
      password: process.env.DB_PASSWORD,
      port: 5432,
    });


    // Create the "users" table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        display_name VARCHAR(255) NOT NULL,
        display_img TEXT,
        location VARCHAR(255),
        bio TEXT,
        user_type VARCHAR(20) CHECK(user_type IN ('buyer', 'instructor')),
        language VARCHAR(20)
      )
    `);

    // Create the "work" table
    await client.query(`
      CREATE TABLE IF NOT EXISTS work (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        place VARCHAR(255) NOT NULL,
        start_date DATE,
        end_date DATE,
        description TEXT
      )
    `);

    // Create the "education" table
    await client.query(`
      CREATE TABLE IF NOT EXISTS education (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        place VARCHAR(255) NOT NULL,
        start_date DATE,
        end_date DATE,
        description TEXT
      )
    `);

    // Create the "courses" table
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        duration INTEGER,
        certified BOOLEAN,
        certification_file TEXT,
        certification_date DATE,
        charge_rate FLOAT,
        level SMALLINT,
        language VARCHAR(20),
        img TEXT,
        description TEXT
      )
    `);

    // Create the "references" table
    await client.query(`
    CREATE TABLE IF NOT EXISTS "references" (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      client_id INTEGER REFERENCES users(id),
      course_id INTEGER REFERENCES courses(id),
      start_date DATE,
      end_date DATE,
      justification_file TEXT
    )
  `);

    // Create the "reviews" table
    await client.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      reference_id INTEGER REFERENCES "references"(id),
      client VARCHAR(255) NOT NULL,
      review_date DATE,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comments TEXT
    )
  `);

    console.log('Database and tables created successfully!');
  } catch (err) {
    console.error('Error creating database and tables:', err);
  } finally {
    await pool.end();
  }
}

createDatabaseAndTables();
