import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import decisionEngineRoutes from "./routes/decisionEngineRoutes.js";
import intakeRoutes from "./routes/intakeRoutes.js";
import investShiftRoutes from "./routes/investShiftRoutes.js";
import riskRoutes from "./routes/riskRoutes.js";
import scenarioRoutes from "./routes/scenarioRoutes.js";
import simulateRoutes from "./routes/simulateRoutes.js";
import { demoUsers } from "./data/demoUsers.js";

export const app = express();

app.use(
  cors({
    origin: env.corsOrigin
  })
);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/demo-users", (_request, response) => {
  response.json(demoUsers);
});

app.use("/api/analyze", analyzeRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/simulate", simulateRoutes);
app.use("/api/risk-profile", riskRoutes);
app.use("/api/decision-engine", decisionEngineRoutes);
app.use("/api/intake", intakeRoutes);
app.use("/api/scenario", scenarioRoutes);
app.use("/api/invest-shift", investShiftRoutes);
