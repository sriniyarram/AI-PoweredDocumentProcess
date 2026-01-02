import React, { useState } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { useDocument, useDocumentType, useApproveDocument, useRejectDocument } from '../hooks/useDocuments'
import DocumentViewer from '../components/DocumentViewer'
import DynamicForm from '../components/DynamicForm'

function DocumentReview() {
  const { documentId } = useParams()
  const [editMode, setEditMode] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectComments, setRejectComments] = useState('')

  const { data: document, isLoading: docLoading, error: docError } = useDocument(documentId || '')
  const { data: docType } = useDocumentType(document?.documentTypeId)
  const approveMutation = useApproveDocument()
  const rejectMutation = useRejectDocument()

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

  const handleApprove = async () => {
    if (documentId) {
      try {
        await approveMutation.mutateAsync({ documentId })
        alert('Document approved successfully')
      } catch (error: any) {
        alert(error.message || 'Failed to approve document')
      }
    }
  }

  const handleRejectSubmit = async () => {
    if (documentId) {
      try {
        await rejectMutation.mutateAsync({ documentId, comments: rejectComments })
        setRejectDialogOpen(false)
        alert('Document rejected')
      } catch (error: any) {
        alert(error.message || 'Failed to reject document')
      }
    }
  }

  const handleEditSubmit = async (data: Record<string, any>) => {
    if (documentId) {
      try {
        // This would call an update API
        console.log('Updated data:', data)
        alert('Document updated successfully')
        setEditMode(false)
      } catch (error: any) {
        throw new Error(error.message || 'Failed to update document')
      }
    }
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Review Document: {document.fileName}
      </Typography>

      {editMode && docType ? (
        <DynamicForm
          template={docType.extractionTemplate}
          initialData={document.extractedData}
          onSubmit={handleEditSubmit}
          isLoading={approveMutation.isPending || rejectMutation.isPending}
        />
      ) : (
        <DocumentViewer
          document={document}
          documentType={docType}
          onEdit={() => setEditMode(true)}
          onApprove={handleApprove}
          onReject={() => setRejectDialogOpen(true)}
          isLoading={approveMutation.isPending || rejectMutation.isPending}
        />
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Document</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason/Comments"
            value={rejectComments}
            onChange={(e) => setRejectComments(e.target.value)}
            placeholder="Why are you rejecting this document?"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRejectSubmit}
            variant="contained"
            color="error"
            disabled={!rejectComments || rejectMutation.isPending}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DocumentReview
