import axios from 'axios'
import { Document, DocumentListResponse, DocumentFilter, PaginationParams, ProcessingResult } from '../types'

const API_BASE = '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Document API
export const documentApi = {
  upload: (formData: FormData) =>
    api.post<Document>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getList: (filter?: DocumentFilter, pagination?: PaginationParams) =>
    api.get<DocumentListResponse>('/documents', {
      params: { ...filter, ...pagination },
    }),

  getById: (documentId: string) =>
    api.get<Document>(`/documents/${documentId}`),

  update: (documentId: string, data: Partial<Document>) =>
    api.put<Document>(`/documents/${documentId}`, data),

  delete: (documentId: string) =>
    api.delete(`/documents/${documentId}`),

  approve: (documentId: string, comments?: string) =>
    api.post<Document>(`/documents/${documentId}/approve`, { comments }),

  reject: (documentId: string, comments: string) =>
    api.post<Document>(`/documents/${documentId}/reject`, { comments }),

  reprocess: (documentId: string) =>
    api.post<ProcessingResult>(`/documents/${documentId}/reprocess`),

  search: (query: string) =>
    api.get<DocumentListResponse>('/documents/search', { params: { q: query } }),
}

// Configuration API
export const configApi = {
  getDocumentTypes: () =>
    api.get('/config/document-types'),

  getDocumentType: (typeId: string) =>
    api.get(`/config/document-types/${typeId}`),

  createDocumentType: (data: any) =>
    api.post('/config/document-types', data),

  updateDocumentType: (typeId: string, data: any) =>
    api.put(`/config/document-types/${typeId}`, data),
}

export default api
