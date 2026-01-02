#!/usr/bin/env node
import http from 'http';

const PORT = 3000;

const server = http.createServer((req, res) => {
  console.log('Request:', req.method, req.url);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  if (req.url === '/') {
    res.writeHead(200);
    res.end('<h1>Hello! Server Works!</h1><p><a href="/login">Go to App</a></p>');
  } else if (req.url === '/login') {
    res.writeHead(200);
    res.end('<h1>Login Page</h1><input type="text" placeholder="Username"><button>Login</button>');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
