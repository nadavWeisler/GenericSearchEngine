import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";

jest.mock("ag-grid-react", () => {
  const React = require("react");

  return {
    AgGridReact: React.forwardRef(
      ({ rowData = [], columnDefs = [], quickFilterText = "", gridOptions }, ref) => {
        React.useImperativeHandle(ref, () => ({
          api: {
            exportDataAsCsv: jest.fn(),
          },
        }));

        const normalizedFilter = quickFilterText.toLowerCase();
        const filteredRows = rowData.filter((row) =>
          JSON.stringify(row).toLowerCase().includes(normalizedFilter)
        );

        return (
          <div data-testid="mock-grid">
            {filteredRows.map((row, rowIndex) => (
              <div data-testid={`mock-grid-row-${rowIndex}`} key={`${rowIndex}-${normalizedFilter}`}>
                {columnDefs.map(({ field }) => (
                  <button
                    key={`${rowIndex}-${field}`}
                    onClick={() => gridOptions?.onCellClicked?.({ value: row[field] })}
                    type="button"
                  >
                    {row[field]}
                  </button>
                ))}
              </div>
            ))}
          </div>
        );
      }
    ),
  };
});

class MockFileReader {
  readAsText(file) {
    file
      .text()
      .then((text) => {
        this.onload?.({ target: { result: text } });
      })
      .catch(() => {
        this.onerror?.();
      });
  }
}

beforeAll(() => {
  global.FileReader = MockFileReader;
});

test("renders upload controls and empty state", () => {
  render(<App />);

  expect(screen.getByText(/Generic Search Engine/i)).toBeInTheDocument();
  expect(screen.getByText(/Upload a CSV file to explore its contents/i)).toBeInTheDocument();
  expect(screen.getByText(/No data loaded yet/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /reset/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: /download filtered csv/i })).toBeDisabled();
});

test("imports csv data, shows warnings, filters results, and previews a cell", async () => {
  render(<App />);

  const csvFile = new File(
    ['name,city,score\n"Alice, A.",Paris,7\nBob,London,11\n,,\nCharlie,Berlin,13,extra'],
    "people.csv",
    { type: "text/csv" }
  );
  Object.defineProperty(csvFile, "text", {
    value: () =>
      Promise.resolve(
        'name,city,score\n"Alice, A.",Paris,7\nBob,London,11\n,,\nCharlie,Berlin,13,extra'
      ),
  });

  fireEvent.change(screen.getByLabelText(/upload csv file/i), {
    target: { files: [csvFile] },
  });

  expect(await screen.findByText(/Loaded people\.csv with 3 rows and 4 columns/i)).toBeInTheDocument();
  expect(screen.getByText(/Some rows used a different number of columns/i)).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/search imported rows/i), {
    target: { value: "london" },
  });

  await waitFor(() => {
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Paris")).not.toBeInTheDocument();
  });

  fireEvent.change(screen.getByLabelText(/search imported rows/i), {
    target: { value: "" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Alice, A." }));

  expect(await screen.findByText(/Cell value/i)).toBeInTheDocument();
  expect(
    within(screen.getByRole("dialog")).getByText("Alice, A.")
  ).toBeInTheDocument();
});

test("rejects non-csv files", async () => {
  render(<App />);

  const invalidFile = new File(["name"], "notes.txt", { type: "text/plain" });

  fireEvent.change(screen.getByLabelText(/upload csv file/i), {
    target: { files: [invalidFile] },
  });

  expect(await screen.findByText(/Please choose a file with a \.csv extension/i)).toBeInTheDocument();
});
