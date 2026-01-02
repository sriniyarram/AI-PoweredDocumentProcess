import React from 'react'
import {
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Box,
  FormHelperText,
} from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { FieldConfig } from '../types'

interface FieldRendererProps {
  field: FieldConfig
  value?: any
  onChange?: (value: any) => void
  error?: string
  disabled?: boolean
}

function FieldRenderer({
  field,
  value,
  onChange,
  error,
  disabled = false,
}: FieldRendererProps) {
  const { control } = useFormContext()

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'currency':
        return (
          <TextField
            fullWidth
            type={field.type === 'email' ? 'email' : field.type === 'currency' ? 'number' : 'text'}
            label={field.label}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            error={!!error}
            helperText={error || field.instructions}
            required={field.required}
            InputProps={field.type === 'currency' ? { startAdornment: '$' } : undefined}
            variant="outlined"
            size="small"
          />
        )

      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={field.label}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            error={!!error}
            helperText={error || field.instructions}
            required={field.required}
            variant="outlined"
            size="small"
          />
        )

      case 'date':
        return (
          <TextField
            fullWidth
            type="date"
            label={field.label}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            error={!!error}
            helperText={error || field.instructions}
            required={field.required}
            variant="outlined"
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        )

      case 'multi-line':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={field.label}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            error={!!error}
            helperText={error || field.instructions}
            required={field.required}
            variant="outlined"
          />
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{ mb: 2 }}>
      {renderField()}
    </Box>
  )
}

export default FieldRenderer
