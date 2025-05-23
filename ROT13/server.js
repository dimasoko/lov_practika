const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC = path.join(__dirname, 'public');

http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const file   = path.join(PUBLIC, decodeURI(urlPath));

  fs.readFile(file, (err, data) => {
    if (err) {
      // не нашли по файлу в пути - отдадим 404.html
      fs.readFile(path.join(PUBLIC, '404.html'), (e404, d404) => {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(d404 || '404 — Не найдено');
      });
      return;
    }
    const ext = path.extname(file);
    const mime = ext === '.css'  ? 'text/css' :
                 ext === '.js'   ? 'application/javascript' :
                                   'text/html';
    res.writeHead(200, { 'Content-Type': mime + '; charset=utf-8' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Сервер: http://localhost:${PORT}/`);
});