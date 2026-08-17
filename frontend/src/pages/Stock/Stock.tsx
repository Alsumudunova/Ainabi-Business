import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Boxes, Package, PackageX, Plus, TrendingDown, Wallet } from "lucide-react";
import { KpiCard } from "../../components/ui/KpiCard";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge } from "../../components/ui/Badge";
import { Pagination } from "../../components/ui/Pagination";
import { StockMovementModal } from "./StockMovementModal";
import { useToast } from "../../hooks/useToast";
import * as productService from "../../services/product.service";
import * as stockService from "../../services/stock.service";
import { extractErrorMessage } from "../../services/api";
import { formatDateTime, formatMoney, formatNumber, unitLabel } from "../../utils/format";
import { stockMovementTypeLabels } from "../../utils/labels";
import type { Product, StockMovement, StockMovementType } from "../../types";
import "./Stock.css";

type TabKey = "BALANCE" | "IN" | "OUT" | "WRITE_OFF" | "HISTORY";

const TABS: { key: TabKey; label: string }[] = [
  { key: "BALANCE", label: "Калдык" },
  { key: "IN", label: "Киреше" },
  { key: "OUT", label: "Чыгаша" },
  { key: "WRITE_OFF", label: "Списание" },
  { key: "HISTORY", label: "Кыймыл тарыхы" },
];

export default function Stock() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<TabKey>("BALANCE");
  const [summary, setSummary] = useState<stockService.StockSummary | null>(null);
  const [reorderSuggestions, setReorderSuggestions] = useState<stockService.ReorderSuggestion[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [movements, setMovements] = useState<StockMovement[] | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadSummary = useCallback(() => {
    stockService.getStockSummary().then(setSummary).catch(() => undefined);
    stockService.getReorderSuggestions().then(setReorderSuggestions).catch(() => undefined);
  }, []);

  const loadProducts = useCallback(() => {
    setProducts(null);
    productService
      .listProducts({ status: "ACTIVE", pageSize: 100 })
      .then((res) => setProducts(res.items))
      .catch((error) => showToast({ variant: "error", title: "Жүктөлгөн жок", message: extractErrorMessage(error) }));
  }, [showToast]);

  const loadMovements = useCallback(
    (type?: StockMovementType) => {
      setMovements(null);
      stockService
        .listMovements({ type, page, pageSize: 15 })
        .then((res) => {
          setMovements(res.items);
          setTotal(res.total);
          setTotalPages(res.totalPages);
        })
        .catch((error) => showToast({ variant: "error", title: "Жүктөлгөн жок", message: extractErrorMessage(error) }));
    },
    [page, showToast],
  );

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  useEffect(() => {
    if (tab === "BALANCE") loadProducts();
    else if (tab === "HISTORY") loadMovements(undefined);
    else loadMovements(tab as StockMovementType);
  }, [tab, loadProducts, loadMovements]);

  async function handleCreateMovement(values: {
    productId: string;
    type: Exclude<StockMovementType, "SALE">;
    quantity: number;
    purchasePrice?: number;
    comment?: string;
  }) {
    setSubmitting(true);
    try {
      await stockService.createMovement(values);
      showToast({ variant: "success", title: "Складга кыймыл кошулду" });
      setModalOpen(false);
      loadSummary();
      loadProducts();
      if (tab !== "BALANCE") loadMovements(tab === "HISTORY" ? undefined : (tab as StockMovementType));
    } catch (error) {
      showToast({ variant: "error", title: "Сакталган жок", message: extractErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stack gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Склад</h1>
          <p className="page-subtitle">Товар калдыктарын жана кыймылдарын көзөмөлдөңүз</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          Товар киргизүү
        </button>
      </div>

      <div className="stock-summary-grid">
        {!summary ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="card card-pad" style={{ height: 132 }} />)
        ) : (
          <>
            <KpiCard index={0} label="Жалпы товар" value={formatNumber(summary.totalProducts)} icon={Package} accent="primary" />
            <KpiCard index={1} label="Складдын наркы" value={formatMoney(summary.totalValue)} icon={Wallet} accent="primary" />
            <KpiCard index={2} label="Аз калган товар" value={formatNumber(summary.lowStock)} icon={AlertTriangle} accent="warning" />
            <KpiCard index={3} label="Запаста жок" value={formatNumber(summary.outOfStock)} icon={PackageX} accent="danger" />
          </>
        )}
      </div>

      {reorderSuggestions && reorderSuggestions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <TrendingDown size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
                Заказ бериш убактысы
              </h2>
              <p className="card-subtitle">Акыркы 14 күндүн сатуу ылдамдыгына жараша, бул товарлар жакында бүтөт</p>
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th className="table-cell-num">Учурдагы калдык</th>
                  <th className="table-cell-num">Күнүнө сатылат</th>
                  <th>Болжолдуу мөөнөт</th>
                </tr>
              </thead>
              <tbody>
                {reorderSuggestions.map((r) => (
                  <tr key={r.productId}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td className="table-cell-num">
                      {formatNumber(r.quantity)} {unitLabel(r.unit)}
                    </td>
                    <td className="table-cell-num">
                      {formatNumber(r.dailyVelocity)} {unitLabel(r.unit)}
                    </td>
                    <td>
                      <Badge variant={r.daysUntilStockout !== null && r.daysUntilStockout <= 2 ? "danger" : "warning"}>
                        {r.daysUntilStockout === 0 ? "Бүгүн-эртең бүтөт" : `~${r.daysUntilStockout} күндөн кийин бүтөт`}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="stock-toolbar">
          <div className="tabs">
            {TABS.map((t) => (
              <button key={t.key} className={`tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "BALANCE" ? (
          products === null ? (
            <div className="card-pad">
              <SkeletonRows rows={6} height={48} />
            </div>
          ) : products.length === 0 ? (
            <EmptyState icon={<Boxes size={26} />} title="Товар жок" subtitle="Товарлар бетинен товар кошуңуз." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Товар</th>
                    <th>Категория</th>
                    <th className="table-cell-num">Калдык</th>
                    <th className="table-cell-num">Мин. калдык</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td className="text-muted">{p.categoryName ?? "—"}</td>
                      <td className="table-cell-num">
                        {formatNumber(p.quantity)} {unitLabel(p.unit)}
                      </td>
                      <td className="table-cell-num">
                        {formatNumber(p.minQuantity)} {unitLabel(p.unit)}
                      </td>
                      <td>
                        {p.stockStatus === "OUT" ? (
                          <Badge variant="danger">Запаста жок</Badge>
                        ) : p.stockStatus === "LOW" ? (
                          <Badge variant="warning">Аз калды</Badge>
                        ) : (
                          <Badge variant="success">Жетиштүү</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : movements === null ? (
          <div className="card-pad">
            <SkeletonRows rows={6} height={48} />
          </div>
        ) : movements.length === 0 ? (
          <EmptyState icon={<Boxes size={26} />} title="Кыймыл табылган жок" subtitle="Бул бөлүктө азырынча жазуу жок." />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Товар</th>
                    <th>Түрү</th>
                    <th className="table-cell-num">Саны</th>
                    <th className="table-cell-num">Баасы</th>
                    <th>Жеткирүүчү / комментарий</th>
                    <th>Кызматкер</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.productName}</td>
                      <td>
                        <Badge variant={m.type === "IN" ? "success" : m.type === "SALE" ? "info" : m.type === "WRITE_OFF" ? "danger" : "warning"}>
                          {stockMovementTypeLabels[m.type]}
                        </Badge>
                      </td>
                      <td className="table-cell-num">{formatNumber(m.quantity)}</td>
                      <td className="table-cell-num">{m.purchasePrice ? formatMoney(m.purchasePrice) : "—"}</td>
                      <td className="text-muted">{m.supplierName ?? m.comment ?? "—"}</td>
                      <td className="text-muted">{m.employeeName ?? "—"}</td>
                      <td className="text-muted">{formatDateTime(m.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={15} onPageChange={setPage} />
          </>
        )}
      </div>

      <StockMovementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        products={products ?? []}
        defaultType={tab === "IN" || tab === "OUT" || tab === "WRITE_OFF" ? tab : "IN"}
        submitting={submitting}
        onSubmit={handleCreateMovement}
      />
    </div>
  );
}
