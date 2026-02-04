import { useEffect, useMemo, useState } from "react";
import type { Product } from "@locacao/shared";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Kits from "./pages/Kits";
import Clients from "./pages/Clients";
import Orders from "./pages/Orders";
import Calendar from "./pages/Calendar";

const pages = ["Dashboard", "Produtos", "Kits", "Clientes", "Pedidos", "Agenda"] as const;

type PageKey = (typeof pages)[number];

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>("Dashboard");
  const [serverStatus, setServerStatus] = useState("verificando...");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/health")
      .then((response) => response.json())
      .then((data: { status: string }) => setServerStatus(data.status))
      .catch(() => setServerStatus("offline"));
  }, []);

  useEffect(() => {
    fetch("/trpc/products.list")
      .then((response) => response.json())
      .then((data) => {
        const result = data?.result?.data?.json ?? [];
        setProducts(result);
      })
      .catch(() => setProducts([]));
  }, []);

  const content = useMemo(() => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard serverStatus={serverStatus} />;
      case "Produtos":
        return <Products products={products} />;
      case "Kits":
        return <Kits />;
      case "Clientes":
        return <Clients />;
      case "Pedidos":
        return <Orders />;
      case "Agenda":
        return <Calendar />;
      default:
        return null;
    }
  }, [activePage, products, serverStatus]);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", display: "flex" }}>
      <aside
        style={{
          width: "240px",
          background: "#0f172a",
          color: "#e2e8f0",
          padding: "24px",
        }}
      >
        <h1 style={{ fontSize: "18px", marginBottom: "24px" }}>Locação de Louças</h1>
        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              style={{
                textAlign: "left",
                background: activePage === page ? "#2563eb" : "transparent",
                color: "inherit",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              {page}
            </button>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, padding: "32px", background: "#f8fafc" }}>{content}</main>
    </div>
  );
}
