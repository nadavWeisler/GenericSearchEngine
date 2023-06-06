import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ColDef, GridReadyEvent } from 'ag-grid-community';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  rowGroupPanelShow: any = 'always';
  columnDefs: ColDef[] = [];
  rowData!: any[];

  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
  };

  autoGroupColumnDef: ColDef = {
    minWidth: 200,
  };

  onGridReady(params: GridReadyEvent<any>) {
    this.http.get<any[]>(
        'https://www.ag-grid.com/example-assets/olympic-winners.json'
      )
      .subscribe((data) => (this.rowData = data));
  }

  constructor(private http: HttpClient) {};
}
