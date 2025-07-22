import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import type { RowData } from "../types/TableData";
import { fetchRows, totalPages } from "../utils/artic";
import { DataTableStateEvent } from 'primereact/datatable';
const Table: React.FC = () => {
  const [first, setFirst] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setToal] = useState(0);
  const [data, setData] = useState([null] as unknown as RowData[]);

  useEffect(() => {
    const response = fetchRows(page);
    response
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
      });
  }, [page]);

  useEffect(() => {
    const fetchTotalPages = async () => {
      const response = totalPages();
      response.then((res) => {
        setToal(res);
      });
    };
    fetchTotalPages();
  }, []);

  const handlePageChange = (event: DataTableStateEvent) => {
    setFirst(event.first);
    setPage(event.page! + 1);
  };
  return (
    <div className="p-6">
      <DataTable
        value={data}
        paginator
        first={first}
        totalRecords={total}
        stripedRows
        rows={7}
        lazy
        dataKey="id"
        tableStyle={{ minWidth: "50rem" }}
        onPage={handlePageChange}
      >
        <Column field="title" sortable header="Title"></Column>
        <Column field="artist_display" header="Artist"></Column>
        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" sortable header="Year Start"></Column>
        <Column field="date_end" header="Year End"></Column>
      </DataTable>
    </div>
  );
};

export default Table;
