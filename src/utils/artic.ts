import axios from "axios";
import type { RowData } from "../types/TableData";

const fetchRows = async (page: number) => {
  try {
    const response = await axios.get(
      `https://api.artic.edu/api/v1/artworks?page=${page}&limit=7&fields=id,title,place_of_origin,artist_display,inscriptions,date_start,date_end`
    );

    const data = response.data.data.map((item: RowData) => ({
      id: item.id,
      title: item.title,
      place_of_origin: item.place_of_origin || "Unknown",
      artist_display: item.artist_display || "Unknown",
      inscriptions: item.inscriptions || "None",
      date_start: item.date_start || 0,
      date_end: item.date_end || 0,
    })) as RowData[];

    return data;
  } catch (error) {
    console.error("Error fetching rows:", error);
    return [];
  }
};

const totalPages = async () => {
  try {
    const response = await axios.get(
      "https://api.artic.edu/api/v1/artworks?fields=id&page=1&limit=1"
    );
    return response.data.pagination.total_pages;
  } catch (error) {
    console.error("Error fetching total pages:", error);
    return 0;
  }
};

export { fetchRows, totalPages };
