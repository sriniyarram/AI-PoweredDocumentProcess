/**
 * Document Type Configuration
 */
export interface DocumentTypeConfig {
  id: string
  name: string
  category: string
  description: string
  extractionTemplate: ExtractionTemplate
  validationRules: ValidationRule[]
  supportedFormats: string[]
}

export interface ExtractionTemplate {
  id: string
  name: string
  fields: FieldConfig[]
  sections?: SectionConfig[]
}

export interface FieldConfig {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'email' | 'currency' | 'multi-line'
  required: boolean
  placeholder?: string
  pattern?: string
  instructions?: string
}

export interface SectionConfig {
  id: string
  name: string
  label: string
  fields: string[] // references to field IDs
}

export interface ValidationRule {
  id: string
  fieldId: string
  type: 'required' | 'pattern' | 'range' | 'custom'
  rule: string
  message: string
}

/**
 * Document Entity
 */
export interface Document {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: string
  documentTypeId: string
  status: 'uploaded' | 'processing' | 'completed' | 'failed' | 'needs-review'
  extractedData: Record<string, any>
  ocrText: string
  confidence: number
  processingErrors?: string[]
  metadata: DocumentMetadata
  reviewStatus: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: string
  comments?: string
}

export interface DocumentMetadata {
  pageCount: number
  language: string
  classification: {
    type: string
    confidence: number
  }
  entities: ExtractedEntity[]
}

export interface ExtractedEntity {
  id: string
  type: string
  value: string
  confidence: number
  position?: {
    page: number
    x: number
    y: number
  }
}

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface DocumentListResponse {
  items: Document[]
  total: number
  page: number
  pageSize: number
}

export interface ProcessingResult {
  documentId: string
  status: 'success' | 'failed'
  extractedData: Record<string, any>
  ocrText: string
  confidence: number
  errors?: string[]
}

/**
 * User & Auth
 */
export interface User {
  id: string
  name: string
  email: string
  role: 'viewer' | 'reviewer' | 'admin'
  permissions: string[]
}

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

/**
 * Filter & Search
 */
export interface DocumentFilter {
  documentTypeId?: string
  status?: Document['status']
  reviewStatus?: Document['reviewStatus']
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
