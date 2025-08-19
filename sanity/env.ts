// Environment variables for Sanity
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ch7h72uf'

// Debugging - these will show in the browser console
if (typeof window !== 'undefined') {
  console.log('🔍 Sanity Env Debug:')
  console.log('Project ID:', projectId)
  console.log('Dataset:', dataset)
  console.log('API Version:', apiVersion)
}