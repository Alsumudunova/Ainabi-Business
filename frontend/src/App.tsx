import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastStack } from "./components/ui/ToastStack";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";

const Landing = lazy(() => import("./pages/Landing/Landing"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Products = lazy(() => import("./pages/Products/Products"));
const Pos = lazy(() => import("./pages/Pos/Pos"));
const Stock = lazy(() => import("./pages/Stock/Stock"));
const Customers = lazy(() => import("./pages/Customers/Customers"));
const CustomerProfile = lazy(() => import("./pages/Customers/CustomerProfile"));
const Debts = lazy(() => import("./pages/Debts/Debts"));
const Expenses = lazy(() => import("./pages/Expenses/Expenses"));
const Reports = lazy(() => import("./pages/Reports/Reports"));
const Employees = lazy(() => import("./pages/Employees/Employees"));
const Settings = lazy(() => import("./pages/Settings/Settings"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

function PageFallback() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--color-text-muted)" }}>
      Жүктөлүүдө...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/pos" element={<Pos />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/stock" element={<Stock />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customers/:id" element={<CustomerProfile />} />
                  <Route path="/debts" element={<Debts />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/support" element={<Navigate to="/settings" replace />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <ToastStack />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
