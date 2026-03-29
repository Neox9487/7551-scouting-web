import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TeamDetailPage = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);

    const fetchTeamRecords = () => {
        axios.get(`/api/team_records/${teamId}`)
            .then(res => setRecords(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchTeamRecords();
    }, [teamId]);

    const handleDelete = async (id) => {
        if (!window.confirm("確定要刪除這筆紀錄嗎？")) return;
        try {
            await axios.delete(`/api/delete_record/${id}`);
            setRecords(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            alert("刪除失敗");
        }
    };

    const stats = useMemo(() => {
        if (records.length === 0) return null;

        const totalAutoScore = records.reduce((sum, r) => sum + r.auto_max_score, 0);
        const maxAutoScore = Math.max(...records.map(r => r.auto_max_score));
        
        const strategyMap = {};
        records.forEach(r => {
            strategyMap[r.strategy] = (strategyMap[r.strategy] || 0) + 1;
        });
        const maxCount = Math.max(...Object.values(strategyMap));
        const topStrategies = Object.keys(strategyMap).filter(key => strategyMap[key] === maxCount);
        const mainStrategy = topStrategies.length > 1 ? "不固定" : topStrategies[0];

        return {
            avgScore: (totalAutoScore / records.length).toFixed(1),
            maxScore: maxAutoScore,
            mainStrategy: mainStrategy,
            totalMatches: records.length
        };
    }, [records]);

    return (
        <main className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0 }}>Team {teamId}</h1>
                <button className="view-btn" onClick={() => navigate('/scoreboard')}>BACK TO LIST</button>
            </div>

            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-label">平均自動進球</span>
                        <span className="stat-value">{stats.avgScore}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">最高自動進球</span>
                        <span className="stat-value">{stats.maxScore}</span>
                    </div>
                    <div className="stat-card highlight">
                        <span className="stat-label">主要打法</span>
                        <span className="stat-value">{stats.mainStrategy}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">總記錄場次</span>
                        <span className="stat-value">{stats.totalMatches}</span>
                    </div>
                </div>
            )}

            <h2 style={{ marginTop: '40px' }}>History Logs</h2>
            {records.length === 0 ? (
                <section className="card" style={{ textAlign: 'center' }}>暫無此隊伍的紀錄</section>
            ) : (
                records.map((r) => (
                    <div key={r.id} className="history-item">
                        <div className="history-header">
                            <div>
                                <span className="match-tag">{r.match_id || 'Practice'}</span>
                                <span className="time-tag" style={{ marginLeft: '10px' }}>
                                    {new Date(r.created_at).toLocaleString()}
                                </span>
                            </div>
                            <button 
                                className="delete-btn" 
                                style={{ padding: '2px 10px' }}
                                onClick={() => handleDelete(r.id)}
                            >
                                刪除
                            </button>
                        </div>
                        
                        <div className="history-content">
                            <div className="info-badge highlight">打法: <b>{r.strategy}</b></div>
                            <div className="info-badge">自動進球: <b>{r.auto_max_score}</b></div>
                            <div className="info-badge">自動吊掛: <b>{r.auto_climb}</b></div>
                            <div className="info-badge">Intake: <b>{r.intake}</b></div>
                            <div className="info-badge">固定投球: <b>{r.fixed_shot_pos}</b></div>
                            <div className="info-badge">吊掛層數: <b>{r.climb_level}</b></div>
                        </div>

                        {r.remark && (
                            <div className="history-remark">
                                <strong>備註:</strong> {r.remark}
                            </div>
                        )}
                    </div>
                ))
            )}
        </main>
    );
};

export default TeamDetailPage;