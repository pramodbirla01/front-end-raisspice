import Image from 'next/image';
import Link from 'next/link';
import { storage } from '@/lib/appwrite';
import type { Blog } from '@/types/blog';
import { format } from 'date-fns';
import { useState } from 'react';

interface BlogCardProps {
  blog: Blog;
}

const BlogCard = ({ blog }: BlogCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  const imageUrl = blog.headerImage 
    ? storage.getFilePreview(
        process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!,
        blog.headerImage
      )
    : '/images/blog-placeholder.jpg';

  const formattedDate = format(new Date(blog.$createdAt), 'MMMM dd, yyyy');

  return (
    <Link href={`/blog/${blog.$id}`}>
      <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
        <div className="relative h-56 overflow-hidden">
          <Image
            src={imageError ? '/images/blog-placeholder.jpg' : imageUrl.toString()}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-7">
          <div className="text-sm text-gray-500 mb-3">{formattedDate}</div>
          <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-darkRed transition-colors duration-300">
            {blog.title}
          </h3>
          <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
            {blog.subtitle}
          </p>
          <div className="text-darkRed font-medium flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
            Read More 
            <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
