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
  },
  auditLogs: [],
  documentTypes: [
    { id: 'invoice', name: 'Invoice', category: 'Financial' },
    { id: 'receipt', name: 'Receipt', category: 'Financial' },
    { id: 'contract', name: 'Contract', category: 'Legal' }
  ]
};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// HTML Page
const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AI Document Processor</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;padding:20px}
.login{max-width:400px;margin:100px auto;padding:30px;background:white;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-align:center}
.login h2{margin-bottom:20px;color:#2c3e50}
.login input{display:block;width:100%;margin:10px 0;padding:10px;border:1px solid #ddd;border-radius:4px}
.login button{width:100%;padding:12px;background:#3498db;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;margin-top:15px}
.login button:hover{background:#2980b9}
.login p{margin-top:15px;font-size:12px;color:#7f8c8d}
.hidden{display:none}
.container{max-width:1000px;margin:0 auto;background:white;border-radius:8px;padding:30px;box-shadow:0 8px 32px rgba(0,0,0,0.2)}
h1{color:#2c3e50;margin-bottom:20px;text-align:center}
.section{margin-bottom:30px;padding:20px;background:#f8f9fa;border-radius:6px;border-left:4px solid #3498db}
.section h2{color:#2c3e50;margin-bottom:15px}
.form-group{margin:15px 0}
.form-group label{display:block;margin-bottom:8px;font-weight:bold;color:#2c3e50}
.form-group input,.form-group select{width:100%;padding:10px;border:1px solid #ddd;border-radius:4px}
.btn-upload{background:#27ae60;color:white;padding:10px 20px;border:none;border-radius:4px;cursor:pointer;font-weight:bold}
.btn-upload:hover{background:#229954}
.success{color:green;padding:10px;margin:15px 0;background:#d4edda;border-radius:4px}
.doc-item{background:white;padding:15px;margin:10px 0;border-left:4px solid #27ae60;border-radius:4px}
.doc-item h3{color:#2c3e50}
.badge{display:inline-block;padding:4px 10px;background:#f39c12;color:white;border-radius:4px;font-size:12px;margin:5px 0}
.btn-logout{background:#e74c3c;color:white;padding:8px 15px;border:none;border-radius:4px;cursor:pointer}
.btn-logout:hover{background:#c0392b}
</style>
</head>
<body>

<div id="loginDiv" class="login">
<h2>AI Document Processor</h2>
<input type="text" id="user" placeholder="Username" />
<input type="password" id="pass" placeholder="Password" />
<button onclick="login()">Login</button>
<p>Demo: john_reviewer / pass123</p>
</div>

<div id="appDiv" class="hidden">
<div class="container">
<h1>AI Document Processor</h1>
<button class="btn-logout" onclick="logout()">Logout</button>

<div class="section">
<h2>Upload Document</h2>
<div class="form-group">
<label>Select File:</label>
<input type="file" id="docFile" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff,.txt,.xlsx" />
</div>
<div class="form-group">
<label>Document Type:</label>
<select id="docType">
<option value="invoice">Invoice</option>
<option value="receipt">Receipt</option>
<option value="contract">Contract</option>
</select>
</div>
<button class="btn-upload" onclick="upload()">Upload Document</button>
<div id="uploadMsg"></div>
</div>

<div class="section">
<h2>My Documents</h2>
<input type="text" id="searchBox" placeholder="Search..." onkeyup="loadDocs()" style="width:100%;padding:10px;margin-bottom:15px;" />
<div id="docList"></div>
</div>
</div>
</div>

<script>
const API='http://localhost:3000/api';
let user=null;

function login(){
  const u=document.getElementById('user').value;
  const p=document.getElementById('pass').value;
  if(!u||!p){alert('Enter credentials');return;}
  fetch(API+'/auth/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username:u,password:p})
  })
  .then(r=>r.json())
  .then(d=>{
    if(d.user){
      user=d.user;
      document.getElementById('loginDiv').classList.add('hidden');
      document.getElementById('appDiv').classList.remove('hidden');
      document.getElementById('user').value='';
      document.getElementById('pass').value='';
      loadDocs();
    }else{
      alert('Login failed');
    }
  })
  .catch(e=>alert('Error: '+e));
}

function logout(){
  user=null;
  document.getElementById('loginDiv').classList.remove('hidden');
  document.getElementById('appDiv').classList.add('hidden');
}

function upload(){
  const fileInput = document.getElementById('docFile');
  const file = fileInput.files[0];
  const docType = document.getElementById('docType').value;
  
  if(!file){
    alert('Please select a file');
    return;
  }
  
  const fileName = file.name;
  
  fetch(API+'/documents/upload',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({fileName:fileName,documentType:docType})
  })
  .then(r=>r.json())
  .then(d=>{
    document.getElementById('uploadMsg').innerHTML='<div class="success">✓ Uploaded! Confidence: '+(d.confidence*100).toFixed(0)+'%</div>';
    document.getElementById('docFile').value='';
    setTimeout(()=>loadDocs(), 500);
  })
  .catch(e=>alert('Error: '+e));
}

function loadDocs(){
  const s=document.getElementById('searchBox').value;
  fetch(API+'/documents?search='+s)
  .then(r=>r.json())
  .then(d=>{
    const h=d.items||[];
    if(h.length===0){
      document.getElementById('docList').innerHTML='<p>No documents. Upload one above!</p>';
      return;
    }
    document.getElementById('docList').innerHTML=h.map(x=>'<div class="doc-item"><h3>'+x.fileName+'</h3><p><strong>Type:</strong> '+x.documentType+' | <strong>Status:</strong> <span class="badge">'+x.reviewStatus+'</span> | <strong>Confidence:</strong> '+(x.confidence*100).toFixed(0)+'%</p></div>').join('');
  })
  .catch(e=>console.error(e));
}
</script>

</body>
</html>`;

// Create server
const server = http.createServer((req, res) => {
  console.log(req.method, req.url);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Parse URL
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const search = url.searchParams.get('search') || '';

  try {
    // Serve HTML
    if (path === '/' || path === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    // Login
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
          res.end(JSON.stringify({error: 'Bad request'}));
        }
      });
      return;
    }

    // Get documents
    if (path === '/api/documents') {
      let items = Object.values(data.documents);
      if (search) items = items.filter(d => d.fileName.toLowerCase().includes(search.toLowerCase()));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({items, total: items.length}));
      return;
    }

    // Upload document
    if (path === '/api/documents/upload') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try {
          const {fileName, documentType} = JSON.parse(body);
          const id = generateId();
          const doc = {
            id,
            fileName: fileName || 'Document',
            documentType: documentType || 'invoice',
            reviewStatus: 'pending',
            uploadedAt: new Date().toISOString(),
            confidence: Math.random() * 0.3 + 0.7
          };
          data.documents[id] = doc;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(doc));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({error: 'Bad request'}));
        }
      });
      return;
    }

    // 404
    res.writeHead(404);
    res.end('Not found');

  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running at http://localhost:${PORT}`);
  console.log('Demo: john_reviewer / pass123');
});
