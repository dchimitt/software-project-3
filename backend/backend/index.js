const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

// const { scrapeEvents } = require('./scrapeEvents');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MySQL Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'student_life'
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to MySQL Database');
    }
});

// Routes

// Get all events (sorted ascending by event date)
app.get('/events', (req, res) => {
    db.query('SELECT * FROM events ORDER BY event_date ASC', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Register a student for an event
app.post('/register', (req, res) => {
    const { firstName, middleName, lastName, studentID, eventID } = req.body;

    if (!firstName || !lastName || !studentID || !eventID) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const checkSql = 'SELECT * FROM registrations WHERE student_id = ? AND event_id = ?';
    db.query(checkSql, [studentID, eventID], (checkErr, checkResults) => {
        if (checkErr) {
            return res.status(500).json({ message: 'Error checking registration' });
        }

        if (checkResults.length > 0) {
            return res.status(400).json({ message: 'Student already registered for this event' });
        }

        const sql = 'INSERT INTO registrations (first_name, middle_name, last_name, student_id, event_id) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [firstName, middleName, lastName, studentID, eventID], (err, result) => {
            if (err) {
                console.error('Registration insert error:', err);
                return res.status(500).json({ message: 'Registration failed' });
            }

            res.status(200).json({ message: 'Registration successful' });
        });
    });
});






app.post('/add-event', (req, res) => {
    const { event_name, abstract, event_date, location, cost } = req.body;

    // Step 1: Check if event already exists
    const checkSql = 'SELECT * FROM events WHERE event_name = ? AND event_date = ?';
    db.query(checkSql, [event_name, event_date], (checkErr, checkResults) => {
        if (checkErr) {
            console.error('Error checking event existence:', checkErr);
            return res.status(500).json({ message: 'Error checking event existence' });
        }

        if (checkResults.length > 0) {
            return res.status(400).json({ message: 'Event already exists on that date' });
        }

        // Step 2: If not duplicate, insert new event
        const sql = 'INSERT INTO events (event_name, abstract, event_date, location, cost) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [event_name, abstract, event_date, location, cost], (err, result) => {
            if (err) {
                console.error('Error adding manual event:', err);
                res.status(500).json({ message: 'Failed to add event' });
            } else {
                console.log(`✅ Manual event added: ${event_name}`);
                res.status(200).json({ message: 'Event added successfully' });
            }
        });
    });
});


app.get('/my-registrations/:studentID', (req, res) => {
    const studentID = req.params.studentID;

    const sql = `
        SELECT events.id, events.event_name, events.event_date, events.location
        FROM registrations
        JOIN events ON registrations.event_id = events.id
        WHERE registrations.student_id = ?
    `;

    db.query(sql, [studentID], (err, results) => {
        if (err) {
            console.error('Error fetching registered events:', err);
            res.status(500).json({ message: 'Error fetching registrations' });
        } else {
            res.status(200).json(results);
        }
    });
});



// Get registered students
app.get('/registrations', (req, res) => {
    db.query('SELECT * FROM registrations', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    // scrapeEvents();
});
