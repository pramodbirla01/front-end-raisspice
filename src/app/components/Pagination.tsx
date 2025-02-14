import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages,
  onPageChange 
}) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;
    
    if (showEllipsis) {
      // ...existing ellipsis logic...
    } else {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    }

    return pages.map((pageNum: number | string, index) => (
      <button
        key={index}
        onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
        className={`px-4 py-2 mx-1 rounded-md transition-colors ${
          pageNum === currentPage
            ? 'bg-darkRed text-white'
            : pageNum === '...'
            ? 'cursor-default'
            : 'hover:bg-gray-100'
        }`}
        disabled={pageNum === '...'}
      >
        {pageNum}
      </button>
    ));
  };

  return (
    <div className="flex justify-center items-center mt-8 mb-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className="flex items-center">
        {renderPageNumbers()}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;