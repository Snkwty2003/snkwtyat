// Table management and filtering functionality

// Sort table by column
function sortTable(tableId, columnIndex, direction = 'asc') {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent.trim();
        const bValue = b.cells[columnIndex].textContent.trim();

        let comparison = 0;
        if (aValue > bValue) {
            comparison = 1;
        } else if (aValue < bValue) {
            comparison = -1;
        }

        return direction === 'desc' ? comparison * -1 : comparison;
    });

    rows.forEach(row => tbody.appendChild(row));

    // Update sort icons
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        header.classList.remove('sort-asc', 'sort-desc');
        if (index === columnIndex) {
            header.classList.add(direction === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    });
}

// Filter table rows
function filterTable(tableId, filterFunction) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.forEach(row => {
        if (filterFunction(row)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Search table
function searchTable(tableId, searchTerm) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const search = searchTerm.toLowerCase();

        if (text.includes(search)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Export table to CSV
function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tr'));

    const csv = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map(cell => {
            // Escape quotes and wrap in quotes if contains comma
            const text = cell.textContent.trim();
            if (text.includes(',') || text.includes('"') || text.includes('\n')) {
                return `"${text.replace(/"/g, '""')}"`;
            }
            return text;
        }).join(',');
    }).join('\n');

    // Create download link
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename || 'export.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Export table to Excel
function exportTableToExcel(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const html = table.outerHTML;
    const url = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'export.xls';
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Print table
function printTable(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>طباعة التقرير</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    direction: rtl;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: right;
                }
                th {
                    background-color: #f5f5f5;
                }
            </style>
        </head>
        <body>
            ${table.outerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Initialize table functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup sort functionality for all tables with sortable headers
    const tables = document.querySelectorAll('table[data-sortable="true"]');
    tables.forEach(table => {
        const headers = table.querySelectorAll('th[data-sortable="true"]');
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', function() {
                const currentSort = this.classList.contains('sort-asc') ? 'asc' : 
                                  this.classList.contains('sort-desc') ? 'desc' : null;
                const newDirection = currentSort === 'asc' ? 'desc' : 'asc';
                sortTable(table.id, index, newDirection);
            });
        });
    });
});

// Export functions for use in other files
window.adminTables = {
    sortTable,
    filterTable,
    searchTable,
    exportTableToCSV,
    exportTableToExcel,
    printTable
};
