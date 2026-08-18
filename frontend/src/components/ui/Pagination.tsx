import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  const { t } = useTranslation();
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <span className="pagination-info">{t("common.paginationInfo", { total, from, to })}</span>
      <div className="pagination-controls">
        <button className="btn btn-secondary btn-sm btn-icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label={t("common.paginationPrev")}>
          <ChevronLeft size={16} />
        </button>
        <button className="btn btn-secondary btn-sm" disabled style={{ minWidth: 64 }}>
          {page} / {totalPages}
        </button>
        <button
          className="btn btn-secondary btn-sm btn-icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={t("common.paginationNext")}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
