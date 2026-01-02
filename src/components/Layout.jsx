import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Menu,
  MenuItem,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'

function Layout({ children }) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const { user, logout } = useAuthStore()

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleMenuClose()
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}
          >
            📄 AI Document Processor
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">
            Upload
          </Button>
          <Button color="inherit" component={RouterLink} to="/search">
            Search
          </Button>
          <Button color="inherit" onClick={handleMenuOpen}>
            {user?.name}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>Role: {user?.role}</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        {children}
      </Container>

      <Box component="footer" sx={{ py: 3, textAlign: 'center', borderTop: '1px solid #eee' }}>
        <Typography variant="body2" color="textSecondary">
          © 2024 AI Document Processor. All rights reserved.
        </Typography>
      </Box>
    </Box>
  )
}

export default Layout
