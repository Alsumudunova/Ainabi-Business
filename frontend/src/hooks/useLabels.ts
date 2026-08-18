import { useTranslation } from "react-i18next";

/**
 * Translated versions of the fixed-value labels (payment method, role,
 * status, ...) that used to live in utils/labels.ts as static Kyrgyz-only
 * records. Same shape, same keys — just language-aware now.
 */
export function useLabels() {
  const { t } = useTranslation();

  return {
    paymentMethod: t("labels.paymentMethod", { returnObjects: true }) as Record<string, string>,
    expenseCategory: t("labels.expenseCategory", { returnObjects: true }) as Record<string, string>,
    role: t("labels.role", { returnObjects: true }) as Record<string, string>,
    employeeStatus: t("labels.employeeStatus", { returnObjects: true }) as Record<string, string>,
    debtStatus: t("labels.debtStatus", { returnObjects: true }) as Record<string, string>,
    stockMovementType: t("labels.stockMovementType", { returnObjects: true }) as Record<string, string>,
    productStatus: t("labels.productStatus", { returnObjects: true }) as Record<string, string>,
  };
}
