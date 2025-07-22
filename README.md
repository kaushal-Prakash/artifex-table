# Advanced React DataTable with Persistent Selections

This project is a sophisticated React application demonstrating advanced features of the PrimeReact `DataTable` component. It showcases how to build a responsive, server-side paginated table with persistent row selection that works across multiple pages and browser sessions, all while fetching live data from the Art Institute of Chicago API.

## ✨ Features

  * **Server-Side Pagination**: Efficiently handles thousands of records by fetching data one page at a time. The paginator is fully controlled and state-driven.
  * **Persistent Row Selection**: User selections are saved to `localStorage` and restored automatically on page load. This allows selections to persist even after the browser tab is closed.
  * **Cross-Page Selection**: A robust system manages selections across all pages, not just the currently visible one. The total count of selected items is always displayed.
  * **"Select First N" Functionality**: A powerful feature allowing the user to programmatically select the first 'N' records from the entire dataset, fetching data from multiple pages if necessary.
  * **Custom Header UI**: The selection column header features a custom popup menu, built with `OverlayPanel`, for a clean and modern user experience.
  * **Dynamic Theming**: The project is set up with PrimeReact themes and icons for a polished look and feel out of the box.

-----

## 🛠️ Technologies Used

  * **Framework**: React
  * **Language**: TypeScript
  * **UI Library**: PrimeReact (`DataTable`, `Button`, `OverlayPanel`, etc.)
  * **Styling**: PrimeFlex, PrimeIcons, and a PrimeReact Theme (e.g., `lara-light-indigo`)
  * **Icons**: Lucide React
  * **API Client**: Axios
  * **Data Source**: [Art Institute of Chicago API](https://api.artic.edu/docs/)

-----

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have Node.js and npm (or yarn) installed on your machine.

### Installation

1.  **Clone the repo**
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
    The application will be running on `http://localhost:3000`.

-----

## 🧠 Core Logic Explained

The most complex feature is the persistent, cross-page selection. Here’s how it works:

1.  **Centralized ID Storage**: Instead of storing the full row objects, we only store the unique IDs of the selected rows. A JavaScript `Set` (`selectedRowIds`) is used for this, as it provides highly efficient `add`, `delete`, and `has` operations, preventing duplicate IDs.

2.  **Saving to `localStorage`**: A `useEffect` hook watches the `selectedRowIds` set. Whenever the set changes (a user selects or deselects a row), the hook converts the set to an array, serializes it to a JSON string, and saves it to `localStorage`.

3.  **Loading from `localStorage`**: On initial component mount, another `useEffect` hook reads the JSON string from `localStorage`, parses it, and populates the `selectedRowIds` set. This restores the user's previous session.

4.  **Syncing UI with State**: The `DataTable`'s `selection` prop cannot be bound directly to the `selectedRowIds` set, as it needs an array of *full row objects* for the *current page*.

      * A helper function, `getSelectedRowsForCurrentPage()`, filters the `data` of the current page against the master `selectedRowIds` set.
      * The result of this function is passed to the `selection` prop, ensuring only the checkboxes for visible, selected rows are ticked.

5.  **Handling Selection Changes**: The `onSelectionChange` handler is carefully crafted to update the master `selectedRowIds` set. It compares the new selection on the current page with the existing data to determine which IDs to add or remove from the master set, ensuring selections on other pages are not affected.
