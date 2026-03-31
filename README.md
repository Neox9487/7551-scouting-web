# 網站架設

## 前置動作
在電腦上安裝以下軟體來運行此網站：

- Node.js (https://nodejs.org/zh-tw/download) (建議使用 LTS 版本)
- Ngrok (https://ngrok.com/)
- MySQL (安裝教學：https://chwang12341.medium.com/mysql-%E5%AD%B8%E7%BF%92%E7%AD%86%E8%A8%98-%E4%BA%8C-%E4%B8%80%E5%88%86%E9%90%98%E8%BC%95%E9%AC%86%E7%9E%AD%E8%A7%A3%E5%A6%82%E4%BD%95%E5%9C%A8windows%E4%B8%8A%E5%AE%89%E8%A3%9Dmysql-63cce07c6a6c)

安裝完成後，打開 cmd 輸入以下指令確認是否成功安裝：

```
node -v
npm -v
ngrok -v
```

---

## 讓伺服器跑起來

> 請先確認 node、npm 與 ngrok 已安裝完成

1. 找到 `setup.bat` 並雙擊執行  
   出現 `Setup Complete!` 代表設置完成

2. 找到 `start.bat` 並雙擊執行，若出現 ngrok 畫面代表成功了  
   可以透過 ngrok 給你的隨機網址如 `https://xxxxx.ngrok-free.app` 來連到這個網站  

若想要用使用區域網路連線就好(不用 ngrok)，可以直接跑 `start_without_ngrok.bat` 跑伺服器  
只需連線到 `http://(伺服器電腦ip):3001`

> 注意 : 每次重開 start.bat，ngrok 都會給你一串新的隨機網址
 
---

## 手動架設伺服器

> 建議當 `setup.bat` 與 `start.bat` 無法執行或不穩定時，在自己手動架設伺服器

### 1. MySQL

打開 MySQL Command Line Client (可用 Windows 搜尋欄搜尋)  
輸入安裝時設定的密碼 (預設為空)

執行以下指令：

```sql
-- 建立資料庫
CREATE DATABASE IF NOT EXISTS frc_scouting;

-- 切換到該資料庫
USE frc_scouting;

-- 建立 records 資料表
CREATE TABLE IF NOT EXISTS records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_number VARCHAR(20) NOT NULL,
    match_id VARCHAR(50),
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
```

---

### 2. 編譯網頁

打開 cmd 輸入：

```bash
cd (專案資料夾位置)/client
npm install
npm run build
```

完成後會出現 `dist` 或 `build` 資料夾

---

### 3. 架設伺服器

打開 cmd 輸入：

```bash
cd (專案資料夾位置)/server
npm install
```

編輯 `server/index.js`，填入 MySQL 帳號密碼：

```js
user: '(你的帳號，預設為 root)',
password: '(你的密碼，預設為空)',
```

啟動伺服器：

```bash
cd (專案資料夾位置)/server
node index.js
```

---

### 4. 發佈到網際網路

打開 cmd 輸入：

```bash
ngrok http 3001
```

會取得網址如：

```
https://xxxxx.ngrok-free.app
```

其他人即可透過該網址連線

---

## 記分板

### 搜尋 / 排序 / 過濾

- 檢視模式：選擇顯示所有場次或隊伍摘要
- 搜索框：透過隊號搜尋
- 打法篩選：篩選特定打法
- 排序方式：依指定欄位排序

---

### 隊伍詳細資訊

點擊資料列可查看該隊伍詳細頁面

---

### 刪除資料

- 可在操作欄位點擊刪除
- 或在隊伍詳細頁的 HISTORY LOGS 中刪除場次紀錄