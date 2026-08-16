import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer } from "../../components/ui/Drawer";
import type { Category, Product, ProductUnit } from "../../types";
import { formatMoney } from "../../utils/format";
import "./Products.css";

const schema = z.object({
  name: z.string().min(1, "Товар атын жазыңыз"),
  categoryId: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  purchasePrice: z.coerce.number().nonnegative("Сатып алуу баасын жазыңыз"),
  salePrice: z.coerce.number().nonnegative("Сатуу баасын жазыңыз"),
  quantity: z.coerce.number().nonnegative(),
  minQuantity: z.coerce.number().nonnegative(),
  unit: z.enum(["PIECE", "KG", "LITER", "METER", "PACK"]),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
});
export type ProductFormValues = z.infer<typeof schema>;

const UNIT_OPTIONS: { value: ProductUnit; label: string }[] = [
  { value: "PIECE", label: "даана" },
  { value: "KG", label: "кг" },
  { value: "LITER", label: "литр" },
  { value: "METER", label: "метр" },
  { value: "PACK", label: "пачка" },
];

interface ProductDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  categories: Category[];
  product?: Product | null;
  submitting: boolean;
}

export function ProductDrawer({ open, onClose, onSubmit, categories, product, submitting }: ProductDrawerProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { unit: "PIECE", quantity: 0, minQuantity: 0 },
  });

  useEffect(() => {
    if (open) {
      reset(
        product
          ? {
              name: product.name,
              categoryId: product.categoryId ?? undefined,
              sku: product.sku ?? undefined,
              barcode: product.barcode ?? undefined,
              purchasePrice: product.purchasePrice,
              salePrice: product.salePrice,
              quantity: product.quantity,
              minQuantity: product.minQuantity,
              unit: product.unit,
              imageUrl: product.imageUrl ?? undefined,
              description: product.description ?? undefined,
            }
          : { unit: "PIECE", quantity: 0, minQuantity: 0 },
      );
    }
  }, [open, product, reset]);

  const [purchasePrice, salePrice] = watch(["purchasePrice", "salePrice"]);
  const profit = (Number(salePrice) || 0) - (Number(purchasePrice) || 0);
  const margin = Number(purchasePrice) > 0 ? Math.round((profit / Number(purchasePrice)) * 1000) / 10 : 0;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={product ? "Товарды өзгөртүү" : "Жаңы товар кошуу"}
      subtitle={product ? product.name : "Товардын толук маалыматын киргизиңиз"}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Жокко чыгаруу
          </button>
          <button className="btn btn-primary" onClick={handleSubmit(onSubmit)} disabled={submitting}>
            {submitting ? "Сакталууда..." : product ? "Сактоо" : "Товар кошуу"}
          </button>
        </>
      }
    >
      <form className="stack gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label className="field-label">Товар аты</label>
          <input className={`input ${errors.name ? "has-error" : ""}`} placeholder="Мисалы: Coca-Cola 1L" {...register("name")} />
          {errors.name && <span className="field-error">{errors.name.message}</span>}
        </div>

        <div className="form-grid">
          <div className="field">
            <label className="field-label">Категория</label>
            <select className="select" {...register("categoryId")}>
              <option value="">Категория тандаңыз</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Өлчөм бирдиги</label>
            <select className="select" {...register("unit")}>
              {UNIT_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label className="field-label">SKU</label>
            <input className="input" placeholder="SKU-0001" {...register("sku")} />
          </div>
          <div className="field">
            <label className="field-label">Штрих-код</label>
            <input className="input" placeholder="4870001234561" {...register("barcode")} />
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label className="field-label">Сатып алуу баасы (сом)</label>
            <input type="number" step="0.01" className={`input ${errors.purchasePrice ? "has-error" : ""}`} {...register("purchasePrice")} />
            {errors.purchasePrice && <span className="field-error">{errors.purchasePrice.message}</span>}
          </div>
          <div className="field">
            <label className="field-label">Сатуу баасы (сом)</label>
            <input type="number" step="0.01" className={`input ${errors.salePrice ? "has-error" : ""}`} {...register("salePrice")} />
            {errors.salePrice && <span className="field-error">{errors.salePrice.message}</span>}
          </div>
        </div>

        <div className="margin-preview">
          <div className="margin-preview-item">
            <div className="margin-preview-value">{formatMoney(profit)}</div>
            <div className="margin-preview-label">Пайда</div>
          </div>
          <div className="margin-preview-item">
            <div className="margin-preview-value">{margin}%</div>
            <div className="margin-preview-label">Маржа</div>
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label className="field-label">{product ? "Учурдагы калдык" : "Баштапкы саны"}</label>
            <input type="number" step="0.01" className="input" disabled={!!product} {...register("quantity")} />
            {product && <span className="field-hint">Калдыкты Склад бетинен өзгөртүңүз</span>}
          </div>
          <div className="field">
            <label className="field-label">Минималдуу калдык</label>
            <input type="number" step="0.01" className="input" {...register("minQuantity")} />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Сүрөт (URL)</label>
          <input className="input" placeholder="https://..." {...register("imageUrl")} />
        </div>

        <div className="field">
          <label className="field-label">Описание</label>
          <textarea className="textarea" placeholder="Кошумча маалымат..." {...register("description")} />
        </div>
      </form>
    </Drawer>
  );
}
