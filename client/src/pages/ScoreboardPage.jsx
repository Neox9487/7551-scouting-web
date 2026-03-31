import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ScoreboardPage = () => {
    const [records, setRecords] = useState([]);
    const [filter, setFilter] = useState({ strategy: 'All', team: '' });
    const [sortKey, setSortKey] = useState('team_number');
    const [viewMode, setViewMode] = useState('summary');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/all_records')
            .then(res => setRecords(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleViewModeChange = (e) => {
        const newMode = e.target.value;
        setViewMode(newMode);
        
        if (newMode === 'summary') {
            if (sortKey === 'created_at' || sortKey === 'match_id') {
                setSortKey('avgScore');
            }
        } else {
            if (filter.strategy === '不固定') {
                setFilter(prev => ({ ...prev, strategy: 'All' }));
            }
            if (sortKey === 'avgScore') {
                setSortKey('created_at');
            }
        }
    };

    const filteredRecords = useMemo(() => {
        return records
            .filter(r => (filter.strategy === 'All' || r.strategy === filter.strategy))
            .filter(r => String(r.team_number).includes(filter.team))
            .sort((a, b) => {
                if (sortKey === 'match_id') {
                    if (a.match_type !== b.match_type) {
                        return a.match_type === 'practice' ? -1 : 1;
                    }
                    return Number(a.match_id) - Number(b.match_id);
                }
                if (sortKey === 'created_at') return new Date(b.created_at) - new Date(a.created_at);
                if (sortKey === 'team_number') return Number(a.team_number) - Number(b.team_number);
                return b[sortKey] - a[sortKey];
            });
    }, [records, filter, sortKey]);

    const teamSummary = useMemo(() => {
        const groups = {};
        const baseRecords = records.filter(r => String(r.team_number).includes(filter.team));

        baseRecords.forEach(r => {
            if (!groups[r.team_number]) {
                groups[r.team_number] = {
                    team_number: r.team_number,
                    totalScore: 0,
                    maxScore: 0,
                    count: 0,
                    latestTime: r.created_at,
                    latestMatchId: r.match_id,
                    latestMatchType: r.match_type,
                    strategies: {}
                };
            }
            const g = groups[r.team_number];
            g.totalScore += r.auto_max_score;
            g.maxScore = Math.max(g.maxScore, r.auto_max_score);
            g.count += 1;
            g.strategies[r.strategy] = (g.strategies[r.strategy] || 0) + 1;
            
            if (new Date(r.created_at) > new Date(g.latestTime)) {
                g.latestTime = r.created_at;
                g.latestMatchId = r.match_id;
                g.latestMatchType = r.match_type;
            }
        });

        return Object.values(groups).map(g => {
            const strategyCounts = Object.values(g.strategies);
            const maxCount = Math.max(...strategyCounts);
            const topStrategies = Object.keys(g.strategies).filter(key => g.strategies[key] === maxCount);
            const mainStrategy = topStrategies.length > 1 ? "不固定" : topStrategies[0];

            return {
                ...g,
                avgScore: (g.totalScore / g.count).toFixed(1),
                mainStrategy: mainStrategy
            };
        })
        .filter(t => filter.strategy === 'All' || t.mainStrategy === filter.strategy)
        .sort((a, b) => {
            if (sortKey === 'avgScore') return Number(b.avgScore) - Number(a.avgScore);
            if (sortKey === 'team_number') return Number(a.team_number) - Number(b.team_number);
            return b.maxScore - a.maxScore;
        });
    }, [records, filter, sortKey]);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("確定要刪除這筆紀錄嗎？")) return;
        try {
            await axios.delete(`/api/delete_record/${id}`);
            setRecords(prev => prev.filter(r => r.id !== id));
        } catch (err) { alert("刪除失敗"); }
    };

    return (
        <main className="container">
            <section className="card" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label>檢視模式</label>
                    <select value={viewMode} onChange={handleViewModeChange}>
                        <option value="summary">隊伍表現摘要</option>
                        <option value="all">所有場次紀錄</option>
                    </select>
                </div>

                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label>搜尋隊號</label>
                    <input 
                        type="text" 
                        placeholder="搜尋..." 
                        value={filter.team}
                        onChange={e => setFilter({...filter, team: e.target.value})} 
                    />
                </div>
                
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label>打法篩選</label>
                    <select value={filter.strategy} onChange={e => setFilter({...filter, strategy: e.target.value})}>
                        <option value="All">所有打法</option>
                        {['防守', '攻擊', '推球助攻', '給 human 球', '廢物'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                        {viewMode === 'summary' && <option value="不固定">不固定</option>}
                    </select>
                </div>

                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label>排序方式</label>
                    <select value={sortKey} onChange={e => setSortKey(e.target.value)}>
                        <option value="team_number">隊號</option>
                        {viewMode === 'all' ? (
                            <>
                                <option value="created_at">紀錄時間</option>
                                <option value="match_id">場次編號</option>
                            </>
                        ) : (
                            <option value="avgScore">平均自動進球</option>
                        )}
                        <option value="auto_max_score">最高自動進球</option>
                    </select>
                </div>
            </section>

            <div className="table-wrapper">
                {viewMode === 'all' ? (
                    <table>
                        <thead>
                            <tr>
                                <th>隊號</th><th>場次</th><th>位置</th><th>打法</th><th>自動進球</th><th>自動吊掛</th><th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map(r => (
                                <tr key={r.id} onClick={() => navigate(`/team/${r.team_number}`)}>
                                    <td>{r.team_number}</td>
                                    <td className='highlight'>{r.match_type === 'practice' ? "Prac" : "Qual"} {r.match_id}</td>
                                    <td className='highlight'>{r.station}</td>
                                    <td className='highlight'>{r.strategy}</td>
                                    <td>{r.auto_max_score}</td>
                                    <td>{r.auto_climb}</td>
                                    <td><button className="delete-btn" onClick={(e) => handleDelete(e, r.id)}>刪除</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>隊號</th><th>總場次</th><th>主要打法</th><th>平均自動進球</th><th>最高自動進球</th><th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamSummary.map(t => (
                                <tr key={t.team_number} onClick={() => navigate(`/team/${t.team_number}`)}>
                                    <td><b style={{fontSize: '1.1rem'}}>{t.team_number}</b></td>
                                    <td className='highlight'>{t.count}</td>
                                    <td className='highlight'>{t.mainStrategy}</td>
                                    <td style={{color: 'var(--pink)'}}><b>{t.avgScore}</b></td>
                                    <td>{t.maxScore}</td>
                                    <td><button className="view-btn" style={{padding: '4px 8px'}}>詳情</button></td>
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