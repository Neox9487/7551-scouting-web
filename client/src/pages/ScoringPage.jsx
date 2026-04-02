import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ScoringPage = () => {
    const [allMatches, setAllMatches] = useState([]);
    const [availableTeams, setAvailableTeams] = useState([]);
    
    const STATIONS = ["Red 1", "Red 2", "Red 3", "Blue 1", "Blue 2", "Blue 3"];

    const [form, setForm] = useState({
        match_id: '',
        team_number: '未選擇',
        station: '',
        auto_shot_pos: '',
        auto_max_score: 0,
        auto_climb: '無',
        fixed_shot_pos: '無',
        intake: '無',
        strategy: '防守',
        climb_level: '無吊掛',
        remark: ''
    });

    useEffect(() => {
        axios.get('/api/teams')
            .then(res => setAllMatches(res.data))
            .catch(err => console.error("無法取得場次資料"));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'match_id') {
            const selectedMatchObj = allMatches.find(m => String(m.match) === value);
            if (selectedMatchObj) {
                setAvailableTeams(selectedMatchObj.teams);
                setForm(prev => ({ 
                    ...prev, 
                    match_id: value, 
                    team_number: '未選擇', 
                    station: '' 
                }));
            } else {
                setAvailableTeams([]);
                setForm(prev => ({ ...prev, match_id: '', team_number: '未選擇', station: '' }));
            }
        } else if (name === 'team_index') {
            const index = parseInt(value);
            if (index === -1) {
                setForm(prev => ({ ...prev, team_number: '未選擇', station: '' }));
            } else {
                setForm(prev => ({ 
                    ...prev, 
                    team_number: availableTeams[index], 
                    station: STATIONS[index] 
                }));
            }
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        if (!form.match_id) return alert("請選擇場次！");
        if (form.team_number === '未選擇') return alert("請選擇隊伍！");

        const payload = {
            ...form,
            auto_max_score: form.auto_max_score === '' ? 0 : Number(form.auto_max_score)
        };

        try {
            await axios.post('/api/save_data', payload);
            alert(`儲存成功!`);
            
            setForm(prev => ({ 
                ...prev, 
                team_number: '未選擇', 
                station: '', 
                auto_max_score: 0, 
                remark: '' 
            }));
        } catch (err) {
            alert("儲存失敗: " + (err.response?.data?.error || err.message));
        }
    };

    const blockInvalidChar = (e) => {
        if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
    };

    return (
        <main className="container">
            <section className="card">
                <h2>基本資訊</h2>
                
                <div className="form-group">
                    <label>場次</label>
                    <select name="match_id" value={form.match_id} onChange={handleChange}>
                        <option value="">-- 請選擇場次 --</option>
                        {allMatches.map(m => (
                            <option key={m.match} value={m.match}>Match {m.match}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>隊伍位置</label>
                    <select 
                        name="team_index" 
                        value={availableTeams.indexOf(form.team_number)} 
                        onChange={handleChange}
                        disabled={!form.match_id}
                    >
                        <option value="-1">-- 請選擇隊伍 --</option>
                        {availableTeams.map((team, idx) => (
                            <option key={idx} value={idx}>
                                {STATIONS[idx]}: {team}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <section className="card">
                <h2>自動階段</h2>
                <div className="form-group">
                    <label>自動投球點</label>
                    <input name="auto_shot_pos" type="text" value={form.auto_shot_pos} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>自動最高進球數</label>
                    <input 
                        name="auto_max_score" 
                        type="text" 
                        value={form.auto_max_score}
                        pattern="\d*" 
                        inputMode="numeric"
                        onKeyDown={blockInvalidChar}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^\d+$/.test(val)) {
                                setForm({ ...form, auto_max_score: val === '' ? '' : parseInt(val) });
                            }
                        }}
                    />
                </div>
                <div className="form-group">
                    <label>自動吊掛</label>
                    <select name="auto_climb" value={form.auto_climb} onChange={handleChange}>
                        <option value="無">無</option>
                        <option value="有">有</option>
                    </select>
                </div>
            </section>
            
            <section className="card">
                <h2>賽場表現</h2>
                <div className="form-group">
                    <label>主要打法</label>
                    <select name="strategy" value={form.strategy} onChange={handleChange}>
                        <option value="防守">防守</option>
                        <option value="攻擊">攻擊</option>
                        <option value="推球助攻">推球助攻</option>
                        <option value="給human球">給 human 球</option>
                        <option value="廢物">廢物</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>固定投球點</label>
                    <select name="fixed_shot_pos" value={form.fixed_shot_pos} onChange={handleChange}>
                        <option value="無">無</option>
                        <option value="有">有</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Intake</label>
                    <select name="intake" value={form.intake} onChange={handleChange}>
                        <option value="無">無</option>
                        <option value="有">有</option>
                        <option value="有但可伸縮">有但可伸縮</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>吊掛層數</label>
                    <select name="climb_level" value={form.climb_level} onChange={handleChange}>
                        <option value="無吊掛">無吊掛</option>
                        <option value="L1">L1</option>
                        <option value="L2">L2</option>
                        <option value="L3">L3</option>
                    </select>
                </div>
            </section>

            <section className="card">
                <label>補充說明</label>
                <textarea 
                    name="remark" 
                    rows="4" 
                    placeholder="其他細節..." 
                    value={form.remark} 
                    onChange={handleChange}
                ></textarea>
            </section>

            <button className="submit-btn" onClick={handleSave} style={{ width: '100%', marginTop: '10px', marginBottom: '40px' }}>
                儲存紀錄
            </button>
        </main>
    );
};

export default ScoringPage;