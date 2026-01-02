# AI-Powered Document Processor

A comprehensive React web application for document processing, classification, extraction, and enrichment using AI models.

## Features

- 📄 Document upload & ingestion (PDF, JPG, PNG, TIFF, DOCX, XLSX, TXT)
- 🤖 AI processing pipeline (classification, OCR, extraction)
- ⚙️ Dynamic configuration for document types
- 👥 Human-in-the-loop review & approval workflow
- 🔍 Document search & filtering
- 📋 Detailed document view with extracted data
- 👤 User roles & permissions (Viewer, Reviewer, Admin)
- 📊 Extraction templates with dynamic field rendering
- ✅ Validation rules and data quality checks
- 📈 Document status tracking and audit trail

## Architecture

### Frontend
- **React 18** with Hooks
- **Vite** for fast development and building
- **Material-UI (MUI)** for beautiful UI components
- **React Query** for efficient data fetching and caching
- **React Router** for navigation
- **React Hook Form** for form management
- **Zustand** for state management
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **Multer** for file uploads
- **CORS** enabled for frontend integration
- RESTful API architecture

## Project Structure

```
ai-document-processor/
├── src/
│   ├── api/           # API client and endpoints
│   ├── components/    # Reusable React components
│   │   ├── Layout.jsx
│   │   ├── DynamicForm.jsx
│   │   ├── FieldRenderer.jsx
│   │   └── DocumentViewer.jsx
│   ├── context/       # State management (Zustand stores)
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   │   ├── DocumentUpload.jsx
│   │   ├── DocumentReview.jsx
│   │   ├── DocumentSearch.jsx
│   │   └── DocumentDetail.jsx
│   ├── types/         # TypeScript type definitions
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # Entry point
│   └── index.css      # Global styles
├── server/
│   ├── index.js       # Express server & API routes
│   └── package.json
├── index.html         # HTML entry point
├── package.json       # Frontend dependencies
├── vite.config.js     # Vite configuration
└── README.md
```

## Installation

### Prerequisites
- Node.js 16+ and npm

### Setup

1. **Install dependencies**
```bash
npm install
cd server && npm install && cd ..
```

2. **Start the development server (API)**
```bash
npm run server
```

The API will be available at `http://localhost:3000`

3. **Start the React development server** (in a new terminal)
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Document Upload
1. Navigate to the Upload page (default route)
2. Select a document type from the dropdown
3. Choose a file to upload
4. Click "Upload"
5. You'll be redirected to the Review page

### Document Review
1. View the extracted data from the document
2. Verify the accuracy of the extraction
3. Edit fields if needed
4. Approve or Reject the document
5. Add comments for rejected documents

### Document Search
1. Use the search box to find documents by name, content, or extracted data
2. Filter by status or review status
3. Click on a document to view details
4. Pending documents can be reviewed directly from the list

## Configuration

### Document Types
Document types are configured in the backend. Each document type includes:
- Extraction template with field definitions
- Validation rules
- Supported file formats
- Custom metadata

### API Endpoints

#### Document Management
- `POST /api/documents/upload` - Upload a new document
- `GET /api/documents` - Get document list with filters
- `GET /api/documents/:documentId` - Get document details
- `PUT /api/documents/:documentId` - Update document
- `DELETE /api/documents/:documentId` - Delete document
- `POST /api/documents/:documentId/approve` - Approve document
- `POST /api/documents/:documentId/reject` - Reject document
- `POST /api/documents/:documentId/reprocess` - Reprocess document
- `GET /api/documents/search` - Search documents

#### Configuration
- `GET /api/config/document-types` - Get all document types
- `GET /api/config/document-types/:typeId` - Get specific document type

## Development

### Build for Production
```bash
npm run build
npm run preview
```

### Supported Document Types

1. **Invoice**
   - Fields: Invoice Number, Date, Vendor Name, Total Amount, Description
   - Formats: PDF, JPG, PNG

2. **Receipt**
   - Fields: Receipt Number, Date, Vendor Name, Amount
   - Formats: PDF, JPG, PNG

3. **Contract**
   - Fields: Title, Parties, Effective Date, Key Terms
   - Formats: PDF, DOCX

## User Roles & Permissions

- **Viewer**: Can view documents and extracted data
- **Reviewer**: Can upload, review, approve/reject documents
- **Admin**: Full access including configuration

## Key Features Explained

### Dynamic Form Rendering
The DynamicForm component renders extraction templates dynamically based on document type configuration. It includes:
- Type-specific field rendering
- Real-time validation
- Error messages
- Organized sections

### AI Processing Pipeline
The backend simulates an AI processing pipeline that:
1. Extracts text via OCR
2. Classifies the document
3. Extracts structured data
4. Calculates confidence scores

### Review & Approval Workflow
- Documents are marked as "needs-review" after processing
- Reviewers can approve or reject with comments
- Edit mode allows correcting extracted data
- Full audit trail of all changes

## Performance Optimizations

- React Query for efficient data fetching and caching
- Lazy loading of components
- Image optimization
- Vite's fast HMR (Hot Module Replacement)
- Minimal bundle size

## Security Features

- CORS protection
- Input validation on frontend and backend
- Secure file upload handling
- User authentication ready (can be extended)
- Audit logging capability

## Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Advanced AI model integration (OpenAI, Google Vision, etc.)
- [ ] Real OCR implementation
- [ ] Multi-language support
- [ ] Advanced analytics & reporting
- [ ] Batch processing
- [ ] API rate limiting
- [ ] Webhook support
- [ ] Document versioning
- [ ] Advanced permission system

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions, please create an issue or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: January 2024
