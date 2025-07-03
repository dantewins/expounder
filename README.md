<div align="center">
  <a href="https://shipwrecked.hackclub.com/?t=ghrm" target="_blank">
    <img src="https://hc-cdn.hel1.your-objectstorage.com/s/v3/739361f1d440b17fc9e2f74e49fc185d86cbec14_badge.png"
         alt="This project is part of Shipwrecked, the world's first hackathon on an island!"
         style="width: 35%;">
  </a>
</div>

<h1 align="center">Expounder</h1>

<p align="center"><b>Automated, AI‑powered release‑note generator</b></p>

---

## ✨ Features

|                            |                                                                            |
| -------------------------- | -------------------------------------------------------------------------- |
| **AI‑clustered summaries** | GPT‑4o groups commits into human‑readable changelogs.                      |
| **One‑click exports**      | Push notes straight to **Notion**, **Markdown**, or **X/Twitter** threads. |
| **Secure & serverless**    | Runs on Vercel; user data stored in MongoDB Atlas.                         |
| **Open source**            | MIT‑licensed. Pull requests welcome!                                       |

---

## 🏗️ Tech Stack

| Layer     | Tech                                                               |
| --------- | ------------------------------------------------------------------ |
| Front‑end | Next.js 14 (App Router), React, TypeScript, shadcn/ui, TailwindCSS |
| Auth      | Clerk (social login + JWT)                                         |
| AI        | OpenAI GPT‑4o                                                      |
| Database  | MongoDB Atlas (Mongoose 8)                                         |
| Hosting   | Vercel (Edge & Node serverless functions)                          |

---

## 🚀 Quick Start

```bash
# 1. Clone
$ git clone https://github.com/your‑username/expounder.git && cd expounder

# 2. Install deps
$ pnpm install

# 3. Copy env vars
$ cp .env.example .env.local
# → fill in CLERK + OPENAI + MONGODB creds

# 4. Run dev server
$ pnpm dev

# open http://localhost:3000
```

### Environment Variables

| Key                                 | Example                                                | Note                     |
| ----------------------------------- | ------------------------------------------------------ | ------------------------ |
| `OPENAI_API_KEY`                    | `sk‑...`                                               | GPT‑4o key               |
| `CLERK_SECRET_KEY`                  | `sk_live_...`                                          | Get from Clerk dashboard |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...`                                          | Public key               |
| `MONGODB_URI`                       | `mongodb+srv://user:pass@cluster0.mongo.net/expounder` | Atlas connection         |

---

## 🛠️ Scripts

| Command      | What it does                         |
| ------------ | ------------------------------------ |
| `pnpm dev`   | Run local dev server with hot reload |
| `pnpm build` | Production build                     |
| `pnpm start` | Start prod server (after build)      |
| `pnpm lint`  | ESLint + TypeScript type check       |

---

## 🖼️ Screenshots

| Landing                                  | Dashboard                                    |
| ---------------------------------------- | -------------------------------------------- |
| ![Landing](./public/screens/landing.png) | ![Dashboard](./public/screens/dashboard.png) |

---

## 🛳️ Deploy on Vercel

1. Click **“Import Project”** on Vercel.
2. Add the environment variables from `.env.local`.
3. Choose **“Deploy”.**

A serverless instance will spin up with Edge runtime for AI calls and Node runtime for MongoDB.

---

## 👥 Contributing

1. **Fork** the repo & create your branch: `git checkout -b feat/my‑feature`
2. **Commit** your changes: `git commit -m "feat: add cool thing"`
3. **Push** to the branch: `git push origin feat/my‑feature`
4. Open a **Pull Request**.

We follow Conventional Commits + Semantic Pull Requests.

---

## 📜 License

[MIT](LICENSE) © 2025 Expounder Team
