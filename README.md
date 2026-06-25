# Investryt AI — Agentic Investment Research Terminal

Investryt AI is an advanced, institutional-grade AI investment agent that automatically researches public companies and decides whether to **INVEST**, **PASS**, or **HOLD** with deep, qualitative, and quantitative reasoning. 

Built for Altuni AI Labs and InsideIIM, this terminal runs a multi-agent LangGraph workflow under the hood, scrapers, search engines, and real-time Server-Sent Events (SSE) stream to provide a premium interactive user experience.

---

## 🚀 Key Features

1. **AI Key Pool & Auto-Rotation**: Handles rate limits seamlessly by rotating through multiple Gemini, Tavily, and FMP keys with automatic cooldowns on 429 limit hits.
2. **Keyless Global Stock Support**: Leverages the `yahoo-finance2` package to fetch 5 years of complete financial statements (annual Income Statements, Balance Sheets, and Cash Flows) for Indian (`.NS`, `.BO`), US, and Global markets without requiring paid financial API keys.
3. **In-Memory TTL Caching**: Caches stock and web data to prevent redundant API queries, maintaining high performance and avoiding rate limit triggers.
4. **LangGraph Pipeline**: Runs a structured agent workflow:
   - **Company Resolution**: Maps search input to correct exchange symbols.
   - **Corporate Profile**: Fetches descriptions, sector, industry, and cap sizing.
   - **Financial Statements**: Extracts 5-year financials.
   - **Market Metrics**: Gathers multiples (P/E, PEG, ROE) and 1-year historical prices.
   - **Moat Scan**: Conducts web research on market share and competitors.
   - **News Sentiment**: Fetches recent headlines and assigns sentiment weights (Positive / Negative / Neutral).
   - **Valuation Modeling**: Estimates fair value ranges and investment decisions.
5. **Interactive Report Dashboard**: Densely packed visual layout utilizing:
   - **Revenue & EBITDA Trend charts** (ApexCharts)
   - **1-Year Price Chart** (ApexCharts area chart)
   - **Investment Radar Chart** (ApexCharts radar ratings)
   - **Margin Trends** (Gross, EBITDA, Net Profit Margin charts)
   - **Interactive Statement Tables**: Full 5-year statement tables with formatted local currencies.
6. **Premium PDF Exporter**: Renders the complete dashboard into a professional, printable PDF document using `html2canvas` and `jsPDF`.

---

## 🛠️ Project Structure

```
finest/
├── backend/
│   ├── src/
│   │   ├── agent/             # LangGraph definitions
│   │   │   ├── nodes/         # Agent node functions
│   │   │   ├── prompts/       # Structured Gemini prompts
│   │   │   ├── state.ts       # Graph state schema
│   │   │   └── graph.ts       # Assembled LangGraph StateGraph
│   │   ├── routes/            # SSE api research router
│   │   ├── services/          # API Key Pools, Cache, Tavily, Yahoo, FMP
│   │   ├── utils/             # Market detection and formatters
│   │   ├── types/             # Shared types
│   │   └── index.ts           # Express server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── components/    # SearchHero, AgentProgress, ReportDetails, Charts
│   │       ├── hooks/         # useResearchAgent hook (SSE client)
│   │       ├── types/         # Frontend typescript typings
│   │       ├── globals.css    # Premium CSS design tokens & grid aesthetics
│   │       ├── layout.tsx
│   │       └── page.tsx       # SPA Shell controller
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Backend Setup
1. Open the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```
   *Note: For keys rotation, you can specify multiple keys separated by commas (e.g. `GEMINI_API_KEYS=key1,key2,key3`).*

4. Run the development server:
   ```bash
   npm run dev
   ```
   The backend will start on [http://localhost:5000](http://localhost:5000).

---

### 2. Frontend Setup
1. Open the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The Next.js app will start on [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing and Verification

To verify the installation:
1. Start both backend and frontend servers.
2. Enter a query in the search bar:
   - **US Stock**: `AAPL` or `Apple`
   - **Indian Stock**: `RELIANCE.NS` or `Reliance`
   - **Global Stock**: `005930.KS` or `Samsung`
3. Watch the real-time execution steps and logs stream on the terminal panel.
4. Review the generated investment dashboard once complete, and click **Download PDF Report** to test exports.
