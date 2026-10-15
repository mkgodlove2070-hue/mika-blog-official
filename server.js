import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sendHandler from './api/send.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;

  // Enhance res with Express-like helpers expected by Vercel serverless functions
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  res.send = function(body) {
    if (typeof body === 'object') {
      this.setHeader('Content-Type', 'application/json; charset=utf-8');
      this.end(JSON.stringify(body));
    } else {
      if (!this.getHeader('Content-Type')) {
        this.setHeader('Content-Type', 'text/plain; charset=utf-8');
      }
      this.end(body);
    }
    return this;
  };
  res.json = function(body) {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.end(JSON.stringify(body));
    return this;
  };

  // Route API
  if (pathname === '/api/send') {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', async () => {
      try {
        req.body = bodyData ? JSON.parse(bodyData) : {};
      } catch {
        req.body = bodyData;
      }
      try {
        await sendHandler(req, res);
      } catch (err) {
        if (!res.writableEnded) {
          res.status(500).send(err.message || 'Internal Server Error');
        }
      }
    });
    return;
  }

  if (pathname === '/api/send-email') {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', async () => {
      try {
        req.body = bodyData ? JSON.parse(bodyData) : {};
      } catch {
        req.body = bodyData;
      }
      try {
        const emailModule = await import('./api/send-email.js');
        await emailModule.default(req, res);
      } catch (err) {
        if (!res.writableEnded) {
          res.status(500).send(err.message || 'Internal Server Error');
        }
      }
    });
    return;
  }

  // Static files
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(__dirname, pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
