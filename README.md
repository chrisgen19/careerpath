# 💼 CareerPath — Minimalist Job Application Tracker

**CareerPath** is a modern, responsive web application built with **Next.js** and **Tailwind CSS** designed to streamline the job hunt. Moving beyond clunky spreadsheets, it offers job seekers a centralized hub to track applications, practice behaviorial interviews, back up postings, and analyze market salaries.

It operates entirely client-side using **localStorage** for instant page loads, offline-friendly access, and zero database setup.

---

## 🌟 Key Features

*   **📋 Kanban Board & List Views:** Move applications through pipeline stages (Bookmarked, Applied, Interviewing, Offered, Rejected) using a drag-and-drop board (powered by `@hello-pangea/dnd`) or standard sortable table list.
*   **💡 STAR Interview Story Prep:** Formulate and save behavioral stories directly mapped to each application using the **Situation, Task, Action, Result** (STAR) methodology.
*   **📊 Salary Range Analyzer:** Parses job description salaries and plots min, max, and average ranges on a visual gauge.
*   **💾 Job Description Snapshots:** Store a local copy of job descriptions to prevent loss of reference details when listings are deleted by companies.
*   **🔐 Credentials & Portal Tracker:** Log application portals (LinkedIn, Indeed, direct referral) and track Workday/Lever login credentials.
*   **📈 SVG Analytics Dashboard:** Visual summaries of your pipeline progress, channels, and compensation distributions.
*   **📱 Mobile-First Responsive UX:** Fully-responsive viewport scaling featuring bottom tab navigation, swipeable sheets, and touch-friendly interactive elements.

---

## 🛠️ Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4) & Roboto Google Font
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Drag & Drop:** `@hello-pangea/dnd`
*   **Persistence:** HTML5 LocalStorage API
*   **Package Manager:** [pnpm](https://pnpm.io/)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have **Node.js** (v18+) and **pnpm** installed:

```bash
npm install -g pnpm
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chrisgen19/careerpath.git
   cd careerpath
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the local development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🏗️ Production Build

To create an optimized production build:

```bash
pnpm build
pnpm start
```
