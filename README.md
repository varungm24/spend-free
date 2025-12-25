<div align="center">
  <img src="public/wallet.svg" width="80" height="80" alt="SpendFree Logo" />
  <h1>SpendFree</h1>
  <p><strong>Master your Capital with Total Clarity.</strong></p>
  <p>A high-performance, privacy-first expense tracking architected for the modern era.</p>

  <div>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
    <img src="https://img.shields.io/badge/Convex-000000?style=for-the-badge&logo=convex&logoColor=white" />
  </div>
</div>

---

## 🚀 Overview

**SpendFree** is a next-generation financial management tool designed with precision and user experience at its core. It combines a minimal, high-aesthetic interface with powerful real-time analytics, ensuring you have complete control over your financial narrative. Built on a local-first architecture with end-to-end cloud synchronization via Convex.

## ✨ Key Features

- 💎 **Premium Aesthetic**: Modern, glass-morphism UI with fluid animations using GSAP and Framer Motion.
- 📈 **Advanced Analytics**: Real-time spending trends, Month-on-Month performance comparisons, and payment distribution charts.
- 🎯 **Global Budgeting**: A simplified, single-target monthly budgeting system designed for high-level financial control.
- 🌓 **Adaptive Themes**: Seamless dark and light mode support with curated, high-contrast color palettes.
- 📱 **PWA Support**: Install SpendFree as a native application for a lightning-fast desktop/mobile experience.
- 🔐 **Secure & Private**: Enterprise-grade authentication via Clerk, keeping your financial narrative private.
- ⚡ **Vite Powered**: Built for speed with sub-second load times and a reactive architecture.

## 🛠️ Tech Stack

### Frontend

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion 12](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Auth**: [Clerk React](https://clerk.com/)

### Backend

- **Database & Server**: [Convex](https://www.convex.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Date Management**: [Date-fns](https://date-fns.org/)

---

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS)
- [npm](https://www.npmjs.com/)
- A [Clerk](https://clerk.com/) and [Convex](https://www.convex.dev/) account.

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd spend-tracker
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your keys:

   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   VITE_CONVEX_URL=your_convex_url
   ```

4. **Launch Application:**

   ```bash
   # Start the frontend dev server
   npm run dev

   # In a separate terminal, start the Convex backend
   npx convex dev
   ```

---

## 🏗️ Architecture

SpendFree follows a modern reactive architecture:

- **`src/pages`**: Main application views (Dashboard, Settings, Onboarding, etc.)
- **`src/components`**: Highly reusable UI components featuring glass-morphism styles.
- **`convex/`**: Cloud functions, database schema, and server-side logic.
- **`src/store`**: Centralized state management using Zustand for high-performance updates.

---

## 🚀 Deployment

SpendFree is designed to be easily deployed using modern cloud platforms.

### 1. Backend (Convex)

Deploy your backend functions and database schema to the Convex production environment:

```bash
npx convex deploy
```

This will provide you with a production Convex URL (e.g., `https://happy-monkey-123.convex.cloud`).

### 2. Authentication (Clerk)

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com/).
2. Create a production instance or use your existing one.
3. Update your production `VITE_CLERK_PUBLISHABLE_KEY`.

### 3. Frontend (Vercel / Netlify)

We recommend **Vercel** for the smoothest experience with Vite and React.

1. Connect your GitHub repository to Vercel.
2. Configure the following **Environment Variables** in the Vercel dashboard:
   - `VITE_CONVEX_URL`: Your production Convex URL.
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your production Clerk Publishable Key.
3. Click **Deploy**.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ for the modern accountant.</p>
  <a href="https://www.linkedin.com/in/varun-gm-86694a1a4/">LinkedIn</a> • 
  <a href="https://x.com/GMVarun2">Twitter</a> • 
  <a href="https://www.youtube.com/@Code_Canopy">YouTube</a>
</div>
