import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useDocumentList } from '../hooks/useDocuments'
import { useNavigate } from 'react-router-dom'

function DocumentSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    reviewStatus: '',
  })
  const navigate = useNavigate()

  const { data: result, isLoading, error } = useDocumentList(
    {
      status: filters.status as any,
      reviewStatus: filters.reviewStatus as any,
      search: searchQuery,
    },
    { page: 1, pageSize: 20 }
  )

  const documents = result?.items || []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled automatically by the hook
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      'completed': 'success',
      'processing': 'info',
      'failed': 'error',
      'needs-review': 'warning',
      'uploaded': 'default',
    }
    return colors[status] || 'default'
  }

  const getReviewStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      'approved': 'success',
      'rejected': 'error',
      'pending': 'warning',
    }
    return colors[status] || 'default'
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Search Documents
      </Typography>

      {/* Search Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Search by file name, content, or extracted data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              Search
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              size="small"
              sx={{ minWidth: 150 }}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">All Statuses</option>
              <option value="uploaded">Uploaded</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="needs-review">Needs Review</option>
              <option value="failed">Failed</option>
            </TextField>

            <TextField
              select
              label="Review Status"
              value={filters.reviewStatus}
              onChange={(e) => setFilters({ ...filters, reviewStatus: e.target.value })}
              size="small"
              sx={{ minWidth: 150 }}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">All Review Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error">
          Failed to search documents. Please try again.
        </Alert>
      )}

      {!isLoading && documents.length === 0 && (
        <Alert severity="info">
          {searchQuery ? 'No documents found matching your search.' : 'No documents found.'}
        </Alert>
      )}

      {!isLoading && documents.length > 0 && (
        <>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Found {result?.total || 0} document(s)
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>File Name</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Review Status</strong></TableCell>
                  <TableCell><strong>Uploaded</strong></TableCell>
                  <TableCell><strong>Confidence</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow
                    key={doc.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/document/${doc.id}`)}
                  >
                    <TableCell>{doc.fileName}</TableCell>
                    <TableCell>
                      <Chip
                        label={doc.status}
                        size="small"
                        color={getStatusColor(doc.status) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={doc.reviewStatus}
                        size="small"
                        color={getReviewStatusColor(doc.reviewStatus) as any}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {(doc.confidence * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell align="right">
                      {doc.reviewStatus === 'pending' ? (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/review/${doc.id}`)
                          }}
                        >
                          Review
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/document/${doc.id}`)
                          }}
                        >
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  )
}

export default DocumentSearch
