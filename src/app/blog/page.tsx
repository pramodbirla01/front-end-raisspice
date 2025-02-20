'use client';
import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import type { Blog } from '@/types/blog';
import BlogCard from '@/components/BlogCard';
import { Models } from 'appwrite';

const BLOGS_PER_PAGE = 12;

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await (databases.listDocuments<Models.Document & Blog>)(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_BLOG_COLLECTION_ID!
        );
        setBlogs(response.documents as Blog[]);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const paginatedBlogs = blogs.slice((page - 1) * BLOGS_PER_PAGE, page * BLOGS_PER_PAGE);
  const totalPages = Math.ceil(blogs.length / BLOGS_PER_PAGE);

  return (
    <div className="min-h-screen bg-bgColor">
      <div className="relative py-24 mb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-darkRed/10 to-transparent" />
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-center mb-6 text-gray-800">
            Our Blog
          </h1>
          <p className="text-xl text-center text-gray-600 max-w-2xl mx-auto">
            Discover our latest stories, recipes, and spice-related insights
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-darkRed"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {paginatedBlogs.map((blog) => (
                <BlogCard key={blog.$id} blog={blog} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 rounded ${
                      pageNum === page
                        ? 'bg-darkRed text-white'
                        : 'bg-white text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
