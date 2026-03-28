import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { FloatingFinanceCoach } from "./components/FloatingFinanceCoach";
import { GuardedRoute } from "./components/GuardedRoute";
import { Header } from "./components/Header";
import { Loader } from "./components/Loader";
import { ScenarioProvider, useDemoScenario } from "./hooks/useDemoScenario";

const DemoLoaderPage = lazy(() => import("./pages/DemoLoaderPage").then((module) => ({ default: module.DemoLoaderPage })));
const TruthReportPage = lazy(() => import("./pages/TruthReportPage").then((module) => ({ default: module.TruthReportPage })));
const ScenarioLabPage = lazy(() => import("./pages/ScenarioLabPage").then((module) => ({ default: module.ScenarioLabPage })));
const DecisionEnginePage = lazy(() =>
  import("./pages/DecisionEnginePage").then((module) => ({ default: module.DecisionEnginePage }))
);
const InvestShiftPage = lazy(() =>
  import("./pages/InvestShiftPage").then((module) => ({ default: module.InvestShiftPage }))
);
const FutureSimulationPage = lazy(() =>
  import("./pages/FutureSimulationPage").then((module) => ({ default: module.FutureSimulationPage }))
);
const BankPerspectivePage = lazy(() =>
  import("./pages/BankPerspectivePage").then((module) => ({ default: module.BankPerspectivePage }))
);
const ReportExportPage = lazy(() =>
  import("./pages/ReportExportPage").then((module) => ({ default: module.ReportExportPage }))
);

const AppShell = () => {
  const { isLoading } = useDemoScenario();

  return (
    <div className="min-h-screen bg-ink-950 text-signal-accent">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-16 h-72 w-72 rounded-full bg-signal-good/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-signal-accent/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-signal-good/[0.04] blur-3xl" />
      </div>

      <Header />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<DemoLoaderPage />} />
            <Route
              path="/truth-report"
              element={
                <GuardedRoute>
                  <TruthReportPage />
                </GuardedRoute>
              }
            />
            <Route
              path="/scenario-lab"
              element={
                <GuardedRoute>
                  <ScenarioLabPage />
                </GuardedRoute>
              }
            />
            <Route
              path="/decision-engine"
              element={
                <GuardedRoute>
                  <DecisionEnginePage />
                </GuardedRoute>
              }
            />
            <Route
              path="/invest-shift"
              element={
                <GuardedRoute>
                  <InvestShiftPage />
                </GuardedRoute>
              }
            />
            <Route
              path="/future-simulation"
              element={
                <GuardedRoute>
                  <FutureSimulationPage />
                </GuardedRoute>
              }
            />
            <Route
              path="/bank-perspective"
              element={
                <GuardedRoute>
                  <BankPerspectivePage />
                </GuardedRoute>
              }
            />
            <Route
              path="/report-export"
              element={
                <GuardedRoute>
                  <ReportExportPage />
                </GuardedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <FloatingFinanceCoach />
      {isLoading ? <Loader /> : null}
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ScenarioProvider>
        <AppShell />
      </ScenarioProvider>
    </BrowserRouter>
  );
};

export default App;
