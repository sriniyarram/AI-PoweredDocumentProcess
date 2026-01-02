#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

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
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

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
    try {
      let content;
      try {
        content = fs.readFileSync(path.join(__dirname, 'advanced.html'), 'utf8');
      } catch {
        try {
          content = fs.readFileSync(path.join(__dirname, 'simple.html'), 'utf8');
        } catch {
          content = fs.readFileSync(path.join(__dirname, 'app.html'), 'utf8');
        }
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(content);
      return;
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading HTML');
      return;
    }
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
