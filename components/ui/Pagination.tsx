'use client'

import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1)
  }

  const renderPageNumbers = () => {
    const pages: (number | string)[] = []

    pages.push(1)
    if (totalPages >= 2) pages.push(2)

    if (totalPages > 5) {
      if (currentPage > 4) {
        pages.push('...')
      }

      const start = Math.max(3, currentPage)
      const end = Math.min(totalPages - 2, currentPage)
      if (start <= end) {
        for (let i = start; i <= end; i++) {
          pages.push(i)
        }
      }

      if (currentPage < totalPages - 3) {
        pages.push('...')
      }

      if (totalPages - 1 > 2) pages.push(totalPages - 1)
      pages.push(totalPages)
    } else {
      for (let i = 3; i <= totalPages; i++) {
        pages.push(i)
      }
    }

    const uniquePages = pages.filter((item, index) => pages.indexOf(item) === index)

    return uniquePages.map((page, idx) =>
      typeof page === 'number' ? (
        <button
          key={idx}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-md border ${
            currentPage === page
              ? 'bg-accent-gold text-bg-primary border-accent-gold'
              : 'bg-bg-card text-text-secondary border-border hover:border-accent-gold hover:text-accent-gold'
          } transition`}
        >
          {page}
        </button>
      ) : (
        <span key={idx} className="px-2 py-1 text-text-secondary">
          {page}
        </span>
      )
    )
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border bg-bg-card text-text-secondary border-border hover:border-accent-gold hover:text-accent-gold disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Prev
      </button>

      {renderPageNumbers()}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border bg-bg-card text-text-secondary border-border hover:border-accent-gold hover:text-accent-gold disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Next
      </button>
    </div>
  )
}

export default Pagination
