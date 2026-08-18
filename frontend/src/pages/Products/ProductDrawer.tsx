import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Drawer } from "../../components/ui/Drawer";
import type { Category, Product, ProductUnit } from "../../types";
import { formatMoney } from "../../utils/format";
import "./Products.css";

interface ProductDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  categories: Category[];
  product?: Product | null;
  submitting: boolean;
}

export interface ProductFormValues {
  name: string;
  categoryId?: string;
  sku?: string;
  barcode?: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  minQuantity: number;
  unit: ProductUnit;
  imageUrl?: string;
  description?: string;
}

export function ProductDrawer({ open, onClose, onSubmit, categories, product, submitting }: ProductDrawerProps) {
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("products.drawer.nameRequired")),
        categoryId: z.string().optional(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        purchasePrice: z.coerce.number().nonnegative(t("products.drawer.purchasePriceRequired")),
        salePrice: z.coerce.number().nonnegative(t("products.drawer.salePriceRequired")),
        quantity: z.coerce.number().nonnegative(),
        minQuantity: z.coerce.number().nonnegative(),
        unit: z.enum(["PIECE", "KG", "LITER", "METER", "PACK"]),
        imageUrl: z.string().optional(),
        description: z.string().optional(),
      }),
    [t],
  );

  const UNIT_OPTIONS: { value: ProductUnit; label: string }[] = [
    { value: "PIECE", label: t("products.units.PIECE") },
    { value: "KG", label: t("products.units.KG") },
    { value: "LITER", label: t("products.units.LITER") },
    { value: "METER", label: t("products.units.METER") },
    { value: "PACK", label: t("products.units.PACK") },
  ];

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
      title={product ? t("products.drawer.editTitle") : t("products.drawer.addTitle")}
      subtitle={product ? product.name : t("products.drawer.addSubtitle")}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            {t("common.cancel")}
          </button>
          <button className="btn btn-primary" onClick={handleSubmit(onSubmit)} disabled={submitting}>
            {submitting ? t("common.saving") : product ? t("common.save") : t("products.drawer.submitAdd")}
          </button>
        </>
      }
    >
      <form className="stack gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label className="field-label">{t("products.drawer.name")}</label>
          <input className={`input ${errors.name ? "has-error" : ""}`} placeholder={t("products.drawer.namePlaceholder")} {...register("name")} />
          {errors.name && <span className="field-error">{errors.name.message}</span>}
        </div>

        <div className="form-grid">
          <div className="field">
            <label className="field-label">{t("products.drawer.category")}</label>
            <select className="select" {...register("categoryId")}>
              <option value="">{t("products.drawer.categoryPlaceholder")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label">{t("products.drawer.unit")}</label>
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
            <label className="field-label">{t("products.drawer.sku")}</label>
            <input className="input" placeholder="SKU-0001" {...register("sku")} />
          </div>
          <div className="field">
            <label className="field-label">{t("products.drawer.barcode")}</label>
            <input className="input" placeholder="4870001234561" {...register("barcode")} />
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label className="field-label">{t("products.drawer.purchasePrice")}</label>
            <input type="number" step="0.01" className={`input ${errors.purchasePrice ? "has-error" : ""}`} {...register("purchasePrice")} />
            {errors.purchasePrice && <span className="field-error">{errors.purchasePrice.message}</span>}
          </div>
          <div className="field">
            <label className="field-label">{t("products.drawer.salePrice")}</label>
            <input type="number" step="0.01" className={`input ${errors.salePrice ? "has-error" : ""}`} {...register("salePrice")} />
            {errors.salePrice && <span className="field-error">{errors.salePrice.message}</span>}
          </div>
        </div>

        <div className="margin-preview">
          <div className="margin-preview-item">
            <div className="margin-preview-value">{formatMoney(profit)}</div>
            <div className="margin-preview-label">{t("products.drawer.profit")}</div>
          </div>
          <div className="margin-preview-item">
            <div className="margin-preview-value">{margin}%</div>
            <div className="margin-preview-label">{t("products.drawer.margin")}</div>
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label className="field-label">{product ? t("products.drawer.currentStock") : t("products.drawer.initialStock")}</label>
            <input type="number" step="0.01" className="input" disabled={!!product} {...register("quantity")} />
            {product && <span className="field-hint">{t("products.drawer.stockHint")}</span>}
          </div>
          <div className="field">
            <label className="field-label">{t("products.drawer.minStock")}</label>
            <input type="number" step="0.01" className="input" {...register("minQuantity")} />
          </div>
        </div>

        <div className="field">
          <label className="field-label">{t("products.drawer.imageUrl")}</label>
          <input className="input" placeholder="https://..." {...register("imageUrl")} />
        </div>

        <div className="field">
          <label className="field-label">{t("products.drawer.description")}</label>
          <textarea className="textarea" placeholder={t("products.drawer.descriptionPlaceholder")} {...register("description")} />
        </div>
      </form>
    </Drawer>
  );
}
