const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const PUBLIC = path.join(__dirname, 'public');
const API_BASE = 'https://dummyjson.com';
const REQUEST_TIMEOUT = 10000; // 10 секунд таймаут

function fetchFromAPI(apiPath, callback) {
    if (!apiPath || typeof apiPath !== 'string') {
        return callback(new Error('Некорректный путь API'), null);
    }  
    const apiUrl = `${API_BASE}${apiPath}`;
    console.log('Запрос к API:', apiUrl);  
    const request = https.get(apiUrl, (apiRes) => {
        let data = '';    
        if (apiRes.statusCode < 200 || apiRes.statusCode >= 300) {
        console.error(`API вернул статус: ${apiRes.statusCode}`);
        return callback(new Error(`HTTP ${apiRes.statusCode}`), null);
        } 
        apiRes.on('data', (chunk) => {
        data += chunk;
        });    
        apiRes.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            console.log('Ответ API получен, товаров:', 
            jsonData.products ? jsonData.products.length : 
            (Array.isArray(jsonData) ? jsonData.length : 'неизвестно'));
            callback(null, jsonData);
        } catch (error) {
            console.error('Ошибка парсинга JSON:', error);
            callback(error, null);
        }
        });
    });
    request.setTimeout(REQUEST_TIMEOUT, () => {
        request.destroy();
        callback(new Error('Таймаут запроса к API'), null);
    }); 
    request.on('error', (error) => {
        console.error('Ошибка HTTPS запроса:', error);
        callback(error, null);
    });
    }
    function serveStaticFile(filePath, res) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
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
    console.log(`${req.method} ${pathname}`, query);  
    if (pathname.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');    
        if (pathname === '/api/products') {
        if (query.q && query.q.trim() !== '') {
            const searchQuery = query.q.trim();        
            if (searchQuery.length < 1 || searchQuery.length > 100) {
            res.writeHead(400);
            res.end(JSON.stringify({ 
                error: 'Поисковый запрос должен содержать от 1 до 100 символов' 
            }));
            return;
            }        
            console.log('Выполняем поиск по запросу:', searchQuery);
            fetchFromAPI(`/products/search?q=${encodeURIComponent(searchQuery)}`, (err, data) => {
            if (err) {
                console.error('Ошибка поиска:', err);
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Ошибка запроса к API поиска' }));
                return;
            }
            console.log('Результаты поиска получены, товаров:', 
                data.products ? data.products.length : 0);
            res.writeHead(200);
            res.end(JSON.stringify(data));
            });
        } else {
            console.log('Загружаем все товары');
            const limit = parseInt(query.limit) || 30; 
            const skip = parseInt(query.skip) || 0;        
            fetchFromAPI(`/products?limit=${Math.min(limit, 100)}&skip=${skip}`, (err, data) => {
            if (err) {
                console.error('Ошибка загрузки всех товаров:', err);
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Ошибка запроса к API товаров' }));
                return;
            }
            console.log('Все товары загружены, количество:', 
                data.products ? data.products.length : 0);
            res.writeHead(200);
            res.end(JSON.stringify(data));
            });
        }
        return;
        }    
        if (pathname.match(/^\/api\/products\/\d+$/)) {
        const productId = parseInt(pathname.split('/')[3]);
        
        if (isNaN(productId) || productId < 1) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Некорректный ID товара' }));
            return;
        }      
        console.log('Загружаем товар с ID:', productId);
        fetchFromAPI(`/products/${productId}`, (err, data) => {
            if (err) {
            console.error('Ошибка загрузки товара:', err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Ошибка запроса к API товара' }));
            return;
            }
            res.writeHead(200);
            res.end(JSON.stringify(data));
        });
        return;
        }    
        console.log('Неизвестный API маршрут:', pathname);
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'API маршрут не найден' }));
        return;
    } 
    const urlPath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.join(PUBLIC, decodeURI(urlPath));  
    if (!filePath.startsWith(PUBLIC)) {
        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('403 — Доступ запрещен');
        return;
    }
    
    serveStaticFile(filePath, res);
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
