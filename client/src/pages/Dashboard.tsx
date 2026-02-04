interface DashboardProps {
  serverStatus: string;
}

export default function Dashboard({ serverStatus }: DashboardProps) {
  return (
    <section>
      <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>Dashboard</h2>
      <p>Bem-vindo ao sistema de locação de louças e buffet.</p>
      <div
        style={{
          marginTop: "16px",
          padding: "16px",
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          maxWidth: "420px",
        }}
      >
        <h3 style={{ marginBottom: "8px" }}>Status do servidor</h3>
        <p>
          API: <strong>{serverStatus}</strong>
        </p>
      </div>
    </section>
  );
}
