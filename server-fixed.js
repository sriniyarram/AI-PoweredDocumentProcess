#!/usr/bin/env node

import http from 'http';

const PORT = 3000;

// In-memory data
const data = {
  documents: {},
  users: {
    user1: { id: 'user1', username: 'john_reviewer', email: 'john@example.com', role: 'reviewer', password: 'pass123' },
    user2: { id: 'user2', username: 'admin_user', email: 'admin@example.com', role: 'admin', password: 'pass123' },
    user3: { id: 'user3', username: 'processor', email: 'proc@example.com', role: 'processor', password: 'pass123' }
  },
  auditLogs: [],
  documentTypes: [
    { id: 'invoice', name: 'Invoice', category: 'Financial', description: 'Invoice documents', extractionFields: [] },
    { id: 'receipt', name: 'Receipt', category: 'Financial', description: 'Receipt documents', extractionFields: [] },
    { id: 'contract', name: 'Contract', category: 'Legal', description: 'Contract documents', extractionFields: [] }
  ]
};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function addAuditLog(userId, action, documentId, changes) {
  data.auditLogs.push({
    id: generateId(),
    userId,
    action,
    documentId,
    timestamp: new Date().toISOString(),
    changes
  });
}

function parseQuery(queryString) {
  const query = {};
  if (queryString) {
    queryString.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) query[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
  }
  return query;
}

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Document Processor</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;padding:20px}
.container{max-width:1000px;margin:0 auto;background:white;border-radius:8px;padding:30px;box-shadow:0 8px 32px rgba(0,0,0,0.2)}
h1{color:#2c3e50;margin-bottom:30px;text-align:center}
.section{margin-bottom:30px;padding:20px;background:#f8f9fa;border-radius:6px;border-left:4px solid #3498db}
.section h2{color:#2c3e50;margin-bottom:15px}
.form-group{margin:15px 0}
.form-group label{display:block;margin-bottom:8px;font-weight:bold;color:#2c3e50}
.form-group input,.form-group select{width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:14px}
button{background:#3498db;color:white;padding:10px 20px;border:none;border-radius:4px;cursor:pointer;font-weight:bold;margin:10px 0}
button:hover{background:#2980b9}
button.success{background:#27ae60}
button.success:hover{background:#229954}
.doc-item{background:white;padding:15px;margin:10px 0;border-left:4px solid #27ae60;border-radius:4px;display:none}
.doc-item.show{display:block}
.doc-item h3{color:#2c3e50;margin-bottom:5px}
.badge{display:inline-block;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:bold;margin:5px 5px 5px 0}
.badge.pending{background:#f39c12;color:white}
.badge.approved{background:#27ae60;color:white}
.login{max-width:400px;margin:50px auto;padding:30px;background:white;border-radius:8px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.1)}
.login h2{margin-bottom:20px;color:#2c3e50}
.login input{display:block;width:100%;margin:10px 0;padding:10px;border:1px solid #ddd;border-radius:4px}
.msg{padding:12px;margin:15px 0;border-radius:4px}
.success-msg{background:#d4edda;color:#155724;border:1px solid #c3e6cb}
.error-msg{background:#f8d7da;color:#721c24;border:1px solid #f5c6cb}
.hidden{display:none}
</style>
</head>
<body>

<div id="login" class="login">
<h2>AI Document Processor</h2>
<div class="form-group">
<input type="text" id="username" placeholder="Username" />
</div>
<div class="form-group">
<input type="password" id="password" placeholder="Password" />
</div>
<button onclick="doLogin()" style="width:100%;margin-top:15px">Login</button>
<p style="margin-top:15px;font-size:12px;color:#7f8c8d">Demo: john_reviewer / pass123</p>
</div>

<div id="app" class="hidden">
<div class="container">
<h1>AI Document Processor</h1>
<button onclick="doLogout()" style="margin-bottom:20px">Logout</button>

<div class="section">
<h2>Upload Document</h2>
<div class="form-group">
<label>Document Name:</label>
<input type="text" id="docName" placeholder="e.g., Invoice-001" />
</div>
<div class="form-group">
<label>Document Type:</label>
<select id="docType">
<option value="invoice">Invoice</option>
<option value="receipt">Receipt</option>
<option value="contract">Contract</option>
</select>
</div>
<button class="success" onclick="upload()">Upload Document</button>
<div id="msg"></div>
</div>

<div class="section">
<h2>My Documents</h2>
<div class="form-group">
<input type="text" id="search" placeholder="Search documents..." onkeyup="loadDocs()" />
</div>
<div id="list"></div>
</div>
</div>
</div>

<script>
const API='http://localhost:3000/api';
let user=null;

function doLogin(){
  const u=document.getElementById('username').value;
  const p=document.getElementById('password').value;
  if(!u||!p){alert('Enter username and password');return;}
  fetch(API+'/auth/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username:u,password:p})
  })
  .then(r=>r.json())
  .then(d=>{
    if(d.user){
      user=d.user;
      document.getElementById('login').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
      document.getElementById('username').value='';
      document.getElementById('password').value='';
      loadDocs();
    }else{
      alert('Login failed: '+d.error);
    }
  })
  .catch(e=>alert('Error: '+e.message));
}

function doLogout(){
  user=null;
  document.getElementById('login').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function upload(){
  const n=document.getElementById('docName').value||'Untitled';
  const t=document.getElementById('docType').value;
  fetch(API+'/documents/upload',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({fileName:n,documentType:t})
  })
  .then(r=>r.json())
  .then(d=>{
    if(d.error){
      document.getElementById('msg').innerHTML='<div class="msg error-msg">Error: '+d.error+'</div>';
    }else{
      document.getElementById('msg').innerHTML='<div class="msg success-msg">Uploaded! Confidence: '+(d.confidence*100).toFixed(0)+'%</div>';
      document.getElementById('docName').value='';
      loadDocs();
    }
  })
  .catch(e=>{
    document.getElementById('msg').innerHTML='<div class="msg error-msg">Error: '+e.message+'</div>';
  });
}

function loadDocs(){
  const s=document.getElementById('search').value;
  fetch(API+'/documents?search='+s)
  .then(r=>r.json())
  .then(d=>{
    const h=d.items||[];
    const list=document.getElementById('list');
    if(h.length===0){
      list.innerHTML='<p>No documents yet. Upload one above!</p>';
      return;
    }
    list.innerHTML=h.map(x=>'<div class="doc-item show"><h3>'+x.fileName+'</h3><p><strong>Type:</strong> '+x.documentType+' | <strong>Status:</strong> <span class="badge '+x.reviewStatus+'">'+x.reviewStatus+'</span> | <strong>Confidence:</strong> '+(x.confidence*100).toFixed(0)+'%</p><p><small>Uploaded: '+new Date(x.uploadedAt).toLocaleDateString()+'</small></p></div>').join('');
  })
  .catch(e=>console.error('Error:',e));
}
</script>

</body>
</html>`;

const server = http.createServer((req, res) => {
  // Parse URL
  const url = req.url;
  const [pathPart, queryPart] = url.split('?');
  const pathname = pathPart;
  const query = parseQuery(queryPart);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Serve HTML
    if (pathname === '/' || pathname === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    // Health check
    if (pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    // Login
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { username, password } = JSON.parse(body);
          const user = Object.values(data.users).find(u => u.username === username && u.password === password);
          if (user) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ token: 'tk_' + user.id, user: { id: user.id, username: user.username, email: user.email, role: user.role } }));
          } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid credentials' }));
          }
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Bad request' }));
        }
      });
      return;
    }

    // Get users
    if (pathname === '/api/auth/users') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const users = Object.values(data.users).map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role }));
      res.end(JSON.stringify(users));
      return;
    }

    // List documents
    if (pathname === '/api/documents' && req.method === 'GET') {
      const search = query.search || '';
      let items = Object.values(data.documents);
      if (search) {
        items = items.filter(d => d.fileName.toLowerCase().includes(search.toLowerCase()));
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ items, total: items.length }));
      return;
    }

    // Upload document
    if (pathname === '/api/documents/upload' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { fileName, documentType } = JSON.parse(body);
          const docId = generateId();
          const doc = {
            id: docId,
            fileName: fileName || 'Document',
            documentType: documentType || 'invoice',
            status: 'completed',
            reviewStatus: 'pending',
            uploadedAt: new Date().toISOString(),
            processedAt: new Date().toISOString(),
            uploadedBy: 'user1',
            confidence: Math.random() * 0.3 + 0.7,
            extractedData: { text: 'Sample extracted data' },
            originalData: { text: 'Sample original data' },
            corrections: {},
            approvedBy: null,
            rejectionReason: null
          };
          data.documents[docId] = doc;
          addAuditLog('user1', 'UPLOAD', docId, { fileName, documentType });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(doc));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Bad request' }));
        }
      });
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));

  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});
