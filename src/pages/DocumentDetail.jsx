import React from 'react'
import {
  Box,
  CircularProgress,
  Alert,
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { useDocument, useDocumentType } from '../hooks/useDocuments'
import DocumentViewer from '../components/DocumentViewer'

function DocumentDetail() {
  const { documentId } = useParams()
  const { data: document, isLoading: docLoading, error: docError } = useDocument(documentId || '')
  const { data: docType } = useDocumentType(document?.documentTypeId)

  if (docLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (docError || !document) {
    return (
      <Alert severity="error">
        Failed to load document. Please try again.
      </Alert>
    )
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <DocumentViewer
        document={document}
        documentType={docType}
      />
    </Box>
  )
}

export default DocumentDetail
