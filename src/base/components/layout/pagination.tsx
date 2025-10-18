'use client';

import { usePathname, useRouter } from 'next/navigation';

import { cn } from '@/base/lib';
import { Pagination as PaginationType } from '@/base/types';

import {
  Pagination as PaginationComp,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';

export function Pagination({ pagination }: { pagination: PaginationType }) {
  const router = useRouter();
  const pathname = usePathname();

  const navigateToPrevPage = () => {
    if (!pagination.hasPreviousPage) return;
    const params = new URLSearchParams(window.location.search);
    params.set('page', (pagination.currentPage - 1).toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const navigateToNextPage = () => {
    if (!pagination.hasNextPage) return;
    const params = new URLSearchParams(window.location.search);
    params.set('page', (pagination.currentPage + 1).toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const { currentPage, totalPage } = pagination;
    const pages: (number | 'ellipsis')[] = [];
    const delta = 2; // Number of pages to show on each side of current page

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPage - 1, currentPage + delta);

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push('ellipsis');
    }

    // Add pages around current page
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPage - 1) {
      pages.push('ellipsis');
    }

    // Always show last page if it's different from first page
    if (totalPage > 1) {
      pages.push(totalPage);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <PaginationComp>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={cn({
              'pointer-events-none opacity-50': !pagination.hasPreviousPage,
            })}
            onClick={() => navigateToPrevPage()}
          />
        </PaginationItem>

        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={pagination.currentPage !== page ? () => navigateToPage(page) : undefined}
                isActive={pagination.currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            className={cn({
              'pointer-events-none opacity-50': !pagination.hasNextPage,
            })}
            onClick={() => navigateToNextPage()}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationComp>
  );
}

export function PaginationSkeleton() {
  return (
    <PaginationComp>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </PaginationComp>
  );
}
