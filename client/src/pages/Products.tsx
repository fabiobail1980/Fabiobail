import type { Product } from "@locacao/shared";

interface ProductsProps {
  products: Product[];
}

export default function Products({ products }: ProductsProps) {
  return (
    <section>
      <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Produtos</h2>
      <p>Cadastre itens de louças, talheres e equipamentos para eventos.</p>
      <div style={{ marginTop: "16px", display: "grid", gap: "12px" }}>
        {products.length === 0 ? (
          <div style={{ padding: "16px", background: "white", borderRadius: "12px" }}>
            Nenhum produto cadastrado. Use a API para criar o primeiro produto.
          </div>
        ) : (
          products.map((product) => (
            <article
              key={product.id}
              style={{
                padding: "16px",
                background: "white",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h3 style={{ margin: "0 0 4px" }}>{product.name}</h3>
              <p style={{ margin: 0 }}>
                {product.category} • Estoque: {product.totalQuantity}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
