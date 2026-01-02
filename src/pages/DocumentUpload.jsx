import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useUploadDocument, useDocumentTypes } from '../hooks/useDocuments'
import { useNavigate } from 'react-router-dom'

function DocumentUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedDocType, setSelectedDocType] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  
  const navigate = useNavigate()
  const uploadMutation = useUploadDocument()
  const { data: documentTypes = [] } = useDocumentTypes()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
      setUploadError('')
      setUploadSuccess('')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file')
      return
    }

    if (!selectedDocType) {
      setUploadError('Please select a document type')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('documentTypeId', selectedDocType)

    try {
      const result = await uploadMutation.mutateAsync(formData)
      setUploadSuccess('Document uploaded successfully! Processing...')
      setSelectedFile(null)
      setSelectedDocType('')
      setTimeout(() => {
        navigate(`/review/${result.id}`)
      }, 2000)
    } catch (error: any) {
      setUploadError(error.response?.data?.message || 'Upload failed')
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Upload Document
      </Typography>

      {uploadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uploadError}
        </Alert>
      )}

      {uploadSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {uploadSuccess}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Document Type
          </Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Document Type</InputLabel>
            <Select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              label="Document Type"
              disabled={uploadMutation.isPending}
            >
              <MenuItem value="">-- Select a type --</MenuItem>
              {documentTypes.map((docType: any) => (
                <MenuItem key={docType.id} value={docType.id}>
                  {docType.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Upload File
          </Typography>
          <Paper
            sx={{
              border: '2px dashed #1976d2',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: '#f5f5f5',
              transition: 'all 0.3s',
              '&:hover': {
                backgroundColor: '#e3f2fd',
              },
            }}
            component="label"
          >
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept=".pdf,.jpg,.png,.tiff,.docx,.xlsx,.txt"
              disabled={uploadMutation.isPending}
            />
            <CloudUploadIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
            <Typography variant="h6">
              {selectedFile ? selectedFile.name : 'Drag and drop or click to select'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Supported formats: PDF, JPG, PNG, TIFF, DOCX, XLSX, TXT
            </Typography>
          </Paper>

          {selectedFile && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>File:</strong> {selectedFile.name}
              </Typography>
              <Typography variant="body2">
                <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleUpload}
              disabled={!selectedFile || !selectedDocType || uploadMutation.isPending}
              sx={{ flex: 1 }}
            >
              {uploadMutation.isPending ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                setSelectedFile(null)
                setSelectedDocType('')
              }}
              disabled={uploadMutation.isPending}
            >
              Clear
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Info */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Available Document Types
          </Typography>
          {documentTypes.length > 0 ? (
            <List>
              {documentTypes.map((docType: any) => (
                <ListItem key={docType.id}>
                  <ListItemText
                    primary={docType.name}
                    secondary={docType.description}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No document types configured yet.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default DocumentUpload
