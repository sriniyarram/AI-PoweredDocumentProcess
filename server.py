#!/usr/bin/env python3
"""
AI Document Processor - Backend Server (Mock Implementation)
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
                {"id": "description", "name": "description", "label": "Description", "type": "multi-line", "required": False},
            ],
            "sections": [
                {"id": "basic", "name": "basic", "label": "Basic Information", "fields": ["invoice_number", "invoice_date"]},
                {"id": "vendor", "name": "vendor", "label": "Vendor Details", "fields": ["vendor_name", "total_amount"]},
            ],
        },
        "validationRules": [],
    },
    {
        "id": "receipt",
        "name": "Receipt",
        "category": "Financial",
        "description": "Receipt documents",
        "supportedFormats": ["pdf", "jpg", "png"],
        "extractionTemplate": {
            "id": "receipt-template",
            "name": "Receipt Extraction Template",
            "fields": [
                {"id": "receipt_number", "name": "receiptNumber", "label": "Receipt Number", "type": "text", "required": True},
                {"id": "receipt_date", "name": "receiptDate", "label": "Receipt Date", "type": "date", "required": True},
                {"id": "vendor_name", "name": "vendorName", "label": "Vendor Name", "type": "text", "required": True},
                {"id": "amount", "name": "amount", "label": "Amount", "type": "currency", "required": True},
            ],
        },
        "validationRules": [],
    },
    {
        "id": "contract",
        "name": "Contract",
        "category": "Legal",
        "description": "Contract documents",
        "supportedFormats": ["pdf", "docx"],
        "extractionTemplate": {
            "id": "contract-template",
            "name": "Contract Extraction Template",
            "fields": [
                {"id": "contract_title", "name": "contractTitle", "label": "Contract Title", "type": "text", "required": True},
                {"id": "parties", "name": "parties", "label": "Parties Involved", "type": "multi-line", "required": True},
                {"id": "effective_date", "name": "effectiveDate", "label": "Effective Date", "type": "date", "required": True},
                {"id": "contract_terms", "name": "contractTerms", "label": "Key Terms", "type": "multi-line", "required": False},
            ],
        },
        "validationRules": [],
    },
]

def simulate_ai_processing(document_type_id, ocr_text=""):
    """Simulate AI processing of documents"""
    import random
    from datetime import date
    
    templates = {
        "invoice": {
            "invoice_number": f"INV-{random.randint(10000, 99999)}",
            "invoice_date": date.today().isoformat(),
            "vendor_name": "Sample Vendor Inc.",
            "total_amount": str(random.randint(1000, 50000)),
            "description": "Sample invoice description extracted from OCR",
        },
        "receipt": {
            "receipt_number": f"RCP-{random.randint(10000, 99999)}",
            "receipt_date": date.today().isoformat(),
            "vendor_name": "Retail Store",
            "amount": str(random.randint(100, 5000)),
        },
        "contract": {
            "contract_title": "Service Agreement",
            "parties": "Party A and Party B",
            "effective_date": date.today().isoformat(),
            "contract_terms": "Terms and conditions extracted from document",
        },
    }
    return templates.get(document_type_id, {})

class DocumentProcessorHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)
        
        # Get document types
        if path == "/api/config/document-types":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(document_types).encode())
            return
        
        # Get specific document type
        if path.startswith("/api/config/document-types/"):
            type_id = path.split("/")[-1]
            doc_type = next((dt for dt in document_types if dt["id"] == type_id), None)
            if doc_type:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(doc_type).encode())
            else:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Document type not found"}).encode())
            return
        
        # Get document list
        if path == "/api/documents":
            status = query_params.get("status", [None])[0]
            review_status = query_params.get("reviewStatus", [None])[0]
            search = query_params.get("search", [""])[0]
            page = int(query_params.get("page", [1])[0])
            page_size = int(query_params.get("pageSize", [20])[0])
            
            items = list(documents.values())
            
            if status:
                items = [d for d in items if d["status"] == status]
            if review_status:
                items = [d for d in items if d["reviewStatus"] == review_status]
            if search:
                search_lower = search.lower()
                items = [d for d in items if 
                        search_lower in d["fileName"].lower() or
                        search_lower in d["ocrText"].lower() or
                        search_lower in json.dumps(d["extractedData"]).lower()]
            
            start = (page - 1) * page_size
            end = start + page_size
            paginated = items[start:end]
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            response = {
                "items": paginated,
                "total": len(items),
                "page": page,
                "pageSize": page_size
            }
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Get single document
        if path.startswith("/api/documents/") and not any(x in path for x in ["/approve", "/reject", "/reprocess", "/search"]):
            doc_id = path.split("/")[-1]
            if doc_id in documents:
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(documents[doc_id]).encode())
            else:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Document not found"}).encode())
            return
        
        # Health check
        if path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "message": "API server is running"}).encode())
            return
        
        # Serve static files (app.html, etc.)
        if path == "/" or path == "/app.html":
            try:
                with open("app.html", "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html")
                self.end_headers()
                self.wfile.write(content)
                return
            except FileNotFoundError:
                pass
        
        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Upload document
        if path == "/api/documents/upload":
            try:
                data = json.loads(body)
                doc_type_id = data.get("documentTypeId")
                file_name = data.get("fileName", "document.pdf")
                
                if not doc_type_id:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Document type is required"}).encode())
                    return
                
                doc_type = next((dt for dt in document_types if dt["id"] == doc_type_id), None)
                if not doc_type:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Invalid document type"}).encode())
                    return
                
                doc_id = f"DOC-{str(uuid.uuid4())[:8].upper()}"
                ocr_text = f"Sample OCR text extracted from {file_name}"
                extracted_data = simulate_ai_processing(doc_type_id, ocr_text)
                
                import random
                document = {
                    "id": doc_id,
                    "fileName": file_name,
                    "fileType": "application/pdf",
                    "fileSize": random.randint(100000, 5000000),
                    "uploadedAt": datetime.now().isoformat(),
                    "documentTypeId": doc_type_id,
                    "status": "completed",
                    "extractedData": extracted_data,
                    "ocrText": ocr_text,
                    "confidence": 0.85 + random.random() * 0.15,
                    "processingErrors": [],
                    "metadata": {
                        "pageCount": 1,
                        "language": "en",
                        "classification": {
                            "type": doc_type["name"],
                            "confidence": 0.92
                        },
                        "entities": []
                    },
                    "reviewStatus": "pending",
                    "comments": ""
                }
                
                documents[doc_id] = document
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(document).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
            return
        
        # Approve document
        if "/approve" in path:
            doc_id = path.split("/")[-2]
            if doc_id in documents:
                data = json.loads(body) if body else {}
                documents[doc_id]["reviewStatus"] = "approved"
                documents[doc_id]["reviewedAt"] = datetime.now().isoformat()
                documents[doc_id]["reviewedBy"] = "Current User"
                documents[doc_id]["comments"] = data.get("comments", "")
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(documents[doc_id]).encode())
            else:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Document not found"}).encode())
            return
        
        # Reject document
        if "/reject" in path:
            doc_id = path.split("/")[-2]
            if doc_id in documents:
                data = json.loads(body) if body else {}
                documents[doc_id]["reviewStatus"] = "rejected"
                documents[doc_id]["reviewedAt"] = datetime.now().isoformat()
                documents[doc_id]["reviewedBy"] = "Current User"
                documents[doc_id]["comments"] = data.get("comments", "")
                documents[doc_id]["status"] = "needs-review"
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(documents[doc_id]).encode())
            else:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Document not found"}).encode())
            return
        
        # Reprocess document
        if "/reprocess" in path:
            doc_id = path.split("/")[-2]
            if doc_id in documents:
                doc = documents[doc_id]
                extracted_data = simulate_ai_processing(doc["documentTypeId"], doc["ocrText"])
                
                import random
                doc["status"] = "completed"
                doc["extractedData"] = extracted_data
                doc["confidence"] = 0.85 + random.random() * 0.15
                doc["processingErrors"] = []
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                result = {
                    "documentId": doc_id,
                    "status": "success",
                    "extractedData": extracted_data,
                    "ocrText": doc["ocrText"],
                    "confidence": doc["confidence"]
                }
                self.wfile.write(json.dumps(result).encode())
            else:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Document not found"}).encode())
            return
        
        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_PUT(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path.startswith("/api/documents/") and "/" not in path.split("/")[-1]:
            doc_id = path.split("/")[-1]
            if doc_id in documents:
                data = json.loads(body) if body else {}
                documents[doc_id].update(data)
                documents[doc_id]["id"] = doc_id  # Preserve ID
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(documents[doc_id]).encode())
            else:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Document not found"}).encode())
            return
        
        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_DELETE(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path.startswith("/api/documents/"):
            doc_id = path.split("/")[-1]
            if doc_id in documents:
                del documents[doc_id]
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode())
            else:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Document not found"}).encode())
            return
        
        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

if __name__ == "__main__":
    PORT = 3000
    server = HTTPServer(("127.0.0.1", PORT), DocumentProcessorHandler)
    print(f"🚀 AI Document Processor API Server running on http://localhost:{PORT}")
    print(f"   Health Check: http://localhost:{PORT}/api/health")
    print(f"   Document Types: http://localhost:{PORT}/api/config/document-types")
    print("\nPress Ctrl+C to stop the server")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n✓ Server stopped gracefully")
        server.server_close()
