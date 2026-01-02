#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const documents = {};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve HTML files
  if (pathname === '/' || pathname === '/index.html' || pathname === '/app.html') {
    try {
      let content;
      try {
        content = fs.readFileSync(path.join(__dirname, 'simple.html'), 'utf8');
      } catch {
        content = fs.readFileSync(path.join(__dirname, 'app.html'), 'utf8');
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
      return;
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading HTML file');
      return;
    }
  }

  // API Health check
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // Get documents
  if (pathname === '/api/documents' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const items = Object.values(documents);
    res.end(JSON.stringify({ items, total: items.length }));
    return;
  }

  // Upload document
  if (pathname === '/api/documents/upload' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const doc = {
          id: Math.random().toString(36).substr(2, 9),
          fileName: data.fileName || 'document',
          documentType: data.documentType || 'invoice',
          status: 'completed',
          uploadedAt: new Date().toISOString(),
          extractedData: {}
        };
        documents[doc.id] = doc;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(doc));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request' }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});
