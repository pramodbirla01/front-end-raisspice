'use client';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { blogData } from '@/data/blogData';

export default function BlogPost() {
  const { id } = useParams();
  const blog = blogData.find(post => post.id === Number(id));

  if (!blog) {
    return <div>Blog post not found</div>;
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <div className="relative w-full h-[400px] mb-8">
        <Image
          src={blog.image}
          alt={blog.title}
          fill
          className="object-cover rounded-lg"
        />
      </div>
      <h1 className="text-4xl font-bold mb-6">{blog.title}</h1>
      <div className="text-gray-600 mb-4">
        Published on {new Date(blog.date).toLocaleDateString()}
      </div>
      <div className="prose max-w-none">
        <p className="whitespace-pre-line text-lg leading-relaxed">
          {blog.content}
        </p>
      </div>
    </article>
  );
}
