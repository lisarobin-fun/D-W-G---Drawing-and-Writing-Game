const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function sendFile(res, filePath, fallbackToIndex = false) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (fallbackToIndex) {
        return sendFile(res, path.join(ROOT, 'index.html'), false);
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const safePath = decodeURIComponent(req.url.split('?')[0]);
  const requested = safePath === '/' ? '/index.html' : safePath;
  const normalized = path.normalize(requested).replace(/^\.+/, '');
  const filePath = path.join(ROOT, normalized);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  const shouldFallback = path.extname(filePath) === '';
  sendFile(res, filePath, shouldFallback);
});

server.listen(PORT, () => {
  console.log(`Denan's Stylus Adventure running on http://0.0.0.0:${PORT}`);
});
