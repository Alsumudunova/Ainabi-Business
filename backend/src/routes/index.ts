import { Router } from "express";
import authRoutes from "./auth.routes";
import dashboardRoutes from "./dashboard.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";
import saleRoutes from "./sale.routes";
import stockRoutes from "./stock.routes";
import customerRoutes from "./customer.routes";
import debtRoutes from "./debt.routes";
import expenseRoutes from "./expense.routes";
import employeeRoutes from "./employee.routes";
import reportRoutes from "./report.routes";
import settingsRoutes from "./settings.routes";
import supplierRoutes from "./supplier.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/sales", saleRoutes);
router.use("/stock", stockRoutes);
router.use("/customers", customerRoutes);
router.use("/debts", debtRoutes);
router.use("/expenses", expenseRoutes);
router.use("/employees", employeeRoutes);
router.use("/reports", reportRoutes);
router.use("/settings", settingsRoutes);
router.use("/suppliers", supplierRoutes);

export default router;
