import { useCallback, useEffect, useMemo, useState } from "react";
import { Banknote, CreditCard, Minus, Package, Plus, QrCode, ScanBarcode, Search, ShoppingCart, Trash2, Wallet } from "lucide-react";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { useToast } from "../../hooks/useToast";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import * as productService from "../../services/product.service";
import * as categoryService from "../../services/category.service";
import * as customerService from "../../services/customer.service";
import * as saleService from "../../services/sale.service";
import { extractErrorMessage } from "../../services/api";
import { formatMoney } from "../../utils/format";
import type { Category, Customer, PaymentMethod, Product } from "../../types";
import "./Pos.css";

interface CartLine {
  product: Product;
  quantity: number;
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "CASH", label: "Накталай", icon: Banknote },
  { value: "CARD", label: "Карта", icon: CreditCard },
  { value: "QR", label: "QR", icon: QrCode },
  { value: "DEBT", label: "Карыз", icon: Wallet },
];

export default function Pos() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const [barcode, setBarcode] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");

  const [cart, setCart] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [customerId, setCustomerId] = useState("");
  const [completing, setCompleting] = useState(false);
  const [bumpedId, setBumpedId] = useState<string | null>(null);

  const loadProducts = useCallback(() => {
    productService
      .listProducts({ search: debouncedSearch || undefined, categoryId: activeCategory || undefined, status: "ACTIVE", pageSize: 100 })
      .then((res) => setProducts(res.items))
      .catch((error) => showToast({ variant: "error", title: "Товарлар жүктөлгөн жок", message: extractErrorMessage(error) }));
  }, [debouncedSearch, activeCategory, showToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    categoryService.listCategories().then(setCategories).catch(() => undefined);
    customerService.listCustomers().then(setCustomers).catch(() => undefined);
  }, []);

  function addToCart(product: Product) {
    if (product.quantity <= 0) return;
    setCart((prev) => {
      const existing = prev.find((line) => line.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          showToast({ variant: "error", title: "Складда жетишсиз", message: `${product.name} үчүн бар болгону ${product.quantity} калды.` });
          return prev;
        }
        return prev.map((line) => (line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line));
      }
      return [...prev, { product, quantity: 1 }];
    });
    // Quick visual confirmation that the tap registered — the cart line pops once.
    setBumpedId(product.id);
    window.setTimeout(() => setBumpedId((current) => (current === product.id ? null : current)), 320);
  }

  function changeQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((line) => {
          if (line.product.id !== productId) return line;
          const next = line.quantity + delta;
          if (next > line.product.quantity) {
            showToast({ variant: "error", title: "Складда жетишсиз", message: `Бар болгону ${line.product.quantity} калды.` });
            return line;
          }
          return { ...line, quantity: next };
        })
        .filter((line) => line.quantity > 0),
    );
  }

  function removeLine(productId: string) {
    setCart((prev) => prev.filter((line) => line.product.id !== productId));
  }

  async function handleBarcodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!barcode.trim()) return;
    try {
      const product = await productService.findByBarcode(barcode.trim());
      addToCart(product);
      setBarcode("");
    } catch {
      showToast({ variant: "error", title: "Товар табылган жок", message: `"${barcode}" штрих-коду боюнча товар жок.` });
    }
  }

  const subtotal = useMemo(() => cart.reduce((sum, line) => sum + line.product.salePrice * line.quantity, 0), [cart]);
  const total = Math.max(0, subtotal - discount);

  async function completeSale() {
    if (cart.length === 0) return;
    if (paymentMethod === "DEBT" && !customerId) {
      showToast({ variant: "error", title: "Кардар тандаңыз", message: "Карызга сатуу үчүн кардарды тандаңыз." });
      return;
    }
    setCompleting(true);
    try {
      await saleService.createSale({
        items: cart.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
        discount,
        paymentMethod,
        customerId: paymentMethod === "DEBT" ? customerId : undefined,
      });
      showToast({ variant: "success", title: "Сатуу ийгиликтүү аяктады", message: `Жыйынтык: ${formatMoney(total)}` });
      setCart([]);
      setDiscount(0);
      setCustomerId("");
      setPaymentMethod("CASH");
      loadProducts();
    } catch (error) {
      showToast({ variant: "error", title: "Сатуу аякталган жок", message: extractErrorMessage(error) });
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="pos-shell">
      <div className="card pos-catalog">
        <div className="pos-catalog-toolbar">
          <div className="row gap-2">
            <div className="input-with-icon" style={{ flex: 1 }}>
              <Search size={16} />
              <input className="input" placeholder="Товар издөө" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <form onSubmit={handleBarcodeSubmit} className="input-with-icon" style={{ width: 200 }}>
              <ScanBarcode size={16} />
              <input className="input" placeholder="Штрих-код" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
            </form>
          </div>
          <div className="pos-category-scroll">
            <button className={`pos-category-chip ${activeCategory === "" ? "active" : ""}`} onClick={() => setActiveCategory("")}>
              Баары
            </button>
            {categories.map((c) => (
              <button key={c.id} className={`pos-category-chip ${activeCategory === c.id ? "active" : ""}`} onClick={() => setActiveCategory(c.id)}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {products === null ? (
          <div className="card-pad">
            <SkeletonRows rows={6} height={60} />
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon={<Package size={26} />} title="Товар табылган жок" subtitle="Издөө шартын өзгөртүп көрүңүз." />
        ) : (
          <div className="pos-product-grid">
            {products.map((p) => (
              <button key={p.id} className="pos-product-card" onClick={() => addToCart(p)} disabled={p.quantity <= 0}>
                <div className="pos-product-thumb">{p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <Package size={22} />}</div>
                <span className="pos-product-name">{p.name}</span>
                <span className="pos-product-price">{formatMoney(p.salePrice)}</span>
                <span className="pos-product-stock">{p.quantity > 0 ? `${p.quantity} калды` : "Бүттү"}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card pos-cart">
        <div className="pos-cart-header row gap-2">
          <ShoppingCart size={18} className={bumpedId ? "pop-once" : undefined} />
          <span className="card-title">Учурдагы сатуу</span>
          {cart.length > 0 && <span className="badge badge-info">{cart.reduce((sum, l) => sum + l.quantity, 0)}</span>}
          <span className="spacer" />
          {cart.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setCart([])}>
              Тазалоо
            </button>
          )}
        </div>

        <div className="pos-cart-items">
          {cart.length === 0 ? (
            <EmptyState icon={<ShoppingCart size={22} />} title="Себет бош" subtitle="Товарды тандап себетке кошуңуз." />
          ) : (
            cart.map((line) => (
              <div className="pos-cart-item" key={line.product.id}>
                <div className="pos-cart-item-info">
                  <div className="pos-cart-item-name">{line.product.name}</div>
                  <div className="pos-cart-item-price">
                    {line.quantity} × {formatMoney(line.product.salePrice)}
                  </div>
                </div>
                <div className="pos-qty-control">
                  <button onClick={() => changeQuantity(line.product.id, -1)} aria-label="Азайтуу">
                    <Minus size={13} />
                  </button>
                  <span className="pos-qty-value">{line.quantity}</span>
                  <button onClick={() => changeQuantity(line.product.id, 1)} aria-label="Көбөйтүү">
                    <Plus size={13} />
                  </button>
                </div>
                <span className="pos-cart-item-total mono-num">{formatMoney(line.product.salePrice * line.quantity)}</span>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeLine(line.product.id)} aria-label="Өчүрүү">
                  <Trash2 size={15} color="var(--color-danger-text)" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pos-summary">
          <div className="pos-summary-row">
            <span>Subtotal</span>
            <span className="mono-num">{formatMoney(subtotal)}</span>
          </div>
          <div className="pos-summary-row" style={{ alignItems: "center" }}>
            <span>Скидка</span>
            <input
              type="number"
              min={0}
              className="input"
              style={{ width: 120, height: 32, textAlign: "right" }}
              value={discount || ""}
              placeholder="0"
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
            />
          </div>
          <div className="pos-summary-total">
            <span>Жыйынтык</span>
            <span className="mono-num">{formatMoney(total)}</span>
          </div>

          <div className="pos-payment-grid">
            {PAYMENT_OPTIONS.map((opt) => (
              <button key={opt.value} className={`pos-payment-btn ${paymentMethod === opt.value ? "active" : ""}`} onClick={() => setPaymentMethod(opt.value)}>
                <opt.icon size={18} />
                {opt.label}
              </button>
            ))}
          </div>

          {paymentMethod === "DEBT" && (
            <select className="select" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Кардарды тандаңыз</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `— ${c.phone}` : ""}
                </option>
              ))}
            </select>
          )}

          <button className="btn btn-primary btn-lg btn-block" disabled={cart.length === 0 || completing} onClick={completeSale}>
            {completing ? "Аякталууда..." : "Сатууну аяктоо"}
          </button>
        </div>
      </div>
    </div>
  );
}
