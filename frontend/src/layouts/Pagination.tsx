import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex justify-center mt-6">
            <nav className="inline-flex -space-x-px">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                >
                    Previous
                </button>
                {pageNumbers.map((pageNumber) => (
                    <button
                        key={pageNumber}
                        onClick={() => onPageChange(pageNumber)}
                        className={`px-3 py-2 leading-tight border border-gray-300 ${
                            pageNumber === currentPage
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white hover:bg-gray-100 hover:text-gray-700'
                        }`}
                    >
                        {pageNumber}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                >
                    Next
                </button>
            </nav>
        </div>
    );
};

export default Pagination;