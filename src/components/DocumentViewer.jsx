import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import { Document, DocumentTypeConfig } from '../types'

interface DocumentViewerProps {
  document: Document
  documentType?: DocumentTypeConfig
  onEdit?: () => void
  onApprove?: () => void
  onReject?: () => void
  isLoading?: boolean
}

function DocumentViewer({
  document,
  documentType,
  onEdit,
  onApprove,
  onReject,
  isLoading = false,
}: DocumentViewerProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'processing':
        return 'info'
      case 'failed':
        return 'error'
      case 'needs-review':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success'
      case 'rejected':
        return 'error'
      case 'pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <Typography variant="h6">Document Information</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                File: <strong>{document.fileName}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Type: <strong>{documentType?.name || document.documentTypeId}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Uploaded: <strong>{new Date(document.uploadedAt).toLocaleString()}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Size: <strong>{(document.fileSize / 1024).toFixed(2)} KB</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
              <Chip
                label={document.status.toUpperCase()}
                color={getStatusColor(document.status) as any}
                sx={{ mr: 1, mb: 1 }}
              />
              <Chip
                label={`Review: ${document.reviewStatus.toUpperCase()}`}
                color={getReviewStatusColor(document.reviewStatus) as any}
              />
            </Grid>
          </Grid>

          {document.processingErrors && document.processingErrors.length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Processing Errors:</strong>
              </Typography>
              <ul>
                {document.processingErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Confidence Score */}
      {document.confidence !== undefined && (
        <Card>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Processing Confidence: {(document.confidence * 100).toFixed(1)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={document.confidence * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </CardContent>
        </Card>
      )}

      {/* Extracted Data */}
      {documentType && Object.keys(document.extractedData).length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Extracted Data
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Field</strong></TableCell>
                    <TableCell><strong>Value</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documentType.extractionTemplate.fields.map((field) => (
                    <TableRow key={field.id}>
                      <TableCell>{field.label}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {document.extractedData[field.id] || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* OCR Text Preview */}
      {document.ocrText && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              OCR Text Preview
            </Typography>
            <Box
              sx={{
                backgroundColor: '#f5f5f5',
                p: 2,
                borderRadius: 1,
                maxHeight: 300,
                overflow: 'auto',
              }}
            >
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {document.ocrText.substring(0, 500)}
                {document.ocrText.length > 500 ? '...' : ''}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Review Comments */}
      {document.comments && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Review Comments
            </Typography>
            <Typography variant="body2">{document.comments}</Typography>
            {document.reviewedBy && document.reviewedAt && (
              <Typography variant="caption" color="textSecondary">
                Reviewed by {document.reviewedBy} on {new Date(document.reviewedAt).toLocaleString()}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        {document.reviewStatus === 'pending' && (
          <>
            <Button
              variant="contained"
              color="success"
              onClick={onApprove}
              disabled={isLoading}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={onReject}
              disabled={isLoading}
            >
              Reject
            </Button>
          </>
        )}
        {onEdit && (
          <Button
            variant="outlined"
            onClick={onEdit}
            disabled={isLoading}
          >
            Edit
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default DocumentViewer
