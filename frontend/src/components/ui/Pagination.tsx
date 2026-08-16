import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <span className="pagination-info">
        {total} ичинен {from}–{to} көрсөтүлүүдө
      </span>
      <div className="pagination-controls">
        <button className="btn btn-secondary btn-sm btn-icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Мурунку">
          <ChevronLeft size={16} />
        </button>
        <button className="btn btn-secondary btn-sm" disabled style={{ minWidth: 64 }}>
          {page} / {totalPages}
        </button>
        <button
          className="btn btn-secondary btn-sm btn-icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Кийинки"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
