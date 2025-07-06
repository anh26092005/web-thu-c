import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false if statically generating pages, using ISR or tag-based revalidation
  token: process.env.SANITY_API_WRITE_TOKEN, // Thêm write token
})

// Client cho read-only operations (có thể dùng CDN)
export const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})
