import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Configure multer for file uploads
const uploadDir = join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const upload = multer({
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|jpg|png|tiff|docx|xlsx|txt)$/i
    if (allowed.test(file.originalname)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  },
})

// In-memory data storage (replace with database in production)
let documents = {}
let documentIdCounter = 1000

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
      sections: [
        { id: 'basic', name: 'basic', label: 'Basic Information', fields: ['invoice_number', 'invoice_date'] },
        { id: 'vendor', name: 'vendor', label: 'Vendor Details', fields: ['vendor_name', 'total_amount'] },
      ],
    },
    validationRules: [],
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
    validationRules: [],
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
    validationRules: [],
  },
]

// Helper function to simulate AI processing
function simulateAIProcessing(documentTypeId, ocrText) {
  const templates = {
    'invoice': {
      invoice_number: 'INV-' + Math.floor(Math.random() * 10000),
      invoice_date: new Date().toISOString().split('T')[0],
      vendor_name: 'Sample Vendor Inc.',
      total_amount: Math.floor(Math.random() * 10000),
      description: 'Sample invoice description extracted from OCR',
    },
    'receipt': {
      receipt_number: 'RCP-' + Math.floor(Math.random() * 10000),
      receipt_date: new Date().toISOString().split('T')[0],
      vendor_name: 'Retail Store',
      amount: Math.floor(Math.random() * 5000),
    },
    'contract': {
      contract_title: 'Service Agreement',
      parties: 'Party A and Party B',
      effective_date: new Date().toISOString().split('T')[0],
      contract_terms: 'Terms and conditions extracted from document',
    },
  }

  return templates[documentTypeId] || {}
}

// Routes

// Get all document types
app.get('/api/config/document-types', (req, res) => {
  res.json(documentTypes)
})

// Get specific document type
app.get('/api/config/document-types/:typeId', (req, res) => {
  const docType = documentTypes.find(dt => dt.id === req.params.typeId)
  if (!docType) {
    return res.status(404).json({ error: 'Document type not found' })
  }
  res.json(docType)
})

// Upload document
app.post('/api/documents/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const documentTypeId = req.body.documentTypeId
    if (!documentTypeId) {
      return res.status(400).json({ error: 'Document type is required' })
    }

    const docType = documentTypes.find(dt => dt.id === documentTypeId)
    if (!docType) {
      return res.status(400).json({ error: 'Invalid document type' })
    }

    const documentId = `DOC-${documentIdCounter++}`
    const ocrText = `Sample OCR text extracted from ${req.file.originalname}`
    const extractedData = simulateAIProcessing(documentTypeId, ocrText)

    documents[documentId] = {
      id: documentId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedAt: new Date().toISOString(),
      documentTypeId,
      status: 'completed',
      extractedData,
      ocrText,
      confidence: 0.85 + Math.random() * 0.15,
      processingErrors: [],
      metadata: {
        pageCount: 1,
        language: 'en',
        classification: {
          type: docType.name,
          confidence: 0.92,
        },
        entities: [],
      },
      reviewStatus: 'pending',
      comments: '',
    }

    res.json(documents[documentId])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get document list
app.get('/api/documents', (req, res) => {
  const { status, reviewStatus, search, page = 1, pageSize = 20 } = req.query
  let items = Object.values(documents)

  // Apply filters
  if (status) {
    items = items.filter((d) => d.status === status)
  }
  if (reviewStatus) {
    items = items.filter((d) => d.reviewStatus === reviewStatus)
  }
  if (search) {
    const query = search.toLowerCase()
    items = items.filter(
      (d) =>
        d.fileName.toLowerCase().includes(query) ||
        d.ocrText.toLowerCase().includes(query) ||
        JSON.stringify(d.extractedData).toLowerCase().includes(query)
    )
  }

  // Pagination
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedItems = items.slice(start, end)

  res.json({
    items: paginatedItems,
    total: items.length,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
  })
})

// Get single document
app.get('/api/documents/:documentId', (req, res) => {
  const doc = documents[req.params.documentId]
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' })
  }
  res.json(doc)
})

// Update document
app.put('/api/documents/:documentId', (req, res) => {
  const doc = documents[req.params.documentId]
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' })
  }

  documents[req.params.documentId] = {
    ...doc,
    ...req.body,
    id: doc.id, // Preserve ID
  }

  res.json(documents[req.params.documentId])
})

// Approve document
app.post('/api/documents/:documentId/approve', (req, res) => {
  const doc = documents[req.params.documentId]
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' })
  }

  documents[req.params.documentId] = {
    ...doc,
    reviewStatus: 'approved',
    reviewedAt: new Date().toISOString(),
    reviewedBy: 'Current User',
    comments: req.body.comments || '',
  }

  res.json(documents[req.params.documentId])
})

// Reject document
app.post('/api/documents/:documentId/reject', (req, res) => {
  const doc = documents[req.params.documentId]
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' })
  }

  documents[req.params.documentId] = {
    ...doc,
    reviewStatus: 'rejected',
    reviewedAt: new Date().toISOString(),
    reviewedBy: 'Current User',
    comments: req.body.comments || '',
    status: 'needs-review',
  }

  res.json(documents[req.params.documentId])
})

// Delete document
app.delete('/api/documents/:documentId', (req, res) => {
  if (!documents[req.params.documentId]) {
    return res.status(404).json({ error: 'Document not found' })
  }
  delete documents[req.params.documentId]
  res.json({ success: true })
})

// Reprocess document
app.post('/api/documents/:documentId/reprocess', (req, res) => {
  const doc = documents[req.params.documentId]
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' })
  }

  const extractedData = simulateAIProcessing(doc.documentTypeId, doc.ocrText)
  documents[req.params.documentId] = {
    ...doc,
    status: 'completed',
    extractedData,
    confidence: 0.85 + Math.random() * 0.15,
    processingErrors: [],
  }

  res.json({
    documentId: doc.id,
    status: 'success',
    extractedData,
    ocrText: doc.ocrText,
    confidence: documents[req.params.documentId].confidence,
  })
})

// Search documents
app.get('/api/documents/search', (req, res) => {
  const { q } = req.query
  if (!q) {
    return res.status(400).json({ error: 'Search query is required' })
  }

  const query = q.toString().toLowerCase()
  const items = Object.values(documents).filter(
    (d) =>
      d.fileName.toLowerCase().includes(query) ||
      d.ocrText.toLowerCase().includes(query) ||
      JSON.stringify(d.extractedData).toLowerCase().includes(query)
  )

  res.json({
    items,
    total: items.length,
    page: 1,
    pageSize: items.length,
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Document Processor API Server running on http://localhost:${PORT}`)
  console.log(`   Health Check: http://localhost:${PORT}/api/health`)
})
