const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

async function initDB() {
    try {
        await pool.query('CREATE DATABASE IF NOT EXISTS frc_scouting');
        await pool.query('USE frc_scouting');
        
        const createTableSql = `
            CREATE TABLE IF NOT EXISTS records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                team_number VARCHAR(20) NOT NULL,
                match_id INT NOT NULL,
                match_type ENUM('practice', 'qualification') DEFAULT 'practice',
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
        console.log('資料庫與資料表初始化成功');
    } catch (err) {
        console.error('資料庫初始化失敗:', err);
    }
}

initDB();

app.get('/api/teams', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'matches.json');
        const data = await fs.readFile(filePath, 'utf8');
        const matchData = JSON.parse(data);
        res.json(matchData);
    } catch (err) {
        console.error('讀取 matches.json 失敗:', err);
        res.json({ practice: [], qualification: [] }); 
    }
});

app.post('/api/save_data', async (req, res) => {
    try {
        const d = req.body;
        const sql = `INSERT INTO records 
        (team_number, match_id, match_type, station, auto_shot_pos, auto_max_score, auto_climb, fixed_shot_pos, intake, strategy, climb_level, remark) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await pool.execute(sql, [
            d.team_number, d.match_id, d.match_type, d.station, d.auto_shot_pos, d.auto_max_score, 
            d.auto_climb, d.fixed_shot_pos, d.intake, d.strategy, d.climb_level, d.remark
        ]);
        res.status(201).json({ message: "儲存成功" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/all_records', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM records ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/team_records/:number', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM records WHERE team_number = ? ORDER BY created_at DESC', [req.params.number]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/delete_record/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const sql = 'DELETE FROM records WHERE id = ?';
        const [result] = await pool.execute(sql, [id]);

        if (result.affectedRows > 0) {
            res.json({ message: "紀錄已刪除" });
        } else {
            res.status(404).json({ error: "找不到該筆紀錄" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(3001, () => console.log('Server running on 3001'));