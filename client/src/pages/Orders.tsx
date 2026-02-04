export default function Orders() {
  return (
    <section>
      <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Pedidos</h2>
      <p>Crie pedidos com datas de retirada e devolução, além de itens locados.</p>
      <div style={{ marginTop: "16px", padding: "16px", background: "white", borderRadius: "12px" }}>
        A API de pedidos está disponível em /trpc/orders.*.
      </div>
    </section>
  );
}
