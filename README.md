Athena Judge Setup Guide

Overview
Athena is a financial intelligence prototype built with a React frontend and a Node.js backend. This guide explains how to open the project in Visual Studio Code, start both services, and access the live prototype locally.

Project Location
/Users/adityabisht/Documents/GSU hack/financial-truth-engine

Requirements

Visual Studio Code installed
Node.js installed
Google Chrome or another modern browser
How To Open Athena In VS Code

Open Visual Studio Code.
Select File > Open Folder.
Choose:
/Users/adityabisht/Documents/GSU hack/financial-truth-engine
Wait for the workspace to load completely.
How To Start The Backend

In VS Code, open a terminal by selecting Terminal > New Terminal.
Run:
cd backend
npm run dev
This starts the Node.js backend server used for analysis, simulation, live API handling, and the AI coach.

How To Start The Frontend

Open a second terminal in VS Code.
Run:
cd frontend
npm run dev
This starts the React application through Vite and serves the Athena interface locally.

How To Open The Prototype

Open Google Chrome.
Go to:
http://localhost:5175/
Once both services are running, Athena should load and be ready for use.

Judge Notes

Frontend runs on port 5175
Backend runs on port 8080
If the frontend does not load, confirm both terminals are still running
If a port is already in use, stop the previous process and restart the affected service
Optional VS Code Convenience Step
To open the project from Terminal in the future, install the VS Code shell command:

Press Cmd + Shift + P in VS Code
Run: Shell Command: Install 'code' command in PATH
Then the project can be opened from Terminal with:

code "/Users/adityabisht/Documents/GSU hack/financial-truth-engine"
Prototype URL
Local prototype URL: http://localhost:5175/

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
