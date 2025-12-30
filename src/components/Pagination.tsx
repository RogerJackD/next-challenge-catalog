import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationMeta } from '../types/product';

interface PaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ meta, onPageChange }: PaginationProps) => {
    const { page, totalPages, hasNextPage, hasPreviousPage, total, limit } = meta;

    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    // Generar array de páginas a mostrar
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            // Mostrar todas las páginas
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Mostrar páginas con elipsis
            if (page <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = page - 1; i <= page + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <div className="text-sm text-muted-foreground">
                Mostrando <span className="font-medium">{startItem}</span> a{' '}
                <span className="font-medium">{endItem}</span> de{' '}
                <span className="font-medium">{total}</span> productos
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(1)}
                    disabled={!hasPreviousPage}
                    className="hidden sm:flex"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPreviousPage}
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum, idx) => (
                        pageNum === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                                ...
                            </span>
                        ) : (
                            <Button
                                key={pageNum}
                                variant={page === pageNum ? "default" : "outline"}
                                size="icon"
                                onClick={() => onPageChange(pageNum as number)}
                                className="w-10 h-10"
                            >
                                {pageNum}
                            </Button>
                        )
                    ))}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(page + 1)}
                    disabled={!hasNextPage}
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(totalPages)}
                    disabled={!hasNextPage}
                    className="hidden sm:flex"
                >
                    <ChevronsRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};