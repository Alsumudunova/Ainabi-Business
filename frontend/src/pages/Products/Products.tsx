import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Barcode, Package, Plus, Search, SquarePen, Trash2 } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import { Pagination } from "../../components/ui/Pagination";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { ProductDrawer, ProductFormValues } from "./ProductDrawer";
import { useToast } from "../../hooks/useToast";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import * as productService from "../../services/product.service";
import * as categoryService from "../../services/category.service";
import { extractErrorMessage } from "../../services/api";
import { formatMoney, formatNumber, unitLabel } from "../../utils/format";
import type { Category, Product } from "../../types";
import "./Products.css";

export default function Products() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(search);
  const [categoryId, setCategoryId] = useState("");
  const [stockFilter, setStockFilter] = useState<"" | "low" | "out">("");
  const [statusFilter, setStatusFilter] = useState<"" | "ACTIVE" | "ARCHIVED">("ACTIVE");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async () => {
    setProducts(null);
    try {
      const result = await productService.listProducts({
        search: debouncedSearch || undefined,
        categoryId: categoryId || undefined,
        status: statusFilter || undefined,
        stock: stockFilter || undefined,
        page,
        pageSize: 10,
      });
      setProducts(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      showToast({ variant: "error", title: "Товарларды жүктөө мүмкүн болбоду", message: extractErrorMessage(error) });
      setProducts([]);
    }
  }, [debouncedSearch, categoryId, statusFilter, stockFilter, page, showToast]);

  // Picks up ?q= even when navigating here while already on this page
  // (e.g. a second global-search hit) since React Router won't remount it.
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId, statusFilter, stockFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    categoryService.listCategories().then(setCategories).catch(() => undefined);
  }, []);

  async function handleSubmit(values: ProductFormValues) {
    setSubmitting(true);
    try {
      if (editing) {
        await productService.updateProduct(editing.id, { ...values, categoryId: values.categoryId || null });
        showToast({ variant: "success", title: "Товар өзгөртүлдү" });
      } else {
        await productService.createProduct({ ...values, categoryId: values.categoryId || null });
        showToast({ variant: "success", title: "Товар ийгиликтүү кошулду" });
      }
      setDrawerOpen(false);
      setEditing(null);
      loadProducts();
    } catch (error) {
      showToast({ variant: "error", title: "Сакталган жок", message: extractErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productService.deleteProduct(deleteTarget.id);
      showToast({ variant: "success", title: "Товар өчүрүлдү" });
      setDeleteTarget(null);
      loadProducts();
    } catch (error) {
      showToast({ variant: "error", title: "Өчүрүлгөн жок", message: extractErrorMessage(error) });
    } finally {
      setDeleting(false);
    }
  }

  const hasFilters = !!debouncedSearch || !!categoryId || !!stockFilter || statusFilter !== "ACTIVE";

  return (
    <div className="stack gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Товарлар</h1>
          <p className="page-subtitle">Дүкөнүңүздөгү бардык товарларды башкарыңыз</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setDrawerOpen(true);
          }}
        >
          <Plus size={18} />
          Товар кошуу
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <div className="input-with-icon">
            <Search size={16} />
            <input className="input" placeholder="Товар же штрих-код издөө" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Бардык категория</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "" | "ACTIVE" | "ARCHIVED")}>
            <option value="ACTIVE">Бар товарлар</option>
            <option value="ARCHIVED">Архивдегилер</option>
            <option value="">Баары</option>
          </select>
          <select className="select" value={stockFilter} onChange={(e) => setStockFilter(e.target.value as "" | "low" | "out")}>
            <option value="">Бардык калдык</option>
            <option value="low">Аз калган</option>
            <option value="out">Запаста жок</option>
          </select>
        </div>

        {products === null ? (
          <div className="card-pad">
            <SkeletonRows rows={6} height={52} />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Package size={26} />}
            title={hasFilters ? "Эч нерсе табылган жок" : "Азырынча товар жок"}
            subtitle={hasFilters ? "Издөө шарттарын өзгөртүп көрүңүз." : "Биринчи товарыңызды кошуп баштаңыз."}
            action={
              !hasFilters && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "var(--space-2)" }}
                  onClick={() => {
                    setEditing(null);
                    setDrawerOpen(true);
                  }}
                >
                  <Plus size={16} /> Товар кошуу
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Товар</th>
                    <th>Штрих-код</th>
                    <th>Категория</th>
                    <th className="table-cell-num">Сатып алуу</th>
                    <th className="table-cell-num">Сатуу</th>
                    <th className="table-cell-num">Пайда</th>
                    <th className="table-cell-num">Калдык</th>
                    <th>Статус</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="product-cell">
                          <div className="product-thumb">
                            {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <Package size={18} />}
                          </div>
                          <div className="product-name-cell">
                            <div className="product-name">{p.name}</div>
                            {p.sku && <div className="product-sku">{p.sku}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="text-muted">
                        {p.barcode ? (
                          <span className="row gap-1">
                            <Barcode size={14} /> {p.barcode}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{p.categoryName ?? "—"}</td>
                      <td className="table-cell-num">{formatMoney(p.purchasePrice)}</td>
                      <td className="table-cell-num">{formatMoney(p.salePrice)}</td>
                      <td className="table-cell-num">{formatMoney(p.profit)}</td>
                      <td className="table-cell-num">
                        {formatNumber(p.quantity)} {unitLabel(p.unit)}
                      </td>
                      <td>
                        {p.status === "ARCHIVED" ? (
                          <Badge variant="neutral">Архивде</Badge>
                        ) : p.stockStatus === "OUT" ? (
                          <Badge variant="danger">Жок</Badge>
                        ) : p.stockStatus === "LOW" ? (
                          <Badge variant="warning">Аз калды</Badge>
                        ) : (
                          <Badge variant="success">Бар</Badge>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            title="Өзгөртүү"
                            onClick={() => {
                              setEditing(p);
                              setDrawerOpen(true);
                            }}
                          >
                            <SquarePen size={16} />
                          </button>
                          <button className="btn btn-ghost btn-icon btn-sm" title="Өчүрүү" onClick={() => setDeleteTarget(p)}>
                            <Trash2 size={16} color="var(--color-danger-text)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={10} onPageChange={setPage} />
          </>
        )}
      </div>

      <ProductDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        categories={categories}
        product={editing}
        submitting={submitting}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Товарды өчүрөсүзбү?"
        description={`"${deleteTarget?.name}" товары архивге жөнөтүлөт жана тизмеде көрүнбөй калат.`}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
