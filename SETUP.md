# AI Document Processor - Setup & Running Guide

## Overview

The AI Document Processor is a comprehensive web application for document upload, processing, review, and management using simulated AI technologies.

### What's Included

✅ **Frontend**: Complete React-based UI with Material Design (HTML/CSS/JavaScript)
✅ **Backend API**: RESTful API with in-memory data storage
✅ **Document Management**: Upload, review, approve, reject, and search documents
✅ **Dynamic Configuration**: 3 pre-configured document types (Invoice, Receipt, Contract)
✅ **Simulated AI**: Mock OCR and data extraction pipeline

---

## Quick Start (Easiest Method)

### Option 1: Using Web Browser (No Installation Required)

1. **Open the HTML application directly** in your browser:
   - File path: `app.html` in the workspace
   - The application will work with a mock local API

2. **Features available without a server**:
   - View document types
   - Simulate document uploads
   - Mock document processing
   - Review and approve workflows

### Option 2: With Python Server (Recommended)

**Prerequisites**: Python 3.7+

```bash
# Navigate to the workspace
cd C:\Work\AI-PoweredDocumentProcess

# Start the server
python server.py
```

Then open in browser: `http://localhost:3000/`

### Option 3: With Node.js Server

**Prerequisites**: Node.js 16+ with npm

```bash
# Navigate to the workspace
cd C:\Work\AI-PoweredDocumentProcess

# Start the server
node server-simple.js
```

Then open in browser: `http://localhost:8080/app.html`

---

## Installation Guide

### Prerequisites

Choose one of the following based on your preference:

#### A. Python Installation (Recommended)
1. Download Python 3.8+ from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Verify: `python --version`

#### B. Node.js Installation
1. Download Node.js 16+ from https://nodejs.org/
2. Includes npm automatically
3. Verify: `node --version` and `npm --version`

---

## Running the Application

### Method 1: Python Server (Localhost:3000)

```bash
cd C:\Work\AI-PoweredDocumentProcess
python server.py
```

**Output**:
```
🚀 AI Document Processor API Server running on http://localhost:3000
   Health Check: http://localhost:3000/api/health
   Document Types: http://localhost:3000/api/config/document-types
```

Open browser to: `http://localhost:3000/app.html`

### Method 2: Node.js Server (Localhost:8080)

```bash
cd C:\Work\AI-PoweredDocumentProcess
node server-simple.js
```

**Output**:
```
╔════════════════════════════════════════════════════════════╗
║   AI Document Processor - Web Server                       ║
╚════════════════════════════════════════════════════════════╝

🚀 Server running on: http://localhost:8080
📄 Application: http://localhost:8080/app.html
🔗 API: http://localhost:8080/api
```

Open browser to: `http://localhost:8080/app.html`

### Method 3: React Development Server (Node.js)

```bash
# First install dependencies
npm install

# Then start the dev server
npm run dev
```

Open browser to: `http://localhost:5173`

---

## Using the Application

### Main Features

#### 1. **Upload Documents**
- Click "Upload" in the navigation
- Select document type (Invoice, Receipt, or Contract)
- Choose a file to upload
- System simulates AI processing and extracts data
- Auto-redirected to review page

#### 2. **Review Documents**
- View extracted data from documents
- See OCR text preview
- Check confidence scores
- Approve or reject documents
- Add comments/feedback

#### 3. **Search Documents**
- Use the search box to find documents
- Filter by status or review status
- Search by filename, content, or extracted data
- Click documents to view details

#### 4. **Document Details**
- Full document information
- Extracted structured data
- Confidence metrics
- OCR text preview
- Review history and comments

### Document Types

#### Invoice (Financial)
**Fields**:
- Invoice Number
- Invoice Date
- Vendor Name
- Total Amount
- Description

#### Receipt (Financial)
**Fields**:
- Receipt Number
- Receipt Date
- Vendor Name
- Amount

#### Contract (Legal)
**Fields**:
- Contract Title
- Parties Involved
- Effective Date
- Key Terms

---

## API Endpoints

### Configuration
```
GET /api/config/document-types          # List all document types
GET /api/config/document-types/:typeId  # Get specific type
```

### Document Management
```
POST   /api/documents/upload             # Upload a document
GET    /api/documents                    # List documents (with filters)
GET    /api/documents/:documentId        # Get document details
PUT    /api/documents/:documentId        # Update document
DELETE /api/documents/:documentId        # Delete document
POST   /api/documents/:documentId/approve # Approve document
POST   /api/documents/:documentId/reject  # Reject document
POST   /api/documents/:documentId/reprocess # Reprocess document
GET    /api/documents/search?q=query     # Search documents
```

### Health Check
```
GET /api/health                          # Server status
```

---

## Project Structure

```
ai-document-processor/
├── app.html                    # Main HTML application
├── server.py                   # Python API server
├── server-simple.js           # Node.js API server
├── server/                    # Express.js backend (optional)
│   ├── index.js
│   └── package.json
├── src/                       # React components (for React dev)
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── api/
│   ├── context/
│   ├── types/
│   └── App.jsx
├── package.json              # Frontend dependencies
├── vite.config.js           # Vite configuration
├── README.md                # Full documentation
└── SETUP.md                 # This file
```

---

## Troubleshooting

### Port Already in Use
If you see "Port X is already in use":

**Python**:
```bash
# Kill the process using port 3000
# Windows: netstat -ano | findstr :3000
# Find the PID and kill it
taskkill /PID <PID> /F
```

**Node.js**:
```bash
# Change the port in the code or use:
node server-simple.js --port 8081
```

### CORS Errors
- Both Python and Node.js servers have CORS enabled
- The HTML application includes proper CORS headers
- No action needed in most cases

### Module Not Found Errors (Node.js)
```bash
# Reinstall dependencies
npm install
```

### Python Not Found
```bash
# Download Python from https://www.python.org/downloads/
# Or use Windows Store: python from Store
# Add to PATH during installation
```

---

## Features Overview

### Document Processing Pipeline
1. **Upload** → User selects and uploads document
2. **AI Processing** → Simulated OCR, classification, extraction
3. **Data Extraction** → Structured data extracted based on type
4. **Review** → Human review of extracted data
5. **Approval** → Document approved or rejected with feedback

### Key Capabilities
- ✅ Multiple document types support
- ✅ Dynamic extraction templates
- ✅ Confidence scoring
- ✅ Human-in-the-loop review
- ✅ Full document history
- ✅ Search and filtering
- ✅ Responsive design
- ✅ Audit trail ready

---

## Technology Stack

### Frontend (app.html)
- HTML5, CSS3, JavaScript
- Font Awesome icons
- No external framework dependencies (pure JS)
- Responsive grid layout
- Modern browser support

### Backend Options
- **Python**: Built-in `http.server` module
- **Node.js**: Express.js (optional)

### Data Storage
- In-memory storage (for demo)
- Ready for database integration

---

## Development & Customization

### Adding New Document Types
Edit the server file (Python or Node.js) and add to the `documentTypes` array:

```python
# In server.py
{
    "id": "new-type",
    "name": "New Document Type",
    "category": "Category Name",
    "description": "Description",
    "extractionTemplate": {
        "fields": [...]
    }
}
```

### Connecting to Real AI Services
The `simulateAIProcessing()` function is where you would:
- Call OpenAI APIs for text extraction
- Use Google Vision for OCR
- Integrate custom ML models
- Connect to document classification services

### Database Integration
Replace the in-memory `documents` dictionary with:
- PostgreSQL
- MongoDB
- SQL Server
- Any database of choice

---

## Performance Notes

- **Current Implementation**: In-memory storage (resets on server restart)
- **Production Ready**: Add persistent database layer
- **Scalability**: Consider microservices for large document volumes
- **Caching**: React Query/HTTP caching for API responses

---

## Security Considerations

### Current (Development)
- CORS enabled for all origins
- No authentication required
- Mock data only

### Production Recommendations
- Implement JWT authentication
- Restrict CORS origins
- Add file upload validation
- Encrypt sensitive data
- Add rate limiting
- Implement audit logging
- Use HTTPS/TLS
- Database access control

---

## Support & Resources

### File Formats Supported
- PDF, JPG, PNG, TIFF, DOCX, XLSX, TXT

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Getting Help
1. Check the README.md for detailed documentation
2. Review API endpoint documentation above
3. Check browser console for errors (F12)
4. Verify server is running (check health endpoint)

---

## Next Steps

### To Extend the Application:

1. **Add Database**
   - Install PostgreSQL or MongoDB
   - Update server code to use database instead of in-memory storage
   - Implement connection pooling

2. **Integrate Real AI Services**
   - Sign up for OpenAI, Google Cloud Vision, or AWS Textract
   - Replace `simulateAIProcessing()` with real API calls
   - Handle async processing with job queues

3. **Implement Authentication**
   - Add user login/registration
   - Implement JWT token management
   - Add role-based access control

4. **Deploy Application**
   - Use Docker for containerization
   - Deploy to cloud (AWS, Azure, GCP)
   - Set up CI/CD pipeline

---

**Version**: 1.0.0  
**Last Updated**: January 2024  
**Status**: Ready for Development & Demonstration

