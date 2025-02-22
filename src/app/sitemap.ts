import { MetadataRoute } from 'next'
import { databases } from '@/lib/appwrite'
import { Models, Query, Databases } from 'appwrite'

interface Product extends Models.Document {
  name: string;
}

interface Blog extends Models.Document {
  title: string;
}

// Helper function to handle Appwrite database queries
async function listDocuments<T extends Models.Document>(
  databaseId: string,
  collectionId: string
): Promise<Models.DocumentList<T>> {
  return (databases.listDocuments as (databaseId: string, collectionId: string, queries?: string[]) => Promise<Models.DocumentList<T>>)(
    databaseId,
    collectionId,
    [Query.limit(100)]
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://raisspices.com'

  // Get all products
  const products = await listDocuments<Product>(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!
  )

  // Get all blog posts
  const blogs = await listDocuments<Blog>(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID!
  )

  const productUrls = products.documents.map((product: Product) => ({
    url: `${baseUrl}/product/${product.$id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const blogUrls = blogs.documents.map((blog: Blog) => ({
    url: `${baseUrl}/blog/${blog.$id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...productUrls,
    ...blogUrls,
  ]
}
