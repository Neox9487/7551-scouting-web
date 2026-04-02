require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const morgan = require('morgan');

const app = express();

const logger = {
    info: (msg) => console.log(`[${new Date().toLocaleString()}] INFO: ${msg}`),
    error: (msg, err) => console.error(`[${new Date().toLocaleString()}] ERROR: ${msg}`, err || '')
};

app.use(morgan('dev')); 
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

app.get('/api/teams', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'matches.json');
        const data = await fs.readFile(filePath, 'utf8');
        const matchData = JSON.parse(data);
        res.json(matchData);
    } catch (err) {
        logger.error('Failed to read matches.json', err);
        res.json([]); 
    }
});

app.post('/api/save_data', async (req, res) => {
    try {
        const d = req.body;
        const sql = `INSERT INTO records 
        (team_number, match_id, station, auto_shot_pos, auto_max_score, auto_climb, fixed_shot_pos, intake, strategy, climb_level, remark) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await pool.execute(sql, [
            d.team_number, d.match_id, d.station, d.auto_shot_pos, d.auto_max_score, 
            d.auto_climb, d.fixed_shot_pos, d.intake, d.strategy, d.climb_level, d.remark
        ]);
        
        logger.info(`Record added: Team ${d.team_number}, Match ${d.match_id}`);
        res.status(201).json({ message: "Data saved successfully" });
    } catch (err) { 
        logger.error('Failed to save record', err);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});

app.get('/api/all_records', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM records ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) { 
        logger.error('Failed to fetch all records', err);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});

app.get('/api/team_records/:number', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM records WHERE team_number = ? ORDER BY created_at DESC', [req.params.number]);
        res.json(rows);
    } catch (err) { 
        logger.error(`Failed to fetch records for Team ${req.params.number}`, err);
        res.status(500).json({ error: "Internal Server Error" }); 
    }
});

app.delete('/api/delete_record/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const [result] = await pool.execute('DELETE FROM records WHERE id = ?', [id]);

        if (result.affectedRows > 0) {
            logger.info(`Record deleted, ID: ${id}`);
            res.json({ message: "Record deleted successfully" });
        } else {
            res.status(404).json({ error: "Record not found" });
        }
    } catch (err) {
        logger.error(`Failed to delete record ID ${req.params.id}`, err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

const PORT = 3001;

async function initDB() {
    try {
        await pool.query('CREATE DATABASE IF NOT EXISTS frc_scouting');
        await pool.query('USE frc_scouting');
        
        const createTableSql = `
            CREATE TABLE IF NOT EXISTS records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                team_number VARCHAR(20) NOT NULL,
                match_id INT NOT NULL,
                station VARCHAR(50),
                auto_shot_pos VARCHAR(100),
                auto_max_score INT DEFAULT 0,
                auto_climb VARCHAR(20),
                fixed_shot_pos VARCHAR(20),
                intake VARCHAR(20),
                strategy VARCHAR(50),
                climb_level VARCHAR(20),
                remark TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await pool.query(createTableSql);
        logger.info('Database and table initialized successfully');
    } catch (err) {
        logger.error('Database initialization failed', err);
        process.exit(1); 
    }
}

async function startServer() {
    try {
        await initDB();
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (e) {
        logger.error('Server failed to start', e);
        process.exit(2);
    }
}

startServer();