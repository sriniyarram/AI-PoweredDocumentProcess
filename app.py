#!/usr/bin/env python3
"""
AI Document Processor - Simple Server
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import json
import uuid
from datetime import datetime

documents = {}

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urlparse(self.path).path
        
        # Root path - serve HTML
        if path in ["/", "/index.html", "/app.html", "/simple.html"]:
            try:
                # Try to read simple.html
                try:
                    with open("simple.html", "r", encoding="utf-8") as f:
                        html = f.read()
                except FileNotFoundError:
                    # Fall back to app.html
                    with open("app.html", "r", encoding="utf-8") as f:
                        html = f.read()
                
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(html.encode("utf-8"))
                return
            except Exception as e:
                print(f"Error loading HTML: {e}")
                self.send_response(500)
                self.send_header("Content-Type", "text/plain")
                self.end_headers()
                self.wfile.write(f"Error: {e}".encode())
                return
        
        # API health check
        if path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode())
            return
        
        # Get all documents
        if path == "/api/documents":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            items = list(documents.values())
            response = {"items": items, "total": len(items)}
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Not found
        self.send_response(404)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_POST(self):
        path = urlparse(self.path).path
        
        if path == "/api/documents/upload":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            
            try:
                data = json.loads(body)
                doc = {
                    "id": str(uuid.uuid4()),
                    "fileName": data.get("fileName", "document"),
                    "documentType": data.get("documentType", "invoice"),
                    "status": "completed",
                    "uploadedAt": datetime.now().isoformat(),
                    "extractedData": {}
                }
                documents[doc["id"]] = doc
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(doc).encode())
                return
            except:
                pass
        
        self.send_response(400)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Bad request"}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        pass

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 3000), Handler)
    print("Server running at http://localhost:3000")
    print("Press Ctrl+C to stop")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Server stopped")
        server.server_close()
