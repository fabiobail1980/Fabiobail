import cors from "cors";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
  }),
);

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
