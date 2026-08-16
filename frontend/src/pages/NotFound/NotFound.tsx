import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16, textAlign: "center", padding: 24 }}>
      <div className="empty-state-icon confirm-icon-neutral" style={{ marginBottom: 0 }}>
        <Compass size={26} />
      </div>
      <h1 style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800 }}>Бет табылган жок</h1>
      <p className="text-muted">Сиз издеген барак жок болушу мүмкүн.</p>
      <Link to="/" className="btn btn-primary">
        Башкы бетке кайтуу
      </Link>
    </div>
  );
}
