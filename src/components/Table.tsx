import React, { useEffect, useState } from "react";
import { DataTable, type DataTableStateEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import type { RowData } from "../types/TableData";
import { fetchRows, totalPages } from "../utils/artic";

const store = "selectedRowIds";

const Table: React.FC = () => {
  const [first, setFirst] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<RowData[]>([]);
  const [selectedRows, setSelectedRows] = useState<RowData[]>([]);
  const [initialSelectedIds, setInitialSelectedIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  //get initial selected ids from localStorage
  useEffect(() => {
    const savedIds = localStorage.getItem(store);
    if (savedIds) {
      try {
        setInitialSelectedIds(JSON.parse(savedIds));
      } catch (e) {
        console.error("failed to get saved IDs", e);
      }
    }
    setIsInitialized(true);
  }, []);

  //set selected rows based on initial selected ids
  useEffect(() => {
    if (isInitialized && data.length > 0 && initialSelectedIds.length > 0) {
      const matchedRows = data.filter((row) =>
        initialSelectedIds.includes(row.id)
      );
      setSelectedRows(matchedRows);
    }
  }, [data, initialSelectedIds, isInitialized]);

  //update selected rows when data changes
  const handleSelectionChange = (e: { value: RowData[] }) => {
    const newSelectedRows = e.value;
    setSelectedRows(newSelectedRows);

    // update localStorage
    const idsToStore = newSelectedRows.map((row) => row.id);
    localStorage.setItem(store, JSON.stringify(idsToStore));
  };

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
        setTotal(res);
      });
    };
    fetchTotalPages();
  }, []);

  const handlePageChange = (event: DataTableStateEvent) => {
    setFirst(event.first);
    setPage((event.page || 0) + 1);
  };

  return (
    <div className="p-6">
      <DataTable
        scrollable
        scrollHeight="70vh"
        value={data}
        paginator
        first={first}
        totalRecords={total}
        stripedRows
        rows={7}
        lazy
        selectionMode="checkbox"
        selection={selectedRows}
        onSelectionChange={handleSelectionChange}
        dataKey="id"
        tableStyle={{ minWidth: "50rem" }}
        onPage={handlePageChange}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="title" sortable header="Title" />
        <Column field="artist_display" header="Artist" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" sortable header="Year Start" />
        <Column field="date_end" header="Year End" />
      </DataTable>
    </div>
  );
};

export default Table;
