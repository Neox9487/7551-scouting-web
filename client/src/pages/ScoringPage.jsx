import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ScoutingPage = () => {
    const [teams, setTeams] = useState([]);
    const [form, setForm] = useState({
        team_number: '未選擇', 
        match_id: '', 
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
            .then(res => setTeams(res.data))
            .catch(err => console.error("無法取得隊伍清單"));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (form.team_number === '未選擇') return alert("請先選擇隊伍號碼！");

        const payload = {
            ...form,
            auto_max_score: form.auto_max_score === '' ? '' : Number(form.auto_max_score)
        };

        try {
            await axios.post('/api/save_data', payload);
            alert("資料儲存成功！");
            setForm(prev => ({ ...prev, match_id: '', remark: '', auto_max_score: 0 }));
        } catch (err) {
            alert("儲存失敗，請檢網路連線狀態");
        }
    };

    const blockInvalidChar = (e) => {
        if (['e', 'E', '+', '-', '.'].includes(e.key)) {
            e.preventDefault();
        }
    };

    return (
        <main className="container">
            <section className="card">
                <h2>基本資訊</h2>
                <div className="form-group">
                    <label>隊伍號碼</label>
                    <select name="team_number" value={form.team_number} onChange={handleChange}>
                        <option value="未選擇">-- 請選擇隊伍 --</option>
                        {teams.map(t => <option key={t.number} value={t.number}>{t.number}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>場次</label>
                    <input name="match_id" type="text" value={form.match_id} onChange={handleChange} />
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
                    <input name="auto_max_score" type="text" value={form.auto_max_score}  placeholder='0'
                        pattern="\d*" inputMode="numeric"
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
                    <label>打法</label>
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
                <textarea name="remark" rows="4" placeholder="其他細節..." value={form.remark} onChange={handleChange}></textarea>
            </section>

            <button className="submit-btn" onClick={handleSave} style={{ width: '100%', marginTop: '10px' }}>
                儲存紀錄
            </button>
        </main>
    );
};

export default ScoutingPage;