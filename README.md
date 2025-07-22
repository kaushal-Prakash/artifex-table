# Advanced React DataTable: Server-Side Pagination & Persistent Selection

This project is a feature-rich React application built with TypeScript, demonstrating a highly advanced implementation of the PrimeReact `DataTable`. It serves as a powerful example of how to handle large datasets efficiently by integrating server-side pagination with persistent, cross-page row selection, all powered by live data from the Art Institute of Chicago API.

## ✨ Key Features

  * **Server-Side Pagination**: Handles massive datasets by fetching data one page at a time. The paginator is fully controlled by React state and updates data on demand.
  * **Persistent Cross-Page Selection**: User selections are saved to `localStorage` and restored automatically on page load. The application maintains a single source of truth for all selected items, regardless of the currently viewed page.
  * **"Select First N" Functionality**: A powerful utility that allows the user to programmatically select the first 'N' records starting from their current page view, fetching data from subsequent pages if necessary.
  * **Custom UI Components**: The "Select First N" feature is triggered by a clean, non-intrusive `OverlayPanel` popup, launched from a custom icon button in the table header.
  * **Robust State Management**: Uses a combination of `useState`, `useEffect`, and `useRef` to manage data, selection state, UI state, and asynchronous operations cleanly and efficiently.
  * **Modern Tech Stack**: Built with React, TypeScript, and the latest PrimeReact components for a polished and professional result.

## 🛠️ Technologies Used

  * **Framework**: React
  * **Language**: TypeScript
  * **UI Library**: PrimeReact (`DataTable`, `Column`, `Button`, `OverlayPanel`, `InputText`)
  * **Styling**: PrimeFlex, PrimeIcons, and a PrimeReact Theme (e.g., `lara-light-indigo`)
  * **Icons**: Lucide React
  * **API Client**: Axios (used within the API utility)
  * **Data Source**: [Art Institute of Chicago API](https://api.artic.edu/docs/)

-----

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You must have Node.js (version 16 or later) and npm (or yarn) installed on your machine.

### Installation

1.  **Clone the repository**
    ```sh
    git clone https://github.com/your-username/your-repository-name.git
    ```
2.  **Navigate to the project directory**
    ```sh
    cd your-repository-name
    ```
3.  **Install NPM packages**
    ```sh
    npm install
    ```
4.  **Start the development server**
    ```sh
    npm start
    ```
    The application will open in your browser at `[http://localhost:5173/](http://localhost:5173/)`.

-----

## 🧠 Core Logic Explained

The power of this application lies in how it manages the selection state across different pages and sessions.

### The "Single Source of Truth" Model for Selection

Instead of tracking an array of selected row *objects*, which would only work for the current page, we use a single `Set` to store the unique **IDs** of every selected item across the entire dataset.

  * `selectedRowIds: Set<string>`: This state variable is the master list and our "single source of truth". Using a `Set` provides highly efficient O(1) time complexity for adding, deleting, and checking for the existence of an ID.

The selection lifecycle works in three stages:

1.  **Loading**: On initial component mount, a `useEffect` hook reads a JSON array of IDs from `localStorage` and hydrates the `selectedRowIds` set. This restores the user's previous session.
2.  **Displaying**: The `DataTable`'s `selection` prop cannot use the master set of IDs directly; it needs an array of full row objects that are currently visible. A helper function, `getSelectedRowsForCurrentPage()`, creates this array on every render by filtering the current page's `data` against the `selectedRowIds` set.
3.  **Updating**: When a user checks or unchecks a box, the `handleSelectionChange` function is triggered. It intelligently merges the selection changes from the current page into the master `selectedRowIds` set without affecting selections on other pages. A separate `useEffect` hook then watches for changes to this master set and automatically saves the updated IDs back to `localStorage`.

### Asynchronous "Select First N" Logic

The `selectNRows` function is an `async` function that demonstrates how to handle complex user actions:

  * It first calculates how many items can be selected from the currently loaded page data.
  * If the user requests more items than are available on the current page, it enters a `while` loop.
  * Inside the loop, it sequentially fetches the next pages of data until the desired number of selections has been met or it runs out of pages.
  * A `isFetching` state variable is used to disable the UI during this potentially long-running operation, providing clear feedback to the user.
