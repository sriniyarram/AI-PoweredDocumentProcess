import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DocumentUpload from './pages/DocumentUpload'
import DocumentReview from './pages/DocumentReview'
import DocumentSearch from './pages/DocumentSearch'
import DocumentDetail from './pages/DocumentDetail'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

const queryClient = new QueryClient()

function App() {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<DocumentUpload />} />
              <Route path="/review/:documentId" element={<DocumentReview />} />
              <Route path="/search" element={<DocumentSearch />} />
              <Route path="/document/:documentId" element={<DocumentDetail />} />
            </Routes>
          </Layout>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
