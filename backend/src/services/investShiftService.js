const marketIndexes = [
  { id: "sp500", name: "S&P 500", value: "5,218.19", change: "+0.32%", annualReturn: 10 },
  { id: "nasdaq", name: "NASDAQ", value: "16,340.87", change: "+0.45%", annualReturn: 13 },
  { id: "dow", name: "Dow Jones", value: "38,996.39", change: "+0.18%", annualReturn: 8 },
  { id: "russell2000", name: "Russell 2000", value: "2,054.62", change: "-0.12%", annualReturn: 7 }
];

const topStocks = [
  { ticker: "NVDA", price: "$875.40", change: "+4.2%" },
  { ticker: "META", price: "$527.13", change: "+2.8%" },
  { ticker: "AVGO", price: "$1,423.55", change: "+2.1%" },
  { ticker: "AMD", price: "$164.22", change: "+1.9%" },
  { ticker: "TSLA", price: "$177.90", change: "+1.4%" }
];

const ALPHA_VANTAGE_KEY =
  process.env.ALPHA_VANTAGE_KEY ||
  process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY ||
  "002O60VXH02LC0YT";
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE";
const LIVE_QUOTE_TTL_MS = 5 * 60 * 1000;

const quoteSymbols = {
  sp500: "SPY",
  nasdaq: "QQQ",
  dow: "DIA",
  russell2000: "IWM",
  NVDA: "NVDA",
  META: "META",
  AVGO: "AVGO",
  AMD: "AMD",
  TSLA: "TSLA"
};

let cachedMarketMeta = null;
let cachedMarketMetaAt = 0;

const formatCurrency = (value) => `$${Math.round(value).toLocaleString()}`;
const formatQuotePrice = (value, { withDollar = false } = {}) =>
  `${withDollar ? "$" : ""}${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
const normalizeChange = (value) => value.replace("%", "").trim();

const projectBalance = (principal, monthlyContribution, annualRate, months) => {
  const monthlyRate = annualRate / 12;
  let balance = principal;

  for (let month = 0; month < months; month += 1) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
  }

  return balance;
};

const fetchQuoteWithFallback = async (symbol, fallback, formatter) => {
  if (!ALPHA_VANTAGE_KEY) {
    return fallback;
  }

  try {
    const response = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Quote request failed for ${symbol}`);
    }

    const payload = await response.json();
    const quote = payload["Global Quote"];
    const price = quote?.["05. price"];
    const change = quote?.["10. change percent"];

    if (!price || !change) {
      throw new Error(`Quote payload missing fields for ${symbol}`);
    }

    return formatter(price, change);
  } catch {
    return fallback;
  }
};

export const getInvestShiftMeta = async () => {
  const now = Date.now();

  if (cachedMarketMeta && now - cachedMarketMetaAt < LIVE_QUOTE_TTL_MS) {
    return cachedMarketMeta;
  }

  const indexRequests = marketIndexes.map((index) =>
    fetchQuoteWithFallback(
      quoteSymbols[index.id],
      index,
      (price, change) => ({
        ...index,
        value: formatQuotePrice(price),
        change: normalizeChange(change)
      })
    )
  );

  const stockRequests = topStocks.map((stock) =>
    fetchQuoteWithFallback(
      quoteSymbols[stock.ticker],
      stock,
      (price, change) => ({
        ...stock,
        price: formatQuotePrice(price, { withDollar: true }),
        change: normalizeChange(change)
      })
    )
  );

  const [indexes, stocks] = await Promise.all([
    Promise.all(indexRequests),
    Promise.all(stockRequests)
  ]);

  cachedMarketMeta = {
    indexes,
    topStocks: stocks,
    defaultIndexId: "sp500",
    savingsAnnualRate: 4.5
  };
  cachedMarketMetaAt = now;

  return cachedMarketMeta;
};

export const getInvestShiftProjection = ({
  selectedIndexId = "sp500",
  currentSavings = 0,
  monthlyContribution = 0,
  investPercentage = 35,
  horizonYears = 20
}) => {
  const selectedIndex = marketIndexes.find((index) => index.id === selectedIndexId) || marketIndexes[0];
  const investmentContribution = monthlyContribution * (investPercentage / 100);
  const savingsContribution = monthlyContribution - investmentContribution;
  const chartData = [];

  for (let year = 0; year <= horizonYears; year += 1) {
    const months = year * 12;
    const savings = projectBalance(currentSavings, savingsContribution, 0.045, months);
    const investment = projectBalance(currentSavings, investmentContribution, selectedIndex.annualReturn / 100, months);

    chartData.push({
      year,
      savings: Number(savings.toFixed(2)),
      investment: Number(investment.toFixed(2))
    });
  }

  const lastPoint = chartData[chartData.length - 1];
  lastPoint.savingsLabel = formatCurrency(lastPoint.savings);
  lastPoint.investmentLabel = formatCurrency(lastPoint.investment);

  const difference = lastPoint.investment - lastPoint.savings;
  const selectedIndexRiskNote =
    selectedIndex.annualReturn >= 12
      ? "Higher historical return, but also a bumpier ride."
      : selectedIndex.annualReturn >= 9
        ? "Balanced long-term growth profile with broad-market behavior."
        : "More conservative historical return with a lower upside ceiling.";

  return {
    selectedIndex,
    chartData,
    difference: Number(difference.toFixed(2)),
    takeaway:
      difference > 0
        ? `Using ${selectedIndex.name}-style returns, investing ${investPercentage}% of monthly savings could add about ${formatCurrency(difference)} over ${horizonYears} years versus keeping it in savings.`
        : "With this setup, the savings path still leads. Try a longer horizon or a higher investing allocation to create separation.",
    selectedIndexRiskNote,
    savingsAnnualRate: 4.5
  };
};
