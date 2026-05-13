import { buildColumnDefs, detectColumnType, parseCsvText, validateCsvFile } from "./csvImport";

describe("csvImport", () => {
  test("parses quoted values, skips blank rows, and pads inconsistent columns", () => {
    const csvText = 'name,joined,score\n"Alice, A.",2024-01-02,7\n\nBob,2024-02-03\nCharlie,2024-02-05,11,extra';

    const result = parseCsvText(csvText, "people.csv");

    expect(result.summary).toEqual({
      fileName: "people.csv",
      rowCount: 3,
      columnCount: 4,
    });
    expect(result.headers).toEqual(["name", "joined", "score", "Column 4"]);
    expect(result.rowData[0]).toEqual({
      name: "Alice, A.",
      joined: "2024-01-02",
      score: "7",
      "Column 4": "",
    });
    expect(result.rowData[1]).toEqual({
      name: "Bob",
      joined: "2024-02-03",
      score: "",
      "Column 4": "",
    });
    expect(result.warnings).toEqual([
      "Ignored 1 blank row.",
      "Some rows used a different number of columns. Missing values were left blank.",
    ]);
  });

  test("detects number and date columns for grid configuration", () => {
    const rows = [
      { score: "7", joined: "2024-01-02", name: "Alice" },
      { score: "11", joined: "2024-02-03", name: "Bob" },
    ];

    expect(detectColumnType(rows, "score")).toBe("number");
    expect(detectColumnType(rows, "joined")).toBe("date");
    expect(detectColumnType(rows, "name")).toBe("text");

    const columnDefs = buildColumnDefs(["score", "joined", "name"], rows);

    expect(columnDefs[0].filter).toBe("agNumberColumnFilter");
    expect(columnDefs[1].filter).toBe("agDateColumnFilter");
    expect(columnDefs[2].filter).toBe("agTextColumnFilter");
  });

  test("rejects empty files and non-csv uploads", () => {
    expect(() => parseCsvText("", "empty.csv")).toThrow(
      'The selected file "empty.csv" is empty.'
    );
    expect(
      validateCsvFile(new File(["name"], "notes.txt", { type: "text/plain" }))
    ).toBe("Please choose a file with a .csv extension.");
  });
});
