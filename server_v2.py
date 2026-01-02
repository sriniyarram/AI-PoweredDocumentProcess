#!/usr/bin/env python3
"""
AI Document Processor - Backend Server (Simplified Version)
Provides REST API endpoints for document processing
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import os
import uuid
from datetime import datetime
from pathlib import Path

# In-memory storage
documents = {}
document_types = [
    {
        "id": "invoice",
        "name": "Invoice",
        "category": "Financial",
        "description": "Standard invoice documents",
        "supportedFormats": ["pdf", "jpg", "png"],
        "extractionTemplate": {
            "id": "invoice-template",
            "name": "Invoice Extraction Template",
            "fields": [
                {"id": "invoice_number", "name": "invoiceNumber", "label": "Invoice Number", "type": "text", "required": True},
                {"id": "invoice_date", "name": "invoiceDate", "label": "Invoice Date", "type": "date", "required": True},
                {"id": "vendor_name", "name": "vendorName", "label": "Vendor Name", "type": "text", "required": True},
                {"id": "total_amount", "name": "totalAmount", "label": "Total Amount", "type": "currency", "required": True},
            ],
        },
    },
]

class DocumentProcessorHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle POST requests"""
        path = urlparse(self.path).path
        
        # Upload document
        if path == "/api/documents/upload":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode())
                doc_id = str(uuid.uuid4())
                doc = {
                    "id": doc_id,
                    "fileName": data.get("fileName", "document"),
                    "documentType": data.get("documentType", "invoice"),
                    "status": "processing",
                    "uploadedAt": datetime.now().isoformat(),
                    "reviewStatus": "pending",
                    "extractedData": {},
                    "ocrText": "",
                    "confidence": 0.85,
                    "processingResult": {"status": "completed"}
                }
                documents[doc_id] = doc
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(doc).encode())
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
            return
        
        # Default 404
        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_GET(self):
        """Handle GET requests"""
        path = urlparse(self.path).path
        
        # Serve static file - try simple.html first, then app.html
        if path == "/" or path == "/app.html" or path == "/simple.html":
            for filename in ["simple.html", "app.html"]:
                try:
                    with open(filename, "r", encoding="utf-8") as f:
                        content = f.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(content.encode("utf-8"))
                    return
                except FileNotFoundError:
                    continue
            
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "No HTML file found"}).encode())
            return
        
        # Health check
        if path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "message": "API is running"}).encode())
            return
        
        # Get document types
        if path == "/api/config/document-types":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(document_types).encode())
            return
        
        # Get all documents
        if path == "/api/documents":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            items = list(documents.values())
            response = {"items": items, "total": len(items), "page": 1, "pageSize": 20}
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Get single document
        if path.startswith("/api/documents/") and path != "/api/documents":
            parts = path.split("/")
            if len(parts) >= 4:
                doc_id = parts[3]
                if doc_id in documents:
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps(documents[doc_id]).encode())
                    return
        
        # Default 404
        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        """Suppress default logging"""
        pass

if __name__ == "__main__":
    PORT = 3000
    server = HTTPServer(("0.0.0.0", PORT), DocumentProcessorHandler)
    print(f"[OK] Server running at http://localhost:{PORT}")
    print(f"[WEB] Open in browser: http://localhost:{PORT}")
    print(f"[HEALTH] Health check: http://localhost:{PORT}/api/health")
    print("\n[INFO] Press Ctrl+C to stop\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n✓ Server stopped")
        server.server_close()
