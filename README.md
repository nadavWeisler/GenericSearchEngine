# GenericSearchEngine

GenericSearchEngine is a React app for exploring CSV files in a searchable grid.

## Features

- Upload local CSV files
- Parse quoted values and ignore blank rows safely
- Detect text, number, and date columns for better filtering
- Search across imported rows with a global search box
- Preview large cell values in a dialog
- Download the filtered grid as CSV

## Getting started

Install dependencies:

```bash
npm ci --legacy-peer-deps
```

Start the development server:

```bash
npm start
```

Create a production build:

```bash
npm run build
```

Run the test suite:

```bash
CI=true npm test -- --watchAll=false
```

## Usage

1. Upload a `.csv` file.
2. Review the import summary and any warnings.
3. Use the global search box or the grid column filters to narrow results.
4. Click any cell to inspect long values.
5. Download the filtered result set if needed.

## Known limitations

- The app expects the first non-empty CSV row to contain headers.
- Large files are loaded fully in the browser before rendering.
- Date detection supports common ISO and slash-delimited date formats.
