const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'frc_scouting',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// get team lists
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

// save new data
app.post('/api/save_data', async (req, res) => {
    try {
        const d = req.body;
        const sql = `INSERT INTO records 
        (team_number, match_id, match_type, station, auto_shot_pos, auto_max_score, auto_climb, fixed_shot_pos, intake, strategy, climb_level, remark) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.execute(sql, [
            d.team_number, d.match_id, d.match_type, d.station, d.auto_shot_pos, d.auto_max_score, 
            d.auto_climb, d.fixed_shot_pos, d.intake, d.strategy, d.climb_level, d.remark
        ]);
        res.status(201).json({ message: "儲存成功" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// get all records
app.get('/api/all_records', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM records ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// get target team records
app.get('/api/team_records/:number', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM records WHERE team_number = ? ORDER BY created_at DESC', [req.params.number]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// delete record
app.delete('/api/delete_record/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const sql = 'DELETE FROM records WHERE id = ?';
        
        const [result] = await db.execute(sql, [id]);

        if (result.affectedRows > 0) {
            console.log(`DELETE /api/delete_record/${id} - 刪除成功`);
            res.json({ message: "紀錄已刪除" });
        } else {
            res.status(404).json({ error: "找不到該筆紀錄" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(3001, () => console.log('Server running on 3001'));