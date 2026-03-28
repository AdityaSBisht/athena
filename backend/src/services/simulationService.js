import { calculateDerivedMetrics } from "../utils/metricUtils.js";

const yearlyProjection = ({ startNetWorth, annualContribution, annualDebtDrag, growthRate, years }) => {
  const points = [];
  let current = startNetWorth;

  for (let year = 1; year <= years; year += 1) {
    current = current * (1 + growthRate) + annualContribution - annualDebtDrag;
    points.push({
      year,
      projectedNetWorth: Number(current.toFixed(2))
    });
  }

  return points;
};

export const simulateFuture = ({ profile, transactions }) => {
  const metrics = calculateDerivedMetrics({ profile, transactions });
  const annualContribution = metrics.monthlySavingsActual * 12;
  const annualDebtDrag = profile.monthlyDebtPayments * 12 * 0.15;
  // Higher real savings behavior earns a stronger growth assumption.
  const growthRate = metrics.savingsRate >= 0.2 ? 0.08 : metrics.savingsRate >= 0.1 ? 0.06 : 0.04;
  const projection = yearlyProjection({
    startNetWorth: profile.startingNetWorth,
    annualContribution,
    annualDebtDrag,
    growthRate,
    years: 10
  });

  return {
    assumptions: {
      annualContribution: Number(annualContribution.toFixed(2)),
      annualDebtDrag: Number(annualDebtDrag.toFixed(2)),
      growthRate
    },
    projection,
    snapshots: {
      oneYear: projection[0]?.projectedNetWorth ?? profile.startingNetWorth,
      fiveYear: projection[4]?.projectedNetWorth ?? profile.startingNetWorth,
      tenYear: projection[9]?.projectedNetWorth ?? profile.startingNetWorth
    }
  };
};
