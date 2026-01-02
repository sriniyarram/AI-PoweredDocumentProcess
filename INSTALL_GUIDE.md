# Installation Guide - AI Document Processor

## Quick Install Option 1: Python (Recommended)

### Step 1: Download Python
1. Go to https://www.python.org/downloads/
2. Click "Download Python 3.11" (or latest 3.x version)
3. Run the installer

### Step 2: Important - Add Python to PATH
**During installation, CHECK THIS BOX:**
- ✅ "Add Python 3.x to PATH"

This is critical - without it, Windows won't find Python.

### Step 3: Restart Your Terminal
Close and reopen PowerShell/Command Prompt completely.

### Step 4: Verify Installation
```powershell
python --version
```

Should output: `Python 3.11.x` (or similar)

### Step 5: Start the Server
```powershell
cd C:\Work\AI-PoweredDocumentProcess
python server.py
```

Expected output:
```
Server running on http://localhost:3000
Health check: http://localhost:3000/api/health
Press Ctrl+C to stop
```

### Step 6: Open in Browser
Open your browser and go to:
```
http://localhost:3000/app.html
```

---

## Quick Install Option 2: Node.js

### Step 1: Download Node.js
1. Go to https://nodejs.org/
2. Click "LTS" (Long Term Support)
3. Run the installer

### Step 2: Use Default Settings
Accept all defaults during installation.

### Step 3: Restart Your Terminal
Close and reopen PowerShell/Command Prompt completely.

### Step 4: Verify Installation
```powershell
node --version
npm --version
```

### Step 5: Start the Server
```powershell
cd C:\Work\AI-PoweredDocumentProcess
node server-simple.js
```

Expected output:
```
Server running at http://localhost:8080
```

### Step 6: Open in Browser
```
http://localhost:8080/app.html
```

---

## Quick Install Option 3: Full React Development

Requires Node.js installed first.

### Step 1: Install Dependencies
```powershell
cd C:\Work\AI-PoweredDocumentProcess
npm install
```

### Step 2: Start Development Server
```powershell
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
```

### Step 3: Open in Browser
```
http://localhost:5173
```

---

## Troubleshooting

### "Python not found" Error
- **Problem**: Python installed but not in PATH
- **Solution**: 
  1. Go to Settings > Apps > Advanced app settings > App execution aliases
  2. Find "python.exe" 
  3. Toggle it ON
  4. Restart terminal

### "No module named 'http.server'"
- **Problem**: Corrupted Python installation
- **Solution**: Uninstall and reinstall Python from https://www.python.org/downloads/

### Port 3000/8080 Already in Use
- **Problem**: Another application using the port
- **Solution**: Edit server.py or server-simple.js to change the port

### CORS Errors in Browser
- **Problem**: API server not running
- **Solution**: Ensure server.py or server-simple.js is running in a terminal

---

## Application URLs After Installation

| Component | URL | Notes |
|-----------|-----|-------|
| Standalone HTML | http://localhost:3000/app.html | Python server |
| Standalone HTML | http://localhost:8080/app.html | Node.js server |
| React App | http://localhost:5173 | Full dev environment |
| Health Check | http://localhost:3000/api/health | Python server status |
| Health Check | http://localhost:8080/api/health | Node.js server status |

---

## Features You'll Have Access To

✅ Document Upload (PDF, Images, Documents)
✅ AI-Powered Data Extraction (Simulated)
✅ Document Search
✅ Document Review & Approval
✅ Document Processing History
✅ Three Document Types: Invoice, Receipt, Contract
✅ Confidence Scoring
✅ OCR Preview
✅ User Authentication (Demo)

---

## Next Steps After Running

1. Upload a document (PDF or image)
2. Review extracted data
3. Approve or reject extraction
4. Search for documents
5. View document details

---

## Need Help?

Refer to:
- README.md - Full feature documentation
- QUICKREF.txt - Quick reference guide
- FILES.md - File structure overview
- STARTUP.md - More detailed setup instructions

