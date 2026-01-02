import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
} from '@mui/material'
import { useForm, FormProvider, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import FieldRenderer from './FieldRenderer'
import { ExtractionTemplate, FieldConfig } from '../types'

interface DynamicFormProps {
  template: ExtractionTemplate
  initialData?: Record<string, any>
  onSubmit: (data: Record<string, any>) => Promise<void>
  isLoading?: boolean
}

function DynamicForm({
  template,
  initialData = {},
  onSubmit,
  isLoading = false,
}: DynamicFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Build validation schema dynamically
  const buildValidationSchema = () => {
    const shape: any = {}
    template.fields.forEach((field) => {
      let fieldSchema: any = yup.string()
      if (field.required) {
        fieldSchema = fieldSchema.required(`${field.label} is required`)
      }
      if (field.pattern) {
        fieldSchema = fieldSchema.matches(new RegExp(field.pattern), 'Invalid format')
      }
      if (field.type === 'number') {
        fieldSchema = yup.number()
        if (field.required) {
          fieldSchema = fieldSchema.required(`${field.label} is required`)
        }
      }
      if (field.type === 'email') {
        fieldSchema = fieldSchema.email('Invalid email')
        if (field.required) {
          fieldSchema = fieldSchema.required(`${field.label} is required`)
        }
      }
      shape[field.id] = fieldSchema
    })
    return yup.object().shape(shape)
  }

  const methods = useForm({
    resolver: yupResolver(buildValidationSchema()),
    defaultValues: template.fields.reduce((acc, field) => {
      acc[field.id] = initialData[field.id] || ''
      return acc
    }, {} as Record<string, any>),
  })

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      setSubmitError(null)
      await onSubmit(data)
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to submit form')
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {template.name}
        </Typography>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <FormProvider {...methods}>
          <Box component="form" onSubmit={methods.handleSubmit(handleSubmit)}>
            {/* Render sections if available */}
            {template.sections && template.sections.length > 0 ? (
              template.sections.map((section) => (
                <Box key={section.id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {section.label}
                  </Typography>
                  {template.fields
                    .filter((f) => section.fields.includes(f.id))
                    .map((field) => (
                      <FieldRenderer
                        key={field.id}
                        field={field}
                        value={methods.watch(field.id)}
                        onChange={(value) => methods.setValue(field.id, value)}
                        error={methods.formState.errors[field.id]?.message}
                        disabled={isLoading}
                      />
                    ))}
                </Box>
              ))
            ) : (
              /* Render all fields without sections */
              template.fields.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={methods.watch(field.id)}
                  onChange={(value) => methods.setValue(field.id, value)}
                  error={methods.formState.errors[field.id]?.message}
                  disabled={isLoading}
                />
              ))
            )}

            <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
              >
                Submit
              </Button>
              <Button
                variant="outlined"
                onClick={() => methods.reset()}
                disabled={isLoading}
              >
                Clear
              </Button>
            </Box>
          </Box>
        </FormProvider>
      </CardContent>
    </Card>
  )
}

export default DynamicForm
