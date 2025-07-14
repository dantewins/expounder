# Expounder Client (Web Dashboard)  

Web dashboard for exploring GitHub repositories and generating README files using OpenAI. 

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)

## Overview

Expounder Client is a Next.js (v15.3.4) web application that enables authenticated users to browse their GitHub repositories, inspect file structures, preview file contents, and generate clear, comprehensive README files for any repository. It uses Clerk for authentication, Octokit for GitHub API interactions, and OpenAI’s embedding and file search capabilities to analyze and create README content at scale.  

## Architecture

```mermaid
flowchart TD
  User["User"]
  FE["Next.js Frontend"]
  Auth["Clerk Auth Service"]
  APIGH["API Routes /api/github/*"]
  APIEXP["API Route /api/core/expound"]
  GitHub["GitHub API (Octokit)"]
  OpenAI["OpenAI API"]
  Vector["OpenAI Vector Store"]

  User --> FE
  FE --> Auth
  FE --> APIGH
  FE --> APIEXP
  APIGH --> GitHub
  APIEXP --> GitHub
  APIEXP --> OpenAI
  APIEXP --> Vector
```

## Features

- Authenticate with GitHub via Clerk
- Browse and preview repository file trees
- Generate structured README using OpenAI embeddings and file search
- Download generated README as Markdown
- Concurrency control for efficient processing
- Responsive UI with React, Tailwind CSS, and Radix UI

## Installation

```bash
git clone <repository-url>
cd <repository-folder>
npm install
npm run dev
```

## Configuration

- OPENAI_API_KEY – API key for OpenAI usage
- GITHUB_CLIENT_ID – GitHub OAuth App Client ID
- GITHUB_CLIENT_SECRET – GitHub OAuth App Client Secret
- NEXT_PUBLIC_BASE_URL – Base URL for OAuth callback (e.g., http://localhost:3000)

## Usage

Run the application in development mode and navigate to http://localhost:3000. Authenticate with your GitHub account, select a repository, explore files, and click “Generate notes” to create and download a comprehensive README file. 

```bash
npm run dev
```

## Contributing

- Fork the repository
- Create a feature branch: git checkout -b feature/YourFeature
- Commit your changes with clear messages
- Open a pull request and describe your changes
- Ensure all checks pass before merging

## Acknowledgements

- Next.js
- Clerk (Authentication)
- Octokit (GitHub API)
- OpenAI
- Tailwind CSS
- Radix UI
- shadcn/ui
- Zod
