import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/Modal";
import type { Product, StockMovementType } from "../../types";

interface StockMovementModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  defaultType: Exclude<StockMovementType, "SALE">;
  submitting: boolean;
  onSubmit: (values: {
    productId: string;
    type: Exclude<StockMovementType, "SALE">;
    quantity: number;
    purchasePrice?: number;
    comment?: string;
  }) => Promise<void>;
}

const TYPE_OPTIONS: { value: Exclude<StockMovementType, "SALE">; label: string }[] = [
  { value: "IN", label: "Киреше (жеткирүү)" },
  { value: "OUT", label: "Чыгаша" },
  { value: "WRITE_OFF", label: "Списание" },
  { value: "ADJUSTMENT", label: "Оңдоо (инвентаризация)" },
];

export function StockMovementModal({ open, onClose, products, defaultType, submitting, onSubmit }: StockMovementModalProps) {
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<Exclude<StockMovementType, "SALE">>(defaultType);
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setProductId("");
      setType(defaultType);
      setQuantity("");
      setPurchasePrice("");
      setComment("");
    }
  }, [open, defaultType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !quantity) return;
    await onSubmit({
      productId,
      type,
      quantity: Number(quantity),
      purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
      comment: comment || undefined,
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form className="stack gap-4" onSubmit={handleSubmit}>
        <h2 className="card-title">Складга кыймыл кошуу</h2>

        <div className="field">
          <label className="field-label">Аракет түрү</label>
          <select className="select" value={type} onChange={(e) => setType(e.target.value as Exclude<StockMovementType, "SALE">)}>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label">Товар</label>
          <select className="select" value={productId} onChange={(e) => setProductId(e.target.value)} required>
            <option value="">Товарды тандаңыз</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (учурда: {p.quantity})
              </option>
            ))}
          </select>
        </div>

        <div className="form-grid">
          <div className="field">
            <label className="field-label">Саны</label>
            <input type="number" min={0.001} step="0.001" className="input" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>
          {type === "IN" && (
            <div className="field">
              <label className="field-label">Сатып алуу баасы</label>
              <input type="number" min={0} step="0.01" className="input" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="Сом" />
            </div>
          )}
        </div>

        <div className="field">
          <label className="field-label">Жеткирүүчү / комментарий</label>
          <input className="input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Мисалы: ОсОО Example" />
        </div>

        <div className="row gap-3" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Жокко чыгаруу
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Сакталууда..." : "Сактоо"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
