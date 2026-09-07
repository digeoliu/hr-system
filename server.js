const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// 初始化資料庫檔案（如果不存在就建立預設的員工資料）
if (!fs.existsSync(DB_FILE)) {
    const defaultDB = [
        {
            name: "HR 管理者",
            email: "ane32000@gmail.com",
            userType: "hr",
            role: "admin",
            boss: "無(最高主管)",
            pwd: "123456",
            isFirstLogin: true,
            status: "active",
            formLocks: { tab1: "draft", tab2: "draft", tab3: "draft" },
            data: { tab1: { work: [] }, tab2: { Q1: [], Q2: [], Q3: [] }, tab3: { scores: { self: [], boss: [] }, empFeedback: "", bossComments: "" } }
        }
        // 其他預設資料可由前端初始化時同步
    ];
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), 'utf-8');
}

const server = http.createServer((req, res) => {
    // 允許跨來源請求 (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 取得資料庫資料 API
    if (req.method === 'GET' && req.url === '/api/db') {
        fs.readFile(DB_FILE, 'utf-8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "讀取資料庫失敗" }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(data);
        });
    }
    // 儲存資料庫資料 API
    else if (req.method === 'POST' && req.url === '/api/db') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                // 驗證是否為合法 JSON
                JSON.parse(body);
                fs.writeFile(DB_FILE, body, 'utf-8', err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: "寫入失敗" }));
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ success: true }));
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: "格式錯誤" }));
            }
        });
    }
    // 載入前端網頁
    else {
        let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                return;
            }
            let ext = path.extname(filePath);
            let contentType = 'text/html';
            if (ext === '.css') contentType = 'text/css';
            if (ext === '.js') contentType = 'application/javascript';
            
            res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
            res.end(content);
        });
    }
});

server.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(` 績效管理系統本地伺服器已成功啟動！`);
    console.log(` 本機瀏覽器請輸入: http://localhost:${PORT}`);
    console.log(`========================================\n`);
});