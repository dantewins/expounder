# Expounder

Drag-drop your CHANGELOG.md; app clusters commits using OpenAI embeddings and outputs a polished Notion-style release page + a copyable tweet thread.

- [![npm version](https://img.shields.io/npm/v/expounder.svg)](https://www.npmjs.com/package/expounder)
- [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
- [![Build Status](https://github.com/dantewins/expounder/actions/workflows/ci.yml/badge.svg)](https://github.com/dantewins/expounder/actions)
- [![Downloads](https://img.shields.io/npm/dm/expounder.svg)](https://www.npmjs.com/package/expounder)

## Overview

Expounder streamlines the process of turning a raw CHANGELOG.md into professional release notes and a tweet-ready thread. By leveraging OpenAI embeddings to cluster commits, it groups related changes and formats them into a clean Notion-style page. You get:

- A structured, human-friendly release summary
- An auto-generated tweet thread for social sharing
- Configurable clustering and templates
- CLI and programmatic API for integration

## Architecture

```mermaid
flowchart LR
  A[CHANGELOG.md] --> B(Parser)
  B --> C[Embedding Service (OpenAI)]
  C --> D[Clusterer]
  D --> E[Formatter]
  E --> F[Notion Export]
  E --> G[Tweet Thread Export]
  F --> H[Notion API / File]
  G --> I[Console / Clipboard]
```

## Features

- Drag-and-drop or specify CHANGELOG.md input
- Automatic commit clustering via OpenAI embeddings
- Configurable model and cluster count
- Notion-style markdown export
- Copyable tweet thread generation
- CLI tool and JavaScript/TypeScript API
- Support for custom templates and prompts

## Installation

```bash
# Install globally
npm install -g expounder
# or
yarn global add expounder

# Install locally in a project
npm install --save expounder
```

## Configuration

Expounder requires an OpenAI API key. Set it via an environment variable:

```bash
export OPENAI_API_KEY=your_api_key_here
```

Optionally, you can create a `.expounderrc.json` in your project root to override defaults:

```json
{
  "input": "CHANGELOG.md",
  "model": "gpt-3.5-turbo-16k",
  "clusters": 5,
  "output": {
    "notion": "notion-release.md",
    "tweets": "tweet-thread.txt"
  }
}
```

## Usage

### CLI

```bash
# Run with defaults from .expounderrc.json
expounder

# Override options
expounder --input CHANGELOG.md --clusters 4 --notion summary.md --tweets thread.txt

# Short flags
expounder -i CHANGELOG.md -c 4 -n summary.md -t thread.txt
```

### API

```javascript
import expounder from 'expounder';

(async () => {
  const result = await expounder({
    input: 'CHANGELOG.md',
    model: 'gpt-3.5-turbo-16k',
    clusters: 5,
    openaiApiKey: process.env.OPENAI_API_KEY
  });

  // Markdown page for Notion
  console.log(result.notion);

  // Copy-and-paste tweet thread
  console.log(result.tweets);
})();
```

## Folder Structure

```bash
.
├── bin/
│   └── cli.js         # Command-line entrypoint
├── src/
│   ├── parser.js      # CHANGELOG.md parser
│   ├── embedder.js    # OpenAI embedding calls
│   ├── clusterer.js   # Commit clustering logic
│   ├── formatter.js   # Markdown formatting
│   ├── index.js       # Core API export
│   └── utils.js       # Shared utilities
├── tests/             # Jest test suites
│   ├── parser.test.js
│   ├── clusterer.test.js
│   └── formatter.test.js
├── .expounderrc.json  # Optional config
├── CHANGELOG.md       # Input changelog
├── package.json
├── LICENSE
└── README.md
```

## Tests

We use Jest for unit and integration tests. Make sure your OpenAI API key is set for any tests that call the API.

```bash
npm test
```

## Roadmap

- v1.0: Stable CLI & core functionality
- v1.1: Custom templates & prompts
- v1.2: Direct Notion API publishing
- v2.0: Plugin system & extensibility
- v2.1: Additional export formats (HTML, PDF)
- v3.0: Web UI with drag-and-drop

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit with clear, conventional commit messages
6. Open a pull request and describe your changes

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- Thanks to OpenAI for the embeddings API
- Mermaid.js for architecture diagram support
- The Node.js community and all open-source contributors
