# HealthTrack AI — Frontend Web Application

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7.0-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.12-22B5BF)](https://recharts.org/)
[![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-0.446-F56565)](https://lucide.dev/)

The client-side web application for **HealthTrack AI**, a personal and family medical intelligence platform that transforms multi-page PDF laboratory reports into actionable longitudinal trends, structured observations, urgent clinical alerts, and interactive AI chat.

---

## 🌟 Key Features

- **Personal & Family Health Profiles:** Seamlessly switch between family members (Self, Parents, Spouse, Children) from the sidebar.
- **Unified Health Dashboard:**
  - High-level metric cards (Total Reports, Biomarkers Tracked, Flagged Attention Items).
  - Quick access to recent laboratory reports and latest tests needing attention.
  - Snapshot charts for high-priority health markers (Cholesterol, Glucose, Liver enzymes).
- **Asynchronous PDF Report Upload:**
  - Drag-and-drop or file selector supporting multi-page PDF reports.
  - Background processing status tracking with real-time feedback.
  - Client-side duplicate detection alert handling.
- **Detailed Report Inspector:**
  - Categorized test observation tables by panel (e.g., *Complete Blood Count*, *Lipid Profile*, *Liver Function*).
  - Color-coded status badges (`Within Range`, `Attention`, `Significant`, `Potentially Urgent`).
  - Source verification display with extracted lines and original PDF page references.
- **Longitudinal Trend Analytics:**
  - Time-series interactive line charts using Recharts.
  - Normal reference range shaded bands to visually show trajectory over time.
  - Filterable by timeframe: 3 Months, 6 Months, 1 Year, 3 Years, or All Time.
  - One-click navigation from any test row directly into its multi-year trend chart.
- **Urgent Clinical Alert Banners & Health Guidance:**
  - Prominent emergency evaluation banners for critical abnormalities requiring immediate physician review.
  - Actionable Do's & Don'ts, diet recommendations, and targeted doctor discussion prompts.
- **AI Medical Assistant (RAG Chat):**
  - Interactive chat interface powered by Google Gemini.
  - Two modes: **Report-Specific** (focused analysis of one report) and **History-Wide** (cross-year trajectory queries).
  - Markdown-formatted explanations with clickable source citations.
- **Settings & Security:**
  - BYOK (Bring Your Own Key) setup for Google Gemini API key with validation testing.
  - Full client-side JWT token lifecycle management with automatic session expiration handling.

---

## 🏗️ Architecture & Component Hierarchy

```
frontend/
├── src/
│   ├── assets/              # Static media, icons, and hero illustrations
│   ├── components/          # Reusable UI components
│   │   ├── ComparisonView.jsx     # Side-by-side historical report comparison
│   │   ├── HealthGuidanceCard.jsx # Do's & Don'ts, diet, and lifestyle advice
│   │   ├── MetricCard.jsx         # Dashboard statistics metric card
│   │   ├── Sidebar.jsx            # Persistent navigation & family profile switcher
│   │   ├── StatusBadge.jsx        # Standardized clinical status badge
│   │   ├── TestResultTable.jsx    # Grouped observation table with ranges & status
│   │   ├── TimelineView.jsx       # Chronological health report timeline
│   │   ├── TrendChart.jsx         # Recharts longitudinal graph with reference bands
│   │   ├── UploadModal.jsx        # PDF drag-and-drop upload modal dialog
│   │   └── UrgentAlertBanner.jsx  # Critical clinical abnormality alert banner
│   ├── context/
│   │   └── AuthContext.jsx        # Global auth state, JWT management, active patient
│   ├── pages/               # Top-level view routes
│   │   ├── LoginPage.jsx          # User sign-in and registration tabs
│   │   ├── DashboardPage.jsx      # Main health overview and quick metrics
│   │   ├── ReportsPage.jsx        # List of all uploaded reports with filters
│   │   ├── ReportDetailPage.jsx   # Deep dive into a single report's results
│   │   ├── TrendsPage.jsx         # Biomarker trends across historical reports
│   │   ├── ChatPage.jsx           # RAG-powered AI medical assistant
│   │   ├── FamilyPage.jsx         # Manage family member patient profiles
│   │   └── SettingsPage.jsx       # Gemini API key and model selection
│   ├── services/
│   │   └── api.js                 # Axios instance with auth headers & API services
│   ├── App.jsx              # Main routing & protected layout wrapper
│   ├── index.css            # Design tokens, typography, and theme styling
│   └── main.jsx             # React DOM root entrypoint
├── public/                  # Public assets & favicon
├── index.html               # HTML application template
├── vite.config.js           # Vite build config & backend API reverse proxy
└── package.json             # NPM dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** (Node v20+ recommended)
- **npm** (or `pnpm` / `yarn`)

### 1. Clone & Navigate
```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/healthtrack-ai-frontend.git
cd healthtrack-ai-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```

The application will be live at:
```
http://localhost:5173
```

---

## 🔄 Backend Integration & Proxying

The frontend uses Vite's built-in development proxy (`vite.config.js`) to automatically forward requests:
- `/api/*` ➔ `http://localhost:8000/api/*`
- `/uploads/*` ➔ `http://localhost:8000/uploads/*`

> Make sure your **HealthTrack AI Backend** is running on `http://localhost:8000` before logging in or uploading reports.

---

## 📦 Build for Production

To create an optimized production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

The production output is generated in the `dist/` directory, ready to be deployed to static hosting platforms like Vercel, Netlify, or AWS S3 / CloudFront.

---

## 🛡️ Medical Safety Notice

HealthTrack AI provides educational insights and longitudinal data visualization only. It does not provide medical diagnoses or prescribe medications. Users are advised to review all laboratory findings with their healthcare provider.

