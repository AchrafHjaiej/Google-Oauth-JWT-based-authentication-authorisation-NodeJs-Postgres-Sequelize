require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  exposedHeaders: ['X-Total-Pages'],
}), express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

app.get('/api/courses', async (req, res) => {
  const { index } = req.query;
  const limit = 12;
  // Create a new client
  const client = await pool.connect();

  try {
    // Get total count of courses
    const countResult = await client.query('SELECT COUNT(*) FROM courses');
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    let courses;
    if (index) {
      const offset = (index - 1) * limit;
      courses = await client.query(`
        SELECT courses.*, CAST(ROUND(AVG(reviews.rating)::numeric, 2) AS FLOAT) AS avg_rating 
        FROM courses 
        LEFT JOIN "references" ON courses.id = "references".course_id 
        LEFT JOIN reviews ON "references".id = reviews.reference_id 
        GROUP BY courses.id 
        ORDER BY courses.id 
        LIMIT $1 OFFSET $2`, [limit, offset]);
      res.setHeader('X-Total-Pages', totalPages);
    } else {
      courses = await client.query(`
        SELECT courses.*, CAST(ROUND(AVG(reviews.rating)::numeric, 2) AS FLOAT) AS avg_rating 
        FROM courses 
        LEFT JOIN "references" ON courses.id = "references".course_id 
        LEFT JOIN reviews ON "references".id = reviews.reference_id 
        GROUP BY courses.id 
        ORDER BY courses.id`);
    }

    // Set total pages in the header

    res.status(200).json(courses.rows);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).send('Server error');
  } finally {
    // Always release the client back to the pool
    client.release();
  }
});





app.get('/api/instructors', async (req, res) => {
  const { index, language, location } = req.query;
  const limit = 12;
  const client = await pool.connect();

  try {

    if (index) {
      // Base count query and values
      let countQuery = 'SELECT COUNT(*) FROM users WHERE user_type = \'instructor\'';
      let values = [];
      // If there's a language query parameter, append it to the WHERE clause
      if (language) {
        countQuery += " AND language = $" + (values.length + 1);
        values.push(language);
      }

      if (location) {
        countQuery += " AND location = $" + (values.length + 1);
        values.push(location);
      }

      const countResult = await client.query(countQuery, values);
      const totalCount = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalCount / limit);


      const offset = (index - 1) * limit;

      // Base query for instructors
      let query = `
        SELECT u.id, u.display_name, u.language, u.display_img, u.location, u.bio, 
        CAST(ROUND(AVG(r.rating)::numeric, 2) AS FLOAT) AS average_rating
        FROM users u
        LEFT JOIN reviews r ON u.id = r.user_id
        WHERE u.user_type = 'instructor'
      `;

      values = [limit, offset];

      // If there's a language query parameter, append it to the WHERE clause
      if (language) {
        query += " AND u.language = $" + (values.length + 1);
        values.push(language);
      }

      if (location) {
        query += " AND u.location = $" + (values.length + 1);
        values.push(location);
      }

      query += `
        GROUP BY u.id
        LIMIT $1 OFFSET $2
      `;

      const instructors = await client.query(query, values);
      res.setHeader('X-Total-Pages', totalPages);
      res.json(instructors.rows);

    } else {
      const instructors = await client.query(`
        SELECT u.id, u.display_name, u.language, u.display_img, u.location, u.bio, 
        CAST(ROUND(AVG(r.rating)::numeric, 2) AS FLOAT) AS average_rating
        FROM users u
        LEFT JOIN reviews r ON u.id = r.user_id
        WHERE u.user_type = 'instructor'
        GROUP BY u.id
      `);

      res.json(instructors.rows);
    }

  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).send('Server error');
  } finally {
    client.release();
  }
});



app.put('/api/instructor', async (req, res) => {
  const client = await pool.connect();

  try {
    // const token = req.headers.authorization.split(' ')[1]; // Get token from authorization header
    // const decoded = jwt.verify(token, YOUR_SECRET_KEY); // Verify and decode the token
    // const userId = decoded.user_id; // Get the user_id from the decoded token
    const user_id = 41;
    const { profile, work, education } = req.body;

    // Begin a transaction
    await client.query('BEGIN');

    // Update the profile
    await client.query(`
      UPDATE users 
      SET location=$1, bio=$2, display_img=$3, language=$4 
      WHERE id=$5`,
      [profile.location, profile.bio, profile.display_img, profile.language, user_id]
    );

    // Delete existing courses, work, education, references and re-insert new ones
    const tables = ['courses', 'work', 'education'];
    for (let table of tables) {
      // Delete existing rows
      await client.query(`DELETE FROM ${table} WHERE user_id=$1`, [user_id]);
      await client.query(`DELETE FROM "references" WHERE user_id=$1`, [user_id]);

      // Insert new rows
      for (let item of req.body[table]) {
        let query = '';
        let values = [];
        switch (table) {
          case 'courses':
            query = 'INSERT INTO courses (user_id, name, certified, certification_file, certification_date, charge_rate, level, language, duration, description, img, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id;';
            values = [user_id, item.name, item.certified, item.certification_file, item.certification_date, item.charge_rate, item.level, item.language, item.duration, item.description, item.img, item.location];
            const res = await client.query(query, values);

            for (let ref of item.references) {
              query = 'INSERT INTO "references" (user_id, start_date, end_date, justification_file, course_id) VALUES ($1, $2, $3, $4, $5)';
              values = [user_id, ref.start_date, ref.end_date, ref.justficiation_file, res.rows[0].id];
              await client.query(query, values);
            }


            break;
          case 'work':
            query = 'INSERT INTO work (user_id, place, start_date, end_date, description) VALUES ($1, $2, $3, $4, $5)';
            values = [user_id, item.place, item.start_date, item.end_date, item.description];
            await client.query(query, values);
            break;
          case 'education':
            query = 'INSERT INTO education (user_id, place, start_date, end_date, description) VALUES ($1, $2, $3, $4, $5)';
            values = [user_id, item.place, item.start_date, item.end_date, item.description];
            await client.query(query, values);
            break;
        }

      }
    }


    // If all operations were successful, commit the transaction
    await client.query('COMMIT');

    res.status(200).json({ message: 'Instructor updated successfully' });
  } catch (err) {
    // If any operation fails, rollback the transaction
    await client.query('ROLLBACK');
    console.error('Error updating instructor:', err);
    res.status(500).send('Server error');
  } finally {
    client.release();
  }
});





app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
