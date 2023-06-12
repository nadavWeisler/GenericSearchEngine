import { useState } from "react";

import { AgGridReact } from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export const Dashboard = () => {
    //const [file, setFile] = useState();
    //const [csvOutput, setCsvOutput] = useState();
    const [columnDefs, setColumnDefs] = useState();
    const [rowData, setRowData] = useState();
    const fileReader = new FileReader();

    const handleOnChange = (e) => {
        const file = e.target.files[0];

        fileReader.onload = (event) => {
            const csvOutput = event.target.result;
            const csvOutputRows = csvOutput.split("\n")
            //console.log(csvOutputRows[0])
            //console.log(csvOutputRows.slice(1))
            extractColDefs(csvOutputRows[0])
            extractRowData(csvOutputRows[0], csvOutputRows.slice(1))
        };
        fileReader.readAsText(file);
    };

    const extractColDefs = (firstRow) => {
        let colDefsArr = firstRow.split(",")
        colDefsArr = colDefsArr.map(col => {
            return { field: col }
        })

        setColumnDefs(colDefsArr)
    }

    const extractRowData = (headers, lines) => {
        var result = [];
        headers = headers.split(",");
        console.log(headers);

        for (var i = 1; i < lines.length; i++) {
            var obj = {};
            var currentline=lines[i].split(",");
            for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }
        //console.log(result);
        setRowData(result)
    }

    return (
        <div style={{ margin: '80px' }}>
            <h1>CSV IMPORT</h1>
            <form>
                <input type={"file"} accept={".csv"} onChange={handleOnChange} />
            </form>

            <div className="ag-theme-alpine" style={{ height: 400, minWidth: 600, marginTop: '30px' }}>
                <AgGridReact rowData={rowData} columnDefs={columnDefs} />
            </div>
        </div>
    )
}