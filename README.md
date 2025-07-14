# Expounder Client (Web Dashboard)

Web dashboard for exploring GitHub repositories and generating comprehensive README files using OpenAI.

- ![Version](https://img.shields.io/badge/version-0.1.0-blue.svg) 

## Overview

Expounder Client is a Next.js (v15.3.4) web application that enables authenticated users to browse their GitHub repositories, explore file trees, preview file contents, and generate clear, comprehensive README files for any repository. It leverages Octokit for interacting with GitHub via custom API routes  and employs OpenAI’s embedding and file search capabilities to summarise and generate README content at scale . Authentication is handled by Clerk for secure access.

## Architecture

```mermaid
flowchart LR
  subgraph User Interface
    A[Browser UI]
  end
  A -->|1. List Repos| B[/api/github/repos/]
  A -->|2. Get File Tree| C[/api/github/tree?repoId={id}/]
  A -->|3. Get File| D[/api/github/file?owner={owner}&path={path}/]
  A -->|4. Generate README| E[/api/core/expound/]

  subgraph GitHub Integration
    B --> G[Octokit → GitHub API]
    C --> G
    D --> G
  end

  subgraph OpenAI Integration
    E --> H[Fetch Repo Tree & Blobs]
    H --> G
    H --> I[OpenAI Embeddings & VectorStore]
    I --> J[OpenAI File Search Tool]
    J --> I
    I --> E
  end

  E -->|5. Download| A
```

## Features

- Authenticate with GitHub via Clerk
- Browse repository file tree and preview raw file contents
- Generate a structured README using OpenAI embeddings and file search
- Download generated README as Markdown
- Responsive UI built with React, Tailwind CSS, and Radix UI
- Concurrency control for efficient processing

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd <repository-folder>

# Install dependencies
npm install

# Start development server
npm run dev
```

## Configuration

- OPENAI_API_KEY – API key for OpenAI usage
- GITHUB_CLIENT_ID – GitHub OAuth App Client ID
- GITHUB_CLIENT_SECRET – GitHub OAuth App Client Secret
- NEXT_PUBLIC_BASE_URL – Base URL for OAuth callback (e.g., http://localhost:3000)

## Usage

- Run in development mode: npm run dev
- Build for production: npm run build
- Start production server: npm run start
- Navigate to http://localhost:3000 and authenticate with GitHub
- Select a repository, explore files, and click "Generate notes" to download a README

## Contributing

- Fork the repository
- Create a feature branch: git checkout -b feature/YourFeature
- Make your changes and commit with clear messages
- Open a pull request and describe your changes
- Ensure all CI checks pass before merging

## Acknowledgements

- Next.js
- Clerk (Authentication)
- Octokit (GitHub API) 
- OpenAI
- Tailwind CSS
- Radix UI
