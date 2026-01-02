import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentApi, configApi } from '../api/client'
import { Document, DocumentFilter, PaginationParams, DocumentListResponse } from '../types'

// Document Hooks
export const useDocumentList = (filter?: DocumentFilter, pagination?: PaginationParams) => {
  return useQuery({
    queryKey: ['documents', filter, pagination],
    queryFn: () => documentApi.getList(filter, pagination).then(res => res.data),
  })
}

export const useDocument = (documentId: string) => {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: () => documentApi.getById(documentId).then(res => res.data),
    enabled: !!documentId,
  })
}

export const useUploadDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => documentApi.upload(formData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export const useApproveDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ documentId, comments }: { documentId: string; comments?: string }) =>
      documentApi.approve(documentId, comments).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export const useRejectDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ documentId, comments }: { documentId: string; comments: string }) =>
      documentApi.reject(documentId, comments).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export const useReprocessDocument = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (documentId: string) =>
      documentApi.reprocess(documentId).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export const useSearchDocuments = (query: string) => {
  return useQuery({
    queryKey: ['documents', 'search', query],
    queryFn: () => documentApi.search(query).then(res => res.data),
    enabled: !!query && query.length > 2,
  })
}

// Configuration Hooks
export const useDocumentTypes = () => {
  return useQuery({
    queryKey: ['documentTypes'],
    queryFn: () => configApi.getDocumentTypes().then(res => res.data),
  })
}

export const useDocumentType = (typeId: string) => {
  return useQuery({
    queryKey: ['documentType', typeId],
    queryFn: () => configApi.getDocumentType(typeId).then(res => res.data),
    enabled: !!typeId,
  })
}
