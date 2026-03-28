import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ScoreboardPage = () => {
    const [records, setRecords] = useState([]);
    const [filter, setFilter] = useState({ strategy: 'All', team: '' });
    const [sortKey, setSortKey] = useState('auto_max_score');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/all_records')
            .then(res => setRecords(res.data))
            .catch(err => console.error(err));
    }, []);

    const filteredRecords = useMemo(() => {
        return records
            .filter(r => (filter.strategy === 'All' || r.strategy === filter.strategy))
            .filter(r => String(r.team_number).includes(filter.team))
            .sort((a, b) => {
                if (sortKey === 'created_at') {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                if (sortKey === 'team_number') {
                    return Number(a.team_number) - Number(b.team_number);
                }
                return b[sortKey] - a[sortKey];
            });
    }, [records, filter, sortKey]);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("確定要刪除這筆紀錄嗎？此操作不可還原。")) return;

        try {
            await axios.delete(`/api/delete_record/${id}`);
            setRecords(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            alert("刪除失敗，請檢查後端連線");
        }
    };

    return (
        <main className="container">
            <h1>記分板 Leaderboard</h1>
            
            <section className="card" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label>搜尋隊號</label>
                    <input 
                        type="text" 
                        placeholder="輸入隊號..." 
                        value={filter.team}
                        onChange={e => setFilter({...filter, team: e.target.value})} 
                    />
                </div>
                
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label>打法</label>
                    <select value={filter.strategy} onChange={e => setFilter({...filter, strategy: e.target.value})}>
                        <option value="All">所有打法</option>
                        {['防守', '攻擊', '推球助攻', '給 human 球', '廢物'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label>排序</label>
                    <select value={sortKey} onChange={e => setSortKey(e.target.value)}>
                        <option value="auto_max_score">自動最高進球</option>
                        <option value="created_at">紀錄時間</option>
                        <option value="team_number">隊號</option>
                    </select>
                </div>
            </section>

            <div className="table-wrapper">
                {filteredRecords.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '50px', 
                        background: 'var(--card-bg)', 
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--text-dim)',
                        border: '1px dashed rgba(255, 102, 170, 0.3)'
                    }}>
                        <p style={{ fontSize: '1.2rem', margin: 0 }}>
                            <b style={{ color: 'var(--pink)' }}>沒有紀錄</b>
                        </p>
                        <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>請調整搜尋條件或新增場記資料</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>隊號</th>
                                <th>打法</th>
                                <th>自動進球</th>
                                <th>自動吊掛</th>
                                <th>Intake</th>
                                <th>吊掛層數</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map(r => (
                                <tr key={r.id} onClick={() => navigate(`/team/${r.team_number}`)}>
                                    <td><b>{r.team_number}</b></td>
                                    <td className='highlight'>{r.strategy}</td>
                                    <td>{r.auto_max_score}</td>
                                    <td>{r.auto_climb}</td>
                                    <td>{r.intake}</td>
                                    <td>{r.climb_level}</td>
                                    <td>
                                        <button 
                                            className="delete-btn"
                                            onClick={(e) => handleDelete(e, r.id)}
                                        >
                                            刪除
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </main>
    );
};

export default ScoreboardPage;