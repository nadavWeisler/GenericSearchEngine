import Papa from "papaparse";

const DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$|^\d{1,2}\/\d{1,2}\/\d{2,4}(?: \d{1,2}:\d{2}(?::\d{2})?)?$/;
const NUMBER_PATTERN = /^-?\d+(?:\.\d+)?$/;

const normalizeHeaderValue = (value) =>
  String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim();

const normalizeCellValue = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return typeof value === "string" ? value.trim() : String(value);
};

const isBlankRow = (row = []) =>
  row.every((value) => normalizeCellValue(value) === "");

const buildHeaders = (headerRow, maxColumnCount) => {
  const seenHeaders = new Map();

  return Array.from({ length: maxColumnCount }, (_, columnIndex) => {
    const normalizedHeader = normalizeHeaderValue(headerRow[columnIndex]);
    const baseHeader = normalizedHeader || `Column ${columnIndex + 1}`;
    const seenCount = seenHeaders.get(baseHeader) ?? 0;

    seenHeaders.set(baseHeader, seenCount + 1);

    return seenCount === 0
      ? baseHeader
      : `${baseHeader} (${seenCount + 1})`;
  });
};

const compareNumbers = (valueA, valueB) =>
  Number(normalizeCellValue(valueA)) - Number(normalizeCellValue(valueB));

const compareDates = (valueA, valueB) =>
  new Date(normalizeCellValue(valueA)).getTime() -
  new Date(normalizeCellValue(valueB)).getTime();

const isLikelyNumber = (value) => NUMBER_PATTERN.test(String(value));

const isLikelyDate = (value) =>
  DATE_PATTERN.test(String(value)) && !Number.isNaN(Date.parse(String(value)));

export const detectColumnType = (rows, field) => {
  const values = rows
    .map((row) => row[field])
    .filter((value) => value !== "");

  if (values.length === 0) {
    return "text";
  }

  if (values.every(isLikelyNumber)) {
    return "number";
  }

  if (values.every(isLikelyDate)) {
    return "date";
  }

  return "text";
};

export const buildColumnDefs = (headers, rows) =>
  headers.map((field) => {
    const columnType = detectColumnType(rows, field);
    const columnDef = {
      field,
      flex: 1,
      minWidth: 160,
      menuTabs: ["filterMenuTab"],
      sortable: true,
      resizable: true,
      filter: "agTextColumnFilter",
      cellDataType: false,
    };

    if (columnType === "number") {
      return {
        ...columnDef,
        filter: "agNumberColumnFilter",
        comparator: compareNumbers,
        filterValueGetter: (params) =>
          params.data?.[field] === "" ? null : Number(params.data?.[field]),
      };
    }

    if (columnType === "date") {
      return {
        ...columnDef,
        filter: "agDateColumnFilter",
        comparator: compareDates,
        filterParams: {
          comparator: (filterDate, cellValue) => {
            const normalizedValue = normalizeCellValue(cellValue);

            if (!normalizedValue) {
              return -1;
            }

            const cellDate = new Date(normalizedValue);
            const normalizedCellDate = new Date(
              cellDate.getFullYear(),
              cellDate.getMonth(),
              cellDate.getDate()
            );

            if (normalizedCellDate < filterDate) {
              return -1;
            }

            if (normalizedCellDate > filterDate) {
              return 1;
            }

            return 0;
          },
        },
      };
    }

    return columnDef;
  });

export const validateCsvFile = (file) => {
  if (!file) {
    return "Select a CSV file to import.";
  }

  const lowerCaseName = file.name?.toLowerCase() ?? "";
  const allowedMimeTypes = new Set(["", "text/csv", "application/vnd.ms-excel"]);

  if (!lowerCaseName.endsWith(".csv") && !allowedMimeTypes.has(file.type ?? "")) {
    return "Please choose a file with a .csv extension.";
  }

  return null;
};

export const parseCsvText = (text, fileName = "CSV file") => {
  if (typeof text !== "string" || text.trim() === "") {
    throw new Error(`The selected file "${fileName}" is empty.`);
  }

  const parsed = Papa.parse(text, {
    skipEmptyLines: "greedy",
  });

  if (parsed.errors.length > 0) {
    throw new Error(
      `Unable to parse "${fileName}". ${parsed.errors[0].message}`
    );
  }

  const rows = parsed.data.filter((row) => Array.isArray(row));

  if (rows.length === 0) {
    throw new Error(`The selected file "${fileName}" does not contain CSV rows.`);
  }

  const [rawHeaderRow = [], ...rawDataRows] = rows;

  if (isBlankRow(rawHeaderRow)) {
    throw new Error(`The selected file "${fileName}" is missing a header row.`);
  }

  const maxColumnCount = rows.reduce(
    (currentMax, row) => Math.max(currentMax, row.length),
    rawHeaderRow.length
  );
  const headers = buildHeaders(rawHeaderRow, maxColumnCount);
  const warnings = [];
  const nonEmptyRows = rawDataRows.filter((row) => !isBlankRow(row));
  const blankRowsRemoved = rawDataRows.length - nonEmptyRows.length;
  const inconsistentRowCount = nonEmptyRows.filter(
    (row) => row.length !== headers.length
  ).length;

  if (blankRowsRemoved > 0) {
    warnings.push(`Ignored ${blankRowsRemoved} blank row${blankRowsRemoved > 1 ? "s" : ""}.`);
  }

  if (rawHeaderRow.length !== headers.length || inconsistentRowCount > 0) {
    warnings.push(
      "Some rows used a different number of columns. Missing values were left blank."
    );
  }

  const rowData = nonEmptyRows.map((row) =>
    headers.reduce((record, header, columnIndex) => {
      record[header] = normalizeCellValue(row[columnIndex]);
      return record;
    }, {})
  );

  return {
    headers,
    rowData,
    warnings,
    summary: {
      fileName,
      rowCount: rowData.length,
      columnCount: headers.length,
    },
  };
};
