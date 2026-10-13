<h1 align="center">🏥 Smile Clinic — Admin Executive &amp; Clinical Management Portal</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion"/>
  <img src="https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge" alt="MIT License"/>
</p>

<p align="center">
  <strong>Smile Clinic Admin Portal</strong> is a state-of-the-art, ultra-responsive, and HIPAA-compliant electronic healthcare administration platform.<br/>
  It unifies hospital executive oversight, operating theatre scheduling, continuous inpatient telemetry EHR registries,<br/>
  front-desk reception triage with audio announcements, revenue cycle claims billing, diagnostic pathology laboratory operations,<br/>
  and embedded Microsoft Power BI DirectQuery analytics.
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Admin Executive Dashboard** | Real-time clinical command center with 4-KPI bento hero (Active Census 1,248, Bed Occupancy 87.4%, OR Utilization 91.2%, ER Wait 14m), 24h patient inflow vs discharge area SVG visualizer, department occupancy progress meters, live surgical suite timelines, and Code Red emergency broadcast trigger. |
| 🩺 **Doctors Directory & OR Scheduling** | Central surgeon registry with specialty filters and live status chips (`In Surgery`, `On Duty`, `On Rounds`, `Off Duty`). Live timeline monitor across 6 specialized Operating Theatres with interactive OR slot booking modal and new practitioner onboarding. |
| 🗂️ **Patient EHR Registry & Telemetry** | Comprehensive inpatient and outpatient directory with real-time ward capacity telemetry (1,428 beds). Features an interactive quick-view inspection drawer streaming continuous heart rate sparklines, blood pressure MAP, SpO2, and medication allergy lists. Includes bed transfer, discharge summary, and admission modals. |
| 🛎️ **Reception & Front-Desk Triage** | High-precision queue controller with patient arrival rush curve wave visualization, 6-counter staffing allocation matrix, fast-track walk-in intake, visitor RFID pass encoding, and digital signage lobby display with audible speaker chime broadcasts. |
| 💳 **Billing Team & Revenue Management** | End-to-end revenue cycle ledger with gross billed revenue tracking ($1.48M), claims approval rate gauge (96.4%), 6-month longitudinal recovery area chart, payer mix donut visualizer, claim denial root cause analysis, and batch EDI 837D clearinghouse transmission. |
| 🔬 **Laboratory & Pathology Operations** | Central diagnostic facility console monitoring 8 automated spectrometry analyzers (Sysmex, Cobas, GeneXpert, Ortho Vision) at 98.2% uptime. Features specimen worklists with stat priority flags, panic value call-out links, raw chromatographic peaks plotting, and pathologist electronic sign-offs. |
| 🔐 **Dynamic Authentication (Login / Signup)** | Split-screen clinical security gateway featuring an **animated left hero panel** that smoothly alters branding, accreditation standards (`HL7 FHIR`, `JCAHO`, `SOC-2`), and operational metrics as users toggle between Sign In and Sign Up tabs. Includes MFA selection (Duo Push, FIDO2, SMS). |
| 🔑 **3-Step OTP Master Key Recovery** | Multi-step password recovery wizard: Institutional Email + HIPAA authorization checkbox, 6-digit individual OTP input boxes with scale animations, clipboard paste support, auto-fill demo (`482910`), and real-time countdown timer leading to two-window password reset with strength checking. |
| 📈 **Power BI Clinical Analytics Suite** | Embedded enterprise Power BI DirectQuery analytics modal featuring DAX margin velocity gauges, cross-department EBITDA velocity, AI-driven anomaly detections, and simulated `.pbix` template downloads. |
| 📑 **Multi-Format Master Export Hub** | Universal export modal supporting encrypted PDF audit reports, itemized Excel spreadsheets (`.xlsx`), Power BI workbooks (`.pbix`), and raw CSV telemetry feeds with real-time compilation progress animation. |
| 🔔 **Notification Center & Toast System** | Reactive multi-tier notification drawer categorizing critical codes, financial remittances, and queue alerts with sound-enabled feedback toasts and unread counters. |
| 📱 **100% Mobile & Tablet Responsiveness** | Built with mobile-first CSS architecture, off-canvas slide-out navigation drawers, responsive SVG chart scaling, and backdrop-blurred overlay modals. |

---

## 💻 How to Build (For Developers)

Before you begin, ensure you have **[Node.js](https://nodejs.org/)** (v18.0.0 or higher recommended) and **npm** installed on your system.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/HelloWorld-Farhan/Admin_DentalClinic.git
cd Admin_DentalClinic
```

### Step 2 — Install Dependencies

```bash
npm install
```

### Step 3 — Run Locally

```bash
npm run dev
```

> The application will be running live at `http://localhost:5175`.

### Step 4 — Build for Production

```bash
npm run build
```

> Your optimized production bundle will be generated inside the `dist/` directory with zero TypeScript or bundling warnings.

---

## 📁 Project Structure

```text
AdminPanel_DentalClinic/
├── public/
├── src/
│   ├── components/
│   │   ├── Layout.tsx             # Master navigation frame, department selector, global notifications, and profile menu
│   │   ├── PowerBIModal.tsx       # Enterprise Power BI analytics modal with DAX telemetry and .pbix download
│   │   ├── ExportModal.tsx        # Multi-format report exporter (PDF, Excel, Power BI, CSV)
│   │   └── ToastNotification.tsx  # Dynamic multi-status animated floating toast alert system
│   ├── pages/
│   │   ├── Dashboard.tsx          # Executive dashboard: 4-KPI bento, 24h patient flow area chart, OR suites & triage
│   │   ├── Doctors.tsx            # Doctors directory, OR timeline scheduler, doctor profile & booking modals
│   │   ├── Patients.tsx           # EHR registry, continuous telemetry drawer, bed transfer & discharge modals
│   │   ├── Reception.tsx          # Front-desk triage, arrival rush curve, counter allocation & lobby signage display
│   │   ├── Billing.tsx            # Revenue cycle management, payer mix donut, claims ledger & EDI 837 submission
│   │   ├── Laboratory.tsx         # Diagnostic lab ops, analyzer hardware grid, STAT panic alerts & sign-off
│   │   ├── Login.tsx              # Split authentication gateway with dynamic left hero alteration & MFA
│   │   ├── Signup.tsx             # Clinical practitioner onboarding intake wrapper
│   │   └── ForgotPassword.tsx     # 3-step credential recovery: email consent, animated 6-digit OTP & 2-window reset
│   ├── data/
│   │   └── mockData.ts            # Enterprise mock datasets for doctors, OR suites, EHR patients, claims & lab tests
│   ├── types/
│   │   └── index.ts               # Strict TypeScript definitions for all clinical & administrative entities
│   ├── App.tsx                    # Client-side router configuration with animated transitions and path aliases
│   ├── main.tsx                   # Application entrypoint
│   └── index.css                  # Custom styling, medical scrollbars & Material Symbols configuration
├── tailwind.config.js             # Stitch clinical design tokens, custom colors, and typography definitions
├── tsconfig.json                  # TypeScript compiler settings
├── vite.config.ts                 # Vite bundler configuration (Port 5175)
└── package.json                   # Dependencies, scripts, and build targets
```

---

## 🎨 Healthcare Design System Tokens

The application strictly implements the design tokens from the **Stitch Hospital Management System**:

- **Primary Clinical Teal:** `#005c65` (`primary`) / `#007782` (`primary-container`)
- **Diagnostic Blue:** `#1560a4` (`secondary`)
- **Telemetry Cyan / Mint:** `#005d5d` (`tertiary`) / `#94f2f1` (`tertiary-fixed`)
- **Emergency Crimson:** `#ba1a1a` (`error`) / `#ffdad6` (`error-container`)
- **Clinical Surfaces:** `#f7fafc` (`surface`) / `#ffffff` (`surface-container-lowest`) / `#ebeef0` (`surface-container`)
- **Typography:** `Inter`, `Outfit`, and `Material Symbols Outlined`

---

## 📜 License

This project is licensed under the **MIT License**.
