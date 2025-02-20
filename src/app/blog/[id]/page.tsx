'use client';
import { useEffect, useState } from 'react';
import { databases, storage } from '@/lib/appwrite';
import type { Blog } from '@/types/blog';
import Image from 'next/image';
import { Models } from 'appwrite';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';

export default function BlogPost() {
  const params = useParams();
  const blogId = params?.id as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) return;
      
      try {
        const response = await (databases.getDocument<Models.Document & Blog>)(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID!,
          blogId
        );
        setBlog(response);
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-darkRed"></div>
      </div>
    );
  }

  if (!blog) {
    return <div>Blog not found</div>;
  }

  const imageUrl = blog?.headerImage 
    ? storage.getFilePreview(
        process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!,
        blog.headerImage
      )
    : '/images/blog-placeholder.jpg';

  return (
    <article className="min-h-screen bg-bgColor">
      {/* Hero Section with Full-width Image */}
      <div className="relative h-[70vh] w-full">
        <Image
          src={imageError ? '/images/blog-placeholder.jpg' : imageUrl.toString()}
          alt={blog?.title || 'Blog post'}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white">
          <div className="container mx-auto max-w-5xl">
            <div className="text-sm mb-4 opacity-90">
              {format(new Date(blog.$createdAt), 'MMMM dd, yyyy')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {blog.title}
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl">
              {blog.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 max-w-4xl py-16">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-8 md:p-12">
          <div 
            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-800 prose-headings:mt-8 prose-headings:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6 prose-img:rounded-xl prose-img:my-8 prose-a:text-darkRed hover:prose-a:text-lightRed prose-strong:text-gray-800"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </div>
    </article>
  );
}
