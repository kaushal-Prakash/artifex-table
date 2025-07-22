import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import type { RowData } from "../types/TableData";
import { fetchRows } from "../utils/artic";
const Table: React.FC = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
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
      const total = await fetchRows(1);
      setTotalPages(total.length);
    };
    fetchTotalPages();
  }, []);

  return (
    <div>
      <DataTable
        value={data}
        paginator
        stripedRows
        rows={5}
        rowsPerPageOptions={[5, 10]}
        tableStyle={{ minWidth: "50rem" }}
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
