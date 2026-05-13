import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { DialogCell } from "./DialogCell";
import { buildColumnDefs, parseCsvText, validateCsvFile } from "../utils/csvImport";

const INITIAL_STATUS = "Upload a CSV file to explore its contents.";

export const Dashboard = () => {
  const gridRef = useRef(null);
  const fileInputRef = useRef(null);
  const [columnDefs, setColumnDefs] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [summary, setSummary] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState(INITIAL_STATUS);
  const [dialogState, setDialogState] = useState({ open: false, value: "" });

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 160,
      menuTabs: ["filterMenuTab"],
      sortable: true,
      resizable: true,
      filter: "agTextColumnFilter",
    }),
    []
  );

  const hasImportedData = rowData.length > 0;

  const handleClose = () => {
    setDialogState((currentState) => ({ ...currentState, open: false }));
  };

  const clearImportedData = ({ clearFileInput = false } = {}) => {
    setColumnDefs([]);
    setRowData([]);
    setSearchText("");
    setSummary(null);
    setWarnings([]);
    setDialogState({ open: false, value: "" });

    if (clearFileInput && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportSuccess = (file, text) => {
    const parsedCsv = parseCsvText(text, file.name);

    setColumnDefs(buildColumnDefs(parsedCsv.headers, parsedCsv.rowData));
    setRowData(parsedCsv.rowData);
    setSummary(parsedCsv.summary);
    setWarnings(parsedCsv.warnings);
    setSearchText("");
    setErrorMessage("");
    setStatusMessage(
      `Loaded ${file.name} with ${parsedCsv.summary.rowCount} row${
        parsedCsv.summary.rowCount === 1 ? "" : "s"
      } and ${parsedCsv.summary.columnCount} column${
        parsedCsv.summary.columnCount === 1 ? "" : "s"
      }.`
    );
  };

  const handleOnChange = (event) => {
    const file = event.target.files?.[0];
    const validationError = validateCsvFile(file);

    if (validationError) {
      clearImportedData();
      setErrorMessage(validationError);
      setStatusMessage(INITIAL_STATUS);
      return;
    }

    setStatusMessage(`Loading ${file.name}...`);
    setErrorMessage("");
    setWarnings([]);

    const fileReader = new FileReader();

    fileReader.onload = (loadEvent) => {
      try {
        handleImportSuccess(file, loadEvent.target?.result);
      } catch (error) {
        clearImportedData();
        setErrorMessage(error.message);
        setStatusMessage(INITIAL_STATUS);
      }
    };

    fileReader.onerror = () => {
      clearImportedData();
      setErrorMessage(`Unable to read "${file.name}".`);
      setStatusMessage(INITIAL_STATUS);
    };

    fileReader.readAsText(file);
  };

  const handleReset = () => {
    clearImportedData({ clearFileInput: true });
    setErrorMessage("");
    setStatusMessage(INITIAL_STATUS);
  };

  const handleDownload = () => {
    const baseName = summary?.fileName?.replace(/\.csv$/i, "") || "results";

    gridRef.current?.api?.exportDataAsCsv({
      fileName: `${baseName}-filtered.csv`,
    });
  };

  const gridOptions = {
    onCellClicked: (event) => {
      setDialogState({
        open: true,
        value: event.value ?? "",
      });
    },
  };

  return (
    <Box className="dashboard-shell">
      {dialogState.open && (
        <DialogCell
          open={dialogState.open}
          data={dialogState.value}
          handleClose={handleClose}
        />
      )}

      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4" component="h1">
            CSV import
          </Typography>
          <Typography color="text.secondary">{statusMessage}</Typography>
        </Stack>

        <Paper className="dashboard-panel" elevation={1}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <input
                ref={fileInputRef}
                aria-label="Upload CSV file"
                type="file"
                accept=".csv,text/csv"
                onChange={handleOnChange}
              />
              <TextField
                label="Search imported rows"
                size="small"
                value={searchText}
                onChange={(inputEvent) => setSearchText(inputEvent.target.value)}
                disabled={!hasImportedData}
                fullWidth
              />
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={handleReset} disabled={!summary && !errorMessage}>
                  Reset
                </Button>
                <Button variant="contained" onClick={handleDownload} disabled={!hasImportedData}>
                  Download filtered CSV
                </Button>
              </Stack>
            </Stack>

            {summary && (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Typography variant="body2">
                  <strong>File:</strong> {summary.fileName}
                </Typography>
                <Typography variant="body2">
                  <strong>Rows:</strong> {summary.rowCount}
                </Typography>
                <Typography variant="body2">
                  <strong>Columns:</strong> {summary.columnCount}
                </Typography>
              </Stack>
            )}

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            {warnings.map((warning) => (
              <Alert key={warning} severity="warning">
                {warning}
              </Alert>
            ))}
          </Stack>
        </Paper>

        {hasImportedData ? (
          <div className="ag-theme-alpine dashboard-grid">
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              gridOptions={gridOptions}
              quickFilterText={searchText}
            />
          </div>
        ) : (
          <Paper className="dashboard-empty-state" variant="outlined">
            <Typography variant="h6">No data loaded yet</Typography>
            <Typography color="text.secondary">
              Import a CSV file to inspect rows, filter results, and preview cell
              values.
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};
