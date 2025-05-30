const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const PORT = 3000;
const PUBLIC = path.join(__dirname, 'public');
const API_BASE = 'https://dummyjson.com';

function fetchFromAPI(apiPath, callback) {
    const apiUrl = `${API_BASE}${apiPath}`;
    https.get(apiUrl, (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => {
        data += chunk;
        });
        apiRes.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            callback(null, jsonData);
        } catch (error) {
            callback(error, null);
        }
        });
    }).on('error', (error) => {
        callback(error, null);
    });
}
function serveStaticFile(filePath, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
        // отправляем 404 страницу
        fs.readFile(path.join(PUBLIC, '404.html'), (e404, d404) => {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(d404 || '404 — Не найдено');
        });
        return;
        }    
        const ext = path.extname(filePath);
        const mime = ext === '.css' ? 'text/css' :
                    ext === '.js' ? 'application/javascript' :
                    'text/html';
        
        res.writeHead(200, { 'Content-Type': mime + '; charset=utf-8' });
        res.end(data);
    });
}
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
    
    if (pathname.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        if (pathname === '/api/products') {
        if (query.q) {
            fetchFromAPI(`/products/search?q=${encodeURIComponent(query.q)}`, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Ошибка запроса к API' }));
                return;
            }
            res.writeHead(200);
            res.end(JSON.stringify(data));
            });
        } else {
            fetchFromAPI('/products', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Ошибка запроса к API' }));
                return;
            }
            res.writeHead(200);
            res.end(JSON.stringify(data));
            });
        }
        return;
    }    
    if (pathname.match(/^\/api\/products\/\d+$/)) {
        const productId = pathname.split('/')[3];
        fetchFromAPI(`/products/${productId}`, (err, data) => {
            if (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Ошибка запроса к API' }));
            return;
            }
            res.writeHead(200);
            res.end(JSON.stringify(data));
        });
        return;
    }
    
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'API маршрут не найден' }));
    return;
  }
    const urlPath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.join(PUBLIC, decodeURI(urlPath));
  
    serveStaticFile(filePath, res);
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});