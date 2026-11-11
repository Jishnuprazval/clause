# ClauseRadar – Contract Risk Highlighter

An automated, full-stack contract risk analyzer built to help students, first-time job seekers, freelancers, and tenants detect hidden, unfair, or restrictive legal clauses before signing agreements.

---

## 🌟 Core Features

1. **Dual-Engine Contract Analysis**:
   - **Deterministic Custom Rule Engine**: Evaluates 10 standardized legal risk categories (Mandatory Service Bonds, Early Exit Penalties, Non-Compete Restrictions, Unilateral Modifications, Arbitrary Salary Deductions, Unpaid Notice Periods, Data Sharing, IP Ownership Overreach, and Unlimited Indemnification).
   - **Plain-English Intelligence**: Integrates the `@google/genai` TypeScript SDK (model `gemini-3.8-flash`) to decode complex legalese into simple English summaries, formulate polite pre-signing questions, and offer realistic negotiation counter-proposals. Fully autonomous fallback if Gemini is offline.

2. **Accurate In-Document Highlighting**:
   - Interactive document text viewer with color-coded highlighting markers:
     - 🔴 **Critical Risk** (Service Bonds, Salary Deductions, IP Seizure)
     - 🟠 **High Risk** (Non-Competes, Unilateral Changes, Notice Traps)
     - 🟡 **Medium Risk** (Automatic Renewals, Privacy Sharing)
     - 🔵 **Low Risk** (Informational Conditions)
   - Synchronized navigation: Clicking any flagged issue in the analysis inspector smoothly auto-scrolls to the exact clause in the document.

3. **Transparent Risk Scoring (0–100)**:
   - Severity-weighted algorithm:
     - Critical: 10 pts | High: 8 pts | Medium: 5 pts | Low: 2 pts
   - Normalized score: `(Accumulated Points / Max Evaluated Points) × 100`.
   - Tiers: Low (0–24), Moderate (25–49), High (50–74), Very High (75–100).

4. **Side-by-Side Contract Comparison**:
   - Select multiple analyzed contracts and inspect differences across all 10 legal categories.
   - Identifies lowest vs. highest risk profiles, present vs. absent terms, and critical divergences.

5. **PDF Report Generation**:
   - One-click export of analysis reports as clean, client-ready PDFs via `jspdf`, including scores, flagged excerpts, plain-English summaries, questions, and legal disclaimers.

6. **Interactive Demo Mode**:
   - Includes a realistic sample tech internship agreement containing a 2-year service bond, $5,000 early exit fee, 90-day notice period, non-compete restriction, and salary deduction terms for instant demonstration.

7. **Production Security & Architecture**:
   - JWT authentication with secure password hashing (`bcryptjs`).
   - Clean REST API architecture, input sanitization, file type/size validation, and memory-safe PDF text extraction.
   - Hybrid persistence: supports MongoDB through Mongoose schemas, with an embedded file-based JSON datastore in `./data/db.json` that works out-of-the-box without requiring external database provisioning.

---

## 🏗️ Project Architecture

```
ClauseRadar/
├── server.ts                       # Express full-stack entry point + Vite middleware
├── server/
│   ├── config/
│   │   └── db.ts                   # Hybrid Database layer (MongoDB + JSON datastore)
│   ├── controllers/
│   │   ├── authController.ts       # Registration, login, profile, password reset
│   │   ├── contractController.ts   # PDF upload, text analysis, sample loader
│   │   ├── analysisController.ts   # Re-analysis, history, aggregated dashboard stats
│   │   ├── comparisonController.ts # Multi-contract side-by-side evaluation
│   │   └── userController.ts       # Profile updates, password modification
│   ├── middleware/
│   │   ├── authMiddleware.ts       # JWT Bearer verification
│   │   └── uploadMiddleware.ts     # Multer PDF memory-storage filter
│   ├── models/
│   │   ├── User.ts                 # Mongoose User schema
│   │   ├── Contract.ts             # Mongoose Contract schema
│   │   ├── Analysis.ts             # Mongoose Analysis schema
│   │   └── Comparison.ts           # Mongoose Comparison schema
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── contractRoutes.ts
│   │   ├── analysisRoutes.ts
│   │   ├── comparisonRoutes.ts
│   │   └── userRoutes.ts
│   ├── services/
│   │   ├── pdfService.ts           # PDF text extraction
│   │   ├── ruleEngine.ts           # 10-category rule detection engine
│   │   ├── riskScoring.ts          # Severity-weighted risk scoring algorithm
│   │   └── explanationService.ts   # Gemini AI assistance + rule fallback
│   └── utils/
│       ├── jwt.ts                  # Token generation and verification
│       └── sampleContract.ts       # Demo internship appointment agreement
├── src/
│   ├── components/
│   │   ├── Navbar.tsx              # Responsive top navigation & theme switcher
│   │   ├── Footer.tsx              # Legal disclaimer & quick links
│   │   ├── HighlightViewer.tsx     # In-document interactive clause highlighter
│   │   ├── RiskGauge.tsx           # SVG animated circular score indicator
│   │   └── ProtectedRoute.tsx      # Route authentication guard
│   ├── context/
│   │   ├── AuthContext.tsx         # User authentication state & token persistence
│   │   └── ThemeContext.tsx        # Dark & Light mode theme manager
│   ├── pages/
│   │   ├── LandingPage.tsx         # Public marketing page & live feature preview
│   │   ├── LoginPage.tsx           # Sign-in with quick-fill demo button
│   │   ├── RegisterPage.tsx        # New account creation
│   │   ├── ForgotPasswordPage.tsx  # Password recovery token verification
│   │   ├── DashboardPage.tsx       # Live dashboard with Recharts metrics
│   │   ├── AnalysisInputPage.tsx   # PDF upload & text paste interface
│   │   ├── ReportPage.tsx          # Detailed analysis report with PDF export
│   │   ├── ComparisonPage.tsx      # Side-by-side contract comparison matrix
│   │   ├── HistoryPage.tsx         # Searchable, filterable analysis history
│   │   └── SettingsPage.tsx        # User profile & engine diagnostics
│   ├── services/
│   │   └── api.ts                  # Axios client with automatic Bearer headers
│   ├── App.tsx                     # Main React router
│   ├── main.tsx                    # React root entry
│   └── index.css                   # Tailwind v4 styles & highlight classes
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
# Optional: Remote MongoDB connection string.
# If omitted, ClauseRadar automatically uses the persistent built-in JSON datastore at ./data/db.json.
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/clauseradar"

# Optional: Google Gemini API Key for plain-English simplification.
# The rule-based engine operates completely autonomously if omitted.
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Optional: Custom JWT Secret for authentication signing
JWT_SECRET="your-secure-jwt-secret-key-2026"

PORT=3000
```

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Testing Scenarios

1. **New User Registration & Login**:
   - Navigate to `/register` and create an account.
   - Log out and log in via `/login`. You can also click **Auto-Fill Credentials** on the login page.
2. **Demo Contract Analysis**:
   - Click **Demo Bond Contract** in the navigation bar or **Try Sample Contract** on the landing page.
   - ClauseRadar instantly extracts the text, executes the 10 detection rules, calculates the 82/100 risk score, and navigates to the detailed report.
3. **In-Document Clause Highlighting**:
   - In the Report page, click any highlighted clause in the document on the left, or click any flagged issue card on the right.
   - The document viewer smoothly scrolls to the exact clause with the appropriate severity highlight.
4. **PDF Report Export**:
   - Click **Download PDF Report** on the Report page to export a formatted legal risk assessment.
5. **Contract Comparison**:
   - Go to `/compare`, select two or more contracts, and review the side-by-side risk score differences and category-by-category matrix.
6. **PDF Upload & Validation**:
   - Go to `/analyze`, drag and drop a PDF file, or switch to the **Paste Agreement Text** tab to test custom contracts.
