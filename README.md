# 💼 CareerPath — Minimalist Job Application Tracker

**CareerPath** is a modern, responsive web application built with **Next.js** and **Tailwind CSS** designed to streamline the job hunt. Moving beyond clunky spreadsheets, it offers job seekers a centralized hub to track applications, practice behaviorial interviews, back up postings, and analyze market salaries.

It runs on **Next.js** with a **PostgreSQL** database (via **Prisma ORM**) and **Better Auth** email/password accounts, so every job seeker securely tracks their own private application pipeline.

---

## 🌟 Key Features

*   **🔐 Accounts & Authentication:** Register and sign in with email/password (powered by **Better Auth**). Each account's applications are private and persisted per user in PostgreSQL.
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
*   **Database:** [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM](https://www.prisma.io/) (7.x, driver adapter `@prisma/adapter-pg`)
*   **Auth:** [Better Auth](https://www.better-auth.com/) (email/password)
*   **Package Manager:** [pnpm](https://pnpm.io/)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have **Node.js** (v20+), **pnpm**, and a running **PostgreSQL** (v14+) instance:

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

3. Configure environment variables — copy the example and fill in your values:
   ```bash
   cp .env.example .env
   # Generate a secret for BETTER_AUTH_SECRET:
   openssl rand -base64 32
   ```

   | Variable              | Description                                              |
   | --------------------- | -------------------------------------------------------- |
   | `DATABASE_URL`        | PostgreSQL connection string (e.g. `postgres://myuser:mypassword@localhost:5432/careerpath`) |
   | `BETTER_AUTH_SECRET`  | 32+ char random secret for signing sessions              |
   | `BETTER_AUTH_URL`     | Base URL of the app (`http://localhost:3000` in dev)     |
   | `NEXT_PUBLIC_APP_URL` | Public base URL used by the Better Auth client           |

4. Create the database and apply the schema:
   ```bash
   createdb careerpath           # or: CREATE DATABASE careerpath; via psql
   pnpm db:migrate               # runs Prisma migrations + generates the client
   ```

5. Start the local development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000), then **register an account**. New accounts start empty — use the **Samples** button in the header to load example applications.

### Database scripts

| Script             | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `pnpm db:migrate`  | Create/apply migrations (dev)            |
| `pnpm db:deploy`   | Apply migrations (production)            |
| `pnpm db:generate` | Regenerate the Prisma client            |
| `pnpm db:studio`   | Open Prisma Studio to inspect data       |

---

## 🏗️ Production Build

To create an optimized production build:

```bash
pnpm build
pnpm start
```
