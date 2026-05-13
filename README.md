# Generic Search Engine

Generic Search Engine is a React-based web application for loading CSV files into an interactive data grid, searching records instantly, and exporting filtered results.

**Live site:** https://nadavweisler.github.io/GenericSearchEngine/

## Overview

The application helps users inspect CSV datasets directly in the browser without a backend service. It is designed for quick ad-hoc analysis, combining structured column filtering with a global search experience.

## Key capabilities

- Import local CSV files from the browser
- Parse quoted values and ignore blank rows safely
- Infer column types to improve filtering behavior
- Search across all imported rows with a global search box
- Open large cell values in a dialog for easier inspection
- Export the filtered dataset back to CSV

## Live deployment

The project is configured for deployment to GitHub Pages:

- Production URL: https://nadavweisler.github.io/GenericSearchEngine/
- Deployment source: GitHub Actions workflow in `.github/workflows/deploy-pages.yml`

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm ci --legacy-peer-deps
```

### Run locally

```bash
npm start
```

### Run tests

```bash
CI=true npm test -- --watchAll=false
```

### Create a production build

```bash
npm run build
```

## How to use

1. Upload a `.csv` file.
2. Review the import summary and any warnings.
3. Use the search box or per-column filters to narrow the dataset.
4. Select a cell to inspect full content in a dialog.
5. Export the filtered rows when needed.

## Technical notes

- The first non-empty CSV row is treated as the header row.
- Files are processed fully in the browser before rendering.
- Date detection supports common ISO and slash-delimited formats.
