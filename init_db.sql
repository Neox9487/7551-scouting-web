CREATE DATABASE IF NOT EXISTS frc_scouting;
USE frc_scouting;

CREATE TABLE IF NOT EXISTS records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_number VARCHAR(20) NOT NULL,
    match_type ENUM('practice', 'qualification') DEFAULT 'practice',
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