#!/usr/bin/env node
import http from 'http';

const PORT = 3000;

// Data storage
const data = {
  documents: {},
  users: {
    user1: { id: 'user1', username: 'john_reviewer', email: 'john@example.com', role: 'reviewer', password: 'pass123' },
    user2: { id: 'user2', username: 'admin_user', email: 'admin@example.com', role: 'admin', password: 'pass123' },
    user3: { id: 'user3', username: 'processor', email: 'proc@example.com', role: 'processor', password: 'pass123' }
  }
};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Professional HTML UI
const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Document Processor</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }

/* LOGIN */
#loginDiv { max-width: 450px; margin: 100px auto; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); text-align: center; }
#loginDiv h1 { color: #2c3e50; margin-bottom: 10px; font-size: 32px; }
#loginDiv .subtitle { color: #7f8c8d; margin-bottom: 30px; font-size: 14px; }
.form-group { margin-bottom: 15px; text-align: left; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50; font-size: 14px; }
.form-group input, .form-group select { width: 100%; padding: 12px 15px; border: 2px solid #ecf0f1; border-radius: 6px; font-size: 14px; transition: all 0.3s ease; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
.btn { padding: 13px 20px; border: none; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.btn-primary { width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; margin-top: 10px; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3); }
.btn-success { width: 100%; background: #27ae60; color: white; padding: 15px; margin-top: 15px; }
.btn-success:hover { background: #229954; }
.btn-logout { background: #e74c3c; color: white; padding: 10px 20px; float: right; }
.btn-logout:hover { background: #c0392b; }
.demo-info { background: #e8f4f8; border-left: 4px solid #3498db; padding: 15px; margin-top: 20px; border-radius: 4px; font-size: 13px; color: #2c3e50; }
.hidden { display: none !important; }

/* APP */
#appDiv { max-width: 1200px; margin: 0 auto; }
.header { background: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
.header h1 { color: #2c3e50; font-size: 28px; margin: 0; }
.section { background: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.section h2 { color: #2c3e50; margin-bottom: 20px; font-size: 22px; border-bottom: 2px solid #ecf0f1; padding-bottom: 15px; }
.upload-area { border: 3px dashed #3498db; border-radius: 8px; padding: 30px; text-align: center; background: #f8fbff; cursor: pointer; transition: all 0.3s ease; margin-bottom: 20px; }
.upload-area:hover { border-color: #667eea; background: #f0f5ff; }
.upload-area input[type="file"] { display: none; }
.upload-area-icon { font-size: 40px; margin-bottom: 10px; }
.upload-area-text { color: #7f8c8d; font-size: 16px; margin: 0; }
.file-name { color: #27ae60; font-weight: 600; margin-top: 10px; }
.search-box { width: 100%; padding: 12px 15px; border: 2px solid #ecf0f1; border-radius: 6px; font-size: 14px; margin-bottom: 20px; }
.doc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.doc-card { background: #f8f9fa; border: 1px solid #ecf0f1; border-left: 4px solid #27ae60; padding: 20px; border-radius: 8px; transition: all 0.3s ease; }
.doc-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
.doc-card h3 { color: #2c3e50; margin: 0 0 10px 0; word-break: break-word; }
.doc-card p { color: #7f8c8d; margin: 8px 0; font-size: 13px; }
.badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-right: 8px; margin-top: 10px; }
.badge.pending { background: #fff3cd; color: #856404; }
.badge.approved { background: #d4edda; color: #155724; }
.confidence { color: #27ae60; font-weight: 600; }
.message { padding: 15px; margin: 20px 0; border-radius: 6px; font-size: 14px; animation: slideIn 0.3s ease-in; }
@keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.success { background: #d4edda; border: 2px solid #c3e6cb; color: #155724; border-left: 4px solid #27ae60; }
.error { background: #f8d7da; border: 2px solid #f5c6cb; color: #721c24; border-left: 4px solid #e74c3c; font-weight: 500; }
.two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.no-documents { text-align: center; padding: 40px; color: #95a5a6; }
@media (max-width: 768px) {
  .two-column { grid-template-columns: 1fr; }
  .doc-grid { grid-template-columns: 1fr; }
  .header { flex-direction: column; align-items: flex-start; }
  .btn-logout { float: none; margin-top: 15px; }
}
</style>
</head>
<body>

<!-- LOGIN -->
<div id="loginDiv">
  <h1>📄 Document Processor</h1>
  <p class="subtitle">AI-Powered Document Management</p>
  
  <div class="form-group">
    <label>👤 Username</label>
    <input type="text" id="user" placeholder="Enter username" />
  </div>
  
  <div class="form-group">
    <label>🔒 Password</label>
    <input type="password" id="pass" placeholder="Enter password" />
  </div>
  
  <button class="btn btn-primary" onclick="login()">Sign In</button>
  
  <div class="demo-info">
    <strong>Demo Credentials:</strong>
    <div>john_reviewer / pass123</div>
    <div>admin_user / pass123</div>
    <div>processor / pass123</div>
  </div>
</div>

<!-- APP -->
<div id="appDiv" class="hidden">
  <div class="header">
    <h1>📄 Document Processor</h1>
    <button class="btn btn-logout" onclick="logout()">Sign Out</button>
  </div>
  
  <!-- UPLOAD -->
  <div class="section">
    <h2>📤 Upload Document</h2>
    
    <div class="two-column">
      <div class="form-group">
        <label>📁 Select Document Type</label>
        <select id="docType">
          <option value="invoice">Invoice</option>
          <option value="receipt">Receipt</option>
          <option value="contract">Contract</option>
        </select>
      </div>
    </div>
    
    <div class="upload-area" onclick="document.getElementById('docFile').click()">
      <div class="upload-area-icon">📁</div>
      <p class="upload-area-text"><strong>Click to select a file</strong></p>
      <p style="color:#95a5a6; font-size:12px; margin-top:8px;">PDF, Word, Image, Excel, TXT</p>
      <input type="file" id="docFile" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff,.txt,.xlsx" onchange="onFileSelected()" />
      <div id="fileName" class="file-name"></div>
    </div>
    
    <button class="btn btn-success" onclick="upload()">Upload & Process</button>
    <div id="uploadMsg"></div>
  </div>
  
  <!-- DOCUMENTS -->
  <div class="section">
    <h2>📋 My Documents</h2>
    
    <input type="text" id="searchBox" class="search-box" placeholder="🔍 Search documents..." onkeyup="loadDocs()" />
    
    <div id="docList" class="doc-grid"></div>
  </div>
</div>

<script>
const API = 'http://localhost:3000/api';
let user = null;

function login() {
  const u = document.getElementById('user').value;
  const p = document.getElementById('pass').value;
  if (!u || !p) { alert('Enter username and password'); return; }
  
  fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: u, password: p })
  })
  .then(r => r.json())
  .then(d => {
    if (d.user) {
      user = d.user;
      document.getElementById('loginDiv').classList.add('hidden');
      document.getElementById('appDiv').classList.remove('hidden');
      document.getElementById('user').value = '';
      document.getElementById('pass').value = '';
      loadDocs();
    } else {
      alert('Invalid credentials');
    }
  })
  .catch(e => alert('Error: ' + e));
}

function logout() {
  user = null;
  document.getElementById('loginDiv').classList.remove('hidden');
  document.getElementById('appDiv').classList.add('hidden');
}

function onFileSelected() {
  const file = document.getElementById('docFile').files[0];
  if (file) {
    document.getElementById('fileName').textContent = '✓ Selected: ' + file.name;
  }
}

function upload() {
  const file = document.getElementById('docFile').files[0];
  
  // Validate file selection
  if (!file) {
    document.getElementById('uploadMsg').innerHTML = 
      '<div class="message error">⚠️ <strong>Error:</strong> Please select a document file before uploading. Click on the upload area above to choose a file.</div>';
    return;
  }
  
  const docType = document.getElementById('docType').value;
  
  fetch(API + '/documents/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, documentType: docType })
  })
  .then(r => r.json())
  .then(d => {
    document.getElementById('uploadMsg').innerHTML = 
      '<div class="message success">✓ <strong>Success!</strong> Document uploaded successfully! Confidence: <span class="confidence">' + (d.confidence * 100).toFixed(0) + '%</span></div>';
    document.getElementById('docFile').value = '';
    document.getElementById('fileName').textContent = '';
    setTimeout(() => loadDocs(), 500);
  })
  .catch(e => {
    document.getElementById('uploadMsg').innerHTML = '<div class="message error">✗ <strong>Error:</strong> Failed to upload document: ' + e + '</div>';
  });
}

function loadDocs() {
  const s = document.getElementById('searchBox').value;
  fetch(API + '/documents?search=' + s)
  .then(r => r.json())
  .then(d => {
    const h = d.items || [];
    if (h.length === 0) {
      document.getElementById('docList').innerHTML = '<div class="no-documents"><div style="font-size:50px;opacity:0.5">📭</div><p>No documents yet!</p></div>';
      return;
    }
    document.getElementById('docList').innerHTML = h.map(x => 
      '<div class="doc-card"><h3>' + x.fileName + '</h3><p><strong>Type:</strong> ' + x.documentType.toUpperCase() + '</p><p><strong>Status:</strong> <span class="badge ' + x.reviewStatus + '">' + x.reviewStatus + '</span></p><p><strong>Confidence:</strong> <span class="confidence">' + (x.confidence * 100).toFixed(0) + '%</span></p><p><small>📅 ' + new Date(x.uploadedAt).toLocaleDateString() + '</small></p></div>'
    ).join('');
  })
  .catch(e => console.error('Error:', e));
}
</script>

</body>
</html>`;

// Server
const server = http.createServer((req, res) => {
  console.log(req.method, req.url);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const search = url.searchParams.get('search') || '';

  try {
    if (path === '/' || path === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    if (path === '/api/auth/login') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try {
          const {username, password} = JSON.parse(body);
          const u = Object.values(data.users).find(x => x.username === username && x.password === password);
          if (u) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({user: {id: u.id, username: u.username, email: u.email, role: u.role}}));
          } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({error: 'Invalid'}));
          }
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({error: 'Bad'}));
        }
      });
      return;
    }

    if (path === '/api/documents') {
      let items = Object.values(data.documents);
      if (search) items = items.filter(d => d.fileName.toLowerCase().includes(search.toLowerCase()));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({items, total: items.length}));
      return;
    }

    if (path === '/api/documents/upload') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try {
          const {fileName, documentType} = JSON.parse(body);
          const id = generateId();
          const doc = {id, fileName, documentType, reviewStatus: 'pending', uploadedAt: new Date().toISOString(), confidence: Math.random() * 0.3 + 0.7};
          data.documents[id] = doc;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(doc));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({error: 'Bad'}));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end('Not found');

  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500);
    res.end('Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running at http://localhost:${PORT}`);
  console.log('📚 Demo: john_reviewer / pass123');
});
