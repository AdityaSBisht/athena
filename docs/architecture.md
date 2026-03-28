# Architecture

## Goal

Keep the app simple, modular, and demo-friendly for a hackathon while still making the experience feel polished.

## Folder Structure

```text
financial-truth-engine/
  backend/
    src/
      app.js
      server.js
      config/env.js
      controllers/
        analyzeController.js
        decisionEngineController.js
        intakeProfileController.js
        investShiftController.js
        riskController.js
        scenarioController.js
        simulateController.js
      data/
        demoUsers.js
      routes/
        analyzeRoutes.js
        decisionEngineRoutes.js
        intakeRoutes.js
        investShiftRoutes.js
        riskRoutes.js
        scenarioRoutes.js
        simulateRoutes.js
      services/
        analyzeService.js
        decisionEngineService.js
        intakeProfileService.js
        insightService.js
        investShiftService.js
        riskService.js
        scenarioService.js
        simulationService.js
      utils/
        metricUtils.js
  frontend/
    src/
      App.tsx
      main.tsx
      lib/
        api.ts
      types/
        finance.ts
        onboarding.ts
      hooks/
        useDemoScenario.ts
      components/
        Header.tsx
        PersonaCard.tsx
        ProgressBar.tsx
        RiskMeter.tsx
        InsightCard.tsx
        Loader.tsx
        PageTransition.tsx
        InvestmentTrajectoryComparisonCard.tsx
        DecisionEnginePanel.tsx
        charts/
          SpendingPieChart.tsx
          NetWorthLineChart.tsx
      pages/
        DemoLoaderPage.tsx
        TruthReportPage.tsx
        ScenarioLabPage.tsx
        DecisionEnginePage.tsx
        InvestShiftPage.tsx
        FutureSimulationPage.tsx
        BankPerspectivePage.tsx
        ReportExportPage.tsx
      styles/
        index.css
  docs/
    architecture.md
    data-model.md
```

## Frontend Pages

- `/`: `DemoLoaderPage` handles demo persona selection and AI-style intake chat.
- `/truth-report`: `TruthReportPage` renders honesty score, savings gap, spend composition, and narrative insights.
- `/scenario-lab`: `ScenarioLabPage` fetches backend scenario presets and applies them through the API.
- `/decision-engine`: `DecisionEnginePage` renders ranked recommendations, habit drift, stress tests, and goal optimization.
- `/invest-shift`: `InvestShiftPage` renders the investment comparison module and requests backend projection math.
- `/future-simulation`: `FutureSimulationPage` shows the long-term net-worth trajectory and 1/5/10-year snapshots.
- `/bank-perspective`: `BankPerspectivePage` shows risk score, underwriting explainability, and estimated credit layer.
- `/report-export`: `ReportExportPage` summarizes the scenario into a print-friendly final report.

## Shared Frontend Components

- `Header`: Top-level app navigation.
- `Loader`: Full-screen loading overlay during backend round-trips.
- `PageTransition`: Shared route transition wrapper.
- `ProgressBar`: Honesty score UI.
- `RiskMeter`: Risk score gauge.
- `InvestmentTrajectoryComparisonCard`: Invest Shift UI shell; backend supplies market metadata and projection results.
- `DecisionEnginePanel`: Renders backend recommendation and stress-test payloads.
- `SpendingPieChart`: Spending composition chart.
- `NetWorthLineChart`: Future simulation line chart.

## Data Flow

1. User either selects a demo persona or completes the intake chat.
2. The frontend stores the active payload in `useDemoScenario`.
3. Frontend sends that payload to backend engines:
   - `POST /api/analyze`
   - `POST /api/simulate`
   - `POST /api/risk-profile`
   - `POST /api/decision-engine`
4. For guided onboarding, frontend sends answers to `POST /api/intake`, and the backend generates the profile plus mock transactions.
5. For Scenario Lab, frontend sends the current payload plus a preset id to `POST /api/scenario/apply`.
6. For Invest Shift, frontend requests metadata from `GET /api/invest-shift/meta` and projection results from `POST /api/invest-shift/project`.
7. Backend services compute all scoring, recommendations, transforms, and projection math.
8. Frontend renders only the returned data and keeps local UI state.

## Page To Endpoint Map

- `DemoLoaderPage`
  - `GET /api/demo-users`
  - `POST /api/intake`
- `TruthReportPage`
  - `POST /api/analyze`
- `ScenarioLabPage`
  - `GET /api/scenario/presets`
  - `POST /api/scenario/apply`
  - then reruns `POST /api/analyze`, `POST /api/simulate`, `POST /api/risk-profile`, `POST /api/decision-engine`
- `DecisionEnginePage`
  - `POST /api/decision-engine`
- `InvestShiftPage`
  - `GET /api/invest-shift/meta`
  - `POST /api/invest-shift/project`
- `FutureSimulationPage`
  - `POST /api/simulate`
- `BankPerspectivePage`
  - `POST /api/risk-profile`
  - `POST /api/decision-engine`
- `ReportExportPage`
  - no extra endpoint; renders from already loaded scenario state

## Backend Ownership

- `analyzeService.js`: honesty score, savings gap, spend variance, human-readable truth insights
- `simulationService.js`: long-term net-worth projections
- `riskService.js`: risk score, classification, bank-facing flags
- `decisionEngineService.js`: recommendations, habit drift, stress tests, goal optimizer, explainability, estimated credit score
- `intakeProfileService.js`: turns chat answers into a normalized profile and mock transaction set
- `scenarioService.js`: applies scenario presets to the active financial payload
- `investShiftService.js`: returns hardcoded market metadata and investment trajectory math

## API Endpoints

- `GET /api/health`
- `GET /api/demo-users`
- `POST /api/analyze`
- `POST /api/simulate`
- `POST /api/risk-profile`
- `POST /api/decision-engine`
- `POST /api/intake`
- `GET /api/scenario/presets`
- `POST /api/scenario/apply`
- `GET /api/invest-shift/meta`
- `POST /api/invest-shift/project`
