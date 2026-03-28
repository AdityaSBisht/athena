# Financial Truth Engine

Hackathon-ready demo app with a React frontend and Node.js backend that helps users compare planned vs actual financial behavior, simulate their future net worth, and view their profile through a bank-style risk lens.

## Stack

- Frontend: React + Vite + TypeScript + Tailwind CSS + Recharts
- Backend: Node.js + Express
- Data: Mock JSON only, no external APIs

## Project Structure

```text
financial-truth-engine/
  backend/
    src/
      config/
      controllers/
      data/
      routes/
      services/
      utils/
    package.json
  frontend/
    src/
      components/
      data/
      hooks/
      lib/
      pages/
      styles/
      types/
    package.json
  docs/
    architecture.md
    data-model.md
```

## Quick Start

```bash
cd financial-truth-engine/backend
npm install
npm run dev
```

```bash
cd financial-truth-engine/frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5175` and expects the backend on `http://localhost:8080`.

## Demo Personas

- Impulsive Spender
- Disciplined Saver
- Side Hustler

Each persona includes a preloaded financial profile, transaction history, and derived metrics source data.
