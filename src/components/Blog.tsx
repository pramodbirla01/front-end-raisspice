'use client';
import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import type { Blog } from '@/types/blog';
import BlogCard from './BlogCard';
import Link from 'next/link';
import { Models } from 'appwrite';

function Blog() {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await (databases.listDocuments<Models.Document & Blog>)(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID!
        );
        setBlogs(response.documents as Blog[]);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <section className="py-12 bg-bgColor">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Latest Blog Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.slice(0, 3).map((blog) => (
            <BlogCard key={blog.$id} blog={blog} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/blog" className="btn-primary px-6 py-2 border border-premium-900 rounded-lg inline-flex items-center hover:bg-premium-900 hover:text-white transition-all duration-200">
            View All Blog
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Blog;
