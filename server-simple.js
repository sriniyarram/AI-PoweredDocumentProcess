#!/usr/bin/env node

/**
 * AI Document Processor - Simple Web Server
 * Serves the HTML application and provides mock API responses
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const STATIC_DIR = __dirname;

// In-memory data storage
const documents = {};
const documentTypes = [
  {
    id: 'invoice',
    name: 'Invoice',
    category: 'Financial',
    description: 'Standard invoice documents',
    supportedFormats: ['pdf', 'jpg', 'png'],
    extractionTemplate: {
      id: 'invoice-template',
      name: 'Invoice Extraction Template',
      fields: [
        { id: 'invoice_number', name: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: true },
        { id: 'invoice_date', name: 'invoiceDate', label: 'Invoice Date', type: 'date', required: true },
        { id: 'vendor_name', name: 'vendorName', label: 'Vendor Name', type: 'text', required: true },
        { id: 'total_amount', name: 'totalAmount', label: 'Total Amount', type: 'currency', required: true },
        { id: 'description', name: 'description', label: 'Description', type: 'multi-line', required: false },
      ],
    },
  },
  {
    id: 'receipt',
    name: 'Receipt',
    category: 'Financial',
    description: 'Receipt documents',
    supportedFormats: ['pdf', 'jpg', 'png'],
    extractionTemplate: {
      id: 'receipt-template',
      name: 'Receipt Extraction Template',
      fields: [
        { id: 'receipt_number', name: 'receiptNumber', label: 'Receipt Number', type: 'text', required: true },
        { id: 'receipt_date', name: 'receiptDate', label: 'Receipt Date', type: 'date', required: true },
        { id: 'vendor_name', name: 'vendorName', label: 'Vendor Name', type: 'text', required: true },
        { id: 'amount', name: 'amount', label: 'Amount', type: 'currency', required: true },
      ],
    },
  },
  {
    id: 'contract',
    name: 'Contract',
    category: 'Legal',
    description: 'Contract documents',
    supportedFormats: ['pdf', 'docx'],
    extractionTemplate: {
      id: 'contract-template',
      name: 'Contract Extraction Template',
      fields: [
        { id: 'contract_title', name: 'contractTitle', label: 'Contract Title', type: 'text', required: true },
        { id: 'parties', name: 'parties', label: 'Parties Involved', type: 'multi-line', required: true },
        { id: 'effective_date', name: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
        { id: 'contract_terms', name: 'contractTerms', label: 'Key Terms', type: 'multi-line', required: false },
      ],
    },
  },
];

function generateId() {
  return 'DOC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function simulateAIProcessing(docTypeId) {
  const templates = {
    invoice: {
      invoice_number: 'INV-' + Math.floor(Math.random() * 99999),
      invoice_date: new Date().toISOString().split('T')[0],
      vendor_name: 'Sample Vendor Inc.',
      total_amount: String(Math.floor(Math.random() * 50000)),
      description: 'Sample invoice description extracted from OCR',
    },
    receipt: {
      receipt_number: 'RCP-' + Math.floor(Math.random() * 99999),
      receipt_date: new Date().toISOString().split('T')[0],
      vendor_name: 'Retail Store',
      amount: String(Math.floor(Math.random() * 5000)),
    },
    contract: {
      contract_title: 'Service Agreement',
      parties: 'Party A and Party B',
      effective_date: new Date().toISOString().split('T')[0],
      contract_terms: 'Terms and conditions extracted from document',
    },
  };
  return templates[docTypeId] || {};
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // API Routes
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Server is running' }));
    return;
  }

  if (pathname === '/api/config/document-types') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(documentTypes));
    return;
  }

  if (pathname.match(/^\/api\/config\/document-types\/\w+$/)) {
    const typeId = pathname.split('/').pop();
    const docType = documentTypes.find(dt => dt.id === typeId);
    if (docType) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(docType));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
    return;
  }

  if (pathname === '/api/documents' && req.method === 'GET') {
    const items = Object.values(documents);
    const start = ((parseInt(query.page) || 1) - 1) * (parseInt(query.pageSize) || 20);
    const end = start + (parseInt(query.pageSize) || 20);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      items: items.slice(start, end),
      total: items.length,
      page: parseInt(query.page) || 1,
      pageSize: parseInt(query.pageSize) || 20,
    }));
    return;
  }

  if (pathname === '/api/documents/upload' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const data = JSON.parse(body);
      const docId = generateId();
      const ocrText = `Sample OCR text extracted from ${data.fileName}`;
      const extractedData = simulateAIProcessing(data.documentTypeId);

      documents[docId] = {
        id: docId,
        fileName: data.fileName,
        fileType: 'application/pdf',
        fileSize: Math.floor(Math.random() * 5000000),
        uploadedAt: new Date().toISOString(),
        documentTypeId: data.documentTypeId,
        status: 'completed',
        extractedData,
        ocrText,
        confidence: 0.85 + Math.random() * 0.15,
        processingErrors: [],
        metadata: { pageCount: 1, language: 'en', classification: { type: data.documentTypeId, confidence: 0.92 }, entities: [] },
        reviewStatus: 'pending',
        comments: '',
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(documents[docId]));
    });
    return;
  }

  if (pathname.match(/^\/api\/documents\/[\w-]+$/) && !pathname.includes('/approve') && !pathname.includes('/reject') && req.method === 'GET') {
    const docId = pathname.split('/').pop();
    if (documents[docId]) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(documents[docId]));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
    return;
  }

  if (pathname.match(/^\/api\/documents\/[\w-]+\/approve$/) && req.method === 'POST') {
    const docId = pathname.match(/[\w-]+(?=\/approve)/)[0];
    if (documents[docId]) {
      documents[docId].reviewStatus = 'approved';
      documents[docId].reviewedAt = new Date().toISOString();
      documents[docId].reviewedBy = 'User';

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(documents[docId]));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
    return;
  }

  if (pathname.match(/^\/api\/documents\/[\w-]+\/reject$/) && req.method === 'POST') {
    const docId = pathname.match(/[\w-]+(?=\/reject)/)[0];
    if (documents[docId]) {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        const data = JSON.parse(body);
        documents[docId].reviewStatus = 'rejected';
        documents[docId].reviewedAt = new Date().toISOString();
        documents[docId].reviewedBy = 'User';
        documents[docId].comments = data.comments || '';

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(documents[docId]));
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
    return;
  }

  // Static file serving
  let filePath = path.join(STATIC_DIR, pathname);
  if (pathname === '/') filePath = path.join(STATIC_DIR, 'app.html');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, 'localhost', () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   AI Document Processor - Web Server                       ║
╚════════════════════════════════════════════════════════════╝

🚀 Server running on: http://localhost:${PORT}
📄 Application: http://localhost:${PORT}/app.html
🔗 API: http://localhost:${PORT}/api
✓ CORS enabled for all origins

📋 Available Document Types:
   • Invoice (Financial)
   • Receipt (Financial)
   • Contract (Legal)

⌨️  Press Ctrl+C to stop the server
`);
});

process.on('SIGINT', () => {
  console.log('\n✓ Server stopped gracefully');
  process.exit(0);
});
