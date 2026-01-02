#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// In-memory data storage
const data = {
  documents: {},
  users: {
    user1: { id: 'user1', username: 'john_reviewer', email: 'john@example.com', role: 'reviewer', password: 'pass123' },
    user2: { id: 'user2', username: 'admin_user', email: 'admin@example.com', role: 'admin', password: 'pass123' },
    user3: { id: 'user3', username: 'processor', email: 'proc@example.com', role: 'processor', password: 'pass123' }
  },
  auditLogs: [],
  documentTypes: [
    {
      id: 'invoice',
      name: 'Invoice',
      category: 'Financial',
      description: 'Standard invoice documents',
      extractionFields: [
        { id: 'invoice_num', label: 'Invoice Number', type: 'text' },
        { id: 'date', label: 'Invoice Date', type: 'date' },
        { id: 'vendor', label: 'Vendor Name', type: 'text' },
        { id: 'amount', label: 'Total Amount', type: 'currency' },
        { id: 'items', label: 'Line Items', type: 'array' }
      ]
    },
    {
      id: 'receipt',
      name: 'Receipt',
      category: 'Financial',
      description: 'Receipt documents',
      extractionFields: [
        { id: 'store_name', label: 'Store Name', type: 'text' },
        { id: 'purchase_date', label: 'Purchase Date', type: 'date' },
        { id: 'items', label: 'Items', type: 'array' },
        { id: 'total', label: 'Total Amount', type: 'currency' }
      ]
    },
    {
      id: 'contract',
      name: 'Contract',
      category: 'Legal',
      description: 'Contract documents',
      extractionFields: [
        { id: 'parties', label: 'Contract Parties', type: 'array' },
        { id: 'start_date', label: 'Start Date', type: 'date' },
        { id: 'end_date', label: 'End Date', type: 'date' },
        { id: 'terms', label: 'Key Terms', type: 'text' }
      ]
    }
  ]
};

// Helper functions
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function addAuditLog(userId, action, documentId, changes) {
  data.auditLogs.push({
    id: generateId(),
    userId,
    action,
    documentId,
    changes,
    timestamp: new Date().toISOString()
  });
}

function simulateAIProcessing(documentType, fileName) {
  const templates = {
    invoice: {
      invoice_num: 'INV-2024-001',
      date: '2024-01-15',
      vendor: 'Acme Corp',
      amount: '2500.00',
      items: ['Product A', 'Product B']
    },
    receipt: {
      store_name: 'Retail Store',
      purchase_date: '2024-01-10',
      items: ['Item 1', 'Item 2'],
      total: '125.50'
    },
    contract: {
      parties: ['Party A', 'Party B'],
      start_date: '2024-01-01',
      end_date: '2025-01-01',
      terms: 'Standard commercial terms'
    }
  };

  return {
    extractedData: templates[documentType] || {},
    confidence: Math.random() * 0.3 + 0.7,
    ocrText: `Extracted text from ${fileName}...`,
    entities: ['entity1', 'entity2'],
    processingStatus: 'completed'
  };
}

const server = http.createServer((req, res) => {
  let pathname = req.url.split('?')[0];
  let queryString = req.url.split('?')[1] || '';
  const query = {};
  if (queryString) {
    queryString.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      query[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve HTML
  if (pathname === '/' || pathname === '/index.html') {
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>AI Document Processor</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;padding:20px}
.container{max-width:1000px;margin:0 auto;background:white;border-radius:8px;padding:30px;box-shadow:0 8px 32px rgba(0,0,0,0.2)}h1{color:#2c3e50;margin-bottom:30px;text-align:center}
.section{margin-bottom:30px;padding:20px;background:#f8f9fa;border-radius:6px;border-left:4px solid #3498db}
.section h2{color:#2c3e50;margin-bottom:15px}.form-group{margin:15px 0}.form-group label{display:block;margin-bottom:8px;font-weight:bold;color:#2c3e50}
.form-group input,.form-group select{width:100%;padding:10px;border:1px solid #ddd;border-radius:4px}
button{background:#3498db;color:white;padding:10px 20px;border:none;border-radius:4px;cursor:pointer;font-weight:bold;margin-right:10px}
button:hover{background:#2980b9}button.success{background:#27ae60}button.success:hover{background:#229954}
.doc-item{background:white;padding:15px;margin:10px 0;border-left:4px solid #27ae60;border-radius:4px}.doc-item h3{color:#2c3e50;margin-bottom:5px}
.badge{display:inline-block;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:bold;margin:5px 0}.badge.pending{background:#f39c12;color:white}
.badge.approved{background:#27ae60;color:white}.login{max-width:400px;margin:50px auto;padding:30px;background:white;border-radius:8px;text-align:center}
.login h2{margin-bottom:20px;color:#2c3e50}.login input{display:block;width:100%;margin:10px 0;padding:10px;border:1px solid #ddd;border-radius:4px}
.msg{padding:12px;margin:15px 0;border-radius:4px}.success-msg{background:#d4edda;color:#155724}.error-msg{background:#f8d7da;color:#721c24}.hidden{display:none}
</style></head><body>
<div id="login" class="login"><h2>AI Document Processor</h2>
<input type="text" id="username" placeholder="Username" /><input type="password" id="password" placeholder="Password" />
<button onclick="doLogin()" style="width:100%;margin-top:15px">Login</button><p style="margin-top:15px;font-size:12px;color:#7f8c8d">Demo: john_reviewer / pass123</p></div>
<div id="app" class="hidden"><div class="container"><h1>AI Document Processor</h1><button onclick="doLogout()">Logout</button>
<div class="section"><h2>Upload Document</h2><input type="text" id="docName" placeholder="Document name" />
<select id="docType"><option>invoice</option><option>receipt</option><option>contract</option></select>
<button class="success" onclick="upload()">Upload</button><div id="msg"></div></div>
<div class="section"><h2>Documents</h2><input type="text" id="search" placeholder="Search..." onkeyup="loadDocs()" style="width:100%;padding:10px;margin-bottom:15px;" />
<div id="list"></div></div></div></div>
<script>const API='http://localhost:3000/api';let user=null;
function doLogin(){const u=document.getElementById('username').value,p=document.getElementById('password').value;
fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})})
.then(r=>r.json()).then(d=>{if(d.user){user=d.user;document.getElementById('login').classList.add('hidden');document.getElementById('app').classList.remove('hidden');loadDocs();}else alert('Login failed')}).catch(e=>alert(e));}
function doLogout(){user=null;document.getElementById('login').classList.remove('hidden');document.getElementById('app').classList.add('hidden');}
function upload(){const n=document.getElementById('docName').value,t=document.getElementById('docType').value;
fetch(API+'/documents/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fileName:n||'Doc',documentType:t})})
.then(r=>r.json()).then(d=>{document.getElementById('msg').innerHTML='<div class="msg success-msg">Uploaded! Confidence: '+(d.confidence*100).toFixed(0)+'%</div>';loadDocs();}).catch(e=>alert(e));}
function loadDocs(){const s=document.getElementById('search').value;
fetch(API+'/documents?search='+s).then(r=>r.json()).then(d=>{const h=d.items||[];document.getElementById('list').innerHTML=h.length?h.map(x=>'<div class="doc-item"><h3>'+x.fileName+'</h3><p>Type: '+x.documentType+' | Status: <span class="badge '+x.reviewStatus+'">'+x.reviewStatus+'</span> | Confidence: '+(x.confidence*100).toFixed(0)+'%</p></div>').join(''):'<p>No documents</p>'}).catch(e=>console.error(e));}
</script></body></html>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // ===== AUTH ENDPOINTS =====
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        const user = Object.values(data.users).find(u => u.username === username && u.password === password);
        if (user) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            token: 'token_' + user.id,
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
        }
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request' }));
      }
    });
    return;
  }

  if (pathname === '/api/auth/users' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const users = Object.values(data.users).map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role }));
    res.end(JSON.stringify(users));
    return;
  }

  // ===== DOCUMENT ENDPOINTS =====
  if (pathname === '/api/documents' && req.method === 'GET') {
    const status = query.status;
    const search = query.search || '';
    const role = req.headers['x-user-role'] || 'reviewer';
    
    let items = Object.values(data.documents);
    if (status) items = items.filter(d => d.status === status);
    if (search) items = items.filter(d => d.fileName.toLowerCase().includes(search.toLowerCase()));
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ items, total: items.length }));
    return;
  }

  if (pathname === '/api/documents/upload' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { fileName, documentType } = JSON.parse(body);
        const docId = generateId();
        const aiResult = simulateAIProcessing(documentType, fileName);
        
        const doc = {
          id: docId,
          fileName,
          documentType,
          status: 'processing',
          reviewStatus: 'pending',
          uploadedAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
          uploadedBy: req.headers['x-user-id'] || 'user1',
          ...aiResult,
          originalData: aiResult.extractedData,
          corrections: {},
          approvedBy: null,
          rejectionReason: null
        };
        
        data.documents[docId] = doc;
        addAuditLog(req.headers['x-user-id'] || 'user1', 'UPLOAD', docId, { action: 'Document uploaded' });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(doc));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request' }));
      }
    });
    return;
  }

  if (pathname.startsWith('/api/documents/') && !pathname.includes('/approve') && !pathname.includes('/reject')) {
    const docId = pathname.split('/')[3];
    
    if (req.method === 'GET') {
      const doc = data.documents[docId];
      if (doc) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(doc));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
      return;
    }

    if (req.method === 'PUT') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const updates = JSON.parse(body);
          const doc = data.documents[docId];
          if (doc) {
            Object.assign(doc.extractedData, updates);
            doc.corrections = updates;
            addAuditLog(req.headers['x-user-id'] || 'user1', 'EDIT', docId, updates);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(doc));
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
          }
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Bad request' }));
        }
      });
      return;
    }
  }

  if (pathname.includes('/api/documents/') && pathname.includes('/approve')) {
    const docId = pathname.split('/')[3];
    const doc = data.documents[docId];
    if (doc) {
      doc.status = 'completed';
      doc.reviewStatus = 'approved';
      doc.approvedBy = req.headers['x-user-id'] || 'user1';
      addAuditLog(req.headers['x-user-id'] || 'user1', 'APPROVE', docId, { action: 'Document approved' });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(doc));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
    return;
  }

  if (pathname.includes('/api/documents/') && pathname.includes('/reject')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { reason } = JSON.parse(body);
        const docId = pathname.split('/')[3];
        const doc = data.documents[docId];
        if (doc) {
          doc.status = 'rejected';
          doc.reviewStatus = 'rejected';
          doc.rejectionReason = reason;
          addAuditLog(req.headers['x-user-id'] || 'user1', 'REJECT', docId, { reason });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(doc));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not found' }));
        }
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request' }));
      }
    });
    return;
  }

  // ===== CONFIG ENDPOINTS =====
  if (pathname === '/api/config/document-types' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data.documentTypes));
    return;
  }

  if (pathname === '/api/config/document-types' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const newType = JSON.parse(body);
        newType.id = generateId();
        data.documentTypes.push(newType);
        addAuditLog(req.headers['x-user-id'] || 'user1', 'CREATE_DOCTYPE', newType.id, newType);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newType));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request' }));
      }
    });
    return;
  }

  // ===== AUDIT LOG ENDPOINTS =====
  if (pathname === '/api/audit-logs' && req.method === 'GET') {
    const docId = query.documentId;
    let logs = data.auditLogs;
    if (docId) logs = logs.filter(l => l.documentId === docId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(logs));
    return;
  }

  // ===== HEALTH CHECK =====
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
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
