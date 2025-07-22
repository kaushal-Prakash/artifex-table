import React, { useEffect, useState, useRef } from "react";
import { DataTable, type DataTableStateEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import type { RowData } from "../types/TableData";
import { fetchRows, totalPages } from "../utils/artic";
import { ChevronDown } from "lucide-react";

const store = "selected-ids";

const Table: React.FC = () => {
  const [first, setFirst] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<RowData[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [rowsToSelect, setRowsToSelect] = useState("");
  const [isFetching, setisFetching] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const op = useRef<OverlayPanel>(null);

  useEffect(() => {
    const savedIds = localStorage.getItem(store);
    if (savedIds) {
      try {
        const idsArray = JSON.parse(savedIds);
        setSelectedRowIds(new Set(idsArray));
      } catch (e) {
        console.error("failed to get saved ids", e);
      }
    }
    setIsInitialized(true);
  }, []);

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
        console.error("error fetching data:", err);
      }
    };

    loadData();
  }, [page]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(store, JSON.stringify(Array.from(selectedRowIds)));
    }
  }, [selectedRowIds, isInitialized]);

  const selectNRows = async () => {
    op.current?.hide();

    const num = parseInt(rowsToSelect, 10);
    if (isNaN(num) || num <= 0) return;

    setisFetching(true);
    const newSelectedIds = new Set<string>();
    let currentPage = page; 
    let totalSelected = 0;
    let processedCurrentPage = false;

    try {
      const startIndex = page === 1 ? 0 : first % 7;
      const availableOnCurrentPage = data.length - startIndex;
      const toSelectOnCurrentPage = Math.min(num, availableOnCurrentPage);

      for (let i = startIndex; i < startIndex + toSelectOnCurrentPage; i++) {
        if (data[i]) {
          newSelectedIds.add(data[i].id);
        }
      }
      totalSelected += toSelectOnCurrentPage;
      processedCurrentPage = true;

      while (totalSelected < num && currentPage * 7 < total) {
        if (processedCurrentPage) {
          currentPage++;
        } else {
          processedCurrentPage = true;
        }

        const pageData = await fetchRows(currentPage);
        const remainingToSelect = num - totalSelected;
        const selectionSize = Math.min(remainingToSelect, pageData.length);

        for (let i = 0; i < selectionSize; i++) {
          newSelectedIds.add(pageData[i].id);
        }
        totalSelected += selectionSize;
      }

      setSelectedRowIds(newSelectedIds);
    } catch (error) {
      console.error("error during selection:", error);
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
    setRowsToSelect("");
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

  const customHeader = (
    <div className="flex align-items-center">
      <Button
        type="button"
        icon={<ChevronDown size={16} />}
        className="p-button-text p-button-plain"
        onClick={(e) => op.current?.toggle(e)}
      />
    </div>
  );

  return (
    <div className="p-6">
      <OverlayPanel ref={op} className="p-2">
        <div className="flex flex-column gap-2">
          <InputText
            value={rowsToSelect}
            onChange={(e) => setRowsToSelect(e.target.value)}
            placeholder="Select rows..."
            className="p-inputtext-sm"
            type="number"
          />
          <Button
            label="Submit"
            onClick={selectNRows}
            disabled={
              !rowsToSelect || parseInt(rowsToSelect) <= 0 || isFetching
            }
            className="p-button-sm"
          />
        </div>
      </OverlayPanel>

      <div className="flex align-items-center mb-4 gap-3">
        <Button
          label="Clear Selections"
          icon="pi pi-times"
          className="p-button-danger p-button-sm"
          onClick={clearSelections}
          disabled={selectedRowIds.size === 0}
        />
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
        <Column
          selectionMode="multiple"
          header={customHeader}
          headerStyle={{ width: "3rem" }}
        />
        <Column field="title" header="Title" />
        <Column field="artist_display" header="Artist" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Year Start" />
        <Column field="date_end" header="Year End" />
      </DataTable>
    </div>
  );
};

export default Table;
