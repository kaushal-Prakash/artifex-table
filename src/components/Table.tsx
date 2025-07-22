import React, { useEffect, useState } from "react";
import { DataTable, type DataTableStateEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import type { RowData } from "../types/TableData";
import { fetchRows, totalPages } from "../utils/artic";

const store = "selected-ids";

const Table: React.FC = () => {
  const [first, setFirst] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<RowData[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [rowsToSelect, setRowsToSelect] = useState<number>(0);
  const [isFetching, setisFetching] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  //get stored ids
  useEffect(() => {
    const savedIds = localStorage.getItem(store);
    if (savedIds) {
      try {
        const idsArray = JSON.parse(savedIds);
        setSelectedRowIds(new Set(idsArray));
      } catch (e) {
        console.error("Failed to parse saved IDs", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // fetching data when page changes
  useEffect(() => {
    const loadData = async () => {
      try {
        const [rowsData, totalPagesData] = await Promise.all([
          fetchRows(page),
          totalPages(),
        ]);
        setData(rowsData);
        setTotal(totalPagesData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    loadData();
  }, [page]);

  // update stored ids in local storage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(store, JSON.stringify(Array.from(selectedRowIds)));
    }
  }, [selectedRowIds, isInitialized]);

  // select first n rowa
  const selectNRows = async () => {
    if (rowsToSelect <= 0) return;

    setisFetching(true);
    const newSelectedIds = new Set<string>();
    let currentPage = 1;
    let totalSelected = 0;

    try {
      // Start with current page if it's page 1
      if (page === 1) {
        const selectionSize = Math.min(rowsToSelect, data.length);
        for (let i = 0; i < selectionSize; i++) {
          newSelectedIds.add(data[i].id);
        }
        totalSelected = selectionSize;
      }

      // Fetch additional pages if needed
      while (totalSelected < rowsToSelect && currentPage * 7 < total) {
        const pageData = await fetchRows(currentPage);
        const remainingToSelect = rowsToSelect - totalSelected;
        const selectionSize = Math.min(remainingToSelect, pageData.length);

        for (let i = 0; i < selectionSize; i++) {
          newSelectedIds.add(pageData[i].id);
        }
        totalSelected += selectionSize;
        currentPage++;
      }

      setSelectedRowIds(newSelectedIds);
    } catch (error) {
      console.error("Error during selection:", error);
    } finally {
      setisFetching(false);
    }
  };

  const handlePageChange = (event: DataTableStateEvent) => {
    setFirst(event.first);
    setPage((event.page || 0) + 1);
  };

  const clearSelections = () => {
    setSelectedRowIds(new Set());
    setRowsToSelect(0);
  };

  const getSelectedRowsForCurrentPage = () => {
    return data.filter((row) => selectedRowIds.has(row.id));
  };

  const handleSelectionChange = (e: { value: RowData[] }) => {
    const newSelectedIds = new Set(selectedRowIds);
    const currentPageSelectedIds = new Set(e.value.map((row) => row.id));

    data.forEach((row) => {
      if (currentPageSelectedIds.has(row.id)) {
        newSelectedIds.add(row.id);
      } else {
        newSelectedIds.delete(row.id);
      }
    });

    setSelectedRowIds(newSelectedIds);
  };

  return (
    <div className="p-6">
      <div className="flex align-items-center mb-4 gap-3">
        <div className="flex align-items-center gap-2">
          <InputNumber
            value={rowsToSelect}
            onValueChange={(e) => setRowsToSelect(e.value || 0)}
            min={0}
            max={total * 7}
            showButtons
            buttonLayout="horizontal"
            mode="decimal"
          />
          <Button
            label="Select First N Rows"
            icon="pi pi-check"
            onClick={selectNRows}
            disabled={rowsToSelect <= 0 || isFetching}
          />
        </div>
        <Button
          label="Clear Selections"
          icon="pi pi-times"
          className="p-button-danger"
          onClick={clearSelections}
          disabled={selectedRowIds.size === 0}
        />
        <div className="mt-2">
          <small>
            {selectedRowIds.size} {selectedRowIds.size === 1 ? "row" : "rows"}{" "}
            selected across all pages
          </small>
        </div>
      </div>

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
        selection={getSelectedRowsForCurrentPage()}
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
